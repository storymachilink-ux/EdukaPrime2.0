-- ========================================
-- CORRIGIR POLÍTICAS DE DELETE
-- ========================================
-- Este script adiciona as políticas DELETE que estavam faltando
-- nas tabelas atividades, videos e bonus

-- ========================================
-- ATIVAR RLS NAS TABELAS (se não estiverem)
-- ========================================
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus ENABLE ROW LEVEL SECURITY;

-- ========================================
-- REMOVER POLÍTICAS ANTIGAS QUE PODEM CONFLITAR
-- ========================================
DROP POLICY IF EXISTS "Todos podem ler atividades" ON atividades;
DROP POLICY IF EXISTS "Todos podem ler videos" ON videos;
DROP POLICY IF EXISTS "Todos podem ler bonus" ON bonus;
DROP POLICY IF EXISTS "Admin can view all data" ON atividades;
DROP POLICY IF EXISTS "Admin can view all videos" ON videos;
DROP POLICY IF EXISTS "Admin can view all bonus" ON bonus;

-- ========================================
-- TABELA: atividades
-- ========================================

-- SELECT: Todos podem ler
CREATE POLICY "Select atividades - todos"
  ON atividades
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT: Apenas service_role (backend)
CREATE POLICY "Insert atividades - service_role"
  ON atividades
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: Apenas service_role (backend) ou admins
CREATE POLICY "Update atividades - service_role"
  ON atividades
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Update atividades - admins"
  ON atividades
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- DELETE: Apenas service_role (backend) ou admins
CREATE POLICY "Delete atividades - service_role"
  ON atividades
  FOR DELETE
  TO service_role
  USING (true);

CREATE POLICY "Delete atividades - admins"
  ON atividades
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ========================================
-- TABELA: videos
-- ========================================

-- SELECT: Todos podem ler
CREATE POLICY "Select videos - todos"
  ON videos
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT: Apenas service_role
CREATE POLICY "Insert videos - service_role"
  ON videos
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: Apenas service_role ou admins
CREATE POLICY "Update videos - service_role"
  ON videos
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Update videos - admins"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- DELETE: Apenas service_role ou admins
CREATE POLICY "Delete videos - service_role"
  ON videos
  FOR DELETE
  TO service_role
  USING (true);

CREATE POLICY "Delete videos - admins"
  ON videos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ========================================
-- TABELA: bonus
-- ========================================

-- SELECT: Todos podem ler
CREATE POLICY "Select bonus - todos"
  ON bonus
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT: Apenas service_role
CREATE POLICY "Insert bonus - service_role"
  ON bonus
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: Apenas service_role ou admins
CREATE POLICY "Update bonus - service_role"
  ON bonus
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Update bonus - admins"
  ON bonus
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- DELETE: Apenas service_role ou admins
CREATE POLICY "Delete bonus - service_role"
  ON bonus
  FOR DELETE
  TO service_role
  USING (true);

CREATE POLICY "Delete bonus - admins"
  ON bonus
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ========================================
-- VERIFICAÇÃO
-- ========================================
SELECT '✅ Políticas de DELETE corrigidas!' as status;
