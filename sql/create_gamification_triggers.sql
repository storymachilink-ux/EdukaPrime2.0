-- ============================================
-- TRIGGERS AUTOMÁTICOS DE GAMIFICAÇÃO
-- ============================================
-- Este arquivo cria triggers que adicionam XP automaticamente
-- quando o usuário completa ações na plataforma

-- 1. TRIGGER: XP ao fazer download de atividade
CREATE OR REPLACE FUNCTION trigger_xp_atividade()
RETURNS TRIGGER AS $trigger_xp_atividade$
DECLARE
  v_xp_earned INTEGER := 20;
  v_result RECORD;
BEGIN
  -- Só dar XP para downloads de atividades
  IF NEW.activity_type = 'download' AND NEW.resource_type = 'atividade' THEN
    -- Adicionar XP
    SELECT * INTO v_result FROM add_xp_to_user(
      NEW.user_id,
      v_xp_earned,
      'Atividade: ' || NEW.resource_title,
      'atividade',
      NEW.resource_id::uuid
    );

    -- Atualizar contador de atividades
    UPDATE user_gamification
    SET atividades_concluidas = atividades_concluidas + 1
    WHERE user_id = NEW.user_id;

    -- Atualizar streak
    PERFORM update_user_streak(NEW.user_id);

    -- Verificar conquistas
    PERFORM check_and_unlock_achievements(NEW.user_id);
  END IF;

  RETURN NEW;
END;
$trigger_xp_atividade$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_xp_on_activity_download ON user_activity_logs;
CREATE TRIGGER trigger_xp_on_activity_download
  AFTER INSERT ON user_activity_logs
  FOR EACH ROW
  WHEN (NEW.activity_type = 'download' AND NEW.resource_type = 'atividade')
  EXECUTE FUNCTION trigger_xp_atividade();

-- 2. TRIGGER: XP ao assistir vídeo
CREATE OR REPLACE FUNCTION trigger_xp_video()
RETURNS TRIGGER AS $trigger_xp_video$
DECLARE
  v_xp_earned INTEGER := 15;
  v_result RECORD;
  v_already_viewed BOOLEAN;
BEGIN
  -- Só dar XP para visualização de vídeos
  IF NEW.activity_type = 'view_video' AND NEW.resource_type = 'video' THEN
    -- Verificar se já visualizou antes (para não dar XP múltiplas vezes)
    SELECT EXISTS(
      SELECT 1 FROM user_activity_logs
      WHERE user_id = NEW.user_id
        AND resource_type = 'video'
        AND resource_id = NEW.resource_id
        AND activity_type = 'view_video'
        AND id != NEW.id
        AND created_at < NEW.created_at
    ) INTO v_already_viewed;

    -- Se é primeira visualização, dar XP
    IF NOT v_already_viewed THEN
      -- Adicionar XP
      SELECT * INTO v_result FROM add_xp_to_user(
        NEW.user_id,
        v_xp_earned,
        'Vídeo: ' || NEW.resource_title,
        'video',
        NEW.resource_id::uuid
      );

      -- Atualizar contador de vídeos
      UPDATE user_gamification
      SET videos_assistidos = videos_assistidos + 1
      WHERE user_id = NEW.user_id;

      -- Atualizar streak
      PERFORM update_user_streak(NEW.user_id);

      -- Verificar conquistas
      PERFORM check_and_unlock_achievements(NEW.user_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$trigger_xp_video$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_xp_on_video_view ON user_activity_logs;
CREATE TRIGGER trigger_xp_on_video_view
  AFTER INSERT ON user_activity_logs
  FOR EACH ROW
  WHEN (NEW.activity_type = 'view_video' AND NEW.resource_type = 'video')
  EXECUTE FUNCTION trigger_xp_video();

-- 3. TRIGGER: XP ao visualizar bônus
CREATE OR REPLACE FUNCTION trigger_xp_bonus()
RETURNS TRIGGER AS $trigger_xp_bonus$
DECLARE
  v_xp_earned INTEGER := 10;
  v_result RECORD;
  v_already_viewed BOOLEAN;
BEGIN
  -- Só dar XP para visualização de bônus
  IF NEW.activity_type = 'view_bonus' AND NEW.resource_type = 'bonus' THEN
    -- Verificar se já visualizou antes
    SELECT EXISTS(
      SELECT 1 FROM user_activity_logs
      WHERE user_id = NEW.user_id
        AND resource_type = 'bonus'
        AND resource_id = NEW.resource_id
        AND activity_type = 'view_bonus'
        AND id != NEW.id
        AND created_at < NEW.created_at
    ) INTO v_already_viewed;

    -- Se é primeira visualização, dar XP
    IF NOT v_already_viewed THEN
      -- Adicionar XP
      SELECT * INTO v_result FROM add_xp_to_user(
        NEW.user_id,
        v_xp_earned,
        'Bônus: ' || NEW.resource_title,
        'bonus',
        NEW.resource_id::uuid
      );

      -- Atualizar contador de bônus
      UPDATE user_gamification
      SET bonus_acessados = bonus_acessados + 1
      WHERE user_id = NEW.user_id;

      -- Atualizar streak
      PERFORM update_user_streak(NEW.user_id);

      -- Verificar conquistas
      PERFORM check_and_unlock_achievements(NEW.user_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$trigger_xp_bonus$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_xp_on_bonus_view ON user_activity_logs;
CREATE TRIGGER trigger_xp_on_bonus_view
  AFTER INSERT ON user_activity_logs
  FOR EACH ROW
  WHEN (NEW.activity_type = 'view_bonus' AND NEW.resource_type = 'bonus')
  EXECUTE FUNCTION trigger_xp_bonus();

-- 4. FUNÇÃO PARA BÔNUS DE STREAK
CREATE OR REPLACE FUNCTION award_streak_bonus(p_user_id UUID, p_streak INTEGER)
RETURNS void AS $award_streak_bonus$
DECLARE
  v_xp_bonus INTEGER;
BEGIN
  -- Calcular bônus baseado no streak
  CASE
    WHEN p_streak = 3 THEN v_xp_bonus := 30;
    WHEN p_streak = 7 THEN v_xp_bonus := 70;
    WHEN p_streak = 14 THEN v_xp_bonus := 140;
    WHEN p_streak = 30 THEN v_xp_bonus := 300;
    WHEN p_streak = 60 THEN v_xp_bonus := 600;
    WHEN p_streak = 100 THEN v_xp_bonus := 1000;
    WHEN p_streak % 10 = 0 AND p_streak > 100 THEN v_xp_bonus := p_streak;
    ELSE RETURN;
  END CASE;

  -- Adicionar XP de bônus
  PERFORM add_xp_to_user(
    p_user_id,
    v_xp_bonus,
    'Bônus de Sequência: ' || p_streak || ' dias consecutivos',
    'streak',
    NULL
  );

  -- Verificar conquistas
  PERFORM check_and_unlock_achievements(p_user_id);
END;
$award_streak_bonus$ LANGUAGE plpgsql;

-- 5. TRIGGER: Dar bônus automático quando streak aumentar
CREATE OR REPLACE FUNCTION trigger_streak_bonus()
RETURNS TRIGGER AS $trigger_streak_bonus$
BEGIN
  -- Se o streak aumentou, verificar se deve dar bônus
  IF NEW.current_streak > OLD.current_streak THEN
    PERFORM award_streak_bonus(NEW.user_id, NEW.current_streak);
  END IF;

  RETURN NEW;
END;
$trigger_streak_bonus$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_streak_bonus ON user_gamification;
CREATE TRIGGER trigger_award_streak_bonus
  AFTER UPDATE OF current_streak ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION trigger_streak_bonus();

-- 6. MENSAGEM DE SUCESSO
DO $do_block$
BEGIN
  RAISE NOTICE '✅ Triggers de gamificação criados com sucesso!';
  RAISE NOTICE '🎮 XP automático ao baixar atividades (+20 XP)';
  RAISE NOTICE '🎬 XP automático ao assistir vídeos (+15 XP)';
  RAISE NOTICE '🎁 XP automático ao acessar bônus (+10 XP)';
  RAISE NOTICE '🔥 Bônus de streak em marcos especiais';
  RAISE NOTICE '🏆 Verificação automática de conquistas';
  RAISE NOTICE '';
  RAISE NOTICE '📝 NOTA: Os triggers usam a tabela user_activity_logs';
  RAISE NOTICE '   - download + atividade = +20 XP';
  RAISE NOTICE '   - view_video + video = +15 XP (primeira vez)';
  RAISE NOTICE '   - view_bonus + bonus = +10 XP (primeira vez)';
END
$do_block$;
