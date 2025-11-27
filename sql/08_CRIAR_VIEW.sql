-- ========================================
-- PASSO 8: CRIAR VIEW user_current_access
-- ========================================
-- Execute ISSO NONO no Supabase SQL Editor

DROP VIEW IF EXISTS user_current_access CASCADE;

CREATE VIEW user_current_access AS
SELECT
  u.id,
  u.email,
  COALESCE(us_monthly.plan_id, us_lifetime.plan_id, 0) as current_plan_id,
  COALESCE(p.name, 'GRATUITO') as plan_name,
  COALESCE(p.display_name, 'Plano Gratuito') as plan_display_name,
  us_lifetime.id IS NOT NULL as has_lifetime_access,
  us_monthly.end_date as monthly_expires_at,
  us_monthly.next_renewal_date,
  us_monthly.id as monthly_subscription_id,
  us_lifetime.id as lifetime_subscription_id
FROM auth.users u
LEFT JOIN user_subscriptions us_monthly
  ON u.id = us_monthly.user_id
  AND us_monthly.status = 'active'
  AND us_monthly.plan_id IN (1, 2, 3)
  AND (us_monthly.end_date IS NULL OR us_monthly.end_date > NOW())
LEFT JOIN user_subscriptions us_lifetime
  ON u.id = us_lifetime.user_id
  AND us_lifetime.status = 'active'
  AND us_lifetime.plan_id = 4
LEFT JOIN plans_v2 p
  ON COALESCE(us_monthly.plan_id, us_lifetime.plan_id, 0) = p.id;

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 09_VERIFICACAO_FINAL.sql
-- ========================================
