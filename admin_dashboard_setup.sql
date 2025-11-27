DROP TABLE IF EXISTS integrations_status CASCADE;
DROP TABLE IF EXISTS financial_metrics CASCADE;

CREATE TABLE integrations_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  webhook_url VARCHAR(500),
  last_webhook_at TIMESTAMP,
  total_webhooks INT DEFAULT 0,
  successful_webhooks INT DEFAULT 0,
  failed_webhooks INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_expenses DECIMAL(12,2) DEFAULT 0,
  new_subscriptions INT DEFAULT 0,
  canceled_subscriptions INT DEFAULT 0,
  active_subscriptions INT DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  arpu DECIMAL(12,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  ltv DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(100),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE integrations_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_integrations_status_platform ON integrations_status(platform);
CREATE INDEX idx_financial_metrics_date ON financial_metrics(date DESC);
CREATE INDEX idx_expenses_date ON expenses(date DESC);

INSERT INTO integrations_status (platform, name, webhook_url, is_active) VALUES
('vega', 'Vega Checkout', 'https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-vega', true),
('ggcheckout', 'GGCheckout', 'https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-ggcheckout', true);
