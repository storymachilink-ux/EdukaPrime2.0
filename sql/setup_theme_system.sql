-- ============================================
-- SETUP COMPLETO DO SISTEMA DE TEMAS GLOBAIS
-- ============================================

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS theme_global_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allow_user_toggle BOOLEAN DEFAULT false,
  default_light_theme_slug VARCHAR(100),
  default_dark_theme_slug VARCHAR(100),
  fixed_global_theme_slug VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Limpar dados antigos (para garantir setup limpo)
DELETE FROM theme_global_config WHERE id = '00000000-0000-0000-0000-000000000003';

-- 3. Inserir configuração padrão (singleton)
INSERT INTO theme_global_config (
  id,
  allow_user_toggle,
  default_light_theme_slug,
  default_dark_theme_slug,
  fixed_global_theme_slug
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  false,
  null,
  null,
  'default'
);

-- 4. Habilitar RLS
ALTER TABLE theme_global_config ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas
DROP POLICY IF EXISTS "theme_global_config_service_all" ON theme_global_config;
DROP POLICY IF EXISTS "theme_global_config_public_select" ON theme_global_config;
DROP POLICY IF EXISTS "theme_global_config_admin_all" ON theme_global_config;

-- 6. Criar políticas novas
-- Service role acesso total
CREATE POLICY "theme_global_config_service_all"
ON theme_global_config FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos podem ler (authenticated e anon)
CREATE POLICY "theme_global_config_public_select"
ON theme_global_config FOR SELECT
TO authenticated, anon
USING (true);

-- Apenas admins podem atualizar
CREATE POLICY "theme_global_config_admin_update"
ON theme_global_config FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- 7. Verificar se funcionou
SELECT
  '✅ Setup completo!' as status,
  id,
  fixed_global_theme_slug as tema_atual,
  updated_at
FROM theme_global_config
WHERE id = '00000000-0000-0000-0000-000000000003';
