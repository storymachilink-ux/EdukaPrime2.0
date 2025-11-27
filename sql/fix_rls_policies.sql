-- ============================================
-- FIX RLS POLICIES - Corrigir erros 406
-- ============================================

-- 1. AREA_BANNERS - Políticas para read público
ALTER TABLE IF EXISTS area_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON area_banners;
CREATE POLICY "Public read access" ON area_banners
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin update" ON area_banners;
CREATE POLICY "Admin update" ON area_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2. CHAT_USER_STATS - Políticas para read
ALTER TABLE IF EXISTS chat_user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own stats" ON chat_user_stats;
CREATE POLICY "Users can read own stats" ON chat_user_stats
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own stats" ON chat_user_stats;
CREATE POLICY "Users can update own stats" ON chat_user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. CHAT_BANNER - Políticas para read público
ALTER TABLE IF EXISTS chat_banner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read chat_banner" ON chat_banner;
CREATE POLICY "Public read chat_banner" ON chat_banner
  FOR SELECT
  USING (true);

-- Se a tabela user_gamification existir, aplicar políticas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_gamification') THEN
    ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can read own gamification" ON user_gamification;
    CREATE POLICY "Users can read own gamification" ON user_gamification
      FOR SELECT
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own gamification" ON user_gamification;
    CREATE POLICY "Users can update own gamification" ON user_gamification
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
