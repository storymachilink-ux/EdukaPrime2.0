-- PASSO 3: TESTAR A FUNÇÃO
-- Cole isso no Supabase Dashboard > SQL Editor > New Query

-- Testar pagamento
SELECT public.simulate_amplopay_payment('teste@edukaprime.com', 'LIGRMS3');

-- Ver se funcionou
SELECT * FROM public.users WHERE email = 'teste@edukaprime.com';

-- Ver transação
SELECT * FROM public.amplopay_transactions WHERE user_email = 'teste@edukaprime.com';