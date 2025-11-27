-- ===== SISTEMA DE CHAT + RANKING =====
--
-- 🔒 CONTROLE DE ACESSO POR PLANO:
-- O chat verifica automaticamente se o plano do usuário tem acesso habilitado
-- através da tabela chat_plan_access. Admins sempre têm acesso total.
-- IMPORTANTE: Execute chat_plan_access.sql ANTES deste arquivo!

-- 1. Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_visible BOOLEAN DEFAULT true,
  CONSTRAINT message_not_empty CHECK (message_text IS NOT NULL OR image_url IS NOT NULL)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_visible ON chat_messages(is_visible) WHERE is_visible = true;

COMMENT ON TABLE chat_messages IS 'Mensagens do chat do Grupo EdukaPrime';
COMMENT ON COLUMN chat_messages.message_text IS 'Texto da mensagem (opcional se tiver imagem)';
COMMENT ON COLUMN chat_messages.image_url IS 'URL da imagem anexada (opcional)';
COMMENT ON COLUMN chat_messages.deleted_at IS 'Data de exclusão (soft delete)';
COMMENT ON COLUMN chat_messages.is_visible IS 'Se a mensagem está visível (false quando admin deleta)';

-- 2. Tabela de estatísticas dos usuários no chat
CREATE TABLE IF NOT EXISTS chat_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user_stats_points ON chat_user_stats(total_points DESC);

COMMENT ON TABLE chat_user_stats IS 'Estatísticas e pontos dos usuários no chat';
COMMENT ON COLUMN chat_user_stats.total_points IS 'Total de pontos acumulados (10 pontos por mensagem)';
COMMENT ON COLUMN chat_user_stats.last_message_at IS 'Última vez que enviou mensagem (rate limit de 1 minuto)';

-- 3. Criar bucket para imagens do chat
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de acesso para chat_messages

-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem ler mensagens visíveis do chat" ON chat_messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens no chat" ON chat_messages;
DROP POLICY IF EXISTS "Admins podem ver todas as mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Admins podem atualizar mensagens" ON chat_messages;

-- Política: Usuários com plano permitido podem ler mensagens visíveis
CREATE POLICY "Usuários podem ler mensagens visíveis do chat"
ON chat_messages FOR SELECT
TO authenticated
USING (
  is_visible = true AND deleted_at IS NULL AND (
    -- Admin sempre tem acesso
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
    OR
    -- Usuário tem plano com chat habilitado
    EXISTS (
      SELECT 1 FROM users u
      JOIN chat_plan_access cpa ON u.plano_ativo = cpa.plano_id
      WHERE u.id = auth.uid()
      AND cpa.chat_enabled = true
    )
  )
);

-- Política: Usuários com plano permitido podem enviar mensagens
CREATE POLICY "Usuários podem enviar mensagens no chat"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    -- Admin sempre pode enviar
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
    OR
    -- Usuário tem plano com chat habilitado
    EXISTS (
      SELECT 1 FROM users u
      JOIN chat_plan_access cpa ON u.plano_ativo = cpa.plano_id
      WHERE u.id = auth.uid()
      AND cpa.chat_enabled = true
    )
  )
);

-- Política: Admins podem ver todas as mensagens (incluindo deletadas)
CREATE POLICY "Admins podem ver todas as mensagens"
ON chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Política: Admins podem atualizar mensagens (soft delete)
CREATE POLICY "Admins podem atualizar mensagens"
ON chat_messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- 5. Políticas de acesso para chat_user_stats

-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Todos podem ver estatísticas do chat" ON chat_user_stats;
DROP POLICY IF EXISTS "Sistema pode gerenciar estatísticas" ON chat_user_stats;
DROP POLICY IF EXISTS "Admins podem atualizar pontos" ON chat_user_stats;

-- Política: Usuários com acesso ao chat podem ver estatísticas
CREATE POLICY "Todos podem ver estatísticas do chat"
ON chat_user_stats FOR SELECT
TO authenticated
USING (
  -- Admin sempre tem acesso
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
  OR
  -- Usuário tem plano com chat habilitado
  EXISTS (
    SELECT 1 FROM users u
    JOIN chat_plan_access cpa ON u.plano_ativo = cpa.plano_id
    WHERE u.id = auth.uid()
    AND cpa.chat_enabled = true
  )
);

-- Política: Sistema pode criar/atualizar estatísticas
CREATE POLICY "Sistema pode gerenciar estatísticas"
ON chat_user_stats FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Admins podem atualizar pontos manualmente
CREATE POLICY "Admins podem atualizar pontos"
ON chat_user_stats FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- 6. Políticas de storage para imagens do chat

-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens no chat" ON storage.objects;
DROP POLICY IF EXISTS "Imagens do chat são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar imagens do chat" ON storage.objects;

-- Política: Usuários com plano permitido podem fazer upload
CREATE POLICY "Usuários podem fazer upload de imagens no chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-images' AND
  (storage.foldername(name))[1] = auth.uid()::text AND (
    -- Admin sempre pode fazer upload
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
    OR
    -- Usuário tem plano com chat habilitado
    EXISTS (
      SELECT 1 FROM users u
      JOIN chat_plan_access cpa ON u.plano_ativo = cpa.plano_id
      WHERE u.id = auth.uid()
      AND cpa.chat_enabled = true
    )
  )
);

-- Política: Leitura pública das imagens
CREATE POLICY "Imagens do chat são publicamente acessíveis"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Política: Admins podem deletar imagens
CREATE POLICY "Admins podem deletar imagens do chat"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_chat_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_stats_updated_at
BEFORE UPDATE ON chat_user_stats
FOR EACH ROW
EXECUTE FUNCTION update_chat_stats_updated_at();

-- 8. Função para criar estatística automaticamente quando usuário envia primeira mensagem
CREATE OR REPLACE FUNCTION create_chat_stats_on_first_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_user_stats (user_id, total_points, last_message_at)
  VALUES (NEW.user_id, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_stats_on_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION create_chat_stats_on_first_message();

-- 9. Habilitar Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_user_stats ENABLE ROW LEVEL SECURITY;

-- Sucesso!
SELECT '✅ Sistema de chat criado com sucesso!' as status;
