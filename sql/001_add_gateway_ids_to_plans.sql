ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS vega_product_id VARCHAR;
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS ggcheckout_product_id VARCHAR;
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS amplopay_product_id VARCHAR;

CREATE INDEX IF NOT EXISTS idx_plans_vega_id ON plans_v2(vega_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_ggcheckout_id ON plans_v2(ggcheckout_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_amplopay_id ON plans_v2(amplopay_product_id);
