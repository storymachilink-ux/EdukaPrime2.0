-- ═══════════════════════════════════════════════════════════════════════════
-- CORREÇÕES CRÍTICAS PARA SISTEMA DE PENDING_PLANS
-- ═══════════════════════════════════════════════════════════════════════════
-- Data: 2025-11-25
-- Descrição: Adiciona campos faltantes e implementa RLS em tabelas críticas
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 1: Adicionar colunas faltantes
-- ═══════════════════════════════════════════════════════════════════════════

-- Adicionar webhook_id em user_subscriptions (FK para webhook_logs)
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS webhook_id UUID REFERENCES webhook_logs(id) ON DELETE SET NULL;

-- Adicionar data_expiracao_plano em users (para rastrear quando plano vence)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS data_expiracao_plano TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 2: Implementar RLS em user_subscriptions
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "users_read_own_subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "service_role_insert_subscriptions" ON user_subscriptions;

-- Criar policy para usuários lerem suas próprias subscriptions
CREATE POLICY "users_read_own_subscriptions"
  ON user_subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

-- Criar policy para service_role inserir (webhooks)
CREATE POLICY "service_role_insert_subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 3: Implementar RLS em users
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "users_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "service_role_all_users" ON users;

-- Criar policy para usuários lerem seu próprio perfil
CREATE POLICY "users_read_own_profile"
  ON users FOR SELECT
  USING (
    id = auth.uid() OR
    is_admin = (SELECT is_admin FROM users WHERE id = auth.uid() LIMIT 1)
  );

-- Criar policy para usuários atualizarem seu próprio perfil
CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Criar policy para service_role fazer qualquer coisa
CREATE POLICY "service_role_all_users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 4: Adicionar índices para performance
-- ═══════════════════════════════════════════════════════════════════════════

DROP INDEX IF EXISTS idx_user_subscriptions_webhook_id;
CREATE INDEX idx_user_subscriptions_webhook_id
ON user_subscriptions(webhook_id);

DROP INDEX IF EXISTS idx_users_data_expiracao_plano;
CREATE INDEX idx_users_data_expiracao_plano
ON users(data_expiracao_plano);

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 5: Garantir que RLS não quebra operações de admin
-- ═══════════════════════════════════════════════════════════════════════════

-- Grant em user_subscriptions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;

-- Grant em users
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO service_role;
GRANT SELECT, UPDATE ON users TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASSO 6: Criar trigger para validação (opcional - para dados consistentes)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_user_subscription_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que end_date (se existir) é posterior a start_date
  IF NEW.end_date IS NOT NULL AND NEW.start_date > NEW.end_date THEN
    RAISE EXCEPTION 'end_date deve ser posterior a start_date';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_validate_subscription_dates ON user_subscriptions;

-- Criar novo trigger
CREATE TRIGGER trigger_validate_subscription_dates
BEFORE INSERT OR UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION validate_user_subscription_dates();

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ user_subscriptions.webhook_id adicionado
-- ✅ users.data_expiracao_plano adicionado
-- ✅ RLS implementado em user_subscriptions
-- ✅ RLS implementado em users
-- ✅ Índices criados para performance
-- ✅ Triggers de validação ativados
-- ═══════════════════════════════════════════════════════════════════════════
