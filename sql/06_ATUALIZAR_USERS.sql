-- ========================================
-- PASSO 6: ATUALIZAR TABELA users
-- ========================================
-- Execute ISSO SÉTIMO no Supabase SQL Editor

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_plan_id INTEGER REFERENCES plans_v2(id),
  ADD COLUMN IF NOT EXISTS has_lifetime_access BOOLEAN DEFAULT false;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_active_plan_id ON users(active_plan_id);
CREATE INDEX IF NOT EXISTS idx_users_has_lifetime ON users(has_lifetime_access);

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 07_CRIAR_FUNCOES.sql
-- ========================================
