import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { planService } from '../../lib/planService';

export default function DebugPlanos() {
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      try {
        console.log('🔍 INICIANDO DEBUG...');

        // 1. Testar Planos
        const plansResult = await planService.getAllPlans();
        console.log('✅ Planos:', plansResult);

        // 2. Testar Atividades
        const { data: atividades, error: atividadesError } = await supabase
          .from('atividades')
          .select('id, title, category')
          .limit(3);
        console.log('✅ Atividades (raw):', atividades, atividadesError);

        // 3. Testar Vídeos
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('id, titulo, categoria')
          .limit(3);
        console.log('✅ Vídeos (raw):', videos, videosError);

        // 4. Testar com alias
        const { data: videosAlias, error: videosAliasError } = await supabase
          .from('videos')
          .select('id, titulo as title, categoria as category')
          .limit(3);
        console.log('✅ Vídeos (com alias):', videosAlias, videosAliasError);

        // 5. Testar Bônus
        const { data: bonus, error: bonusError } = await supabase
          .from('bonus')
          .select('id, titulo, categoria')
          .limit(3);
        console.log('✅ Bônus (raw):', bonus, bonusError);

        // 6. Testar PaperCrafts
        const { data: papercrafts, error: papercraftsError } = await supabase
          .from('papercrafts')
          .select('id, title, category')
          .limit(3);
        console.log('✅ PaperCrafts:', papercrafts, papercraftsError);

        // 7. Testar Community Channels
        const channelsResult = await planService.getAllCommunityChannels();
        console.log('✅ Community Channels:', channelsResult);

        // 8. Testar Support Tiers
        const tiersResult = await planService.getAllSupportTiers();
        console.log('✅ Support Tiers:', tiersResult);

        setDebug({
          planos: plansResult.length,
          atividades: atividades?.length || 0,
          atividadesError,
          videos: videos?.length || 0,
          videosError,
          videosAlias: videosAlias?.length || 0,
          videosAliasError,
          bonus: bonus?.length || 0,
          bonusError,
          papercrafts: papercrafts?.length || 0,
          papercraftsError,
          communityChannels: channelsResult.length,
          supportTiers: tiersResult.length,
        });
      } catch (error) {
        console.error('❌ ERRO:', error);
        setDebug({ error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    runDebug();
  }, []);

  if (loading) return <div className="p-8">Carregando debug...</div>;

  return (
    <div className="p-8 bg-white rounded-lg">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Planos</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
        {JSON.stringify(debug, null, 2)}
      </pre>
      <p className="mt-4 text-gray-600">Abra o Console (F12) para ver mais detalhes</p>
    </div>
  );
}
