-- ===============================================
-- PROMOVER joia@gmail.com PARA ADMINISTRADOR
-- ===============================================

-- Atualizar o usuário para ser administrador
UPDATE public.users
SET is_admin = true
WHERE email = 'joia@gmail.com';

-- Verificar se a atualização foi bem-sucedida
SELECT id, email, is_admin
FROM public.users
WHERE email = 'joia@gmail.com';

-- ===============================================
-- Se houver necessidade de reverter, execute:
-- UPDATE public.users
-- SET is_admin = false
-- WHERE email = 'joia@gmail.com';
-- ===============================================
