-- ========================================
-- DEBUG: Verificar subscriptions do usuário joia@hotmail.com
-- ========================================

-- 1. Encontrar user ID da joia@hotmail.com
SELECT id, email, active_plan_id, has_lifetime_access FROM users WHERE email = 'joia@hotmail.com';

-- 2. Ver TODAS as subscriptions do usuário (incluindo inativas)
SELECT
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.start_date,
  us.end_date,
  pv2.name,
  pv2.payment_type,
  pv2.duration_days
FROM user_subscriptions us
JOIN plans_v2 pv2 ON pv2.id = us.plan_id
WHERE us.user_id = (SELECT id FROM auth.users WHERE email = 'joia@hotmail.com')
ORDER BY us.created_at DESC;

-- 3. Ver APENAS as subscriptions ATIVAS
SELECT
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.start_date,
  us.end_date,
  pv2.name,
  pv2.payment_type,
  pv2.duration_days
FROM user_subscriptions us
JOIN plans_v2 pv2 ON pv2.id = us.plan_id
WHERE us.user_id = (SELECT id FROM auth.users WHERE email = 'joia@hotmail.com')
  AND us.status = 'active'
ORDER BY us.created_at DESC;

-- 4. Ver quais planos mensais (mensal) estão ativos
SELECT
  us.id,
  us.plan_id,
  us.status,
  pv2.name,
  pv2.payment_type,
  us.end_date
FROM user_subscriptions us
JOIN plans_v2 pv2 ON pv2.id = us.plan_id
WHERE us.user_id = (SELECT id FROM auth.users WHERE email = 'joia@hotmail.com')
  AND us.status = 'active'
  AND pv2.payment_type = 'mensal';

-- 5. Contar quantas subscriptions este usuário tem
SELECT COUNT(*) as total_subscriptions FROM user_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'joia@hotmail.com');

SELECT COUNT(*) as active_subscriptions FROM user_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'joia@hotmail.com')
  AND status = 'active';
