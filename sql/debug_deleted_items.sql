SELECT 'atividades' as tabela, COUNT(*) as total, MAX(created_at) as ultima
FROM atividades
UNION ALL
SELECT 'videos' as tabela, COUNT(*) as total, MAX(created_at) as ultima
FROM videos
UNION ALL
SELECT 'bonus' as tabela, COUNT(*) as total, MAX(created_at) as ultima
FROM bonus
UNION ALL
SELECT 'papercrafts' as tabela, COUNT(*) as total, MAX(created_at) as ultima
FROM papercrafts;

SELECT a.id, a.titulo, a.created_at FROM atividades a ORDER BY a.created_at DESC LIMIT 15;

SELECT v.id, v.titulo, v.created_at FROM videos v ORDER BY v.created_at DESC LIMIT 15;

SELECT b.id, b.titulo, b.created_at FROM bonus b ORDER BY b.created_at DESC LIMIT 15;
