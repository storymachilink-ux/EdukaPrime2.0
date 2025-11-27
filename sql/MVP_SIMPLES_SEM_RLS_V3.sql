-- ═══════════════════════════════════════════════════════════════════════════
-- MVP SIMPLES V3 - DESABILITA RLS (SEM ERROS)
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 1: DESABILITAR RLS EM TODAS AS TABELAS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bonus DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.papercrafts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.broadcast_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.broadcast_notification_reads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_plan_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_tiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_bonus DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_papercrafts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_password_resets DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 2: REMOVER POLICIES COM MÉTODO SEGURO
-- ═══════════════════════════════════════════════════════════════════════════

-- Usar método seguro para remover policies
DO $$
BEGIN
  -- Remover policies de cada tabela individualmente
  DECLARE
    pol RECORD;
  BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
    LOOP
      BEGIN
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
      EXCEPTION WHEN OTHERS THEN
        -- Ignorar erros e continuar
        NULL;
      END;
    END LOOP;
  END;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 3: VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════════════════════

-- Ver status de RLS
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'atividades', 'videos', 'bonus', 'papercrafts',
    'user_progress', 'user_badges', 'notifications', 'user_subscriptions',
    'webhook_logs', 'pending_plans', 'plans_v2'
  )
ORDER BY tablename;

-- Ver total de policies (deve ser 0)
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ MVP PRONTO - RLS DESABILITADO
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ MVP PRONTO! RLS desabilitado. Site deve funcionar agora.' as status;
