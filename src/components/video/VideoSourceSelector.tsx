import React, { useState } from 'react';
import { SourceType, VideoSource, YouTubeSourceData, WistiaSourceData, VturbSourceData } from '../../types';
import { useVideoSources } from '../../hooks/useVideoSources';
import { AlertCircle, Check, Trash2, Plus } from 'lucide-react';

interface VideoSourceSelectorProps {
  videoId: string;
  onSourcesChanged?: (sources: VideoSource[]) => void;
  onError?: (error: string) => void;
}

export function VideoSourceSelector({ videoId, onSourcesChanged, onError }: VideoSourceSelectorProps) {
  const { sources, loading, error, createOrUpdateSource, deleteSource, fetchVideoSources } = useVideoSources();
  const [selectedType, setSelectedType] = useState<SourceType>('youtube');
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    fetchVideoSources(videoId);
  }, [videoId, fetchVideoSources]);

  const handleAddSource = async () => {
    if (!inputValue.trim()) {
      const msg = 'Por favor, insira uma URL ou código';
      onError?.(msg);
      return;
    }

    setSubmitting(true);
    try {
      let sourceData: YouTubeSourceData | WistiaSourceData | VturbSourceData;

      if (selectedType === 'youtube') {
        const youtubeId = extractYouTubeId(inputValue);
        if (!youtubeId) throw new Error('URL do YouTube inválida');
        sourceData = {
          video_id: youtubeId,
          url: inputValue,
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        };
      } else if (selectedType === 'wistia') {
        const mediaId = extractWistiaId(inputValue);
        if (!mediaId) throw new Error('Código Wistia inválido');
        sourceData = {
          media_id: mediaId,
          embed_code: inputValue,
          thumbnail: `https://fast.wistia.com/embed/medias/${mediaId}/swatch`,
        };
      } else {
        // vturb
        const playerId = extractVturbId(inputValue);
        if (!playerId) throw new Error('ID do Vturb inválido');
        sourceData = {
          player_id: playerId,
          embed_code: inputValue,
          thumbnail: '',
        };
      }

      const isPrimary = sources.length === 0;
      await createOrUpdateSource(videoId, selectedType, sourceData, isPrimary);

      setInputValue('');
      await fetchVideoSources(videoId);
      onSourcesChanged?.(sources);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar fonte';
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta fonte?')) return;

    try {
      await deleteSource(sourceId, videoId);
      await fetchVideoSources(videoId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao deletar fonte';
      onError?.(msg);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Carregando fontes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Add New Source */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Adicionar Nova Fonte</h3>

        {/* Source Type Selector */}
        <div className="mb-3 flex gap-2">
          {(['youtube', 'wistia', 'vturb'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholder(selectedType)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
          />
          <button
            onClick={handleAddSource}
            disabled={submitting || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-600 mt-2">{getHelpText(selectedType)}</p>
      </div>

      {/* Sources List */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Fontes Disponíveis ({sources.length})</h3>

        {sources.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma fonte adicionada ainda</p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-3 border rounded bg-white hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{source.source_type}</span>
                    {source.is_primary && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        <Check className="w-3 h-3" />
                        Primária
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {source.source_type === 'youtube' && (source.source_data as YouTubeSourceData).video_id}
                    {source.source_type === 'wistia' && (source.source_data as WistiaSourceData).media_id}
                    {source.source_type === 'vturb' && (source.source_data as VturbSourceData).player_id}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteSource(source.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  title="Deletar fonte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Functions
function extractYouTubeId(input: string): string {
  const match = input.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : '';
}

function extractWistiaId(input: string): string {
  // Extract from embed code or direct ID
  const match = input.match(/media-id='([^']+)'|^([a-z0-9]+)$/);
  return match ? (match[1] || match[2]) : '';
}

function extractVturbId(input: string): string {
  // Extract from embed code or direct ID
  const match = input.match(/id="([^"]+)"|^(vid-[a-z0-9]+)$/);
  return match ? (match[1] || match[2]) : '';
}

function getPlaceholder(type: SourceType): string {
  switch (type) {
    case 'youtube':
      return 'Cole a URL do YouTube: https://www.youtube.com/watch?v=...';
    case 'wistia':
      return 'Cole o código de embed do Wistia ou o media ID';
    case 'vturb':
      return 'Cole o código de embed do Vturb ou o player ID';
  }
}

function getHelpText(type: SourceType): string {
  switch (type) {
    case 'youtube':
      return '📌 Cole qualquer URL do YouTube (watch, youtu.be ou embed)';
    case 'wistia':
      return '📌 Obtenha do Wistia Dashboard → Share → Embed ou copie o media ID';
    case 'vturb':
      return '📌 Obtenha do ConvertAI/Vturb Dashboard → Player → Embed ou copie o player ID';
  }
}
