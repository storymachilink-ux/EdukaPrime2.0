-- ===============================================
-- CRIAR TABELA DE TRANSAÇÕES
-- ===============================================
-- Esta tabela registra todas as transações de pagamento
-- para contabilização na área admin
--
-- COMO EXECUTAR:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Abra seu projeto
-- 3. Menu lateral: SQL Editor
-- 4. Clique em: "+ New query"
-- 5. Cole TODO este código
-- 6. Clique em: "Run"
-- ===============================================

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do pagamento
  payment_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  plan_level INTEGER NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  event_type TEXT NOT NULL,

  -- Dados do cliente
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,

  -- Metadata
  raw_payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON public.transactions(customer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON public.transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todas as transações
CREATE POLICY "Admins podem ver todas as transações" ON public.transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Política para usuários verem apenas suas transações
CREATE POLICY "Usuários podem ver próprias transações" ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ===============================================
-- VERIFICAR SE FUNCIONOU
-- ===============================================
-- Execute esta query para verificar:
-- SELECT * FROM public.transactions ORDER BY created_at DESC LIMIT 10;
-- ===============================================

-- FIM DO SCRIPT
