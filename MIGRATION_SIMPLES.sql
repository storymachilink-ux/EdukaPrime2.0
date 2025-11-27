-- PASSO 1: Criar tabela pending_plans se não existir
CREATE TABLE IF NOT EXISTS pending_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  plan_id INT NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP NULL
);

-- PASSO 2: Garantir índices
CREATE INDEX IF NOT EXISTS idx_pending_plans_email ON pending_plans(email);
CREATE INDEX IF NOT EXISTS idx_pending_plans_status ON pending_plans(status);

-- PASSO 3: Criar função
DROP FUNCTION IF EXISTS activate_pending_plans(UUID, TEXT) CASCADE;

CREATE FUNCTION activate_pending_plans(
  p_user_id UUID,
  p_user_email TEXT
)
RETURNS TABLE(success BOOLEAN, activated_count INT, message TEXT) AS $$
DECLARE
  v_count INT := 0;
  v_plan_id INT;
  v_payment_id TEXT;
  v_pending_id UUID;
BEGIN
  FOR v_pending_id, v_plan_id, v_payment_id IN
    SELECT id, plan_id, payment_id FROM pending_plans
    WHERE LOWER(email) = LOWER(p_user_email) AND status = 'pending'
  LOOP
    BEGIN
      INSERT INTO user_subscriptions (user_id, plan_id, payment_id, status, created_at)
      VALUES (p_user_id, v_plan_id, v_payment_id, 'active', NOW());

      UPDATE users SET active_plan_id = v_plan_id, updated_at = NOW() WHERE id = p_user_id;
      UPDATE pending_plans SET status = 'activated', activated_at = NOW() WHERE id = v_pending_id;

      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  RETURN QUERY SELECT TRUE, v_count, (v_count || ' plano(s) ativado(s)')::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 0, 'Erro na ativação'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
