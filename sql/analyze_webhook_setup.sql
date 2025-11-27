SELECT 'TABELAS WEBHOOK' as categoria;

SELECT table_name FROM information_schema.tables
WHERE table_name IN ('webhook_logs', 'vega_webhooks', 'user_subscriptions', 'plans_v2')
ORDER BY table_name;

SELECT 'PLANS_V2 - Mapeamento de Gateways' as categoria;

SELECT id, name, vega_product_id, ggcheckout_product_id, amplopay_product_id FROM plans_v2 ORDER BY id;

SELECT 'WEBHOOK_LOGS - Últimos 10' as categoria;

SELECT id, platform, status, customer_email, transaction_id, created_at FROM webhook_logs ORDER BY created_at DESC LIMIT 10;

SELECT 'USER_SUBSCRIPTIONS - Últimas 10' as categoria;

SELECT id, user_id, plan_id, status, product_id_gateway, created_at FROM user_subscriptions ORDER BY created_at DESC LIMIT 10;

SELECT 'VEGA_WEBHOOKS - Contagem por Status' as categoria;

SELECT processing_status, COUNT(*) as total FROM vega_webhooks GROUP BY processing_status;

SELECT 'VEGA_WEBHOOKS - Últimas 10' as categoria;

SELECT id, customer_email, plan_sku, payment_status, processing_status, created_at FROM vega_webhooks ORDER BY created_at DESC LIMIT 10;

SELECT 'VEGA_WEBHOOKS - Mapeamento SKU' as categoria;

SELECT plan_sku, plan_identified, plan_level, COUNT(*) as total FROM vega_webhooks GROUP BY plan_sku, plan_identified, plan_level;
