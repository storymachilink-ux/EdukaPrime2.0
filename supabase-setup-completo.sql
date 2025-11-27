-- ============================================
-- SETUP COMPLETO DO SUPABASE - EDUKAPRIME
-- ============================================
-- Execute este script no Supabase Dashboard > SQL Editor > New Query
-- Este script cria todas as tabelas, funções e políticas necessárias

-- ============================================
-- PASSO 1: CRIAR/ATUALIZAR TABELA DE USUÁRIOS
-- ============================================

-- Criar tabela users se não existir
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  plano_ativo INTEGER DEFAULT 0,
  data_ativacao TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas se não existirem (para migração)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plano_ativo') THEN
    ALTER TABLE public.users ADD COLUMN plano_ativo INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'data_ativacao') THEN
    ALTER TABLE public.users ADD COLUMN data_ativacao TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================
-- PASSO 2: CRIAR TABELA DE TRANSAÇÕES AMPLOPAY
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_email ON public.amplopay_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_transaction_id ON public.amplopay_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- PASSO 3: HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amplopay_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 4: CRIAR POLÍTICAS RLS
-- ============================================

-- Políticas para tabela users
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
CREATE POLICY "Usuários podem ver seus próprios dados"
  ON public.users FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON public.users FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

DROP POLICY IF EXISTS "Service role pode fazer tudo em users" ON public.users;
CREATE POLICY "Service role pode fazer tudo em users"
  ON public.users FOR ALL
  USING (true);

-- Políticas para tabela amplopay_transactions
DROP POLICY IF EXISTS "Usuários podem ver suas transações" ON public.amplopay_transactions;
CREATE POLICY "Usuários podem ver suas transações"
  ON public.amplopay_transactions FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Service role pode fazer tudo em transactions" ON public.amplopay_transactions;
CREATE POLICY "Service role pode fazer tudo em transactions"
  ON public.amplopay_transactions FOR ALL
  USING (true);

-- ============================================
-- PASSO 5: CRIAR FUNÇÃO PARA PROCESSAR WEBHOOK AMPLOPAY
-- ============================================

CREATE OR REPLACE FUNCTION public.process_amplopay_webhook(
  webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_level INTEGER;
  plan_name TEXT;
  user_email TEXT;
  offer_code TEXT;
  transaction_id TEXT;
  existing_user RECORD;
BEGIN
  -- Extrair dados do webhook
  user_email := webhook_data->'client'->>'email';
  offer_code := webhook_data->>'offerCode';
  transaction_id := webhook_data->'transaction'->>'id';

  -- Validar dados obrigatórios
  IF user_email IS NULL OR offer_code IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email e offerCode são obrigatórios'
    );
  END IF;

  -- Determinar plano baseado no offer code
  CASE offer_code
    WHEN 'LIGRMS3' THEN
      plan_level := 1;
      plan_name := 'Plano Essencial';
    WHEN 'ZMTP2IV' THEN
      plan_level := 2;
      plan_name := 'Plano Evoluir';
    WHEN 'VBAQ4J3' THEN
      plan_level := 3;
      plan_name := 'Plano Prime';
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Offer code inválido: ' || offer_code
      );
  END CASE;

  -- Verificar se usuário existe
  SELECT * INTO existing_user FROM public.users WHERE email = user_email;

  IF existing_user IS NULL THEN
    -- Criar novo usuário
    INSERT INTO public.users (
      email,
      plano_ativo,
      data_ativacao,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      user_email,
      plan_level,
      NOW(),
      false,
      NOW(),
      NOW()
    );
  ELSE
    -- Atualizar usuário existente
    UPDATE public.users
    SET
      plano_ativo = plan_level,
      data_ativacao = NOW(),
      updated_at = NOW()
    WHERE email = user_email;
  END IF;

  -- Salvar transação para auditoria
  INSERT INTO public.amplopay_transactions (
    transaction_id,
    user_email,
    offer_code,
    plan_level,
    plan_name,
    amount,
    currency,
    payment_method,
    status,
    webhook_data,
    processed_at,
    created_at
  ) VALUES (
    transaction_id,
    user_email,
    offer_code,
    plan_level,
    plan_name,
    COALESCE((webhook_data->'transaction'->>'amount')::DECIMAL, 0),
    COALESCE(webhook_data->'transaction'->>'currency', 'BRL'),
    COALESCE(webhook_data->'transaction'->>'paymentMethod', 'UNKNOWN'),
    COALESCE(webhook_data->'transaction'->>'status', 'PENDING'),
    webhook_data,
    NOW(),
    NOW()
  );

  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Webhook processado com sucesso',
    'user_email', user_email,
    'plan', plan_name,
    'plan_level', plan_level,
    'transaction_id', transaction_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ============================================
-- PASSO 6: CRIAR FUNÇÃO PARA SIMULADOR DE PAGAMENTO
-- ============================================

CREATE OR REPLACE FUNCTION public.simulate_amplopay_payment(
  user_email TEXT,
  offer_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_level INTEGER;
  plan_name TEXT;
  transaction_id TEXT;
  existing_user RECORD;
BEGIN
  -- Determinar plano
  CASE offer_code
    WHEN 'LIGRMS3' THEN
      plan_level := 1;
      plan_name := 'Plano Essencial';
    WHEN 'ZMTP2IV' THEN
      plan_level := 2;
      plan_name := 'Plano Evoluir';
    WHEN 'VBAQ4J3' THEN
      plan_level := 3;
      plan_name := 'Plano Prime';
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Offer code inválido');
  END CASE;

  -- Gerar ID da transação
  transaction_id := 'sim_trans_' || extract(epoch from now())::text;

  -- Verificar se usuário existe
  SELECT * INTO existing_user FROM public.users WHERE email = user_email;

  IF existing_user IS NULL THEN
    -- Criar novo usuário
    INSERT INTO public.users (
      email,
      plano_ativo,
      data_ativacao,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      user_email,
      plan_level,
      NOW(),
      false,
      NOW(),
      NOW()
    );
  ELSE
    -- Atualizar usuário existente
    UPDATE public.users
    SET plano_ativo = plan_level, data_ativacao = NOW(), updated_at = NOW()
    WHERE email = user_email;
  END IF;

  -- Salvar transação
  INSERT INTO public.amplopay_transactions (
    transaction_id,
    user_email,
    offer_code,
    plan_level,
    plan_name,
    amount,
    currency,
    payment_method,
    status,
    processed_at,
    created_at
  ) VALUES (
    transaction_id,
    user_email,
    offer_code,
    plan_level,
    plan_name,
    CASE plan_level WHEN 1 THEN 100 WHEN 2 THEN 200 WHEN 3 THEN 300 ELSE 100 END,
    'BRL',
    'CREDIT_CARD',
    'COMPLETED',
    NOW(),
    NOW()
  );

  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pagamento simulado com sucesso',
    'user_email', user_email,
    'plan', plan_name,
    'plan_level', plan_level,
    'transaction_id', transaction_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ============================================
-- PASSO 7: CONCEDER PERMISSÕES
-- ============================================

-- Permitir uso das funções por service role
GRANT EXECUTE ON FUNCTION public.process_amplopay_webhook(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.simulate_amplopay_payment(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.simulate_amplopay_payment(TEXT, TEXT) TO anon;

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================

-- Para testar, execute:
-- SELECT public.simulate_amplopay_payment('teste@edukaprime.com', 'LIGRMS3');
-- SELECT * FROM public.users WHERE email = 'teste@edukaprime.com';
-- SELECT * FROM public.amplopay_transactions WHERE user_email = 'teste@edukaprime.com';