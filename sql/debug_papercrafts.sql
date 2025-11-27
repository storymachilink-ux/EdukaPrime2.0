SELECT COUNT(*) as total_papercrafts FROM papercrafts;

SELECT id, title, created_at, is_active FROM papercrafts ORDER BY created_at DESC LIMIT 20;

SELECT 'Órfãs em plan_papercrafts' as tipo, COUNT(*) as count
FROM plan_papercrafts pp
WHERE pp.papercraft_id NOT IN (SELECT id FROM papercrafts);

SELECT plan_id, papercraft_id FROM plan_papercrafts
WHERE papercraft_id NOT IN (SELECT id FROM papercrafts)
LIMIT 10;
