-- ========================================
-- PASSO 1: EXCLUIR TABELAS ANTIGAS
-- ========================================
-- Execute isto PRIMEIRO
-- Se der erro "table does not exist", é normal, só significa que não tá lá

DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS community_channels CASCADE;
DROP TABLE IF EXISTS support_tiers CASCADE;

-- OK! Tabelas antigas deletadas
-- Próximo passo: execute PASSO 2

-- ========================================
-- PASSO 2: CRIAR TABELA plans_v2
-- ========================================

CREATE TABLE plans_v2 (
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

-- OK! Tabela plans_v2 criada
-- Próximo passo: execute PASSO 3
