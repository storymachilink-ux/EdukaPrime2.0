-- ═══════════════════════════════════════════════════════════════════════════
-- FORCE DISABLE RLS - VERSÃO MAIS AGRESSIVA
-- Execute isto direto no Supabase SQL Editor
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
ALTER TABLE IF EXISTS public.user_activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 2: REMOVER TODAS AS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.users;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.users;
DROP POLICY IF EXISTS "Allow update for self" ON public.users;
DROP POLICY IF EXISTS "Allow all on users for authenticated" ON public.users;

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.atividades;
DROP POLICY IF EXISTS "Allow all on atividades" ON public.atividades;

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.videos;
DROP POLICY IF EXISTS "Allow all on videos" ON public.videos;

DROP POLICY IF EXISTS "Allow select for authenticated" ON public.bonus;
DROP POLICY IF EXISTS "Allow all on bonus" ON public.bonus;

DROP POLICY IF EXISTS "Allow all on user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow all on user_subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Allow all on webhook_logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Allow all on pending_plans" ON public.pending_plans;
DROP POLICY IF EXISTS "Allow all on plans_v2" ON public.plans_v2;

-- Remover policies dinamicamente (se existirem outras)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
      RAISE NOTICE 'Removida policy: %', pol.policyname;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 3: VERIFICAR STATUS
-- ═══════════════════════════════════════════════════════════════════════════

SELECT
  schemaname,
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity = false THEN '✅ RLS DESABILITADO' ELSE '❌ RLS ATIVO' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'atividades', 'videos', 'bonus', 'papercrafts',
    'user_progress', 'user_badges', 'user_activity_logs', 'user_subscriptions',
    'webhook_logs', 'pending_plans', 'plans_v2', 'transactions', 'expenses'
  )
ORDER BY tablename;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 4: CONTAR POLICIES RESTANTES
-- ═══════════════════════════════════════════════════════════════════════════

SELECT
  COUNT(*) as total_policies,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ SUCESSO! Nenhuma policy'
    ELSE '⚠️ Ainda há ' || COUNT(*) || ' policies'
  END as status
FROM pg_policies
WHERE schemaname = 'public';

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 5: TESTAR QUERY SIMPLES
-- ═══════════════════════════════════════════════════════════════════════════

SELECT COUNT(*) as total_users FROM public.users;
SELECT COUNT(*) as total_atividades FROM public.atividades;
SELECT COUNT(*) as total_videos FROM public.videos;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ CONCLUÍDO
-- ═══════════════════════════════════════════════════════════════════════════

SELECT
  '✅ RLS FOI DESABILITADO COM SUCESSO!' as resultado,
  'O site agora deve funcionar normalmente' as proxima_acao;
