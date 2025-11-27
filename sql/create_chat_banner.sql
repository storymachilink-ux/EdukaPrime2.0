-- ============================================
-- TABELA DE BANNER DO CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS chat_banner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  image_url TEXT,
  button_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir banner padrão vazio
INSERT INTO chat_banner (id, title, description, image_url, button_url, active)
VALUES ('00000000-0000-0000-0000-000000000001', '', '', '', '', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE chat_banner ENABLE ROW LEVEL SECURITY;

-- Service role acesso total
DROP POLICY IF EXISTS "chat_banner_service_all" ON chat_banner;
CREATE POLICY "chat_banner_service_all"
ON chat_banner FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos podem ler banner ativo
DROP POLICY IF EXISTS "chat_banner_public_select" ON chat_banner;
CREATE POLICY "chat_banner_public_select"
ON chat_banner FOR SELECT
TO authenticated, anon
USING (active = true);

-- Apenas admins podem gerenciar
DROP POLICY IF EXISTS "chat_banner_admin_all" ON chat_banner;
CREATE POLICY "chat_banner_admin_all"
ON chat_banner FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- ============================================
-- ✅ TABELA CRIADA
-- ============================================

SELECT '✅ Tabela chat_banner criada com sucesso!' as status;
