import { supabase } from './src/lib/supabase';

async function testRLSStatus() {
  console.log('🔍 Testando status de RLS...\n');

  try {
    // Teste 1: Tentar ler todos os usuários
    console.log('📋 Teste 1: SELECT * FROM users');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, nome, is_admin, avatar_url')
      .limit(5);

    if (usersError) {
      console.error('❌ Erro ao ler users:', usersError.message);
      console.error('   POSSÍVEL CAUSA: RLS ainda está habilitado');
    } else {
      console.log('✅ Sucesso! Leu', allUsers?.length || 0, 'usuários');
      console.log('   RLS provavelmente está DESABILITADO');
    }

    // Teste 2: Tentar ler perfil de um usuário específico
    console.log('\n📋 Teste 2: SELECT * FROM users WHERE id = específico');
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Erro ao ler seu perfil:', profileError.message);
        console.error('   User ID:', user.id);
        console.error('   Email:', user.email);
      } else {
        console.log('✅ Perfil encontrado!');
        console.log('   ID:', profile?.id);
        console.log('   Email:', profile?.email);
        console.log('   Nome:', profile?.nome);
        console.log('   Is Admin:', profile?.is_admin);
        console.log('   Avatar URL:', profile?.avatar_url);
      }
    }

    // Teste 3: Verificar RLS status no banco
    console.log('\n📋 Teste 3: Verificar RLS status no banco');
    const { data: rls_status, error: rls_error } = await supabase
      .rpc('get_rls_status');

    if (rls_error) {
      console.log('ℹ️  RPC get_rls_status não existe (normal)');
      console.log('   Será necessário verificar manualmente no Supabase dashboard');
    } else {
      console.log('✅ RLS Status:', rls_status);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se for importado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testRLSStatus();
}

export { testRLSStatus };
