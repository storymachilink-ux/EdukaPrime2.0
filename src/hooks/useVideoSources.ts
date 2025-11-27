import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { VideoSource, SourceType, SourceData, YouTubeSourceData } from '../types';

export function useVideoSources(videoId?: string) {
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [primarySource, setPrimarySource] = useState<VideoSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sources for a video
  const fetchVideoSources = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase.rpc('get_video_sources', {
        p_video_id: id,
      });

      if (err) throw err;

      setSources(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar fontes de vídeo';
      setError(message);
      console.error('Error fetching video sources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch only primary source
  const fetchPrimarySource = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const { data, error: err } = await supabase.rpc('get_primary_video_source', {
        p_video_id: id,
      });

      if (err) throw err;

      if (data) {
        setPrimarySource(data);
      }
    } catch (err) {
      console.error('Error fetching primary source:', err);
    }
  }, []);

  // Create or update a video source
  const createOrUpdateSource = useCallback(
    async (
      id: string,
      sourceType: SourceType,
      sourceData: SourceData,
      isPrimary = true
    ) => {
      setError(null);

      try {
        const { data, error: err } = await supabase.rpc(
          'create_or_update_video_source',
          {
            p_video_id: id,
            p_source_type: sourceType,
            p_source_data: sourceData,
            p_is_primary: isPrimary,
          }
        );

        if (err) throw err;

        // Refresh sources list
        await fetchVideoSources(id);
        await fetchPrimarySource(id);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar fonte de vídeo';
        setError(message);
        console.error('Error creating/updating source:', err);
        throw err;
      }
    },
    [fetchVideoSources, fetchPrimarySource]
  );

  // Delete a video source
  const deleteSource = useCallback(
    async (sourceId: string, videoId: string) => {
      setError(null);

      try {
        const { data, error: err } = await supabase.rpc('delete_video_source', {
          p_source_id: sourceId,
        });

        if (err) throw err;

        // Refresh sources list
        await fetchVideoSources(videoId);
        await fetchPrimarySource(videoId);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao deletar fonte de vídeo';
        setError(message);
        console.error('Error deleting source:', err);
        throw err;
      }
    },
    [fetchVideoSources, fetchPrimarySource]
  );

  // Helper: Extract YouTube ID from URL
  const extractYouTubeId = useCallback((url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  }, []);

  // Helper: Create YouTube source from URL
  const addYouTubeSource = useCallback(
    async (videoId: string, youtubeUrl: string, isPrimary = true) => {
      const youtubeId = extractYouTubeId(youtubeUrl);

      if (!youtubeId) {
        setError('URL do YouTube inválida');
        throw new Error('URL do YouTube inválida');
      }

      const sourceData: YouTubeSourceData = {
        video_id: youtubeId,
        url: youtubeUrl,
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      };

      return createOrUpdateSource(videoId, 'youtube', sourceData, isPrimary);
    },
    [extractYouTubeId, createOrUpdateSource]
  );

  // Initialize on mount if videoId provided
  const initialize = useCallback(async (id: string) => {
    await fetchVideoSources(id);
    await fetchPrimarySource(id);
  }, [fetchVideoSources, fetchPrimarySource]);

  return {
    sources,
    primarySource,
    loading,
    error,
    fetchVideoSources,
    fetchPrimarySource,
    createOrUpdateSource,
    deleteSource,
    addYouTubeSource,
    extractYouTubeId,
    initialize,
  };
}
