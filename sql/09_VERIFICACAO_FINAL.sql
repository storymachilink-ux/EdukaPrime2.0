-- ========================================
-- PASSO 9: VERIFICAÇÕES FINAIS
-- ========================================
-- Execute ISSO DÉCIMO (FINAL!) no Supabase SQL Editor

-- Teste 1: Tabelas existem?
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('plans_v2', 'plan_features', 'user_subscriptions') ORDER BY tablename;

-- Teste 2: 5 planos foram inseridos?
SELECT COUNT(*) as total_planos FROM plans_v2;

-- Teste 3: 30 features foram inseridas?
SELECT COUNT(*) as total_features FROM plan_features;

-- Teste 4: Ver todos os planos
SELECT id, name, display_name, price, payment_type FROM plans_v2 ORDER BY id;

-- Teste 5: Ver features do plano ESSENCIAL (ID 1)
SELECT plan_id, feature_name, is_enabled FROM plan_features WHERE plan_id = 1 ORDER BY feature_name;

-- Teste 6: View user_current_access existe?
SELECT * FROM information_schema.views WHERE table_name = 'user_current_access';

-- Teste 7: Funções foram criadas?
SELECT routine_name FROM information_schema.routines WHERE routine_type = 'FUNCTION' AND routine_name IN ('activate_user_subscription', 'user_has_feature_access');

-- ========================================
-- Se tudo passou, você tem:
-- ✅ Tabela plans_v2 com 5 planos
-- ✅ Tabela plan_features com 30 features
-- ✅ Tabela user_subscriptions (vazia)
-- ✅ View user_current_access
-- ✅ Função activate_user_subscription
-- ✅ Função user_has_feature_access
-- ========================================
-- PRONTO! O BANCO ESTÁ REFATORADO!
-- ========================================
