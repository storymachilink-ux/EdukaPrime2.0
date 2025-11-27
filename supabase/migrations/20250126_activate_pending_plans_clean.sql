-- Garantir que a tabela pending_plans existe com as colunas necessárias
ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP NULL;

-- Criar a função
DROP FUNCTION IF EXISTS activate_pending_plans(UUID, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION activate_pending_plans(
  p_user_id UUID,
  p_user_email TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  activated_count INT,
  message TEXT
) AS $$
DECLARE
  v_activated_count INT := 0;
  v_plan_id INT;
  v_payment_id TEXT;
  v_pending_id UUID;
BEGIN
  FOR v_pending_id, v_plan_id, v_payment_id IN
    SELECT id, plan_id, payment_id
    FROM pending_plans
    WHERE LOWER(email) = LOWER(p_user_email)
    AND status = 'pending'
  LOOP
    BEGIN
      INSERT INTO user_subscriptions (user_id, plan_id, payment_id, status, created_at)
      VALUES (p_user_id, v_plan_id, v_payment_id, 'active', NOW());

      UPDATE users
      SET active_plan_id = v_plan_id, updated_at = NOW()
      WHERE id = p_user_id;

      UPDATE pending_plans
      SET status = 'activated', activated_at = NOW()
      WHERE id = v_pending_id;

      v_activated_count := v_activated_count + 1;

    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;

  RETURN QUERY SELECT TRUE, v_activated_count,
    CASE
      WHEN v_activated_count > 0 THEN format('%s plano(s) ativado(s)', v_activated_count)
      ELSE 'Nenhum plano pendente'
    END;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 0, 'Erro ao ativar planos';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_pending_plans_email_status
ON pending_plans(email, status)
WHERE status = 'pending';
