import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vijlwgrgaliptkbghfdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamx3Z3JnYWxpcHRrYmdoZmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTU4NDMsImV4cCI6MjA3Mzk3MTg0M30.jZsuDaJP33Q6FhujeRYVy-NJL1b14ndVK0hg6MvmkDw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateAdminUser() {
  console.log('👤 Atualizando storymachilink@gmail.com como admin...')

  console.log('📝 Execute este SQL no Supabase Dashboard:')
  console.log(`
UPDATE public.users
SET
  is_admin = true,
  plano_ativo = 3,
  data_ativacao = NOW()
WHERE email = 'storymachilink@gmail.com';

-- Se o usuário não existir na tabela users, insira manualmente:
-- INSERT INTO public.users (id, email, is_admin, plano_ativo, data_ativacao, created_at)
-- SELECT id, email, true, 3, NOW(), NOW()
-- FROM auth.users
-- WHERE email = 'storymachilink@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET
--   is_admin = true,
--   plano_ativo = 3,
--   data_ativacao = NOW();
  `)
}

updateAdminUser()