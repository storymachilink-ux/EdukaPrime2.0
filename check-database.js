import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vijlwgrgaliptkbghfdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamx3Z3JnYWxpcHRrYmdoZmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTU4NDMsImV4cCI6MjA3Mzk3MTg0M30.jZsuDaJP33Q6FhujeRYVy-NJL1b14ndVK0hg6MvmkDw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabase() {
  console.log('🔍 Verificando estrutura da tabela users...')

  try {
    // Verificar se a tabela users existe
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao acessar tabela users:', error.message)
      return
    }

    console.log('✅ Tabela users encontrada!')

    if (data && data.length > 0) {
      console.log('📊 Exemplo de registro atual:')
      console.log(JSON.stringify(data[0], null, 2))

      // Verificar quais colunas existem
      const columns = Object.keys(data[0])
      console.log('\n📋 Colunas existentes:', columns)

      // Verificar quais colunas precisamos adicionar
      const requiredColumns = ['plano_ativo', 'data_ativacao', 'is_admin', 'plano_teste']
      const missingColumns = requiredColumns.filter(col => !columns.includes(col))

      if (missingColumns.length > 0) {
        console.log('\n⚠️  Colunas que precisam ser adicionadas:', missingColumns)
      } else {
        console.log('\n✅ Todas as colunas necessárias já existem!')
      }
    } else {
      console.log('📋 Tabela users existe mas está vazia')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

checkDatabase()