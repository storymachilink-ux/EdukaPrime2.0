-- ============================================
-- MIGRATION: Add video_sources table
-- ============================================
--
-- Suporta múltiplas plataformas de vídeo:
-- - YouTube
-- - Wistia
-- - Vturb
--
-- Permite um vídeo ter múltiplas fontes com fallback
--
-- ============================================

-- [1] Criar tabela video_sources
CREATE TABLE IF NOT EXISTS public.video_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,

  -- Tipo de fonte: 'youtube' | 'wistia' | 'vturb'
  source_type VARCHAR(50) NOT NULL,

  -- Dados específicos de cada plataforma (JSON)
  -- YouTube: { video_id, url, thumbnail }
  -- Wistia: { media_id, embed_code, thumbnail }
  -- Vturb: { player_id, embed_code, thumbnail }
  source_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Indica qual fonte usar como padrão
  is_primary BOOLEAN NOT NULL DEFAULT true,

  -- Controle de criação/atualização
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Garantir uma source por tipo por vídeo
  UNIQUE(video_id, source_type)
);

-- [2] Índices para performance
CREATE INDEX IF NOT EXISTS idx_video_sources_video_id
  ON public.video_sources(video_id);

CREATE INDEX IF NOT EXISTS idx_video_sources_type
  ON public.video_sources(source_type);

CREATE INDEX IF NOT EXISTS idx_video_sources_primary
  ON public.video_sources(video_id)
  WHERE is_primary = true;

-- [3] Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_video_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_video_sources_updated_at
  ON public.video_sources;

CREATE TRIGGER trigger_update_video_sources_updated_at
  BEFORE UPDATE ON public.video_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_video_sources_updated_at();

-- [4] RLS (Row Level Security)
ALTER TABLE public.video_sources ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler
DROP POLICY IF EXISTS "Video sources are readable by everyone" ON public.video_sources;
CREATE POLICY "Video sources are readable by everyone"
  ON public.video_sources
  FOR SELECT
  USING (true);

-- Política: Só admin (via RPC ou service role) pode inserir/atualizar/deletar
DROP POLICY IF EXISTS "Video sources can only be modified by service role" ON public.video_sources;
CREATE POLICY "Video sources can only be modified by service role"
  ON public.video_sources
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Video sources can only be updated by service role" ON public.video_sources;
CREATE POLICY "Video sources can only be updated by service role"
  ON public.video_sources
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Video sources can only be deleted by service role" ON public.video_sources;
CREATE POLICY "Video sources can only be deleted by service role"
  ON public.video_sources
  FOR DELETE
  USING (auth.role() = 'service_role');

-- [5] RPC: Criar ou atualizar uma video_source
CREATE OR REPLACE FUNCTION create_or_update_video_source(
  p_video_id UUID,
  p_source_type VARCHAR,
  p_source_data JSONB,
  p_is_primary BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  source_type VARCHAR,
  is_primary BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_source_id UUID;
BEGIN
  -- Se é primary, desmarcar outras
  IF p_is_primary THEN
    UPDATE public.video_sources
    SET is_primary = false
    WHERE video_id = p_video_id AND source_type != p_source_type;
  END IF;

  -- Inserir ou atualizar
  INSERT INTO public.video_sources (
    video_id,
    source_type,
    source_data,
    is_primary
  ) VALUES (
    p_video_id,
    p_source_type,
    p_source_data,
    p_is_primary
  )
  ON CONFLICT (video_id, source_type)
  DO UPDATE SET
    source_data = p_source_data,
    is_primary = p_is_primary,
    updated_at = NOW()
  RETURNING
    video_sources.id,
    video_sources.source_type,
    video_sources.is_primary,
    video_sources.created_at
  INTO id, source_type, is_primary, created_at;

  RETURN QUERY SELECT id, source_type, is_primary, created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_or_update_video_source(UUID, VARCHAR, JSONB, BOOLEAN)
  TO authenticated;

-- [6] RPC: Obter todos os sources de um vídeo
CREATE OR REPLACE FUNCTION get_video_sources(
  p_video_id UUID
)
RETURNS TABLE (
  id UUID,
  source_type VARCHAR,
  source_data JSONB,
  is_primary BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vs.id,
    vs.source_type,
    vs.source_data,
    vs.is_primary,
    vs.created_at,
    vs.updated_at
  FROM public.video_sources vs
  WHERE vs.video_id = p_video_id
  ORDER BY vs.is_primary DESC, vs.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_video_sources(UUID)
  TO authenticated;

-- [7] RPC: Obter source primária de um vídeo
CREATE OR REPLACE FUNCTION get_primary_video_source(
  p_video_id UUID
)
RETURNS TABLE (
  id UUID,
  source_type VARCHAR,
  source_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vs.id,
    vs.source_type,
    vs.source_data,
    vs.created_at
  FROM public.video_sources vs
  WHERE vs.video_id = p_video_id
    AND vs.is_primary = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_primary_video_source(UUID)
  TO authenticated;

-- [8] RPC: Deletar um video_source
CREATE OR REPLACE FUNCTION delete_video_source(
  p_source_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR
) AS $$
DECLARE
  v_was_primary BOOLEAN;
  v_video_id UUID;
BEGIN
  -- Buscar info da source antes de deletar
  SELECT is_primary, video_id INTO v_was_primary, v_video_id
  FROM public.video_sources
  WHERE id = p_source_id;

  -- Se não encontrou
  IF v_was_primary IS NULL THEN
    RETURN QUERY SELECT false, 'Video source não encontrada'::VARCHAR;
    RETURN;
  END IF;

  -- Deletar
  DELETE FROM public.video_sources WHERE id = p_source_id;

  -- Se deletou a primária, marcar outra como primária (se existir)
  IF v_was_primary THEN
    UPDATE public.video_sources
    SET is_primary = true
    WHERE video_id = v_video_id AND is_primary = false;
  END IF;

  RETURN QUERY SELECT true, 'Video source deletada com sucesso'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_video_source(UUID)
  TO authenticated;

-- [9] COMMENT: Documentação
COMMENT ON TABLE public.video_sources IS 'Armazena múltiplas fontes de vídeo para cada vídeo (YouTube, Wistia, Vturb)';
COMMENT ON COLUMN public.video_sources.source_type IS 'Tipo de plataforma: youtube | wistia | vturb';
COMMENT ON COLUMN public.video_sources.source_data IS 'JSON com dados específicos da plataforma';
COMMENT ON COLUMN public.video_sources.is_primary IS 'Se true, é a fonte padrão a usar';
