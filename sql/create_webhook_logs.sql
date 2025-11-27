/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 TABELA DE LOGS DE WEBHOOKS DO CHECKOUT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Esta tabela registra TODOS os webhooks recebidos do GGCheckout.
 * Útil para:
 * - Auditoria de ativações de planos
 * - Debug de problemas
 * - Relatórios de vendas
 * - Rastreamento de pagamentos
 *
 * Execute este SQL no Supabase SQL Editor ANTES de ativar o webhook.
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- Criar tabela de logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Dados do evento
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,

  -- Dados do cliente
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_document TEXT,
  customer_phone TEXT,

  -- Dados do produto/plano
  product_id TEXT NOT NULL,
  plan_activated INTEGER,
  plan_name TEXT,
  expiration_date TIMESTAMP WITH TIME ZONE,

  -- Dados do pagamento
  payment_id TEXT,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,

  -- Payload completo (para debug)
  raw_payload JSONB NOT NULL
);

-- Comentários nas colunas
COMMENT ON TABLE webhook_logs IS 'Registros de todos os webhooks recebidos do GGCheckout';
COMMENT ON COLUMN webhook_logs.event_type IS 'Tipo do evento: pix.paid, card.paid, pix.generated, etc';
COMMENT ON COLUMN webhook_logs.status IS 'Status do processamento: success, error, ignored';
COMMENT ON COLUMN webhook_logs.message IS 'Mensagem de sucesso ou erro';
COMMENT ON COLUMN webhook_logs.customer_email IS 'Email do cliente que comprou';
COMMENT ON COLUMN webhook_logs.product_id IS 'ID do produto no GGCheckout';
COMMENT ON COLUMN webhook_logs.plan_activated IS 'Número do plano ativado (1=Essencial, 2=Evoluir, 3=Prime)';
COMMENT ON COLUMN webhook_logs.payment_method IS 'Método de pagamento (pix.paid, card.paid)';
COMMENT ON COLUMN webhook_logs.amount IS 'Valor pago em centavos';
COMMENT ON COLUMN webhook_logs.raw_payload IS 'JSON completo enviado pelo GGCheckout';

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON webhook_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_product ON webhook_logs(product_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver os logs
CREATE POLICY "Apenas admins podem ver logs de webhooks"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Política: Ninguém pode inserir manualmente (só via service role key)
CREATE POLICY "Ninguém pode inserir manualmente"
  ON webhook_logs FOR INSERT
  WITH CHECK (false);

-- Política: Ninguém pode atualizar
CREATE POLICY "Ninguém pode atualizar logs"
  ON webhook_logs FOR UPDATE
  USING (false);

-- Política: Ninguém pode deletar
CREATE POLICY "Ninguém pode deletar logs"
  ON webhook_logs FOR DELETE
  USING (false);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela webhook_logs criada com sucesso!';
  RAISE NOTICE '📊 Logs de webhooks do GGCheckout serão registrados aqui';
  RAISE NOTICE '🔒 RLS ativado: Apenas admins podem visualizar';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Próximo passo: Deploy da Edge Function';
END $$;
