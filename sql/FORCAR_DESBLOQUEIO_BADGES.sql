-- ============================================
-- FORÇAR DESBLOQUEIO DE BADGES
-- Execute este SQL se você já tem downloads/conclusões
-- mas as badges não foram desbloqueadas automaticamente
-- ============================================

-- PASSO 1: Descubra seu user_id
SELECT
  id as user_id,
  email
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Copie seu user_id do resultado acima e substitua nos comandos abaixo

-- ============================================
-- PASSO 2: Verificar seu progresso atual
-- ============================================

-- Seus downloads e conclusões
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT
  resource_type,
  resource_title,
  status,
  created_at
FROM user_progress
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC;
*/

-- Contar totais
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT
  COUNT(CASE WHEN status IN ('started', 'completed') THEN 1 END) as total_downloads,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_conclusoes
FROM user_progress
WHERE user_id = 'SEU_USER_ID_AQUI'
  AND resource_type IN ('atividade', 'bonus');
*/

-- ============================================
-- PASSO 3: FORÇAR VERIFICAÇÃO DE BADGES
-- ============================================

-- Verificar e desbloquear badges de DOWNLOAD
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT * FROM check_and_unlock_download_badges('SEU_USER_ID_AQUI');
*/

-- Verificar e desbloquear badges de CONCLUSÃO
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT * FROM check_and_unlock_completed_badges('SEU_USER_ID_AQUI');
*/

-- Verificar e desbloquear badges de CHAT
-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT * FROM check_and_unlock_chat_points_badges('SEU_USER_ID_AQUI');
*/

-- ============================================
-- PASSO 4: Ver badges desbloqueadas
-- ============================================

-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT
  ub.badge_id,
  b.icon,
  b.title,
  b.description,
  b.type,
  b.requirement_value,
  ub.earned_at
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
WHERE ub.user_id = 'SEU_USER_ID_AQUI'
ORDER BY ub.earned_at DESC;
*/

-- ============================================
-- PASSO 5: Calcular % de revelação da imagem
-- ============================================

-- DESCOMENTE E SUBSTITUA 'SEU_USER_ID_AQUI':
/*
SELECT
  COUNT(*) as badges_desbloqueadas,
  ROUND((COUNT(*) * 100.0 / 12), 2) as porcentagem_revelacao
FROM user_badges
WHERE user_id = 'SEU_USER_ID_AQUI';
*/

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute o PASSO 1 para ver seu user_id
-- 2. Copie seu user_id
-- 3. Descomente os comandos dos PASSOS 2-5
-- 4. Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real
-- 5. Execute cada bloco
-- 6. Recarregue o Dashboard (F5)
-- 7. ✨ Badges devem aparecer coloridas!
