-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: 001_ajustar_plans_v2_ids_gateway.sql
-- DESCRIÇÃO: Adicionar colunas de gateway IDs em plans_v2
-- ORDEM: Executar PRIMEIRO
-- ═══════════════════════════════════════════════════════════════════════════

-- Adicionar colunas de gateway IDs em plans_v2
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS vega_product_id VARCHAR(255) UNIQUE;
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS ggcheckout_product_id VARCHAR(255) UNIQUE;
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS amplopay_product_id VARCHAR(255) UNIQUE;

-- Criar índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_plans_vega_product_id ON plans_v2(vega_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_ggcheckout_product_id ON plans_v2(ggcheckout_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_amplopay_product_id ON plans_v2(amplopay_product_id);

-- Adicionar comentário
COMMENT ON COLUMN plans_v2.vega_product_id IS 'Product code do Vega (ex: "3MGN9O")';
COMMENT ON COLUMN plans_v2.ggcheckout_product_id IS 'Product ID do GGCheckout';
COMMENT ON COLUMN plans_v2.amplopay_product_id IS 'Product ID do Amplopay';

-- ═══════════════════════════════════════════════════════════════════════════
-- Status: ✅ Completo
-- Próximo: Execute 002_add_constraints_idempotencia_subscriptions.sql
-- ═══════════════════════════════════════════════════════════════════════════
