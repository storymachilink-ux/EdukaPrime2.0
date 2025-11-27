-- ============================================
-- TABELA DE AVATAR POPUP FLUTUANTE
-- ============================================

CREATE TABLE IF NOT EXISTS avatar_popup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_image_url TEXT,
  message_text TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT false,
  show_on_first_visit BOOLEAN DEFAULT false,
  has_border BOOLEAN DEFAULT false,
  border_color VARCHAR(50) DEFAULT 'transparent',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração padrão vazia
INSERT INTO avatar_popup (id, avatar_image_url, message_text, link_url, is_active, show_on_first_visit, has_border, border_color)
VALUES ('00000000-0000-0000-0000-000000000002', '', '', '', false, false, false, 'transparent')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE avatar_popup ENABLE ROW LEVEL SECURITY;

-- Service role acesso total
DROP POLICY IF EXISTS "avatar_popup_service_all" ON avatar_popup;
CREATE POLICY "avatar_popup_service_all"
ON avatar_popup FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos podem ler avatar ativo
DROP POLICY IF EXISTS "avatar_popup_public_select" ON avatar_popup;
CREATE POLICY "avatar_popup_public_select"
ON avatar_popup FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Apenas admins podem gerenciar
DROP POLICY IF EXISTS "avatar_popup_admin_all" ON avatar_popup;
CREATE POLICY "avatar_popup_admin_all"
ON avatar_popup FOR ALL
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

SELECT '✅ Tabela avatar_popup criada com sucesso!' as status;
