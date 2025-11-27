console.log('SQL para criar tabelas e migrar todo o conteúdo hardcoded para o database:')
console.log(`

-- =====================================================
-- CRIAÇÃO COMPLETA DE TABELAS + MIGRAÇÃO DE CONTEÚDO
-- Execute no Supabase Dashboard: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql
-- =====================================================

-- PRIMEIRO: CRIAR TODAS AS TABELAS DE CONTEÚDO
-- TABELA ATIVIDADES
CREATE TABLE IF NOT EXISTS public.atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  age_range TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  niche TEXT,
  drive_url TEXT NOT NULL,
  available_for_plans INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3],
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA VIDEOS
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT NOT NULL,
  duration TEXT,
  available_for_plans INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3],
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA BONUS
CREATE TABLE IF NOT EXISTS public.bonus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  available_for_plans INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3],
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus ENABLE ROW LEVEL SECURITY;

-- POLITICAS PARA ACESSO PUBLICO DE LEITURA
CREATE POLICY "Todos podem ver atividades" ON public.atividades FOR SELECT USING (true);
CREATE POLICY "Todos podem ver videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Todos podem ver bonus" ON public.bonus FOR SELECT USING (true);

-- POLITICAS PARA ADMIN (plano >= 5) GERENCIAR CONTEUDO
CREATE POLICY "Admin pode gerenciar atividades" ON public.atividades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.plano_ativo >= 5
    )
  );

CREATE POLICY "Admin pode gerenciar videos" ON public.videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.plano_ativo >= 5
    )
  );

CREATE POLICY "Admin pode gerenciar bonus" ON public.bonus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.plano_ativo >= 5
    )
  );

-- SEGUNDO: MIGRAR TODO O CONTEÚDO HARDCODED

-- INSERIR TODAS AS ATIVIDADES HARDCODED
INSERT INTO public.atividades (title, age_range, description, image, category, niche, drive_url, available_for_plans) VALUES
('Atividades de Fonética – Caderno N1, N2 e N3',
 '4 a 6 anos (Pré-escola e início do 1º ano)',
 'Atividades de fonética desenvolvidas para estimular a consciência sonora e facilitar o processo de leitura. As crianças aprendem a reconhecer, diferenciar e combinar sons das palavras de forma divertida e prática.',
 '/fonetica.jpg',
 'Leitura Inicial',
 'Fonética',
 'https://drive.google.com/drive/folders/1jPO2rcf0JTExMV3ygEmD00LaSrl64Vyn?usp=sharing',
 ARRAY[1,2,3]),

('Método Numérico Infantil – Matemática Inicial',
 '4 a 6 anos (Pré-escola e início do 1º ano)',
 'Atividades de matemática com método lúdico e infantil, voltadas para o início do conhecimento com números, noções de quantidade, contagem e primeiras somas. Um material simples e divertido para introduzir a matemática na vida das crianças.',
 '/numerico.jpg',
 'Matemática',
 'Método Numérico Infantil',
 'https://drive.google.com/drive/folders/1cJyhpEAGsS188IKnqI8k5BDN4knSUEu-?usp=sharing',
 ARRAY[1,2,3]),

('Atividades de Ortografia',
 '7 a 11 anos (2º ao 5º ano)',
 'Mais de 600 atividades de ortografia, todas com gabarito. Elaboradas para fortalecer a escrita correta e ampliar o vocabulário, ajudando as crianças a identificar erros, completar palavras e aplicar regras ortográficas de forma divertida.',
 '/ortografia.jpg',
 'Português',
 'Ortografia',
 'https://drive.google.com/file/d/15JzN0qH0c0mluXlHI7nfoSdwwfFx6wVD/view?usp=sharing',
 ARRAY[2,3]),

('Atividades de Gramática',
 '7 a 10 anos (2º ao 5º ano)',
 'Mais de 600 atividades de gramática prontas para imprimir, organizadas de forma prática e com gabarito no final. Trabalham regras básicas de concordância, uso de pontuação e construção de frases, reforçando o aprendizado da língua portuguesa.',
 '/gramatica.jpg',
 'Português',
 'Gramática',
 'https://drive.google.com/file/d/1y9l1oK1xB-lowpqs053ahdRhwmJSdiYj/view?usp=sharing',
 ARRAY[2,3]),

('Atividades de Interpretação de Texto',
 '7 a 12 anos (2º ao 6º ano)',
 'Mais de 600 atividades de interpretação de texto com gabarito incluso. Desenvolvidas para aprimorar a compreensão leitora, identificação de ideias principais e inferências, tudo de forma prática e organizada.',
 '/interpretacao.jpg',
 'Português',
 'Interpretação de Texto',
 'https://drive.google.com/file/d/1XVjvHgbAGh1z6kqSmdUUEgAY-xh0rdhu/view?usp=sharing',
 ARRAY[2,3]),

('Atividades de Gênero Textual',
 '8 a 12 anos (3º ao 6º ano)',
 'Acervo completo com mais de 700 atividades de gêneros textuais, com gabarito. Trabalha diferentes tipos de produção e análise de textos (narrativos, descritivos, argumentativos, poéticos), organizados de forma prática e eficiente.',
 '/genero.jpg',
 'Português',
 'Gênero Textual',
 'https://drive.google.com/file/d/1GooGfBmTNVbWz59KvR35HXLWxcYcjng1/view?usp=sharing',
 ARRAY[2,3]),

('Coletânea de Textos Literários',
 '9 a 12 anos (4º ao 6º ano)',
 'Material completo com atividades e leituras literárias voltadas para desenvolver a interpretação, apreciação e análise de textos. Trabalha diferentes gêneros literários de forma prática, organizada e acompanhada de gabarito, ajudando no desenvolvimento da leitura crítica e criativa.',
 '/literario.jpg',
 'Literatura',
 'Textos Literários',
 'https://drive.google.com/file/d/1nJ-gqn6vL_mj6y7znaMu2bfgbIba5Z5A/view?usp=sharing',
 ARRAY[2,3]);

-- INSERIR TODOS OS VÍDEOS HARDCODED
INSERT INTO public.videos (title, description, youtube_url, thumbnail, category, duration, available_for_plans) VALUES
('01. Consciência fonológica - Como fazer com as crianças?',
 'Desenvolver a Consciência Fonológica é fundamental na alfabetização. Veja como aplicar com sua turma.',
 'https://www.youtube.com/watch?v=kzRgVu-XqWo',
 'https://img.youtube.com/vi/kzRgVu-XqWo/hqdefault.jpg',
 'Consciência Fonológica',
 '14:42',
 ARRAY[2,3]),

('02. Exemplos de Atividades Psicomotoras',
 'Sequências simples para coordenação, lateralidade e noção espacial — ideais para EI.',
 'https://www.youtube.com/watch?v=9V-EpOn6WLk',
 'https://img.youtube.com/vi/9V-EpOn6WLk/hqdefault.jpg',
 'Atividades Psicomotoras',
 '2:55',
 ARRAY[2,3]),

('03. Como ensinar crianças a ler e escrever?',
 'Estratégias práticas de pré-leitura, fonética e produção escrita para o início da alfabetização.',
 'https://www.youtube.com/watch?v=8EEHYpREF9M',
 'https://img.youtube.com/vi/8EEHYpREF9M/hqdefault.jpg',
 'Alfabetização',
 '10:20',
 ARRAY[2,3]),

('04. Jogo de Matemática',
 'Atividade lúdica de cálculo mental com materiais simples — dinâmica curta e divertida.',
 'https://www.youtube.com/watch?v=5NmOhRuZk5c',
 'https://img.youtube.com/vi/5NmOhRuZk5c/hqdefault.jpg',
 'Matemática',
 '4:33',
 ARRAY[2,3]);

-- INSERIR TODOS OS BÔNUS HARDCODED
INSERT INTO public.bonus (title, description, drive_url, icon, category, available_for_plans) VALUES
('Conto de Páscoa em Formato de Dado',
 'História curta distribuída nas faces de um dado para leitura e dramatização; inclui figuras de apoio, vocabulário e instruções de montagem.',
 'https://drive.google.com/file/d/1NP6CZTaiQ6M7lEbSksGXTH3d20W9kUKJ/view?usp=sharing',
 '/bonuspascoa.jpg',
 'Template/Atividade',
 ARRAY[2,3]),

('Animais Terrestres, Aquáticos e Aéreos',
 'Cartazes e fichas para classificar animais por habitat; inclui atividade de recorte/colagem e jogo de associação.',
 'https://drive.google.com/file/d/1TWvsDfBGOm3wtURCQFTgGf8UagGM5KP8/view?usp=sharing',
 '/animais.jpg',
 'PDF/Cartazes',
 ARRAY[2,3]),

('Planejamento de Aulas — Guia Completo',
 'Manual completo para planejamento eficaz de aulas com templates e exemplos práticos.',
 'https://drive.google.com/file/d/1eG8tzZLs-IwnUj466uEtX2R8SZ8xAcmz/view?usp=sharing',
 '/planejadoraulas.jpg',
 'E-book/PDF',
 ARRAY[2,3]),

('Caderno de Jogos — +30 Atividades',
 'Coleção de jogos rápidos de alfabetização e matemática com instruções passo a passo, variações por nível e lista de materiais.',
 'https://drive.google.com/file/d/1pKhQvhM3j4anUJBCey0L56AlwkLc6aDG/view?usp=sharing',
 '/cadernojogos.jpg',
 'E-book/Atividade',
 ARRAY[2,3]);

-- =====================================================
-- MIGRAÇÃO COMPLETA CONCLUÍDA!
-- =====================================================
-- RESUMO:
-- ✅ Tabelas criadas: atividades, videos, bonus
-- ✅ Políticas RLS configuradas
-- ✅ 7 Atividades migradas (todas as atividades hardcoded)
-- ✅ 4 Vídeos migrados (todos os vídeos hardcoded)
-- ✅ 4 Bônus migrados (todos os bônus hardcoded)
--
-- TOTAL: 15 itens de conteúdo migrados para o database
--
-- PRÓXIMOS PASSOS:
-- 1. Adaptar os componentes para ler do database
-- 2. Criar interface admin para CRUD
-- 3. Testar sistema completo
-- =====================================================

`)

console.log('Execute todo o SQL acima no Supabase Dashboard para migrar o conteúdo!')
console.log('Dashboard: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql')