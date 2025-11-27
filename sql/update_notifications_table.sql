-- Adicionar campos para notificações fixas/temporárias e expiração
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS days_to_expire INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all'; -- 'all', 'plan_1', 'plan_2', 'plan_3', 'specific_user'

-- Comentários
COMMENT ON COLUMN notifications.is_pinned IS 'Indica se a notificação é fixa (sempre visível até ser lida)';
COMMENT ON COLUMN notifications.expires_at IS 'Data e hora de expiração da notificação';
COMMENT ON COLUMN notifications.days_to_expire IS 'Número de dias até a notificação expirar (calculado a partir de created_at)';
COMMENT ON COLUMN notifications.is_active IS 'Indica se a notificação está ativa (não expirada)';
COMMENT ON COLUMN notifications.target_audience IS 'Público alvo: all, plan_1, plan_2, plan_3, ou specific_user';

-- Índice para notificações ativas
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_pinned ON notifications(is_pinned, is_active);

-- Função para desativar notificações expiradas automaticamente
CREATE OR REPLACE FUNCTION deactivate_expired_notifications()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_active = FALSE
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular expires_at baseado em days_to_expire
CREATE OR REPLACE FUNCTION set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.days_to_expire IS NOT NULL AND NEW.days_to_expire > 0 THEN
    NEW.expires_at := NEW.created_at + (NEW.days_to_expire || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_expires_at ON notifications;
CREATE TRIGGER trigger_set_expires_at
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_expires_at();
