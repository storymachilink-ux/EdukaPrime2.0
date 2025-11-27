import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vijlwgrgaliptkbghfdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamx3Z3JnYWxpcHRrYmdoZmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTU4NDMsImV4cCI6MjA3Mzk3MTg0M30.jZsuDaJP33Q6FhujeRYVy-NJL1b14ndVK0hg6MvmkDw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdminUser() {
  console.log('👤 Criando usuário admin...')

  try {
    // Criar usuário admin via Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@edukaprime.com',
      password: 'admin001'
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  Usuário admin já existe! Atualizando privilégios...')

        // Se já existe, vamos atualizar manualmente na tabela users
        console.log('📝 Execute este SQL no Supabase para garantir privilégios admin:')
        console.log(`
UPDATE public.users
SET
  is_admin = true,
  plano_ativo = 3,
  data_ativacao = NOW()
WHERE email = 'admin@edukaprime.com';
        `)
        return
      }

      console.error('❌ Erro ao criar usuário admin:', authError.message)
      return
    }

    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Verifique o email admin@edukaprime.com para confirmar a conta')
    console.log('🔑 Depois da confirmação, execute este SQL para garantir privilégios:')
    console.log(`
UPDATE public.users
SET
  is_admin = true,
  plano_ativo = 3,
  data_ativacao = NOW()
WHERE email = 'admin@edukaprime.com';
    `)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

createAdminUser()