-- STEP 1: Ensure available_for_plans column exists on all item tables
ALTER TABLE atividades ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE bonus ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE papercrafts ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];

-- STEP 2: Migrate data from junction tables to available_for_plans (FIXED VERSION)
UPDATE atividades
SET available_for_plans = COALESCE(
  (SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
   FROM plan_atividades
   WHERE atividade_id = atividades.id),
  '{}'::INTEGER[]
)
WHERE id IN (SELECT DISTINCT atividade_id FROM plan_atividades);

UPDATE videos
SET available_for_plans = COALESCE(
  (SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
   FROM plan_videos
   WHERE video_id = videos.id),
  '{}'::INTEGER[]
)
WHERE id IN (SELECT DISTINCT video_id FROM plan_videos);

UPDATE bonus
SET available_for_plans = COALESCE(
  (SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
   FROM plan_bonus
   WHERE bonus_id = bonus.id),
  '{}'::INTEGER[]
)
WHERE id IN (SELECT DISTINCT bonus_id FROM plan_bonus);

UPDATE papercrafts
SET available_for_plans = COALESCE(
  (SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
   FROM plan_papercrafts
   WHERE papercraft_id = papercrafts.id),
  '{}'::INTEGER[]
)
WHERE id IN (SELECT DISTINCT papercraft_id FROM plan_papercrafts);

-- STEP 3: Remove legacy plano_minimo column from all item tables
ALTER TABLE atividades DROP COLUMN IF EXISTS plano_minimo CASCADE;
ALTER TABLE videos DROP COLUMN IF EXISTS plano_minimo CASCADE;
ALTER TABLE bonus DROP COLUMN IF EXISTS plano_minimo CASCADE;

-- STEP 4: Verify migration results
SELECT
  'atividades' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM atividades;

SELECT
  'videos' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM videos;

SELECT
  'bonus' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM bonus;

SELECT
  'papercrafts' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM papercrafts;

-- Show items without plans
SELECT 'atividades' as table_name, id, titulo FROM atividades WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
SELECT 'videos' as table_name, id, titulo FROM videos WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
SELECT 'bonus' as table_name, id, titulo FROM bonus WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
SELECT 'papercrafts' as table_name, id, title FROM papercrafts WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
