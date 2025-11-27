import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Download, Lock, Loader2, Search, Filter, X, CheckCircle, Circle, ArrowRight, Zap, BookOpen, Sparkles } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PostItTitle } from '../components/ui/PostItTitle';
import { logActivity } from '../lib/activityLogger';
import { markAsCompleted, markAsStarted, getAllUserProgress } from '../lib/progressTracker';
import { useNavigate } from 'react-router-dom';
import { AreaBanner } from '../components/AreaBanner';
import { PaperCraftCardForActivities } from '../components/dashboard/PaperCraftCardForActivities';
import { PaperCraftDetailModal } from '../components/dashboard/PaperCraftDetailModal';
import { getPaperCrafts } from '../lib/paperCraftService';
import { AttractiveUpgradeModal } from '../components/ui/AttractiveUpgradeModal';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string | null;
  link_download: string;
  plano_minimo: number;
  categoria: string;
  faixa_etaria: string;
  badge_texto: string | null;
  badge_cor: string | null;
  badge_text_color: string | null;
}

interface PaperCraft {
  id: string;
  title: string;
  category: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  model_count: string;
  min_age: number;
  max_age: number;
  image_url?: string;
  is_active: boolean;
}

type TabType = 'atividades' | 'papercrafts';

const badgeColors = {
  orange: 'bg-gradient-to-r from-orange-500 to-red-500',
  green: 'bg-gradient-to-r from-green-500 to-emerald-500',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
  red: 'bg-gradient-to-r from-red-500 to-rose-500',
};

export default function Atividades() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { hasAccess, getAvailablePlans, loading: featureLoading } = useFeatureAccess();
  const [activeTab, setActiveTab] = useState<TabType>('atividades');
  const [hasAtividadesAccess, setHasAtividadesAccess] = useState(false);
  const [hasPapercraftsAccess, setHasPapercraftsAccess] = useState(false);

  // Estados para Atividades
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState<any[]>([]);

  // Estado para modal de acesso negado
  const [deniedModalOpen, setDeniedModalOpen] = useState(false);
  const [deniedItemTitle, setDeniedItemTitle] = useState('');
  const [deniedPlans, setDeniedPlans] = useState<any[]>([]);

  // Estados para PaperCrafts
  const [papercrafts, setPapercrafts] = useState<PaperCraft[]>([]);
  const [papercraftsLoading, setPapercraftsLoading] = useState(false);
  const [selectedPapercraft, setSelectedPapercraft] = useState<PaperCraft | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedFaixaEtaria, setSelectedFaixaEtaria] = useState<string>('');
  const [selectedPlano, setSelectedPlano] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAtividades();
    fetchPapercrafts();
    loadUserProgress();
    checkFeatureAccess();
  }, []);

  const checkFeatureAccess = async () => {
    const atividadesAccess = await hasAccess('atividades');
    const papercraftsAccess = await hasAccess('papercrafts');
    setHasAtividadesAccess(atividadesAccess);
    setHasPapercraftsAccess(papercraftsAccess);
  };

  const fetchPapercrafts = async () => {
    try {
      setPapercraftsLoading(true);
      const data = await getPaperCrafts();

      // Mostrar TODOS os papercrafts (com ou sem acesso)
      console.log(`📊 PaperCrafts carregados: ${data.length}`);
      setPapercrafts(data);
    } catch (err) {
      console.error('Erro ao carregar papercrafts:', err);
    } finally {
      setPapercraftsLoading(false);
    }
  };

  // Função para verificar se usuário tem acesso a um papercraft
  const userHasAccessToPapercraft = (item: PaperCraft): boolean => {
    const currentPlanId = profile?.active_plan_id || 0;
    const availablePlans = item.available_for_plans || [];
    return availablePlans.includes(currentPlanId);
  };

  const fetchAtividades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mostrar TODAS as atividades (com ou sem acesso)
      console.log(`📊 Atividades carregadas: ${data?.length || 0}`);
      setAtividades(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao carregar atividades:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se usuário tem acesso a uma atividade
  const userHasAccessToItem = (item: Atividade): boolean => {
    const currentPlanId = profile?.active_plan_id || 0;
    const availablePlans = item.available_for_plans || [];
    return availablePlans.includes(currentPlanId);
  };


  const loadUserProgress = async () => {
    if (!profile?.id) return;
    const { data } = await getAllUserProgress(profile.id, 'atividade');
    setUserProgress(data || []);
  };

  const isCompleted = (atividadeId: string) => {
    return userProgress.some(p => p.resource_id === atividadeId && p.status === 'completed');
  };

  const handleDownload = async (atividade: Atividade) => {
    // Verificar acesso antes de permitir download
    if (!hasAtividadesAccess) {
      setDeniedModalOpen(true);
      return;
    }

    // Registrar atividade no log
    if (profile?.id) {
      await logActivity(
        profile.id,
        'download',
        'atividade',
        atividade.id,
        atividade.titulo
      );
      // Marcar como iniciado se ainda não foi
      await markAsStarted(profile.id, 'atividade', atividade.id, atividade.titulo);
    }

    // Abrir link de download
    window.open(atividade.link_download, '_blank');
  };

  const handleToggleComplete = async (atividade: Atividade) => {
    console.log('🔵 handleToggleComplete chamado para:', atividade.titulo);

    if (!profile?.id) {
      console.log('❌ Usuário não está logado!');
      return;
    }

    console.log('👤 User ID:', profile.id);

    const completed = isCompleted(atividade.id);
    console.log('📊 Já está concluído?', completed);

    if (completed) {
      console.log('⚠️ Atividade já foi concluída. Nada a fazer.');
      return;
    }

    console.log('🚀 Marcando como concluído...');

    try {
      const result = await markAsCompleted(
        profile.id,
        'atividade',
        atividade.id,
        atividade.titulo
      );

      console.log('📝 Resultado markAsCompleted:', result);

      if (result.success) {
        console.log('✅ markAsCompleted executado com sucesso!');

        // Registrar no log de atividades
        console.log('📝 Registrando log de atividade...');
        await logActivity(
          profile.id,
          'completed',
          'atividade',
          atividade.id,
          atividade.titulo
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

  // Extrair categorias e faixas etárias únicas
  const categorias = useMemo(() => {
    return Array.from(new Set(atividades.map(a => a.categoria).filter(Boolean)));
  }, [atividades]);

  const faixasEtarias = useMemo(() => {
    return Array.from(new Set(atividades.map(a => a.faixa_etaria).filter(Boolean)));
  }, [atividades]);

  // Extrair temas únicos dos papercrafts
  const themes = useMemo(() => {
    const uniqueThemes = Array.from(new Set(papercrafts.map(p => p.theme).filter(Boolean)));
    return uniqueThemes as string[];
  }, [papercrafts]);

  // Filtrar papercrafts por tema selecionado
  const papercraftsFiltrados = useMemo(() => {
    if (!selectedTheme) return papercrafts;
    return papercrafts.filter(p => p.theme === selectedTheme);
  }, [papercrafts, selectedTheme]);

  // Filtrar atividades
  const atividadesFiltradas = useMemo(() => {
    return atividades.filter(atividade => {
      // Filtro de busca
      const matchSearch = searchTerm === '' ||
        atividade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atividade.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoria
      const matchCategoria = selectedCategoria === '' || atividade.categoria === selectedCategoria;

      // Filtro de faixa etária
      const matchFaixaEtaria = selectedFaixaEtaria === '' || atividade.faixa_etaria === selectedFaixaEtaria;

      // Filtro de plano removido (não mais usado)

      return matchSearch && matchCategoria && matchFaixaEtaria;
    });
  }, [atividades, searchTerm, selectedCategoria, selectedFaixaEtaria]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('');
    setSelectedFaixaEtaria('');
    setSelectedPlano('');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== '' || selectedCategoria !== '' || selectedFaixaEtaria !== '' || selectedPlano !== '';

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
        {/* Header com Post-it */}
        <PostItTitle
          title="Acervo de atividades"
          description="Explore nossa biblioteca de atividades educacionais"
        />

        {/* Banner Topo */}
        <AreaBanner area="atividades_topo" />

        {/* Botões Toggle - Atividades BNCC | Coleções PaperCrafts */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('atividades')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'atividades'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Atividades BNCC</span>
            <span className="ml-2 bg-white text-orange-600 rounded-full px-2 py-0.5 text-sm font-bold">
              {atividades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('papercrafts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'papercrafts'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Coleções PaperCrafts</span>
            <span className="ml-2 bg-white text-blue-600 rounded-full px-2 py-0.5 text-sm font-bold">
              {papercrafts.length}
            </span>
          </button>
        </div>

        {/* Botão Post-it Verde para Upgrade */}
        {!hasAtividadesAccess && (
          <div className="mb-8">
            <button
              onClick={() => navigate('/planos')}
              className="relative inline-block group"
            >
              {/* Post-it verde claro */}
              <div className="relative bg-green-100 border-2 border-green-300 rounded-2xl px-6 py-4 shadow-lg transform hover:rotate-0 rotate-[-1deg] transition-all duration-300 hover:shadow-xl">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-green-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-600 rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-600 rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-600 rounded-full transform translate-x-1 translate-y-1"></div>

                {/* Conteúdo */}
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-green-700" />
                  <span className="text-xl font-bold text-green-800 relative z-10">
                    Liberar Atividades com Upgrade
                  </span>
                  <ArrowRight className="w-6 h-6 text-green-700 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Barra de Busca e Filtros - Apenas para Atividades */}
        {activeTab === 'atividades' && (
        <div className="mb-8 space-y-4">
          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#0F2741] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2741] focus:border-transparent shadow-sm"
            />
          </div>

          {/* Botão de Filtros e Limpar */}
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
                  {[searchTerm, selectedCategoria, selectedFaixaEtaria, selectedPlano].filter(Boolean).length}
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
              <span className="font-semibold text-[#0F2741]">{atividadesFiltradas.length}</span>
              <span className="ml-1">
                {atividadesFiltradas.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}
              </span>
            </div>
          </div>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="bg-white border-2 border-[#0F2741] rounded-xl p-6 shadow-lg animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro Categoria */}
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

                {/* Filtro Faixa Etária */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F2741] mb-2">Faixa Etária</label>
                  <select
                    value={selectedFaixaEtaria}
                    onChange={(e) => setSelectedFaixaEtaria(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2741] focus:border-transparent"
                  >
                    <option value="">Todas as idades</option>
                    {faixasEtarias.map(faixa => (
                      <option key={faixa} value={faixa}>{faixa}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Plano */}
                <div>
                  <label className="block text-sm font-semibold text-[#0F2741] mb-2">Plano Mínimo</label>
                  <select
                    value={selectedPlano}
                    onChange={(e) => setSelectedPlano(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2741] focus:border-transparent"
                  >
                    <option value="">Todos os planos</option>
                    <option value="1">Essencial (1)</option>
                    <option value="2">Evoluir (2)</option>
                    <option value="3">Prime (3)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Loading Skeleton - Atividades */}
        {activeTab === 'atividades' && loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative group animate-pulse">
                {/* Moldura skeleton */}
                <div className="absolute inset-0 bg-gray-200 border-2 border-gray-300 rounded-lg" />

                <div className="relative overflow-hidden rounded-lg">
                  <div className="relative">
                    {/* Image skeleton */}
                    <div className="w-full h-48 bg-gray-300" />
                  </div>

                  <div className="p-4 bg-white">
                    {/* Category badge skeleton */}
                    <div className="h-5 bg-gray-300 rounded w-20 mb-2" />

                    {/* Title skeleton */}
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />

                    {/* Description skeleton */}
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-300 rounded w-full" />
                      <div className="h-4 bg-gray-300 rounded w-5/6" />
                    </div>

                    {/* Button skeleton */}
                    <div className="h-10 bg-gray-300 rounded-xl w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error - Apenas para Atividades */}
        {activeTab === 'atividades' && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Erro ao carregar atividades: {error}
          </div>
        )}

        {/* Empty State - Nenhuma atividade no sistema */}
        {activeTab === 'atividades' && !loading && !error && atividades.length === 0 && (
          <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhuma atividade disponível</h3>
            <p className="text-gray-600 mb-4">Ainda não há atividades cadastradas no sistema.</p>
            <p className="text-gray-500 text-sm">Novos conteúdos serão adicionados em breve!</p>
          </div>
        )}

        {/* Empty State - Nenhum resultado nos filtros */}
        {activeTab === 'atividades' && !loading && !error && atividades.length > 0 && atividadesFiltradas.length === 0 && (
          <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-600 mb-4">Não encontramos atividades com os filtros selecionados.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2741] text-white rounded-lg hover:bg-[#1a3a5c] transition-all font-semibold"
            >
              <X className="w-4 h-4" />
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Grid de Atividades */}
        {activeTab === 'atividades' && !loading && !error && atividadesFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {atividadesFiltradas.map((atividade, index) => {
              const rotations = ['-1deg', '1deg', '-2deg'];
              const rotation = rotations[index % 3];

              return (
              <div
                key={atividade.id}
                className="relative group transition-all duration-300 animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  transform: `rotate(${rotation})`
                }}
              >
                {/* Moldura sketch com sombra offset */}
                <div className="absolute inset-0 bg-white border-2 border-[#0F2741] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#0F2741] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />

                {/* Badge "Mais Popular" estilo Landing - FORA do overflow-hidden */}
                {atividade.badge_texto && (
                  <div
                    className="absolute -top-3 -right-3 px-3 py-1 rounded-full rotate-12 text-sm border-2 border-[#0F2741] z-30 font-bold shadow-md"
                    style={{
                      backgroundColor: atividade.badge_cor || '#FFC107',
                      color: atividade.badge_text_color || '#0F2741'
                    }}
                  >
                    {atividade.badge_texto}
                  </div>
                )}

                <div className="relative overflow-hidden rounded-lg">
                <div className="relative">
                  <img
                    src={atividade.imagem || 'https://via.placeholder.com/300x200?text=Atividade'}
                    alt={atividade.titulo}
                    className="w-full h-48 object-cover"
                  />
                  {!hasAtividadesAccess && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
                      {atividade.categoria}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {atividade.faixa_etaria}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-[#0F2741]">{atividade.titulo}</h3>
                  <p className="text-[#4A5568] text-sm mb-4">{atividade.descricao}</p>

                  <div className="space-y-2">
                    {userHasAccessToItem(atividade) ? (
                      <>
                        <button
                          onClick={() => handleDownload(atividade)}
                          className="group w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          <Download className="w-4 h-4 group-active:animate-icon-bounce" />
                          Baixar Agora
                        </button>
                        <button
                          onClick={() => handleToggleComplete(atividade)}
                          className={`w-full px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                            isCompleted(atividade.id)
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-default'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 active:scale-95'
                          }`}
                          disabled={isCompleted(atividade.id)}
                        >
                          {isCompleted(atividade.id) ? (
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
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setDeniedModalOpen(true);
                        }}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Lock className="w-4 h-4" />
                        Upgrade para Acessar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Banner Rodapé */}
        {/* SEÇÃO PAPERCRAFTS */}
        {activeTab === 'papercrafts' && (
          <>
            {/* Filtro por Tema */}
            {!papercraftsLoading && papercrafts.length > 0 && themes.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="font-semibold text-gray-700">Filtrar por Tema:</span>
                  <button
                    onClick={() => setSelectedTheme('')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedTheme === ''
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({papercrafts.length})
                  </button>
                  {themes.map((theme) => {
                    const themeEmoji = theme === 'Natal' ? '🎄' : theme === 'Halloween' ? '🎃' : '🎨';
                    const count = papercrafts.filter(p => p.theme === theme).length;
                    return (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                          selectedTheme === theme
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{themeEmoji}</span>
                        <span>{theme} ({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading */}
            {papercraftsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!papercraftsLoading && papercrafts.length === 0 && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum PaperCraft disponível</h3>
                <p className="text-gray-600 mb-4">Ainda não há papercrafts cadastrados no sistema.</p>
                <p className="text-gray-500 text-sm">Novos papercrafts serão adicionados em breve!</p>
              </div>
            )}

            {/* Empty State - Nenhum resultado com filtro */}
            {!papercraftsLoading && papercrafts.length > 0 && papercraftsFiltrados.length === 0 && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center animate-fade-in">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum PaperCraft encontrado</h3>
                <p className="text-gray-600 mb-4">Não há papercrafts com o tema selecionado.</p>
                <button
                  onClick={() => setSelectedTheme('')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2741] text-white rounded-lg hover:bg-[#1a3a5c] transition-all font-semibold"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtro
                </button>
              </div>
            )}

            {/* Grid de PaperCrafts - 2 por linha */}
            {!papercraftsLoading && papercraftsFiltrados.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {papercraftsFiltrados.map((papercraft) => (
                  <PaperCraftCardForActivities
                    key={papercraft.id}
                    papercraft={papercraft}
                    onDetailsClick={async (pc) => {
                      if (userHasAccessToPapercraft(pc)) {
                        setSelectedPapercraft(pc);
                      } else {
                        setDeniedModalOpen(true);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal de Detalhe do PaperCraft */}
        <PaperCraftDetailModal
          papercraft={selectedPapercraft}
          onClose={() => setSelectedPapercraft(null)}
        />

        {/* Modal de Acesso Negado */}
        <AttractiveUpgradeModal
          isOpen={deniedModalOpen}
          onClose={() => setDeniedModalOpen(false)}
        />

        <AreaBanner area="atividades_rodape" />
      </div>
    </DashboardLayout>
  );
}