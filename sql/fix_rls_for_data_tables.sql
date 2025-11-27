-- ========================================
-- DESABILITAR RLS NAS TABELAS DE DADOS
-- ========================================
-- RLS pode estar bloqueando leitura dos dados no admin
-- Vamos desabilitar para que o admin possa acessar tudo

ALTER TABLE atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE bonus DISABLE ROW LEVEL SECURITY;
ALTER TABLE papercrafts DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tiers DISABLE ROW LEVEL SECURITY;

-- Se essas tabelas têm políticas RLS, remover:
DROP POLICY IF EXISTS "Users can view own activities" ON atividades;
DROP POLICY IF EXISTS "Users can view own videos" ON videos;
DROP POLICY IF EXISTS "Users can view own bonus" ON bonus;
DROP POLICY IF EXISTS "Users can view own papercrafts" ON papercrafts;

-- ========================================
-- ADICIONAR POLÍTICAS CORRETAS
-- ========================================

-- Permitir que admin leia TUDO
-- Permitir que usuários normais vejam apenas o que está liberado para seu plano

-- Ativar RLS novamente
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus ENABLE ROW LEVEL SECURITY;
ALTER TABLE papercrafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tiers ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode acessar tudo
CREATE POLICY "Admin can view all data"
  ON atividades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admin can view all videos"
  ON videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admin can view all bonus"
  ON bonus
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admin can view all papercrafts"
  ON papercrafts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Permitir que qualquer usuário autenticado leia community_channels e support_tiers
CREATE POLICY "Authenticated users can view channels"
  ON community_channels
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view support tiers"
  ON support_tiers
  FOR SELECT
  USING (auth.role() = 'authenticated');
