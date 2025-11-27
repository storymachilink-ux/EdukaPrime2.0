-- ============================================
-- WEBHOOK DIAGNOSTIC SCRIPT
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para verificar o que está sendo salvo nos webhooks

-- ============================================
-- 1. VERIFICAR ÚLTIMOS 10 WEBHOOKS
-- ============================================
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

-- ============================================
-- 2. VERIFICAR raw_payload COMPLETO DO ÚLTIMO WEBHOOK
-- ============================================
SELECT
  id,
  platform,
  customer_email,
  raw_payload  -- Ver a estrutura completa
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 1;

-- ============================================
-- 3. EXTRAIR ESTRUTURA DE CADA PLATAFORMA
-- ============================================
-- VEGA: Ver structure de products e items
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

-- ============================================
-- 4. GGCHECKOUT: Ver estrutura de products
-- ============================================
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

-- ============================================
-- 5. AMPLOPAY: Ver estrutura de product_id
-- ============================================
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

-- ============================================
-- 6. VERIFICAR QUANTIDADE DE WEBHOOKS POR PLATAFORMA
-- ============================================
SELECT
  platform,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as sucesso,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendente,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as falhou
FROM webhook_logs
GROUP BY platform
ORDER BY total DESC;

-- ============================================
-- 7. VERIFICAR PENDING_PLANS COM WEBHOOKS
-- ============================================
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

-- ============================================
-- 8. COMPARAR VALORES: webhook_logs vs pending_plans
-- ============================================
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

-- ============================================
-- 9. VERIFICAR QUAIS PLANOS FORAM ENCONTRADOS
-- ============================================
SELECT
  p.id,
  p.email,
  p.platform,
  p.product_id_gateway,
  pl.name as plan_name,
  p.status,
  p.created_at
FROM pending_plans p
LEFT JOIN plans_v2 pl ON p.plan_id = pl.id
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC
LIMIT 20;

-- ============================================
-- 10. VERIFICAR SE HÁ COLUNA product_id
-- ============================================
-- Este query verifica a estrutura da tabela webhook_logs
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'webhook_logs'
ORDER BY ordinal_position;

-- ============================================
-- ANÁLISE FINAL: Contar produtos extraídos
-- ============================================
SELECT
  platform,
  COUNT(*) as total_webhooks,
  COUNT(CASE WHEN raw_payload -> 'products' IS NOT NULL THEN 1 END) as tem_products_array,
  COUNT(CASE WHEN raw_payload -> 'items' IS NOT NULL THEN 1 END) as tem_items_array,
  COUNT(CASE WHEN raw_payload ->> 'product_id' IS NOT NULL THEN 1 END) as tem_root_product_id
FROM webhook_logs
GROUP BY platform;
