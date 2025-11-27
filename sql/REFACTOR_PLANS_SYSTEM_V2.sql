-- ========================================
-- REFATORAÇÃO COMPLETA DO SISTEMA DE PLANOS
-- PARA O EDUKAPRIME 2.0
-- ========================================
--
-- SITUAÇÃO ATUAL:
-- Tem duas abordagens misturadas:
-- 1) Users.plano_ativo (INTEGER 0-3) - Usada pela AuthContext
-- 2) Plans table com JSONB granular - Tentativa nova que não funciona
--
-- SOLUÇÃO:
-- Vamos MANTER o sistema simples de INTEGER plano_ativo
-- Vamos CRIAR uma tabela "user_subscriptions" pra rastrear múltiplas subscriptions
-- Vamos CRIAR "plan_features" pra mapear o que cada plano libera
-- Vamos EXCLUIR o sistema JSONB granular que não tá funcionando
--
-- ========================================

-- PASSO 1: ENTENDER A ESTRUTURA ATUAL DOS PLANOS
-- ========================================
-- Plan 0: GRATUITO (Free) - Alguns conteúdos gratuitos
-- Plan 1: ESSENCIAL (R$ 17,99/mês) - Atividades básicas + WhatsApp support
-- Plan 2: EVOLUIR (R$ 27,99/mês) - Atividades + Videos + Bônus
-- Plan 3: PRIME (R$ 49,99/mês) - Tudo + VIP Support
--
-- PAGAMENTO ÚNICO (Vitalício):
-- Plan 4: VITALÍCIO (R$ 197,99 ou similar) - Acesso permanente a tudo
--
-- ========================================

-- PASSO 2: RENOMEAR A TABELA ATUAL "plans" PARA ARQUIVO
-- ========================================
-- A tabela atual plans é confusa. Vamos renomear para reference histórica
-- ALTER TABLE plans RENAME TO plans_old_granular_system;
--
-- OU simplesmente EXCLUIR se já tiver testado bastante:
-- DROP TABLE IF EXISTS plans CASCADE;

-- ========================================

-- PASSO 3: CRIAR NOVA TABELA DE PLANOS (SIMPLES E CLARA)
-- ========================================

CREATE TABLE IF NOT EXISTS plans_v2 (
  id INTEGER PRIMARY KEY,                   -- 0, 1, 2, 3, 4, 5, etc
  name VARCHAR(100) NOT NULL UNIQUE,        -- "Gratuito", "Essencial", "Evoluir", "Prime", "Vitalício"
  display_name VARCHAR(100),                -- Nome exibido ao usuário
  description TEXT,                         -- Descrição do plano

  -- Preço e Tipo de Pagamento
  price DECIMAL(10,2) NOT NULL,            -- Preço em reais
  currency VARCHAR(3) DEFAULT 'BRL',       -- Moeda
  payment_type VARCHAR(20) NOT NULL,       -- 'mensal' ou 'unico'

  -- Duração
  duration_days INTEGER,                    -- NULL = ilimitado (vitalício), 30 = 1 mês, 365 = 1 ano

  -- Links de Checkout e Marketing
  checkout_url TEXT,                        -- URL do GGCheckout
  product_id_gateway TEXT,                  -- ID do produto na gateway (ex: 'lDGnSUHPwxWlHBlPEIFy')
  modal_image_url TEXT,                     -- Imagem para modal de upgrade
  modal_text TEXT,                          -- Texto descritivo no modal
  modal_button_text VARCHAR(100) DEFAULT 'Contratar', -- Texto do botão

  -- Apresentação
  icon VARCHAR(10) DEFAULT '🎁',            -- Emoji
  order_position INTEGER DEFAULT 0,         -- Posição no display
  color_code VARCHAR(7),                    -- Cor da interface (hex)

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados iniciais
INSERT INTO plans_v2 (id, name, display_name, description, price, payment_type, duration_days, checkout_url, product_id_gateway, icon, order_position, is_active)
VALUES
  (0, 'GRATUITO', 'Plano Gratuito', 'Acesso limitado com alguns conteúdos gratuitos', 0.00, 'mensal', NULL, NULL, NULL, '🎁', 0, true),
  (1, 'ESSENCIAL', 'Plano Essencial', 'Acesso a atividades BNCC + Suporte WhatsApp', 17.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGM', 'lDGnSUHPwxWlHBlPEIFy', '⭐', 1, true),
  (2, 'EVOLUIR', 'Plano Evoluir', 'Atividades + Vídeos + Bônus', 27.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGO', 'WpjID8aV49ShaQ07ABzP', '🚀', 2, true),
  (3, 'PRIME', 'Plano Prime', 'Acesso total + Suporte VIP 24/7', 49.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGP', 'eOGqcq0IbQnJUpjKRpsG', '👑', 3, true),
  (4, 'VITALICIO', 'Acesso Vitalício', 'Acesso permanente a todos os conteúdos', 197.99, 'unico', NULL, 'https://checkout.edukaprime.com.br/VITALICIO', NULL, '💎', 4, true);

-- ========================================

-- PASSO 4: CRIAR TABELA DE FEATURES POR PLANO
-- ========================================
-- Esta tabela mapeia o que cada plano libera
-- É simples, clara e fácil de modificar

CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  feature_name VARCHAR(50) NOT NULL,       -- 'atividades', 'videos', 'bonus', 'papercrafts', 'comunidade', 'suporte_vip'
  is_enabled BOOLEAN DEFAULT false,        -- Plano libera este recurso?

  UNIQUE(plan_id, feature_name),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir features para cada plano
-- GRATUITO (ID 0)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (0, 'atividades', false),
  (0, 'videos', false),
  (0, 'bonus', false),
  (0, 'papercrafts', false),
  (0, 'comunidade', false),
  (0, 'suporte_vip', false);

-- ESSENCIAL (ID 1)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (1, 'atividades', true),   -- Libera atividades
  (1, 'videos', false),
  (1, 'bonus', false),
  (1, 'papercrafts', false),
  (1, 'comunidade', false),
  (1, 'suporte_vip', false); -- Suporte por WhatsApp (separado)

-- EVOLUIR (ID 2)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (2, 'atividades', true),
  (2, 'videos', true),       -- Libera videos
  (2, 'bonus', true),        -- Libera bonus
  (2, 'papercrafts', false),
  (2, 'comunidade', false),
  (2, 'suporte_vip', false);

-- PRIME (ID 3)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (3, 'atividades', true),
  (3, 'videos', true),
  (3, 'bonus', true),
  (3, 'papercrafts', true),  -- Libera papercrafts
  (3, 'comunidade', true),   -- Libera comunidade
  (3, 'suporte_vip', true);  -- Suporte VIP 24/7

-- VITALÍCIO (ID 4)
INSERT INTO plan_features (plan_id, feature_name, is_enabled) VALUES
  (4, 'atividades', true),
  (4, 'videos', true),
  (4, 'bonus', true),
  (4, 'papercrafts', true),
  (4, 'comunidade', true),
  (4, 'suporte_vip', true);

-- ========================================

-- PASSO 5: CRIAR TABELA USER_SUBSCRIPTIONS
-- ========================================
-- Rastreia todas as subscriptions do usuário (múltiplos planos)
-- Um usuário pode ter VITALÍCIO + ESSENCIAL MENSAL simultâneos

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id),

  -- Status da subscription
  status VARCHAR(20) DEFAULT 'active',     -- 'active', 'inactive', 'expired', 'cancelled'

  -- Datas
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,       -- NULL = vitalício/indefinido

  -- Info do Pagamento
  payment_id TEXT,                         -- ID do pagamento na gateway
  product_id_gateway TEXT,                 -- ID do produto que foi pago
  payment_method VARCHAR(20),              -- 'pix', 'card', 'boleto'
  amount_paid DECIMAL(10,2),

  -- Info da Renovação
  auto_renew BOOLEAN DEFAULT true,         -- Renovar automaticamente? (apenas mensal)
  last_renewal_date TIMESTAMP WITH TIME ZONE,
  next_renewal_date TIMESTAMP WITH TIME ZONE,

  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_user_subscriptions_user_id (user_id),
  INDEX idx_user_subscriptions_status (status),
  INDEX idx_user_subscriptions_end_date (end_date)
);

-- ========================================

-- PASSO 6: ATUALIZAR TABELA USERS
-- ========================================
-- Remover colunas duplicadas e conflitantes
-- Adicionar coluna pra rastrear plano "principal" (mensal ativo)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_plan_id INTEGER REFERENCES plans_v2(id),
  ADD COLUMN IF NOT EXISTS has_lifetime_access BOOLEAN DEFAULT false;

-- Se a coluna plano_ativo já existe, vamos MANTER ela por enquanto para compatibilidade
-- Mas ela será preenchida baseada na active_plan_id

-- ========================================

-- PASSO 7: ATUALIZAR WEBHOOK_LOGS
-- ========================================
-- Adicionar suporte ao novo sistema de plans

ALTER TABLE webhook_logs
  ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES plans_v2(id),
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES user_subscriptions(id),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ========================================

-- PASSO 8: VIEW PARA SABER ACESSO ATUAL DO USUÁRIO
-- ========================================
-- Esta view retorna qual é o acesso ATUAL do usuário
-- Útil para queries rápidas

CREATE OR REPLACE VIEW user_current_access AS
SELECT DISTINCT
  u.id,
  u.email,
  COALESCE(us_monthly.plan_id, us_lifetime.plan_id, 0) as current_plan_id,
  COALESCE(p.name, 'GRATUITO') as plan_name,
  us_lifetime.id IS NOT NULL as has_lifetime,
  us_monthly.end_date as monthly_expires_at,
  us_lifetime.id as lifetime_subscription_id
FROM auth.users u
LEFT JOIN user_subscriptions us_monthly
  ON u.id = us_monthly.user_id
  AND us_monthly.status = 'active'
  AND us_monthly.plan_id IN (1, 2, 3)  -- Planos mensais
  AND (us_monthly.end_date IS NULL OR us_monthly.end_date > NOW())
LEFT JOIN user_subscriptions us_lifetime
  ON u.id = us_lifetime.user_id
  AND us_lifetime.status = 'active'
  AND us_lifetime.plan_id = 4  -- Plano vitalício
LEFT JOIN plans_v2 p
  ON COALESCE(us_monthly.plan_id, us_lifetime.plan_id, 0) = p.id;

-- ========================================

-- PASSO 9: FUNÇÃO PARA ATIVAR SUBSCRIPTION VIA WEBHOOK
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
BEGIN
  -- Obter duração do plano
  SELECT duration_days INTO v_duration
  FROM plans_v2
  WHERE id = p_plan_id;

  -- Calcular end_date se plano tem duração
  IF v_duration IS NOT NULL THEN
    v_end_date := NOW() + (v_duration || ' days')::INTERVAL;
  END IF;

  -- Se é plano mensal (1,2,3), desativar outros mensais
  IF p_plan_id IN (1, 2, 3) THEN
    UPDATE user_subscriptions
    SET status = 'inactive'
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
    p_user_id, p_plan_id, 'active', NOW(), v_end_date,
    p_payment_id, p_product_id_gateway, p_payment_method, p_amount_paid,
    CASE WHEN p_plan_id IN (1,2,3) THEN true ELSE false END,
    CASE WHEN p_plan_id IN (1,2,3) THEN NOW() + (30 || ' days')::INTERVAL ELSE NULL END
  ) RETURNING id INTO v_subscription_id;

  -- Atualizar users.plano_ativo para compatibilidade
  UPDATE users
  SET active_plan_id = p_plan_id,
      has_lifetime_access = CASE WHEN p_plan_id = 4 THEN true ELSE has_lifetime_access END,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================

-- PASSO 10: ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature_name ON plan_features(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_plan ON user_subscriptions(user_id, plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(user_id, status) WHERE status = 'active';

-- ========================================

-- RESUMO DO QUE FAZER:
-- ========================================
--
-- ✅ CRIAR: Nova tabela plans_v2 (simples e funcional)
-- ✅ CRIAR: Tabela plan_features (o que cada plano libera)
-- ✅ CRIAR: Tabela user_subscriptions (rastreia múltiplas subscriptions)
-- ✅ CRIAR: View user_current_access (acesso atual do usuário)
-- ✅ CRIAR: Função activate_user_subscription (ativar via webhook)
--
-- ⚠️ EXCLUIR: A tabela "plans" com JSONB granular (plans_old_granular_system)
-- ⚠️ REMOVER: Os campos redundantes da tabela users se necessário
--
-- 🔄 MIGRAR: Dados do webhook_logs para usar plan_id novo
--
-- ========================================
