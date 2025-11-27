# 🚀 GUIA DE IMPLEMENTAÇÃO - WEBHOOK UNIFICADA

## 📋 O QUE FOI CRIADO

Você tem agora **5 arquivos prontos**:

### 1️⃣ **Edge Function** (TypeScript/Deno)
📁 `supabase/functions/webhook-unificada/index.ts` - **Já foi atualizada!**

### 2️⃣ **Arquivos SQL** (4 arquivos em sequência)
- 📁 `sql/001_ajustar_plans_v2_ids_gateway.sql`
- 📁 `sql/002_add_constraints_idempotencia_subscriptions.sql`
- 📁 `sql/003_criar_ou_ajustar_pending_plans.sql`
- 📁 `sql/004_ajustar_webhook_logs.sql`

---

## 🔧 PASSO A PASSO DE IMPLEMENTAÇÃO

### **PASSO 1: Executar SQL no Supabase**

Abra o Supabase SQL Editor (https://supabase.com/dashboard) e execute os arquivos SQL na ordem:

#### **[1] Execute: `001_ajustar_plans_v2_ids_gateway.sql`**
- Adiciona colunas `vega_product_id`, `ggcheckout_product_id`, `amplopay_product_id` em `plans_v2`
- Cria índices para busca rápida

#### **[2] Execute: `002_add_constraints_idempotencia_subscriptions.sql`**
- Adiciona UNIQUE constraint `(user_id, plan_id, payment_id)` em `user_subscriptions`
- Impede webhooks duplicados criarem múltiplas subscriptions

#### **[3] Execute: `003_criar_ou_ajustar_pending_plans.sql`**
- Cria tabela `pending_plans` (para usuários não registrados)
- Cria função `activate_pending_plans()` para ativar planos após signup

#### **[4] Execute: `004_ajustar_webhook_logs.sql`**
- Adiciona colunas `processed_at` e `notes` em `webhook_logs`
- Cria índices para facilitar queries

---

### **PASSO 2: Testar a Edge Function**

A função `webhook-unificada` já está pronta. Para testar com um webhook de teste da Vega:

**URL da Webhook:**
```
https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada
```

**Payload de Teste (Vega - PIX Aprovado):**
```json
{
  "plans": [
    {
      "id": "3MGN9O",
      "products": [
        {
          "id": "3MGN9O",
          "code": "3MGN9O",
          "title": "EdukaPapers – Kit Completo",
          "amount": 2999,
          "quantity": 1
        }
      ]
    }
  ],
  "products": [
    {
      "code": "3MGN9O",
      "title": "EdukaPapers – Kit Completo",
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
  "transaction_token": "VCP1O8VEI5G",
  "sale_code": "VCS1O8VBHJ4",
  "order_url": "https://checkout.edukaprime.com.br/order/VCP1O8VEI5G",
  "business_name": "Eduka Prime"
}
```

---

### **PASSO 3: Mapear Product IDs dos Gateways**

Você precisa mapear os product IDs de cada gateway para os planos em `plans_v2`.

**Execute no Supabase SQL Editor:**

```sql
-- Exemplo: Mapear Vega product ID "3MGN9O" ao plan ID 1
UPDATE plans_v2
SET vega_product_id = '3MGN9O'
WHERE id = 1;

-- Exemplo: Mapear GGCheckout product ID "gg-prod-123" ao plan ID 2
UPDATE plans_v2
SET ggcheckout_product_id = 'gg-prod-123'
WHERE id = 2;

-- Exemplo: Mapear Amplopay product ID "amp-prod-456" ao plan ID 3
UPDATE plans_v2
SET amplopay_product_id = 'amp-prod-456'
WHERE id = 3;
```

---

## 🧪 TESTE DE IDEMPOTÊNCIA

Se você enviar o **mesmo webhook duas vezes**, a função deve:
1. ✅ Ignorar a segunda chamada silenciosamente
2. ✅ Retornar `status: 'success'`
3. ✅ Não criar duplicate subscriptions
4. ✅ Atualizar webhook_logs com `notes: 'Subscription duplicada ignorada (idempotência)'`

---

## 🎯 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────┐
│        WEBHOOK RECEBIDO (Vega/GGCheckout/Amplopay) │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  [1] DETECTAR PLATAFORMA (Vega/GGCheckout/Amplopay) │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  [2] EXTRAIR PRODUCT_ID E DADOS                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  [3] REGISTRAR EM webhook_logs (status: "received")│
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
          ┌──────────────────┐
          │ Pagamento        │
          │ aprovado?        │
          └────────┬─────────┘
               SIM │       NÃO
                   │        │
         ┌─────────▼──┐  ┌──▼────────────────────┐
         │ [4] BUSCAR │  │ Marcar como "pending" │
         │ PLANO EM   │  │ e retornar            │
         │ plans_v2   │  └──────────────────────┘
         └─────────┬──┘
                   │
         ┌─────────▼──────────────────┐
         │ Plano encontrado?          │
         └────────┬───────┬───────────┘
            SIM   │       │ NÃO
                  │       │
        ┌─────────▼─┐  ┌──▼──────────────────────────┐
        │ [5]BUSCAR │  │ Marcar como "failed"        │
        │ USUÁRIO   │  │ notes: PLANO_NAO_MAPEADO    │
        └──┬────────┘  └─────────────────────────────┘
           │
     ┌─────┴──────────────────┐
     │ Usuário existe?        │
     └────────┬────────┬──────┘
          SIM │        │ NÃO
             │        │
    ┌────────▼──┐  ┌──▼─────────────────────┐
    │[6] CRIAR  │  │ [6] CRIAR PENDING_PLAN │
    │SUBSCRIPTION│  │ (será ativado no signup)
    │           │  │                        │
    └────────┬──┘  └──┬────────────────────┘
             │        │
             └────┬───┘
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ [7] WEBHOOK_LOGS: status = "success"│
    └─────────────────────────────────────┘
```

---

## 🔍 VERIFICAÇÃO

### **Ver Webhooks Recebidos:**
```sql
SELECT * FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

### **Ver Subscriptions Criadas:**
```sql
SELECT * FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### **Ver Planos Pendentes:**
```sql
SELECT * FROM pending_plans
WHERE status = 'pending'
ORDER BY created_at DESC;
```

---

## ❓ DÚVIDAS COMUNS

### **P: O que acontece se o webhook enviar um product_id não mapeado?**
**R:** Será marcado como `failed` em webhook_logs com `notes: "PLANO_NAO_MAPEADO"`. Você poderá mapear o product_id depois via SQL.

### **P: E se o usuário ainda não se registrou?**
**R:** Será criado em `pending_plans`. Quando o usuário se registrar, a função `activate_pending_plans()` será chamada e os planos pendentes serão ativados automaticamente.

### **P: Como ativar pending_plans quando usuário se registra?**
**R:** Você precisa chamar essa função no seu signup (edge function ou triggers). Exemplo:

```sql
SELECT activate_pending_plans('user_id_aqui', 'email@example.com');
```

### **P: Como receber webhooks de múltiplos gateways?**
**R:** Todos devem apontar para a mesma URL:
- Vega: `https://YOUR_URL/functions/v1/webhook-unificada`
- GGCheckout: `https://YOUR_URL/functions/v1/webhook-unificada`
- Amplopay: `https://YOUR_URL/functions/v1/webhook-unificada`

A função detecta automaticamente qual gateway enviou!

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Executar os 4 arquivos SQL
2. ✅ Mapear product IDs dos gateways em plans_v2
3. ✅ Testar webhook com payload de teste
4. ✅ Configurar função de signup para chamar `activate_pending_plans()`
5. ✅ Monitorar webhook_logs para erros

---

**Tudo pronto! Bora implementar! 🚀**
