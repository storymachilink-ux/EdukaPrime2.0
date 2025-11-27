console.log('🔧 SQL para criar admin MANUALMENTE:')
console.log(`
-- 1. VERIFICAR TODOS OS USUÁRIOS NA TABELA AUTH:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- 2. VERIFICAR USUÁRIOS NA TABELA PUBLIC:
SELECT * FROM public.users;

-- 3. INSERIR/ATUALIZAR storymachilink@gmail.com COMO ADMIN:
-- (Substitua o ID pelo ID real do usuário na auth.users)

-- Se você vir o ID do storymachilink@gmail.com na query 1, use este SQL:
-- INSERT INTO public.users (id, email, is_admin, plano_ativo, data_ativacao, created_at)
-- VALUES ('ID_DO_USUARIO_AQUI', 'storymachilink@gmail.com', true, 3, NOW(), NOW())
-- ON CONFLICT (id) DO UPDATE SET
--   is_admin = true,
--   plano_ativo = 3,
--   data_ativacao = NOW();

-- 4. VERIFICAR SE DEU CERTO:
SELECT
  u.id,
  u.email,
  pu.is_admin,
  pu.plano_ativo
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email = 'storymachilink@gmail.com';
`)

console.log('\n📍 Execute no Supabase: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql')