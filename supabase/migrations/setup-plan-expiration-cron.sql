-- ============================================
-- SETUP: Agendador de Verificação de Expiração
-- ============================================
--
-- Este script configura um job que roda DIARIAMENTE
-- para verificar e expirar planos que passaram da data
--
-- Agendamento: Todo dia às 00:00 UTC
-- Função: check-plan-expiration (Edge Function)
--
-- ============================================

-- [1] Habilitar extensão pg_cron (se não estiver ativada)
-- Execute uma vez: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- (Geralmente já está ativada no Supabase)

-- [2] Criar o job de agendamento
-- Nota: Substitua lkhfbhvamnqgcqlrriaw pelo seu projeto ID do Supabase

-- Opção A: Usando pg_cron (Recomendado)
SELECT cron.schedule(
  'check-plan-expiration-daily',
  '0 0 * * *',  -- 00:00 UTC todo dia
  $$
    SELECT
      http_post(
        'https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/check-plan-expiration',
        '{"trigger": "daily_cron"}'::jsonb,
        'application/json',
        jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        )
      ) AS response
  $$
);

-- [3] Verificar se o job foi criado
-- Execute para confirmar:
-- SELECT * FROM cron.job WHERE jobname = 'check-plan-expiration-daily';

-- [4] Monitorar execuções do job
-- Execute para ver histórico:
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-plan-expiration-daily')
-- ORDER BY start_time DESC LIMIT 10;

-- [5] Para DESABILITAR o job (se necessário):
-- SELECT cron.unschedule('check-plan-expiration-daily');

-- [6] Criar tabela de log para rastrear execuções (opcional)
CREATE TABLE IF NOT EXISTS plan_expiration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_date TIMESTAMP DEFAULT NOW(),

  expired_subscriptions_count INT,
  notifications_created INT,
  expired_pending_plans_count INT,

  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,

  execution_duration_ms INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- [7] Política de acesso (apenas sistema pode inserir)
ALTER TABLE plan_expiration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan expiration logs only from system" ON plan_expiration_logs
  FOR INSERT
  USING (TRUE);

-- [8] Índice para queries mais rápidas
CREATE INDEX IF NOT EXISTS idx_plan_expiration_logs_date
  ON plan_expiration_logs(execution_date DESC);

-- ============================================
-- INSTRUÇÕES DE DEPLOYMENT
-- ============================================
--
-- 1. Copie o arquivo `check-plan-expiration/index.ts` para:
--    supabase/functions/check-plan-expiration/index.ts
--
-- 2. Deploy da Edge Function:
--    supabase functions deploy check-plan-expiration
--
-- 3. Substitua lkhfbhvamnqgcqlrriaw neste arquivo pelo seu ID
--    Encontre em: https://app.supabase.com/project/lkhfbhvamnqgcqlrriaw
--
-- 4. Execute este arquivo SQL no Supabase SQL Editor:
--    - Acesse: https://app.supabase.com/project/lkhfbhvamnqgcqlrriaw/sql/new
--    - Cole este conteúdo
--    - Clique "Run"
--
-- 5. Verificar se funcionou:
--    - Acesse: https://app.supabase.com/project/lkhfbhvamnqgcqlrriaw/functions
--    - Procure por "check-plan-expiration"
--    - Verifique os logs
--
-- 6. Para forçar execução manual (teste):
--    curl -X POST https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/check-plan-expiration \
--      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
--      -H "Content-Type: application/json" \
--      -d '{}'
--
-- ============================================
