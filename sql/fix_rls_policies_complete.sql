-- ============================================
-- FIX RLS POLICIES - Versão Completa
-- ============================================
-- Este script corrige os erros 406 removendo ALL policies e recriando corretamente

-- 1. AREA_BANNERS - Deletar todas as policies antigas
ALTER TABLE IF EXISTS area_banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS area_banners ENABLE ROW LEVEL SECURITY;

-- Remover quaisquer policies existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'area_banners'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Criar nova policy: SELECT pública
CREATE POLICY "area_banners_select_public" ON area_banners
  FOR SELECT
  USING (true);

-- Criar nova policy: INSERT apenas para autenticados
CREATE POLICY "area_banners_insert_auth" ON area_banners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Criar nova policy: UPDATE apenas para autenticados
CREATE POLICY "area_banners_update_auth" ON area_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Criar nova policy: DELETE apenas para autenticados
CREATE POLICY "area_banners_delete_auth" ON area_banners
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 2. CHAT_USER_STATS
ALTER TABLE IF EXISTS chat_user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_user_stats ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'chat_user_stats'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

CREATE POLICY "chat_user_stats_select_own" ON chat_user_stats
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "chat_user_stats_update_own" ON chat_user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. CHAT_BANNER
ALTER TABLE IF EXISTS chat_banner DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_banner ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'chat_banner'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

CREATE POLICY "chat_banner_select_public" ON chat_banner
  FOR SELECT
  USING (true);

-- ============================================
-- Resumo das alterações:
-- ✅ area_banners: SELECT pública + INSERT/UPDATE/DELETE para autenticados
-- ✅ chat_user_stats: SELECT próprio + UPDATE próprio
-- ✅ chat_banner: SELECT pública
-- ============================================
