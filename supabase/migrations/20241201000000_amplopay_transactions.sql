-- Criar tabela para registrar transações do AmploPay
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_email
ON public.amplopay_transactions(user_email);

CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_transaction_id
ON public.amplopay_transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_processed_at
ON public.amplopay_transactions(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_plan_level
ON public.amplopay_transactions(plan_level);

-- Adicionar comentários
COMMENT ON TABLE public.amplopay_transactions IS 'Registro de transações processadas do AmploPay';
COMMENT ON COLUMN public.amplopay_transactions.transaction_id IS 'ID único da transação do AmploPay';
COMMENT ON COLUMN public.amplopay_transactions.webhook_data IS 'Dados completos do webhook para auditoria';
COMMENT ON COLUMN public.amplopay_transactions.plan_level IS 'Nível do plano: 1=Essencial, 2=Evoluir, 3=Prime';

-- RLS (Row Level Security) - apenas admins podem ver
ALTER TABLE public.amplopay_transactions ENABLE ROW LEVEL SECURITY;

-- Policy para admins verem tudo
CREATE POLICY "Admins podem ver todas as transações AmploPay"
ON public.amplopay_transactions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.email = auth.email()
    AND users.is_admin = true
  )
);

-- Policy para usuários verem apenas suas próprias transações
CREATE POLICY "Usuários podem ver suas próprias transações"
ON public.amplopay_transactions
FOR SELECT
TO authenticated
USING (user_email = auth.email());

-- Verificar se tabela users já tem as colunas necessárias
DO $$
BEGIN
  -- Adicionar coluna plano_ativo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'plano_ativo'
  ) THEN
    ALTER TABLE public.users ADD COLUMN plano_ativo INTEGER DEFAULT 0;
  END IF;

  -- Adicionar coluna data_ativacao se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'data_ativacao'
  ) THEN
    ALTER TABLE public.users ADD COLUMN data_ativacao TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Adicionar coluna is_admin se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Adicionar coluna plano_teste se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'plano_teste'
  ) THEN
    ALTER TABLE public.users ADD COLUMN plano_teste INTEGER;
  END IF;
END $$;

-- Comentários para tabela users
COMMENT ON COLUMN public.users.plano_ativo IS 'Plano ativo: 0=Demo, 1=Essencial, 2=Evoluir, 3=Prime, 5=Admin';
COMMENT ON COLUMN public.users.data_ativacao IS 'Data de ativação do plano atual';
COMMENT ON COLUMN public.users.is_admin IS 'Se o usuário é administrador';
COMMENT ON COLUMN public.users.plano_teste IS 'Nível do plano de teste temporário';