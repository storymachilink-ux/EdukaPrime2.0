-- Executar One Step

CREATE TABLE IF NOT EXISTS webhook_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES webhook_logs(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_detail JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_errors_webhook_id ON webhook_errors(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_created_at ON webhook_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_type ON webhook_errors(error_type);

COMMENT ON TABLE webhook_errors IS 'Registra todos os erros ocorridos durante processamento de webhooks';
COMMENT ON COLUMN webhook_errors.error_type IS 'Tipo de erro: validation, processing, database, etc';
COMMENT ON COLUMN webhook_errors.error_message IS 'Mensagem descritiva do erro';
COMMENT ON COLUMN webhook_errors.error_detail IS 'Detalhes técnicos adicionais em JSON';

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS processed_successfully BOOLEAN DEFAULT NULL;

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS processed_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS last_processed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS reprocess_attempts INTEGER DEFAULT 0;

ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_successfully
  ON webhook_logs(processed_successfully);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_user_id
  ON webhook_logs(processed_user_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_last_processed_at
  ON webhook_logs(last_processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_reprocess_attempts
  ON webhook_logs(reprocess_attempts);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_pending_reprocess
  ON webhook_logs(status, processed_successfully, last_processed_at)
  WHERE status IN ('pending', 'failed');

COMMENT ON COLUMN webhook_logs.processed_successfully IS 'true = processado com sucesso, false = falhou, NULL = ainda não tentou';
COMMENT ON COLUMN webhook_logs.processed_user_id IS 'ID do usuário que foi criado ou teve plano ativado por este webhook';
COMMENT ON COLUMN webhook_logs.last_processed_at IS 'Data/hora da última tentativa de processamento';
COMMENT ON COLUMN webhook_logs.reprocess_attempts IS 'Número de vezes que este webhook foi reprocessado';
COMMENT ON COLUMN webhook_logs.error_message IS 'Descrição breve do erro (se processed_successfully = false)';

CREATE TABLE IF NOT EXISTS webhook_reprocess_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES webhook_logs(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  triggered_by TEXT NOT NULL,
  result TEXT NOT NULL,
  processed_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_reprocess_history_webhook_id
  ON webhook_reprocess_history(webhook_id);

CREATE INDEX IF NOT EXISTS idx_webhook_reprocess_history_created_at
  ON webhook_reprocess_history(created_at DESC);

COMMENT ON TABLE webhook_reprocess_history IS 'Histórico de cada tentativa de reprocessar um webhook';
COMMENT ON COLUMN webhook_reprocess_history.triggered_by IS 'Quem disparou: manual, automatic, trigger';
COMMENT ON COLUMN webhook_reprocess_history.result IS 'Resultado: success, failed, pending';
