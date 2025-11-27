-- Script SQL simples para atualizar apenas os links das atividades existentes
-- Execute este script no SQL Editor do Supabase Dashboard

-- Atualizar links das atividades existentes com os links corretos do Google Drive
UPDATE public.atividades SET drive_url = 'https://drive.google.com/drive/folders/1jPO2rcf0JTExMV3ygEmD00LaSrl64Vyn', updated_at = now()
WHERE title = 'Atividades Fonéticas';

UPDATE public.atividades SET drive_url = 'https://drive.google.com/drive/folders/1cJyhpEAGsS188IKnqI8k5BDN4knSUEu-', updated_at = now()
WHERE title = 'Método Numérico Infantil – Matemática Inicial';

UPDATE public.atividades SET drive_url = 'https://drive.google.com/file/d/15JzN0qH0c0mluXlHI7nfoSdwwfFx6wVD/view', updated_at = now()
WHERE title = 'Atividades de Ortografia';

UPDATE public.atividades SET drive_url = 'https://drive.google.com/file/d/1y9l1oK1xB-lowpqs053ahdRhwmJSdiYj/view', updated_at = now()
WHERE title = 'Atividades de Gramática';

UPDATE public.atividades SET drive_url = 'https://drive.google.com/file/d/1XVjvHgbAGh1z6kqSmdUUEgAY-xh0rdhu/view', updated_at = now()
WHERE title = 'Atividades de Interpretação de Texto';

UPDATE public.atividades SET drive_url = 'https://drive.google.com/file/d/1GooGfBmTNVbWz59KvR35HXLWxcYcjng1/view', updated_at = now()
WHERE title = 'Atividades de Gênero Textual';

UPDATE public.atividades SET drive_url = 'https://drive.google.com/file/d/1nJ-gqn6vL_mj6y7znaMu2bfgbIba5Z5A/view', updated_at = now()
WHERE title = 'Coletânea de Textos Literários';

-- Verificar se as atualizações foram aplicadas
SELECT title, drive_url, updated_at FROM public.atividades
WHERE title IN (
  'Atividades Fonéticas',
  'Método Numérico Infantil – Matemática Inicial',
  'Atividades de Ortografia',
  'Atividades de Gramática',
  'Atividades de Interpretação de Texto',
  'Atividades de Gênero Textual',
  'Coletânea de Textos Literários'
)
ORDER BY title;