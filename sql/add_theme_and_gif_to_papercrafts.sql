-- ============================================================================
-- ADICIONAR CAMPOS THEME E GIF_URL À TABELA PAPERCRAFTS
-- ============================================================================

-- Adicionar coluna theme (Halloween, Natal, etc)
ALTER TABLE public.papercrafts
ADD COLUMN IF NOT EXISTS theme VARCHAR(100);

-- Adicionar coluna gif_url para a imagem animada do modal
ALTER TABLE public.papercrafts
ADD COLUMN IF NOT EXISTS gif_url TEXT;

-- Adicionar coluna items_json para armazenar a lista de papers da coleção
ALTER TABLE public.papercrafts
ADD COLUMN IF NOT EXISTS items_json JSONB;

-- Criar comentários descritivos
COMMENT ON COLUMN public.papercrafts.theme IS 'Tema da coleção: Natal, Halloween, etc';
COMMENT ON COLUMN public.papercrafts.gif_url IS 'URL do GIF animado que mostra na página de detalhes';
COMMENT ON COLUMN public.papercrafts.items_json IS 'JSON com lista de papers dentro da coleção com estrutura: [{nº, nome, dificuldade, faixa_etaria, tipo}, ...]';

-- Criar índice para melhor performance ao filtrar por tema
CREATE INDEX IF NOT EXISTS idx_papercrafts_theme ON public.papercrafts(theme);

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- 1. theme: Será usado para filtrar as coleções (Natal, Halloween, etc)
-- 2. gif_url: Substitui image_url no modal para mostrar versão animada
-- 3. items_json: Armazena a estrutura detalhada dos papers da coleção
