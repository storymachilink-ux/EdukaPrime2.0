-- ============================================
-- FIX RLS POLICIES - Versão Segura
-- ============================================
-- Este script adiciona RLS apenas nas tabelas que existem

-- 1. AREA_BANNERS (se existir)
ALTER TABLE IF EXISTS area_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON area_banners;
DROP POLICY IF EXISTS "Admin update" ON area_banners;

CREATE POLICY "Public read access" ON area_banners
  FOR SELECT
  USING (true);

CREATE POLICY "Admin update" ON area_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2. CHAT_USER_STATS (se existir)
ALTER TABLE IF EXISTS chat_user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own stats" ON chat_user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON chat_user_stats;

CREATE POLICY "Users can read own stats" ON chat_user_stats
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Users can update own stats" ON chat_user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. CHAT_BANNER (se existir)
ALTER TABLE IF EXISTS chat_banner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read chat_banner" ON chat_banner;

CREATE POLICY "Public read chat_banner" ON chat_banner
  FOR SELECT
  USING (true);

-- ============================================
-- Resumo:
-- ✅ area_banners: Leitura pública
-- ✅ chat_user_stats: Dados do usuário autenticado
-- ✅ chat_banner: Leitura pública
-- ============================================
