# 🚀 WEBHOOK PRODUCT EXTRACTION - PLANO DE AÇÃO COMPLETO

## ✅ FASE 1: BACKEND (CONCLUÍDO)

### O Que Foi Feito

**Arquivo:** `webhook_final.ts` (Commit: 7d73e70)

```typescript
✅ Adicionado: extractProductId()
   - Extrai product_id por plataforma
   - VEGA: products[0].code
   - GGCHECKOUT: products[0].id
   - AMPLOPAY: product_id

✅ Adicionado: extractProductTitle()
   - Extrai product_title por plataforma
   - VEGA: products[0].title
   - GGCHECKOUT: products[0].name
   - AMPLOPAY: orderItems[0].product.name

✅ Modificado: extractWebhookData()
   - Chama extractProductId() e extractProductTitle()
   - Adiciona product_id ao retorno
   - Adiciona product_title ao retorno

✅ Modificado: INSERT webhook_logs
   - Salva product_id na coluna product_id
   - Salva product_title na coluna product_title

✅ Adicionado: Debug logging
   - Console log de product_id extraído
   - Console log de product_title extraído
```

---

## ⏳ FASE 2: BANCO DE DADOS (PRÓXIMO - 5 MIN)

### O Que Fazer

**1. Abra Supabase SQL Editor:**
```
https://lkhfbhvamnqgcqlrriaw.supabase.co
→ SQL Editor
→ New Query
```

**2. Execute esta migration:**

```sql
-- Add product information columns to webhook_logs table
BEGIN;

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS product_id VARCHAR(255);

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS product_code VARCHAR(255);

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS product_title TEXT;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_product_id
ON webhook_logs(product_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_product_code
ON webhook_logs(product_code);

COMMENT ON COLUMN webhook_logs.product_id IS 'Product ID extracted from webhook';
COMMENT ON COLUMN webhook_logs.product_code IS 'Product code extracted from webhook';
COMMENT ON COLUMN webhook_logs.product_title IS 'Product title extracted from webhook';

COMMIT;
```

**3. Verifique que funcionou:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'webhook_logs'
ORDER BY ordinal_position;
```

**Esperado:** Deve ter `product_id`, `product_code`, `product_title` na lista.

---

## 📝 FASE 3: FRONTEND - WebhookLogs.tsx (PRÓXIMO - 10 MIN)

### O Que Mudará

**Antes:**
```typescript
const extractProducts = (payload: any): string[] => {
  // Tenta múltiplas estratégias, pode duplicar
  // Não sabe qual plataforma é
  // Resultado impredizível
}

// Na tabela:
<td>
  {extractProducts(log.raw_payload).map(p => (
    <span>{p}</span>
  ))}
</td>
```

**Depois:**
```typescript
// Usa o product_id já extraído e salvo no banco!

// Na tabela:
<td>
  {log.product_id ? (
    <>
      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-300">
        📦 {log.product_id}
      </span>
      {log.product_title && (
        <div className="text-xs text-gray-600 mt-1">
          {log.product_title}
        </div>
      )}
    </>
  ) : (
    <span className="text-gray-400">Sem produto</span>
  )}
</td>
```

### Passos

1. **Abra arquivo:** `src/pages/admin/WebhookLogs.tsx`

2. **Remova a função `extractProducts`** (linhas ~96-125)

3. **Na tabela, substitua a coluna "Produtos"** por:

```typescript
<td className="px-4 py-3 text-sm">
  {log.product_id ? (
    <div className="space-y-1">
      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-300">
        📦 {log.product_id}
      </span>
      {log.product_title && (
        <div className="text-xs text-gray-600">
          {log.product_title}
        </div>
      )}
    </div>
  ) : (
    <span className="text-gray-400 text-xs">Sem produto</span>
  )}
</td>
```

---

## 📋 FASE 4: FRONTEND - PendingPlansManager.tsx (PRÓXIMO - 10 MIN)

### O Que Mudará

**Antes:**
```typescript
const extractProductInfo = (plan: PendingPlan): ProductInfo => {
  // Tenta extrair do raw_payload
  // Procura por campos que talvez não existam
  // Pode retornar incompleto
}

// Na tabela:
<td>
  📦 {extractProductInfo(plan).code || 'Sem produto'}
</td>
```

**Depois:**
```typescript
// Usa o webhook_logs.product_id já extraído!

// Na tabela:
<td>
  {webhookLog?.product_id ? (
    <div className="space-y-1">
      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
        📦 {webhookLog.product_id}
      </span>
      {webhookLog.product_title && (
        <div className="text-xs text-gray-600">
          {webhookLog.product_title}
        </div>
      )}
    </div>
  ) : (
    <span className="text-gray-400 text-xs">Sem produto</span>
  )}
</td>
```

### Passos

1. **Abra arquivo:** `src/components/admin/PendingPlansManager.tsx`

2. **Remova a função `extractProductInfo`**

3. **Na query que carrega pending_plans, já carrega webhook_logs:**

```typescript
const { data: plans } = await supabase
  .from('pending_plans')
  .select(`
    *,
    webhook_logs (
      product_id,
      product_title,
      product_code
    )
  `)
  .order('created_at', { ascending: false })
```

4. **Na tabela, substitua a coluna "Produtos":**

```typescript
<td className="px-4 py-3 text-sm">
  {plan.webhook_logs?.product_id ? (
    <div className="space-y-1">
      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
        📦 {plan.webhook_logs.product_id}
      </span>
      {plan.webhook_logs.product_title && (
        <div className="text-xs text-gray-600">
          {plan.webhook_logs.product_title}
        </div>
      )}
    </div>
  ) : (
    <span className="text-gray-400 text-xs">Sem produto</span>
  )}
</td>
```

---

## 🧪 FASE 5: TESTES (ÚLTIMO - 5 MIN)

### Teste 1: Próximo webhook VEGA

1. Realize um pagamento na VEGA
2. Verifique Supabase:
   ```sql
   SELECT id, platform, customer_email, product_id, product_title, amount
   FROM webhook_logs
   ORDER BY created_at DESC
   LIMIT 1;
   ```
3. Esperado:
   ```
   product_id: "3MGN9P" ✅
   product_title: "EdukaPapers – Combo Básico de Natal" ✅
   amount: 12.99 ✅
   ```

### Teste 2: Admin vê na tabela Webhook Recebidos

1. Vá para Admin → Webhook Recebidos
2. Procure pelo webhook recém-recebido
3. Esperado:
   ```
   Coluna "Produtos":
   ┌─────────────┐
   │ 📦 3MGN9P   │
   │ EdukaPapers │
   └─────────────┘
   ```

### Teste 3: Admin vê em Planos Pendentes

1. Se user não estava no sistema, vai aparecer em "⏳ Planos Pendentes"
2. Esperado:
   ```
   Coluna "Produtos":
   ┌─────────────┐
   │ 📦 3MGN9P   │
   │ EdukaPapers │
   └─────────────┘
   ```

### Teste 4: Valores corretos

- Webhook mostra: `💰 Valor: 12.99` ✅
- Webhook no banco: `amount: 12.99` ✅
- Pending plan mostra: `Valor: 12.99` ✅

---

## 🎯 RESUMO DO PROGRESSO

```
✅ FASE 1: Backend (webhook_final.ts) ...................... CONCLUÍDO
⏳ FASE 2: Banco de dados (migrations) .................... PRÓXIMO (5 min)
⏳ FASE 3: Frontend WebhookLogs.tsx ....................... PRÓXIMO (10 min)
⏳ FASE 4: Frontend PendingPlansManager.tsx ............... PRÓXIMO (10 min)
⏳ FASE 5: Testes ....................................... PRÓXIMO (5 min)
```

**Total estimado: 30 minutos para completar tudo!**

---

## 📊 RESULTADO FINAL

### Antes
```
Webhook Recebidos:
Data     | Cliente        | Produtos      | Valor
27/11... | profecris...   | ❌ Sem produtos| 99.00

Planos Pendentes:
Email    | Produtos      | Valor
profec.. | ❌ vazio      | 99.00
```

### Depois
```
Webhook Recebidos:
Data     | Cliente        | Produtos               | Valor
27/11... | profecris...   | 📦 3MGN9P              | 99.00
                            EdukaPapers...

Planos Pendentes:
Email    | Produtos               | Valor
profec.. | 📦 3MGN9P              | 99.00
         | EdukaPapers...
```

---

## 🚀 Próximo Passo

1. Execute a migration SQL (Fase 2)
2. Me avise quando terminar
3. Vou fornecer o código exato para WebhookLogs.tsx e PendingPlansManager.tsx
