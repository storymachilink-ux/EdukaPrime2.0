-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_004_remover_webhook_secrets.sql
-- DESCRIÇÃO: Remover tabela webhook_secrets (não usamos validação de signature)
-- ORDEM: 4ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS webhook_secrets CASCADE;

-- ✅ Concluído
-- Próximo: Execute CLEANUP_005_remover_webhook_errors.sql
