-- Executar One Step

CREATE OR REPLACE FUNCTION reprocess_webhook_manual(
  p_webhook_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID,
  subscriptions_created INTEGER
) AS $$
DECLARE
  v_webhook webhook_logs%ROWTYPE;
  v_result RECORD;
BEGIN
  SELECT * INTO v_webhook FROM webhook_logs WHERE id = p_webhook_id;

  IF v_webhook.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Webhook não encontrado', NULL::UUID, 0;
    RETURN;
  END IF;

  IF v_webhook.product_ids IS NULL OR jsonb_array_length(v_webhook.product_ids) = 0 THEN
    RETURN QUERY SELECT FALSE, 'Webhook sem produtos', NULL::UUID, 0;
    RETURN;
  END IF;

  UPDATE webhook_logs SET reprocess_attempts = reprocess_attempts + 1 WHERE id = p_webhook_id;

  SELECT * INTO v_result FROM process_webhook_payment(
    p_webhook_id,
    v_webhook.customer_email,
    v_webhook.product_ids,
    v_webhook.transaction_id
  );

  INSERT INTO webhook_reprocess_history (
    webhook_id,
    attempt_number,
    triggered_by,
    result,
    processed_user_id,
    error_message
  )
  SELECT
    p_webhook_id,
    (SELECT reprocess_attempts FROM webhook_logs WHERE id = p_webhook_id),
    'manual',
    CASE WHEN (v_result).success THEN 'success' ELSE 'failed' END,
    (SELECT processed_user_id FROM webhook_logs WHERE id = p_webhook_id),
    (SELECT error_message FROM webhook_logs WHERE id = p_webhook_id);

  RETURN QUERY SELECT
    (v_result).success,
    (v_result).message,
    (SELECT processed_user_id FROM webhook_logs WHERE id = p_webhook_id),
    (v_result).subscriptions_created;
END;
$$ LANGUAGE plpgsql;
