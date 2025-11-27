-- ============================================
-- VERIFICAR SE TRIGGERS ESTÃO ATIVOS
-- ============================================

-- 1. Verificar triggers de badges
SELECT
  trigger_name,
  event_object_table as tabela,
  event_manipulation as evento,
  action_statement as funcao
FROM information_schema.triggers
WHERE trigger_name LIKE '%badge%'
ORDER BY event_object_table;

-- 2. Verificar se funções existem
SELECT
  routine_name as funcao,
  routine_type as tipo
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%badge%'
ORDER BY routine_name;

-- 3. Testar se badges foram criadas
SELECT
  COUNT(*) as total_badges,
  COUNT(CASE WHEN type = 'material_download' THEN 1 END) as downloads,
  COUNT(CASE WHEN type = 'material_completed' THEN 1 END) as conclusoes,
  COUNT(CASE WHEN type = 'chat_points' THEN 1 END) as chat
FROM badges;

-- 4. Verificar RLS (Row Level Security)
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('badges', 'user_badges')
ORDER BY tablename, policyname;

-- 5. Verificar se há user_badges criadas
SELECT
  COUNT(*) as total_user_badges,
  COUNT(DISTINCT user_id) as usuarios_com_badges
FROM user_badges;
