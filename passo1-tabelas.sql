-- PASSO 1: CRIAR TABELAS
-- Cole isso no Supabase Dashboard > SQL Editor > New Query

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.amplopay_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  user_email TEXT NOT NULL,
  offer_code TEXT NOT NULL,
  plan_level INTEGER NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  webhook_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas na tabela users (se não existirem)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plano_ativo INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS data_ativacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_email ON public.amplopay_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_transaction_id ON public.amplopay_transactions(transaction_id);

-- Habilitar RLS na tabela de transações
ALTER TABLE public.amplopay_transactions ENABLE ROW LEVEL SECURITY;