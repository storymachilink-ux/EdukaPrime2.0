-- ============================================
-- SISTEMA FINAL DE BADGES - DASHBOARD
-- 12 Badges para revelar imagem
-- ============================================

-- PASSO 1: LIMPAR TUDO DO SISTEMA ANTIGO
-- ============================================

-- Deletar conquistas antigas
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS xp_history CASCADE;
DROP TABLE IF EXISTS levels CASCADE;

-- Limpar badges antigas se existirem
DELETE FROM user_badges;
DROP TABLE IF EXISTS badges CASCADE;

-- PASSO 2: CRIAR SISTEMA NOVO DE BADGES
-- ============================================

-- Criar tabela de badges
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('material_download', 'material_completed', 'chat_points')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela user_badges se não existir
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- PASSO 3: INSERIR AS 12 BADGES
-- ============================================

-- 4 Badges de Download (1, 5, 10, 15 materiais)
INSERT INTO badges (id, title, description, icon, type, requirement_value) VALUES
  ('material_download_1', 'Primeiro Download', 'Baixe seu primeiro material', '📥', 'material_download', 1),
  ('material_download_5', 'Colecionador', 'Baixe 5 materiais', '📚', 'material_download', 5),
  ('material_download_10', 'Explorador', 'Baixe 10 materiais', '🎯', 'material_download', 10),
  ('material_download_15', 'Biblioteca Pessoal', 'Baixe 15 materiais', '📖', 'material_download', 15);

-- 4 Badges de Conclusão (1, 5, 10, 15 atividades)
INSERT INTO badges (id, title, description, icon, type, requirement_value) VALUES
  ('material_completed_1', 'Primeiro Passo', 'Conclua sua primeira atividade', '✅', 'material_completed', 1),
  ('material_completed_5', 'Dedicado', 'Conclua 5 atividades', '💪', 'material_completed', 5),
  ('material_completed_10', 'Persistente', 'Conclua 10 atividades', '⭐', 'material_completed', 10),
  ('material_completed_15', 'Mestre Completo', 'Conclua 15 atividades', '👑', 'material_completed', 15);

-- 4 Badges de Chat (100, 500, 1000, 2000 pontos = 10, 50, 100, 200 mensagens)
INSERT INTO badges (id, title, description, icon, type, requirement_value) VALUES
  ('chat_100', 'Comunicativo', 'Envie 10 mensagens no chat', '💬', 'chat_points', 100),
  ('chat_500', 'Locutor', 'Envie 50 mensagens no chat', '🗨️', 'chat_points', 500),
  ('chat_1000', 'Porta-Voz', 'Envie 100 mensagens no chat', '💫', 'chat_points', 1000),
  ('chat_2000', 'Estrela da Comunidade', 'Envie 200 mensagens no chat', '🔥', 'chat_points', 2000);

-- PASSO 4: FUNÇÕES DE DESBLOQUEIO AUTOMÁTICO
-- ============================================

-- Função para badges de DOWNLOAD
CREATE OR REPLACE FUNCTION check_and_unlock_download_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_title TEXT) AS $$
DECLARE
  v_total_downloads INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Contar downloads (materiais com status started ou completed)
  SELECT COUNT(*) INTO v_total_downloads
  FROM user_progress
  WHERE user_id = p_user_id
    AND resource_type IN ('atividade', 'bonus')
    AND status IN ('started', 'completed');

  -- Verificar cada badge de download
  FOR v_badge IN
    SELECT * FROM badges WHERE type = 'material_download' ORDER BY requirement_value ASC
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_unlocked;

    IF NOT v_already_unlocked AND v_total_downloads >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      badge_id := v_badge.id;
      badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para badges de CONCLUSÃO
CREATE OR REPLACE FUNCTION check_and_unlock_completed_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_title TEXT) AS $$
DECLARE
  v_total_completed INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Contar conclusões
  SELECT COUNT(*) INTO v_total_completed
  FROM user_progress
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND resource_type IN ('atividade', 'bonus');

  -- Verificar cada badge de conclusão
  FOR v_badge IN
    SELECT * FROM badges WHERE type = 'material_completed' ORDER BY requirement_value ASC
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_unlocked;

    IF NOT v_already_unlocked AND v_total_completed >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      badge_id := v_badge.id;
      badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para badges de CHAT
CREATE OR REPLACE FUNCTION check_and_unlock_chat_points_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_title TEXT) AS $$
DECLARE
  v_total_points INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Pegar pontos do chat
  SELECT COALESCE(total_points, 0) INTO v_total_points
  FROM chat_user_stats
  WHERE user_id = p_user_id;

  -- Verificar cada badge de chat
  FOR v_badge IN
    SELECT * FROM badges WHERE type = 'chat_points' ORDER BY requirement_value ASC
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_unlocked;

    IF NOT v_already_unlocked AND v_total_points >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      badge_id := v_badge.id;
      badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- PASSO 5: TRIGGERS AUTOMÁTICOS
-- ============================================

-- Trigger para MATERIAIS (download e conclusão)
CREATE OR REPLACE FUNCTION trigger_check_material_badges()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resource_type IN ('atividade', 'bonus') THEN
    -- Badges de download
    IF NEW.status IN ('started', 'completed') THEN
      PERFORM check_and_unlock_download_badges(NEW.user_id);
    END IF;

    -- Badges de conclusão
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
      PERFORM check_and_unlock_completed_badges(NEW.user_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_material_badges_on_progress ON user_progress;
CREATE TRIGGER trigger_material_badges_on_progress
  AFTER INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_material_badges();

-- Trigger para CHAT
CREATE OR REPLACE FUNCTION trigger_check_chat_points_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_unlock_chat_points_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_chat_points_badges_on_update ON chat_user_stats;
CREATE TRIGGER trigger_chat_points_badges_on_update
  AFTER INSERT OR UPDATE ON chat_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_chat_points_badges();

-- PASSO 6: RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Todos podem ver badges
DROP POLICY IF EXISTS "Anyone can read badges" ON badges;
CREATE POLICY "Anyone can read badges" ON badges FOR SELECT USING (true);

-- Usuários veem suas próprias badges
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Sistema pode inserir badges
DROP POLICY IF EXISTS "System can insert badges" ON user_badges;
CREATE POLICY "System can insert badges" ON user_badges FOR INSERT WITH CHECK (true);

-- PASSO 7: SUCESSO!
-- ============================================

SELECT
  'Sistema de Badges criado com sucesso!' as status,
  (SELECT COUNT(*) FROM badges) as total_badges,
  '12 badges = 100% da imagem revelada' as info;
