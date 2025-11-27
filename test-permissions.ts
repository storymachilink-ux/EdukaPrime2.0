import { supabase } from './src/lib/supabase';
import { planService } from './src/lib/planService';

async function testPermissions() {
  console.log('🧪 INICIANDO TESTE DE PERMISSÕES\n');

  try {
    // 1. Verificar dados brutos no Supabase
    console.log('1️⃣ Buscando dados brutos da tabela plans...');
    const { data: rawPlans, error: rawError } = await supabase
      .from('plans')
      .select('id, name, permissions')
      .limit(10);

    if (rawError) {
      console.error('❌ Erro ao buscar dados brutos:', rawError);
      return;
    }

    console.log('✅ Dados brutos encontrados:');
    rawPlans?.forEach((plan: any) => {
      console.log(`\n  ID: ${plan.id} (${plan.name})`);
      console.log(`  Permissions: ${JSON.stringify(plan.permissions, null, 2)}`);
    });

    // 2. Testar carregamento via planService
    console.log('\n2️⃣ Carregando plano GRATUITO via planService...');
    const gratuito = await planService.getPlanById('GRATUITO');
    console.log('✅ Plano carregado:');
    console.log(JSON.stringify(gratuito?.permissions, null, 2));

    // 3. Testar com outro plano
    console.log('\n3️⃣ Carregando plano Essencial via planService...');
    const essencial = await planService.getPlanById('3MEQ1R');
    console.log('✅ Plano carregado:');
    console.log(JSON.stringify(essencial?.permissions, null, 2));

    // 4. Verificar verificação de items
    console.log('\n4️⃣ Testando verificação de item...');
    if (gratuito) {
      const hasAccess = planService.isItemAllowedInPlan(gratuito, 'atividades', 'test-id-123');
      console.log(`  hasAccess('atividades', 'test-id-123'): ${hasAccess}`);
      console.log(`  Mode: ${gratuito.permissions.atividades.mode}`);
      console.log(`  Allowed IDs: ${JSON.stringify(gratuito.permissions.atividades.allowed_ids)}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testPermissions();
