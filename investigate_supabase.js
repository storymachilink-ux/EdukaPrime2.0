import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkhfbhvamnqgcqlrriaw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI0Mzg1NywiZXhwIjoyMDc0ODE5ODU3fQ.0YQPjAfszS2N8bafEGIIh_0RYWdkmmGbK2Qwh7H074o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateDatabase() {
  console.log('='.repeat(80));
  console.log('INVESTIGAÇÃO DO BANCO DE DADOS SUPABASE');
  console.log('='.repeat(80));

  // 1. Listar todas as tabelas
  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
  });

  if (tablesError) {
    console.log('\n❌ Erro ao listar tabelas via RPC. Tentando abordagem alternativa...\n');

    // Tentar listar tabelas conhecidas
    const knownTables = [
      'badges',
      'user_badges',
      'achievements',
      'gamification',
      'user_gamification',
      'users',
      'levels',
      'conquistas',
      'user_achievements',
      'xp_history',
      'progress',
      'user_progress'
    ];

    console.log('## TABELAS ENCONTRADAS (testando tabelas conhecidas)\n');

    for (const tableName of knownTables) {
      try {
        // Tentar SELECT com LIMIT 0 para verificar se existe
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: false })
          .limit(0);

        if (!error) {
          console.log(`✅ Tabela existe: ${tableName} (${count || 0} registros)`);

          // Pegar detalhes da estrutura
          await investigateTable(tableName);
        }
      } catch (err) {
        // Tabela não existe
      }
    }
  } else {
    console.log('\n## TABELAS ENCONTRADAS\n');
    console.log(tables);

    for (const table of tables) {
      await investigateTable(table.table_name);
    }
  }
}

async function investigateTable(tableName) {
  console.log('\n' + '='.repeat(80));
  console.log(`### Tabela: ${tableName}`);
  console.log('='.repeat(80));

  // 1. Contar registros
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total de registros: ${count || 0}`);

  // 2. Pegar primeiras 5 linhas com todos os dados
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(5);

  if (error) {
    console.log(`\n❌ Erro ao consultar ${tableName}:`, error.message);
    return;
  }

  // 3. Mostrar estrutura baseada nos dados
  if (data && data.length > 0) {
    console.log('\n📋 Estrutura (baseada nos dados):');
    const firstRow = data[0];
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key];
      const type = typeof value === 'object' && value !== null ? 'JSON/OBJECT' : typeof value;
      console.log(`  - ${key}: ${type} (valor exemplo: ${JSON.stringify(value)})`);
    });

    console.log('\n📝 Dados de exemplo (primeiras 5 linhas):');
    data.forEach((row, idx) => {
      console.log(`\n  [${idx + 1}]`, JSON.stringify(row, null, 2));
    });
  } else {
    console.log('\n⚠️ Tabela vazia - sem dados para mostrar estrutura');
  }
}

investigateDatabase()
  .then(() => {
    console.log('\n' + '='.repeat(80));
    console.log('✅ INVESTIGAÇÃO COMPLETA');
    console.log('='.repeat(80));
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ ERRO FATAL:', err);
    process.exit(1);
  });
