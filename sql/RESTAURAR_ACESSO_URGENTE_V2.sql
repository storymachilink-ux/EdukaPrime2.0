-- ═══════════════════════════════════════════════════════════════════════════
-- 🚨 RESTAURAÇÃO URGENTE V2 - EXECUTE ISTO
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 1: REMOVER TODAS AS POLICIES EXISTENTES (SEM ERRO)
-- ═══════════════════════════════════════════════════════════════════════════

-- Users - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
  END LOOP;
END $$;

-- Atividades - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'atividades' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.atividades';
  END LOOP;
END $$;

-- Videos - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'videos' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.videos';
  END LOOP;
END $$;

-- Bonus - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bonus' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.bonus';
  END LOOP;
END $$;

-- Papercrafts - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'papercrafts' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.papercrafts';
  END LOOP;
END $$;

-- User Progress - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_progress' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_progress';
  END LOOP;
END $$;

-- User Badges - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_badges' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_badges';
  END LOOP;
END $$;

-- Notifications - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.notifications';
  END LOOP;
END $$;

-- Broadcast Notifications - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'broadcast_notifications' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.broadcast_notifications';
  END LOOP;
END $$;

-- Broadcast Notification Reads - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'broadcast_notification_reads' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.broadcast_notification_reads';
  END LOOP;
END $$;

-- User Activity Logs - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_activity_logs' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_activity_logs';
  END LOOP;
END $$;

-- User Plan History - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_plan_history' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_plan_history';
  END LOOP;
END $$;

-- User Subscriptions - remover TODAS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_subscriptions' AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_subscriptions';
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 2: REABILITAR RLS
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
ALTER TABLE IF EXISTS public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 3: CRIAR POLICIES CORRETAS
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

-- ════════════════════════════════════════════════════════════════
-- TABELA: user_subscriptions
-- ════════════════════════════════════════════════════════════════

CREATE POLICY "user_subscriptions_service_role"
  ON public.user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_subscriptions_read_own"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_admin_read_all"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1) = true
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ RESTAURAÇÃO COMPLETA!
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ RLS restaurado com sucesso! Seu site deve voltar a funcionar.' as status;
