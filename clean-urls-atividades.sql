-- Script para limpar URLs com espaços e caracteres inválidos
-- Execute PRIMEIRO este script para limpar URLs problemáticas

-- Limpar espaços nas URLs existentes
UPDATE public.atividades
SET drive_url = TRIM(REPLACE(drive_url, ' ', '')), updated_at = now()
WHERE drive_url LIKE '% %';

-- Verificar URLs problemáticas antes da limpeza
SELECT title, drive_url, LENGTH(drive_url) as url_length
FROM public.atividades
WHERE drive_url LIKE '%20%'
   OR drive_url LIKE '% %'
   OR LENGTH(drive_url) > 100;

-- Depois execute o update-links-atividades.sql para corrigir com as URLs certas