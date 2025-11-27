console.log('🔧 SQL para corrigir admin e logout:')
console.log(`
-- 1. GARANTIR QUE storymachilink@gmail.com SEJA ADMIN:
INSERT INTO public.users (id, email, is_admin, plano_ativo, data_ativacao, created_at)
SELECT id, email, true, 3, NOW(), NOW()
FROM auth.users
WHERE email = 'storymachilink@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  plano_ativo = 3,
  data_ativacao = NOW();

-- 2. VERIFICAR SE FUNCIONOU:
SELECT * FROM public.users WHERE email = 'storymachilink@gmail.com';
`)

console.log('\n📍 Execute no Supabase Dashboard: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql')