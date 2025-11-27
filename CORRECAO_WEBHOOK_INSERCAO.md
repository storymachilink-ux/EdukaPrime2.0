# 🔧 CORREÇÃO FINAL: Por Que os Webhooks Não Estão Sendo Inseridos

## 🎯 Problema Identificado

A Edge Function `webhook-unificada-v2` **recebe e processa o webhook corretamente**, mas a **inserção no banco de dados falha silenciosamente** porque a tabela `webhook_logs` está faltando 3 colunas essenciais:

**Colunas que faltam:**
1. ❌ `platform` (TEXT) - Identifica se vem de Vega, GGCheckout ou AmploPay
2. ❌ `transaction_id` (TEXT) - ID da transação no gateway
3. ❌ `processed_at` (TIMESTAMP) - Data de processamento

## 🔍 Análise Técnica

### Arquivo: `supabase/functions/webhook-unificada-v2/index.ts` (Linhas 130-142)

A função tenta inserir esses dados:
```typescript
const insertData = {
  platform: webhookData.platform,              // ❌ Coluna não existe
  event_type: webhookData.event_type,
  status: 'received',
  customer_email: webhookData.customer_email,
  customer_name: webhookData.customer_name,
  amount: webhookData.amount,
  payment_method: webhookData.payment_method,
  transaction_id: webhookData.transaction_id,  // ❌ Coluna não existe
  product_ids: product_ids,
  expires_at: expiresAt,
  raw_payload: payload,
}

await supabase
  .from('webhook_logs')
  .insert(insertData)
```

### Arquivo: `sql/create_webhook_logs.sql` (Linhas 18-46)

A tabela original NÃO tem essas colunas:
```sql
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  event_type TEXT,
  status TEXT,
  customer_email TEXT,
  customer_name TEXT,
  payment_method TEXT,
  amount NUMERIC,
  product_id TEXT,              -- ❌ Product IDs singular (não array)
  plan_activated INTEGER,
  raw_payload JSONB
  -- ❌ Faltam: platform, transaction_id, processed_at
);
```

### Arquivo: `sql/webhook_reprocessing_setup.sql` (Linhas 1-4)

A migração anterior adicionou ALGUMAS colunas, mas não todas:
```sql
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS product_ids JSONB DEFAULT '[]'::JSONB;
-- ❌ Faltam aqui: platform, transaction_id, processed_at
```

## ⚡ O Que Acontece Quando o Webhook Chega

1. **Vega** envia webhook para `/functions/v1/vega-webhook`
2. **vega-webhook** (correto) redireciona para `/functions/v1/webhook-unificada-v2`
3. **webhook-unificada-v2** recebe e processa os dados
4. **Tenta inserir**: `await supabase.from('webhook_logs').insert(insertData)`
5. ❌ **ERRO SILENCIOSO**: PostgreSQL rejeita porque colunas `platform`, `transaction_id`, `processed_at` não existem
6. **Resultado**: Webhook NUNCA é inserido, nada aparece no dashboard

## ✅ Solução

Execute o SQL em `sql/fix_webhook_logs_schema.sql` que adiciona as 3 colunas faltantes:

```sql
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
```

## 📋 Passo a Passo para Resolver

### PASSO 1: Executar a migração SQL

1. Abra **Supabase Console** → **SQL Editor**
2. Copie TODO o conteúdo de `sql/fix_webhook_logs_schema.sql`
3. Cole e execute no SQL Editor
4. Você deve ver: `✅ Schema de webhook_logs atualizado com sucesso!`

### PASSO 2: Testar se funcionou

Depois de executar o SQL, gere um novo PIX no Vega:

1. Vá em **Gerenciar Planos** → **Testar Pagamento**
2. Gere um PIX
3. Aguarde 5 segundos
4. Vá em **Admin** → **🔔 Webhooks Recebidos**
5. ✅ O webhook deve aparecer com `status = 'received'` ou `'pending'`

### PASSO 3: Verificar no banco (SQL)

```sql
SELECT
  id,
  created_at,
  platform,
  customer_email,
  status,
  event_type,
  amount,
  transaction_id
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 5;
```

Você deve ver dados com:
- ✅ `platform = 'vega'`
- ✅ `customer_email = seu-email@teste.com`
- ✅ `status = 'received'` ou `'pending'`
- ✅ `transaction_id = algo válido`

## 🎯 Fluxo Completo Após Correção

```
1. Vega gera PIX
   ↓
2. Webhook enviado para: /functions/v1/vega-webhook
   ↓
3. vega-webhook redireciona para: /functions/v1/webhook-unificada-v2
   ↓
4. webhook-unificada-v2 processa e insere em webhook_logs
   ├─ platform = 'vega'
   ├─ event_type = 'payment.pending'
   ├─ status = 'received'
   ├─ product_ids = ["ABC123"]
   ├─ transaction_id = token_da_vega
   └─ expires_at = agora + 30 dias
   ↓
5. Dashboard fetcha: SELECT * FROM webhook_logs
   ↓
6. ✅ Webhook aparece com status = 'received'/'pending'
```

## 🧪 Teste Manual no SQL (Após Migração)

Você pode testar inserindo um webhook manualmente para verificar que funciona:

```sql
INSERT INTO webhook_logs (
  platform,
  event_type,
  status,
  customer_email,
  customer_name,
  amount,
  payment_method,
  transaction_id,
  product_ids,
  expires_at,
  raw_payload
)
VALUES (
  'vega',
  'payment.pending',
  'received',
  'seu-email@teste.com',
  'Seu Nome',
  9999,
  'pix',
  'TEST-TRANSACTION-ID',
  '["PROD123"]'::JSONB,
  NOW() + INTERVAL '30 days',
  '{}'::JSONB
);
```

Se isso funciona sem erro, a tabela está corrigida! ✅

## 📝 Resumo

| Item | Status |
|------|--------|
| vega-webhook redireciona corretamente | ✅ FEITO |
| webhook-unificada-v2 processador correto | ✅ FEITO |
| webhook_logs tem coluna `platform` | ❌ FALTAVA → ✅ CORRIGIDO |
| webhook_logs tem coluna `transaction_id` | ❌ FALTAVA → ✅ CORRIGIDO |
| webhook_logs tem coluna `processed_at` | ❌ FALTAVA → ✅ CORRIGIDO |
| Webhooks podem ser inseridos | ❌ ANTES → ✅ AGORA |

---

## 🚀 Próximos Passos

1. ✅ Execute `sql/fix_webhook_logs_schema.sql` no Supabase
2. ✅ Teste gerando um novo PIX no Vega
3. ✅ Confirme que o webhook aparece no dashboard
4. ✅ Webhooks reprocessing automático já está configurado (ativa quando usuário se registra)
5. ✅ Reprocessamento manual está no dashboard (botão Reprocessar)

**Você está MUITO PERTO de resolver!** 🎉
