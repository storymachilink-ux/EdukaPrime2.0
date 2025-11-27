-- ========================================
-- PASSO 3: CRIAR TABELA plan_features
-- ========================================
-- Execute ISSO QUARTO no Supabase SQL Editor

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
-- PRONTO! Agora execute o próximo arquivo:
-- 04_INSERIR_FEATURES.sql
-- ========================================
