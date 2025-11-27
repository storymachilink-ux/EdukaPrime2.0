-- ================================================
-- FORÇAR DESBLOQUEIO DE BADGES BASEADO EM PROGRESSO
-- ================================================
-- Se os triggers não estão funcionando, vamos executar manualmente

-- PASSO 1: Buscar usuários com progresso
-- ================================================
WITH users_with_progress AS (
  SELECT DISTINCT user_id
  FROM user_progress
  WHERE resource_type IN ('atividade', 'bonus')
    AND (status = 'started' OR status = 'completed')
),

-- PASSO 2: Contar downloads e conclusões por usuário
user_stats AS (
  SELECT
    up.user_id,
    COUNT(CASE WHEN status IN ('started', 'completed') THEN 1 END) as total_downloads,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_completed
  FROM user_progress up
  WHERE resource_type IN ('atividade', 'bonus')
  GROUP BY up.user_id
),

-- PASSO 3: Determinar quais badges cada usuário deve desbloquear
badges_to_unlock AS (
  SELECT
    us.user_id,
    b.id as badge_id,
    b.title,
    b.type,
    CASE
      WHEN b.type = 'material_download' AND us.total_downloads >= b.requirement_value THEN TRUE
      WHEN b.type = 'material_completed' AND us.total_completed >= b.requirement_value THEN TRUE
      ELSE FALSE
    END as should_unlock
  FROM user_stats us
  CROSS JOIN badges b
  WHERE b.type IN ('material_download', 'material_completed')
)

-- PASSO 4: Inserir badges desbloqueadas (evitar duplicatas)
INSERT INTO user_badges (user_id, badge_id)
SELECT user_id, badge_id
FROM badges_to_unlock
WHERE should_unlock = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = badges_to_unlock.user_id
      AND ub.badge_id = badges_to_unlock.badge_id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- PASSO 5: Verificar resultado
SELECT
  '✅ Desbloqueio manual executado!' as status,
  (SELECT COUNT(*) FROM user_badges) as total_badges_desbloqueadas,
  'Verifique a página Conquistas' as proxima_acao;
