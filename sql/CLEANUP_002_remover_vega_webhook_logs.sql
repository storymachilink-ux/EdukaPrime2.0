-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_002_remover_vega_webhook_logs.sql
-- DESCRIÇÃO: Remover tabela vega_webhook_logs (redundante com webhook_logs)
-- ORDEM: 2ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover constraints
ALTER TABLE vega_webhook_logs
DROP CONSTRAINT IF EXISTS vega_webhook_logs_user_id_fkey;

-- Passo 2: Deletar a tabela
DROP TABLE IF EXISTS vega_webhook_logs CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_003_remover_webhook_integrations.sql
