# 🔄 Comparação: Webhook Vega vs GGCheckout

## 📊 Estrutura Geral

Ambos os webhooks seguem a MESMA lógica de negócio:

```
Recebe webhook → Registra em webhook_logs → Valida dados →
Se status approved → Processa planos → Cria subscription ou pending_plan →
Atualiza status
```

---

## 🔍 Diferenças na Extração de Campos

### Webhook Vega

**Exemplo de Payload:**
```json
{
  "transaction_token": "vega_123",
  "status": "approved",
  "customer": {
    "email": "joao@email.com",
    "name": "João Silva"
  },
  "method": "pix",
  "total_price": 1299,
  "items": [
    {
      "code": "produto_123",
      "title": "Produto A"
    }
  ]
}
```

**Extração:**
```
payment_id = transaction_token
status = status
customer_email = customer.email
customer_name = customer.name
payment_method = method
amount = total_price / 100 (já é em centavos!)
products = items
product_code = code
```

---

### Webhook GGCheckout

**Exemplo de Payload:**
```json
{
  "event": "pix.paid",
  "customer": {
    "email": "joao@email.com",
    "name": "João Silva"
  },
  "products": [
    {
      "id": "produto_123",
      "name": "Produto A",
      "price": 1299
    }
  ],
  "payment": {
    "id": "gg_123",
    "method": "pix.paid",
    "status": "paid",
    "amount": 1299
  }
}
```

**Extração:**
```
payment_id = payment.id
status = payment.status (fallback: event)
customer_email = customer.email
customer_name = customer.name
payment_method = payment.method
amount = payment.amount (já é decimal em BRL!)
products = products array
product_code = id
```

---

## 🎯 Mapeamento de Status

### Vega

```
status → event_type
"approved" → "payment.approved"
"pending" → "payment.pending"
"failed" → "payment.failed"
"refunded" → "payment.refunded"
```

### GGCheckout

```
event (ou payment.status) → event_type (via mapStatus())
"paid" ou "card.paid" → "payment.approved"
"pending" ou "pix.generated" → "payment.pending"
"failed" → "payment.failed"
"refunded" ou "pix.refunded" → "payment.refunded"
```

---

## 📝 Tabelas Utilizadas

Ambos usam as MESMAS tabelas:

| Tabela | Uso |
|--------|-----|
| `webhook_logs` | Registra todos os webhooks recebidos |
| `plans_v2` | Busca o plano usando product_code (vega_product_id) |
| `users` | Busca o usuário pelo email |
| `user_subscriptions` | Cria subscription ativa se usuário existe |
| `pending_plans` | Cria plano pendente se usuário não existe |

---

## 🔐 Validações Iguais

Ambos fazem:

1. ✅ Validam se `payment_id` existe (campo obrigatório)
2. ✅ Registram webhook com status "received"
3. ✅ Se status não é "approved" → registram e retornam 200
4. ✅ Se status é "approved" → validam email e produtos
5. ✅ Checam idempotência (payment_id já existe?)
6. ✅ Para cada produto:
   - Procuram o plano
   - Se usuário existe → cria subscription
   - Se não existe → cria pending_plan
7. ✅ Atualizam webhook_logs com resultado final

---

## 🚀 Único "Segredo" das Funções Auxiliares

Ambos reutilizam as MESMAS funções:

```typescript
insertWebhookLog()       // Registra webhook
selectPlanByVegaId()     // Busca plano pelo código
selectUserByEmail()      // Busca usuário
checkPaymentIdExists()   // Verifica idempotência
insertUserSubscription() // Cria subscription
insertPendingPlan()      // Cria plano pendente
updateWebhookLog()       // Atualiza status
updateUserActivePlan()   // Ativa plano no usuário
corsHeaders()            // Headers CORS
```

---

## 📍 Resumo Técnico

| Aspecto | Vega | GGCheckout |
|---------|------|-----------|
| Lógica de negócio | 100% idêntica | 100% idêntica |
| Extração de campos | Diferentes | Diferentes |
| Mapeamento de status | Simples | Com fallbacks |
| Tabelas usadas | Mesmas | Mesmas |
| Funções auxiliares | Reutilizadas | Reutilizadas |
| Comportamento final | Idêntico | Idêntico |

---

## 🎯 Fluxo Integrado

```
CLIENTE COMPRA
    ↓
┌───────────────────┬──────────────────┐
│   Vega            │   GGCheckout     │
│   webhook-vega    │   webhook-gg     │
└────────┬──────────┴────────┬─────────┘
         │                   │
         ▼                   ▼
  ┌─────────────────────────────┐
  │ webhook_logs (registra)     │
  └──────────┬──────────────────┘
             │
             ▼
  ┌─────────────────────────────┐
  │ Status approved?            │
  └──────────┬──────────────────┘
             │ SIM
             ▼
  ┌─────────────────────────────┐
  │ plans_v2 (busca plano)      │
  └──────────┬──────────────────┘
             │
             ▼
  ┌─────────────────────────────┐
  │ Usuário existe?             │
  │ ├─ SIM → user_subscriptions │
  │ └─ NÃO → pending_plans      │
  └──────────┬──────────────────┘
             │
             ▼
  ┌─────────────────────────────┐
  │ PLANO CRIADO/PENDENTE ✅    │
  └─────────────────────────────┘
             │
             ▼
  ┌─────────────────────────────┐
  │ Cliente faz login           │
  └──────────┬──────────────────┘
             │
             ▼
  ┌─────────────────────────────┐
  │ activate_pending_plans()    │
  │ (ativa planos pendentes)    │
  └──────────┬──────────────────┘
             │
             ▼
  ┌─────────────────────────────┐
  │ PLANO ATIVADO 🎉            │
  │ Cliente acessa tudo! ✅     │
  └─────────────────────────────┘
```

---

## 📌 Conclusão

Os dois webhooks são **praticamente idênticos**, apenas adaptando a forma de extrair dados dos payloads diferentes. Tudo o mais é reutilizado, mantendo a consistência e facilitando manutenção no futuro!

**Benefício:** Se você tiver um terceiro webhook (AmploPay, Stripe, etc), pode usar a mesma estrutura! 🚀
