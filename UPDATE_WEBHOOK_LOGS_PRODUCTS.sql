BEGIN;

UPDATE webhook_logs
SET product_id = raw_payload -> 'products' -> 0 ->> 'code',
    product_title = raw_payload -> 'products' -> 0 ->> 'title'
WHERE platform = 'vega'
AND product_id IS NULL
AND raw_payload -> 'products' IS NOT NULL;

UPDATE webhook_logs
SET product_id = raw_payload -> 'products' -> 0 ->> 'id',
    product_title = raw_payload -> 'products' -> 0 ->> 'name'
WHERE platform = 'ggcheckout'
AND product_id IS NULL
AND raw_payload -> 'products' IS NOT NULL;

UPDATE webhook_logs
SET product_id = raw_payload ->> 'product_id',
    product_title = raw_payload ->> 'product_name'
WHERE platform = 'amplopay'
AND product_id IS NULL
AND raw_payload ->> 'product_id' IS NOT NULL;

COMMIT;
