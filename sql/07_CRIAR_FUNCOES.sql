-- ========================================
-- PASSO 7: CRIAR FUNÇÕES SQL
-- ========================================
-- Execute ISSO OITAVO no Supabase SQL Editor

-- Função 1: Ativar subscription via webhook
CREATE OR REPLACE FUNCTION activate_user_subscription(
  p_user_id UUID,
  p_plan_id INTEGER,
  p_payment_id TEXT,
  p_product_id_gateway TEXT,
  p_payment_method VARCHAR,
  p_amount_paid DECIMAL
) RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_duration INTEGER;
BEGIN
  -- Obter duração do plano
  SELECT duration_days INTO v_duration
  FROM plans_v2
  WHERE id = p_plan_id;

  -- Calcular end_date se plano tem duração
  IF v_duration IS NOT NULL THEN
    v_end_date := NOW() + (v_duration || ' days')::INTERVAL;
  END IF;

  -- Se é plano mensal (1,2,3), desativar outros mensais
  IF p_plan_id IN (1, 2, 3) THEN
    UPDATE user_subscriptions
    SET status = 'inactive', updated_at = NOW()
    WHERE user_id = p_user_id
      AND plan_id IN (1, 2, 3)
      AND status = 'active';
  END IF;

  -- Criar nova subscription
  INSERT INTO user_subscriptions (
    user_id, plan_id, status, start_date, end_date,
    payment_id, product_id_gateway, payment_method, amount_paid,
    auto_renew, next_renewal_date
  ) VALUES (
    p_user_id,
    p_plan_id,
    'active',
    NOW(),
    v_end_date,
    p_payment_id,
    p_product_id_gateway,
    p_payment_method,
    p_amount_paid,
    CASE WHEN p_plan_id IN (1,2,3) THEN true ELSE false END,
    CASE WHEN p_plan_id IN (1,2,3) THEN NOW() + INTERVAL '30 days' ELSE NULL END
  ) RETURNING id INTO v_subscription_id;

  -- Atualizar users
  UPDATE users
  SET
    active_plan_id = CASE WHEN p_plan_id IN (1,2,3) THEN p_plan_id ELSE active_plan_id END,
    has_lifetime_access = CASE WHEN p_plan_id = 4 THEN true ELSE has_lifetime_access END,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função 2: Verificar acesso a feature
CREATE OR REPLACE FUNCTION user_has_feature_access(
  p_user_id UUID,
  p_feature_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN := false;
  v_lifetime_access BOOLEAN;
  v_plan_id INTEGER;
BEGIN
  -- Verificar se tem acesso vitalício
  SELECT has_lifetime_access INTO v_lifetime_access
  FROM users
  WHERE id = p_user_id;

  -- Se tem vitalício, retorna true
  IF v_lifetime_access THEN
    RETURN true;
  END IF;

  -- Obter plano mensal ativo
  SELECT plan_id INTO v_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND plan_id IN (1, 2, 3)
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não tem plano, usar GRATUITO
  IF v_plan_id IS NULL THEN
    v_plan_id := 0;
  END IF;

  -- Verificar se plano libera este feature
  SELECT is_enabled INTO v_has_access
  FROM plan_features
  WHERE plan_id = v_plan_id
    AND feature_name = p_feature_name;

  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 08_CRIAR_VIEW.sql
-- ========================================
