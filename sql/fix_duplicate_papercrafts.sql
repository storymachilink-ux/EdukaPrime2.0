-- ============================================================================
-- REMOVER DUPLICATAS DE PAPERCRAFTS
-- ============================================================================

-- Identifica e remove as duplicatas, mantendo apenas o registro mais recente
DELETE FROM public.papercrafts
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM public.papercrafts
  ORDER BY title, created_at DESC
);

-- Verifica quantos papercrafts restaram
SELECT COUNT(*) as total_papercrafts,
       COUNT(DISTINCT title) as unique_titles
FROM public.papercrafts;

-- Lista todos os papercrafts únicos
SELECT id, title, category, difficulty, min_age, max_age
FROM public.papercrafts
ORDER BY created_at DESC;
