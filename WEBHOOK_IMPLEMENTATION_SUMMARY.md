# 🎯 RESUMO DE IMPLEMENTAÇÃO - WEBHOOK UNIFICADA

## ✅ ARQUIVOS CRIADOS

### 📁 **EDGE FUNCTION**
- **Arquivo:** `supabase/functions/webhook-unificada/index.ts`
- **Status:** ✅ ATUALIZADO E PRONTO
- **Descrição:** Função completa que recebe webhooks de Vega, GGCheckout e Amplopay

### 📁 **ARQUIVOS SQL** (Executar em ORDEM)

1. **`sql/001_ajustar_plans_v2_ids_gateway.sql`**
   - ✅ Adiciona colunas `vega_product_id`, `ggcheckout_product_id`, `amplopay_product_id`
   - ✅ Cria índices para busca rápida

2. **`sql/002_add_constraints_idempotencia_subscriptions.sql`**
   - ✅ Adiciona UNIQUE constraint para evitar duplicatas
   - ✅ Impede que webhooks repetidos criem múltiplas subscriptions

3. **`sql/003_criar_ou_ajustar_pending_plans.sql`**
   - ✅ Cria tabela `pending_plans` para usuários não registrados
   - ✅ Cria função `activate_pending_plans()` para ativar planos após signup

4. **`sql/004_ajustar_webhook_logs.sql`**
   - ✅ Adiciona colunas `processed_at` e `notes`
   - ✅ Cria índices para queries eficientes

### 📁 **DOCUMENTAÇÃO**
- **`sql/GUIA_IMPLEMENTACAO_WEBHOOKS.md`** - Guia passo a passo completo

---

## 🎯 O QUE A WEBHOOK-UNIFICADA FAZ

### **DETECÇÃO AUTOMÁTICA DE PLATAFORMA**
```
Se tem "plans" + "products" + "transaction_token" + "business_name" → VEGA ✅
Se tem "event" + "products" + "payment" → GGCHECKOUT ✅
Se tem "product_id" + "amount" + "status" → AMPLOPAY ✅
Senão → ERRO ❌
```

### **EXTRAÇÃO CORRETA DE DADOS**
- **Vega:** Usa `products[0].code` para product ID (ex: "3MGN9O")
- **GGCheckout:** Usa `products[0].id` para product ID
- **Amplopay:** Usa `product_id` direto

### **FLUXO DE PROCESSAMENTO**

```
1️⃣ RECEBER WEBHOOK
        ↓
2️⃣ DETECTAR PLATAFORMA (Vega/GGCheckout/Amplopay)
        ↓
3️⃣ EXTRAIR PRODUCT_ID E DADOS NORMALIZADOS
        ↓
4️⃣ REGISTRAR EM webhook_logs (status: "received")
        ↓
5️⃣ SE PAGAMENTO APROVADO:
    5.1️⃣ BUSCAR PLANO em plans_v2
    5.2️⃣ SE USUÁRIO EXISTE → CRIAR subscription
    5.3️⃣ SE USUÁRIO NÃO EXISTE → CRIAR pending_plan
    5.4️⃣ ATUALIZAR webhook_logs (status: "success")
        ↓
6️⃣ SE PAGAMENTO PENDENTE:
    6.1️⃣ APENAS REGISTRAR em webhook_logs (status: "pending")
```

---

## 🔐 SEGURANÇA & IDEMPOTÊNCIA

### **PROTEÇÃO CONTRA WEBHOOKS DUPLICADOS**
- Cada `(user_id, plan_id, payment_id)` é ÚNICO
- Se webhook for reenviado → ignora silenciosamente
- Retorna `status: 'success'` + `notes: 'Subscription duplicada ignorada (idempotência)'`

### **PROTEÇÃO CONTRA PENDING_PLANS DUPLICADOS**
- Cada `(payment_id, plan_id, email)` é ÚNICO
- Evita criar múltiplos pending_plans do mesmo pagamento

---

## 📊 MAPEAMENTO DE PRODUCT IDs

Você precisa popular essas colunas em `plans_v2`:

```sql
UPDATE plans_v2 SET vega_product_id = '3MGN9O' WHERE id = 1;
UPDATE plans_v2 SET ggcheckout_product_id = 'gg-prod-123' WHERE id = 2;
UPDATE plans_v2 SET amplopay_product_id = 'amp-prod-456' WHERE id = 3;
```

---

## 🚀 COMO COMEÇAR

### **1. Executar SQL no Supabase**
```
1. Abra: https://supabase.com/dashboard → SQL Editor
2. Execute arquivo: 001_ajustar_plans_v2_ids_gateway.sql
3. Execute arquivo: 002_add_constraints_idempotencia_subscriptions.sql
4. Execute arquivo: 003_criar_ou_ajustar_pending_plans.sql
5. Execute arquivo: 004_ajustar_webhook_logs.sql
```

### **2. Mapear Product IDs**
```sql
-- Execute os updates com seus IDs reais:
UPDATE plans_v2 SET vega_product_id = '3MGN9O' WHERE id = 1;
-- etc...
```

### **3. Testar Webhook**
```
Enviar POST para:
https://your-supabase-url/functions/v1/webhook-unificada

Com payload de teste (veja GUIA_IMPLEMENTACAO_WEBHOOKS.md)
```

### **4. Chamar activate_pending_plans() no Signup**
```sql
-- Quando usuário se registra:
SELECT activate_pending_plans('user-id', 'user-email@example.com');
```

---

## 🧪 TESTES RECOMENDADOS

### **Teste 1: Webhook de Vega (usuário existe)**
```json
{
  "plans": [{"id": "3MGN9O", "products": [...]}],
  "products": [{"code": "3MGN9O", "title": "...", "amount": 2999}],
  "status": "approved",
  "customer": {"name": "João", "email": "joao@example.com"},
  "total_price": 2999,
  "transaction_token": "VCP1O8VEI5G",
  "business_name": "Eduka Prime"
}
```
**Esperado:** Subscription criada, usuário atualizado ✅

### **Teste 2: Webhook de Vega (usuário não existe)**
```json
{
  "customer": {"email": "novo@example.com", ...},
  ...
}
```
**Esperado:** pending_plan criado ✅

### **Teste 3: Mesmo webhook enviado 2x**
```
1ª vez: Subscription criada ✅
2ª vez: Ignored (idempotência) ✅
```

### **Teste 4: Product ID não mapeado**
```json
{
  "products": [{"code": "UNKNOWN_ID"}],
  ...
}
```
**Esperado:** webhook_logs com `status: 'failed'` e `notes: 'PLANO_NAO_MAPEADO'` ✅

---

## 📋 CHECKLIST FINAL

- [ ] Executar 001_ajustar_plans_v2_ids_gateway.sql
- [ ] Executar 002_add_constraints_idempotencia_subscriptions.sql
- [ ] Executar 003_criar_ou_ajustar_pending_plans.sql
- [ ] Executar 004_ajustar_webhook_logs.sql
- [ ] Mapear product IDs em plans_v2
- [ ] Testar webhook com payload de exemplo
- [ ] Verificar webhook_logs para erros
- [ ] Testar idempotência (enviar mesmo webhook 2x)
- [ ] Integrar activate_pending_plans() no signup
- [ ] Configurar URLs de webhook em Vega, GGCheckout, Amplopay

---

## 🎓 ESTRUTURA DO CÓDIGO

### **Funções da Webhook-Unificada:**
- `detectPlatform()` - Identifica qual gateway enviou o webhook
- `extractProductId()` - Extrai o product ID corretamente por plataforma
- `extractWebhookData()` - Normaliza dados para padrão comum
- `findPlanByProductId()` - Busca plano em plans_v2
- `checkDuplicateSubscription()` - Verifica idempotência
- `checkDuplicatePendingPlan()` - Verifica pending_plan duplicado
- `calculateEndDate()` - Calcula data de expiração do plano
- `processApprovedPayment()` - Processa pagamentos aprovados

---

## 🔗 CONFIGURAÇÃO EM CADA GATEWAY

### **Vega**
```
Webhook URL: https://seu-supabase-url/functions/v1/webhook-unificada
Eventos: Pagamento Aprovado (PIX, Cartão, etc)
```

### **GGCheckout**
```
Webhook URL: https://seu-supabase-url/functions/v1/webhook-unificada
Eventos: payment.approved, payment.pending
```

### **Amplopay**
```
Webhook URL: https://seu-supabase-url/functions/v1/webhook-unificada
Eventos: status = 'approved'
```

---

## 🆘 TROUBLESHOOTING

### **Problema: "Plano não encontrado"**
**Solução:** Verifique se `vega_product_id` / `ggcheckout_product_id` / `amplopay_product_id` foi preenchido em plans_v2

### **Problema: Webhook recebido mas não ativa plano**
**Solução:** Verifique se a coluna `status` em webhook_logs é "success". Veja a coluna `notes` para detalhes do erro.

### **Problema: Subscription duplicada criada**
**Solução:** Você esqueceu de executar o arquivo SQL 002. Sem a UNIQUE constraint, webhooks duplicados criam múltiplas subscriptions.

### **Problema: pending_plans não ativa no signup**
**Solução:** Você precisa chamar `activate_pending_plans()` na sua função de signup.

---

**Tudo configurado! Agora é só executar os arquivos SQL e testar! 🚀**
