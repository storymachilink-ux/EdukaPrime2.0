# 📋 PASSOS EXATOS PARA EXECUTAR NO SUPABASE

## ⚠️ ANTES DE COMEÇAR

Faça backup dos dados se precisar:
```sql
-- Backup da tabela webhook_logs atual
CREATE TABLE webhook_logs_backup AS SELECT * FROM webhook_logs;

-- Backup das transações
CREATE TABLE transactions_backup AS SELECT * FROM transactions;
```

---

## PASSO 1️⃣: LIMPAR O SISTEMA ANTIGO

Abra o SQL Editor do Supabase e execute:

```sql
-- ========================================
-- EXCLUIR TABELAS E COLUNAS ANTIGAS
-- ========================================

-- 1. Remover constraint de foreign key se existir
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plano_id_fkey;

-- 2. Remover coluna plano_id VARCHAR
ALTER TABLE users DROP COLUMN IF EXISTS plano_id;

-- 3. Excluir tabelas do sistema granular antigo
DROP TABLE IF EXISTS plan_features_old CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS community_channels CASCADE;
DROP TABLE IF EXISTS support_tiers CASCADE;

-- Confirma: estas tabelas NÃO devem mais aparecer em Tables
```

**Verificação**: No painel do Supabase, tabela `plans` deve desaparecer.

---

## PASSO 2️⃣: CRIAR NOVA TABELA DE PLANOS

```sql
-- ========================================
-- NOVA TABELA: plans_v2
-- ========================================

CREATE TABLE IF NOT EXISTS plans_v2 (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  description TEXT,

  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_type VARCHAR(20) NOT NULL,
  duration_days INTEGER,

  checkout_url TEXT,
  product_id_gateway TEXT,
  modal_image_url TEXT,
  modal_text TEXT,
  modal_button_text VARCHAR(100) DEFAULT 'Contratar',

  icon VARCHAR(10) DEFAULT '🎁',
  order_position INTEGER DEFAULT 0,
  color_code VARCHAR(7),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INSERIR DADOS INICIAIS
-- ========================================

INSERT INTO plans_v2 (id, name, display_name, description, price, payment_type, duration_days, checkout_url, product_id_gateway, icon, order_position, is_active)
VALUES
  (0, 'GRATUITO', 'Plano Gratuito', 'Acesso limitado com alguns conteúdos gratuitos', 0.00, 'mensal', NULL, NULL, NULL, '🎁', 0, true),
  (1, 'ESSENCIAL', 'Plano Essencial', 'Acesso a atividades BNCC + Suporte WhatsApp', 17.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGM', 'lDGnSUHPwxWlHBlPEIFy', '⭐', 1, true),
  (2, 'EVOLUIR', 'Plano Evoluir', 'Atividades + Vídeos + Bônus', 27.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGO', 'WpjID8aV49ShaQ07ABzP', '🚀', 2, true),
  (3, 'PRIME', 'Plano Prime', 'Acesso total + Suporte VIP 24/7', 49.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGP', 'eOGqcq0IbQnJUpjKRpsG', '👑', 3, true),
  (4, 'VITALICIO', 'Acesso Vitalício', 'Acesso permanente a todos os conteúdos', 197.99, 'unico', NULL, 'https://checkout.edukaprime.com.br/VITALICIO', NULL, '💎', 4, true);

-- ========================================
-- CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plans_v2_is_active ON plans_v2(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_v2_payment_type ON plans_v2(payment_type);
CREATE INDEX IF NOT EXISTS idx_plans_v2_product_id ON plans_v2(product_id_gateway);
```

---

## PASSO 3️⃣: CRIAR TABELA DE FEATURES

```sql
-- ========================================
-- NOVA TABELA: plan_features
-- ========================================

CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  feature_name VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT false,

  UNIQUE(plan_id, feature_name),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INSERIR FEATURES PARA CADA PLANO
-- ========================================

-- Plan 0: GRATUITO
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (0, 'atividades', false),
  (0, 'videos', false),
  (0, 'bonus', false),
  (0, 'papercrafts', false),
  (0, 'comunidade', false),
  (0, 'suporte_vip', false);

-- Plan 1: ESSENCIAL
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (1, 'atividades', true),
  (1, 'videos', false),
  (1, 'bonus', false),
  (1, 'papercrafts', false),
  (1, 'comunidade', false),
  (1, 'suporte_vip', false);

-- Plan 2: EVOLUIR
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (2, 'atividades', true),
  (2, 'videos', true),
  (2, 'bonus', true),
  (2, 'papercrafts', false),
  (2, 'comunidade', false),
  (2, 'suporte_vip', false);

-- Plan 3: PRIME
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (3, 'atividades', true),
  (3, 'videos', true),
  (3, 'bonus', true),
  (3, 'papercrafts', true),
  (3, 'comunidade', true),
  (3, 'suporte_vip', true);

-- Plan 4: VITALÍCIO
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (4, 'atividades', true),
  (4, 'videos', true),
  (4, 'bonus', true),
  (4, 'papercrafts', true),
  (4, 'comunidade', true),
  (4, 'suporte_vip', true);

-- ========================================
-- CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plan_features_plan ON plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature ON plan_features(feature_name);
CREATE INDEX IF NOT EXISTS idx_plan_features_enabled ON plan_features(plan_id, is_enabled);
```

---

## PASSO 4️⃣: CRIAR TABELA DE SUBSCRIPTIONS

```sql
-- ========================================
-- NOVA TABELA: user_subscriptions
-- Rastreia todas as compras e planos do usuário
-- ========================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id),

  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,

  payment_id TEXT,
  product_id_gateway TEXT,
  payment_method VARCHAR(20),
  amount_paid DECIMAL(10,2),

  auto_renew BOOLEAN DEFAULT true,
  last_renewal_date TIMESTAMP WITH TIME ZONE,
  next_renewal_date TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT subscription_status_check CHECK (status IN ('active', 'inactive', 'expired', 'cancelled'))
);

-- ========================================
-- CRIAR ÍNDICES ESSENCIAIS
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(user_id, status) WHERE status = 'active';
```

---

## PASSO 5️⃣: ATUALIZAR TABELA USERS

```sql
-- ========================================
-- ADICIONAR COLUNAS NA TABELA USERS
-- ========================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_plan_id INTEGER REFERENCES plans_v2(id),
  ADD COLUMN IF NOT EXISTS has_lifetime_access BOOLEAN DEFAULT false;

-- ========================================
-- CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_active_plan_id ON users(active_plan_id);
CREATE INDEX IF NOT EXISTS idx_users_has_lifetime ON users(has_lifetime_access);
```

---

## PASSO 6️⃣: CRIAR VIEW PARA ACESSO ATUAL

```sql
-- ========================================
-- VIEW: user_current_access
-- Mostra qual é o plano ATUAL do usuário
-- ========================================

DROP VIEW IF EXISTS user_current_access CASCADE;

CREATE VIEW user_current_access AS
SELECT
  u.id,
  u.email,
  COALESCE(us_monthly.plan_id, us_lifetime.plan_id, 0) as current_plan_id,
  COALESCE(p.name, 'GRATUITO') as plan_name,
  COALESCE(p.display_name, 'Plano Gratuito') as plan_display_name,
  us_lifetime.id IS NOT NULL as has_lifetime_access,
  us_monthly.end_date as monthly_expires_at,
  us_monthly.next_renewal_date,
  us_monthly.id as monthly_subscription_id,
  us_lifetime.id as lifetime_subscription_id
FROM auth.users u
LEFT JOIN user_subscriptions us_monthly
  ON u.id = us_monthly.user_id
  AND us_monthly.status = 'active'
  AND us_monthly.plan_id IN (1, 2, 3)
  AND (us_monthly.end_date IS NULL OR us_monthly.end_date > NOW())
LEFT JOIN user_subscriptions us_lifetime
  ON u.id = us_lifetime.user_id
  AND us_lifetime.status = 'active'
  AND us_lifetime.plan_id = 4
LEFT JOIN plans_v2 p
  ON COALESCE(us_monthly.plan_id, us_lifetime.plan_id, 0) = p.id;
```

---

## PASSO 7️⃣: CRIAR FUNÇÃO SQL PARA ATIVAR SUBSCRIPTION

```sql
-- ========================================
-- FUNÇÃO: activate_user_subscription
-- Usada pelo webhook para ativar compras
-- ========================================

CREATE OR REPLACE FUNCTION activate_user_subscription(
  p_user_id UUID,
  p_plan_id INTEGER,
  p_payment_id TEXT,
  p_product_id_gateway TEXT,
  p_payment_method VARCHAR,
  p_amount_paid DECIMAL
) RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_duration INTEGER;
  v_plan_payment_type VARCHAR;
BEGIN
  -- Obter informações do plano
  SELECT duration_days, payment_type
  INTO v_duration, v_plan_payment_type
  FROM plans_v2
  WHERE id = p_plan_id;

  -- Calcular end_date se plano tem duração
  IF v_duration IS NOT NULL THEN
    v_end_date := NOW() + (v_duration || ' days')::INTERVAL;
  END IF;

  -- Se é plano mensal (1,2,3), desativar outros mensais do mesmo usuário
  IF p_plan_id IN (1, 2, 3) THEN
    UPDATE user_subscriptions
    SET status = 'inactive', updated_at = NOW()
    WHERE user_id = p_user_id
      AND plan_id IN (1, 2, 3)
      AND status = 'active';
  END IF;

  -- Criar nova subscription
  INSERT INTO user_subscriptions (
    user_id, plan_id, status, start_date, end_date,
    payment_id, product_id_gateway, payment_method, amount_paid,
    auto_renew, next_renewal_date
  ) VALUES (
    p_user_id,
    p_plan_id,
    'active',
    NOW(),
    v_end_date,
    p_payment_id,
    p_product_id_gateway,
    p_payment_method,
    p_amount_paid,
    CASE WHEN v_plan_payment_type = 'mensal' THEN true ELSE false END,
    CASE WHEN v_plan_payment_type = 'mensal' THEN NOW() + INTERVAL '30 days' ELSE NULL END
  ) RETURNING id INTO v_subscription_id;

  -- Atualizar status do usuário
  UPDATE users
  SET
    active_plan_id = CASE WHEN p_plan_id IN (1,2,3) THEN p_plan_id ELSE active_plan_id END,
    has_lifetime_access = CASE WHEN p_plan_id = 4 THEN true ELSE has_lifetime_access END,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## PASSO 8️⃣: CRIAR FUNÇÃO PARA VERIFICAR ACESSO

```sql
-- ========================================
-- FUNÇÃO: user_has_feature_access
-- Verifica se usuário tem acesso a um feature
-- ========================================

CREATE OR REPLACE FUNCTION user_has_feature_access(
  p_user_id UUID,
  p_feature_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN := false;
  v_lifetime_access BOOLEAN;
  v_plan_id INTEGER;
BEGIN
  -- Verificar se tem acesso vitalício
  SELECT has_lifetime_access INTO v_lifetime_access
  FROM users
  WHERE id = p_user_id;

  -- Se tem vitalício, retorna true (libera tudo)
  IF v_lifetime_access THEN
    RETURN true;
  END IF;

  -- Obter plano mensal ativo
  SELECT plan_id INTO v_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND plan_id IN (1, 2, 3)
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não tem plano, usar GRATUITO
  IF v_plan_id IS NULL THEN
    v_plan_id := 0;
  END IF;

  -- Verificar se plano libera este feature
  SELECT is_enabled INTO v_has_access
  FROM plan_features
  WHERE plan_id = v_plan_id
    AND feature_name = p_feature_name;

  -- Se não encontrou, retorna false
  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## PASSO 9️⃣: ATUALIZAR WEBHOOK_LOGS

```sql
-- ========================================
-- ADICIONAR COLUNAS EM WEBHOOK_LOGS
-- ========================================

ALTER TABLE webhook_logs
  ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES plans_v2(id),
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES user_subscriptions(id),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ========================================
-- CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_plan_id ON webhook_logs(plan_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_subscription_id ON webhook_logs(subscription_id);
```

---

## PASSO 1️⃣0️⃣: HABILITAR RLS (Row Level Security)

```sql
-- ========================================
-- CONFIGURAR ROW LEVEL SECURITY
-- ========================================

-- plans_v2: Todos podem ver planos ativos
ALTER TABLE plans_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_can_view_active_plans" ON plans_v2
  FOR SELECT USING (is_active = true);

-- plan_features: Todos podem ver features de planos ativos
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_can_view_active_plan_features" ON plan_features
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM plans_v2 WHERE plans_v2.id = plan_features.plan_id AND is_active = true));

-- user_subscriptions: Usuários veem suas próprias, admins veem tudo
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_subscriptions" ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admin_manage_subscriptions" ON user_subscriptions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true));
```

---

## ✅ VERIFICAÇÃO FINAL

Após executar TODOS os passos, verifique:

```sql
-- Tabelas existem?
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Deve listar: plans_v2, plan_features, user_subscriptions, ...

-- Dados inseridos?
SELECT COUNT(*) FROM plans_v2;  -- Deve retornar 5
SELECT COUNT(*) FROM plan_features;  -- Deve retornar 30 (5 planos × 6 features)

-- View funciona?
SELECT * FROM user_current_access LIMIT 1;  -- Deve retornar dados

-- Função criada?
\df activate_user_subscription
\df user_has_feature_access
```

---

## 🎉 PRONTO!

Se tudo passou, o banco está pronto para o novo sistema!

Próximo passo: Reescrever o frontend.
