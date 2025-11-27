-- ============================================================================
-- MIGRAR DADOS DO PAPER-DASHBOARD PARA PAPERCRAFTS COM TODOS OS DETALHES
-- ============================================================================

-- Atualizar Turma EdukaBoo (Halloween)
UPDATE public.papercrafts
SET
  theme = 'Halloween',
  gif_url = '/paperlogin/Gif-Turma-Edukaboo.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/1ctOt0vv0wbqJrChVUr7qXm2tecxTOHvw?usp=sharing',
  description = 'A Turma Halloween traz 27 papercrafts exclusivos com guias passo a passo para montar personagens, monstros e decorações divertidas. Cada modelo foi pensado para estimular coordenação motora, foco e criatividade, com montagem simples e resultado encantador.',
  items_json = '[
    {"nº": "00", "nome": "Abobora com Carinhas", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "01", "nome": "Jeff com Cartola", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "02", "nome": "Caveirinha", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "03", "nome": "Dracula", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "04", "nome": "Mini-Morte", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "05", "nome": "Abobora Simples", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Origami"},
    {"nº": "06", "nome": "Abobora", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "07", "nome": "Aranha", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "08", "nome": "Bruxa Elegante", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "09", "nome": "Bruxa", "dificuldade": "Fácil", "faixa_etaria": "5–9 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "10", "nome": "Caveira", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "11", "nome": "Frankenstein", "dificuldade": "Médio", "faixa_etaria": "6–11 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "12", "nome": "Franksteinx", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Halloween", "tipo": "Origami"},
    {"nº": "13", "nome": "Gato Malvado", "dificuldade": "Fácil", "faixa_etaria": "4–9 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "14", "nome": "Gato", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "15", "nome": "Fantasma", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "16", "nome": "Mago", "dificuldade": "Fácil", "faixa_etaria": "4–9 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "17", "nome": "Coruja", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "18", "nome": "Vampirinho", "dificuldade": "Fácil", "faixa_etaria": "5–9 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "19", "nome": "Frankenstein 2", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "20", "nome": "Mumia", "dificuldade": "Médio", "faixa_etaria": "6–11 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "21", "nome": "Morcego", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "22", "nome": "Mulher Gato Turma Halloween", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "23", "nome": "Muminha", "dificuldade": "Fácil", "faixa_etaria": "4–9 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "24", "nome": "Pumpkin", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "25", "nome": "Vampiro", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Halloween", "tipo": "Papercraft"},
    {"nº": "26", "nome": "Casa Halloween", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Halloween", "tipo": "Papercraft"}
  ]'::jsonb
WHERE title = 'Turma EdukaBoo';

-- Atualizar Decoração (Halloween)
UPDATE public.papercrafts
SET
  theme = 'Halloween',
  gif_url = '/paperlogin/DecoracaoGif.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/1FjgGiFowpJ2tZPXbkVKIhhZpRZPun5fm?usp=sharing',
  description = 'Transforme qualquer espaço com nossas 25 decorações temáticas exclusivas! De adornos para festas até peças permanentes para sua sala de aula, cada design foi criado para impressionar. Com instruções passo a passo e materiais acessíveis, suas crianças criarão decorações lindas que podem exibir com orgulho.',
  items_json = '[
    {"nº": "00", "nome": "Moldura Aranha", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "01", "nome": "Super Casa Halloween", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "02", "nome": "Super Casa Halloween Tutorial", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "03", "nome": "Guia Casa Halloween", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "04", "nome": "Casa Halloween", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Decoração", "tipo": "Origami"},
    {"nº": "05", "nome": "Morcego 3D", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "06", "nome": "Morcego 3D Tutorial", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "07", "nome": "Quadro 3D", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Decoração", "tipo": "Papercraft"},
    {"nº": "08", "nome": "Quadro 3D 2", "dificuldade": "Fácil", "faixa_etaria": "5–9 anos", "tema": "Decoração", "tipo": "Papercraft"}
  ]'::jsonb
WHERE title = 'Decoração';

-- Atualizar Histórias (Halloween)
UPDATE public.papercrafts
SET
  theme = 'Halloween',
  gif_url = '/paperlogin/Historinhas.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/1TF5IcqY_ZLF1t0WUs4Y2HANRMo9krP7v?usp=sharing',
  description = 'Explore o lado assustador e intrigante com nossos clássicos do Halloween em desenhos! Cada personagem icônico foi cuidadosamente ilustrado para trazer a atmosfera mágica e misteriosa das histórias de horror à vida. Perfeito para explorar a criatividade e a imaginação, essas peças ajudam as crianças a expressar seu lado criativo enquanto aprendem sobre as lendas clássicas.',
  items_json = '[
    {"nº": "01", "nome": "Drácula", "dificuldade": "Médio", "faixa_etaria": "8–12 anos", "tema": "Clássicos do Halloween", "tipo": "Papercraft"},
    {"nº": "02", "nome": "Ceifador", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Clássicos do Halloween", "tipo": "Papercraft"},
    {"nº": "03", "nome": "Caveira Viva", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Clássicos do Halloween", "tipo": "Papercraft"},
    {"nº": "04", "nome": "Cavaleiro sem Cabeça", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Clássicos do Halloween", "tipo": "Papercraft"}
  ]'::jsonb
WHERE title = 'Histórias';

-- Atualizar Atividades Lúdicas (Halloween)
UPDATE public.papercrafts
SET
  theme = 'Halloween',
  gif_url = '/paperlogin/gif-ludicas.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/18q5zQv6a3PFeFWKQaX7qA3r2esGnJnwM?usp=sharing',
  description = 'Aprenda brincando com nossas 5 atividades lúdicas interativas! Cada proposta foi cuidadosamente criada para desenvolver competências essenciais como raciocínio lógico, coordenação e pensamento criativo. Perfeito para sala de aula ou casa, nossas atividades tornam o aprendizado uma verdadeira aventura cheia de diversão e descobertas.',
  items_json = '[
    {"nº": "01", "nome": "Dona Maria Cesta", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Educativo", "tipo": "Atividade"},
    {"nº": "02", "nome": "Pegador Olho Completo", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Educativo", "tipo": "Atividade"},
    {"nº": "03", "nome": "Oculos de Aventura", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Educativo", "tipo": "Atividade"},
    {"nº": "04", "nome": "O Corvo", "dificuldade": "Fácil", "faixa_etaria": "5–9 anos", "tema": "Educativo", "tipo": "Atividade"},
    {"nº": "05", "nome": "Mini Caixoes", "dificuldade": "Médio", "faixa_etaria": "7–10 anos", "tema": "Educativo", "tipo": "Atividade"},
    {"nº": "06", "nome": "Moldura de Aranha 3D", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Educativo", "tipo": "Atividade"}
  ]'::jsonb
WHERE title = 'Atividades Lúdicas';

-- Atualizar Kit Básico Natalino
UPDATE public.papercrafts
SET
  theme = 'Natal',
  gif_url = '/Natal/Gif-Basico.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/1V90nnrd40jXu_IiVobVUmgAHqmMKrH0F?usp=sharing',
  description = 'Inclui personagens clássicos, bonequinhos de neve, enfeites e projetos fáceis para começar a brincar imediatamente. Perfeito para quem deseja introduzir o universo do papercraft com simplicidade e resultados lindos!',
  items_json = '[
    {"nº": "01", "nome": "Personagens de Natal", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "02", "nome": "Combo Bonequinhos de Neve", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "03", "nome": "Corrente de Papel Coloridas", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "04", "nome": "Globo de Neve 3D para Colorir", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "05", "nome": "Coroa de Natal 3D", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Natal", "tipo": "Papercraft"}
  ]'::jsonb
WHERE title = 'Kit Básico Natalino';

-- Atualizar Kit Completo Natal
UPDATE public.papercrafts
SET
  theme = 'Natal',
  gif_url = '/Natal/Gif-Completo.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/12N4qvr3v1q_5mYSzNdVolSR1C5W8z7SI?usp=sharing',
  description = 'A experiência natalina completa! Mais de 60 papercrafts e cenários em 3D, com personagens, casas, vilas e kits especiais para montar um verdadeiro mundo mágico de Natal em papel. Perfeito para quem deseja introduzir o universo do papercraft com simplicidade e resultados lindos!',
  items_json = '[
    {"nº": "01", "nome": "Personagens de Natal", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "02", "nome": "Combo Bonequinhos de Neve", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "03", "nome": "Corrente de Papel Coloridas", "dificuldade": "Fácil", "faixa_etaria": "4–8 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "04", "nome": "Globo de Neve 3D para Colorir", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "05", "nome": "Coroa de Natal 3D", "dificuldade": "Médio", "faixa_etaria": "6–10 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "06", "nome": "Avião do Papai Noel", "dificuldade": "Médio", "faixa_etaria": "6–11 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "07", "nome": "Casa do Papai Noel", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "08", "nome": "Gorro do Papai Noel 3D", "dificuldade": "Fácil", "faixa_etaria": "5–10 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "09", "nome": "Cenário de Inverno 3D", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "10", "nome": "Mini Livro de Natal 3D", "dificuldade": "Médio", "faixa_etaria": "7–12 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "11", "nome": "Globo de Neve 3D (versão 2)", "dificuldade": "Médio", "faixa_etaria": "6–11 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "12", "nome": "Vila de Natal — Casas, Lojas, Igreja e Personagens", "dificuldade": "Difícil", "faixa_etaria": "8–12 anos", "tema": "Natal", "tipo": "Papercraft"}
  ]'::jsonb
WHERE title = 'Kit Completo Natal';

-- Atualizar Bônus Natalinos
UPDATE public.papercrafts
SET
  theme = 'Natal',
  gif_url = '/Natal/Gif-Bonus.gif',
  drive_folder_url = 'https://drive.google.com/drive/folders/1mzQtnYYc1itojKpkcq1DyL3AZyDcX5sS?usp=sharing',
  description = 'Surpresas encantadoras que dão um toque especial ao Natal! Inclui kits temáticos como o Nascimento de Jesus, brincadeiras educativas e caixas-presente para montar e usar. Perfeito para quem quer mais do que atividades — quer memórias afetivas. 💛🎁',
  items_json = '[
    {"nº": "01", "nome": "Nascimento de Jesus (Presépio Papercraft)", "dificuldade": "Médio", "faixa_etaria": "6–12 anos", "tema": "Natal", "tipo": "Papercraft"},
    {"nº": "02", "nome": "Trenó do Papai Noel + Atividades de Natal", "dificuldade": "Médio", "faixa_etaria": "6–12 anos", "tema": "Natal", "tipo": "Atividade"},
    {"nº": "03", "nome": "Caixa de Presente Bichinhos (Para Colorir / Colorido)", "dificuldade": "Fácil", "faixa_etaria": "4–10 anos", "tema": "Natal", "tipo": "Papercraft"}
  ]'::jsonb
WHERE title = 'Bônus Natalinos';

-- ============================================================================
-- VERIFICAR SE FOI TUDO ATUALIZADO CORRETAMENTE
-- ============================================================================
SELECT
  id,
  title,
  theme,
  difficulty,
  CASE
    WHEN gif_url IS NOT NULL THEN '✅ GIF'
    ELSE '❌ Sem GIF'
  END as status_gif,
  CASE
    WHEN drive_folder_url IS NOT NULL THEN '✅ Drive URL'
    ELSE '❌ Sem Drive'
  END as status_drive,
  CASE
    WHEN items_json IS NOT NULL THEN jsonb_array_length(items_json) || ' items'
    ELSE '❌ Sem items'
  END as items_count
FROM public.papercrafts
ORDER BY theme, title;
