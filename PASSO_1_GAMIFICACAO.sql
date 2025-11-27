CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  atividades_concluidas INTEGER DEFAULT 0,
  videos_assistidos INTEGER DEFAULT 0,
  bonus_acessados INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL,
  level_name TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('atividades', 'videos', 'bonus', 'streak', 'level', 'xp')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('atividade', 'video', 'bonus', 'achievement', 'streak', 'manual')),
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_gamification_user ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON user_gamification(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_user ON xp_history(user_id, created_at DESC);

INSERT INTO levels (level_number, level_name, xp_required, icon, color) VALUES
  (1, 'Iniciante', 0, '🌱', '#10B981'),
  (2, 'Aprendiz', 100, '📚', '#3B82F6'),
  (3, 'Estudante', 300, '🎓', '#8B5CF6'),
  (4, 'Conhecedor', 600, '🧠', '#EC4899'),
  (5, 'Expert', 1000, '⭐', '#F59E0B'),
  (6, 'Mestre', 1500, '👑', '#EF4444'),
  (7, 'Lendário', 2500, '🏆', '#6366F1')
ON CONFLICT (level_number) DO NOTHING;

INSERT INTO achievements (code, title, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('first_activity', 'Primeira Conquista', 'Complete sua primeira atividade', '🎯', 10, 'atividades', 1),
  ('activity_10', 'Dedicado', 'Complete 10 atividades', '💪', 50, 'atividades', 10),
  ('activity_25', 'Persistente', 'Complete 25 atividades', '🔥', 100, 'atividades', 25),
  ('activity_50', 'Incansável', 'Complete 50 atividades', '⚡', 200, 'atividades', 50),
  ('activity_100', 'Campeão', 'Complete 100 atividades', '🏆', 500, 'atividades', 100),
  ('streak_3', 'Sequência Iniciada', 'Acesse a plataforma por 3 dias seguidos', '🔥', 30, 'streak', 3),
  ('streak_7', 'Uma Semana', 'Acesse a plataforma por 7 dias seguidos', '📅', 70, 'streak', 7),
  ('streak_30', 'Um Mês Completo', 'Acesse a plataforma por 30 dias seguidos', '🗓️', 300, 'streak', 30),
  ('streak_100', 'Dedicação Total', 'Acesse a plataforma por 100 dias seguidos', '💎', 1000, 'streak', 100),
  ('video_10', 'Observador', 'Assista 10 vídeos', '📺', 50, 'videos', 10),
  ('video_50', 'Cinéfilo Educacional', 'Assista 50 vídeos', '🎬', 200, 'videos', 50),
  ('bonus_all', 'Explorador de Bônus', 'Acesse todos os bônus disponíveis', '🎁', 100, 'bonus', 5),
  ('level_3', 'Estudante Dedicado', 'Alcance o nível 3', '🎓', 100, 'level', 3),
  ('level_5', 'Expert', 'Alcance o nível 5', '⭐', 300, 'level', 5),
  ('level_7', 'Lendário', 'Alcance o nível 7', '🏆', 1000, 'level', 7),
  ('xp_1000', 'Milhar', 'Acumule 1000 XP', '💯', 100, 'xp', 1000),
  ('xp_5000', 'Cinco Mil', 'Acumule 5000 XP', '🌟', 500, 'xp', 5000)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION update_gamification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gamification_timestamp ON user_gamification;
CREATE TRIGGER trigger_update_gamification_timestamp
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_timestamp();

CREATE OR REPLACE FUNCTION add_xp_to_user(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason TEXT,
  p_source_type TEXT DEFAULT 'manual',
  p_source_id UUID DEFAULT NULL
)
RETURNS TABLE(
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_current_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := FALSE;
BEGIN
  INSERT INTO user_gamification (user_id, total_xp, current_level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT total_xp, current_level INTO v_current_xp, v_current_level
  FROM user_gamification
  WHERE user_id = p_user_id;

  v_new_xp := v_current_xp + p_xp_amount;

  SELECT COALESCE(MAX(level_number), 1) INTO v_new_level
  FROM levels
  WHERE xp_required <= v_new_xp;

  IF v_new_level > v_current_level THEN
    v_level_up := TRUE;
  END IF;

  UPDATE user_gamification
  SET total_xp = v_new_xp,
      current_level = v_new_level
  WHERE user_id = p_user_id;

  INSERT INTO xp_history (user_id, xp_amount, reason, source_type, source_id)
  VALUES (p_user_id, p_xp_amount, p_reason, p_source_type, p_source_id);

  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak INTO v_last_date, v_current_streak
  FROM user_gamification
  WHERE user_id = p_user_id;

  IF v_last_date IS NULL THEN
    INSERT INTO user_gamification (user_id, current_streak, last_activity_date, longest_streak)
    VALUES (p_user_id, 1, CURRENT_DATE, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET current_streak = 1, last_activity_date = CURRENT_DATE, longest_streak = GREATEST(user_gamification.longest_streak, 1);
    RETURN 1;
  END IF;

  IF v_last_date = CURRENT_DATE THEN
    RETURN v_current_streak;
  END IF;

  IF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;

    UPDATE user_gamification
    SET current_streak = v_new_streak,
        last_activity_date = CURRENT_DATE,
        longest_streak = GREATEST(longest_streak, v_new_streak)
    WHERE user_id = p_user_id;

    RETURN v_new_streak;
  END IF;

  UPDATE user_gamification
  SET current_streak = 1,
      last_activity_date = CURRENT_DATE
  WHERE user_id = p_user_id;

  RETURN 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS TABLE(achievement_code TEXT, achievement_title TEXT) AS $$
DECLARE
  v_gamification RECORD;
  v_achievement RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  SELECT * INTO v_gamification
  FROM user_gamification
  WHERE user_id = p_user_id;

  IF v_gamification IS NULL THEN
    RETURN;
  END IF;

  FOR v_achievement IN SELECT * FROM achievements LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_achievements
      WHERE user_id = p_user_id AND achievement_id = v_achievement.id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
      CONTINUE;
    END IF;

    IF (
      (v_achievement.requirement_type = 'atividades' AND v_gamification.atividades_concluidas >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'videos' AND v_gamification.videos_assistidos >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'bonus' AND v_gamification.bonus_acessados >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'streak' AND v_gamification.current_streak >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'level' AND v_gamification.current_level >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'xp' AND v_gamification.total_xp >= v_achievement.requirement_value)
    ) THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, v_achievement.id)
      ON CONFLICT DO NOTHING;

      PERFORM add_xp_to_user(p_user_id, v_achievement.xp_reward, 'Conquista: ' || v_achievement.title, 'achievement', v_achievement.id);

      achievement_code := v_achievement.code;
      achievement_title := v_achievement.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver sua própria gamificação" ON user_gamification;
CREATE POLICY "Usuários podem ver sua própria gamificação"
  ON user_gamification FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as gamificações" ON user_gamification;
CREATE POLICY "Usuários autenticados podem ver todas as gamificações"
  ON user_gamification FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Sistema pode criar/atualizar gamificação" ON user_gamification;
CREATE POLICY "Sistema pode criar/atualizar gamificação"
  ON user_gamification FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários podem ver suas conquistas" ON user_achievements;
CREATE POLICY "Usuários podem ver suas conquistas"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sistema pode criar conquistas" ON user_achievements;
CREATE POLICY "Sistema pode criar conquistas"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários podem ver seu histórico de XP" ON xp_history;
CREATE POLICY "Usuários podem ver seu histórico de XP"
  ON xp_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sistema pode criar histórico" ON xp_history;
CREATE POLICY "Sistema pode criar histórico"
  ON xp_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Todos podem ver níveis" ON levels;
CREATE POLICY "Todos podem ver níveis"
  ON levels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Todos podem ver conquistas" ON achievements;
CREATE POLICY "Todos podem ver conquistas"
  ON achievements FOR SELECT
  USING (true);