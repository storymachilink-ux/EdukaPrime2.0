# 🔧 CORRIGIR ESTRUTURA DE WEBHOOKS - O Verdadeiro Problema

## 📋 O que descobrimos:

Você tem **3 functions separadas**:
1. ✅ `vega-webhook` → redireciona para → `webhook`
2. ❌ `checkout-webhook` → separada
3. ❌ `amplopay-webhook` → separada

**O PROBLEMA**:
- `vega-webhook` chama a function `webhook` (linha 23)
- A function `webhook` era ANTIGA e não tinha:
  - ❌ `extractProductIds()` - extrai múltiplos produtos
  - ❌ `product_ids` na inserção
  - ❌ `expires_at` para TTL
  - ❌ Status `'pending'` para webhooks não aprovados
  - ❌ Chamada à RPC `process_webhook_payment()`

**A SOLUÇÃO**:
✅ Atualizei a function `webhook` com TODAS as melhorias!

---

## 🎯 O que foi mudado na function `webhook`:

### ✅ Adicionado:
1. **`extractProductIds()`** - extrai TODOS os product IDs do payload
   - Suporta Vega (items[].code)
   - Suporta GGCheckout (products[].id)
   - Suporta Amplopay (product_id único)

2. **Extração de `product_ids` e `expires_at`**:
   ```typescript
   const product_ids = extractProductIds(payload, platform)
   const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
   ```

3. **Inserção com novas colunas**:
   ```typescript
   product_ids: product_ids,
   expires_at: expiresAt,
   ```

4. **Status `'pending'` para webhooks não aprovados**:
   ```typescript
   } else if (event_type !== 'payment.approved') {
     console.log(`ℹ️ Webhook não aprovado - Status: ${event_type}`)
     await supabase
       .from('webhook_logs')
       .update({ status: 'pending', ... })
       .eq('id', webhookId)
   }
   ```

5. **RPC `process_webhook_payment()` com múltiplos produtos**:
   ```typescript
   const { data: processResult } = await supabase
     .rpc('process_webhook_payment', {
       p_webhook_id: webhookId,
       p_customer_email: customer_email,
       p_product_ids: product_ids,
       p_transaction_id: transaction_id,
     })
   ```

6. **Email em lowercase**:
   ```typescript
   customer_email = payload.customer?.email?.toLowerCase() || '...'
   ```

---

## 🚀 Deploy da função `webhook`:

**LOCAL**: Supabase Console → Edge Functions → webhook → Edit

**ARQUIVO ATUALIZADO**: `supabase/functions/webhook/index.ts`

**AÇÕES**:
1. Abra Supabase Console
2. Vá em "Edge Functions"
3. Clique em "webhook"
4. Clique em "Edit"
5. O arquivo já foi atualizado localmente
6. Verifique o conteúdo no seu editor
7. Se está correto, ele vai fazer deploy automático

---

## 📊 Fluxo agora é:

```
[PIX Gerado no Vega]
        ↓
[vega-webhook recebe]
        ↓
[Redireciona para: /functions/v1/webhook]
        ↓
[webhook/index.ts processa]
        ↓
[Extrai product_ids (TODOS os produtos)]
        ↓
[Insere em webhook_logs com product_ids + expires_at]
        ↓
[Se NÃO APROVADO → status = 'pending'] ✨ NOVO
        ↓
[Dashboard mostra webhook com status = 'pending']  ✨ PRONTO!
```

---

## ✅ Resultado esperado:

Agora quando você gera um PIX no Vega:
- ✅ Webhook chega na function `webhook`
- ✅ É inserido em `webhook_logs` com `status = 'pending'`
- ✅ Com `product_ids` extraído
- ✅ Com `expires_at` definido (30 dias)
- ✅ **APARECE NO DASHBOARD!** 🎉

---

## 📝 Próximos testes:

1. Gere um novo PIX no Vega
2. Vá ao Dashboard Admin → Webhooks
3. Você deve ver o webhook com:
   - status = `pending` (amarelo)
   - product_ids mostrado
   - reprocess_count = 0

Se aparecer = **FUNCIONANDO!** 🚀

---

## ⚡ Resumo:

**Você estava certo!** O webhook Vega chama a function `webhook`, não a `webhook-unificada`.

Atualizei a `webhook` com TODA a lógica nova:
- ✅ Múltiplos produtos
- ✅ Status pending
- ✅ Expires_at
- ✅ Product_ids armazenado
- ✅ RPC process_webhook_payment

Agora está tudo integrado corretamente! 🎯

**Teste novamente gerando um PIX** ✨
