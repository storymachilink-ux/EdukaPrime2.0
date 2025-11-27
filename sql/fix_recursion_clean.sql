-- ============================================
-- LIMPEZA TOTAL E RECRIAÇÃO CORRETA
-- ============================================
-- Este script remove TODAS as políticas problemáticas
-- e cria versões limpas SEM recursão

-- ============================================
-- 1. LIMPAR TODAS AS POLÍTICAS DA TABELA users
-- ============================================

DROP POLICY IF EXISTS "Service role acesso total" ON users;
DROP POLICY IF EXISTS "Usuários autenticados podem ver dados" ON users;
DROP POLICY IF EXISTS "Anon pode ler para webhook" ON users;
DROP POLICY IF EXISTS "Usuários podem se criar" ON users;
DROP POLICY IF EXISTS "Usuários atualizam próprios dados" ON users;
DROP POLICY IF EXISTS "Admins atualizam todos" ON users;
DROP POLICY IF EXISTS "Ver dados públicos de usuários" ON users;

-- ============================================
-- 2. CRIAR POLÍTICAS SIMPLES SEM RECURSÃO - users
-- ============================================

-- Política 1: Service role tem acesso total (sistema interno)
CREATE POLICY "users_service_role_all"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política 2: Anon pode ler (para webhooks criarem usuários)
CREATE POLICY "users_anon_select"
ON users FOR SELECT
TO anon
USING (true);

-- Política 3: Anon pode inserir (para webhooks criarem usuários)
CREATE POLICY "users_anon_insert"
ON users FOR INSERT
TO anon
WITH CHECK (true);

-- Política 4: Autenticados podem ler TODOS os usuários (SEM subquery)
CREATE POLICY "users_auth_select"
ON users FOR SELECT
TO authenticated
USING (true);

-- Política 5: Autenticados podem inserir (criar conta)
CREATE POLICY "users_auth_insert"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política 6: Autenticados atualizam apenas seus dados
CREATE POLICY "users_auth_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. LIMPAR POLÍTICAS DO CHAT
-- ============================================

DROP POLICY IF EXISTS "Usuários podem ler mensagens visíveis do chat" ON chat_messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens no chat" ON chat_messages;
DROP POLICY IF EXISTS "Admins podem ver todas as mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Admins podem atualizar mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Service role acesso total chat" ON chat_messages;
DROP POLICY IF EXISTS "Ver mensagens visíveis" ON chat_messages;

-- ============================================
-- 4. CRIAR POLÍTICAS SIMPLES - chat_messages
-- ============================================

-- Service role acesso total
CREATE POLICY "chat_messages_service_all"
ON chat_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários autenticados podem VER mensagens visíveis (SEM verificar plano aqui)
CREATE POLICY "chat_messages_auth_select"
ON chat_messages FOR SELECT
TO authenticated
USING (is_visible = true AND deleted_at IS NULL);

-- Usuários autenticados podem ENVIAR mensagens (verificação de plano no frontend)
CREATE POLICY "chat_messages_auth_insert"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Apenas service role pode atualizar/deletar (admin usa service role no backend)
CREATE POLICY "chat_messages_service_update"
ON chat_messages FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "chat_messages_service_delete"
ON chat_messages FOR DELETE
TO service_role
USING (true);

-- ============================================
-- 5. LIMPAR POLÍTICAS - chat_user_stats
-- ============================================

DROP POLICY IF EXISTS "Todos podem ver estatísticas do chat" ON chat_user_stats;
DROP POLICY IF EXISTS "Sistema pode gerenciar estatísticas" ON chat_user_stats;
DROP POLICY IF EXISTS "Admins podem atualizar pontos" ON chat_user_stats;
DROP POLICY IF EXISTS "Service role acesso total stats" ON chat_user_stats;
DROP POLICY IF EXISTS "Ver estatísticas do chat" ON chat_user_stats;

-- ============================================
-- 6. CRIAR POLÍTICAS SIMPLES - chat_user_stats
-- ============================================

-- Service role acesso total
CREATE POLICY "chat_stats_service_all"
ON chat_user_stats FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos autenticados podem VER stats
CREATE POLICY "chat_stats_auth_select"
ON chat_user_stats FOR SELECT
TO authenticated
USING (true);

-- Usuários podem inserir/atualizar suas próprias stats
CREATE POLICY "chat_stats_auth_upsert"
ON chat_user_stats FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 7. POLÍTICAS - chat_plan_access
-- ============================================

DROP POLICY IF EXISTS "Admins podem gerenciar acesso ao chat" ON chat_plan_access;
DROP POLICY IF EXISTS "Todos podem ler configurações do chat" ON chat_plan_access;

-- Service role acesso total
CREATE POLICY "chat_plan_service_all"
ON chat_plan_access FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Todos podem LER configurações
CREATE POLICY "chat_plan_auth_select"
ON chat_plan_access FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- ✅ LIMPEZA E RECRIAÇÃO COMPLETA
-- ============================================

SELECT '✅ Políticas recriadas sem recursão! Teste agora.' as status;
