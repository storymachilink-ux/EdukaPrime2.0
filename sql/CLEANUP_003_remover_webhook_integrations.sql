-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_003_remover_webhook_integrations.sql
-- DESCRIÇÃO: Remover tabela webhook_integrations (não usada)
-- ORDEM: 3ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS webhook_integrations CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_004_remover_webhook_secrets.sql
