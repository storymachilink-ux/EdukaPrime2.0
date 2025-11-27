-- ============================================
-- CORREÇÃO DE PERMISSÕES DO SISTEMA DE TICKETS
-- ============================================

-- 1. REMOVER POLÍTICAS ANTIGAS QUE VERIFICAM 'ROLE'
DROP POLICY IF EXISTS "Admins podem ver todos os tickets" ON tickets;
DROP POLICY IF EXISTS "Admins podem atualizar todos os tickets" ON tickets;
DROP POLICY IF EXISTS "Admins podem gerenciar respostas" ON ticket_responses;
DROP POLICY IF EXISTS "Apenas admins podem alterar configurações" ON ticket_settings;

-- 2. CRIAR NOVAS POLÍTICAS SEM VERIFICAÇÃO DE ROLE

-- TICKETS: Qualquer usuário autenticado pode ver todos os tickets (para área admin)
CREATE POLICY "Usuários autenticados podem ver todos os tickets"
  ON tickets FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- TICKETS: Qualquer usuário autenticado pode atualizar tickets (para área admin)
CREATE POLICY "Usuários autenticados podem atualizar tickets"
  ON tickets FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- TICKETS: Usuários podem excluir seus próprios tickets
CREATE POLICY "Usuários podem excluir seus próprios tickets"
  ON tickets FOR DELETE
  USING (auth.uid() = user_id);

-- TICKETS: Qualquer usuário autenticado pode excluir tickets (para área admin)
CREATE POLICY "Usuários autenticados podem excluir qualquer ticket"
  ON tickets FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- 3. TICKET_RESPONSES: Corrigir políticas

-- TICKET_RESPONSES: Qualquer usuário autenticado pode criar respostas
CREATE POLICY "Usuários autenticados podem criar respostas"
  ON ticket_responses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET_RESPONSES: Qualquer usuário autenticado pode ver todas as respostas
CREATE POLICY "Usuários autenticados podem ver respostas"
  ON ticket_responses FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- TICKET_RESPONSES: Qualquer usuário autenticado pode atualizar respostas
CREATE POLICY "Usuários autenticados podem atualizar respostas"
  ON ticket_responses FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- TICKET_RESPONSES: Qualquer usuário autenticado pode excluir respostas
CREATE POLICY "Usuários autenticados podem excluir respostas"
  ON ticket_responses FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- 4. TICKET_SETTINGS: Permitir qualquer usuário autenticado gerenciar

CREATE POLICY "Usuários autenticados podem alterar configurações"
  ON ticket_settings FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. MENSAGEM DE SUCESSO
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS dos tickets corrigidas com sucesso!';
  RAISE NOTICE '✅ Agora você pode:';
  RAISE NOTICE '   - Criar respostas em tickets';
  RAISE NOTICE '   - Excluir tickets (seus próprios ou qualquer um se autenticado)';
  RAISE NOTICE '   - Visualizar e gerenciar todos os tickets';
END $$;
