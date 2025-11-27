ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS product_ids JSONB DEFAULT '[]'::JSONB;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS reprocess_count INTEGER DEFAULT 0;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS last_reprocess_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_expires ON webhook_logs(expires_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_pending ON webhook_logs(status) WHERE status IN ('pending', 'failed');

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
    status = CASE WHEN v_subs_count > 0 THEN 'success' ELSE 'failed' END,
    processed_at = NOW(),
    reprocess_count = reprocess_count + 1,
    last_reprocess_at = NOW()
  WHERE id = p_webhook_id;

  RETURN QUERY SELECT (v_subs_count > 0),
    CASE WHEN v_subs_count > 0
      THEN 'Processado: ' || v_subs_count::TEXT || ' plano(s) ativado(s)'
      ELSE 'Nenhum plano mapeado encontrado'
    END,
    v_subs_count;

EXCEPTION WHEN OTHERS THEN
  UPDATE webhook_logs SET status = 'error', processed_at = NOW() WHERE id = p_webhook_id;
  RETURN QUERY SELECT FALSE, 'Erro: ' || SQLERRM, 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reprocess_pending_webhooks_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_webhook_record RECORD;
BEGIN
  FOR v_webhook_record IN
    SELECT id, product_ids, transaction_id, customer_email
    FROM webhook_logs
    WHERE customer_email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  LOOP
    PERFORM process_webhook_payment(
      v_webhook_record.id,
      v_webhook_record.customer_email,
      v_webhook_record.product_ids,
      v_webhook_record.transaction_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reprocess_webhook_on_user_created ON users;

CREATE TRIGGER trigger_reprocess_webhook_on_user_created
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION reprocess_pending_webhooks_for_user();

CREATE OR REPLACE FUNCTION expire_old_webhooks()
RETURNS TABLE(expired_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE webhook_logs
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

SELECT 'Webhook reprocessing setup completo!';
