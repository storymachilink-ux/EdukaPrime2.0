-- Criar tabela de notificações broadcast (universais)
CREATE TABLE IF NOT EXISTS broadcast_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '📢',
  button_color TEXT DEFAULT 'blue',
  action_url TEXT,
  action_label TEXT,
  target_audience TEXT DEFAULT 'all', -- 'all', 'plan_1', 'plan_2', 'plan_3'
  is_pinned BOOLEAN DEFAULT FALSE,
  days_to_expire INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tabela para rastrear leitura individual de broadcasts
CREATE TABLE IF NOT EXISTS broadcast_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES broadcast_notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(broadcast_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_broadcast_active ON broadcast_notifications(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_audience ON broadcast_notifications(target_audience, is_active);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user ON broadcast_notification_reads(user_id, broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast ON broadcast_notification_reads(broadcast_id);

-- Comentários
COMMENT ON TABLE broadcast_notifications IS 'Notificações universais enviadas para múltiplos usuários';
COMMENT ON TABLE broadcast_notification_reads IS 'Rastreamento de leitura individual de broadcasts';
COMMENT ON COLUMN broadcast_notifications.button_color IS 'Cor do botão de ação: blue, green, purple, orange, red, pink, yellow';
COMMENT ON COLUMN broadcast_notifications.target_audience IS 'Público alvo: all, plan_1, plan_2, plan_3';

-- Trigger para calcular expires_at baseado em days_to_expire
CREATE OR REPLACE FUNCTION set_broadcast_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.days_to_expire IS NOT NULL AND NEW.days_to_expire > 0 THEN
    NEW.expires_at := NEW.created_at + (NEW.days_to_expire || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_broadcast_expires_at ON broadcast_notifications;
CREATE TRIGGER trigger_set_broadcast_expires_at
  BEFORE INSERT OR UPDATE ON broadcast_notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_broadcast_expires_at();

-- Função para desativar broadcasts expirados
CREATE OR REPLACE FUNCTION deactivate_expired_broadcasts()
RETURNS void AS $$
BEGIN
  UPDATE broadcast_notifications
  SET is_active = FALSE
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para contar usuários que devem receber o broadcast
CREATE OR REPLACE FUNCTION count_broadcast_recipients(audience TEXT)
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  IF audience = 'all' THEN
    SELECT COUNT(*) INTO user_count FROM users;
  ELSIF audience = 'plan_1' THEN
    SELECT COUNT(*) INTO user_count FROM users WHERE plano_ativo = 1;
  ELSIF audience = 'plan_2' THEN
    SELECT COUNT(*) INTO user_count FROM users WHERE plano_ativo = 2;
  ELSIF audience = 'plan_3' THEN
    SELECT COUNT(*) INTO user_count FROM users WHERE plano_ativo = 3;
  ELSE
    user_count := 0;
  END IF;

  RETURN user_count;
END;
$$ LANGUAGE plpgsql;

-- Função para contar quantos usuários já leram o broadcast
CREATE OR REPLACE FUNCTION count_broadcast_reads(broadcast_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  read_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO read_count
  FROM broadcast_notification_reads
  WHERE broadcast_id = broadcast_id_param;

  RETURN read_count;
END;
$$ LANGUAGE plpgsql;
