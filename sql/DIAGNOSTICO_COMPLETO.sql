-- ============================================
-- DIAGNÓSTICO COMPLETO DO SISTEMA
-- Execute este SQL para ver exatamente o que está acontecendo
-- ============================================

-- 1. VER SEU USER_ID
SELECT
  id,
  email,
  nome
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- COPIE SEU USER_ID e substitua 'SEU_USER_ID' nos comandos abaixo

-- ============================================
-- 2. VERIFICAR SE BADGES EXISTEM NO BANCO
-- ============================================
SELECT
  '📊 BADGES NO SISTEMA' as secao,
  COUNT(*) as total
FROM badges;

-- Ver todas as 12 badges
SELECT
  id,
  icon,
  title,
  type,
  requirement_value
FROM badges
ORDER BY type, requirement_value;

-- ============================================
-- 3. VERIFICAR SUAS AÇÕES (user_progress)
-- ============================================
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID':
/*
SELECT
  '📝 SUAS AÇÕES' as secao,
  resource_type,
  resource_title,
  status,
  created_at
FROM user_progress
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC;
*/

-- ============================================
-- 4. CONTAR DOWNLOADS E CONCLUSÕES
-- ============================================
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID':
/*
SELECT
  '📊 SUAS ESTATÍSTICAS' as secao,
  COUNT(CASE WHEN status IN ('started', 'completed') THEN 1 END) as total_downloads,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_conclusoes
FROM user_progress
WHERE user_id = 'SEU_USER_ID'
  AND resource_type IN ('atividade', 'bonus');
*/

-- ============================================
-- 5. VER SUAS BADGES DESBLOQUEADAS
-- ============================================
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID':
/*
SELECT
  '🏆 SUAS BADGES' as secao,
  ub.badge_id,
  b.icon,
  b.title,
  b.type,
  b.requirement_value,
  ub.earned_at
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
WHERE ub.user_id = 'SEU_USER_ID'
ORDER BY ub.earned_at DESC;
*/

-- ============================================
-- 6. CALCULAR % DA IMAGEM
-- ============================================
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID':
/*
SELECT
  '🎨 REVELAÇÃO DA IMAGEM' as secao,
  COUNT(*) as badges_desbloqueadas,
  ROUND((COUNT(*) * 100.0 / 12), 2) as porcentagem_revelacao,
  CASE
    WHEN COUNT(*) = 0 THEN 'Nenhuma badge - Imagem totalmente cinza'
    WHEN COUNT(*) < 12 THEN CONCAT(ROUND((COUNT(*) * 100.0 / 12), 2), '% revelado')
    ELSE '100% revelado - Botão verde ativo!'
  END as status_imagem
FROM user_badges
WHERE user_id = 'SEU_USER_ID';
*/

-- ============================================
-- 7. VERIFICAR TRIGGERS ATIVOS
-- ============================================
SELECT
  '🔧 TRIGGERS' as secao,
  trigger_name,
  event_object_table as tabela,
  event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_name LIKE '%badge%'
ORDER BY event_object_table;

-- ============================================
-- 8. TESTE: FORÇAR DESBLOQUEIO
-- ============================================
-- Se você tem downloads/conclusões mas nenhuma badge foi desbloqueada,
-- execute isto para forçar verificação:

-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID':
/*
SELECT * FROM check_and_unlock_download_badges('SEU_USER_ID');
SELECT * FROM check_and_unlock_completed_badges('SEU_USER_ID');
*/

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute o item 1 para ver seu user_id
-- 2. Copie seu user_id
-- 3. Descomente os itens 3, 4, 5, 6, 8
-- 4. Substitua 'SEU_USER_ID' pelo seu user_id real
-- 5. Execute cada bloco
-- 6. Me envie os resultados!
