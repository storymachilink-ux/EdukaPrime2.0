-- ============================================
-- DEBUG: TESTAR TRIGGERS DE BADGES
-- ============================================

-- 1. VER SEU USER ID
SELECT id, email FROM auth.users LIMIT 5;

-- 2. VER SEUS DOWNLOADS/CONCLUSÕES ATUAIS
-- Substitua 'SEU_USER_ID_AQUI' pelo seu ID do passo 1
-- SELECT
--   resource_type,
--   resource_title,
--   status,
--   created_at
-- FROM user_progress
-- WHERE user_id = 'SEU_USER_ID_AQUI'
-- ORDER BY created_at DESC;

-- 3. CONTAR DOWNLOADS E CONCLUSÕES
-- SELECT
--   COUNT(CASE WHEN status IN ('started', 'completed') THEN 1 END) as total_downloads,
--   COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_conclusoes
-- FROM user_progress
-- WHERE user_id = 'SEU_USER_ID_AQUI';

-- 4. VER BADGES DESBLOQUEADAS
-- SELECT
--   ub.badge_id,
--   b.title,
--   b.type,
--   b.requirement_value,
--   ub.earned_at
-- FROM user_badges ub
-- JOIN badges b ON b.id = ub.badge_id
-- WHERE ub.user_id = 'SEU_USER_ID_AQUI'
-- ORDER BY ub.earned_at DESC;

-- 5. SIMULAR UM DOWNLOAD (TESTE MANUAL)
-- Descomente as linhas abaixo, substitua SEU_USER_ID_AQUI e execute:
-- INSERT INTO user_progress (user_id, resource_type, resource_id, resource_title, status)
-- VALUES ('SEU_USER_ID_AQUI', 'atividade', 'test-123', 'Atividade de Teste', 'started')
-- ON CONFLICT (user_id, resource_type, resource_id) DO NOTHING;

-- 6. VERIFICAR SE BADGE FOI DESBLOQUEADA (após passo 5)
-- SELECT * FROM user_badges WHERE user_id = 'SEU_USER_ID_AQUI';

-- 7. FORÇAR VERIFICAÇÃO DE BADGES (se os triggers não estiverem funcionando)
-- SELECT * FROM check_and_unlock_download_badges('SEU_USER_ID_AQUI');
-- SELECT * FROM check_and_unlock_completed_badges('SEU_USER_ID_AQUI');
