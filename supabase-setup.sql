-- ===============================================
-- EDUKAPRIME - Configuração do Supabase
-- ===============================================
-- Este arquivo configura automaticamente a criação de usuários
-- na tabela 'users' quando alguém se cadastra via Supabase Auth
--
-- COMO EXECUTAR:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Abra seu projeto: vijlwgrgaliptkbghfdg
-- 3. Menu lateral: SQL Editor
-- 4. Clique em: "+ New query"
-- 5. Cole TODO este código
-- 6. Clique em: "Run" (botão verde no canto inferior direito)
-- ===============================================

-- ===============================================
-- PARTE 1: Criar função que adiciona usuário
-- ===============================================
-- Esta função será executada automaticamente quando
-- alguém se cadastrar via Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir novo usuário na tabela 'users'
  INSERT INTO public.users (
    id,              -- Mesmo ID do auth.users
    email,           -- Email do cadastro
    plano_ativo,     -- Plano gratuito (0) por padrão
    is_admin,        -- Não é admin por padrão
    created_at       -- Data de criação
  )
  VALUES (
    NEW.id,
    NEW.email,
    0,               -- Plano 0 = Gratuito
    false,           -- is_admin = false
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Se já existir, não faz nada

  RETURN NEW;
END;
$$;

-- ===============================================
-- PARTE 2: Criar trigger que dispara a função
-- ===============================================
-- Este trigger "observa" a tabela auth.users
-- Sempre que um novo usuário for criado, ele
-- dispara automaticamente a função acima

-- Primeiro, remover trigger se já existir (para evitar duplicatas)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===============================================
-- PARTE 3: Verificar se funcionou
-- ===============================================
-- Execute esta query para verificar se o trigger foi criado:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- Deve retornar 1 linha com informações do trigger
-- ===============================================

-- ===============================================
-- OPCIONAL: Criar usuário admin manualmente
-- ===============================================
-- Se você quiser tornar algum usuário existente em admin,
-- execute esta query (DESCOMENTE e substitua o email):
--
-- UPDATE public.users
-- SET is_admin = true
-- WHERE email = 'seuemail@exemplo.com';
-- ===============================================

-- ===============================================
-- TESTE DO SISTEMA
-- ===============================================
-- Para testar se está funcionando:
-- 1. Crie uma nova conta no sistema (cadastro)
-- 2. Execute esta query:
--    SELECT id, email, plano_ativo, is_admin, created_at
--    FROM public.users
--    ORDER BY created_at DESC
--    LIMIT 5;
-- 3. O novo usuário deve aparecer automaticamente com plano_ativo = 0
-- ===============================================

-- FIM DO SCRIPT
-- Se tudo correu bem, você verá a mensagem:
-- "Success. No rows returned"