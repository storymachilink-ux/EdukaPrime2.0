-- ============================================
-- TABELAS PARA MÉTRICAS DO DASHBOARD ADMIN
-- ============================================

-- Tabela de Assinaturas (já existe users, mas vamos adicionar campos)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10, 2) DEFAULT 0;

-- Tabela de EdukaPoints
CREATE TABLE IF NOT EXISTS edukapoints_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'manual', -- manual, reward, purchase
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Cupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INT,
  discount_fixed DECIMAL(10, 2),
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de uso de cupons
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_started ON users(subscription_started_at);
CREATE INDEX IF NOT EXISTS idx_edukapoints_user ON edukapoints_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);

-- RLS Policies

-- EdukaPoints Transactions
ALTER TABLE edukapoints_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "edukapoints_service_all" ON edukapoints_transactions;
CREATE POLICY "edukapoints_service_all"
ON edukapoints_transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "edukapoints_admin_all" ON edukapoints_transactions;
CREATE POLICY "edukapoints_admin_all"
ON edukapoints_transactions FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

DROP POLICY IF EXISTS "edukapoints_user_view" ON edukapoints_transactions;
CREATE POLICY "edukapoints_user_view"
ON edukapoints_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_service_all" ON coupons;
CREATE POLICY "coupons_service_all"
ON coupons FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;
CREATE POLICY "coupons_admin_all"
ON coupons FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

DROP POLICY IF EXISTS "coupons_public_view" ON coupons;
CREATE POLICY "coupons_public_view"
ON coupons FOR SELECT
TO authenticated
USING (active = true);

-- Coupon Usage
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupon_usage_service_all" ON coupon_usage;
CREATE POLICY "coupon_usage_service_all"
ON coupon_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "coupon_usage_admin_view" ON coupon_usage;
CREATE POLICY "coupon_usage_admin_view"
ON coupon_usage FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- ============================================
-- ✅ TABELAS CRIADAS
-- ============================================

SELECT '✅ Tabelas de métricas criadas com sucesso!' as status;
