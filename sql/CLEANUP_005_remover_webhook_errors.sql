-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_005_remover_webhook_errors.sql
-- DESCRIÇÃO: Remover tabela webhook_errors (info já está em webhook_logs.notes)
-- ORDEM: 5ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover constraint que referencia webhook_logs
ALTER TABLE webhook_errors
DROP CONSTRAINT IF EXISTS webhook_errors_webhook_id_fkey;

-- Passo 2: Deletar a tabela
DROP TABLE IF EXISTS webhook_errors CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_006_remover_webhooks.sql
