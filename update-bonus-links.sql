-- Script SQL para corrigir os links da área Bonus
-- Execute este script no SQL Editor do Supabase Dashboard

-- Atualizar links dos materiais bonus com os links corretos do Google Drive
UPDATE public.bonus SET drive_url = 'https://drive.google.com/file/d/1NP6CZTaiQ6M7lEbSksGXTH3d20W9kUKJ/view', updated_at = now()
WHERE title = 'Conto de Páscoa em Formato de Dado';

UPDATE public.bonus SET drive_url = 'https://drive.google.com/file/d/1TWvsDfBGOm3wtURCQFTgGf8UagGM5KP8/view', updated_at = now()
WHERE title = 'Animais Terrestres, Aquáticos e Aéreos';

UPDATE public.bonus SET drive_url = 'https://drive.google.com/file/d/1eG8tzZLs-IwnUj466uEtX2R8SZ8xAcmz/view', updated_at = now()
WHERE title = 'Planejamento de Aulas — Guia Completo';

UPDATE public.bonus SET drive_url = 'https://drive.google.com/file/d/1pKhQvhM3j4anUJBCey0L56AlwkLc6aDG/view', updated_at = now()
WHERE title = 'Caderno de Jogos — +30 Atividades';

-- Verificar se as atualizações foram aplicadas
SELECT title, drive_url, updated_at FROM public.bonus
WHERE title IN (
  'Conto de Páscoa em Formato de Dado',
  'Animais Terrestres, Aquáticos e Aéreos',
  'Planejamento de Aulas — Guia Completo',
  'Caderno de Jogos — +30 Atividades'
)
ORDER BY title;