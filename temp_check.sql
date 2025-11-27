-- VALIDAÇÃO RÁPIDA: Dados migrados?
SELECT COUNT(*) as total_video_sources FROM public.video_sources;

-- Verificar se tem dados de YouTube
SELECT source_type, COUNT(*) as quantidade
FROM public.video_sources
GROUP BY source_type;

-- Exemplo de uma source
SELECT * FROM public.video_sources LIMIT 1;
