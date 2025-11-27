-- ========================================
-- SETUP AUTOMÁTICO COMPLETO - EDUKAPRIME
-- Execute este SQL no Supabase Dashboard
-- ========================================

-- 1. Criar tabela de transações se não existir
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

-- 2. Adicionar colunas na tabela users se não existirem
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

-- 3. Criar função para processar webhook
CREATE OR REPLACE FUNCTION public.process_amplopay_webhook(
  webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_data JSONB;
  client_data JSONB;
  plan_info RECORD;
  user_record RECORD;
  result JSONB;
BEGIN
  -- Extrair dados do webhook
  transaction_data := webhook_data->'transaction';
  client_data := webhook_data->'client';

  -- Log início
  RAISE NOTICE '🚀 Processando webhook para: %', client_data->>'email';

  -- Validar token
  IF webhook_data->>'token' != '21s2yh9n' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Token inválido'
    );
  END IF;

  -- Validar dados obrigatórios
  IF client_data->>'email' IS NULL OR
     transaction_data->>'id' IS NULL OR
     webhook_data->>'offerCode' IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Dados obrigatórios ausentes'
    );
  END IF;

  -- Verificar se é pagamento aprovado
  IF webhook_data->>'event' != 'TRANSACTION_PAID' OR
     transaction_data->>'status' != 'COMPLETED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Não é pagamento aprovado'
    );
  END IF;

  -- Determinar plano baseado no offer code
  SELECT * INTO plan_info FROM (
    VALUES
      ('LIGRMS3', 1, 'Plano Essencial'),
      ('ZMTP2IV', 2, 'Plano Evoluir'),
      ('VBAQ4J3', 3, 'Plano Prime')
  ) AS plans(offer_code, level, name)
  WHERE offer_code = webhook_data->>'offerCode';

  IF plan_info IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Offer code inválido'
    );
  END IF;

  -- Verificar se transação já foi processada
  IF EXISTS (
    SELECT 1 FROM public.amplopay_transactions
    WHERE transaction_id = transaction_data->>'id'
  ) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Transação já processada anteriormente'
    );
  END IF;

  -- Buscar ou criar usuário
  SELECT * INTO user_record
  FROM public.users
  WHERE email = client_data->>'email';

  IF user_record IS NULL THEN
    -- Criar novo usuário
    INSERT INTO public.users (
      email,
      plano_ativo,
      data_ativacao,
      is_admin,
      created_at
    ) VALUES (
      client_data->>'email',
      plan_info.level,
      NOW(),
      false,
      NOW()
    ) RETURNING * INTO user_record;

    RAISE NOTICE '👤 Usuário criado: %', client_data->>'email';
  ELSE
    -- Atualizar usuário existente
    UPDATE public.users
    SET
      plano_ativo = plan_info.level,
      data_ativacao = NOW()
    WHERE email = client_data->>'email';

    RAISE NOTICE '🔄 Usuário atualizado: %', client_data->>'email';
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
    webhook_data,
    processed_at
  ) VALUES (
    transaction_data->>'id',
    client_data->>'email',
    webhook_data->>'offerCode',
    plan_info.level,
    plan_info.name,
    (transaction_data->>'amount')::DECIMAL,
    transaction_data->>'currency',
    transaction_data->>'paymentMethod',
    transaction_data->>'status',
    webhook_data,
    NOW()
  );

  RAISE NOTICE '✅ Transação salva: %', transaction_data->>'id';

  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Webhook processado com sucesso',
    'user_email', client_data->>'email',
    'plan', plan_info.name,
    'plan_level', plan_info.level,
    'transaction_id', transaction_data->>'id'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erro: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. Criar endpoint HTTP via PostgREST
CREATE OR REPLACE FUNCTION public.amplopay_webhook_endpoint()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_data JSONB;
  result JSONB;
BEGIN
  -- Em produção, os dados virão via REST API
  -- Por enquanto, esta função pode ser chamada diretamente
  RAISE NOTICE '📡 Endpoint webhook chamado';

  RETURN jsonb_build_object(
    'status', 'ready',
    'message', 'Webhook endpoint configurado',
    'url', 'Use a função process_amplopay_webhook diretamente'
  );
END;
$$;

-- 5. Criar política RLS para transações
ALTER TABLE public.amplopay_transactions ENABLE ROW LEVEL SECURITY;

-- Policy para admins
CREATE POLICY "Admins podem ver todas as transações"
ON public.amplopay_transactions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.email = auth.email() AND users.is_admin = true
  )
);

-- Policy para usuários verem suas transações
CREATE POLICY "Usuários podem ver suas transações"
ON public.amplopay_transactions FOR SELECT
TO authenticated
USING (user_email = auth.email());

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_email ON public.amplopay_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_amplopay_transactions_transaction_id ON public.amplopay_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plano_ativo ON public.users(plano_ativo);

-- 7. Função de teste para o simulador
CREATE OR REPLACE FUNCTION public.simulate_amplopay_payment(
  user_email TEXT,
  offer_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mock_webhook JSONB;
  result JSONB;
BEGIN
  -- Criar dados mock do webhook
  mock_webhook := jsonb_build_object(
    'event', 'TRANSACTION_PAID',
    'token', '21s2yh9n',
    'offerCode', offer_code,
    'client', jsonb_build_object(
      'id', 'sim_' || extract(epoch from now()),
      'name', split_part(user_email, '@', 1),
      'email', user_email,
      'phone', '(11) 99999-9999'
    ),
    'transaction', jsonb_build_object(
      'id', 'sim_trans_' || extract(epoch from now()),
      'identifier', 'sim-identifier',
      'paymentMethod', 'CREDIT_CARD',
      'status', 'COMPLETED',
      'amount', CASE
        WHEN offer_code = 'LIGRMS3' THEN 100
        WHEN offer_code = 'ZMTP2IV' THEN 200
        WHEN offer_code = 'VBAQ4J3' THEN 300
        ELSE 100
      END,
      'currency', 'BRL',
      'createdAt', now(),
      'payedAt', now()
    )
  );

  -- Processar webhook
  SELECT public.process_amplopay_webhook(mock_webhook) INTO result;

  RETURN result;
END;
$$;

-- ========================================
-- PRONTO! EXECUTE ESTE SQL NO SUPABASE
-- ========================================

-- Para testar, execute:
-- SELECT public.simulate_amplopay_payment('teste@exemplo.com', 'LIGRMS3');

RAISE NOTICE '🎉 Setup concluído! Todas as funções e tabelas foram criadas.';
RAISE NOTICE '📡 Para testar: SELECT public.simulate_amplopay_payment(''teste@exemplo.com'', ''LIGRMS3'');';
RAISE NOTICE '🔍 Para ver transações: SELECT * FROM amplopay_transactions;';