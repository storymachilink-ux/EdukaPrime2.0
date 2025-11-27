/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 MIGRAÇÃO: Copiar webhooks de vega_webhook_logs para webhook_logs
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Esta migração copia os 95 webhooks antigos da tabela vega_webhook_logs
 * para a nova tabela webhook_logs (dashboard unificado).
 *
 * Mapeamento de colunas:
 * vega_webhook_logs → webhook_logs
 * - event_type → event_type
 * - customer_email → customer_email
 * - customer_name → customer_name
 * - payment_method → payment_method
 * - amount_cents → amount (dividir por 100)
 * - transaction_token → transaction_id
 * - plan_sku → product_ids (array JSONB)
 * - processing_status → status
 * - created_at → created_at
 * - raw_payload → raw_payload
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- Inserir todos os webhooks antigos no novo formato
INSERT INTO webhook_logs (
  platform,
  event_type,
  status,
  customer_email,
  customer_name,
  payment_method,
  amount,
  transaction_id,
  product_ids,
  expires_at,
  processed_at,
  raw_payload,
  created_at
)
SELECT
  'vega' as platform,
  vwl.event_type,
  CASE
    WHEN vwl.processing_status = 'processed' THEN 'received'
    WHEN vwl.processing_status = 'error' THEN 'failed'
    WHEN vwl.processing_status = 'skipped_unpaid' THEN 'pending'
    WHEN vwl.processing_status = 'skipped_addon' THEN 'received'
    WHEN vwl.processing_status = 'duplicate' THEN 'received'
    ELSE vwl.processing_status
  END as status,
  vwl.customer_email,
  vwl.customer_name,
  vwl.payment_method,
  (vwl.amount_cents::NUMERIC / 100.0) as amount,
  vwl.transaction_token as transaction_id,
  JSONB_BUILD_ARRAY(vwl.plan_sku) as product_ids,
  (vwl.created_at + INTERVAL '30 days') as expires_at,
  CASE
    WHEN vwl.processing_status = 'processed' THEN vwl.created_at
    ELSE NULL
  END as processed_at,
  vwl.raw_payload,
  vwl.created_at
FROM vega_webhook_logs vwl
WHERE vwl.customer_email IS NOT NULL
  AND vwl.customer_email != ''
ON CONFLICT DO NOTHING;

-- Verificar quantos foram inseridos
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM webhook_logs WHERE platform = 'vega';

  RAISE NOTICE '✅ Migração concluída!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '   • Total de webhooks Vega em webhook_logs: %', v_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Próximos passos:';
  RAISE NOTICE '   1. Vá em Admin → 🔔 Webhooks Recebidos';
  RAISE NOTICE '   2. Os 95 webhooks históricos devem aparecer';
  RAISE NOTICE '   3. Teste gerando um novo PIX para confirmar que os novos também funcionam';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Dashboard agora mostra todo o histórico de webhooks!';
END $$;
