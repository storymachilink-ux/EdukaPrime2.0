-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_006_remover_webhooks.sql
-- DESCRIÇÃO: Remover tabela webhooks (duplicação de webhook_logs)
-- ORDEM: 6ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover constraints
ALTER TABLE webhooks
DROP CONSTRAINT IF EXISTS webhooks_user_id_fkey;

ALTER TABLE webhooks
DROP CONSTRAINT IF EXISTS webhooks_plan_id_fkey;

-- Passo 2: Deletar a tabela
DROP TABLE IF EXISTS webhooks CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_007_remover_pending_entitlements.sql
