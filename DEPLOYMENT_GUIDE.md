# 🚀 Guia de Deploy - Webhooks Vega e GGCheckout

## 📋 O que foi criado:

### 1. Webhook Vega (já existente)
- **Arquivo**: `webhook-vega-definitiva.ts`
- **URL**: `https://<project-ref>.supabase.co/functions/v1/webhook-vega`

### 2. Webhook GGCheckout (novo!)
- **Arquivo**: `supabase/functions/webhook-ggcheckout/index.ts`
- **URL**: `https://<project-ref>.supabase.co/functions/v1/webhook-ggcheckout`

---

## 🔧 Como Fazer Deploy

### Opção 1: Via Supabase CLI (RECOMENDADO)

#### Passo 1: Instalar CLI (se não tem)
```bash
npm install -g supabase
```

#### Passo 2: Fazer login
```bash
supabase login
```

#### Passo 3: Deploy das funções
```bash
cd "C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project"
supabase functions deploy
```

Isso vai fazer deploy de TODAS as functions em `supabase/functions/`

#### Passo 4: Listar funções deployadas
```bash
supabase functions list
```

---

### Opção 2: Via Dashboard Supabase

1. Abra [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Edge Functions** → **Create a new function**
4. Nome: `webhook-ggcheckout`
5. Cole o código do arquivo `supabase/functions/webhook-ggcheckout/index.ts`
6. Deploy

---

## 🔐 Configurar Variáveis de Ambiente

Você precisa que as variáveis estejam configuradas no Supabase:

### No Dashboard Supabase:

1. Vá em **Project Settings** → **Functions** → **Secrets**
2. Adicione as variáveis (se ainda não existirem):

```
SUPABASE_URL = https://lkhfbhvamnqgcqlrriaw.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR... (sua chave de serviço)
URL_SUPABASE = https://lkhfbhvamnqgcqlrriaw.supabase.co
```

---

## ✅ Testar os Webhooks

### Teste 1: Webhook Vega

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/webhook-vega \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_token": "test_vega_123",
    "status": "approved",
    "customer": {
      "email": "teste@email.com",
      "name": "Cliente Teste"
    },
    "method": "pix",
    "total_price": 1299,
    "items": [
      {
        "code": "produto_id",
        "title": "Produto Teste"
      }
    ]
  }'
```

### Teste 2: Webhook GGCheckout

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/webhook-ggcheckout \
  -H "Content-Type: application/json" \
  -d '{
    "event": "pix.paid",
    "customer": {
      "name": "Cliente Teste",
      "email": "teste@email.com"
    },
    "products": [
      {
        "id": "produto_id",
        "name": "Produto Teste",
        "price": 1299
      }
    ],
    "payment": {
      "id": "test_gg_123",
      "method": "pix.paid",
      "status": "paid",
      "amount": 1299
    }
  }'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "message": "1 produto(s) processado(s) com sucesso"
}
```

---

## 📍 URLs Finais Para Configurar

### Na Vega (já deve estar):
```
https://<project-ref>.supabase.co/functions/v1/webhook-vega
```

### No GGCheckout (ADICIONAR AGORA):
```
https://<project-ref>.supabase.co/functions/v1/webhook-ggcheckout
```

---

## 🔍 Verificar Logs

Depois de fazer deploy, você pode ver os logs:

### Via CLI:
```bash
supabase functions download webhook-ggcheckout
```

### Via Dashboard:
1. **Edge Functions** → selecione **webhook-ggcheckout**
2. **Logs** → veja os eventos processados

---

## 📊 Fluxo Completo Agora

```
VEGA:
Cliente compra → Webhook Vega → pending_plan criado → Cliente cria conta → activate_pending_plans → Plano ativado ✅

GG CHECKOUT:
Cliente compra → Webhook GGCheckout → pending_plan criado → Cliente cria conta → activate_pending_plans → Plano ativado ✅
```

---

## 🆘 Se Der Erro

### Erro: "Function not found"
- Aguarde 1 minuto após o deploy
- Verifique a URL está correta

### Erro: "Variáveis de ambiente faltando"
- Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas
- Vá em **Project Settings** → **Functions** → **Secrets**

### Erro: "Table does not exist"
- Certifique-se que as tabelas existem no banco:
  - `webhook_logs`
  - `plans_v2`
  - `users`
  - `user_subscriptions`
  - `pending_plans`

---

## ✨ Resumo do Que Funciona Agora

| Feature | Vega | GGCheckout |
|---------|------|-----------|
| Recebe webhook | ✅ | ✅ |
| Cria pending_plan | ✅ | ✅ |
| Ativa plano se usuário existe | ✅ | ✅ |
| Cria pending plan se não existe | ✅ | ✅ |
| Idempotência | ✅ | ✅ |
| Integra com activate_pending_plans | ✅ | ✅ |

**Tudo pronto para funcionar!** 🚀
