SELECT id, title, is_active, created_at FROM papercrafts WHERE is_active = false ORDER BY created_at DESC;

SELECT id, title, is_active, created_at FROM papercrafts ORDER BY created_at DESC LIMIT 15;
