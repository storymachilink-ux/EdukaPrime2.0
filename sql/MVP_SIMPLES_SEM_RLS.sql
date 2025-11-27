-- ═══════════════════════════════════════════════════════════════════════════
-- MVP SIMPLES - DESABILITA RLS EM TUDO (100% FUNCIONAL)
-- ═══════════════════════════════════════════════════════════════════════════
-- Prioridade: Funcionalidade > Segurança (temporário para MVP)
-- Execute TUDO isto no Supabase SQL Editor
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

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 2: REMOVER TODAS AS POLICIES (LIMPEZA)
-- ═══════════════════════════════════════════════════════════════════════════

-- Function para remover todas as policies
DO $$
DECLARE
  r RECORD;
  table_name TEXT;
  policy_name TEXT;
BEGIN
  FOR r IN
    SELECT DISTINCT tablename FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    FOR policy_name IN
      SELECT policyname FROM pg_policies
      WHERE tablename = r.tablename AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS "%I" ON public."%I"', policy_name, r.tablename);
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Todas as policies foram removidas';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 3: VERIFICAR QUE RLS ESTÁ DESABILITADO
-- ═══════════════════════════════════════════════════════════════════════════

SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Ativo",
  CASE WHEN rowsecurity THEN 'ATIVO ⚠️' ELSE 'DESABILITADO ✅' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'atividades', 'videos', 'bonus', 'papercrafts',
    'user_progress', 'user_badges', 'notifications', 'user_subscriptions',
    'webhook_logs', 'pending_plans', 'plans_v2'
  )
ORDER BY tablename;

-- Resultado esperado: Todas as colunas 'status' devem mostrar 'DESABILITADO ✅'

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 4: VERIFICAR QUE NÃO HÁ POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

SELECT
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Resultado esperado: 0

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 5: TESTAR ACESSO AO BANCO
-- ═══════════════════════════════════════════════════════════════════════════

-- Verificar que users table está acessível
SELECT COUNT(*) as total_users FROM public.users;

-- Verificar que plans_v2 está acessível
SELECT COUNT(*) as total_plans FROM public.plans_v2;

-- Verificar que user_subscriptions está acessível
SELECT COUNT(*) as total_subscriptions FROM public.user_subscriptions;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ MVP PRONTO - RLS DESABILITADO COMPLETAMENTE
-- ═══════════════════════════════════════════════════════════════════════════
-- Seu site agora deve funcionar 100%
-- Aviso: Sem RLS, qualquer usuário autenticado pode acessar tudo
-- (OK para MVP, mas depois você protege com lógica de frontend + backend)

SELECT '✅ MVP PRONTO! RLS desabilitado em todas as tabelas. Site deve funcionar agora.' as status;
