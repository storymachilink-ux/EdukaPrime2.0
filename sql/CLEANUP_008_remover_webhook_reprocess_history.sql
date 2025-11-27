-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_008_remover_webhook_reprocess_history.sql
-- DESCRIÇÃO: Remover tabela webhook_reprocess_history (complexidade desnecessária)
-- ORDEM: 8ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover constraints
ALTER TABLE webhook_reprocess_history
DROP CONSTRAINT IF EXISTS webhook_reprocess_history_webhook_id_fkey;

ALTER TABLE webhook_reprocess_history
DROP CONSTRAINT IF EXISTS webhook_reprocess_history_processed_user_id_fkey;

-- Passo 2: Deletar a tabela
DROP TABLE IF EXISTS webhook_reprocess_history CASCADE;

-- ✅ Concluído
-- Próximo: Fazer limpeza das colunas inúteis em webhook_logs
