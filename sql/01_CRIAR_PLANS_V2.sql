-- ========================================
-- PASSO 1: CRIAR TABELA plans_v2
-- ========================================
-- Execute ISSO SEGUNDO no Supabase SQL Editor

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

-- Verificar: SELECT * FROM plans_v2; (deve retornar 0 linhas por enquanto)

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 02_INSERIR_PLANOS.sql
-- ========================================
