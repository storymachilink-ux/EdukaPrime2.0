const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('Certifique-se de que .env.local contém:');
  console.error('  VITE_SUPABASE_URL=...');
  console.error('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BANNER_AREAS = [
  { area: 'atividades_topo', title: null, description: null, image_url: null, button_url: null, banner_url: null, active: false },
  { area: 'atividades_rodape', title: null, description: null, image_url: null, button_url: null, banner_url: null, active: false },
  { area: 'bonus_topo', title: null, description: null, image_url: null, button_url: null, banner_url: null, active: false },
  { area: 'bonus_rodape', title: null, description: null, image_url: null, button_url: null, banner_url: null, active: false },
  { area: 'planos_rodape', title: null, description: null, image_url: null, button_url: null, banner_url: null, active: false },
  { area: 'suporte_topo', title: null, description: null, image_url: null, button_url: null, banner_url: null, active: false },
];

async function restoreAreaBanners() {
  try {
    console.log('🔄 Restaurando banners...\n');

    // Verificar se a tabela existe
    const { data: existingBanners, error: selectError } = await supabase
      .from('area_banners')
      .select('*');

    if (selectError) {
      console.error('❌ Erro ao verificar tabela:', selectError.message);
      console.log('\n⚠️  A tabela pode não existir. Execute manualmente:');
      console.log('1. Acesse: https://app.supabase.com/');
      console.log('2. Vá em "SQL Editor"');
      console.log('3. Cole o conteúdo de: sql/create_area_banners.sql');
      console.log('4. Execute');
      return;
    }

    console.log(`✅ Tabela encontrada com ${existingBanners?.length || 0} registros\n`);

    // Inserir as áreas padrão
    for (const bannerData of BANNER_AREAS) {
      const { data, error } = await supabase
        .from('area_banners')
        .upsert([bannerData], { onConflict: 'area' });

      if (error) {
        console.error(`❌ Erro ao restaurar ${bannerData.area}:`, error.message);
      } else {
        console.log(`✅ Restaurado: ${bannerData.area}`);
      }
    }

    console.log('\n✨ Banners restaurados com sucesso!');
    console.log('Acesse: http://localhost:5176/admin/area-banners');
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  }
}

restoreAreaBanners();
