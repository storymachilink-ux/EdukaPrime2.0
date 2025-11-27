SELECT COUNT(*) as total_vega_webhooks FROM vega_webhooks;

SELECT COUNT(*) as total_webhook_logs FROM webhook_logs;

SELECT COUNT(*) as total_user_subscriptions FROM user_subscriptions;

SELECT COUNT(*) as total_plans FROM plans_v2;

SELECT id, name, vega_product_id FROM plans_v2 LIMIT 10;

SELECT customer_email, plan_sku, payment_status, processing_status FROM vega_webhooks LIMIT 10;

SELECT platform, status, COUNT(*) as total FROM webhook_logs GROUP BY platform, status;
