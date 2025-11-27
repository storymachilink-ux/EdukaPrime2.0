CREATE OR REPLACE FUNCTION trigger_xp_atividade()
RETURNS TRIGGER AS $trigger_xp_atividade$
DECLARE
  v_xp_earned INTEGER := 20;
  v_result RECORD;
BEGIN
  IF NEW.activity_type = 'download' AND NEW.resource_type = 'atividade' THEN
    SELECT * INTO v_result FROM add_xp_to_user(
      NEW.user_id,
      v_xp_earned,
      'Atividade: ' || NEW.resource_title,
      'atividade',
      NEW.resource_id::uuid
    );

    UPDATE user_gamification
    SET atividades_concluidas = atividades_concluidas + 1
    WHERE user_id = NEW.user_id;

    PERFORM update_user_streak(NEW.user_id);
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

CREATE OR REPLACE FUNCTION trigger_xp_video()
RETURNS TRIGGER AS $trigger_xp_video$
DECLARE
  v_xp_earned INTEGER := 15;
  v_result RECORD;
  v_already_viewed BOOLEAN;
BEGIN
  IF NEW.activity_type = 'view_video' AND NEW.resource_type = 'video' THEN
    SELECT EXISTS(
      SELECT 1 FROM user_activity_logs
      WHERE user_id = NEW.user_id
        AND resource_type = 'video'
        AND resource_id = NEW.resource_id
        AND activity_type = 'view_video'
        AND id != NEW.id
        AND created_at < NEW.created_at
    ) INTO v_already_viewed;

    IF NOT v_already_viewed THEN
      SELECT * INTO v_result FROM add_xp_to_user(
        NEW.user_id,
        v_xp_earned,
        'Vídeo: ' || NEW.resource_title,
        'video',
        NEW.resource_id::uuid
      );

      UPDATE user_gamification
      SET videos_assistidos = videos_assistidos + 1
      WHERE user_id = NEW.user_id;

      PERFORM update_user_streak(NEW.user_id);
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

CREATE OR REPLACE FUNCTION trigger_xp_bonus()
RETURNS TRIGGER AS $trigger_xp_bonus$
DECLARE
  v_xp_earned INTEGER := 10;
  v_result RECORD;
  v_already_viewed BOOLEAN;
BEGIN
  IF NEW.activity_type = 'view_bonus' AND NEW.resource_type = 'bonus' THEN
    SELECT EXISTS(
      SELECT 1 FROM user_activity_logs
      WHERE user_id = NEW.user_id
        AND resource_type = 'bonus'
        AND resource_id = NEW.resource_id
        AND activity_type = 'view_bonus'
        AND id != NEW.id
        AND created_at < NEW.created_at
    ) INTO v_already_viewed;

    IF NOT v_already_viewed THEN
      SELECT * INTO v_result FROM add_xp_to_user(
        NEW.user_id,
        v_xp_earned,
        'Bônus: ' || NEW.resource_title,
        'bonus',
        NEW.resource_id::uuid
      );

      UPDATE user_gamification
      SET bonus_acessados = bonus_acessados + 1
      WHERE user_id = NEW.user_id;

      PERFORM update_user_streak(NEW.user_id);
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

CREATE OR REPLACE FUNCTION award_streak_bonus(p_user_id UUID, p_streak INTEGER)
RETURNS void AS $award_streak_bonus$
DECLARE
  v_xp_bonus INTEGER;
BEGIN
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

  PERFORM add_xp_to_user(
    p_user_id,
    v_xp_bonus,
    'Bônus de Sequência: ' || p_streak || ' dias consecutivos',
    'streak',
    NULL
  );

  PERFORM check_and_unlock_achievements(p_user_id);
END;
$award_streak_bonus$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_streak_bonus()
RETURNS TRIGGER AS $trigger_streak_bonus$
BEGIN
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