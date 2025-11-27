# 🔍 WEBHOOK PRODUCT EXTRACTION - ANÁLISE DETALHADA

## RESUMO DO PROBLEMA

Você relatou:
- ❌ Pílulas com code/ID do produto não aparecem ou aparecem incorretamente
- ❌ Valores estão errados
- ❌ Em "Webhook Recebidos" e "Planos Pendentes" não funciona

### Root Cause Identificado

**O produto está sendo SALVO, mas NÃO EXTRAÍDO corretamente para o banco de dados!**

```
Webhook VEGA chega com:
{
  "products": [{
    "code": "3MGN9O",        ← ESTE CÓDIGO PRECISA APARECER NAS PÍLULAS
    "title": "Plan Essencial"
  }],
  "total_price": 9900        ← 99.00 BRL
}
    ↓
webhook_final.ts SALVA:
  - raw_payload: {... webhook completo ...}
  - amount: 9900 / 100 = 99.00 ✅
  - product_id: NULL ❌ (NÃO ESTÁ SENDO EXTRAÍDO!)
  - product_code: NULL ❌
  - product_title: NULL ❌
    ↓
webhook_logs TABLE:
  id: 123abc
  raw_payload: {...}
  amount: 99.00
  product_id: NULL ← AQUI ESTÁ O PROBLEMA!
  product_code: NULL
  product_title: NULL
    ↓
Frontend (WebhookLogs.tsx):
  - Precisa extrair do raw_payload
  - Chama extractProducts(log.raw_payload)
  - Tenta múltiplas estratégias (items, products, product_id, sku)
  - Resultado: pode duplicar, falhar, ou mostrar valores errados
```

---

## 1. FLUXO ATUAL (QUEBRADO)

### 1.1 Backend: webhook_final.ts

**O que está salvo:** (webhook_final.ts linhas 110-122)
```typescript
const result = await supabase
  .from('webhook_logs')
  .insert({
    platform: webhookData.platform,        // 'vega', 'ggcheckout', etc
    event_type: webhookData.event_type,    // 'payment.approved'
    status: 'received',                    // hardcoded
    customer_email: ...,
    customer_name: ...,
    amount: ...,                           // Pode estar errado por plataforma
    payment_method: ...,
    transaction_id: ...,
    raw_payload: ...,                      // WEBHOOK COMPLETO AQUI
    // FALTAM: product_id, product_code, product_title ❌
  })
```

**O que DEVERIA estar sendo salvo:**
```typescript
const result = await supabase
  .from('webhook_logs')
  .insert({
    // ... campos acima ...
    product_id: extractProductId(payload, platform),        // ← FALTA!
    product_code: extractProductCode(payload, platform),    // ← FALTA!
    product_title: extractProductTitle(payload, platform),  // ← FALTA!
    amount: calculateAmount(payload, platform),             // ← ERRADO!
  })
```

### 1.2 Frontend: WebhookLogs.tsx (Linha 96-125)

**Função extractProducts que NÃO SABE A PLATAFORMA:**
```typescript
const extractProducts = (payload: any): string[] => {
  // ❌ Problema 1: Não sabe qual é a plataforma
  // Então tenta TUDO:

  if (payload.items && Array.isArray(payload.items)) {
    // Procura em items
    payload.items.forEach((item: any) => {
      products.push(item.code || item.id || item.name);
    });
  }

  if (payload.product_id || payload.sku) {
    // Procura em root level
    products.push(payload.product_id || payload.sku);
  }

  if (payload.products && Array.isArray(payload.products)) {
    // Procura em products array
    payload.products.forEach((p: any) => {
      products.push(p.code || p.id || p.name);
    });
  }

  return products.length > 0 ? products : ['Sem produtos'];
  // ❌ Problema 2: Resultado pode ter duplicatas!
  // Exemplo: ["3MGN9O", "3MGN9O", "3MGN9O"] ← mesmo código 3x!
}
```

### 1.3 Frontend: PendingPlansManager.tsx (Linha 53-83)

**Tenta extrair de raw_payload:**
```typescript
const extractProductInfo = (plan: PendingPlan): ProductInfo => {
  // ❌ Problema: Procura por campos errados

  if (payload.product_name) info.title = payload.product_name  // VEGA não tem!
  if (payload.product_title) info.title = payload.product_title  // Ninguém tem!

  // Se tem items, extrai do primeiro
  if (payload.items && Array.isArray(payload.items)) {
    info.title = item.name || item.title  // OK para VEGA
    info.code = item.id || item.code      // Pode estar errado para GGCHECKOUT
  }

  return info;
}
```

---

## 2. MAPEAMENTO POR PLATAFORMA

### VEGA

**Webhook esperado:**
```json
{
  "transaction_token": "abc123",
  "status": "approved",
  "total_price": 9900,  // Centavos!
  "customer": {"email": "user@email.com"},
  "products": [{
    "code": "3MGN9O",     // ← Product ID
    "title": "Plano XXX"   // ← Product Title
  }],
  "items": [{            // ← Alternativa (pode ter também)
    "code": "3MGN9O",
    "name": "Plano XXX"
  }]
}
```

**Como extrair corretamente:**
```typescript
function extractVegaProduct(payload: any) {
  let productCode = null;
  let productTitle = null;

  // Preferência 1: products array
  if (payload.products && payload.products[0]) {
    productCode = payload.products[0].code;
    productTitle = payload.products[0].title || payload.products[0].name;
  }

  // Preferência 2: items array (fallback)
  else if (payload.items && payload.items[0]) {
    productCode = payload.items[0].code;
    productTitle = payload.items[0].name || payload.items[0].title;
  }

  // Preferência 3: root level (fallback)
  else {
    productCode = payload.product_id || payload.sku;
  }

  return { code: productCode, title: productTitle };
}
```

### GGCHECKOUT

**Webhook esperado:**
```json
{
  "event": "pix.paid",
  "payment": {
    "id": "payment-123",
    "amount": 99.00,      // Reais (não centavos!)
    "method": "pix"
  },
  "customer": {"email": "user@email.com"},
  "products": [{
    "id": "PROD-123",     // ← Product ID
    "code": "CODE123",
    "sku": "SKU123",
    "name": "Product Name"  // ← Product Title
  }]
}
```

**Como extrair corretamente:**
```typescript
function extractGgcheckoutProduct(payload: any) {
  let productId = null;
  let productTitle = null;

  if (payload.products && payload.products[0]) {
    // Ordem de preferência para ID: id > code > sku
    productId = payload.products[0].id ||
                payload.products[0].code ||
                payload.products[0].sku;

    // Title sempre de name
    productTitle = payload.products[0].name;
  }

  return { code: productId, title: productTitle };
}
```

### AMPLOPAY

**Webhook esperado:**
```json
{
  "product_id": "prod-123",      // ← Direto aqui!
  "amount": 100,                 // Reais
  "status": "COMPLETED",
  "orderItems": [{
    "product": {
      "id": "prod-123",
      "name": "Product Name"
    }
  }]
}
```

**Como extrair corretamente:**
```typescript
function extractAmlopayProduct(payload: any) {
  let productId = null;
  let productTitle = null;

  // Preferência 1: product_id root
  if (payload.product_id) {
    productId = payload.product_id;
  }

  // Preferência 2: orderItems
  else if (payload.orderItems && payload.orderItems[0]?.product) {
    productId = payload.orderItems[0].product.id;
    productTitle = payload.orderItems[0].product.name;
  }

  return { code: productId, title: productTitle };
}
```

---

## 3. PROBLEMA COM VALORES (AMOUNT)

### Inconsistência entre plataformas

| Plataforma | Campo | Unidade | Conversão |
|-----------|-------|---------|-----------|
| VEGA | `total_price` | **Centavos** | Divide por 100 |
| GGCHECKOUT | `payment.amount` | **Reais** | Usa direto |
| AMPLOPAY | `amount` | **Reais** | Usa direto |

### Código atual em webhook_final.ts (ERRADO!)

```typescript
// Linha 38: VEGA
amount: parseInt(String(payload.total_price || 0)) / 100  // ✅ Correto

// Linha 51: GGCHECKOUT
amount: payload.payment?.amount || 0  // ✅ Correto

// Linha 64: AMPLOPAY
amount: payload.amount || 0  // ✅ Correto
```

**Aparentemente está certo aqui, mas:**
- Se webhook_final.ts não está sendo usado (múltiplos handlers!)
- Pode estar sendo processado por outro handler com lógica diferente

---

## 4. EXEMPLO REAL: POR QUE ESTÁ FALHANDO

### Cenário: VEGA webhook com valor 9900 centavos

**Webhook chega:**
```json
{
  "transaction_token": "tx123",
  "checkout_tax_amount": 0,
  "status": "approved",
  "total_price": 9900,
  "customer": {"email": "user@email.com", "name": "User"},
  "products": [{"code": "3MGN9O", "title": "Plano Essencial"}]
}
```

**webhook_final.ts processa:**
```
detectPlatform() → verifica transaction_token ✅ e checkout_tax_amount ✅
→ Detecta como VEGA ✅

extractWebhookData() → plataforma='vega'
  - customer_email: 'user@email.com' ✅
  - amount: 9900 / 100 = 99.00 ✅
  - product_id: NULL ❌ (não está sendo extraído!)

salva em webhook_logs:
  {
    platform: 'vega',
    customer_email: 'user@email.com',
    amount: 99.00,
    raw_payload: {...},
    product_id: NULL,  ← AQUI ESTÁ O ERRO!
  }
```

**Frontend exibe em WebhookLogs:**
```
Tabela:
  Data     | Status   | Cliente        | Produtos       | Valor  | Método
  27/11... | Sucesso  | user@email.com | ❌ "Sem produtos" | 99.00 | -

Por que? → extractProducts(raw_payload) tenta:
  1. payload.items? NÃO
  2. payload.product_id? NÃO
  3. payload.products? SIM! → ["3MGN9O"] ✅

Mas se a lógica estiver errada:
  → Pode procurar em items primeiro, não encontrar
  → Depois procurar em products, encontrar
  → Result: ["3MGN9O"] OU ["Sem produtos"] dependendo da ordem
```

---

## 5. POR QUE MÚLTIPLOS HANDLERS?

Existe:
1. **webhook_final.ts** (atual, simplificado)
2. **supabase/functions/webhook-vega/index.ts**
3. **supabase/functions/webhook-ggcheckout/index.ts**
4. **supabase/functions/webhook-unificada/index.ts**
5. **supabase/functions/webhook-definitiva/index.ts**

**Problema:** Não está claro qual é usado em PRODUÇÃO!

Se Netlify está usando webhook_final.ts, mas você quer lógica de webhook-unificada.ts, haverá conflito!

---

## 6. DIAGNÓSTICO: COMO VERIFICAR

### Passo 1: Verificar o que está sendo salvo

```sql
-- Na Supabase SQL Editor
SELECT
  id,
  platform,
  customer_email,
  amount,
  raw_payload::jsonb -> 'products' as products_array,
  raw_payload::jsonb -> 'items' as items_array
FROM webhook_logs
WHERE customer_email = 'user@email.com'
ORDER BY created_at DESC
LIMIT 5;
```

**Esperado:**
```
id        | platform | email           | amount | products_array | items_array
abc123    | vega     | user@email.com  | 99.00  | [{"code":"3MGN9O",...}] | [...]
```

### Passo 2: Verificar o que está sendo exibido no frontend

```javascript
// No console do navegador em Admin → Webhook Recebidos
console.log(webhookLogs[0]);  // Ver a estrutura completa
```

**Esperado:**
```javascript
{
  id: "abc123",
  platform: "vega",
  customer_email: "user@email.com",
  amount: 99.00,
  raw_payload: {
    transaction_token: "tx123",
    products: [
      {code: "3MGN9O", title: "Plano Essencial"}
    ]
  }
}
```

### Passo 3: Testar a função extractProducts

```javascript
// No console do frontend
const testPayload = {
  products: [{code: "3MGN9O", title: "Plano Essencial"}],
  items: [{code: "3MGN9O"}]
};

function extractProducts(payload) {
  if (!payload) return [];
  const products = [];

  if (payload.items && Array.isArray(payload.items)) {
    payload.items.forEach(item => {
      products.push(item.code || item.id || item.name);
    });
  }

  if (payload.product_id || payload.sku) {
    products.push(payload.product_id || payload.sku);
  }

  if (payload.products && Array.isArray(payload.products)) {
    payload.products.forEach(p => {
      products.push(p.code || p.id || p.name);
    });
  }

  return products.length > 0 ? products : ['Sem produtos'];
}

const result = extractProducts(testPayload);
console.log('Resultado:', result);
// Esperado: ['3MGN9O', '3MGN9O', '3MGN9O'] ← TRÊS VEZES (DUPLICADO!)
// Ou: ['3MGN9O'] ← se a função estiver corrigida
```

---

## 7. SOLUÇÃO: O QUE PRECISA SER FEITO

### PRIORIDADE 1: Extrair e guardar product_id no backend

**Editar webhook_final.ts:**

```typescript
// Adicionar função de extração por plataforma
function extractProductId(payload: any, platform: string): string | null {
  if (platform === 'vega') {
    // VEGA: procura em products[0].code
    return payload.products?.[0]?.code ||
           payload.items?.[0]?.code ||
           payload.product_id ||
           null;
  }

  if (platform === 'ggcheckout') {
    // GGCHECKOUT: procura em products[0].id
    return payload.products?.[0]?.id ||
           payload.products?.[0]?.code ||
           payload.products?.[0]?.sku ||
           null;
  }

  if (platform === 'amplopay') {
    // AMPLOPAY: procura em product_id ou orderItems
    return payload.product_id ||
           payload.orderItems?.[0]?.product?.id ||
           null;
  }

  return null;
}

// Adicionar função de extração de título
function extractProductTitle(payload: any, platform: string): string | null {
  if (platform === 'vega') {
    return payload.products?.[0]?.title ||
           payload.products?.[0]?.name ||
           payload.items?.[0]?.name ||
           null;
  }

  if (platform === 'ggcheckout') {
    return payload.products?.[0]?.name ||
           payload.products?.[0]?.title ||
           null;
  }

  if (platform === 'amplopay') {
    return payload.orderItems?.[0]?.product?.name ||
           null;
  }

  return null;
}

// Modificar extractWebhookData para INCLUIR product_id e product_title
function extractWebhookData(payload: any, platform: string) {
  // ... código existente ...

  const baseData = {
    platform: platform,
    event_type: ...,
    customer_email: ...,
    customer_name: ...,
    payment_method: ...,
    amount: ...,
    transaction_id: ...,
    raw_payload: payload,
    product_id: extractProductId(payload, platform),        // ← NOVO!
    product_title: extractProductTitle(payload, platform),  // ← NOVO!
  };

  return baseData;
}

// Modificar o insert para salvar product_id e product_title
const result = await supabase
  .from('webhook_logs')
  .insert({
    // ... campos existentes ...
    product_id: webhookData.product_id,        // ← NOVO!
    product_title: webhookData.product_title,  // ← NOVO!
  })
```

### PRIORIDADE 2: Frontend usa product_id do banco

**Editar WebhookLogs.tsx:**

```typescript
// Em vez de chamar extractProducts(raw_payload)
// Usar o product_id já salvo no banco:

{log.product_id ? (
  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-300">
    {log.product_id}
  </span>
) : (
  <span className="text-gray-400">Sem produto</span>
)}

// E se quiser título também:
{log.product_title && (
  <div className="text-xs text-gray-600 mt-1">
    {log.product_title}
  </div>
)}
```

### PRIORIDADE 3: PendingPlansManager usa product_id salvo

```typescript
// Em vez de procurar em raw_payload
// Usar o webhook_logs.product_id:

<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
  {webhookLog?.product_id || 'Sem produto'}
</span>
```

---

## 8. RESUMO DAS MUDANÇAS NECESSÁRIAS

| O Que | Onde | Por Quê |
|------|------|--------|
| Extrair product_id por plataforma | webhook_final.ts | Backend sabe a plataforma |
| Extrair product_title por plataforma | webhook_final.ts | Melhor UX |
| Salvar product_id no banco | webhook_final.ts insert | Evita re-extração no frontend |
| Salvar product_title no banco | webhook_final.ts insert | Dados completos |
| Usar product_id do banco | WebhookLogs.tsx | Confiável, sem duplicação |
| Usar product_id do banco | PendingPlansManager.tsx | Confiável, sem duplicação |
| Validar amount por plataforma | webhook_final.ts | Valores consistentes |

---

## 9. RESULTADO ESPERADO APÓS CORREÇÃO

### Webhook Recebidos (Admin)

**Antes:**
```
Data     | Status | Cliente        | Produtos        | Valor | Método
27/11... | ✅     | user@email.com | ❌ "Sem produtos"| 99.00 | PIX
```

**Depois:**
```
Data     | Status | Cliente        | Produtos        | Valor | Método
27/11... | ✅     | user@email.com | 📦 3MGN9O       | 99.00 | PIX
                                      Plano Essencial
```

### Planos Pendentes (Admin)

**Antes:**
```
Email          | Produtos      | Status     | Plataforma | Valor
user@email.com | ❌ vazio      | Pendente   | vega       | 99.00
```

**Depois:**
```
Email          | Produtos                    | Status     | Plataforma | Valor
user@email.com | 📦 3MGN9O (Plano Essencial) | Pendente   | vega       | 99.00
```

---

**Próximo Passo:** Você quer que eu implemente essas correções?
