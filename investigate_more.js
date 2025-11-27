import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkhfbhvamnqgcqlrriaw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI0Mzg1NywiZXhwIjoyMDc0ODE5ODU3fQ.0YQPjAfszS2N8bafEGIIh_0RYWdkmmGbK2Qwh7H074o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateMore() {
  console.log('='.repeat(80));
  console.log('INVESTIGAÇÃO ADICIONAL - BADGES ANTIGOS');
  console.log('='.repeat(80));

  // 1. Verificar TODOS os badges (não apenas os 5 primeiros)
  console.log('\n## TODOS OS BADGES CADASTRADOS\n');
  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: true });

  if (!badgesError && allBadges) {
    console.log(`Total: ${allBadges.length} badges\n`);
    allBadges.forEach((badge, idx) => {
      console.log(`[${idx + 1}] ${badge.id}`);
      console.log(`    Título: ${badge.title}`);
      console.log(`    Tipo: ${badge.type}`);
      console.log(`    Requirement: ${badge.requirement_value}`);
      console.log(`    Icon: ${badge.icon}`);
      console.log('');
    });
  }

  // 2. Verificar user_badges com mais detalhes
  console.log('\n' + '='.repeat(80));
  console.log('## USER_BADGES - ANÁLISE COMPLETA\n');

  const { data: allUserBadges, error: userBadgesError } = await supabase
    .from('user_badges')
    .select('*')
    .order('earned_at', { ascending: true });

  if (!userBadgesError && allUserBadges) {
    console.log(`Total: ${allUserBadges.length} user_badges conquistados\n`);

    // Agrupar por badge_id
    const badgeCount = {};
    allUserBadges.forEach(ub => {
      if (!badgeCount[ub.badge_id]) {
        badgeCount[ub.badge_id] = 0;
      }
      badgeCount[ub.badge_id]++;
    });

    console.log('Distribuição de badges conquistados:');
    Object.entries(badgeCount).forEach(([badgeId, count]) => {
      console.log(`  ${badgeId}: ${count} usuários`);
    });

    console.log('\nPrimeiros 10 badges conquistados (ordem cronológica):');
    allUserBadges.slice(0, 10).forEach((ub, idx) => {
      console.log(`  [${idx + 1}] User: ${ub.user_id.substring(0, 8)}... | Badge: ${ub.badge_id} | Data: ${ub.earned_at}`);
    });
  }

  // 3. Verificar tabelas de atividades/videos/bonus
  console.log('\n' + '='.repeat(80));
  console.log('## OUTRAS TABELAS IMPORTANTES\n');

  const otherTables = [
    'atividades',
    'videos',
    'bonus',
    'materiais',
    'downloads',
    'user_downloads',
    'user_activities',
    'user_videos',
    'progress_tracking',
    'user_stats',
    'statistics'
  ];

  for (const tableName of otherTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${tableName}: ${count || 0} registros`);

        // Pegar amostra de dados
        const { data } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (data && data.length > 0) {
          console.log(`   Colunas: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      // Tabela não existe
    }
  }

  // 4. Verificar achievements mais a fundo
  console.log('\n' + '='.repeat(80));
  console.log('## ACHIEVEMENTS - ANÁLISE COMPLETA\n');

  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: true });

  if (!achievementsError && allAchievements) {
    console.log(`Total: ${allAchievements.length} achievements\n`);
    allAchievements.forEach((ach, idx) => {
      console.log(`[${idx + 1}] ${ach.code}`);
      console.log(`    Título: ${ach.title}`);
      console.log(`    Tipo: ${ach.requirement_type}`);
      console.log(`    Requirement: ${ach.requirement_value}`);
      console.log(`    XP: ${ach.xp_reward}`);
      console.log(`    Icon: ${ach.icon}`);
      console.log('');
    });
  }

  // 5. Verificar levels
  console.log('\n' + '='.repeat(80));
  console.log('## LEVELS - SISTEMA DE NÍVEIS\n');

  const { data: allLevels, error: levelsError } = await supabase
    .from('levels')
    .select('*')
    .order('level_number', { ascending: true });

  if (!levelsError && allLevels) {
    console.log(`Total: ${allLevels.length} níveis\n`);
    allLevels.forEach((level) => {
      console.log(`Nível ${level.level_number}: ${level.level_name} ${level.icon}`);
      console.log(`  XP necessário: ${level.xp_required}`);
      console.log(`  Cor: ${level.color}`);
      console.log('');
    });
  }
}

investigateMore()
  .then(() => {
    console.log('\n' + '='.repeat(80));
    console.log('✅ INVESTIGAÇÃO ADICIONAL COMPLETA');
    console.log('='.repeat(80));
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ ERRO:', err);
    process.exit(1);
  });
