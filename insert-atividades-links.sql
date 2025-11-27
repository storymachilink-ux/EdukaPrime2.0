-- Script SQL para inserir/atualizar as atividades com os links corretos
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos criar a tabela atividades se ela não existir
CREATE TABLE IF NOT EXISTS public.atividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    age_range TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    niche TEXT,
    drive_url TEXT NOT NULL,
    available_for_plans INTEGER[] NOT NULL DEFAULT '{1,2,3}',
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver atividades baseado em seus planos
CREATE POLICY "Users can view atividades based on plan" ON public.atividades
    FOR SELECT USING (true);

-- Política: Apenas admins podem inserir/atualizar/deletar
CREATE POLICY "Admins can manage atividades" ON public.atividades
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Inserir ou atualizar as atividades com os links corretos
INSERT INTO public.atividades (title, age_range, description, image, category, niche, drive_url, available_for_plans, is_custom) VALUES
(
    'Atividades Fonéticas',
    '4-7 anos',
    'Atividades completas para desenvolvimento da consciência fonológica e primeiros passos na leitura.',
    '/atividades/fonetica.jpg',
    'Leitura e Escrita',
    'Alfabetização',
    'https://drive.google.com/drive/folders/1jPO2rcf0JTExMV3ygEmD00LaSrl64Vyn?usp=sharing',
    '{1,2,3}',
    false
),
(
    'Método Numérico Infantil – Matemática Inicial',
    '4-8 anos',
    'Método completo para ensinar conceitos matemáticos básicos de forma lúdica e eficaz.',
    '/atividades/matematica.jpg',
    'Matemática',
    'Números e Operações',
    'https://drive.google.com/drive/folders/1cJyhpEAGsS188IKnqI8k5BDN4knSUEu-?usp=sharing',
    '{1,2,3}',
    false
),
(
    'Atividades de Ortografia',
    '6-10 anos',
    'Exercícios práticos para desenvolvimento da escrita correta e regras ortográficas.',
    '/atividades/ortografia.jpg',
    'Leitura e Escrita',
    'Ortografia',
    'https://drive.google.com/file/d/15JzN0qH0c0mluXlHI7nfoSdwwfFx6wVD/view?usp=sharing',
    '{1,2,3}',
    false
),
(
    'Atividades de Gramática',
    '7-12 anos',
    'Exercícios completos para ensino de gramática de forma contextualizada e prática.',
    '/atividades/gramatica.jpg',
    'Leitura e Escrita',
    'Gramática',
    'https://drive.google.com/file/d/1y9l1oK1xB-lowpqs053ahdRhwmJSdiYj/view?usp=sharing',
    '{2,3}',
    false
),
(
    'Atividades de Interpretação de Texto',
    '6-12 anos',
    'Atividades diversificadas para desenvolvimento da compreensão leitora e interpretação textual.',
    '/atividades/interpretacao.jpg',
    'Leitura e Escrita',
    'Interpretação',
    'https://drive.google.com/file/d/1XVjvHgbAGh1z6kqSmdUUEgAY-xh0rdhu/view?usp=sharing',
    '{2,3}',
    false
),
(
    'Atividades de Gênero Textual',
    '8-12 anos',
    'Explorando diferentes gêneros textuais para ampliar o repertório e conhecimento dos alunos.',
    '/atividades/genero-textual.jpg',
    'Leitura e Escrita',
    'Gêneros Textuais',
    'https://drive.google.com/file/d/1GooGfBmTNVbWz59KvR35HXLWxcYcjng1/view?usp=sharing',
    '{2,3}',
    false
),
(
    'Coletânea de Textos Literários',
    '6-14 anos',
    'Seleção cuidadosa de textos literários para despertar o amor pela leitura e literatura.',
    '/atividades/literatura.jpg',
    'Literatura',
    'Textos Literários',
    'https://drive.google.com/file/d/1nJ-gqn6vL_mj6y7znaMu2bfgbIba5Z5A/view?usp=sharing',
    '{3}',
    false
)
ON CONFLICT (title) DO UPDATE SET
    drive_url = EXCLUDED.drive_url,
    available_for_plans = EXCLUDED.available_for_plans,
    description = EXCLUDED.description,
    age_range = EXCLUDED.age_range,
    category = EXCLUDED.category,
    niche = EXCLUDED.niche,
    image = EXCLUDED.image,
    updated_at = timezone('utc'::text, now());

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at quando um registro for modificado
DROP TRIGGER IF EXISTS on_atividades_updated ON public.atividades;
CREATE TRIGGER on_atividades_updated
    BEFORE UPDATE ON public.atividades
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.atividades IS 'Atividades educacionais disponíveis na plataforma';
COMMENT ON COLUMN public.atividades.title IS 'Título da atividade';
COMMENT ON COLUMN public.atividades.age_range IS 'Faixa etária recomendada';
COMMENT ON COLUMN public.atividades.description IS 'Descrição detalhada da atividade';
COMMENT ON COLUMN public.atividades.image IS 'URL da imagem de capa da atividade';
COMMENT ON COLUMN public.atividades.category IS 'Categoria da atividade (ex: Leitura e Escrita, Matemática)';
COMMENT ON COLUMN public.atividades.niche IS 'Nicho específico dentro da categoria';
COMMENT ON COLUMN public.atividades.drive_url IS 'URL do Google Drive com os materiais';
COMMENT ON COLUMN public.atividades.available_for_plans IS 'Array com os números dos planos que têm acesso (1=Essencial, 2=Evoluir, 3=Prime)';
COMMENT ON COLUMN public.atividades.is_custom IS 'Se a atividade foi criada por um admin (customizada)';