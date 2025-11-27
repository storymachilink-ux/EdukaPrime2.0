import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkhfbhvamnqgcqlrriaw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI0Mzg1NywiZXhwIjoyMDc0ODE5ODU3fQ.0YQPjAfszS2N8bafEGIIh_0RYWdkmmGbK2Qwh7H074o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findOldBadges() {
  console.log('='.repeat(80));
  console.log('INVESTIGAÇÃO: BADGES ANTIGOS vs NOVOS');
  console.log('='.repeat(80));

  // 1. Verificar os badges antigos que NÃO estão na tabela 'badges'
  console.log('\n## BADGES REFERENCIADOS EM USER_BADGES (mas podem não estar em BADGES)\n');

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id');

  const uniqueBadgeIds = [...new Set(userBadges.map(ub => ub.badge_id))];

  console.log(`Total de badge_ids únicos em user_badges: ${uniqueBadgeIds.length}\n`);

  for (const badgeId of uniqueBadgeIds) {
    // Verificar se existe na tabela badges
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (badge) {
      console.log(`✅ ${badgeId} -> EXISTE na tabela badges`);
      console.log(`   Título: ${badge.title}`);
    } else {
      console.log(`❌ ${badgeId} -> NÃO EXISTE na tabela badges (BADGE ANTIGO!)`);

      // Ver quantos usuários têm esse badge
      const { count } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('badge_id', badgeId);

      console.log(`   Usuários com este badge: ${count}`);
    }
  }

  // 2. Investigar possíveis outras tabelas de badges
  console.log('\n' + '='.repeat(80));
  console.log('## PROCURANDO OUTRAS TABELAS DE BADGES\n');

  const possibleTables = [
    'badges_old',
    'old_badges',
    'badges_backup',
    'first_time_badges',
    'first_access_badges',
    'legacy_badges',
    'initial_badges'
  ];

  for (const tableName of possibleTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ Tabela encontrada: ${tableName} (${count} registros)`);

        const { data } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);

        if (data && data.length > 0) {
          console.log('   Dados:');
          data.forEach(item => {
            console.log(`   - ${JSON.stringify(item)}`);
          });
        }
      }
    } catch (err) {
      // Não fazer nada, tabela não existe
    }
  }

  // 3. Verificar se existe alguma configuração de badges em tabelas de configuração
  console.log('\n' + '='.repeat(80));
  console.log('## PROCURANDO TABELAS DE CONFIGURAÇÃO\n');

  const configTables = [
    'config',
    'configurations',
    'settings',
    'app_settings',
    'system_config'
  ];

  for (const tableName of configTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);

      if (!error && data) {
        console.log(`✅ Tabela encontrada: ${tableName} (${data.length} registros)`);
        data.forEach(item => {
          console.log(`   ${JSON.stringify(item)}`);
        });
      }
    } catch (err) {
      // Não fazer nada
    }
  }

  // 4. Analisar os badge_ids que não existem mais
  console.log('\n' + '='.repeat(80));
  console.log('## ANÁLISE: O QUE SÃO "first_download" e "first_video"?\n');

  console.log('Esses badges NÃO estão na tabela "badges" atual.');
  console.log('Mas estão referenciados em "user_badges".\n');

  console.log('HIPÓTESE: Eram badges de primeiro acesso que foram:');
  console.log('  1. Removidos da tabela badges');
  console.log('  2. Substituídos pelo novo sistema de achievements/gamification');
  console.log('  3. Mas os registros antigos ainda existem em user_badges\n');

  // Verificar user_progress para entender o sistema de tracking
  console.log('='.repeat(80));
  console.log('## SISTEMA DE TRACKING (user_progress)\n');

  const { data: progressSample } = await supabase
    .from('user_progress')
    .select('*')
    .eq('status', 'completed')
    .limit(10);

  console.log('Exemplos de progresso completado:');
  progressSample.forEach(p => {
    console.log(`  - ${p.resource_type}: ${p.resource_title}`);
    console.log(`    User: ${p.user_id.substring(0, 8)}...`);
    console.log(`    Completado em: ${p.completed_at}`);
  });
}

findOldBadges()
  .then(() => {
    console.log('\n' + '='.repeat(80));
    console.log('✅ INVESTIGAÇÃO COMPLETA');
    console.log('='.repeat(80));
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ ERRO:', err);
    process.exit(1);
  });
