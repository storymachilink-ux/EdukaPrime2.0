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
ON public.amplopay_transactions(processed_at);

-- Adicionar comentários
COMMENT ON TABLE public.amplopay_transactions IS 'Registro de transações processadas do AmploPay';
COMMENT ON COLUMN public.amplopay_transactions.transaction_id IS 'ID da transação do AmploPay';
COMMENT ON COLUMN public.amplopay_transactions.webhook_data IS 'Dados completos do webhook para auditoria';

-- RLS (Row Level Security) - apenas admins podem ver
ALTER TABLE public.amplopay_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem ver transações AmploPay"
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