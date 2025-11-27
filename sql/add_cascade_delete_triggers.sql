-- ========================================
-- ADICIONAR TRIGGERS PARA CASCADE DELETE
-- ========================================
-- Quando um item (atividade, video, bonus, papercraft) é deletado,
-- sua referência nas tabelas de junção também deve ser deletada automaticamente

-- ========================================
-- TRIGGER PARA ATIVIDADES
-- ========================================

-- Função para deletar referências em plan_atividades
CREATE OR REPLACE FUNCTION delete_atividade_references()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM plan_atividades WHERE atividade_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_delete_atividade_references ON atividades;

-- Criar trigger
CREATE TRIGGER trigger_delete_atividade_references
BEFORE DELETE ON atividades
FOR EACH ROW
EXECUTE FUNCTION delete_atividade_references();

-- ========================================
-- TRIGGER PARA VIDEOS
-- ========================================

-- Função para deletar referências em plan_videos
CREATE OR REPLACE FUNCTION delete_video_references()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM plan_videos WHERE video_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_delete_video_references ON videos;

-- Criar trigger
CREATE TRIGGER trigger_delete_video_references
BEFORE DELETE ON videos
FOR EACH ROW
EXECUTE FUNCTION delete_video_references();

-- ========================================
-- TRIGGER PARA BONUS
-- ========================================

-- Função para deletar referências em plan_bonus
CREATE OR REPLACE FUNCTION delete_bonus_references()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM plan_bonus WHERE bonus_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_delete_bonus_references ON bonus;

-- Criar trigger
CREATE TRIGGER trigger_delete_bonus_references
BEFORE DELETE ON bonus
FOR EACH ROW
EXECUTE FUNCTION delete_bonus_references();

-- ========================================
-- TRIGGER PARA PAPERCRAFTS
-- ========================================

-- Função para deletar referências em plan_papercrafts
CREATE OR REPLACE FUNCTION delete_papercraft_references()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM plan_papercrafts WHERE papercraft_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_delete_papercraft_references ON papercrafts;

-- Criar trigger
CREATE TRIGGER trigger_delete_papercraft_references
BEFORE DELETE ON papercrafts
FOR EACH ROW
EXECUTE FUNCTION delete_papercraft_references();

-- ========================================
-- VERIFICAÇÃO
-- ========================================
SELECT '✅ Triggers de CASCADE DELETE criados com sucesso!' as status;
