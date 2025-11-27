-- Tabela para armazenar notificações do sistema
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Tipo de notificação
  type TEXT NOT NULL, -- 'badge', 'new_content', 'plan_expiring', 'plan_expired', 'system', 'achievement'

  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT, -- emoji ou nome do ícone

  -- Dados extras (JSON)
  metadata JSONB DEFAULT '{}',

  -- Link de ação
  action_url TEXT,
  action_label TEXT,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,

  -- Índices
  CONSTRAINT notifications_type_check CHECK (type IN ('badge', 'new_content', 'plan_expiring', 'plan_expired', 'system', 'achievement', 'download', 'video', 'bonus'))
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Comentários
COMMENT ON TABLE notifications IS 'Armazena todas as notificações do sistema para os usuários';
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação: badge, new_content, plan_expiring, etc';
COMMENT ON COLUMN notifications.metadata IS 'Dados extras em formato JSON (ex: badge_id, resource_id, etc)';
COMMENT ON COLUMN notifications.read IS 'Indica se a notificação foi lida';
