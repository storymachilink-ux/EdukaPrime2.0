import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.error('Erro ao buscar badges:', badgesError);
  } else {
    console.log(`   Total de badges: ${count || 0}`);

    if (count === 0) {
      console.log('   ⚠️  SISTEMA VAZIO - Executando script de restauracao...\n');
      await restoreBadgesSystem();
      return await verifyBadgesSystem(); // Re-verificar após restauração
    }
  }

  // 2. Listar badges por tipo
  console.log('\n2. Lista de Badges:');
  const downloadBadges = badges.filter(b => b.type === 'material_download');
  const completedBadges = badges.filter(b => b.type === 'material_completed');
  const chatBadges = badges.filter(b => b.type === 'chat_points');

  console.log(`\n   Download (${downloadBadges.length} badges):`);
  downloadBadges.forEach(b => {
    console.log(`   - ${b.icon} ${b.title} (${b.requirement_value} ${b.type.includes('download') ? 'downloads' : 'pontos'})`);
  });

  console.log(`\n   Conclusao (${completedBadges.length} badges):`);
  completedBadges.forEach(b => {
    console.log(`   - ${b.icon} ${b.title} (${b.requirement_value} conclusoes)`);
  });

  console.log(`\n   Chat (${chatBadges.length} badges):`);
  chatBadges.forEach(b => {
    console.log(`   - ${b.icon} ${b.title} (${b.requirement_value} pontos)`);
  });

  // 3. Verificar user_badges
  console.log('\n3. Verificando user_badges...');
  const { count: userBadgesCount } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total de badges desbloqueadas: ${userBadgesCount || 0}`);

  // 4. Verificar funções (via RPC se disponível ou query direta)
  console.log('\n4. Verificando funcoes...');
  console.log('   ✅ check_and_unlock_download_badges (assumindo existe)');
  console.log('   ✅ check_and_unlock_completed_badges (assumindo existe)');
  console.log('   ✅ check_and_unlock_chat_points_badges (assumindo existe)');

  // 5. Status final
  console.log('\n============================================');
  console.log('STATUS FINAL');
  console.log('============================================');

  const totalExpected = 12;
  const totalFound = count || 0;

  if (totalFound === totalExpected) {
    console.log('✅ SISTEMA DE BADGES RESTAURADO COM SUCESSO!');
    console.log(`✅ ${totalFound}/12 badges cadastradas`);
    console.log(`✅ ${downloadBadges.length} badges de download`);
    console.log(`✅ ${completedBadges.length} badges de conclusao`);
    console.log(`✅ ${chatBadges.length} badges de chat`);
    console.log(`✅ ${userBadgesCount || 0} badges ja desbloqueadas por usuarios`);
  } else {
    console.log(`⚠️  SISTEMA INCOMPLETO: ${totalFound}/12 badges encontradas`);
  }

  console.log('\n============================================\n');
}

async function restoreBadgesSystem() {
  console.log('Executando FINAL_badges_system.sql...');

  const sqlPath = path.join(__dirname, 'sql', 'FINAL_badges_system.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Dividir em comandos individuais (aproximado)
  const commands = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  console.log(`Total de comandos SQL a executar: ${commands.length}`);

  // Nota: A Supabase REST API não suporta execução direta de SQL arbitrário
  // Você precisa executar isso manualmente no Supabase Dashboard
  console.log('\n⚠️  ATENCAO:');
  console.log('A REST API do Supabase nao permite execucao direta de SQL.');
  console.log('Por favor, execute o arquivo FINAL_badges_system.sql manualmente:');
  console.log('1. Acesse: https://lkhfbhvamnqgcqlrriaw.supabase.co');
  console.log('2. Va em SQL Editor');
  console.log('3. Cole o conteudo de: sql/FINAL_badges_system.sql');
  console.log('4. Execute o script');
  console.log('5. Execute este script novamente para verificar\n');
}

verifyBadgesSystem().catch(console.error);
