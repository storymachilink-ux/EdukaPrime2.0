-- ========================================
-- DIAGNÓSTICO: REGISTROS ÓRFÃOS
-- ========================================
-- Este script mostra quais registros órfãos existem

-- ========================================
-- DIAGNOSTICAR: plan_atividades órfãs
-- ========================================
SELECT 'plan_atividades órfãs' as tipo, COUNT(*) as count
FROM plan_atividades pa
WHERE pa.atividade_id NOT IN (SELECT id FROM atividades);

-- Mostrar os registros órfãos
SELECT 'plan_atividades' as tabela, pa.plan_id, pa.atividade_id, 'DELETED' as status
FROM plan_atividades pa
WHERE pa.atividade_id NOT IN (SELECT id FROM atividades)
LIMIT 10;

-- ========================================
-- DIAGNOSTICAR: plan_videos órfãs
-- ========================================
SELECT 'plan_videos órfãs' as tipo, COUNT(*) as count
FROM plan_videos pv
WHERE pv.video_id NOT IN (SELECT id FROM videos);

-- Mostrar os registros órfãos
SELECT 'plan_videos' as tabela, pv.plan_id, pv.video_id, 'DELETED' as status
FROM plan_videos pv
WHERE pv.video_id NOT IN (SELECT id FROM videos)
LIMIT 10;

-- ========================================
-- DIAGNOSTICAR: plan_bonus órfãs
-- ========================================
SELECT 'plan_bonus órfãs' as tipo, COUNT(*) as count
FROM plan_bonus pb
WHERE pb.bonus_id NOT IN (SELECT id FROM bonus);

-- Mostrar os registros órfãos
SELECT 'plan_bonus' as tabela, pb.plan_id, pb.bonus_id, 'DELETED' as status
FROM plan_bonus pb
WHERE pb.bonus_id NOT IN (SELECT id FROM bonus)
LIMIT 10;

-- ========================================
-- DIAGNOSTICAR: plan_papercrafts órfãs
-- ========================================
SELECT 'plan_papercrafts órfãs' as tipo, COUNT(*) as count
FROM plan_papercrafts pp
WHERE pp.papercraft_id NOT IN (SELECT id FROM papercrafts);

-- Mostrar os registros órfãos
SELECT 'plan_papercrafts' as tabela, pp.plan_id, pp.papercraft_id, 'DELETED' as status
FROM plan_papercrafts pp
WHERE pp.papercraft_id NOT IN (SELECT id FROM papercrafts)
LIMIT 10;

-- ========================================
-- RESUMO GERAL
-- ========================================
SELECT
  'RESUMO DE DADOS' as tipo,
  (SELECT COUNT(*) FROM atividades) as total_atividades,
  (SELECT COUNT(*) FROM videos) as total_videos,
  (SELECT COUNT(*) FROM bonus) as total_bonus,
  (SELECT COUNT(*) FROM papercrafts) as total_papercrafts;
