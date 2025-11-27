import React, { useState } from 'react';
import { VideoSource, YouTubeSourceData, WistiaSourceData, VturbSourceData } from '../../types';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface VideoPlayerProps {
  source?: VideoSource;
  sources?: VideoSource[];
  title?: string;
  className?: string;
  autoplay?: boolean;
}

export function VideoPlayer({ source, sources = [], title, className = '', autoplay = false }: VideoPlayerProps) {
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(
    source || sources.find((s) => s.is_primary) || sources[0] || null
  );
  const [error, setError] = useState<string | null>(null);

  if (!selectedSource) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600">Nenhuma fonte de vídeo disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Source Selector */}
      {sources.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Plataforma:</label>
          <select
            value={selectedSource.id}
            onChange={(e) => {
              const src = sources.find((s) => s.id === e.target.value);
              if (src) setSelectedSource(src);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sources.map((src) => (
              <option key={src.id} value={src.id}>
                {src.source_type.charAt(0).toUpperCase() + src.source_type.slice(1)}
                {src.is_primary ? ' (Padrão)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Player Container */}
      <div className={`bg-black rounded-lg overflow-hidden ${className || 'aspect-video'}`}>
        {selectedSource.source_type === 'youtube' && (
          <YouTubePlayer
            source={selectedSource}
            title={title}
            autoplay={autoplay}
            onError={setError}
          />
        )}

        {selectedSource.source_type === 'wistia' && (
          <WistiaPlayer
            source={selectedSource}
            title={title}
            autoplay={autoplay}
            onError={setError}
          />
        )}

        {selectedSource.source_type === 'vturb' && (
          <VturbPlayer
            source={selectedSource}
            title={title}
            autoplay={autoplay}
            onError={setError}
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
}

// YouTube Player Component
function YouTubePlayer({
  source,
  title,
  autoplay,
  onError,
}: {
  source: VideoSource;
  title?: string;
  autoplay: boolean;
  onError: (error: string) => void;
}) {
  const data = source.source_data as YouTubeSourceData;
  const videoId = data.video_id;

  if (!videoId) {
    onError('ID do vídeo YouTube não encontrado');
    return null;
  }

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&modestbranding=1`;

  return (
    <iframe
      width="100%"
      height="100%"
      src={src}
      title={title || 'YouTube Video'}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  );
}

// Wistia Player Component
function WistiaPlayer({
  source,
  title,
  autoplay,
  onError,
}: {
  source: VideoSource;
  title?: string;
  autoplay: boolean;
  onError: (error: string) => void;
}) {
  const data = source.source_data as WistiaSourceData;
  const mediaId = data.media_id;

  if (!mediaId) {
    onError('ID do vídeo Wistia não encontrado');
    return null;
  }

  // Wistia embed with optional autoplay
  const src = `https://fast.wistia.net/embed/iframe/${mediaId}?autoplay=${autoplay ? 'true' : 'false'}`;

  return (
    <iframe
      src={src}
      title={title || 'Wistia Video'}
      allowFullScreen
      frameBorder="0"
      scrolling="no"
      className="w-full h-full"
      style={{
        display: 'block',
      }}
    />
  );
}

// Vturb Player Component
function VturbPlayer({
  source,
  title,
  autoplay,
  onError,
}: {
  source: VideoSource;
  title?: string;
  autoplay: boolean;
  onError: (error: string) => void;
}) {
  const data = source.source_data as VturbSourceData;
  const playerId = data.player_id;
  const embedCode = data.embed_code;

  if (!playerId && !embedCode) {
    onError('ID ou código do Vturb não encontrado');
    return null;
  }

  // For Vturb, we need to render the embed code directly
  // This is a simplified version - full embed code would be in source_data
  if (embedCode) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: embedCode }}
        className="w-full h-full"
      />
    );
  }

  // Fallback: try to construct iframe from player ID
  const src = `https://app.convertkit.com/courses/${playerId}`;

  return (
    <iframe
      src={src}
      title={title || 'Vturb Video'}
      allowFullScreen
      frameBorder="0"
      scrolling="no"
      className="w-full h-full"
    />
  );
}

// Thumbnail Preview Component (for video cards)
export function VideoThumbnail({
  source,
  sources = [],
  alt = 'Video Thumbnail',
  className = '',
}: {
  source?: VideoSource;
  sources?: VideoSource[];
  alt?: string;
  className?: string;
}) {
  const selectedSource = source || sources.find((s) => s.is_primary) || sources[0];

  if (!selectedSource) {
    return (
      <div className={`bg-gray-300 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-600">Sem thumbnail</span>
      </div>
    );
  }

  const data = selectedSource.source_data;
  let thumbnailUrl: string | null = null;

  if (selectedSource.source_type === 'youtube') {
    thumbnailUrl = (data as YouTubeSourceData).thumbnail;
  } else if (selectedSource.source_type === 'wistia') {
    thumbnailUrl = (data as WistiaSourceData).thumbnail;
  } else if (selectedSource.source_type === 'vturb') {
    thumbnailUrl = (data as VturbSourceData).thumbnail;
  }

  return (
    <div className={`bg-gray-200 rounded-lg overflow-hidden ${className}`}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="16"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
          <span className="text-white text-sm">Vídeo</span>
        </div>
      )}
    </div>
  );
}
