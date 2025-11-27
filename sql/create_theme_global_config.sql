-- ============================================
-- TABELA DE CONFIGURAÇÃO GLOBAL DE TEMAS
-- ============================================

CREATE TABLE IF NOT EXISTS theme_global_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allow_user_toggle BOOLEAN DEFAULT false,
  default_light_theme_slug VARCHAR(100),
  default_dark_theme_slug VARCHAR(100),
  fixed_global_theme_slug VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração padrão (singleton)
INSERT INTO theme_global_config (id, allow_user_toggle, default_light_theme_slug, default_dark_theme_slug, fixed_global_theme_slug)
VALUES ('00000000-0000-0000-0000-000000000003', false, null, null, null)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE theme_global_config ENABLE ROW LEVEL SECURITY;

-- Service role acesso total
DROP POLICY IF EXISTS "theme_global_config_service_all" ON theme_global_config;
CREATE POLICY "theme_global_config_service_all"
ON theme_global_config FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos podem ler configuração
DROP POLICY IF EXISTS "theme_global_config_public_select" ON theme_global_config;
CREATE POLICY "theme_global_config_public_select"
ON theme_global_config FOR SELECT
TO authenticated, anon
USING (true);

-- Apenas admins podem gerenciar
DROP POLICY IF EXISTS "theme_global_config_admin_all" ON theme_global_config;
CREATE POLICY "theme_global_config_admin_all"
ON theme_global_config FOR ALL
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

SELECT '✅ Tabela theme_global_config criada com sucesso!' as status;
