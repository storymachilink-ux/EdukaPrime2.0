console.log('SQL para criar admin com Plano 5:')
console.log(`
-- DEFINIR storymachilink@gmail.com COMO ADMIN (PLANO 5):

INSERT INTO public.users (id, email, plano_ativo, data_ativacao, created_at)
SELECT id, email, 5, NOW(), NOW()
FROM auth.users
WHERE email = 'storymachilink@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  plano_ativo = 5,
  data_ativacao = NOW();

-- VERIFICAR SE DEU CERTO:
SELECT
  u.email,
  pu.plano_ativo,
  pu.data_ativacao,
  (pu.plano_ativo >= 5) as is_admin
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email = 'storymachilink@gmail.com';
`)

console.log('Execute no Supabase: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql')