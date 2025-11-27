-- ========================================
-- SISTEMA DE PLANOS - ESTRUTURA COMPLETA
-- ========================================

-- 1. TABELA PRINCIPAL DE PLANOS
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  checkout_url TEXT,
  modal_image_url TEXT,
  modal_text TEXT,
  modal_button_text VARCHAR(100),
  payment_type VARCHAR(20) CHECK (payment_type IN ('mensal', 'unico', NULL)),
  price DECIMAL(10,2) DEFAULT 0,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA DE CANAIS DE COMUNIDADE
CREATE TABLE IF NOT EXISTS community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABELA DE NÍVEIS DE SUPORTE
CREATE TABLE IF NOT EXISTS support_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. ADICIONAR COLUNA plano_id NA TABELA users (se não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plano_id VARCHAR(50) REFERENCES plans(id);

-- ========================================
-- INSERIR DADOS INICIAIS
-- ========================================

-- Plano Essencial
INSERT INTO plans (id, name, description, permissions, checkout_url, modal_image_url, modal_text, modal_button_text, payment_type, price, icon, is_active)
VALUES (
  '3MEQ1R',
  'Essencial',
  'Acesso a atividades BNCC básicas',
  '{"atividades": {"mode": "granular", "allowed_ids": []}, "videos": {"mode": "granular", "allowed_ids": []}, "bonus": {"mode": "granular", "allowed_ids": []}, "papercrafts": {"mode": "granular", "allowed_ids": []}, "comunidade": {"mode": "granular", "allowed_ids": []}, "suporte": {"mode": "granular", "allowed_ids": []}}',
  '',
  '',
  '',
  'Obter Essencial',
  'mensal',
  17.99,
  '⭐',
  true
) ON CONFLICT (id) DO NOTHING;

-- Plano Evoluir
INSERT INTO plans (id, name, description, permissions, checkout_url, modal_image_url, modal_text, modal_button_text, payment_type, price, icon, is_active)
VALUES (
  '3METLQ',
  'Evoluir',
  'Acesso a vídeos, atividades e bônus',
  '{"atividades": {"mode": "granular", "allowed_ids": []}, "videos": {"mode": "granular", "allowed_ids": []}, "bonus": {"mode": "granular", "allowed_ids": []}, "papercrafts": {"mode": "granular", "allowed_ids": []}, "comunidade": {"mode": "granular", "allowed_ids": []}, "suporte": {"mode": "granular", "allowed_ids": []}}',
  '',
  '',
  '',
  'Obter Evoluir',
  'mensal',
  27.99,
  '🚀',
  true
) ON CONFLICT (id) DO NOTHING;

-- Plano Prime
INSERT INTO plans (id, name, description, permissions, checkout_url, modal_image_url, modal_text, modal_button_text, payment_type, price, icon, is_active)
VALUES (
  '3METLR',
  'Prime',
  'Acesso total à plataforma com suporte VIP',
  '{"atividades": {"mode": "granular", "allowed_ids": []}, "videos": {"mode": "granular", "allowed_ids": []}, "bonus": {"mode": "granular", "allowed_ids": []}, "papercrafts": {"mode": "granular", "allowed_ids": []}, "comunidade": {"mode": "granular", "allowed_ids": []}, "suporte": {"mode": "granular", "allowed_ids": []}}',
  '',
  '',
  '',
  'Obter Prime',
  'mensal',
  49.99,
  '👑',
  true
) ON CONFLICT (id) DO NOTHING;

-- Plano Gratuito (ID especial para plano padrão)
INSERT INTO plans (id, name, description, permissions, checkout_url, modal_image_url, modal_text, modal_button_text, payment_type, price, icon, is_active)
VALUES (
  'GRATUITO',
  'Gratuito',
  'Acesso limitado para novos usuários',
  '{"atividades": {"mode": "granular", "allowed_ids": []}, "videos": {"mode": "granular", "allowed_ids": []}, "bonus": {"mode": "granular", "allowed_ids": []}, "papercrafts": {"mode": "granular", "allowed_ids": []}, "comunidade": {"mode": "granular", "allowed_ids": []}, "suporte": {"mode": "granular", "allowed_ids": []}}',
  NULL,
  '',
  '',
  NULL,
  NULL,
  0,
  '🎁',
  true
) ON CONFLICT (name) DO NOTHING;

-- ========================================
-- CANAIS DE COMUNIDADE PADRÃO
-- ========================================

INSERT INTO community_channels (name, description, icon, is_active)
VALUES
  ('Canal Geral', 'Discussões gerais da comunidade', '💬', true),
  ('Suporte Exclusivo', 'Suporte para membros Premium', '🆘', true),
  ('Recursos Educadores', 'Materiais para educadores', '📚', true)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- NÍVEIS DE SUPORTE PADRÃO
-- ========================================

INSERT INTO support_tiers (name, description, is_active)
VALUES
  ('Chat Regular', 'Suporte via chat durante horário comercial', true),
  ('Chat Prioritário', 'Suporte prioritário 24/7', true),
  ('Tickets', 'Sistema de tickets com rastreamento', true)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_users_plano_id ON users(plano_id);
CREATE INDEX IF NOT EXISTS idx_community_channels_is_active ON community_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_support_tiers_is_active ON support_tiers(is_active);

-- ========================================
-- RLS POLICIES (Será configurado em seguida)
-- ========================================

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tiers ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver planos ativos
CREATE POLICY "Planos ativos são visíveis para todos"
  ON plans
  FOR SELECT
  USING (is_active = true);

-- Policy: Apenas admins podem modificar planos
CREATE POLICY "Apenas admins podem modificar planos"
  ON plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Policy: Todos podem ver canais de comunidade ativos
CREATE POLICY "Canais ativos são visíveis para todos"
  ON community_channels
  FOR SELECT
  USING (is_active = true);

-- Policy: Apenas admins podem modificar canais
CREATE POLICY "Apenas admins podem modificar canais"
  ON community_channels
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
