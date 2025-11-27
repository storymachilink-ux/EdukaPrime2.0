-- PASSO 2: CRIAR FUNÇÃO PARA SIMULADOR
-- Cole isso no Supabase Dashboard > SQL Editor > New Query

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
      created_at
    ) VALUES (
      user_email,
      plan_level,
      NOW(),
      false,
      NOW()
    );
  ELSE
    -- Atualizar usuário existente
    UPDATE public.users
    SET plano_ativo = plan_level, data_ativacao = NOW()
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
    processed_at
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