-- ============================================
-- CORREÇÃO URGENTE - Erro "badge_id is ambiguous"
-- Execute este SQL AGORA para corrigir
-- ============================================

-- Função para badges de DOWNLOAD (CORRIGIDA)
CREATE OR REPLACE FUNCTION check_and_unlock_download_badges(p_user_id UUID)
RETURNS TABLE(unlocked_badge_id TEXT, unlocked_badge_title TEXT) AS $$
DECLARE
  v_total_downloads INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Contar downloads DISTINTOS (materiais únicos com status started ou completed)
  SELECT COUNT(DISTINCT resource_id) INTO v_total_downloads
  FROM user_progress
  WHERE user_id = p_user_id
    AND resource_type IN ('atividade', 'bonus')
    AND status IN ('started', 'completed');

  RAISE NOTICE 'Usuario % tem % downloads', p_user_id, v_total_downloads;

  -- Verificar cada badge de download
  FOR v_badge IN
    SELECT * FROM badges WHERE type = 'material_download' ORDER BY requirement_value ASC
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = p_user_id AND user_badges.badge_id = v_badge.id
    ) INTO v_already_unlocked;

    IF NOT v_already_unlocked AND v_total_downloads >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      RAISE NOTICE 'Badge desbloqueada: % (%)', v_badge.title, v_badge.id;

      unlocked_badge_id := v_badge.id;
      unlocked_badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para badges de CONCLUSÃO (CORRIGIDA)
CREATE OR REPLACE FUNCTION check_and_unlock_completed_badges(p_user_id UUID)
RETURNS TABLE(unlocked_badge_id TEXT, unlocked_badge_title TEXT) AS $$
DECLARE
  v_total_completed INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Contar conclusões DISTINTAS
  SELECT COUNT(DISTINCT resource_id) INTO v_total_completed
  FROM user_progress
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND resource_type IN ('atividade', 'bonus');

  RAISE NOTICE 'Usuario % tem % conclusoes', p_user_id, v_total_completed;

  -- Verificar cada badge de conclusão
  FOR v_badge IN
    SELECT * FROM badges WHERE type = 'material_completed' ORDER BY requirement_value ASC
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = p_user_id AND user_badges.badge_id = v_badge.id
    ) INTO v_already_unlocked;

    IF NOT v_already_unlocked AND v_total_completed >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      RAISE NOTICE 'Badge desbloqueada: % (%)', v_badge.title, v_badge.id;

      unlocked_badge_id := v_badge.id;
      unlocked_badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para badges de CHAT (CORRIGIDA)
CREATE OR REPLACE FUNCTION check_and_unlock_chat_points_badges(p_user_id UUID)
RETURNS TABLE(unlocked_badge_id TEXT, unlocked_badge_title TEXT) AS $$
DECLARE
  v_total_points INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Pegar pontos do chat
  SELECT COALESCE(total_points, 0) INTO v_total_points
  FROM chat_user_stats
  WHERE user_id = p_user_id;

  RAISE NOTICE 'Usuario % tem % pontos de chat', p_user_id, v_total_points;

  -- Verificar cada badge de chat
  FOR v_badge IN
    SELECT * FROM badges WHERE type = 'chat_points' ORDER BY requirement_value ASC
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = p_user_id AND user_badges.badge_id = v_badge.id
    ) INTO v_already_unlocked;

    IF NOT v_already_unlocked AND v_total_points >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      RAISE NOTICE 'Badge desbloqueada: % (%)', v_badge.title, v_badge.id;

      unlocked_badge_id := v_badge.id;
      unlocked_badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RECRIAR TRIGGERS (garantir que usam as funções corrigidas)

-- Trigger para MATERIAIS (download e conclusão)
CREATE OR REPLACE FUNCTION trigger_check_material_badges()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Trigger disparado: user_id=%, resource_type=%, status=%', NEW.user_id, NEW.resource_type, NEW.status;

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
  RAISE NOTICE 'Trigger chat disparado: user_id=%, points=%', NEW.user_id, NEW.total_points;
  PERFORM check_and_unlock_chat_points_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_chat_points_badges_on_update ON chat_user_stats;
CREATE TRIGGER trigger_chat_points_badges_on_update
  AFTER INSERT OR UPDATE ON chat_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_chat_points_badges();

-- VERIFICAÇÃO FINAL
SELECT
  '✅ FUNÇÕES E TRIGGERS CORRIGIDOS!' as status,
  (SELECT COUNT(*) FROM badges) as total_badges,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%badge%') as triggers_ativos;

-- Listar triggers criados
SELECT
  '🔧 TRIGGERS ATIVOS:' as info,
  trigger_name,
  event_object_table as tabela
FROM information_schema.triggers
WHERE trigger_name LIKE '%badge%'
ORDER BY event_object_table;
