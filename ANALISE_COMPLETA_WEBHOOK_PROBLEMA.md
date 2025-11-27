# 🔍 ANÁLISE COMPLETA - Por Que os Webhooks NÃO Aparecem no Dashboard

## EXECUTIVE SUMMARY

O webhook **está sendo inserido no banco de dados**, mas **NÃO aparece no dashboard** porque:

1. ⚠️ **RLS Policy bloqueando a visualização** - Admin precisa ter `is_admin = true`
2. ⚠️ **Coluna `platform` pode estar vazia** - Edge Function pode não detectar corretamente
3. ⚠️ **Webhook pode estar com status não esperado** - Pode ser 'pending' ou 'error'
4. ⚠️ **Webhook pode estar vindo de uma Edge Function diferente** - Não do `webhook-unificada-v2`

---

## 📊 ESTRUTURA DO WEBHOOK NO BANCO

### Tabela: `webhook_logs` (criada em `create_webhook_logs.sql`)

**Colunas principais:**
```sql
id                UUID        -- ID único
created_at        TIMESTAMP   -- Quando foi criado
event_type        TEXT        -- Tipo de evento (payment.approved, etc)
status            TEXT        -- Status: pending, success, received, failed, error, expired
customer_email    TEXT        -- Email do cliente
customer_name     TEXT        -- Nome do cliente
payment_method    TEXT        -- Método (pix, card, etc)
amount            NUMERIC     -- Valor do pagamento
platform          TEXT        -- Plataforma (vega, ggcheckout, amplopay) ← ADICIONADA LATER
product_id        TEXT        -- ID do produto
product_ids       JSONB       -- Array de produtos (ADICIONADA LATER)
transaction_id    TEXT        -- ID da transação
raw_payload       JSONB       -- JSON completo
expires_at        TIMESTAMP   -- Data de expiração (30 dias)
```

### RLS Policy da Tabela:
```sql
-- LINHA 71-79 de create_webhook_logs.sql
CREATE POLICY "Apenas admins podem ver logs de webhooks"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true  -- ⚠️ CRITICAL: Usuário DEVE ter is_admin = true
    )
  );
```

---

## 🔴 PROBLEMA 1: RLS Policy - Admin não consegue ver dados

### Como o Dashboard fetcha os dados:

**Arquivo:** `src/components/admin/WebhooksDashboard.tsx` (linhas 30-41)

```typescript
const loadWebhooks = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar:', error);  // ← Se houver erro RLS, log aqui
      throw error;
    }
    // ...
  }
}
```

### Por que falha:
1. Dashboard faz query: `SELECT * FROM webhook_logs`
2. Supabase verifica RLS: "O usuário logado tem `is_admin = true`?"
3. Se `is_admin = false` ou ausente:
   - Query retorna SUCESSO mas com **0 linhas** (comportamento silencioso do RLS)
   - Mostra "Nenhum webhook encontrado"
   - **NÃO há erro no console!**

### Verificação:
```sql
-- Execute no Supabase SQL Editor:
SELECT id, email, is_admin FROM users WHERE email = '[seu-email]';

-- Se is_admin = false ou NULL → ESSE É O PROBLEMA
```

---

## 🔴 PROBLEMA 2: Edge Function enviando para endpoint errado

### Estrutura de Webhooks Atuais:

```
1. vega-webhook (supabase/functions/vega-webhook/index.ts)
   ├─ Recebe: POST /functions/v1/vega-webhook
   └─ Redireciona para: /functions/v1/webhook (linha 23)
        └─ webhook/index.ts - VERSÃO ANTIGA (sem platform, sem product_ids)

2. checkout-webhook (supabase/functions/checkout-webhook/index.ts)
   ├─ Recebe: POST /functions/v1/checkout-webhook
   └─ Redireciona para: /functions/v1/webhook
        └─ webhook/index.ts - VERSÃO ANTIGA

3. webhook-unificada (supabase/functions/webhook-unificada/index.ts)
   └─ Nunca é chamada por nada! ❌

4. webhook-unificada-v2 (supabase/functions/webhook-unificada-v2/index.ts)
   └─ Nunca é chamada por nada! ❌
```

### O Problema:
- `vega-webhook` redireciona para `webhook` (versão ANTIGA)
- A versão ANTIGA não tem `extractProductIds()`, não detecta `platform`, não define `expires_at`
- Webhook é inserido com coluna `platform = NULL` ou `platform = 'unknown'`
- Dashboard não consegue filtrar/visualizar

---

## 🔴 PROBLEMA 3: Webhook pode estar com status incorreto

### Fluxo esperado vs realidade:

**ESPERADO:**
```
PIX gerado (não aprovado)
    ↓
webhook-unificada-v2 processa
    ↓
event_type = 'payment.pending' (não aprovado)
    ↓
status = 'pending' (linha 174-179)
    ↓
Dashboard mostra com status=pending
```

**REALIDADE (com webhook antigo):**
```
PIX gerado
    ↓
webhook (versão antiga) processa
    ↓
Sem lógica para status='pending' para não aprovados
    ↓
status = 'received' ou fica NULL
    ↓
Dashboard não mostra (sem dados)
```

---

## 🔴 PROBLEMA 4: Coluna `platform` não está preenchida

### Na tabela original (`create_webhook_logs.sql`):
- Não tem coluna `platform`
- Foi adicionada DEPOIS na v2

### No código atual (`webhook-unificada-v2`):
- Tenta inserir `platform: platform` (linha 133)
- Mas a coluna pode não existir se SQL antigo foi executado

### Verificação:
```sql
-- Execute no Supabase SQL Editor:
DESC webhook_logs;
-- Procure por: "platform" na lista de colunas

-- Se não aparecer, a coluna não existe!
```

---

## 🟡 PROBLEMA 5: Webhook pode estar sendo inserido mas não ativado

### Flow atual quando webhook chega:

1. **Edge Function** (`webhook-unificada-v2` ou `webhook/index.ts`):
   - Insere em `webhook_logs` com status = 'received'
   - Se `event_type = 'payment.approved'` E usuário existe → chama RPC

2. **RPC `process_webhook_payment()`**:
   - Se usuário **não** existe → retorna erro
   - Webhook fica com status = 'pending'

3. **Dashboard consulta**:
   - `SELECT * FROM webhook_logs` com filtro `status = 'all'` por padrão
   - Mostra status = 'pending' ou 'received'

---

## ✅ DIAGNÓSTICO FINAL

### O Webhook ESTÁ no banco de dados?

**Verifique executando no SQL Editor:**
```sql
SELECT
  id,
  created_at,
  platform,
  customer_email,
  status,
  event_type,
  product_id
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado:**
- Se tem dados → webhook foi inserido ✅
- Se vazio → webhook NUNCA chegou na Edge Function ❌

### Por que não aparece no Dashboard?

**Caso 1: Webhook EXISTS no banco mas NÃO aparece no dashboard**
- ❌ RLS Policy bloqueando (is_admin = false)
- ❌ Coluna `platform` não existe
- ❌ Dashboard esperando coluna que não existe

**Caso 2: Webhook NÃO EXISTS no banco**
- ❌ Edge Function não recebeu o webhook
- ❌ Vega está enviando para URL errada
- ❌ Edge Function teve erro e não inseriu

---

## 🔧 SOLUÇÃO DEFINITIVA - PASSO A PASSO

### PASSO 1: Verificar se Admin tem permissão

```sql
-- Execute no Supabase SQL Editor
SELECT id, email, is_admin FROM users WHERE email = '[seu-email]';

-- Se is_admin = false, execute:
UPDATE users SET is_admin = true WHERE email = '[seu-email]';
```

### PASSO 2: Verificar estrutura da tabela

```sql
-- Verifique se a coluna platform existe
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'webhook_logs'
ORDER BY ordinal_position;

-- Se falta 'platform', execute:
ALTER TABLE webhook_logs ADD COLUMN platform TEXT;
ALTER TABLE webhook_logs ADD COLUMN product_ids JSONB;
ALTER TABLE webhook_logs ADD COLUMN transaction_id TEXT;
ALTER TABLE webhook_logs ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE webhook_logs ADD COLUMN reprocess_count INTEGER DEFAULT 0;
ALTER TABLE webhook_logs ADD COLUMN processed_at TIMESTAMP;
ALTER TABLE webhook_logs ADD COLUMN last_reprocess_at TIMESTAMP;
```

### PASSO 3: Verify webhooks in database

```sql
-- Contar webhooks por status
SELECT status, COUNT(*) as total FROM webhook_logs GROUP BY status;

-- Ver todos os webhooks recentes
SELECT
  id,
  created_at,
  platform,
  customer_email,
  status,
  event_type
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 20;
```

### PASSO 4: Updateedge Function to use correct endpoint

The VEGA webhook should call `webhook-unificada-v2`, NOT the old `webhook`.

**File to update:** `supabase/functions/vega-webhook/index.ts`

Current (line 23):
```typescript
const webhookUrl = `${SUPABASE_URL}/functions/v1/webhook`
```

Should be:
```typescript
const webhookUrl = `${SUPABASE_URL}/functions/v1/webhook-unificada-v2`
```

### PASSO 5: Verify product_ids mapp in plans_v2

```sql
-- Verify que seus produtos do Vega estão mapeados
SELECT id, name, vega_product_id, ggcheckout_product_id, amplopay_product_id
FROM plans_v2;

-- Se vega_product_id está vazio, execute para mapear:
UPDATE plans_v2 SET vega_product_id = '[seu-product-id-vega]' WHERE id = 1;
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] `users.is_admin = true` para seu usuário?
- [ ] Coluna `platform` existe em `webhook_logs`?
- [ ] Coluna `product_ids` existe em `webhook_logs`?
- [ ] `plans_v2` tem `vega_product_id` preenchido?
- [ ] Edge Function `vega-webhook` redireciona para `webhook-unificada-v2`?
- [ ] Webhook aparece em `SELECT * FROM webhook_logs`?
- [ ] Webhook tem `status = 'received'` ou `'success'`?
- [ ] Webhook tem `platform != NULL`?

---

## 🎯 PRÓXIMOS PASSOS

1. **PRIMEIRO:** Faça as 3 verificações SQL acima
2. **SEGUNDO:** Me envie os resultados (quantos webhooks, qual status, qual platform)
3. **TERCEIRO:** Vamos fazer a solução correta baseada nos resultados

**Nada de adivinhar. Vamos ver EXATAMENTE o que está acontecendo no banco!**

