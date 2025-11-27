-- ============================================
-- CORREÇÃO: CHAT E VISUALIZAÇÃO DE USUÁRIOS
-- ============================================

-- ============================================
-- 1. TABELA users - Permitir ver outros usuários
-- ============================================

-- Adicionar política para ver dados básicos de outros usuários (nome, avatar)
DROP POLICY IF EXISTS "Ver dados públicos de usuários" ON users;
CREATE POLICY "Ver dados públicos de usuários"
ON users FOR SELECT
TO authenticated
USING (true);  -- Todos usuários autenticados podem ver dados básicos dos outros

-- ============================================
-- 2. TABELA chat_messages - Já tem RLS mas precisa policies
-- ============================================

-- Verificar se já existe e dropar
DROP POLICY IF EXISTS "Service role acesso total chat" ON chat_messages;
DROP POLICY IF EXISTS "Ver mensagens visíveis" ON chat_messages;

-- Service role acesso total
CREATE POLICY "Service role acesso total chat"
ON chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários com acesso ao chat podem ver mensagens
CREATE POLICY "Ver mensagens visíveis"
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
      LEFT JOIN chat_plan_access cpa ON u.plano_ativo = cpa.plano_id
      WHERE u.id = auth.uid()
      AND (cpa.chat_enabled = true OR cpa.chat_enabled IS NULL)
    )
  )
);

-- ============================================
-- 3. TABELA chat_user_stats - Permitir leitura
-- ============================================

DROP POLICY IF EXISTS "Service role acesso total stats" ON chat_user_stats;
DROP POLICY IF EXISTS "Ver estatísticas do chat" ON chat_user_stats;

-- Service role acesso total
CREATE POLICY "Service role acesso total stats"
ON chat_user_stats FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos com acesso ao chat podem ver stats
CREATE POLICY "Ver estatísticas do chat"
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
    LEFT JOIN chat_plan_access cpa ON u.plano_ativo = cpa.plano_id
    WHERE u.id = auth.uid()
    AND (cpa.chat_enabled = true OR cpa.chat_enabled IS NULL)
  )
);

-- ============================================
-- ✅ CORREÇÃO COMPLETA
-- ============================================

SELECT '✅ Chat e visualização de usuários corrigidos!' as status;
