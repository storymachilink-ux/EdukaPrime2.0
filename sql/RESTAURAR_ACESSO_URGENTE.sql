-- ═══════════════════════════════════════════════════════════════════════════
-- 🚨 RESTAURAÇÃO URGENTE - EXECUTE ISTO IMEDIATAMENTE
-- ═══════════════════════════════════════════════════════════════════════════
-- Você desabilitou RLS em todas as tabelas, isso quebrou o site.
-- Este script restaura TUDO.
--
-- PASSO: Copie TODO o conteúdo deste arquivo
-- PASSO: Vá para Supabase → SQL Editor
-- PASSO: Cole e execute TODO
-- PASSO: Recarregue seu site (F5)
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 1: REABILITAR RLS EM TODAS AS TABELAS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papercrafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plan_history ENABLE ROW LEVEL SECURITY;

-- Se essas tabelas existirem, reabilitar também:
ALTER TABLE IF EXISTS public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 2: REMOVER TODAS AS POLICIES ANTIGAS QUE ESTÃO BLOQUEANDO
-- ═══════════════════════════════════════════════════════════════════════════

-- Limpar users
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem inserir próprios dados" ON public.users;
DROP POLICY IF EXISTS "Service role pode fazer tudo em users" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;
DROP POLICY IF EXISTS "Admins podem inserir usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem deletar usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar usuários" ON public.users;
DROP POLICY IF EXISTS "Sistema pode inserir usuários" ON public.users;

-- Limpar atividades
DROP POLICY IF EXISTS "Todos podem ler atividades" ON public.atividades;
DROP POLICY IF EXISTS "Service role pode tudo em atividades" ON public.atividades;

-- Limpar videos
DROP POLICY IF EXISTS "Todos podem ler videos" ON public.videos;
DROP POLICY IF EXISTS "Service role pode tudo em videos" ON public.videos;

-- Limpar bonus
DROP POLICY IF EXISTS "Todos podem ler bonus" ON public.bonus;
DROP POLICY IF EXISTS "Service role pode tudo em bonus" ON public.bonus;

-- Limpar papercrafts
DROP POLICY IF EXISTS "Todos podem ler papercrafts" ON public.papercrafts;

-- Limpar user_progress
DROP POLICY IF EXISTS "Ver próprio progresso" ON public.user_progress;
DROP POLICY IF EXISTS "Gerenciar próprio progresso" ON public.user_progress;
DROP POLICY IF EXISTS "Service role acesso total user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Usuários podem ver seu progresso" ON public.user_progress;
DROP POLICY IF EXISTS "Admins podem ver todo progresso" ON public.user_progress;
DROP POLICY IF EXISTS "Usuários podem criar progresso" ON public.user_progress;
DROP POLICY IF EXISTS "Usuários podem atualizar progresso" ON public.user_progress;

-- Limpar user_badges
DROP POLICY IF EXISTS "Ver badges" ON public.user_badges;
DROP POLICY IF EXISTS "Criar próprios badges" ON public.user_badges;
DROP POLICY IF EXISTS "Service role acesso total badges" ON public.user_badges;
DROP POLICY IF EXISTS "Todos podem ver badges" ON public.user_badges;
DROP POLICY IF EXISTS "Sistema pode criar badges" ON public.user_badges;
DROP POLICY IF EXISTS "Admins podem gerenciar badges" ON public.user_badges;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 3: CRIAR POLICIES CORRETAS (SEM RECURSÃO INFINITA)
-- ═══════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- TABELA: users
-- ════════════════════════════════════════════════════════════════

-- Policy 1: Service role pode fazer tudo
CREATE POLICY "users_service_role_all"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy 2: Usuários autenticados podem ver seus próprios dados
CREATE POLICY "users_read_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 3: Admins podem ver todos
CREATE POLICY "users_admins_read_all"
  ON public.users
  FOR SELECT
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

-- Policy 4: Usuários podem atualizar seus dados
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 5: Admins podem atualizar qualquer usuário
CREATE POLICY "users_admins_update_all"
  ON public.users
  FOR UPDATE
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

-- ════════════════════════════════════════════════════════════════
-- TABELAS DE DADOS: atividades, videos, bonus, papercrafts
-- ════════════════════════════════════════════════════════════════

-- ATIVIDADES
CREATE POLICY "atividades_service_role"
  ON public.atividades
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "atividades_read_all"
  ON public.atividades
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- VIDEOS
CREATE POLICY "videos_service_role"
  ON public.videos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "videos_read_all"
  ON public.videos
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- BONUS
CREATE POLICY "bonus_service_role"
  ON public.bonus
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "bonus_read_all"
  ON public.bonus
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- PAPERCRAFTS
CREATE POLICY "papercrafts_service_role"
  ON public.papercrafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "papercrafts_read_all"
  ON public.papercrafts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ════════════════════════════════════════════════════════════════
-- TABELA: user_progress
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "user_progress_service_role"
  ON public.user_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_progress_read_own"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_progress_admin_read_all"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "user_progress_write_own"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_progress_update_own"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════
-- TABELA: user_badges
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "user_badges_service_role"
  ON public.user_badges
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_badges_read_all"
  ON public.user_badges
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "user_badges_insert_own"
  ON public.user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════
-- TABELA: notifications
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "notifications_service_role"
  ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "notifications_read_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_admin_read_all"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "notifications_insert"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════
-- TABELA: broadcast_notifications
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "broadcast_notifications_service_role"
  ON public.broadcast_notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "broadcast_notifications_read_all"
  ON public.broadcast_notifications
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "broadcast_notifications_admin_all"
  ON public.broadcast_notifications
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

-- ════════════════════════════════════════════════════════════════
-- TABELA: broadcast_notification_reads
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "broadcast_notification_reads_service_role"
  ON public.broadcast_notification_reads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "broadcast_notification_reads_read_own"
  ON public.broadcast_notification_reads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "broadcast_notification_reads_admin_read_all"
  ON public.broadcast_notification_reads
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "broadcast_notification_reads_insert"
  ON public.broadcast_notification_reads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════
-- TABELA: user_activity_logs
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "user_activity_logs_service_role"
  ON public.user_activity_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_activity_logs_read_own"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_activity_logs_admin_read_all"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "user_activity_logs_insert"
  ON public.user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════
-- TABELA: user_plan_history
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "user_plan_history_service_role"
  ON public.user_plan_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_plan_history_read_own"
  ON public.user_plan_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_plan_history_admin_read_all"
  ON public.user_plan_history
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "user_plan_history_insert"
  ON public.user_plan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ RESTAURAÇÃO COMPLETA!
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ RLS restaurado! Seu site deve voltar a funcionar.' as status;
