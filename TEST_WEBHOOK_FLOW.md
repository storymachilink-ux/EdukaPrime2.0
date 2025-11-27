# 🧪 Script de Teste: Webhook Flow Completo

## Pré-requisitos:
- ✅ SQL migration executada (plans_v2 tem 3 campos de IDs)
- ✅ webhook-unificada deployed em Supabase
- ✅ Pelo menos 1 plano configurado com um ID

---

## 📋 PASSO 1: Criar Plano de Teste

1. Abra: **Dashboard Admin → Gerenciar Planos**
2. Clique em "Criar Novo Plano"
3. Preencha:
   ```
   Nome Interno: TESTE_WEBHOOK
   Nome para Exibição: Plano de Teste
   Preço: 29.99
   Tipo: Pagamento Único (ou Mensal)
   Duração: 30 dias (se mensal)

   ID Vega: [use um código real do seu Vega, ex: 3MGN9O]
   ID GGCheckout: [use um ID real, ex: WpjID8aV49ShaQ07ABzP]
   ID AmploPay: [use um ID real, ex: prod_test_123]
   ```
4. Salve

---

## 📋 PASSO 2: Criar Usuário de Teste

1. Abra terminal ou faça login com uma conta de teste
2. Email: **teste@webhook.test** (não precisa ser real, apenas para teste)
3. Crie uma conta com esse email

---

## 📋 PASSO 3: Simular Webhook (Via cURL ou Postman)

Escolha UMA das plataformas para testar:

### **Opção A: Vega Webhook**

```bash
curl -X POST https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "teste@webhook.test",
      "name": "Testador"
    },
    "items": [
      {
        "code": "3MGN9O",
        "title": "EdukaPapers - Teste",
        "amount": 2999
      }
    ],
    "total_price": 2999,
    "status": "approved",
    "transaction_token": "tx_test_vega_001",
    "method": "pix"
  }'
```

### **Opção B: GGCheckout Webhook**

```bash
curl -X POST https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "teste@webhook.test",
      "name": "Testador"
    },
    "products": [
      {
        "id": "WpjID8aV49ShaQ07ABzP",
        "name": "Plano de Teste",
        "price": 2999
      }
    ],
    "payment": {
      "method": "credit_card",
      "amount": 2999
    },
    "event": "card.paid",
    "status": "paid",
    "id": "tx_test_gg_001"
  }'
```

### **Opção C: AmploPay Webhook**

```bash
curl -X POST https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "teste@webhook.test",
      "name": "Testador"
    },
    "product_id": "prod_test_123",
    "product_name": "Plano de Teste",
    "amount": 2999,
    "status": "approved",
    "id": "tx_test_amplo_001",
    "payment_method": "bank_transfer"
  }'
```

**Copie um desses e execute no seu terminal.**

---

## 🔍 PASSO 4: Verificar Resultado

Após executar o webhook de teste:

### **4.1. Verificar webhook_logs**

```sql
SELECT id, platform, event_type, customer_email, status, processed_at, created_at
FROM webhook_logs
WHERE customer_email = 'teste@webhook.test'
ORDER BY created_at DESC
LIMIT 5;
```

**Esperado:**
- `status` = `success` (não `failed`)
- `processed_at` preenchido
- Platform correta (vega, ggcheckout, ou amplopay)

### **4.2. Verificar user_subscriptions**

```sql
SELECT id, user_id, plan_id, status, start_date, end_date
FROM user_subscriptions
WHERE user_id = (SELECT id FROM users WHERE email = 'teste@webhook.test')
ORDER BY created_at DESC
LIMIT 5;
```

**Esperado:**
- Subscription criada com `status = 'active'`
- `start_date` = data/hora atual
- `end_date` = data de expiração (se mensal)

### **4.3. Verificar users**

```sql
SELECT id, email, plano_ativo, data_expiracao_plano
FROM users
WHERE email = 'teste@webhook.test';
```

**Esperado:**
- `plano_ativo` = ID do plano de teste
- `data_expiracao_plano` preenchido

### **4.4. Verificar Dashboard Admin**

1. Abra: **Dashboard Admin → Webhooks Recebidos**
2. Procure por webhook com `customer_email = teste@webhook.test`
3. Status deve ser **verde** (success)
4. Clique para ver raw payload

---

## ❌ Se der erro...

### **Status = failed em webhook_logs**

1. Verifique a coluna `meta` em webhook_logs:
   ```sql
   SELECT meta FROM webhook_logs
   WHERE customer_email = 'teste@webhook.test'
   AND status = 'failed'
   LIMIT 1;
   ```

2. Os possíveis erros são:
   - `plan_not_found` → ID do produto não corresponde a nenhum plano
   - `user_not_found` → Email não existe em `users`
   - `subscription_insert_error` → Erro ao inserir em `user_subscriptions`
   - `user_update_error` → Erro ao atualizar `users`

### **Verificar Logs do Edge Function**

1. Supabase → Functions → webhook-unificada → Logs
2. Procure por erros (linhas em vermelho)
3. Copie a mensagem de erro

---

## ✅ Checklist de Teste

- [ ] Plano criado com 1 ID configurado (use o da plataforma que vai testar)
- [ ] Usuário de teste criado com email `teste@webhook.test`
- [ ] Webhook simulado (execute o cURL ou Postman)
- [ ] webhook_logs tem registro com status `success`
- [ ] user_subscriptions tem subscription ativa
- [ ] users.plano_ativo atualizado
- [ ] users.data_expiracao_plano preenchido
- [ ] Dashboard Admin mostra webhook com status verde

---

## 📊 Fluxo Real Esperado

Quando um cliente **realmente comprar**:

1. Cliente compra em Vega/GGCheckout/AmploPay
2. Gateway envia webhook para: `https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada`
3. Function webhook-unificada:
   - ✅ Detecta plataforma
   - ✅ Extrai product_id
   - ✅ Busca plano em plans_v2
   - ✅ Busca usuário por email
   - ✅ Cria subscription
   - ✅ Atualiza users.plano_ativo
4. Cliente tem acesso **imediatamente**

---

## 🎯 Próximos Passos

Depois que o teste passar:

1. ✅ Ir para cada plataforma de pagamento
2. ✅ Atualizar URL do webhook para: `https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada`
3. ✅ Configurar TODOS os planos com os IDs corretos
4. ✅ Fazer teste real com compra (sem pagar se houver dados de teste)

---

**Teste primeiro, depois deployment em produção!**
