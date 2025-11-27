-- ========================================
-- PASSO 5: CRIAR TABELA user_subscriptions
-- ========================================
-- Execute ISSO SEXTO no Supabase SQL Editor

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 06_ATUALIZAR_USERS.sql
-- ========================================
