/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 0: Preparação para Sistema de Webhooks Robusto
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Cria tabela webhook_errors e adiciona colunas essenciais em webhook_logs
 * para rastreamento de processamento e auditoria.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CRIAR TABELA webhook_errors
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS webhook_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhook_logs(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_detail JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_errors_webhook_id ON webhook_errors(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_created_at ON webhook_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_type ON webhook_errors(error_type);

-- Comentários
COMMENT ON TABLE webhook_errors IS 'Registra todos os erros ocorridos durante processamento de webhooks';
COMMENT ON COLUMN webhook_errors.error_type IS 'Tipo de erro: validation, processing, database, etc';
COMMENT ON COLUMN webhook_errors.error_message IS 'Mensagem descritiva do erro';
COMMENT ON COLUMN webhook_errors.error_detail IS 'Detalhes técnicos adicionais em JSON';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ADICIONAR COLUNAS EM webhook_logs (tracking de processamento)
-- ═══════════════════════════════════════════════════════════════════════════

-- Indica se o webhook foi processado com sucesso
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS processed_successfully BOOLEAN DEFAULT NULL;

-- ID do usuário que foi impactado (criado ou teve plano ativado)
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS processed_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Timestamp da última tentativa de processamento
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS last_processed_at TIMESTAMP WITH TIME ZONE;

-- Contador de tentativas de reprocessamento
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS reprocess_attempts INTEGER DEFAULT 0;

-- Mensagem de erro (se falhou)
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CRIAR ÍNDICES PARA NOVAS COLUNAS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_successfully
  ON webhook_logs(processed_successfully);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_user_id
  ON webhook_logs(processed_user_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_last_processed_at
  ON webhook_logs(last_processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_reprocess_attempts
  ON webhook_logs(reprocess_attempts);

-- Índice composto útil para encontrar webhooks pendentes que precisam reprocessamento
CREATE INDEX IF NOT EXISTS idx_webhook_logs_pending_reprocess
  ON webhook_logs(status, processed_successfully, last_processed_at)
  WHERE status IN ('pending', 'failed');

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ADICIONAR COMENTÁRIOS NAS NOVAS COLUNAS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN webhook_logs.processed_successfully IS 'true = processado com sucesso, false = falhou, NULL = ainda não tentou';
COMMENT ON COLUMN webhook_logs.processed_user_id IS 'ID do usuário que foi criado ou teve plano ativado por este webhook';
COMMENT ON COLUMN webhook_logs.last_processed_at IS 'Data/hora da última tentativa de processamento';
COMMENT ON COLUMN webhook_logs.reprocess_attempts IS 'Número de vezes que este webhook foi reprocessado';
COMMENT ON COLUMN webhook_logs.error_message IS 'Descrição breve do erro (se processed_successfully = false)';

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. CRIAR TABELA webhook_reprocess_history (para FASE 2)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS webhook_reprocess_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES webhook_logs(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  triggered_by TEXT NOT NULL, -- 'manual', 'automatic', 'trigger'
  result TEXT NOT NULL, -- 'success', 'failed', 'pending'
  processed_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_reprocess_history_webhook_id
  ON webhook_reprocess_history(webhook_id);

CREATE INDEX IF NOT EXISTS idx_webhook_reprocess_history_created_at
  ON webhook_reprocess_history(created_at DESC);

COMMENT ON TABLE webhook_reprocess_history IS 'Histórico de cada tentativa de reprocessar um webhook';
COMMENT ON COLUMN webhook_reprocess_history.triggered_by IS 'Quem disparou o reprocessamento: manual (usuário), automatic (trigger), trigger (postgres trigger)';
COMMENT ON COLUMN webhook_reprocess_history.result IS 'Resultado da tentativa: success, failed, ou pending';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║          ✅ FASE 0 - PREPARAÇÃO CONCLUÍDA!               ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tabelas Criadas:';
  RAISE NOTICE '   • webhook_errors (rastreamento de erros)';
  RAISE NOTICE '   • webhook_reprocess_history (histórico de reprocessamentos)';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Colunas Adicionadas em webhook_logs:';
  RAISE NOTICE '   • processed_successfully (Boolean)';
  RAISE NOTICE '   • processed_user_id (UUID FK)';
  RAISE NOTICE '   • last_processed_at (Timestamp)';
  RAISE NOTICE '   • reprocess_attempts (Integer)';
  RAISE NOTICE '   • error_message (Text)';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Índices Criados:';
  RAISE NOTICE '   • webhook_errors (webhook_id, created_at, error_type)';
  RAISE NOTICE '   • webhook_logs (processed_successfully, processed_user_id, etc)';
  RAISE NOTICE '';
  RAISE NOTICE '⏭️  Próximo: FASE 1.1 - Adicionar validação de dados';
  RAISE NOTICE '';
END $$;
