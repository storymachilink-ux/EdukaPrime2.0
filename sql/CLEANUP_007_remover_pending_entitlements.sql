-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_007_remover_pending_entitlements.sql
-- DESCRIÇÃO: Remover tabela pending_entitlements (duplicação de pending_plans)
-- ORDEM: 7ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover constraints
ALTER TABLE pending_entitlements
DROP CONSTRAINT IF EXISTS pending_entitlements_plan_id_fkey;

ALTER TABLE pending_entitlements
DROP CONSTRAINT IF EXISTS pending_entitlements_processed_by_user_id_fkey;

-- Passo 2: Deletar a tabela
DROP TABLE IF EXISTS pending_entitlements CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_008_remover_webhook_reprocess_history.sql
