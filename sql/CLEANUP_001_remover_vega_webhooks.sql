-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_001_remover_vega_webhooks.sql
-- DESCRIÇÃO: Remover tabela vega_webhooks (redundante com webhook_logs)
-- ORDEM: 1ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- Passo 1: Remover constraints e foreign keys que referenciam essa tabela
ALTER TABLE vega_webhooks
DROP CONSTRAINT IF EXISTS vega_webhooks_user_id_fkey;

-- Passo 2: Deletar a tabela
DROP TABLE IF EXISTS vega_webhooks CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_002_remover_vega_webhook_logs.sql
