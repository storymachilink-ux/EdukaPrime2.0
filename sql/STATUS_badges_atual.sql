-- ============================================
-- STATUS ATUAL DO SISTEMA DE BADGES
-- Execute para ver o estado completo
-- ============================================

-- 1. BADGES CADASTRADAS NO SISTEMA
SELECT
  '📊 BADGES CADASTRADAS' as secao,
  COUNT(*) as total,
  COUNT(CASE WHEN type = 'material_download' THEN 1 END) as downloads,
  COUNT(CASE WHEN type = 'material_completed' THEN 1 END) as conclusoes,
  COUNT(CASE WHEN type = 'chat_points' THEN 1 END) as chat
FROM badges;

-- 2. LISTAR TODAS AS BADGES
SELECT
  CASE
    WHEN type = 'material_download' THEN '📥 Download'
    WHEN type = 'material_completed' THEN '✅ Conclusão'
    WHEN type = 'chat_points' THEN '💬 Chat'
  END as categoria,
  icon,
  title,
  description,
  requirement_value as requisito
FROM badges
ORDER BY type, requirement_value;

-- 3. BADGES DESBLOQUEADAS (GLOBAL)
SELECT
  '🏆 BADGES DESBLOQUEADAS (TODOS USUÁRIOS)' as secao,
  COUNT(*) as total_desbloqueadas,
  COUNT(DISTINCT user_id) as usuarios_com_badges
FROM user_badges;

-- 4. TOP USUÁRIOS COM MAIS BADGES
SELECT
  u.email,
  COUNT(ub.badge_id) as badges_desbloqueadas,
  ROUND((COUNT(ub.badge_id) * 100.0 / 12), 2) as porcentagem
FROM user_badges ub
JOIN auth.users u ON u.id = ub.user_id
GROUP BY u.id, u.email
ORDER BY badges_desbloqueadas DESC
LIMIT 10;

-- 5. VERIFICAR TRIGGERS ATIVOS
SELECT
  trigger_name,
  event_object_table as tabela,
  action_statement as funcao
FROM information_schema.triggers
WHERE trigger_name LIKE '%badge%'
ORDER BY event_object_table;

-- 6. VERIFICAR SE TABELAS ANTIGAS AINDA EXISTEM
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements')
    THEN '⚠️ TABELA achievements AINDA EXISTE - Execute FINAL_badges_system.sql'
    ELSE '✅ Tabela achievements removida'
  END as status_achievements,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_gamification')
    THEN '⚠️ TABELA user_gamification AINDA EXISTE - Execute FINAL_badges_system.sql'
    ELSE '✅ Tabela user_gamification removida'
  END as status_gamification;
