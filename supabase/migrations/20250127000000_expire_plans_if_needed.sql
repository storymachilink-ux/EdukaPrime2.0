-- ============================================
-- RPC: expire_plans_if_needed
-- ============================================
--
-- Função para verificar e expirar planos
-- Executa quando o usuário faz login
--
-- Compatível com Supabase Free (SEM pg_cron)
--
-- ============================================

CREATE OR REPLACE FUNCTION expire_plans_if_needed(
  p_user_id UUID
)
RETURNS TABLE (
  expired_count INT,
  new_plan_id INT
) AS $$
DECLARE
  v_expired_count INT := 0;
  v_new_plan_id INT;
BEGIN
  -- [1] Marcar subscriptions expiradas como 'expired'
  UPDATE user_subscriptions
  SET status = 'expired', updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'active'
    AND end_date < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  -- [2] Se expirou alguma subscrição, registrar no log
  IF v_expired_count > 0 THEN
    INSERT INTO plan_expiration_logs (
      execution_date,
      expired_subscriptions_count,
      notifications_created,
      expired_pending_plans_count,
      status
    ) VALUES (
      NOW(),
      v_expired_count,
      0,
      0,
      'success'
    );
  END IF;

  -- [3] Atualizar active_plan_id para o plano ativo mais recente
  -- Se nenhum plano ativo existir, volta para 0 (Free)
  SELECT COALESCE(
    (SELECT plan_id FROM user_subscriptions
     WHERE user_id = p_user_id
       AND status = 'active'
     ORDER BY start_date DESC
     LIMIT 1),
    0
  ) INTO v_new_plan_id;

  UPDATE users
  SET active_plan_id = v_new_plan_id, updated_at = NOW()
  WHERE id = p_user_id;

  -- [4] Retornar resultado
  RETURN QUERY SELECT v_expired_count, v_new_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para usuários autenticados chamar
GRANT EXECUTE ON FUNCTION expire_plans_if_needed(UUID) TO authenticated;
