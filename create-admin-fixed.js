import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vijlwgrgaliptkbghfdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamx3Z3JnYWxpcHRrYmdoZmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTU4NDMsImV4cCI6MjA3Mzk3MTg0M30.jZsuDaJP33Q6FhujeRYVy-NJL1b14ndVK0hg6MvmkDw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdminUser() {
  console.log('👤 Criando usuário admin...')

  try {
    // Vamos usar um email temporário válido primeiro
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin.edukaprime@gmail.com',
      password: 'admin001'
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  Usuário admin já existe!')
      } else {
        console.error('❌ Erro ao criar usuário admin:', authError.message)
      }
      return
    }

    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Confirme o email admin.edukaprime@gmail.com')
    console.log('🔑 Depois execute este SQL para dar privilégios:')
    console.log(`
UPDATE public.users
SET
  is_admin = true,
  plano_ativo = 3,
  data_ativacao = NOW()
WHERE email = 'admin.edukaprime@gmail.com';
    `)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

createAdminUser()