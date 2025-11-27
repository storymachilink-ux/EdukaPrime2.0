# 🎯 ESTRUTURA CORRETA DE WEBHOOKS - Guia Final

## 📊 Como funciona a estrutura atual:

```
┌─────────────────────────────────────────────────────────┐
│  VEGA (plataforma de pagamento)                         │
│  Webhook URL: /functions/v1/vega-webhook               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  vega-webhook (ROTEADOR)                                │
│  - Recebe dados do Vega                                 │
│  - Redireciona para: /functions/v1/webhook              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  webhook (PROCESSADOR UNIFICADO) ✅ EDITE ESSA!         │
│  - Processa Vega, GGCheckout, Amplopay                  │
│  - Extrai product_ids (múltiplos)                       │
│  - Insere em webhook_logs com status = 'pending'        │
│  - Chama RPC process_webhook_payment()                  │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ Qual função editar?

### ✅ EDITAR: `webhook-unificada` (NOVA)
**NÃO!** Essa function não está sendo chamada por nada!

### ✅ EDITAR: `webhook` (A ORIGINAL)
**SIM!** Essa é a que realmente processa os webhooks!

```
Estrutura:
├── vega-webhook ❌ (não edite, é apenas um roteador)
│   └─→ redireciona para → webhook ✅ (edite ESSA!)
├── checkout-webhook ❌ (não edite, é apenas um roteador)
│   └─→ redireciona para → webhook ✅ (edite ESSA!)
└── webhook ✅ (EDITE ESSA - faz todo o processamento)
```

---

## 📍 URLs para configurar nas plataformas:

### Para VEGA:
```
https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/vega-webhook
```

**O que acontece:**
1. Vega envia para `vega-webhook`
2. `vega-webhook` redireciona para `webhook`
3. `webhook` processa e insere em `webhook_logs`

### Para GGCheckout:
```
https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/checkout-webhook
```

**O que acontece:**
1. GGCheckout envia para `checkout-webhook`
2. `checkout-webhook` redireciona para `webhook`
3. `webhook` processa e insere em `webhook_logs`

---

## 🔧 Qual função editar?

**EDITE: `webhook`**

**ARQUIVO**: `supabase/functions/webhook/index.ts`

Esta é a função que:
- ✅ Detecta a plataforma (Vega, GGCheckout, Amplopay)
- ✅ Extrai `product_ids` (múltiplos produtos)
- ✅ Define `expires_at` (30 dias TTL)
- ✅ Insere em `webhook_logs`
- ✅ Define `status = 'pending'` para não aprovados
- ✅ Chama RPC `process_webhook_payment()` para aprovados

---

## ✅ Status: JÁ ATUALIZADA!

A função `webhook` já foi atualizada com:
- ✅ `extractProductIds()`
- ✅ `product_ids` na inserção
- ✅ `expires_at` na inserção
- ✅ Status `'pending'` para webhooks não aprovados
- ✅ RPC `process_webhook_payment()` com array

---

## 🚀 O que você precisa fazer agora:

### OPÇÃO 1: Usar a função `webhook` (RECOMENDADO)
1. Abra Supabase Console
2. Vá em **Edge Functions**
3. Clique em **webhook** (a que já está atualizada)
4. Clique em **Edit**
5. Verifique que tem a lógica nova
6. Deploy automático

### OPÇÃO 2: Deletar `webhook-unificada` (OPCIONAL)
Se não vai usar, pode deletar para limpar:
- `supabase/functions/webhook-unificada/index.ts`
- `supabase/functions/webhook-unificada-v2/index.ts`

Não estão sendo chamadas por nada!

---

## 📝 RESUMO FINAL:

**Qual editar?**
- ✅ **webhook** (a que o Vega chama)
- ❌ webhook-unificada (não é chamada)
- ❌ webhook-unificada-v2 (não é chamada)

**Qual URL usar no Vega?**
- ✅ `https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/vega-webhook`

**Como funciona?**
- Vega → vega-webhook (roteador) → webhook (processador) ✅

**Status:**
- ✅ Function `webhook` já atualizada
- ✅ Pronta para testes

---

## 🎯 Próximo passo:

Teste novamente gerando um PIX no Vega!

O webhook deve:
1. Chegar em `vega-webhook`
2. Ser redirecionado para `webhook`
3. Ser inserido em `webhook_logs` com `status = 'pending'`
4. **Aparecer no Dashboard!** 🎉

**Tá pronto para testar?** 🚀
