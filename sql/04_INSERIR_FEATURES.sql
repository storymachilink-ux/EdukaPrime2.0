-- ========================================
-- PASSO 4: INSERIR 30 FEATURES (5 planos × 6 features)
-- ========================================
-- Execute ISSO QUINTO no Supabase SQL Editor

-- GRATUITO (ID 0)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (0, 'atividades', false),
  (0, 'videos', false),
  (0, 'bonus', false),
  (0, 'papercrafts', false),
  (0, 'comunidade', false),
  (0, 'suporte_vip', false);

-- ESSENCIAL (ID 1)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (1, 'atividades', true),
  (1, 'videos', false),
  (1, 'bonus', false),
  (1, 'papercrafts', false),
  (1, 'comunidade', false),
  (1, 'suporte_vip', false);

-- EVOLUIR (ID 2)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (2, 'atividades', true),
  (2, 'videos', true),
  (2, 'bonus', true),
  (2, 'papercrafts', false),
  (2, 'comunidade', false),
  (2, 'suporte_vip', false);

-- PRIME (ID 3)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (3, 'atividades', true),
  (3, 'videos', true),
  (3, 'bonus', true),
  (3, 'papercrafts', true),
  (3, 'comunidade', true),
  (3, 'suporte_vip', true);

-- VITALÍCIO (ID 4)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (4, 'atividades', true),
  (4, 'videos', true),
  (4, 'bonus', true),
  (4, 'papercrafts', true),
  (4, 'comunidade', true),
  (4, 'suporte_vip', true);

-- Verificar: SELECT COUNT(*) FROM plan_features; (deve retornar 30)

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 05_CRIAR_USER_SUBSCRIPTIONS.sql
-- ========================================
