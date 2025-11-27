-- =====================================================
-- DESBLOQUEIO MANUAL SIMPLIFICADO
-- Desbloqueia badges automaticamente para TODOS os usuários
-- =====================================================

-- Se o usuário tem 10+ downloads, desbloqueia as 4 badges de download
WITH download_counts AS (
  SELECT
    user_id,
    COUNT(*) as total_downloads
  FROM user_progress
  WHERE resource_type IN ('atividade', 'bonus')
    AND status IN ('started', 'completed')
  GROUP BY user_id
)
INSERT INTO user_badges (user_id, badge_id)
SELECT
  dc.user_id,
  b.id
FROM download_counts dc
CROSS JOIN badges b
WHERE b.type = 'material_download'
  AND dc.total_downloads >= b.requirement_value
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = dc.user_id
      AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Se o usuário tem 10+ conclusões, desbloqueia as 4 badges de conclusão
WITH completion_counts AS (
  SELECT
    user_id,
    COUNT(*) as total_completed
  FROM user_progress
  WHERE resource_type IN ('atividade', 'bonus')
    AND status = 'completed'
  GROUP BY user_id
)
INSERT INTO user_badges (user_id, badge_id)
SELECT
  cc.user_id,
  b.id
FROM completion_counts cc
CROSS JOIN badges b
WHERE b.type = 'material_completed'
  AND cc.total_completed >= b.requirement_value
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = cc.user_id
      AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Se o usuário tem 100+ pontos de chat, desbloqueia as 4 badges de chat
WITH chat_counts AS (
  SELECT
    user_id,
    COALESCE(total_points, 0) as total_points
  FROM chat_user_stats
)
INSERT INTO user_badges (user_id, badge_id)
SELECT
  cc.user_id,
  b.id
FROM chat_counts cc
CROSS JOIN badges b
WHERE b.type = 'chat_points'
  AND cc.total_points >= b.requirement_value
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = cc.user_id
      AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Verificar resultado
SELECT
  '✅ BADGES DESBLOQUEADAS MANUALMENTE!' as status,
  (SELECT COUNT(*) FROM user_badges) as total_desbloqueadas,
  'Recarregue o app para ver as alterações' as instrucao;
