-- ============================================
-- SISTEMA DE BADGES PARA CONQUISTAS
-- 12 Badges: 8 para materiais + 4 para pontos
-- ============================================

-- 0. LIMPAR BADGES ANTIGAS (se existirem)
-- Remove badges antigas que não fazem mais parte do sistema
DELETE FROM user_badges WHERE badge_id NOT LIKE 'material_%' AND badge_id NOT LIKE 'chat_%';

-- 1. RECRIAR TABELA DE BADGES
-- Deletar tabela antiga se existir
DROP TABLE IF EXISTS badges CASCADE;

-- Criar nova tabela com os tipos corretos
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('material_download', 'material_completed', 'chat_points')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERIR AS 12 BADGES

-- Badges de Download (4 badges) - Baixar materiais
INSERT INTO badges (id, title, description, icon, type, requirement_value) VALUES
  ('material_download_1', 'Primeiro Download', 'Baixe seu primeiro material', '📥', 'material_download', 1),
  ('material_download_5', 'Colecionador', 'Baixe 5 materiais', '📚', 'material_download', 5),
  ('material_download_10', 'Explorador', 'Baixe 10 materiais', '🎯', 'material_download', 10),
  ('material_download_15', 'Biblioteca Pessoal', 'Baixe 15 materiais', '📖', 'material_download', 15);

-- Badges de Conclusão (4 badges) - Concluir materiais
INSERT INTO badges (id, title, description, icon, type, requirement_value) VALUES
  ('material_completed_1', 'Primeiro Passo', 'Conclua sua primeira atividade', '✅', 'material_completed', 1),
  ('material_completed_5', 'Dedicado', 'Conclua 5 atividades', '💪', 'material_completed', 5),
  ('material_completed_10', 'Persistente', 'Conclua 10 atividades', '⭐', 'material_completed', 10),
  ('material_completed_15', 'Mestre Completo', 'Conclua 15 atividades', '👑', 'material_completed', 15);

-- Badges de Mensagens no Chat (4 badges) - Mensagens enviadas
INSERT INTO badges (id, title, description, icon, type, requirement_value) VALUES
  ('chat_100', 'Comunicativo', 'Envie 10 mensagens no chat', '💬', 'chat_points', 100),
  ('chat_500', 'Locutor', 'Envie 50 mensagens no chat', '🗨️', 'chat_points', 500),
  ('chat_1000', 'Porta-Voz', 'Envie 100 mensagens no chat', '💫', 'chat_points', 1000),
  ('chat_2000', 'Estrela da Comunidade', 'Envie 200 mensagens no chat', '🔥', 'chat_points', 2000);

-- 3. FUNÇÃO PARA VERIFICAR E DESBLOQUEAR BADGES DE DOWNLOAD
CREATE OR REPLACE FUNCTION check_and_unlock_download_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_title TEXT) AS $$
DECLARE
  v_total_downloads INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Contar total de materiais baixados (atividades + bonus iniciados ou concluídos)
  SELECT COUNT(*) INTO v_total_downloads
  FROM user_progress
  WHERE user_id = p_user_id
    AND resource_type IN ('atividade', 'bonus')
    AND status IN ('started', 'completed');

  -- Verificar cada badge de download
  FOR v_badge IN
    SELECT * FROM badges
    WHERE type = 'material_download'
    ORDER BY requirement_value ASC
  LOOP
    -- Verificar se o usuário já desbloqueou esta badge
    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_unlocked;

    -- Se já desbloqueou, pular
    IF v_already_unlocked THEN
      CONTINUE;
    END IF;

    -- Se atingiu o requisito, desbloquear
    IF v_total_downloads >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      -- Retornar badge desbloqueada
      badge_id := v_badge.id;
      badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNÇÃO PARA VERIFICAR E DESBLOQUEAR BADGES DE CONCLUSÃO
CREATE OR REPLACE FUNCTION check_and_unlock_completed_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_title TEXT) AS $$
DECLARE
  v_total_completed INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Contar total de materiais concluídos (atividades + bonus)
  SELECT COUNT(*) INTO v_total_completed
  FROM user_progress
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND resource_type IN ('atividade', 'bonus');

  -- Verificar cada badge de conclusão
  FOR v_badge IN
    SELECT * FROM badges
    WHERE type = 'material_completed'
    ORDER BY requirement_value ASC
  LOOP
    -- Verificar se o usuário já desbloqueou esta badge
    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_unlocked;

    -- Se já desbloqueou, pular
    IF v_already_unlocked THEN
      CONTINUE;
    END IF;

    -- Se atingiu o requisito, desbloquear
    IF v_total_completed >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      -- Retornar badge desbloqueada
      badge_id := v_badge.id;
      badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNÇÃO PARA VERIFICAR E DESBLOQUEAR BADGES DE PONTOS
CREATE OR REPLACE FUNCTION check_and_unlock_chat_points_badges(p_user_id UUID)
RETURNS TABLE(badge_id TEXT, badge_title TEXT) AS $$
DECLARE
  v_total_points INTEGER;
  v_badge RECORD;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Pegar total de pontos do usuário da tabela chat_user_stats
  SELECT COALESCE(total_points, 0) INTO v_total_points
  FROM chat_user_stats
  WHERE user_id = p_user_id;

  -- Verificar cada badge de pontos
  FOR v_badge IN
    SELECT * FROM badges
    WHERE type = 'chat_points'
    ORDER BY requirement_value ASC
  LOOP
    -- Verificar se o usuário já desbloqueou esta badge
    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_unlocked;

    -- Se já desbloqueou, pular
    IF v_already_unlocked THEN
      CONTINUE;
    END IF;

    -- Se atingiu o requisito, desbloquear
    IF v_total_points >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      -- Retornar badge desbloqueada
      badge_id := v_badge.id;
      badge_title := v_badge.title;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA DESBLOQUEAR BADGES QUANDO MATERIAIS SÃO BAIXADOS OU CONCLUÍDOS
CREATE OR REPLACE FUNCTION trigger_check_material_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar badges sempre que houver mudança no progresso
  IF NEW.resource_type IN ('atividade', 'bonus') THEN
    -- Verificar badges de download (quando inicia ou conclui)
    IF NEW.status IN ('started', 'completed') THEN
      PERFORM check_and_unlock_download_badges(NEW.user_id);
    END IF;

    -- Verificar badges de conclusão (quando conclui)
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
      PERFORM check_and_unlock_completed_badges(NEW.user_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_material_badges_on_progress ON user_progress;

-- Criar trigger
CREATE TRIGGER trigger_material_badges_on_progress
  AFTER INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_material_badges();

-- 7. TRIGGER PARA DESBLOQUEAR BADGES QUANDO PONTOS SÃO ATUALIZADOS
CREATE OR REPLACE FUNCTION trigger_check_chat_points_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar badges toda vez que os pontos são atualizados
  PERFORM check_and_unlock_chat_points_badges(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_chat_points_badges_on_update ON chat_user_stats;

-- Criar trigger
CREATE TRIGGER trigger_chat_points_badges_on_update
  AFTER INSERT OR UPDATE ON chat_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_chat_points_badges();

-- 8. RLS (ROW LEVEL SECURITY) para badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler badges
CREATE POLICY "Anyone can read badges"
  ON badges FOR SELECT
  USING (true);

-- 9. COMENTÁRIOS
COMMENT ON TABLE badges IS 'Sistema de badges/conquistas para downloads, conclusões e pontos de chat';
COMMENT ON FUNCTION check_and_unlock_download_badges IS 'Verifica e desbloqueia badges baseado em materiais baixados';
COMMENT ON FUNCTION check_and_unlock_completed_badges IS 'Verifica e desbloqueia badges baseado em materiais concluídos';
COMMENT ON FUNCTION check_and_unlock_chat_points_badges IS 'Verifica e desbloqueia badges baseado em pontos de chat';

-- 10. MENSAGEM DE SUCESSO
DO $$
BEGIN
  RAISE NOTICE 'Sistema de Badges criado com sucesso!';
  RAISE NOTICE '4 badges de download (1, 5, 10, 15 materiais baixados)';
  RAISE NOTICE '4 badges de conclusao (1, 5, 10, 15 atividades concluidas)';
  RAISE NOTICE '4 badges de mensagens no chat (10, 50, 100, 200 mensagens)';
  RAISE NOTICE 'Triggers automaticos ativados para desbloquear badges';
  RAISE NOTICE 'Total: 12 badges disponiveis';
  RAISE NOTICE 'Cada badge desbloqueada revela 8.33%% da imagem colorida!';
END $$;
