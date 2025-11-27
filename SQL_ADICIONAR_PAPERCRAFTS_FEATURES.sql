-- ============================================
-- Adicionar papercrafts em plan_features
-- ============================================

-- Verificar se já existem registros de papercrafts em plan_features
SELECT COUNT(*) as total_papercrafts FROM plan_features WHERE feature_name = 'papercrafts';

-- Adicionar papercrafts para cada plano (se não existir)
-- Note: Cada linha precisa de um UUID único
INSERT INTO plan_features (id, plan_id, feature_name, is_enabled, created_at, updated_at)
VALUES
  (gen_random_uuid(), 0, 'papercrafts', false, NOW(), NOW()),     -- GRATUITO: sem acesso
  (gen_random_uuid(), 1, 'papercrafts', true, NOW(), NOW()),      -- ESSENCIAL: COM acesso
  (gen_random_uuid(), 2, 'papercrafts', true, NOW(), NOW()),      -- EVOLUIR: COM acesso
  (gen_random_uuid(), 3, 'papercrafts', true, NOW(), NOW()),      -- PRIME: COM acesso
  (gen_random_uuid(), 4, 'papercrafts', true, NOW(), NOW())       -- VITALÍCIO: COM acesso
ON CONFLICT (plan_id, feature_name) DO UPDATE
SET is_enabled = EXCLUDED.is_enabled,
    updated_at = NOW();

-- Verificar resultado
SELECT plan_id, feature_name, is_enabled FROM plan_features
WHERE feature_name = 'papercrafts'
ORDER BY plan_id;
