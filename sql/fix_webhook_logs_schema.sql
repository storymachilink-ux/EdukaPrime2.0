/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔧 FIX: Adicionar colunas faltantes em webhook_logs
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * O webhook-unificada-v2 tenta inserir dados em colunas que não existem
 * na tabela webhook_logs. Este SQL adiciona as colunas faltantes.
 *
 * Colunas que faltam:
 * - platform (TEXT) - Identifica a plataforma (vega, ggcheckout, amplopay)
 * - transaction_id (TEXT) - ID da transação no gateway de pagamento
 * - processed_at (TIMESTAMP) - Data/hora de processamento
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- Adicionar coluna platform se não existir
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS platform TEXT;

-- Adicionar coluna transaction_id se não existir
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Adicionar coluna processed_at se não existir
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_webhook_logs_platform ON webhook_logs(platform);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction ON webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed_at);

-- Adicionar comentários
COMMENT ON COLUMN webhook_logs.platform IS 'Plataforma de origem: vega, ggcheckout, amplopay, unknown';
COMMENT ON COLUMN webhook_logs.transaction_id IS 'ID da transação fornecido pelo gateway de pagamento';
COMMENT ON COLUMN webhook_logs.processed_at IS 'Data/hora quando o webhook foi processado';

-- Verificação final
DO $$
BEGIN
  RAISE NOTICE '✅ Schema de webhook_logs atualizado com sucesso!';
  RAISE NOTICE '📋 Colunas adicionadas:';
  RAISE NOTICE '   • platform (TEXT)';
  RAISE NOTICE '   • transaction_id (TEXT)';
  RAISE NOTICE '   • processed_at (TIMESTAMP)';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Os webhooks agora podem ser inseridos corretamente!';
END $$;
