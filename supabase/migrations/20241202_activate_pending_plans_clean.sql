ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS activated_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DROP FUNCTION IF EXISTS activate_pending_plans(UUID, VARCHAR) CASCADE;

CREATE OR REPLACE FUNCTION activate_pending_plans(
  p_user_id UUID,
  p_user_email VARCHAR
)
RETURNS TABLE (
  total_activated INTEGER,
  last_plan_id INTEGER
) AS $$
DECLARE
  v_total_activated INTEGER := 0;
  v_last_plan_id INTEGER := 0;
  v_pending_plan RECORD;
BEGIN
  FOR v_pending_plan IN
    SELECT
      id,
      plan_id,
      end_date,
      payment_id,
      product_id_gateway,
      payment_method,
      amount_paid,
      webhook_id,
      platform
    FROM pending_plans
    WHERE LOWER(email) = LOWER(p_user_email)
      AND status = 'pending'
    ORDER BY created_at ASC
  LOOP
    v_last_plan_id := v_pending_plan.plan_id;

    BEGIN
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        start_date,
        end_date,
        payment_id,
        product_id_gateway,
        payment_method,
        amount_paid,
        webhook_id
      ) VALUES (
        p_user_id,
        v_pending_plan.plan_id,
        'active',
        NOW(),
        v_pending_plan.end_date,
        v_pending_plan.payment_id,
        v_pending_plan.product_id_gateway,
        v_pending_plan.payment_method,
        v_pending_plan.amount_paid,
        v_pending_plan.webhook_id
      )
      ON CONFLICT (user_id, plan_id, payment_id) DO NOTHING;

      UPDATE users
      SET
        active_plan_id = v_pending_plan.plan_id,
        plano_ativo = v_pending_plan.plan_id,
        updated_at = NOW()
      WHERE id = p_user_id;

      UPDATE pending_plans
      SET
        status = 'activated',
        activated_user_id = p_user_id,
        activated_at = NOW(),
        updated_at = NOW()
      WHERE id = v_pending_plan.id
        AND status = 'pending';

      v_total_activated := v_total_activated + 1;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro ao ativar plano %: %', v_pending_plan.id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;

  RETURN QUERY SELECT v_total_activated, v_last_plan_id;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro geral: %', SQLERRM;
  RETURN QUERY SELECT 0::INTEGER, 0::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION activate_pending_plans(UUID, VARCHAR)
  TO service_role, authenticated;

CREATE INDEX IF NOT EXISTS idx_pending_plans_email_status
ON pending_plans(LOWER(email), status)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_pending_plans_payment_id_status
ON pending_plans(payment_id, status)
WHERE status = 'pending';
