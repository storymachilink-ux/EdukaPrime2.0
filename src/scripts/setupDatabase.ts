import { supabase } from '../lib/supabase'

export async function checkUserTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela users...')

    // Verificar se a tabela users existe e suas colunas
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao verificar tabela users:', error)
      return false
    }

    console.log('✅ Tabela users encontrada!')
    console.log('📊 Estrutura atual:', data)
    return true

  } catch (error) {
    console.error('❌ Erro na verificação:', error)
    return false
  }
}

export async function setupUserTable() {
  try {
    console.log('🔧 Configurando tabela users...')

    // SQL para adicionar colunas se não existirem
    const alterTableSQL = `
      -- Adicionar colunas se não existirem
      DO $$
      BEGIN
        -- Adicionar coluna plano_ativo (padrão 0 = demo/gratuito)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'users' AND column_name = 'plano_ativo') THEN
          ALTER TABLE users ADD COLUMN plano_ativo INTEGER DEFAULT 0;
        END IF;

        -- Adicionar coluna data_ativacao
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'users' AND column_name = 'data_ativacao') THEN
          ALTER TABLE users ADD COLUMN data_ativacao TIMESTAMPTZ;
        END IF;

        -- Adicionar coluna is_admin (padrão false)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'users' AND column_name = 'is_admin') THEN
          ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
        END IF;

        -- Adicionar coluna plano_teste (para admin simular planos)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'users' AND column_name = 'plano_teste') THEN
          ALTER TABLE users ADD COLUMN plano_teste INTEGER;
        END IF;
      END $$;
    `

    const { error } = await supabase.rpc('execute_sql', { sql: alterTableSQL })

    if (error) {
      console.error('❌ Erro ao alterar tabela:', error)
      return false
    }

    console.log('✅ Tabela users configurada com sucesso!')
    return true

  } catch (error) {
    console.error('❌ Erro na configuração:', error)
    return false
  }
}

export async function createAdminUser() {
  try {
    console.log('👤 Criando usuário admin...')

    // Verificar se admin já existe
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@edukaprime.com')
      .single()

    if (existingAdmin) {
      console.log('✅ Usuário admin já existe!')

      // Atualizar para garantir privilégios admin
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_admin: true,
          plano_ativo: 3,
          data_ativacao: new Date().toISOString()
        })
        .eq('email', 'admin@edukaprime.com')

      if (updateError) {
        console.error('❌ Erro ao atualizar admin:', updateError)
        return false
      }

      console.log('✅ Privilégios admin atualizados!')
      return true
    }

    // Criar usuário admin via Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@edukaprime.com',
      password: 'admin001',
      options: {
        data: {
          is_admin: true,
          plano_ativo: 3
        }
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar auth admin:', authError)
      return false
    }

    console.log('✅ Usuário admin criado!')
    console.log('📧 Verifique o email para confirmar a conta')
    return true

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error)
    return false
  }
}

// Função principal para configurar tudo
export async function setupDatabase() {
  console.log('🚀 Iniciando configuração do database...')

  const tableCheck = await checkUserTableStructure()
  if (!tableCheck) return false

  const tableSetup = await setupUserTable()
  if (!tableSetup) return false

  const adminSetup = await createAdminUser()
  if (!adminSetup) return false

  console.log('🎉 Database configurado com sucesso!')
  return true
}