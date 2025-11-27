-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: 003_criar_ou_ajustar_pending_plans.sql
-- DESCRIÇÃO: Criar/ajustar tabela pending_plans e função activate_pending_plans
-- ORDEM: Executar TERCEIRO
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- TABELA: pending_plans
-- Armazena planos pagos de usuários que ainda não se registraram
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pending_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired')),

  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,

  payment_id TEXT NOT NULL,
  product_id_gateway TEXT,
  payment_method VARCHAR(50),
  amount_paid DECIMAL(10, 2),

  webhook_id UUID REFERENCES webhook_logs(id) ON DELETE SET NULL,
  platform VARCHAR(50),

  activated_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- CONSTRAINT DE IDEMPOTÊNCIA: Um pagamento (payment_id) só pode estar uma vez por email/plan
  UNIQUE(payment_id, plan_id, email)
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_pending_plans_email
ON pending_plans(email);

CREATE INDEX IF NOT EXISTS idx_pending_plans_status
ON pending_plans(status);

CREATE INDEX IF NOT EXISTS idx_pending_plans_payment_id
ON pending_plans(payment_id);

CREATE INDEX IF NOT EXISTS idx_pending_plans_created_at
ON pending_plans(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: Atualizar updated_at automaticamente
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_pending_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pending_plans_updated_at_trigger ON pending_plans;
CREATE TRIGGER pending_plans_updated_at_trigger
BEFORE UPDATE ON pending_plans
FOR EACH ROW
EXECUTE FUNCTION update_pending_plans_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNÇÃO: Ativar pending plans quando usuário se registra
-- Chamada durante signup ou quando usuário faz F5 logado
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION activate_pending_plans(p_user_id UUID, p_user_email VARCHAR)
RETURNS TABLE (
  total_activated INTEGER,
  last_plan_id INTEGER
) AS $$
DECLARE
  v_total_activated INTEGER := 0;
  v_last_plan_id INTEGER := 0;
  v_pending_plan RECORD;
BEGIN
  -- Buscar todos os pending_plans para este email com status 'pending'
  FOR v_pending_plan IN
    SELECT id, plan_id, end_date, payment_id, product_id_gateway,
           payment_method, amount_paid, webhook_id, platform
    FROM pending_plans
    WHERE email = p_user_email AND status = 'pending'
    ORDER BY created_at ASC
  LOOP
    v_last_plan_id := v_pending_plan.plan_id;

    -- Inserir em user_subscriptions
    -- ON CONFLICT ignora se já existe (idempotência)
    INSERT INTO user_subscriptions (
      user_id, plan_id, status, start_date, end_date,
      payment_id, product_id_gateway, payment_method, amount_paid, webhook_id
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

    -- Atualizar usuário com plano ativo
    UPDATE users
    SET
      active_plan_id = v_pending_plan.plan_id,
      plano_ativo = v_pending_plan.plan_id,
      updated_at = NOW()
    WHERE id = p_user_id;

    -- Marcar pending_plan como ativado
    UPDATE pending_plans
    SET
      status = 'activated',
      activated_user_id = p_user_id,
      activated_at = NOW(),
      updated_at = NOW()
    WHERE id = v_pending_plan.id;

    v_total_activated := v_total_activated + 1;
  END LOOP;

  RETURN QUERY SELECT v_total_activated, v_last_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION activate_pending_plans(UUID, VARCHAR) TO service_role, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Status: ✅ Completo
-- Próximo: Execute 004_ajustar_webhook_logs.sql
-- ═══════════════════════════════════════════════════════════════════════════
