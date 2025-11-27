-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: CLEANUP_010_validar_constraints_idempotencia.sql
-- DESCRIÇÃO: Garantir que as constraints de IDEMPOTÊNCIA existem
-- ORDEM: 10ª LIMPEZA
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1) CONSTRAINT em user_subscriptions (evita duplicatas de webhook)
-- ─────────────────────────────────────────────────────────────────────────

-- Remover constraint antiga se existir
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS unique_payment_per_user_plan;

-- Adicionar nova constraint
ALTER TABLE user_subscriptions
ADD CONSTRAINT unique_payment_per_user_plan
UNIQUE (user_id, plan_id, payment_id);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_id
ON user_subscriptions(payment_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 2) CONSTRAINT em pending_plans (evita duplicatas)
-- ─────────────────────────────────────────────────────────────────────────

-- Remover constraint antiga se existir
ALTER TABLE pending_plans
DROP CONSTRAINT IF EXISTS unique_payment_email_plan;

-- Adicionar nova constraint
ALTER TABLE pending_plans
ADD CONSTRAINT unique_payment_email_plan
UNIQUE (payment_id, plan_id, email);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_pending_plans_payment_id
ON pending_plans(payment_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 3) Garantir que plans_v2 tem os IDs dos gateways
-- ─────────────────────────────────────────────────────────────────────────

-- Garantir que as colunas existem
ALTER TABLE plans_v2
ADD COLUMN IF NOT EXISTS vega_product_id VARCHAR(255);

ALTER TABLE plans_v2
ADD COLUMN IF NOT EXISTS ggcheckout_product_id VARCHAR(255);

ALTER TABLE plans_v2
ADD COLUMN IF NOT EXISTS amplopay_product_id VARCHAR(255);

-- Criar índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_plans_vega_product_id
ON plans_v2(vega_product_id);

CREATE INDEX IF NOT EXISTS idx_plans_ggcheckout_product_id
ON plans_v2(ggcheckout_product_id);

CREATE INDEX IF NOT EXISTS idx_plans_amplopay_product_id
ON plans_v2(amplopay_product_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 4) Garantir que users tem active_plan_id
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE users
ADD COLUMN IF NOT EXISTS active_plan_id INTEGER
REFERENCES plans_v2(id);

-- ✅ TUDO VALIDADO!
-- Próximo: Executar os scripts SQL de forma segura
