-- Tabela para armazenar badges conquistadas pelos usuários
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Garantir que um usuário não ganhe a mesma badge duas vezes
  UNIQUE(user_id, badge_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Comentários
COMMENT ON TABLE user_badges IS 'Armazena as badges/conquistas ganhas pelos usuários';
COMMENT ON COLUMN user_badges.badge_id IS 'ID da badge do sistema (ex: first_download, completed_10, etc)';
COMMENT ON COLUMN user_badges.earned_at IS 'Data e hora em que a badge foi conquistada';
