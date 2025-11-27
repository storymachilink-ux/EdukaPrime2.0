-- ============================================
-- LIMPEZA: Remover Sistema de Gamificação Novo
-- ============================================
-- Remove as tabelas/triggers que causaram problema
-- ============================================

-- Remover triggers
DROP TRIGGER IF EXISTS trigger_award_streak_bonus ON user_gamification;
DROP TRIGGER IF EXISTS trigger_xp_on_bonus_view ON user_activity_logs;
DROP TRIGGER IF EXISTS trigger_xp_on_video_view ON user_activity_logs;
DROP TRIGGER IF EXISTS trigger_xp_on_activity_download ON user_activity_logs;
DROP TRIGGER IF EXISTS trigger_update_gamification_timestamp ON user_gamification;

-- Remover funções
DROP FUNCTION IF EXISTS trigger_streak_bonus();
DROP FUNCTION IF EXISTS trigger_xp_bonus();
DROP FUNCTION IF EXISTS trigger_xp_video();
DROP FUNCTION IF EXISTS trigger_xp_atividade();
DROP FUNCTION IF EXISTS award_streak_bonus(UUID, INTEGER);
DROP FUNCTION IF EXISTS check_and_unlock_achievements(UUID);
DROP FUNCTION IF EXISTS update_user_streak(UUID);
DROP FUNCTION IF EXISTS add_xp_to_user(UUID, INTEGER, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS update_gamification_timestamp();

-- Remover tabelas
DROP TABLE IF EXISTS xp_history CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS levels CASCADE;

SELECT 'Sistema de gamificação novo removido com sucesso!' as status;