-- ============================================
-- TESTE MANUAL DE BADGES
-- Use este SQL para testar o sistema
-- ============================================

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do seu usuário
-- Para descobrir seu user_id, execute: SELECT id, email FROM auth.users LIMIT 5;

-- 1. VER TODAS AS BADGES DISPONÍVEIS
SELECT * FROM badges ORDER BY type, requirement_value;

-- 2. VER SUAS BADGES ATUAIS
-- SELECT * FROM user_badges WHERE user_id = 'SEU_USER_ID_AQUI';

-- 3. SIMULAR DESBLOQUEIO DE 1 BADGE DE DOWNLOAD (teste)
-- Descomente as linhas abaixo e substitua o user_id:
/*
INSERT INTO user_badges (user_id, badge_id)
VALUES ('SEU_USER_ID_AQUI', 'material_download_1')
ON CONFLICT (user_id, badge_id) DO NOTHING;
*/

-- 4. SIMULAR DESBLOQUEIO DE 1 BADGE DE CONCLUSÃO (teste)
/*
INSERT INTO user_badges (user_id, badge_id)
VALUES ('SEU_USER_ID_AQUI', 'material_completed_1')
ON CONFLICT (user_id, badge_id) DO NOTHING;
*/

-- 5. SIMULAR DESBLOQUEIO DE 1 BADGE DE CHAT (teste)
/*
INSERT INTO user_badges (user_id, badge_id)
VALUES ('SEU_USER_ID_AQUI', 'chat_100')
ON CONFLICT (user_id, badge_id) DO NOTHING;
*/

-- 6. CONTAR QUANTAS BADGES VOCÊ TEM
-- SELECT COUNT(*) as total_badges FROM user_badges WHERE user_id = 'SEU_USER_ID_AQUI';

-- 7. CALCULAR SUA PORCENTAGEM
-- SELECT
--   COUNT(*) as badges_desbloqueadas,
--   ROUND((COUNT(*) * 100.0 / 12), 2) as porcentagem_revelacao
-- FROM user_badges
-- WHERE user_id = 'SEU_USER_ID_AQUI';

-- 8. FORÇAR VERIFICAÇÃO DE BADGES (se já tiver downloads/conclusões/pontos)
-- SELECT * FROM check_and_unlock_download_badges('SEU_USER_ID_AQUI');
-- SELECT * FROM check_and_unlock_completed_badges('SEU_USER_ID_AQUI');
-- SELECT * FROM check_and_unlock_chat_points_badges('SEU_USER_ID_AQUI');
