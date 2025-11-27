-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_009_otimizar_webhook_logs.sql
-- DESCRIÇÃO: Remover colunas inúteis de webhook_logs e deixar apenas o essencial
-- ORDEM: 9ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover colunas que não precisamos em webhook_logs
ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS product_ids;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS reprocess_count;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS last_reprocess_at;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS processed_successfully;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS processed_user_id;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS last_processed_at;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS reprocess_attempts;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS error_message;

ALTER TABLE webhook_logs
DROP COLUMN IF EXISTS expires_at;

-- ✅ webhook_logs agora tem APENAS as colunas essenciais:
-- - id
-- - platform (vega, ggcheckout, amplopay)
-- - event_type (payment.approved, payment.pending, etc)
-- - status (received, success, failed)
-- - customer_email
-- - customer_name
-- - payment_method
-- - amount
-- - transaction_id
-- - raw_payload
-- - created_at
-- - processed_at
-- - notes

-- ✅ Concluído!
-- Próximo: Verificar CONSTRAINTS em user_subscriptions e pending_plans
