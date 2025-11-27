-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: ADD_PRODUCT_INFO_TO_PENDING_PLANS.sql
-- DESCRIÇÃO: Adicionar colunas product_name e product_code em pending_plans
-- ═══════════════════════════════════════════════════════════════════════════

-- Adicionar colunas product_name e product_code
ALTER TABLE pending_plans
  ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_code VARCHAR(100);

-- Criar índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_pending_plans_product_code
ON pending_plans(product_code);

CREATE INDEX IF NOT EXISTS idx_pending_plans_product_name
ON pending_plans(product_name);

-- ═══════════════════════════════════════════════════════════════════════════
-- Status: ✅ Completo
-- Próximo: Executar as modificações nos webhooks
-- ═══════════════════════════════════════════════════════════════════════════
