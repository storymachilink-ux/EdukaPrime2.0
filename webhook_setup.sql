DROP TABLE IF EXISTS webhook_logs CASCADE;

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  event_type VARCHAR(100),
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  payment_method VARCHAR(50),
  amount DECIMAL(12,2),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'received',
  raw_payload JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_webhook_logs_platform ON webhook_logs(platform);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_email ON webhook_logs(customer_email);
