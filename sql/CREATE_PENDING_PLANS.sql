-- ═══════════════════════════════════════════════════════════════════════════
-- TABELA: pending_plans
-- Armazena planos pagos de usuários que ainda não criaram conta
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pending_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired')),
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  payment_id TEXT,
  product_id_gateway TEXT,
  payment_method VARCHAR(50),
  amount_paid DECIMAL(10, 2),
  webhook_id UUID REFERENCES webhook_logs(id),
  platform VARCHAR(50),
  activated_user_id UUID,
  activated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, plan_id)
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_pending_plans_email ON pending_plans(email);
CREATE INDEX IF NOT EXISTS idx_pending_plans_status ON pending_plans(status);
CREATE INDEX IF NOT EXISTS idx_pending_plans_created_at ON pending_plans(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNÇÃO: Atribuir plano pendente ao novo usuário
-- Chamada quando usuário se registra
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION activate_pending_plans(user_id UUID, user_email VARCHAR)
RETURNS TABLE (
  plan_id INTEGER,
  activated_count INTEGER
) AS $$
DECLARE
  pending_plan_record RECORD;
  total_activated INTEGER := 0;
  last_plan_id INTEGER := 0;
BEGIN
  -- Buscar todos os planos pendentes para este email
  FOR pending_plan_record IN
    SELECT id, plan_id, end_date, payment_id, product_id_gateway,
           payment_method, amount_paid, webhook_id, platform
    FROM pending_plans
    WHERE email = user_email AND status = 'pending'
  LOOP
    -- Rastrear o último plan_id ativado
    last_plan_id := pending_plan_record.plan_id;

    -- Criar subscription para este plano
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
      user_id,
      pending_plan_record.plan_id,
      'active',
      NOW(),
      pending_plan_record.end_date,
      pending_plan_record.payment_id,
      pending_plan_record.product_id_gateway,
      pending_plan_record.payment_method,
      pending_plan_record.amount_paid,
      pending_plan_record.webhook_id
    );

    -- Atualizar usuário
    UPDATE users
    SET
      plano_ativo = pending_plan_record.plan_id,
      data_expiracao_plano = CASE
        WHEN pending_plan_record.end_date IS NOT NULL
        THEN pending_plan_record.end_date::TEXT
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = user_id;

    -- Marcar pending_plan como ativado
    UPDATE pending_plans
    SET
      status = 'activated',
      activated_user_id = user_id,
      activated_at = NOW(),
      updated_at = NOW()
    WHERE id = pending_plan_record.id;

    total_activated := total_activated + 1;
  END LOOP;

  -- Retornar o último plan_id ativado e a contagem total
  RETURN QUERY SELECT last_plan_id::INTEGER, total_activated;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION activate_pending_plans(UUID, VARCHAR) TO service_role, authenticated;
