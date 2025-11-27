import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Edit, Loader2, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { AttractiveUpgradeModal } from '../../ui/AttractiveUpgradeModal';
import { useAdminPlan } from '../../../hooks/useAdminPlan';
import { useVideos, DatabaseVideo } from '../../../hooks/useDatabase';


// Componente leve: mostra miniatura desfocada (blur 2px) e troca por <iframe> sem controles ao clicar
function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = React.useState(false);
  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const params =
    "autoplay=1&mute=1&controls=0&fs=0&disablekb=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&color=white";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md md:rounded-2xl border border-[#ffe3a0] bg-[#fbe9be] shadow-sm">
      {!play ? (
        <button
          type="button"
          onClick={() => setPlay(true)}
          className="group absolute inset-0 grid place-items-center"
          aria-label={`Reproduzir vídeo: ${title}`}
        >
          <img
            src={thumb}
            alt={`Miniatura: ${title}`}
            className="h-full w-full object-cover blur-[2px] transition-all duration-300 group-hover:blur-[1px]"
            loading="lazy"
          />
          {/* overlay suave */}
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
          {/* Botão Play */}
          <div className="relative z-10 grid place-items-center rounded-full bg-white/90 p-4 shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-[#624044]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      ) : (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${id}?${params}`}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen={false}
        />
      )}
    </div>
  );
}

export const Videos: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<DatabaseVideo | null>(null);
  const { permissions } = usePermissions();
  const { isAdmin } = useAdminPlan();
  const { videos, loading, error, addVideo, updateVideo, deleteVideo } = useVideos();

  // If user doesn't have access to videos, show upgrade modal content
  if (!permissions.canAccessVideos) {
    return (
      <>
        <section className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
          {/* Cabeçalho da seção - Mobile Optimized */}
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-[#033258]">
              Vídeos
            </h1>
            <p className="mt-1 text-sm md:text-base text-[#624044] mb-6 md:mb-8 px-2">
              Aprenda com nossos vídeos educacionais especializados
            </p>
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-block animate-[float_4s_ease-in-out_infinite] max-w-sm md:max-w-none">
                <img
                  src="/videos.webp"
                  alt="Vídeos Educacionais EdukaPrime"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <style jsx>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
            `}</style>
          </div>

          {/* Upgrade Content - Mobile Responsive */}
          <div className="text-center py-8 md:py-12">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 border border-[#FFE3A0] max-w-sm md:max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-[#FFF3D6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#033258] mb-2">
                  Acesso Restrito
                </h3>
                <p className="text-[#476178] mb-6">
                  Esta área é exclusiva para assinantes dos planos Evoluir e Prime
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl touch-manipulation"
                >
                  🚀 Liberar Acesso
                </button>
              </div>
            </div>
          </div>
        </section>

        <AttractiveUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B] mx-auto mb-4" />
          <p className="text-[#476178]">Carregando vídeos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Erro ao carregar vídeos</p>
          <p className="text-sm text-[#476178]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10 pb-8 md:pb-10">
      {/* Cabeçalho da seção - Mobile Optimized */}
      <div className="mb-6 md:mb-8 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#033258]">
            Vídeos
          </h1>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingVideo(null);
                setShowVideoModal(true);
              }}
              className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Adicionar Vídeo</span>
              <span className="sm:hidden">+</span>
            </button>
          )}
        </div>
        <p className="text-sm md:text-base text-[#624044] mb-4 md:mb-8 px-2">
          Aprenda com nossos vídeos educacionais especializados
        </p>
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-block animate-[float_4s_ease-in-out_infinite] max-w-sm md:max-w-none">
            <img
              src="/videos.webp"
              alt="Vídeos Educacionais EdukaPrime"
              className="w-full h-auto"
            />
          </div>
        </div>
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>

      {/* Lista de vídeos - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-4 md:gap-6 px-1 md:px-0 pb-4 md:pb-0">
        {videos.map((video) => (
          <article
            key={video.id}
            className="w-full min-w-0 max-w-full overflow-hidden rounded-lg md:rounded-2xl border border-[#ffe3a0] bg-[#fbe9be] p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-300 relative touch-manipulation"
          >
            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingVideo(video);
                  setShowVideoModal(true);
                }}
                className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors touch-manipulation"
              >
                <Edit className="w-4 h-4 text-[#F59E0B]" />
              </button>
            )}

            {/* Video Player */}
            <div className="mb-1.5 md:mb-4">
              <LiteYouTube
                id={video.youtube_url.includes('youtube.com/watch?v=')
                  ? video.youtube_url.split('v=')[1]?.split('&')[0] || video.id
                  : video.id
                }
                title={video.title}
              />
            </div>

            <div className="space-y-0.5 md:space-y-2">
              <h2 className="text-xs md:text-base font-semibold text-[#033258] leading-tight line-clamp-2">
                {video.title}
              </h2>
              {video.duration && (
                <p className="text-[10px] md:text-xs font-medium text-[#624044]">
                  ⏱️ {video.duration}
                </p>
              )}
              <p className="text-[10px] md:text-sm text-[#624044] line-clamp-2 leading-relaxed hidden sm:block">{video.description}</p>
              <p className="text-[10px] md:text-xs text-[#624044] opacity-75">
                📂 {video.category}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal
          video={editingVideo}
          onSave={async (videoData) => {
            try {
              if (editingVideo) {
                await updateVideo(editingVideo.id, videoData);
              } else {
                await addVideo(videoData);
              }
              setShowVideoModal(false);
              setEditingVideo(null);
            } catch (error) {
              console.error('Erro ao salvar vídeo:', error);
              alert('Erro ao salvar vídeo. Tente novamente.');
            }
          }}
          onDelete={editingVideo ? async () => {
            if (confirm('Tem certeza que deseja deletar este vídeo?')) {
              try {
                await deleteVideo(editingVideo.id);
                setShowVideoModal(false);
                setEditingVideo(null);
              } catch (error) {
                console.error('Erro ao deletar vídeo:', error);
                alert('Erro ao deletar vídeo. Tente novamente.');
              }
            }
          } : undefined}
          onClose={() => {
            setShowVideoModal(false);
            setEditingVideo(null);
          }}
        />
      )}
    </section>
  );
};

// Video Modal Component
interface VideoModalProps {
  video?: DatabaseVideo | null;
  onSave: (video: Omit<DatabaseVideo, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = React.useState({
    title: video?.title || '',
    duration: video?.duration || '',
    description: video?.description || '',
    category: video?.category || '',
    youtube_url: video?.youtube_url || '',
    thumbnail: video?.thumbnail || '',
    available_for_plans: video?.available_for_plans || [2, 3] as number[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.youtube_url.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const videoData = {
      title: formData.title,
      description: formData.description,
      youtube_url: formData.youtube_url,
      thumbnail: formData.thumbnail,
      category: formData.category,
      duration: formData.duration,
      available_for_plans: formData.available_for_plans,
      is_custom: true
    };

    onSave(videoData);
  };

  const togglePlan = (planNumber: number) => {
    setFormData(prev => ({
      ...prev,
      available_for_plans: prev.available_for_plans.includes(planNumber)
        ? prev.available_for_plans.filter(p => p !== planNumber)
        : [...prev.available_for_plans, planNumber]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm">
      {/* Modal - Full screen mobile, centered desktop */}
      <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2
                     w-full md:w-[520px] md:max-w-[90vw] bg-white md:rounded-2xl shadow-2xl
                     flex flex-col md:max-h-[90vh] overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 md:p-6 bg-white border-b border-[#FFE3A0] flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-[#033258]">
            {video ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FFF3D6] rounded-xl transition-colors touch-manipulation"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6 text-[#476178]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-[#FFE3A0] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-base"
                placeholder="Ex: Como ensinar matemática básica"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#033258] mb-2">
                  Duração
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 border border-[#FFE3A0] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-base"
                  placeholder="Ex: 15:30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#033258] mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-[#FFE3A0] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-base"
                  placeholder="Ex: Matemática"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-[#FFE3A0] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent h-20 text-base resize-none"
                placeholder="Descrição do vídeo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                URL do YouTube *
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                className="w-full p-3 border border-[#FFE3A0] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-base"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                URL da Thumbnail
              </label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                className="w-full p-3 border border-[#FFE3A0] rounded-xl focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-base"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#033258] mb-3">
                Disponível para os planos:
              </label>
              <div className="space-y-2">
                {[
                  { number: 1, name: 'Essencial', icon: '📝' },
                  { number: 2, name: 'Evoluir', icon: '📈' },
                  { number: 3, name: 'Prime', icon: '👑' }
                ].map(plan => (
                  <label key={plan.number} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available_for_plans.includes(plan.number)}
                      onChange={() => togglePlan(plan.number)}
                      className="w-4 h-4 text-[#F59E0B] bg-gray-100 border-gray-300 rounded focus:ring-[#F59E0B] focus:ring-2"
                    />
                    <span className="text-sm text-[#033258]">
                      {plan.icon} {plan.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer - Mobile/Desktop Actions */}
        <div className="p-4 md:p-6 bg-white border-t border-[#FFE3A0] flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 border border-[#FFE3A0] text-[#033258] rounded-xl hover:bg-[#FFF3D6] transition-colors touch-manipulation font-medium"
            >
              Cancelar
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors touch-manipulation font-medium"
              >
                Deletar
              </button>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-[#F59E0B] text-white rounded-xl hover:bg-[#D97706] transition-colors touch-manipulation font-medium"
            >
              {video ? 'Salvar Alterações' : 'Adicionar Vídeo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};