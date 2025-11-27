# 🔧 COMO RODAR O DIAGNÓSTICO - Passo a Passo

## PASSO 1: Abra o Supabase SQL Editor

1. Acesse: https://lkhfbhvamnqgcqlrriaw.supabase.co
2. Login com suas credenciais
3. **SQL Editor** (menu esquerda)
4. Clique em **"New Query"** ou crie uma aba nova

---

## PASSO 2: Execute os queries um de cada vez

### Query 1️⃣: Ver últimos 10 webhooks

```sql
SELECT
  id,
  platform,
  customer_email,
  customer_name,
  amount,
  transaction_id,
  payment_method,
  created_at
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

**O que você verá:**
- Lista dos últimos 10 webhooks recebidos
- Valores de amount
- Plataforma de cada webhook
- Data/hora

**O que procurar:**
- ✅ Se há webhooks recentes (últimos dias)
- ✅ Se amount está preenchido corretamente (ex: 99.00 para R$99)
- ✅ Se platform está detectada (vega, ggcheckout, amplopay)

---

### Query 2️⃣: Ver raw_payload completo

```sql
SELECT
  id,
  platform,
  customer_email,
  raw_payload
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 1;
```

**O que você verá:**
- O webhook completo em JSON

**O que procurar:**
- Campo `products` ou `items`
- Onde está o ID/código do produto
- Estrutura exata do payload

---

### Query 3️⃣: VEGA - Estrutura de products

```sql
SELECT
  id,
  platform,
  customer_email,
  raw_payload -> 'products' as products_array,
  raw_payload -> 'items' as items_array,
  raw_payload ->> 'product_id' as root_product_id,
  raw_payload ->> 'sku' as root_sku
FROM webhook_logs
WHERE platform = 'vega'
ORDER BY created_at DESC
LIMIT 5;
```

**O que você verá:**
- Para webhooks VEGA, onde estão os produtos

**O que procurar:**
- products_array: `[{"code":"3MGN9O","title":"..."}]` ou NULL?
- items_array: `[{"code":"3MGN9O",...}]` ou NULL?
- Se nenhum dos dois tiver: onde está o ID?

**Exemplos de resultado:**

✅ BOM:
```
products_array: [{"code": "3MGN9O", "title": "Plano Essencial"}]
items_array: NULL
```

❌ RUIM:
```
products_array: NULL
items_array: NULL
root_product_id: NULL
root_sku: NULL
```

---

### Query 4️⃣: GGCHECKOUT - Estrutura de products

```sql
SELECT
  id,
  platform,
  customer_email,
  raw_payload -> 'products' as products_array,
  raw_payload -> 'payment' as payment_object
FROM webhook_logs
WHERE platform = 'ggcheckout'
ORDER BY created_at DESC
LIMIT 5;
```

**O que procurar:**
- products_array: `[{"id":"PROD-123","name":"..."}]` ou similar?
- payment_object: contém "amount" e "method"?

---

### Query 5️⃣: AMPLOPAY - Estrutura de product_id

```sql
SELECT
  id,
  platform,
  customer_email,
  raw_payload ->> 'product_id' as product_id,
  raw_payload -> 'orderItems' as order_items
FROM webhook_logs
WHERE platform = 'amplopay'
ORDER BY created_at DESC
LIMIT 5;
```

**O que procurar:**
- product_id: tem valor ou NULL?
- order_items: estrutura dos itens?

---

### Query 6️⃣: Contar webhooks por plataforma

```sql
SELECT
  platform,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as sucesso,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendente,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as falhou
FROM webhook_logs
GROUP BY platform
ORDER BY total DESC;
```

**O que você verá:**
- Quantos webhooks foram recebidos por plataforma
- Status de cada um

**Exemplo:**
```
platform      | total | sucesso | pendente | falhou
vega          | 15    | 15      | 0        | 0
ggcheckout    | 8     | 8       | 0        | 0
amplopay      | 0     | 0       | 0        | 0
unknown       | 2     | 0       | 2        | 0
```

---

### Query 7️⃣: Verificar pending_plans com webhooks

```sql
SELECT
  p.id,
  p.email,
  p.status,
  p.platform,
  p.amount_paid,
  p.product_id_gateway,
  w.platform as webhook_platform,
  w.customer_email as webhook_email,
  w.raw_payload -> 'products' as webhook_products
FROM pending_plans p
LEFT JOIN webhook_logs w ON p.webhook_id = w.id
ORDER BY p.created_at DESC
LIMIT 10;
```

**O que você verá:**
- Planos pendentes e seus webhooks associados

**O que procurar:**
- product_id_gateway: tem valor ou é NULL? ← **CRÍTICO!**
- Se NULL, significa que o product_id nunca foi extraído ❌

---

### Query 8️⃣: Comparar valores (amount)

```sql
SELECT
  w.id as webhook_id,
  w.customer_email,
  w.amount as webhook_amount,
  p.amount_paid as pending_amount,
  CASE
    WHEN w.amount = p.amount_paid THEN '✅ OK'
    ELSE '❌ DIFERENTE'
  END as amount_match
FROM webhook_logs w
LEFT JOIN pending_plans p ON w.id = p.webhook_id
WHERE p.id IS NOT NULL
ORDER BY w.created_at DESC
LIMIT 15;
```

**O que você verá:**
- Valores do webhook vs pending_plans
- Se estão sincronizados

**Esperado:**
```
webhook_amount | pending_amount | amount_match
99.00          | 99.00          | ✅ OK
0.13           | 0.13           | ❌ DIFERENTE (valor errado!)
```

---

## PASSO 3: Analisar os resultados

Depois de rodar os queries, responda:

### ❓ Pergunta 1: Há webhooks recentes?
- [ ] Sim, vários nos últimos dias
- [ ] Sim, mas antigos (semanas)
- [ ] Não, nenhum recente

### ❓ Pergunta 2: O amount está correto?
- [ ] Sim, ex: R$99.00 mostrado como 99.00
- [ ] Não, ex: R$99.00 mostrado como 0.99 ou 9900
- [ ] Inconsistente, depende do webhook

### ❓ Pergunta 3: Qual a estrutura do products no webhook VEGA?
```
Copie e cole aqui o resultado de:
raw_payload -> 'products' as products_array
```

### ❓ Pergunta 4: O product_id_gateway nos pending_plans está preenchido?
- [ ] Sim, vejo IDs/códigos como "3MGN9O"
- [ ] Não, todos são NULL
- [ ] Alguns SIM, alguns NULL (inconsistente)

---

## PASSO 4: Compartilhe os resultados comigo

Copie e cole:
1. Resultado da Query 1 (últimos 10 webhooks)
2. Resultado da Query 2 (raw_payload completo)
3. Resposta das 4 perguntas acima

Com isso, vou saber exatamente:
- ✅ Qual plataforma está enviando webhooks
- ✅ Se os valores estão corretos
- ✅ Se os produtos estão sendo extraídos
- ✅ O que precisa ser corrigido

---

## 🎯 Exemplo de Resultado Esperado

### Se TUDO está funcionando:

```
Query 1 - Últimos webhooks:
id      | platform | email           | amount | status
abc123  | vega     | user@email.com  | 99.00  | success
def456  | vega     | user2@email.com | 49.90  | success

Query 3 - VEGA products:
products_array: [{"code":"3MGN9O","title":"Plano Essencial"}]

Query 7 - Pending plans:
product_id_gateway: 3MGN9O ✅
amount_paid: 99.00 ✅
```

### Se há problemas:

```
Query 1 - Últimos webhooks:
id      | platform | email           | amount | status
abc123  | unknown  | user@email.com  | 0      | pending  ❌ platform desconhecido
def456  | vega     | user2@email.com | 0.99   | success  ❌ valor errado

Query 3 - VEGA products:
products_array: NULL ❌
items_array: NULL ❌

Query 7 - Pending plans:
product_id_gateway: NULL ❌
amount_paid: 0.99 ❌
```

---

Execute os queries agora e compartilhe os resultados! 🚀
