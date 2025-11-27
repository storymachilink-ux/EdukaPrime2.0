-- ============================================
-- TEST SCRIPT: Video Sources
-- ============================================
--
-- Execute este script DEPOIS da migration
-- para validar que tudo está funcionando
--
-- ============================================

-- [1] Verificar que tabela foi criada
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'video_sources'
ORDER BY ordinal_position;

-- Resultado esperado:
-- video_sources | id | uuid
-- video_sources | video_id | uuid
-- video_sources | source_type | character varying
-- video_sources | source_data | jsonb
-- video_sources | is_primary | boolean
-- video_sources | created_at | timestamp with time zone
-- video_sources | updated_at | timestamp with time zone

-- =========================================

-- [2] Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'video_sources';

-- Resultado esperado:
-- video_sources_pkey
-- idx_video_sources_video_id
-- idx_video_sources_type
-- idx_video_sources_primary

-- =========================================

-- [3] Verificar RLS está ativado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'video_sources';

-- Resultado esperado:
-- video_sources | t (true = RLS ativado)

-- =========================================

-- [4] Verificar RLS policies
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'video_sources';

-- Resultado esperado:
-- Video sources are readable by everyone | SELECT
-- Video sources can only be modified by service role | INSERT
-- Video sources can only be updated by service role | UPDATE
-- Video sources can only be deleted by service role | DELETE

-- =========================================

-- [5] Verificar dados migrados (se houver)
SELECT
  COUNT(*) as total_sources,
  COUNT(CASE WHEN source_type = 'youtube' THEN 1 END) as youtube_sources,
  COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_sources
FROM public.video_sources;

-- Resultado esperado:
-- Se havia vídeos com youtube_url, haverá registros aqui

-- =========================================

-- [6] Teste: Inserir uma fonte YouTube
-- ⚠️ Substituir 'VIDEO_ID_AQUI' por um UUID válido de um vídeo existente

-- Primeiro, encontrar um vídeo válido
SELECT id, title FROM public.videos LIMIT 1;

-- Copiar o ID retornado e usar abaixo:
-- Exemplo: SELECT * FROM create_or_update_video_source(
--   'COPIE_O_ID_AQUI'::uuid,
--   'youtube',
--   jsonb_build_object(
--     'video_id', 'dQw4w9WgXcQ',
--     'url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
--     'thumbnail', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
--   ),
--   true
-- );

-- =========================================

-- [7] Teste: Obter todas as sources de um vídeo
-- Substituir 'VIDEO_ID_AQUI' por um UUID

-- SELECT * FROM get_video_sources('VIDEO_ID_AQUI'::uuid);

-- =========================================

-- [8] Teste: Obter source primária
-- SELECT * FROM get_primary_video_source('VIDEO_ID_AQUI'::uuid);

-- =========================================

-- [9] Verificar integridade de dados
-- Mostrar vídeos que não têm sources (deve estar vazio ou com razão válida)
SELECT
  v.id,
  v.title,
  (SELECT COUNT(*) FROM public.video_sources WHERE video_id = v.id) as source_count
FROM public.videos v
WHERE (SELECT COUNT(*) FROM public.video_sources WHERE video_id = v.id) = 0
LIMIT 10;

-- Se houver vídeos sem sources, executar migração manualmente:
-- INSERT INTO public.video_sources (video_id, source_type, source_data, is_primary)
-- SELECT
--   id,
--   'youtube',
--   jsonb_build_object(
--     'video_id', (regexp_match(youtube_url, '(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)', 'g'))[1],
--     'url', youtube_url,
--     'thumbnail', COALESCE(thumbnail, '')
--   ),
--   true
-- FROM public.videos
-- WHERE youtube_url IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM public.video_sources
--     WHERE video_id = videos.id AND source_type = 'youtube'
--   );

-- =========================================

-- [10] Verificação final: Contar tudo
SELECT
  (SELECT COUNT(*) FROM public.videos) as total_videos,
  (SELECT COUNT(*) FROM public.video_sources) as total_sources,
  (SELECT COUNT(DISTINCT video_id) FROM public.video_sources) as videos_with_sources,
  (SELECT COUNT(*) FROM public.video_sources WHERE is_primary = true) as primary_sources
AS "Summary";

-- =========================================

-- [11] QUERY de TESTE RÁPIDO:
-- Mostrar 5 vídeos com suas sources
SELECT
  v.id,
  v.title,
  vs.source_type,
  vs.source_data->>'video_id' as video_id,
  vs.is_primary
FROM public.videos v
LEFT JOIN public.video_sources vs ON v.id = vs.video_id
LIMIT 5;

-- =========================================

-- RESULTADO ESPERADO:
-- ✅ Tabela criada
-- ✅ Índices criados
-- ✅ RLS ativado
-- ✅ Policies criadas
-- ✅ Dados migrados
-- ✅ RPCs funcionando
