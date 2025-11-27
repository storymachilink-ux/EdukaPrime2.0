-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: 004_ajustar_webhook_logs.sql
-- DESCRIÇÃO: Adicionar colunas e índices em webhook_logs
-- ORDEM: Executar QUARTO (último)
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- ADICIONAR COLUNAS FALTANTES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- CRIAR ÍNDICES PARA BUSCAS RÁPIDAS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_webhook_logs_status
ON webhook_logs(status);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_platform
ON webhook_logs(platform);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at
ON webhook_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_email
ON webhook_logs(customer_email);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id
ON webhook_logs(transaction_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE webhook_logs IS 'Log de webhooks recebidos de Vega, GGCheckout e Amplopay';
COMMENT ON COLUMN webhook_logs.status IS 'received, success, pending, failed';
COMMENT ON COLUMN webhook_logs.platform IS 'vega, ggcheckout, amplopay';
COMMENT ON COLUMN webhook_logs.processed_at IS 'Data/hora quando o webhook foi processado';
COMMENT ON COLUMN webhook_logs.notes IS 'Notas adicionais sobre o processamento (erros, detalhes, etc)';

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ SETUP COMPLETO!
-- Todos os 4 arquivos foram executados com sucesso.
-- A webhook-unificada está pronta para receber payloads de Vega, GGCheckout e Amplopay.
-- ═══════════════════════════════════════════════════════════════════════════
