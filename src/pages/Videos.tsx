import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Play, Lock, Clock, Loader2, Search, Filter, X, CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PostItTitle } from '../components/ui/PostItTitle';
import { logActivity } from '../lib/activityLogger';
import { markAsCompleted, markAsStarted, getAllUserProgress } from '../lib/progressTracker';
import { useNavigate } from 'react-router-dom';
import { AttractiveUpgradeModal } from '../components/ui/AttractiveUpgradeModal';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useVideoSources } from '../hooks/useVideoSources';
import { VideoPlayer } from '../components/video/VideoPlayer';

interface Video {
  id: string;
  titulo: string;
  duracao: string | null;
  categoria: string;
  descricao: string;
  youtube_url: string;
  thumbnail: string | null;
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

export default function Videos() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { hasAccess, getAvailablePlans, loading: featureLoading } = useFeatureAccess();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hasVideosAccess, setHasVideosAccess] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Hook para múltiplas fontes de vídeo
  const { sources: videoSources, initialize: initializeVideoSources, loading: sourcesLoading } = useVideoSources();

  // Estado para modal de acesso negado
  const [deniedModalOpen, setDeniedModalOpen] = useState(false);
  const [deniedItemTitle, setDeniedItemTitle] = useState('');
  const [deniedPlans, setDeniedPlans] = useState<any[]>([]);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchVideos();
    loadUserProgress();
    checkFeatureAccess();
  }, []);

  const checkFeatureAccess = async () => {
    const videosAccess = await hasAccess('videos');
    setHasVideosAccess(videosAccess);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mostrar TODOS os vídeos (com ou sem acesso)
      setVideos(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao carregar vídeos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se usuário tem acesso a um vídeo
  const userHasAccessToItem = (item: Video): boolean => {
    const currentPlanId = profile?.active_plan_id || 0;
    const availablePlans = item.available_for_plans || [];
    return availablePlans.includes(currentPlanId);
  };

  const loadUserProgress = async () => {
    if (!profile?.id) return;
    const { data } = await getAllUserProgress(profile.id, 'video');
    setUserProgress(data || []);
  };

  const isCompleted = (videoId: string) => {
    return userProgress.some(p => p.resource_id === videoId && p.status === 'completed');
  };

  const handlePlayVideo = async (video: Video) => {
    // Registrar visualização no log
    if (profile?.id) {
      await logActivity(
        profile.id,
        'view_video',
        'video',
        video.id,
        video.titulo
      );
      // Marcar como iniciado se ainda não foi
      await markAsStarted(profile.id, 'video', video.id, video.titulo);
    }

    // Carregar fontes de vídeo (se existirem)
    await initializeVideoSources(video.id);
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };


  const handleToggleComplete = async (video: Video) => {
    if (!profile?.id) return;

    const completed = isCompleted(video.id);

    if (!completed) {
      const result = await markAsCompleted(
        profile.id,
        'video',
        video.id,
        video.titulo
      );

      if (result.success) {
        // Registrar no log de atividades
        await logActivity(
          profile.id,
          'completed',
          'video',
          video.id,
          video.titulo
        );

        // Recarregar progresso
        await loadUserProgress();
      }
    }
  };

  // Extrair YouTube ID da URL
  const getYoutubeId = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        return url.split('v=')[1]?.split('&')[0] || '';
      }
      return url;
    } catch {
      return '';
    }
  };

  // Truncar texto em 200 caracteres
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Extrair categorias únicas
  const categorias = useMemo(() => {
    return Array.from(new Set(videos.map(v => v.categoria).filter(Boolean)));
  }, [videos]);

  // Filtrar vídeos
  const videosFiltrados = useMemo(() => {
    return videos.filter(video => {
      const matchSearch = searchTerm === '' ||
        video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategoria = selectedCategoria === '' || video.categoria === selectedCategoria;

      return matchSearch && matchCategoria;
    });
  }, [videos, searchTerm, selectedCategoria]);

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
          title="Vídeos Educacionais"
          description="Aprenda com nossos vídeos especializados"
        />

        {/* Barra de Busca e Filtros */}
        <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar vídeos..."
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
                <span className="font-semibold text-[#0F2741]">{videosFiltrados.length}</span>
                <span className="ml-1">
                  {videosFiltrados.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
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
                    <div className="relative overflow-hidden rounded-lg">
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-300" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-gray-400 rounded-full" />
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="h-5 bg-gray-300 rounded w-20 mb-2" />
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-300 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Erro ao carregar vídeos: {error}
              </div>
            )}

            {/* Empty State - Nenhum vídeo */}
            {!loading && !error && videos.length === 0 && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum vídeo disponível</h3>
                <p className="text-gray-600 mb-4">Ainda não há vídeos cadastrados no sistema.</p>
                <p className="text-gray-500 text-sm">Novos conteúdos serão adicionados em breve!</p>
              </div>
            )}

            {/* Empty State - Nenhum resultado */}
            {!loading && !error && videos.length > 0 && videosFiltrados.length === 0 && (
              <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg p-12 text-center animate-fade-in">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#0F2741] mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-600 mb-4">Não encontramos vídeos com os filtros selecionados.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2741] text-white rounded-lg hover:bg-[#1a3a5c] transition-all font-semibold"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            )}

            {/* Grid de Vídeos */}
            {!loading && !error && videosFiltrados.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videosFiltrados.map((video, index) => {
                  const rotations = ['-1deg', '1deg', '-2deg'];
                  const rotation = rotations[index % 3];

                  return (
                  <div
                    key={video.id}
                    className="relative group transition-all duration-300 animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transform: `rotate(${rotation})`
                    }}
                  >
                    {/* Moldura sketch */}
                    <div className="absolute inset-0 bg-white border-2 border-[#0F2741] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#0F2741] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />

                    {/* Badge estilo Landing - FORA do overflow-hidden */}
                    {video.badge_texto && (
                      <div
                        className="absolute -top-3 -right-3 px-3 py-1 rounded-full rotate-12 text-sm border-2 border-[#0F2741] z-30 font-bold shadow-md"
                        style={{
                          backgroundColor: video.badge_cor || '#FFC107',
                          color: video.badge_text_color || '#0F2741'
                        }}
                      >
                        {video.badge_texto}
                      </div>
                    )}

                    <div className="relative overflow-hidden rounded-lg">
                    <div
                      className="relative group cursor-pointer overflow-hidden rounded-2xl border-3 border-[#0F2741] shadow-lg"
                      style={{ aspectRatio: '340/268' }}
                      onClick={async () => {
                        if (userHasAccessToItem(video)) {
                          setSelectedVideo(video);
                        } else {
                          setDeniedModalOpen(true);
                        }
                      }}
                    >
                      <img
                        src={video.thumbnail || 'https://via.placeholder.com/400x225?text=Vídeo'}
                        alt={video.titulo}
                        className={`w-full h-full object-cover ${!userHasAccessToItem(video) ? 'opacity-50' : ''}`}
                      />
                      {userHasAccessToItem(video) ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-16 h-16 text-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Lock className="w-16 h-16 text-white" />
                        </div>
                      )}
                      {video.duracao && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {video.duracao}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                        📂 {video.categoria}
                      </span>
                      <h3 className="font-bold text-lg mt-2 text-[#0F2741]">{video.titulo}</h3>
                      <p className="text-[#4A5568] text-sm mt-1 mb-3">{truncateText(video.descricao)}</p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(video);
                        }}
                        className={`w-full px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          isCompleted(video.id)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-default'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 active:scale-95'
                        }`}
                        disabled={isCompleted(video.id)}
                      >
                        {isCompleted(video.id) ? (
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

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
              {/* Header com botão voltar */}
              <div className="sticky top-0 bg-gradient-to-r from-[#0F2741] to-[#1a3a5c] px-6 py-4 flex items-center justify-between z-10">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity font-semibold text-lg hover:underline"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-white hover:opacity-80 transition-opacity p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="flex-1 p-6 space-y-6">
                {/* Player de Vídeo com Múltiplas Fontes ou YouTube Fallback */}
                {sourcesLoading ? (
                  <div className="w-full bg-black rounded-xl overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                ) : videoSources && videoSources.length > 0 ? (
                  <VideoPlayer
                    sources={videoSources}
                    title={selectedVideo.titulo}
                    className="w-full rounded-xl"
                    autoplay={true}
                  />
                ) : (
                  // Fallback: YouTube original se não houver video_sources
                  <div className="w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.youtube_url)}?autoplay=1&modestbranding=1&rel=0`}
                      title={selectedVideo.titulo}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                {/* Informações do Vídeo */}
                <div className="space-y-4">
                  {/* Título */}
                  <div>
                    <h2 className="text-3xl font-bold text-[#0F2741] mb-2">
                      {selectedVideo.titulo}
                    </h2>
                  </div>

                  {/* Meta informações */}
                  <div className="flex flex-wrap gap-4 items-center">
                    {selectedVideo.duracao && (
                      <div className="flex items-center gap-2 text-gray-700 bg-gray-100 rounded-full px-4 py-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{selectedVideo.duracao}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700 bg-blue-100 rounded-full px-4 py-2">
                      <span className="font-semibold">📂 {selectedVideo.categoria}</span>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#0F2741]">Descrição</h3>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {selectedVideo.descricao}
                    </p>
                  </div>

                  {/* Botão Marcar como Concluído */}
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => {
                        handleToggleComplete(selectedVideo);
                      }}
                      className={`w-full px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-lg ${
                        isCompleted(selectedVideo.id)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-default'
                          : 'bg-[#0F2741] text-white hover:bg-[#1a3a5c] active:scale-95'
                      }`}
                      disabled={isCompleted(selectedVideo.id)}
                    >
                      {isCompleted(selectedVideo.id) ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Concluído ✓
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5" />
                          Marcar como Concluído
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Modal de Acesso Negado */}
      <AttractiveUpgradeModal
        isOpen={deniedModalOpen}
        onClose={() => setDeniedModalOpen(false)}
      />
      </div>
    </DashboardLayout>
  );
}