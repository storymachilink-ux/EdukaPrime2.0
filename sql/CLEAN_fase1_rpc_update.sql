-- Executar One Step

CREATE OR REPLACE FUNCTION process_webhook_payment(
  p_webhook_id UUID,
  p_customer_email TEXT,
  p_product_ids JSONB,
  p_transaction_id TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  subscriptions_created INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_product_id TEXT;
  v_plan_id INTEGER;
  v_subs_count INTEGER := 0;
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_error_msg TEXT := '';
BEGIN
  v_user_id := NULL;

  SELECT id INTO v_user_id FROM users WHERE email = p_customer_email LIMIT 1;

  IF v_user_id IS NULL THEN
    UPDATE webhook_logs SET
      processed_successfully = false,
      last_processed_at = NOW(),
      reprocess_attempts = reprocess_attempts + 1,
      error_message = 'Usuário não encontrado'
    WHERE id = p_webhook_id;

    RETURN QUERY SELECT FALSE, 'Usuário não encontrado', 0;
    RETURN;
  END IF;

  FOR v_product_id IN SELECT jsonb_array_elements_text(p_product_ids)
  LOOP
    SELECT id INTO v_plan_id FROM plans_v2
    WHERE vega_product_id = v_product_id
    OR ggcheckout_product_id = v_product_id
    OR amplopay_product_id = v_product_id
    LIMIT 1;

    IF v_plan_id IS NOT NULL THEN
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
          webhook_id
        )
        SELECT
          v_user_id,
          v_plan_id,
          'active',
          NOW(),
          CASE
            WHEN (SELECT payment_type FROM plans_v2 WHERE id = v_plan_id) = 'mensal'
            THEN NOW() + INTERVAL '30 days'
            ELSE NULL
          END,
          p_transaction_id,
          v_product_id,
          (SELECT payment_method FROM webhook_logs WHERE id = p_webhook_id),
          p_webhook_id
        WHERE NOT EXISTS (
          SELECT 1 FROM user_subscriptions
          WHERE user_id = v_user_id
          AND plan_id = v_plan_id
          AND status = 'active'
          AND payment_id = p_transaction_id
        );

        v_subs_count := v_subs_count + 1;

        UPDATE users SET
          plano_ativo = v_plan_id,
          data_expiracao_plano = (
            SELECT end_date FROM user_subscriptions
            WHERE user_id = v_user_id
            AND plan_id = v_plan_id
            ORDER BY created_at DESC LIMIT 1
          ),
          updated_at = NOW()
        WHERE id = v_user_id;

      EXCEPTION WHEN unique_violation THEN
        CONTINUE;
      END;
    END IF;
  END LOOP;

  UPDATE webhook_logs SET
    processed_successfully = (v_subs_count > 0),
    processed_user_id = v_user_id,
    last_processed_at = NOW(),
    reprocess_attempts = reprocess_attempts + 1,
    status = CASE WHEN v_subs_count > 0 THEN 'success' ELSE 'failed' END,
    error_message = CASE
      WHEN v_subs_count > 0 THEN NULL
      ELSE 'Nenhum plano mapeado encontrado para os produtos'
    END
  WHERE id = p_webhook_id;

  RETURN QUERY SELECT
    (v_subs_count > 0),
    CASE WHEN v_subs_count > 0
      THEN 'Processado: ' || v_subs_count::TEXT || ' plano(s) ativado(s)'
      ELSE 'Nenhum plano mapeado encontrado'
    END,
    v_subs_count;

EXCEPTION WHEN OTHERS THEN
  UPDATE webhook_logs SET
    processed_successfully = false,
    last_processed_at = NOW(),
    reprocess_attempts = reprocess_attempts + 1,
    status = 'failed',
    error_message = 'Erro no processamento: ' || SQLERRM
  WHERE id = p_webhook_id;

  RETURN QUERY SELECT FALSE, 'Erro: ' || SQLERRM, 0;
END;
$$ LANGUAGE plpgsql;
