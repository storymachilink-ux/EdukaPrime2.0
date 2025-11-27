-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: 005_batch_activate_pending_plans.sql
-- DESCRIÇÃO: Função para ativar múltiplos pending_plans em lotes
-- ORDEM: Executar QUINTO
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNÇÃO: Ativar vários pending_plans de uma vez (batch processing)
-- Usada pelo admin para processar múltiplos planos pendentes em lotes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION activate_pending_plans_batch(
  p_pending_plan_ids UUID[]
)
RETURNS TABLE (
  activated_count INTEGER,
  failed_count INTEGER,
  message TEXT
) AS $$
DECLARE
  v_activated INTEGER := 0;
  v_failed INTEGER := 0;
  v_plan_id UUID;
  v_pending_plan RECORD;
  v_user_id UUID;
BEGIN
  -- Validar entrada
  IF p_pending_plan_ids IS NULL OR array_length(p_pending_plan_ids, 1) = 0 THEN
    RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, 'Nenhum plano fornecido'::TEXT;
    RETURN;
  END IF;

  -- Loop por cada pending_plan_id fornecido
  FOREACH v_plan_id IN ARRAY p_pending_plan_ids
  LOOP
    BEGIN
      -- Buscar o pending_plan e o usuário associado
      SELECT pp.id, pp.email, pp.plan_id, pp.end_date, pp.payment_id,
             pp.product_id_gateway, pp.payment_method, pp.amount_paid, pp.webhook_id
      INTO v_pending_plan
      FROM pending_plans pp
      WHERE pp.id = v_plan_id AND pp.status = 'pending'
      LIMIT 1;

      IF v_pending_plan IS NULL THEN
        v_failed := v_failed + 1;
        CONTINUE;
      END IF;

      -- Buscar usuário pelo email
      SELECT id INTO v_user_id
      FROM users
      WHERE email = v_pending_plan.email
      LIMIT 1;

      IF v_user_id IS NULL THEN
        -- Usuário não existe, deixar como pendente
        v_failed := v_failed + 1;
        CONTINUE;
      END IF;

      -- ✅ Inserir subscription (idempotente)
      INSERT INTO user_subscriptions (
        user_id, plan_id, status, start_date, end_date,
        payment_id, product_id_gateway, payment_method, amount_paid, webhook_id
      ) VALUES (
        v_user_id,
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

      -- ✅ Atualizar usuário com plano ativo
      UPDATE users
      SET
        active_plan_id = v_pending_plan.plan_id,
        plano_ativo = v_pending_plan.plan_id,
        updated_at = NOW()
      WHERE id = v_user_id;

      -- ✅ Marcar pending_plan como ativado
      UPDATE pending_plans
      SET
        status = 'activated',
        activated_user_id = v_user_id,
        activated_at = NOW(),
        updated_at = NOW()
      WHERE id = v_pending_plan.id;

      v_activated := v_activated + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Registrar erro e continuar com próximo plano
      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_activated, v_failed,
    'Ativados: ' || v_activated || ', Falhados: ' || v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION activate_pending_plans_batch(UUID[])
TO service_role, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Status: ✅ Completo
-- Executar no Supabase SQL Editor ou via migrations
-- ═══════════════════════════════════════════════════════════════════════════
