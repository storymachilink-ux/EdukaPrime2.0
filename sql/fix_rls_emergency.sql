-- ============================================
-- CORREÇÃO EMERGENCIAL - RLS POLÍTICAS
-- ============================================
-- Execute IMEDIATAMENTE para restaurar o acesso

-- ============================================
-- TABELA: users - CORREÇÃO CRÍTICA
-- ============================================

-- REMOVER políticas antigas que estão bloqueando
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON users;
DROP POLICY IF EXISTS "Sistema pode inserir usuários" ON users;
DROP POLICY IF EXISTS "Usuários podem atualizar seus dados" ON users;
DROP POLICY IF EXISTS "Admins podem atualizar usuários" ON users;

-- CRIAR políticas corretas que funcionam com service_role

-- Política 1: Permitir service_role fazer tudo
CREATE POLICY "Service role acesso total"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política 2: Usuários autenticados veem seus dados OU dados públicos
CREATE POLICY "Usuários autenticados podem ver dados"
ON users FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_admin = true
  )
);

-- Política 3: Permitir leitura para anon (webhook precisa)
CREATE POLICY "Anon pode ler para webhook"
ON users FOR SELECT
TO anon
USING (true);

-- Política 4: Usuários podem se inserir
CREATE POLICY "Usuários podem se criar"
ON users FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Política 5: Usuários podem atualizar seus dados
CREATE POLICY "Usuários atualizam próprios dados"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política 6: Admins podem atualizar todos
CREATE POLICY "Admins atualizam todos"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_admin = true
  )
);

-- ============================================
-- TABELA: atividades - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Todos podem ler atividades" ON atividades;
CREATE POLICY "Todos podem ler atividades"
ON atividades FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- TABELA: videos - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Todos podem ler videos" ON videos;
CREATE POLICY "Todos podem ler videos"
ON videos FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- TABELA: bonus - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Todos podem ler bonus" ON bonus;
CREATE POLICY "Todos podem ler bonus"
ON bonus FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- TABELA: user_progress - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ver seu progresso" ON user_progress;
DROP POLICY IF EXISTS "Admins podem ver todo progresso" ON user_progress;
DROP POLICY IF EXISTS "Usuários podem criar progresso" ON user_progress;
DROP POLICY IF EXISTS "Usuários podem atualizar progresso" ON user_progress;

-- Service role acesso total
CREATE POLICY "Service role acesso total user_progress"
ON user_progress FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários veem seu progresso
CREATE POLICY "Ver próprio progresso"
ON user_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Usuários gerenciam seu progresso
CREATE POLICY "Gerenciar próprio progresso"
ON user_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- TABELA: user_badges - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Todos podem ver badges" ON user_badges;
DROP POLICY IF EXISTS "Sistema pode criar badges" ON user_badges;
DROP POLICY IF EXISTS "Admins podem gerenciar badges" ON user_badges;

-- Service role acesso total
CREATE POLICY "Service role acesso total badges"
ON user_badges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos veem badges
CREATE POLICY "Ver badges"
ON user_badges FOR SELECT
TO authenticated, anon
USING (true);

-- Usuários criam seus badges
CREATE POLICY "Criar próprios badges"
ON user_badges FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- TABELA: notifications - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ver notificações" ON notifications;
DROP POLICY IF EXISTS "Admins podem ver todas notificações" ON notifications;
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários podem deletar notificações" ON notifications;

-- Service role acesso total
CREATE POLICY "Service role acesso total notif"
ON notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários veem suas notificações
CREATE POLICY "Ver próprias notificações"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Sistema cria notificações
CREATE POLICY "Criar notificações"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Usuários atualizam suas notificações
CREATE POLICY "Atualizar próprias notificações"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Usuários deletam suas notificações
CREATE POLICY "Deletar próprias notificações"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- TABELA: broadcast_notifications - CORREÇÃO
-- ============================================

DROP POLICY IF EXISTS "Todos podem ver broadcast" ON broadcast_notifications;
DROP POLICY IF EXISTS "Admins podem criar broadcast" ON broadcast_notifications;
DROP POLICY IF EXISTS "Admins podem gerenciar broadcast" ON broadcast_notifications;

-- Service role acesso total
CREATE POLICY "Service role acesso total broadcast"
ON broadcast_notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos veem broadcasts
CREATE POLICY "Ver broadcasts"
ON broadcast_notifications FOR SELECT
TO authenticated, anon
USING (true);

-- Admins criam broadcasts
CREATE POLICY "Admins criam broadcast"
ON broadcast_notifications FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
));

-- ============================================
-- TABELA: broadcast_notification_reads
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ver leituras" ON broadcast_notification_reads;
DROP POLICY IF EXISTS "Admins podem ver todas leituras" ON broadcast_notification_reads;
DROP POLICY IF EXISTS "Usuários podem marcar leitura" ON broadcast_notification_reads;

-- Service role acesso total
CREATE POLICY "Service role acesso total reads"
ON broadcast_notification_reads FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários veem suas leituras
CREATE POLICY "Ver próprias leituras"
ON broadcast_notification_reads FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Usuários marcam leitura
CREATE POLICY "Marcar leitura"
ON broadcast_notification_reads FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- TABELA: user_activity_logs
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ver atividades" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins podem ver todas atividades" ON user_activity_logs;
DROP POLICY IF EXISTS "Sistema pode criar logs" ON user_activity_logs;

-- Service role acesso total
CREATE POLICY "Service role acesso total logs"
ON user_activity_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários veem seus logs
CREATE POLICY "Ver próprios logs"
ON user_activity_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Sistema cria logs
CREATE POLICY "Criar logs"
ON user_activity_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- TABELA: user_plan_history
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ver histórico" ON user_plan_history;
DROP POLICY IF EXISTS "Admins podem ver todo histórico" ON user_plan_history;
DROP POLICY IF EXISTS "Sistema pode criar histórico" ON user_plan_history;

-- Service role acesso total
CREATE POLICY "Service role acesso total history"
ON user_plan_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários veem seu histórico
CREATE POLICY "Ver próprio histórico"
ON user_plan_history FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Sistema cria histórico
CREATE POLICY "Criar histórico"
ON user_plan_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- ✅ CORREÇÃO EMERGENCIAL COMPLETA
-- ============================================

SELECT '✅ Políticas corrigidas! O site deve voltar a funcionar.' as status;
