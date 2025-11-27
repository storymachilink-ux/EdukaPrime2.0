-- Criar tabela para rastrear pontos de chat dos usuários
CREATE TABLE IF NOT EXISTS user_chat_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS idx_user_chat_points_user_id ON user_chat_points(user_id);

-- RLS (Row Level Security)
ALTER TABLE user_chat_points ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios pontos
CREATE POLICY "Users can view own chat points"
  ON user_chat_points FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem atualizar apenas seus próprios pontos
CREATE POLICY "Users can update own chat points"
  ON user_chat_points FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Sistema pode inserir pontos
CREATE POLICY "System can insert chat points"
  ON user_chat_points FOR INSERT
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_chat_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_chat_points_updated_at
  BEFORE UPDATE ON user_chat_points
  FOR EACH ROW
  EXECUTE FUNCTION update_user_chat_points_updated_at();
