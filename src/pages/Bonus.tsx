import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Download, Lock, Loader2, Search, Filter, X, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PostItTitle } from '../components/ui/PostItTitle';
import { logActivity } from '../lib/activityLogger';
import { markAsCompleted, markAsStarted, getAllUserProgress } from '../lib/progressTracker';
import { useNavigate } from 'react-router-dom';
import { AreaBanner } from '../components/AreaBanner';
import { AttractiveUpgradeModal } from '../components/ui/AttractiveUpgradeModal';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Bonus {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  icone_url: string | null;
  imagem_url: string | null;
  link_download: string;
  available_for_plans: number[];
  badge_texto: string | null;
  badge_cor: string | null;
  badge_text_color: string | null;
}

const badgeColors = {
  orange: 'bg-gradient-to-r from-orange-500 to-red-500',
  green: 'bg-gradient-to-r from-green-500 to-emerald-500',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
  red: 'bg-gradient-to-r from-red-500 to-rose-500',
};

export default function Bonus() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { hasAccess, getAvailablePlans, loading: featureLoading } = useFeatureAccess();
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [hasBonusAccess, setHasBonusAccess] = useState(false);

  // Estado para modal de acesso negado
  const [deniedModalOpen, setDeniedModalOpen] = useState(false);
  const [deniedItemTitle, setDeniedItemTitle] = useState('');
  const [deniedPlans, setDeniedPlans] = useState<any[]>([]);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBonus();
    loadUserProgress();
    checkFeatureAccess();
  }, []);

  const checkFeatureAccess = async () => {
    const bonusAccess = await hasAccess('bonus');
    setHasBonusAccess(bonusAccess);
  };

  const fetchBonus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bonus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mostrar TODOS os bônus (com ou sem acesso)
      setBonus(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao carregar bônus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se usuário tem acesso a um bônus
  const userHasAccessToItem = (item: Bonus): boolean => {
    const currentPlanId = profile?.active_plan_id || 0;
    const availablePlans = item.available_for_plans || [];
    return availablePlans.includes(currentPlanId);
  };

  const loadUserProgress = async () => {
    if (!profile?.id) return;
    const { data } = await getAllUserProgress(profile.id, 'bonus');
    setUserProgress(data || []);
  };

  const isCompleted = (bonusId: string) => {
    return userProgress.some(p => p.resource_id === bonusId && p.status === 'completed');
  };

  const handleDownload = async (item: Bonus) => {
    // Verificar acesso antes de permitir download
    if (!userHasAccessToItem(item)) {
      setDeniedModalOpen(true);
      return;
    }

    // Registrar download no log
    if (profile?.id) {
      await logActivity(
        profile.id,
        'download',
        'bonus',
        item.id,
        item.titulo
      );
      // Marcar como iniciado se ainda não foi
      await markAsStarted(profile.id, 'bonus', item.id, item.titulo);
    }

    // Abrir link de download
    window.open(item.link_download, '_blank');
  };

  const handleToggleComplete = async (item: Bonus) => {
    console.log('🔵 handleToggleComplete chamado para:', item.titulo);

    if (!profile?.id) {
      console.log('❌ Usuário não está logado!');
      return;
    }

    console.log('👤 User ID:', profile.id);

    const completed = isCompleted(item.id);
    console.log('📊 Já está concluído?', completed);

    if (completed) {
      console.log('⚠️ Bônus já foi concluído. Nada a fazer.');
      return;
    }

    console.log('🚀 Marcando como concluído...');

    try {
      const result = await markAsCompleted(
        profile.id,
        'bonus',
        item.id,
        item.titulo
      );

      console.log('📝 Resultado markAsCompleted:', result);

      if (result.success) {
        console.log('✅ markAsCompleted executado com sucesso!');

        // Registrar no log de atividades
        console.log('📝 Registrando log de atividade...');
        await logActivity(
          profile.id,
          'completed',
          'bonus',
          item.id,
          item.titulo
        );
        console.log('✅ Log de atividade registrado!');

        // Recarregar progresso
        console.log('🔄 Recarregando progresso...');
        await loadUserProgress();
        console.log('✅ Progresso recarregado!');
      } else {
        console.error('❌ Erro ao marcar como concluído:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro no handleToggleComplete:', error);
    }
  };

  // Emojis padrão por categoria (fallback se não tiver imagem)
  const getIconeEmoji = (categoria: string) => {
    if (categoria.includes('E-book') || categoria.includes('PDF')) return '📚';
    if (categoria.includes('Template')) return '📋';
    if (categoria.includes('Calendário')) return '📅';
    return '🎁';
  };

  // Extrair categorias únicas
  const categorias = useMemo(() => {
    return Array.from(new Set(bonus.map(b => b.categoria).filter(Boolean)));
  }, [bonus]);

  // Filtrar bonus
  const bonusFiltrados = useMemo(() => {
    return bonus.filter(item => {
      const matchSearch = searchTerm === '' ||
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategoria = selectedCategoria === '' || item.categoria === selectedCategoria;

      return matchSearch && matchCategoria;
    });
  }, [bonus, searchTerm, selectedCategoria]);

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategoria !== '';

  // Não renderizar nada enquanto está carregando acesso de features
  if (featureLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-[#F8FBFF] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#0F2741] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#F8FBFF] min-h-screen">
        <PostItTitle
          title="Materiais Bônus"
          description="Recursos extras para enriquecer sua prática pedagógica"
        />

        {/* Banner Topo */}
        <AreaBanner area="bonus_topo" />

        {/* Barra de Busca e Filtros */}
        <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar materiais bônus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#0F2741] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2741] focus:border-transparent shadow-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  showFilters
                    ? 'bg-[#0F2741] text-white border-[#0F2741]'
                    : 'bg-white text-[#0F2741] border-[#0F2741] hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-amber-400 text-[#0F2741] text-xs px-2 py-0.5 rounded-full font-bold">
                    {[searchTerm, selectedCategoria].filter(Boolean).length}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 transition-all"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              )}

              <div className="ml-auto text-sm text-gray-600 flex items-center">
                <span className="font-semibold text-[#0F2741]">{bonusFiltrados.length}</span>
                <span className="ml-1">
                  {bonusFiltrados.length === 1 ? 'material encontrado' : 'materiais encontrados'}
                </span>
              </div>
            </div>

            {showFilters && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl p-6 shadow-lg animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-[#0F2741] mb-2">Categoria</label>
                  <select
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2741] focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

        {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="relative group animate-pulse">
                    <div className="absolute inset-0 bg-gray-200 border-2 border-gray-300 rounded-lg" />
                    <div className="relative p-6 rounded-lg">
                      <div className="text-4xl mb-4 w-12 h-12 bg-gray-300 rounded-full" />
                      <div className="h-5 bg-gray-300 rounded w-20 mb-2" />
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-300 rounded w-full" />
                        <div className="h-4 bg-gray-300 rounded w-5/6" />
                      </div>
                      <div className="h-10 bg-gray-300 rounded-xl w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Erro ao carregar bônus: {error}
              </div>
            )}

            {/* Empty State - Nenhum bônus */}
            {!loading && !error && bonus.length === 0 && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum material bônus disponível</h3>
                <p className="text-gray-600 mb-4">Ainda não há materiais bônus cadastrados no sistema.</p>
                <p className="text-gray-500 text-sm">Novos conteúdos serão adicionados em breve!</p>
              </div>
            )}

            {/* Empty State - Nenhum resultado */}
            {!loading && !error && bonus.length > 0 && bonusFiltrados.length === 0 && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center animate-fade-in">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-600 mb-4">Não encontramos materiais bônus com os filtros selecionados.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2741] text-white rounded-lg hover:bg-[#1a3a5c] transition-all font-semibold"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            )}

            {/* Grid de Bônus */}
            {!loading && !error && bonusFiltrados.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bonusFiltrados.map((item, index) => {
                  const rotations = ['-1deg', '1deg', '-2deg'];
                  const rotation = rotations[index % 3];

                  return (
                  <div
                    key={item.id}
                    className="relative group transition-all duration-300 animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transform: `rotate(${rotation})`
                    }}
                  >
                    {/* Moldura sketch */}
                    <div className="absolute inset-0 bg-white border-2 border-[#0F2741] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#0F2741] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />

                    {/* Badge estilo Landing - FORA do overflow */}
                    {item.badge_texto && (
                      <div
                        className="absolute -top-3 -right-3 px-3 py-1 rounded-full rotate-12 text-sm border-2 border-[#0F2741] z-30 font-bold shadow-md"
                        style={{
                          backgroundColor: item.badge_cor || '#FFC107',
                          color: item.badge_text_color || '#0F2741'
                        }}
                      >
                        {item.badge_texto}
                      </div>
                    )}

                    <div className="relative p-6 rounded-lg">
                    {/* Imagem ou Emoji */}
                    {item.imagem_url ? (
                      <div className="relative w-full mb-4 mt-2 overflow-hidden rounded-2xl border-3 border-[#0F2741] shadow-lg" style={{ aspectRatio: '340/268' }}>
                        <img
                          src={item.imagem_url}
                          alt={item.titulo}
                          className={`w-full h-full object-cover ${!userHasAccessToItem(item) ? 'opacity-50' : ''}`}
                        />
                        {!userHasAccessToItem(item) && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`text-4xl mb-4 mt-2 ${!userHasAccessToItem(item) ? 'opacity-50' : ''}`}>
                        {getIconeEmoji(item.categoria)}
                      </div>
                    )}
                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded">
                      {item.categoria}
                    </span>
                    <h3 className="font-bold text-lg mt-3 mb-2 text-[#0F2741]">{item.titulo}</h3>
                    <p className="text-[#4A5568] text-sm mb-4">{item.descricao}</p>

                    <div className="space-y-2">
                      {userHasAccessToItem(item) ? (
                        <button
                          onClick={() => handleDownload(item)}
                          className="group w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          <Download className="w-4 h-4 group-active:animate-icon-bounce" />
                          Baixar Arquivo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(item)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Lock className="w-4 h-4" />
                          Upgrade para Acessar
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleComplete(item)}
                        className={`w-full px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          isCompleted(item.id)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-default'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 active:scale-95'
                        }`}
                        disabled={isCompleted(item.id) || !userHasAccessToItem(item)}
                      >
                        {isCompleted(item.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Concluído ✓
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4" />
                            Marcar como Concluído
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  </div>
                );
                })}
              </div>
            )}

        {/* Banner Rodapé */}
        <AreaBanner area="bonus_rodape" />

      {/* Modal de Acesso Negado */}
      <AttractiveUpgradeModal
        isOpen={deniedModalOpen}
        onClose={() => setDeniedModalOpen(false)}
      />
      </div>
    </DashboardLayout>
  );
}