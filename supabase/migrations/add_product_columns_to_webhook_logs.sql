-- Add product information columns to webhook_logs table
-- This migration adds columns to store extracted product data from webhooks

BEGIN;

-- Add product_id column (the product code/identifier)
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS product_id VARCHAR(255);

-- Add product_code column (alternative product identifier)
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS product_code VARCHAR(255);

-- Add product_title column (product name/title)
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS product_title TEXT;

-- Create index on product_id for faster queries
CREATE INDEX IF NOT EXISTS idx_webhook_logs_product_id
ON webhook_logs(product_id);

-- Create index on product_code for faster queries
CREATE INDEX IF NOT EXISTS idx_webhook_logs_product_code
ON webhook_logs(product_code);

-- Add comment for documentation
COMMENT ON COLUMN webhook_logs.product_id IS 'Product ID extracted from webhook (e.g., "3MGN9P" from VEGA)';
COMMENT ON COLUMN webhook_logs.product_code IS 'Product code extracted from webhook (alternative identifier)';
COMMENT ON COLUMN webhook_logs.product_title IS 'Product title/name extracted from webhook';

COMMIT;
