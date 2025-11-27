-- ============================================
-- LIMPEZA DO SISTEMA ANTIGO DE CONQUISTAS
-- Remove achievements antigas e mantém apenas badges
-- ============================================

-- 1. DELETAR TODAS AS CONQUISTAS ANTIGAS DO USUÁRIO
DELETE FROM user_achievements;

-- 2. DELETAR TODAS AS CONQUISTAS ANTIGAS
DELETE FROM achievements;

-- 3. OPCIONAL: Deletar tabela de gamificação antiga se não for mais usada
-- Comente as linhas abaixo se ainda usar XP/Level
-- DROP TABLE IF EXISTS user_gamification CASCADE;
-- DROP TABLE IF EXISTS xp_history CASCADE;
-- DROP TABLE IF EXISTS achievements CASCADE;
-- DROP TABLE IF EXISTS user_achievements CASCADE;
-- DROP TABLE IF EXISTS levels CASCADE;

SELECT 'Sistema antigo de conquistas limpo com sucesso!' as status;
