import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkhfbhvamnqgcqlrriaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDM4NTcsImV4cCI6MjA3NDgxOTg1N30.LpFCAgjgkNekAkXMx73e6eUppFYLC4n1BXziRzMp7xA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBadgesSystem() {
  console.log('\n============================================');
  console.log('VERIFICACAO DO SISTEMA DE BADGES');
  console.log('============================================\n');

  // 1. Verificar quantidade de badges
  console.log('1. Verificando badges cadastradas...');
  const { data: badges, error: badgesError, count } = await supabase
    .from('badges')
    .select('*', { count: 'exact' });

  if (badgesError) {
    console.error('   ❌ Erro ao buscar badges:', badgesError);
  } else {
    console.log(`   Total de badges: ${count || 0} / 12 esperadas`);
  }

  // 2. Se badges existem, listar
  if (badges && badges.length > 0) {
    console.log('\n2. Lista de Badges:');
    const downloadBadges = badges.filter(b => b.type === 'material_download').sort((a, b) => a.requirement_value - b.requirement_value);
    const completedBadges = badges.filter(b => b.type === 'material_completed').sort((a, b) => a.requirement_value - b.requirement_value);
    const chatBadges = badges.filter(b => b.type === 'chat_points').sort((a, b) => a.requirement_value - b.requirement_value);

    if (downloadBadges.length > 0) {
      console.log(`\n   Download (${downloadBadges.length} badges):`);
      downloadBadges.forEach(b => {
        console.log(`   - ${b.icon} ${b.title} - Requer ${b.requirement_value} downloads`);
      });
    }

    if (completedBadges.length > 0) {
      console.log(`\n   Conclusao (${completedBadges.length} badges):`);
      completedBadges.forEach(b => {
        console.log(`   - ${b.icon} ${b.title} - Requer ${b.requirement_value} conclusoes`);
      });
    }

    if (chatBadges.length > 0) {
      console.log(`\n   Chat (${chatBadges.length} badges):`);
      chatBadges.forEach(b => {
        console.log(`   - ${b.icon} ${b.title} - Requer ${b.requirement_value} pontos`);
      });
    }
  }

  // 3. Verificar user_badges
  console.log('\n3. Verificando user_badges...');
  const { count: userBadgesCount, error: ubError } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true });

  if (ubError) {
    console.error('   ❌ Erro ao contar user_badges:', ubError);
  } else {
    console.log(`   Total de badges desbloqueadas: ${userBadgesCount || 0}`);
  }

  // 4. Status final
  console.log('\n============================================');
  console.log('STATUS FINAL');
  console.log('============================================');

  const totalExpected = 12;
  const totalFound = count || 0;

  if (totalFound === 0) {
    console.log('❌ SISTEMA DE BADGES NAO RESTAURADO');
    console.log('❌ 0/12 badges cadastradas');
    console.log('\n⚠️  ACAO NECESSARIA:');
    console.log('1. Acesse: https://lkhfbhvamnqgcqlrriaw.supabase.co');
    console.log('2. Va em SQL Editor');
    console.log('3. Cole o conteudo de: sql/FINAL_badges_system.sql');
    console.log('4. Execute o script');
  } else if (totalFound === totalExpected) {
    console.log('✅ SISTEMA DE BADGES RESTAURADO COM SUCESSO!');
    console.log(`✅ ${totalFound}/12 badges cadastradas`);
    const downloadCount = badges.filter(b => b.type === 'material_download').length;
    const completedCount = badges.filter(b => b.type === 'material_completed').length;
    const chatCount = badges.filter(b => b.type === 'chat_points').length;
    console.log(`✅ ${downloadCount} badges de download`);
    console.log(`✅ ${completedCount} badges de conclusao`);
    console.log(`✅ ${chatCount} badges de chat`);
    console.log(`✅ ${userBadgesCount || 0} badges ja desbloqueadas por usuarios`);
  } else {
    console.log(`⚠️  SISTEMA INCOMPLETO: ${totalFound}/12 badges encontradas`);
  }

  console.log('\n============================================\n');
}

verifyBadgesSystem().catch(console.error);
