-- ================================================================
-- MIGRATION SQL FOR SOLUTION 1: CLEAN ARRAY APPROACH
-- ================================================================
-- This migration consolidates access control to use ONLY available_for_plans
-- Removes: plano_minimo (legacy), available_for_plans (if missing)
-- Migrates: junction table data to available_for_plans arrays
-- ================================================================

-- STEP 1: Ensure available_for_plans column exists on all item tables
-- ================================================================

ALTER TABLE atividades ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE bonus ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE papercrafts ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];

-- STEP 2: Migrate data from junction tables to available_for_plans
-- ================================================================
-- This populates available_for_plans based on current junction table assignments

-- Migrate plan_atividades to atividades.available_for_plans
UPDATE atividades
SET available_for_plans = (
  SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
  FROM plan_atividades
  WHERE atividade_id = atividades.id
)
WHERE id IN (SELECT DISTINCT atividade_id FROM plan_atividades);

-- Migrate plan_videos to videos.available_for_plans
UPDATE videos
SET available_for_plans = (
  SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
  FROM plan_videos
  WHERE video_id = videos.id
)
WHERE id IN (SELECT DISTINCT video_id FROM plan_videos);

-- Migrate plan_bonus to bonus.available_for_plans
UPDATE bonus
SET available_for_plans = (
  SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
  FROM plan_bonus
  WHERE bonus_id = bonus.id
)
WHERE id IN (SELECT DISTINCT bonus_id FROM plan_bonus);

-- Migrate plan_papercrafts to papercrafts.available_for_plans
UPDATE papercrafts
SET available_for_plans = (
  SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
  FROM plan_papercrafts
  WHERE papercraft_id = papercrafts.id
)
WHERE id IN (SELECT DISTINCT papercraft_id FROM plan_papercrafts);

-- STEP 3: Remove legacy plano_minimo column from all item tables
-- ================================================================
-- These columns are no longer used (SYSTEM A deprecated)

ALTER TABLE atividades DROP COLUMN IF EXISTS plano_minimo CASCADE;
ALTER TABLE videos DROP COLUMN IF EXISTS plano_minimo CASCADE;
ALTER TABLE bonus DROP COLUMN IF EXISTS plano_minimo CASCADE;

-- Note: papercrafts may not have plano_minimo, so we use IF EXISTS

-- STEP 4: Verify migration results
-- ================================================================
-- Run these queries to verify the migration worked correctly

-- Check atividades migration
SELECT
  'atividades' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM atividades;

-- Check videos migration
SELECT
  'videos' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM videos;

-- Check bonus migration
SELECT
  'bonus' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM bonus;

-- Check papercrafts migration
SELECT
  'papercrafts' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN available_for_plans IS NULL OR available_for_plans = '{}' THEN 1 END) as items_without_plans,
  COUNT(CASE WHEN available_for_plans IS NOT NULL AND array_length(available_for_plans, 1) > 0 THEN 1 END) as items_with_plans
FROM papercrafts;

-- Show items without plan assignments (need manual assignment)
SELECT 'atividades' as table_name, id, titulo FROM atividades WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
SELECT 'videos' as table_name, id, titulo FROM videos WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
SELECT 'bonus' as table_name, id, titulo FROM bonus WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;
SELECT 'papercrafts' as table_name, id, title FROM papercrafts WHERE available_for_plans IS NULL OR available_for_plans = '{}' LIMIT 10;

-- STEP 5: Optional - Archive junction tables (don't delete, keep for reference)
-- ================================================================
-- Uncomment these lines if you want to archive the junction tables
-- DO NOT execute these if you're not sure!

-- ALTER TABLE plan_atividades RENAME TO plan_atividades_ARCHIVED;
-- ALTER TABLE plan_videos RENAME TO plan_videos_ARCHIVED;
-- ALTER TABLE plan_bonus RENAME TO plan_bonus_ARCHIVED;
-- ALTER TABLE plan_papercrafts RENAME TO plan_papercrafts_ARCHIVED;

-- STEP 6: Optional - Drop plan_features table if not used
-- ================================================================
-- This table is no longer used with Solution 1
-- Uncomment if you want to remove it

-- DROP TABLE IF EXISTS plan_features CASCADE;

-- ================================================================
-- END OF MIGRATION
-- ================================================================
-- After this migration:
-- ✅ available_for_plans is the ONLY source of truth
-- ✅ Items migrated from junction tables have correct plans assigned
-- ✅ Items not in any junction table have empty available_for_plans (need manual assignment)
-- ✅ plano_minimo field removed (legacy system A deprecated)
-- ❌ Junction tables still exist (archived) - can be deleted later if desired
-- ================================================================
