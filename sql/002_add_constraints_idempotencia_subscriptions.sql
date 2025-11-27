-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: 002_add_constraints_idempotencia_subscriptions.sql
-- DESCRIÇÃO: Adicionar UNIQUE constraint em user_subscriptions para idempotência
-- ORDEM: Executar SEGUNDO
-- ═══════════════════════════════════════════════════════════════════════════

-- Primeiro: remover constraint anterior se existir (para segurança)
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS unique_payment_per_user_plan;

-- Adicionar nova constraint: payment_id único por (user_id, plan_id)
-- Isso evita que o mesmo pagamento crie múltiplas subscriptions se o webhook for reenviado
ALTER TABLE user_subscriptions
ADD CONSTRAINT unique_payment_per_user_plan UNIQUE (user_id, plan_id, payment_id);

-- Adicionar índice em payment_id para busca rápida
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_id
ON user_subscriptions(payment_id);

-- Adicionar coluna webhook_id se não existir (referência ao log)
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS webhook_id UUID REFERENCES webhook_logs(id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_webhook_id
ON user_subscriptions(webhook_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Status: ✅ Completo
-- Próximo: Execute 003_criar_ou_ajustar_pending_plans.sql
-- ═══════════════════════════════════════════════════════════════════════════
