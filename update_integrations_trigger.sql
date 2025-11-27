CREATE OR REPLACE FUNCTION update_integration_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE integrations_status
  SET
    total_webhooks = (SELECT COUNT(*) FROM webhook_logs WHERE platform = NEW.platform),
    successful_webhooks = (SELECT COUNT(*) FROM webhook_logs WHERE platform = NEW.platform AND status = 'success'),
    failed_webhooks = (SELECT COUNT(*) FROM webhook_logs WHERE platform = NEW.platform AND status = 'error'),
    success_rate = CASE
      WHEN (SELECT COUNT(*) FROM webhook_logs WHERE platform = NEW.platform) > 0
      THEN ROUND(
        (SELECT COUNT(*) FROM webhook_logs WHERE platform = NEW.platform AND status = 'success')::DECIMAL /
        (SELECT COUNT(*) FROM webhook_logs WHERE platform = NEW.platform) * 100, 2
      )
      ELSE 0
    END,
    last_webhook_at = NEW.created_at,
    updated_at = NOW()
  WHERE platform = NEW.platform;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_integration_stats_trigger ON webhook_logs;

CREATE TRIGGER update_integration_stats_trigger
AFTER INSERT ON webhook_logs
FOR EACH ROW
EXECUTE FUNCTION update_integration_stats();
