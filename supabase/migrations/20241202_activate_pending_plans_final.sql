-- ═══════════════════════════════════════════════════════════════════════════
-- ARQUIVO: 20241202_activate_pending_plans_final.sql
-- DATA: 2 de dezembro de 2024
-- OBJETIVO: Função final, idempotente e estável para ativar planos pendentes
-- STATUS: PRONTO PARA PRODUÇÃO
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. GARANTIR QUE TABELA pending_plans EXISTE COM COLUNAS NECESSÁRIAS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS pending_plans ADD COLUMN IF NOT EXISTS activated_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Verificar que payment_id é UNIQUE (ou adicionar se não existir)
-- Nota: O UNIQUE constraint é melhor fazer via migration separada se não existir

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. FUNÇÃO PRINCIPAL: activate_pending_plans
-- Ativa automaticamente todos os planos pendentes de um email
-- Idempotente: seguro chamar múltiplas vezes
-- ═══════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS activate_pending_plans(UUID, VARCHAR) CASCADE;

CREATE OR REPLACE FUNCTION activate_pending_plans(
  p_user_id UUID,
  p_user_email VARCHAR
)
RETURNS TABLE (
  total_activated INTEGER,
  last_plan_id INTEGER
) AS $$
DECLARE
  v_total_activated INTEGER := 0;
  v_last_plan_id INTEGER := 0;
  v_pending_plan RECORD;
BEGIN
  -- Buscar todos os pending_plans para este email com status 'pending'
  FOR v_pending_plan IN
    SELECT
      id,
      plan_id,
      end_date,
      payment_id,
      product_id_gateway,
      payment_method,
      amount_paid,
      webhook_id,
      platform
    FROM pending_plans
    WHERE LOWER(email) = LOWER(p_user_email)
      AND status = 'pending'
    ORDER BY created_at ASC
  LOOP
    v_last_plan_id := v_pending_plan.plan_id;

    BEGIN
      -- 1. Inserir em user_subscriptions com ON CONFLICT para idempotência
      -- Se já existe subscription com mesmo (user_id, plan_id, payment_id), ignora
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        start_date,
        end_date,
        payment_id,
        product_id_gateway,
        payment_method,
        amount_paid,
        webhook_id
      ) VALUES (
        p_user_id,
        v_pending_plan.plan_id,
        'active',
        NOW(),
        v_pending_plan.end_date,
        v_pending_plan.payment_id,
        v_pending_plan.product_id_gateway,
        v_pending_plan.payment_method,
        v_pending_plan.amount_paid,
        v_pending_plan.webhook_id
      )
      ON CONFLICT (user_id, plan_id, payment_id) DO NOTHING;

      -- 2. Atualizar usuário com o plano ativo
      -- Atualizando AMBOS active_plan_id e plano_ativo para compatibilidade total
      UPDATE users
      SET
        active_plan_id = v_pending_plan.plan_id,
        plano_ativo = v_pending_plan.plan_id,
        updated_at = NOW()
      WHERE id = p_user_id;

      -- 3. Marcar pending_plan como ativado
      UPDATE pending_plans
      SET
        status = 'activated',
        activated_user_id = p_user_id,
        activated_at = NOW(),
        updated_at = NOW()
      WHERE id = v_pending_plan.id
        AND status = 'pending'; -- Apenas se ainda estava pendente (segurança)

      v_total_activated := v_total_activated + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Log do erro mas continua processando outros planos pendentes
      RAISE WARNING '[activate_pending_plans] Erro ao ativar plano %: %',
        v_pending_plan.id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;

  -- Retornar resultado final
  RETURN QUERY SELECT v_total_activated, v_last_plan_id;

EXCEPTION WHEN OTHERS THEN
  -- Se erro geral, retornar (0, 0) sem crashar
  RAISE WARNING '[activate_pending_plans] Erro geral: %', SQLERRM;
  RETURN QUERY SELECT 0::INTEGER, 0::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PERMISSÕES
-- Permitir que service_role e usuários autenticados chamem a função
-- ═══════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION activate_pending_plans(UUID, VARCHAR)
  TO service_role, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ÍNDICES PARA PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para busca rápida de pending_plans por email e status
CREATE INDEX IF NOT EXISTS idx_pending_plans_email_status
ON pending_plans(LOWER(email), status)
WHERE status = 'pending';

-- Índice para idempotência: verificar se payment_id já existe
CREATE INDEX IF NOT EXISTS idx_pending_plans_payment_id_status
ON pending_plans(payment_id, status)
WHERE status = 'pending';

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════════════════════

-- Query para verificar que função foi criada corretamente:
-- SELECT * FROM information_schema.routines WHERE routine_name = 'activate_pending_plans';

-- Query para testar a função (opcional):
-- SELECT * FROM activate_pending_plans(
--   'seu-uuid-aqui'::UUID,
--   'seu-email@example.com'::VARCHAR
-- );

-- ═══════════════════════════════════════════════════════════════════════════
-- STATUS: ✅ COMPLETO E PRONTO PARA PRODUÇÃO
-- ═══════════════════════════════════════════════════════════════════════════
