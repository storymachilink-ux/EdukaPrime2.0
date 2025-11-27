-- ============================================================================
-- ACTIVATE PENDING PLANS FUNCTION
-- Ativa todos os planos pendentes quando um usuário faz login
-- ============================================================================

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
  v_pending_plan RECORD;
  v_subscription_id UUID;
BEGIN
  -- Procurar todos os pending_plans para este email
  FOR v_pending_plan IN
    SELECT id, plan_id, payment_id
    FROM pending_plans
    WHERE email = LOWER(p_user_email)
    AND status = 'pending'
  LOOP
    BEGIN
      -- Criar subscription ativa
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        payment_id,
        status,
        created_at
      ) VALUES (
        p_user_id,
        v_pending_plan.plan_id,
        v_pending_plan.payment_id,
        'active',
        NOW()
      ) RETURNING id INTO v_subscription_id;

      -- Atualizar active_plan_id do usuário
      UPDATE users
      SET active_plan_id = v_pending_plan.plan_id,
          updated_at = NOW()
      WHERE id = p_user_id;

      -- Marcar pending_plan como concluído
      UPDATE pending_plans
      SET status = 'activated',
          activated_at = NOW()
      WHERE id = v_pending_plan.id;

      v_activated_count := v_activated_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Log do erro mas continua processando outros planos
      RAISE WARNING 'Erro ao ativar plano %: %', v_pending_plan.id, SQLERRM;
    END;
  END LOOP;

  -- Retornar resultado
  IF v_activated_count > 0 THEN
    RETURN QUERY SELECT
      TRUE,
      v_activated_count,
      format('%s plano(s) ativado(s) com sucesso', v_activated_count)::TEXT;
  ELSE
    RETURN QUERY SELECT
      TRUE,
      0,
      'Nenhum plano pendente encontrado'::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT
    FALSE,
    0,
    SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pending_plans_email_status
ON pending_plans(email, status)
WHERE status = 'pending';
