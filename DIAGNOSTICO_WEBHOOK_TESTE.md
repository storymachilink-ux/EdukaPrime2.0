# 🔍 DIAGNÓSTICO - Webhook não aparece no Dashboard

## Situação:
- ✅ Webhook foi gerado no Vega (PIX criado)
- ❌ Não aparece no Dashboard Admin

---

## O que programamos:

Se o **user NÃO existe**, o webhook deve:
1. ✅ Ser inserido em `webhook_logs` com status = **`pending`**
2. ✅ Aguardar quando o user se registrar
3. ✅ Quando user registrar → trigger automático processa
4. ✅ Webhook muda para status = **`success`**

---

## Verificação 1: Webhook foi inserido no banco?

**LOCAL**: Supabase Console → SQL Editor → New Query

**EXECUTE**:
```sql
SELECT
  id,
  customer_email,
  status,
  product_ids,
  expires_at,
  created_at,
  platform
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado**:
- Deve aparecer 1 linha com seu webhook
- `customer_email`: o email do PIX
- `status`: `pending` (porque user não existe)
- `product_ids`: array JSON com código do produto
- `expires_at`: timestamp de 30 dias no futuro

---

## Verificação 2: Qual status tem o webhook?

**Se Verificação 1 mostrou o webhook**, execute:

```sql
SELECT
  id,
  customer_email,
  status,
  reprocess_count,
  last_reprocess_at,
  raw_payload -> 'customer' ->> 'email' as vega_email
FROM webhook_logs
WHERE customer_email = 'O_EMAIL_DO_WEBHOOK'
ORDER BY created_at DESC
LIMIT 5;
```

(Substitua `'O_EMAIL_DO_WEBHOOK'` pelo email do seu PIX)

---

## Verificação 3: Por que não aparece no Dashboard?

O Dashboard busca webhooks com:
```sql
status IN ['pending', 'failed', 'error']
```

**Se o webhook NÃO apareceu nem na Verificação 1**:
- ❌ O webhook NÃO foi inserido no banco
- 🔴 Problema: Edge Function não recebeu o webhook OU teve erro

**Se o webhook apareceu mas com status diferente** (ex: 'received', 'success'):
- ⚠️ Problema: Status está errado
- Pode ter tentado processar e mudou de status

---

## PRÓXIMAS AÇÕES:

1. **Execute Verificação 1**
2. **Se encontrou o webhook**: Diga qual `status` tem
3. **Se NÃO encontrou**: Vamos verificar logs da Edge Function

---

## 📊 Possíveis Cenários:

### Cenário A: Webhook com status = 'pending'
✅ Está correto!
- Agora registre um usuário com o mesmo email do webhook
- Trigger automático vai processar
- Status vai mudar para 'success'
- Webhook vai aparecer no Dashboard

### Cenário B: Webhook com status = 'received'
⚠️ Parou no meio do processamento
- Edge Function inseriu mas não atualizou o status

### Cenário C: Webhook com status = 'success'
✅ Foi processado! Mas então por que não aparece?
- Dashboard busca apenas `['pending', 'failed', 'error']`
- Webhooks `success` não aparecem por padrão
- Isso é correto (só mostra pendentes)

### Cenário D: Nenhum webhook encontrado
❌ Webhook não chegou no banco
- Edge Function pode ter tido erro
- Vega pode não estar mandando para o endpoint correto

---

## Execute agora:

Faça a **Verificação 1** e me diga:
- ✅ Webhook encontrado? Qual status?
- ❌ Webhook não encontrado?
- ❓ Qual foi o email do PIX?

Aí saberemos exatamente qual é o problema! 🔍
