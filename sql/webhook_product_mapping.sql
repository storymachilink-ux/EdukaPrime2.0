/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🗺️ MAPEAMENTO DE PRODUTOS DO GGCHECKOUT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este arquivo documenta o mapeamento entre os IDs dos produtos no GGCheckout
 * e os planos no sistema EdukaPrime.
 *
 * ⚠️ IMPORTANTE: Se mudar os produtos no GGCheckout, atualize TAMBÉM:
 *    - Este arquivo (documentação)
 *    - supabase/functions/checkout-webhook/index.ts (código da função)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ MAPEAMENTO ATUAL DE PRODUTOS                                            │
-- └─────────────────────────────────────────────────────────────────────────┘

-- PLANO ESSENCIAL (plano_ativo = 1)
-- ID do Produto: lDGnSUHPwxWlHBlPEIFy
-- Checkout URL: https://www.ggcheckout.com/checkout/v2/8S2J21JhLk3xIhbiRJiq
-- Preço: R$ 9,99/mês
-- Duração: PIX = 30 dias | Cartão = 90 dias

-- PLANO EVOLUIR (plano_ativo = 2)
-- ID do Produto: WpjID8aV49ShaQ07ABzP
-- Checkout URL: https://www.ggcheckout.com/checkout/v2/XIGp0MeoklnQxhGEnJIe
-- Preço: R$ 27,99/mês
-- Duração: PIX = 30 dias | Cartão = 90 dias

-- PLANO PRIME (plano_ativo = 3)
-- ID do Produto: eOGqcq0IbQnJUpjKRpsG
-- Checkout URL: https://www.ggcheckout.com/checkout/v2/jgSa1tc6CfVFYBaku7JV
-- Preço: R$ 49,99/mês
-- Duração: PIX = 30 dias | Cartão = 90 dias


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ CONSULTAS ÚTEIS PARA VERIFICAR WEBHOOKS                                 │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Ver todos os webhooks recebidos (últimos 50)
SELECT
  created_at,
  event_type,
  status,
  customer_email,
  plan_name,
  payment_method,
  amount / 100 as valor_reais,
  message
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 50;

-- Ver apenas webhooks com sucesso
SELECT
  created_at,
  customer_email,
  plan_name,
  payment_method,
  TO_CHAR(expiration_date, 'DD/MM/YYYY') as expira_em
FROM webhook_logs
WHERE status = 'success'
ORDER BY created_at DESC;

-- Ver webhooks com erro
SELECT
  created_at,
  customer_email,
  event_type,
  message,
  raw_payload
FROM webhook_logs
WHERE status = 'error'
ORDER BY created_at DESC;

-- Contar webhooks por tipo de evento
SELECT
  event_type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as sucessos,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as erros
FROM webhook_logs
GROUP BY event_type
ORDER BY total DESC;

-- Contar ativações por plano
SELECT
  plan_name,
  COUNT(*) as total_ativacoes,
  SUM(amount) / 100 as valor_total_reais
FROM webhook_logs
WHERE status = 'success'
GROUP BY plan_name
ORDER BY total_ativacoes DESC;

-- Ver usuários que foram criados automaticamente via webhook
SELECT
  w.created_at,
  w.customer_email,
  w.plan_name,
  u.id as user_id,
  u.plano_ativo,
  u.data_expiracao_plano
FROM webhook_logs w
LEFT JOIN users u ON u.email = w.customer_email
WHERE w.message LIKE '%Conta criada%'
ORDER BY w.created_at DESC;

-- Verificar se há discrepâncias (webhook sucesso mas usuário sem plano)
SELECT
  w.created_at,
  w.customer_email,
  w.plan_activated as webhook_plano,
  u.plano_ativo as user_plano,
  w.expiration_date as webhook_expiracao,
  u.data_expiracao_plano as user_expiracao
FROM webhook_logs w
LEFT JOIN users u ON u.email = w.customer_email
WHERE w.status = 'success'
  AND (u.plano_ativo != w.plan_activated OR u.plano_ativo IS NULL)
ORDER BY w.created_at DESC;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ RELATÓRIO DE VENDAS                                                     │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Vendas por dia (últimos 30 dias)
SELECT
  DATE(created_at) as data,
  COUNT(*) as total_vendas,
  COUNT(CASE WHEN payment_method LIKE '%pix%' THEN 1 END) as vendas_pix,
  COUNT(CASE WHEN payment_method LIKE '%card%' THEN 1 END) as vendas_cartao,
  SUM(amount) / 100 as faturamento_total
FROM webhook_logs
WHERE status = 'success'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- Ticket médio por plano
SELECT
  plan_name,
  COUNT(*) as total_vendas,
  AVG(amount) / 100 as ticket_medio,
  MIN(amount) / 100 as menor_venda,
  MAX(amount) / 100 as maior_venda
FROM webhook_logs
WHERE status = 'success'
GROUP BY plan_name;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ MANUTENÇÃO E DEBUG                                                      │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Ver payload completo de um webhook específico (para debug)
SELECT
  created_at,
  event_type,
  status,
  message,
  raw_payload
FROM webhook_logs
WHERE customer_email = 'email@exemplo.com'
ORDER BY created_at DESC
LIMIT 1;

-- Limpar logs antigos (maiores que 90 dias)
-- CUIDADO: Execute apenas se tiver certeza!
-- DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '90 days';


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ NOTAS IMPORTANTES                                                       │
-- └─────────────────────────────────────────────────────────────────────────┘

-- 1. Os valores em 'amount' são em CENTAVOS (ex: 2799 = R$ 27,99)
-- 2. Webhooks com status 'ignored' são eventos que não processamos (ex: pix.generated)
-- 3. Webhooks com status 'error' indicam problemas - investigue!
-- 4. A coluna 'raw_payload' tem o JSON completo para debug detalhado

DO $$
BEGIN
  RAISE NOTICE '✅ Arquivo de mapeamento e consultas carregado!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRODUTOS MAPEADOS:';
  RAISE NOTICE '   • lDGnSUHPwxWlHBlPEIFy → Plano Essencial (1)';
  RAISE NOTICE '   • WpjID8aV49ShaQ07ABzP → Plano Evoluir (2)';
  RAISE NOTICE '   • eOGqcq0IbQnJUpjKRpsG → Plano Prime (3)';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Use as consultas acima para monitorar webhooks!';
END $$;
