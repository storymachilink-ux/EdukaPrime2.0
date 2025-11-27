CREATE TABLE IF NOT EXISTS vega_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_key TEXT NOT NULL DEFAULT 'vega',
  event_type TEXT NOT NULL,
  webhook_format TEXT,
  processing_status TEXT NOT NULL DEFAULT 'received',
  processing_message TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  transaction_token TEXT,
  order_id BIGINT,
  payment_method TEXT,
  payment_status TEXT,
  amount_cents INTEGER,
  plan_sku TEXT,
  plan_identified TEXT,
  plan_level INTEGER,
  is_addon BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_taken TEXT,
  error_detail TEXT,
  raw_payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vega_webhooks_email ON vega_webhooks(customer_email);
CREATE INDEX IF NOT EXISTS idx_vega_webhooks_created ON vega_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vega_webhooks_status ON vega_webhooks(processing_status);
CREATE INDEX IF NOT EXISTS idx_vega_webhooks_event ON vega_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_vega_webhooks_token ON vega_webhooks(transaction_token);
CREATE INDEX IF NOT EXISTS idx_vega_webhooks_user ON vega_webhooks(user_id);

ALTER TABLE vega_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_view_vega_webhooks" ON vega_webhooks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

CREATE POLICY "service_role_insert_vega_webhooks" ON vega_webhooks FOR INSERT WITH CHECK (true);
