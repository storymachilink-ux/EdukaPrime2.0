-- ========================================
-- LIMPAR REGISTROS ÓRFÃOS DAS TABELAS DE JUNÇÃO
-- ========================================
-- Este script remove referências para items deletados nas tabelas de junção

-- ========================================
-- LIMPEZA: plan_atividades
-- ========================================
DELETE FROM plan_atividades
WHERE atividade_id NOT IN (
  SELECT id FROM atividades
);

-- ========================================
-- LIMPEZA: plan_videos
-- ========================================
DELETE FROM plan_videos
WHERE video_id NOT IN (
  SELECT id FROM videos
);

-- ========================================
-- LIMPEZA: plan_bonus
-- ========================================
DELETE FROM plan_bonus
WHERE bonus_id NOT IN (
  SELECT id FROM bonus
);

-- ========================================
-- LIMPEZA: plan_papercrafts
-- ========================================
DELETE FROM plan_papercrafts
WHERE papercraft_id NOT IN (
  SELECT id FROM papercrafts
);

-- ========================================
-- VERIFICAÇÃO DE LIMPEZA
-- ========================================
SELECT
  (SELECT COUNT(*) FROM plan_atividades) as plan_atividades_count,
  (SELECT COUNT(*) FROM plan_videos) as plan_videos_count,
  (SELECT COUNT(*) FROM plan_bonus) as plan_bonus_count,
  (SELECT COUNT(*) FROM plan_papercrafts) as plan_papercrafts_count;

SELECT '✅ Limpeza de registros órfãos concluída!' as status;
