import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vijlwgrgaliptkbghfdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamx3Z3JnYWxpcHRrYmdoZmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTU4NDMsImV4cCI6MjA3Mzk3MTg0M30.jZsuDaJP33Q6FhujeRYVy-NJL1b14ndVK0hg6MvmkDw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUsersTable() {
  console.log('🔧 Criando tabela users...')

  try {
    // SQL para criar a tabela users
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        plano_ativo INTEGER DEFAULT 0,
        data_ativacao TIMESTAMPTZ,
        is_admin BOOLEAN DEFAULT false,
        plano_teste INTEGER
      );

      -- Habilitar RLS (Row Level Security)
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      -- Criar política para que usuários vejam apenas seus próprios dados
      CREATE POLICY "Usuários podem ver próprios dados" ON public.users
        FOR SELECT USING (auth.uid() = id);

      -- Criar política para que usuários possam atualizar próprios dados
      CREATE POLICY "Usuários podem atualizar próprios dados" ON public.users
        FOR UPDATE USING (auth.uid() = id);

      -- Criar política para inserção (signup)
      CREATE POLICY "Usuários podem inserir próprios dados" ON public.users
        FOR INSERT WITH CHECK (auth.uid() = id);

      -- Criar função trigger para criar registro na tabela users após signup
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.users (id, email, plano_ativo, is_admin)
        VALUES (new.id, new.email, 0, false);
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Criar trigger para executar a função após inserção na auth.users
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `

    // Executar o SQL usando uma função RPC personalizada (se disponível)
    // Como não temos RPC personalizada, vamos criar usando auth admin
    console.log('📝 SQL para executar no Supabase Dashboard:')
    console.log(createTableSQL)

    console.log('\n🔧 Execute este SQL no Supabase Dashboard > SQL Editor')
    console.log('📍 Acesse: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql')

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

createUsersTable()