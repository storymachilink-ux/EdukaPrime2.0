# 🧪 TESTES DA WEBHOOK UNIFICADA

Depois de executar os 4 arquivos SQL, use esses testes para validar a implementação.

---

## 📝 TESTE 1: Webhook Vega (Usuário Existente)

### Setup
```sql
-- Verifique que este plano existe em plans_v2
SELECT id, name, vega_product_id FROM plans_v2 WHERE vega_product_id = '3MGN9O';

-- Verifique que este usuário existe
SELECT id FROM users WHERE email = 'joao@example.com';
```

### Envie este POST
```bash
curl -X POST \
  https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "plans": [
      {
        "id": "3MGN9O",
        "products": [
          {
            "id": "3MGN9O",
            "code": "3MGN9O",
            "title": "EdukaPapers – Kit Completo de Papercrafts Natalinos",
            "amount": 2999,
            "quantity": 1
          }
        ]
      }
    ],
    "products": [
      {
        "code": "3MGN9O",
        "title": "EdukaPapers – Kit Completo de Papercrafts Natalinos",
        "amount": 2999,
        "quantity": 1
      }
    ],
    "method": "pix",
    "status": "approved",
    "customer": {
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "11999999999",
      "document": "12345678900"
    },
    "total_price": 2999,
    "transaction_token": "VCP1O8VEI5G_TEST_01",
    "sale_code": "VCS1O8VBHJ4",
    "order_url": "https://checkout.edukaprime.com.br/order/VCP1O8VEI5G",
    "business_name": "Eduka Prime"
  }'
```

### Validar Resultado
```sql
-- Deve ter webhook_logs com status = 'success'
SELECT id, status, customer_email, amount, notes
FROM webhook_logs
WHERE transaction_id = 'VCP1O8VEI5G_TEST_01'
ORDER BY created_at DESC
LIMIT 1;

-- Deve ter user_subscriptions criada
SELECT id, user_id, plan_id, status, payment_id
FROM user_subscriptions
WHERE payment_id = 'VCP1O8VEI5G_TEST_01';

-- Usuário deve estar atualizado com o plano ativo
SELECT id, plano_ativo, active_plan_id
FROM users
WHERE email = 'joao@example.com';
```

### Esperado
- ✅ webhook_logs: `status = 'success'`
- ✅ user_subscriptions: 1 registro criado
- ✅ users: `plano_ativo` e `active_plan_id` atualizados

---

## 📝 TESTE 2: Webhook Vega (Usuário NÃO Existente)

### Envie este POST
```bash
curl -X POST \
  https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "plans": [{"id": "3MGN9O", "products": [...]}],
    "products": [{"code": "3MGN9O", "title": "...", "amount": 2999, "quantity": 1}],
    "method": "pix",
    "status": "approved",
    "customer": {
      "name": "Maria Silva",
      "email": "maria.nova@example.com",
      "phone": "11999999999",
      "document": "98765432100"
    },
    "total_price": 2999,
    "transaction_token": "VCP1O8VEI5G_TEST_02",
    "sale_code": "VCS1O8VBHJ4",
    "order_url": "https://checkout.edukaprime.com.br/order/VCP1O8VEI5G",
    "business_name": "Eduka Prime"
  }'
```

### Validar Resultado
```sql
-- Deve ter webhook_logs com status = 'success'
SELECT id, status, customer_email, notes
FROM webhook_logs
WHERE transaction_id = 'VCP1O8VEI5G_TEST_02'
ORDER BY created_at DESC
LIMIT 1;

-- Deve ter pending_plans criado
SELECT id, email, plan_id, status, payment_id
FROM pending_plans
WHERE payment_id = 'VCP1O8VEI5G_TEST_02';

-- NÃO deve ter user_subscriptions (ainda)
SELECT COUNT(*) as count
FROM user_subscriptions
WHERE payment_id = 'VCP1O8VEI5G_TEST_02';
```

### Esperado
- ✅ webhook_logs: `status = 'success'`
- ✅ pending_plans: 1 registro com `status = 'pending'`
- ✅ user_subscriptions: 0 registros (será criada após signup)

---

## 📝 TESTE 3: Idempotência (Webhook Duplicado)

### Envie o MESMO POST duas vezes
```bash
# Primeira vez:
curl -X POST https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{"code": "3MGN9O", ...}],
    "status": "approved",
    "customer": {"email": "teste.idem@example.com", ...},
    "total_price": 2999,
    "transaction_token": "VCP_IDEM_UNIQUE_01",
    "business_name": "Eduka Prime",
    ...
  }'

# Segunda vez (MESMO transaction_token):
curl -X POST https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{"code": "3MGN9O", ...}],
    "status": "approved",
    "customer": {"email": "teste.idem@example.com", ...},
    "total_price": 2999,
    "transaction_token": "VCP_IDEM_UNIQUE_01",
    "business_name": "Eduka Prime",
    ...
  }'
```

### Validar Resultado
```sql
-- Deve ter 2 webhook_logs (ambas received+processed)
SELECT COUNT(*) as count, status
FROM webhook_logs
WHERE transaction_id = 'VCP_IDEM_UNIQUE_01'
GROUP BY status;

-- Deve ter apenas 1 user_subscriptions (ou 1 pending_plan)
SELECT COUNT(*) as count
FROM user_subscriptions
WHERE payment_id = 'VCP_IDEM_UNIQUE_01';

-- A segunda deve ter notes = 'Subscription duplicada ignorada (idempotência)'
SELECT notes
FROM webhook_logs
WHERE transaction_id = 'VCP_IDEM_UNIQUE_01'
ORDER BY created_at DESC
LIMIT 1;
```

### Esperado
- ✅ 2 webhook_logs registrados
- ✅ Apenas 1 subscription criada (não duplicada)
- ✅ Segunda chamada ignora silenciosamente
- ✅ Ambas retornam `success`

---

## 📝 TESTE 4: Plano Não Mapeado

### Envie webhook com product_id desconhecido
```bash
curl -X POST \
  https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "plans": [{"id": "UNKNOWN_PRODUCT", "products": [...]}],
    "products": [{"code": "UNKNOWN_PRODUCT", "title": "...", "amount": 2999}],
    "status": "approved",
    "customer": {"email": "teste@example.com", ...},
    "total_price": 2999,
    "transaction_token": "VCP_UNKNOWN_01",
    "business_name": "Eduka Prime",
    ...
  }'
```

### Validar Resultado
```sql
-- Deve ter webhook_logs com status = 'failed'
SELECT id, status, notes, transaction_id
FROM webhook_logs
WHERE transaction_id = 'VCP_UNKNOWN_01';

-- Notes deve conter "PLANO_NAO_MAPEADO"
SELECT notes
FROM webhook_logs
WHERE transaction_id = 'VCP_UNKNOWN_01';

-- NÃO deve ter criado subscription ou pending_plan
SELECT COUNT(*) as subscriptions
FROM user_subscriptions
WHERE payment_id = 'VCP_UNKNOWN_01';

SELECT COUNT(*) as pending
FROM pending_plans
WHERE payment_id = 'VCP_UNKNOWN_01';
```

### Esperado
- ✅ webhook_logs: `status = 'failed'`
- ✅ notes contém: `PLANO_NAO_MAPEADO`
- ✅ Nenhuma subscription criada
- ✅ Nenhum pending_plan criado

---

## 📝 TESTE 5: GGCheckout (Compatibilidade)

### Envie webhook de GGCheckout
```bash
curl -X POST \
  https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.approved",
    "products": [
      {
        "id": "gg-prod-123",
        "name": "Plano Pro",
        "price": 9999
      }
    ],
    "payment": {
      "amount": 9999,
      "method": "credit_card"
    },
    "status": "paid",
    "customer": {
      "email": "ggtest@example.com",
      "name": "GG Teste"
    },
    "id": "GG_TXN_12345",
    "transaction_id": "GG_TXN_12345"
  }'
```

### Validar Resultado
```sql
-- Deve detectar como "ggcheckout"
SELECT platform, status, customer_email
FROM webhook_logs
WHERE transaction_id = 'GG_TXN_12345';
```

### Esperado
- ✅ webhook_logs: `platform = 'ggcheckout'`
- ✅ Processa corretamente mesmo com estrutura diferente

---

## 📝 TESTE 6: Amplopay (Compatibilidade)

### Envie webhook de Amplopay
```bash
curl -X POST \
  https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "amp-prod-456",
    "amount": 4999,
    "status": "approved",
    "customer": {
      "email": "amptest@example.com",
      "name": "Amplopay Teste"
    },
    "id": "AMP_TXN_67890",
    "transaction_id": "AMP_TXN_67890",
    "payment_method": "pix"
  }'
```

### Validar Resultado
```sql
-- Deve detectar como "amplopay"
SELECT platform, status, customer_email, amount
FROM webhook_logs
WHERE transaction_id = 'AMP_TXN_67890';
```

### Esperado
- ✅ webhook_logs: `platform = 'amplopay'`
- ✅ amount normalizado para reais (4999 → 49.99 ou mantém 4999 conforme seu formato)

---

## 🔍 QUERIES ÚTEIS PARA MONITORAMENTO

### Ver todos os webhooks de hoje
```sql
SELECT created_at, platform, status, customer_email, amount, transaction_id
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Ver webhooks com erro
```sql
SELECT id, created_at, platform, status, notes, transaction_id
FROM webhook_logs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

### Ver pending_plans ainda não ativados
```sql
SELECT id, email, plan_id, created_at, status
FROM pending_plans
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Ver subscriptions criadas por webhook
```sql
SELECT us.id, us.user_id, us.plan_id, us.status, us.payment_id,
       wl.platform, wl.created_at
FROM user_subscriptions us
JOIN webhook_logs wl ON us.webhook_id = wl.id
ORDER BY us.created_at DESC
LIMIT 20;
```

### Ver estatísticas de webhooks
```sql
SELECT
  platform,
  status,
  COUNT(*) as total,
  ROUND(AVG(amount), 2) as avg_amount
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY platform, status
ORDER BY platform, status;
```

---

## 🚨 POSSÍVEIS ERROS E SOLUÇÕES

### ❌ Erro: "Method not allowed"
- Verifique se está usando `POST` (não GET, PUT, DELETE)
- Verifique se o JSON é válido

### ❌ Erro: "Invalid JSON payload"
- Cole o JSON em um validador: https://jsonlint.com
- Procure aspas faltantes ou estrutura incorreta

### ❌ Erro: "Unknown platform"
- Webhook não contém os campos esperados
- Verifique a estrutura do payload (plans, products, transaction_token, etc)

### ❌ "Plan not found"
- `vega_product_id` não foi preenchido em `plans_v2`
- Produto do gateway não está mapeado a nenhum plano

### ❌ Subscription não criada mas webhook diz "success"
- Usuário não existe
- Verifique `pending_plans` (plano foi criado lá em vez de em `user_subscriptions`)

### ❌ Webhook_logs nunca atualiza para "success"
- Erro de permissão RLS
- Execute: `GRANT ALL ON webhook_logs TO service_role;`

---

## ✅ CHECKLIST PÓS-TESTES

- [ ] Teste 1 (usuário existe) passou
- [ ] Teste 2 (usuário não existe) passou
- [ ] Teste 3 (idempotência) passou
- [ ] Teste 4 (plano não mapeado) passou
- [ ] Teste 5 (GGCheckout) passou
- [ ] Teste 6 (Amplopay) passou
- [ ] Monitoramento está funcionando
- [ ] Nenhum erro crítico em webhook_logs

---

**Todos os testes passaram? Parabéns! 🎉 Webhook unificada está pronta para produção!**
