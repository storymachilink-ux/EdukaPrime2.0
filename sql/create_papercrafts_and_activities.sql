-- ============================================================================
-- CRIAR TABELAS PARA PAPERCRAFTS E ATIVIDADES EDUCACIONAIS
-- ============================================================================

-- 1. TABELA DE PAPERCRAFTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.papercrafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('fácil', 'médio', 'difícil')),
  description TEXT,
  model_count VARCHAR(100),
  min_age INTEGER,
  max_age INTEGER,
  image_url TEXT,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_papercrafts_category ON public.papercrafts(category);
CREATE INDEX IF NOT EXISTS idx_papercrafts_difficulty ON public.papercrafts(difficulty);
CREATE INDEX IF NOT EXISTS idx_papercrafts_active ON public.papercrafts(is_active);

-- 2. TABELA DE ATIVIDADES EDUCACIONAIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.educational_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('fácil', 'médio', 'difícil')),
  description TEXT,
  category VARCHAR(100),
  min_age INTEGER,
  max_age INTEGER,
  has_answer_key BOOLEAN DEFAULT false,
  content_url TEXT,
  image_url TEXT,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_activities_subject ON public.educational_activities(subject);
CREATE INDEX IF NOT EXISTS idx_activities_difficulty ON public.educational_activities(difficulty);
CREATE INDEX IF NOT EXISTS idx_activities_active ON public.educational_activities(is_active);

-- 3. TABELA DE DOWNLOADS (User Progress)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.educational_activities(id) ON DELETE CASCADE,
  papercraft_id UUID REFERENCES public.papercrafts(id) ON DELETE CASCADE,
  download_type VARCHAR(50) NOT NULL CHECK (download_type IN ('activity', 'papercraft')),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.user_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_activity ON public.user_downloads(activity_id);
CREATE INDEX IF NOT EXISTS idx_downloads_papercraft ON public.user_downloads(papercraft_id);

-- ============================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- PAPERCRAFTS - Permitir leitura para todos autenticados
ALTER TABLE public.papercrafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "papercrafts_select_authenticated" ON public.papercrafts
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- PAPERCRAFTS - Admin pode fazer tudo
CREATE POLICY "papercrafts_admin_all" ON public.papercrafts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ATIVIDADES - Permitir leitura para todos autenticados
ALTER TABLE public.educational_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_authenticated" ON public.educational_activities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ATIVIDADES - Admin pode fazer tudo
CREATE POLICY "activities_admin_all" ON public.educational_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- DOWNLOADS - Usuários podem ver seus próprios downloads
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "downloads_select_own" ON public.user_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "downloads_insert_own" ON public.user_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- DADOS INICIAIS (PAPERCRAFTS)
-- ============================================================================

INSERT INTO public.papercrafts (title, category, difficulty, description, model_count, min_age, max_age, is_active)
VALUES
  (
    'Kit Básico Natalino',
    'Natal',
    'fácil',
    'Kit Básico Natalino — 20 modelos perfeitos para iniciantes. Inclui enfeites simples e criativos.',
    '20 modelos',
    4,
    12,
    true
  ),
  (
    'Kit Completo Natal',
    'Natal',
    'médio',
    'Kit Completo Natal — 60+ modelos para explorar criatividade completa. Inclui desde enfeites a presentes.',
    '60+ modelos',
    4,
    12,
    true
  ),
  (
    'Bônus Natalinos',
    'Natal',
    'médio',
    'Bônus Natalinos — Exclusivos. Coleção especial com modelos únicos e premium.',
    'Exclusivos',
    4,
    12,
    true
  ),
  (
    'Turma EdukaBoo',
    'Personagens',
    'fácil',
    'Conheça e monte todos os personagens icônicos da turma EdukaBoo. Personagens divertidos e educativos.',
    'Múltiplos',
    4,
    12,
    true
  ),
  (
    'Decoração',
    'Decoração',
    'médio',
    'Crie decorações incríveis para sua casa ou sala de aula. Padrões variados e criativos.',
    'Variados',
    5,
    12,
    true
  ),
  (
    'Histórias',
    'Narrativa',
    'médio',
    'Papercrafts temáticos inspirados em histórias clássicas e modernas. Mergulhe em aventuras criativas.',
    'Variados',
    6,
    12,
    true
  ),
  (
    'Atividades Lúdicas',
    'Educativo',
    'fácil',
    'Atividades divertidas que combinam aprendizado com diversão. Brincadeiras que ensinam.',
    'Variados',
    4,
    10,
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DADOS INICIAIS (ATIVIDADES EDUCACIONAIS)
-- ============================================================================

INSERT INTO public.educational_activities (title, subject, difficulty, description, category, min_age, max_age, has_answer_key, is_active)
VALUES
  (
    'Coletânea de Textos Literários',
    'Português',
    'médio',
    'Material completo com leituras e atividades literárias. Trabalha diferentes gêneros, interpretação, apreciação e leitura crítica.',
    'Literatura',
    9,
    12,
    true,
    true
  ),
  (
    'Português Atividades de Sistematização',
    'Português',
    'médio',
    'Mais de 100 atividades de gramática. Trabalha ortografia e uso correto de letras e sons. Inclui exercícios práticos e progressivos.',
    'Gramática',
    8,
    12,
    true,
    true
  ),
  (
    'Atividades de Gênero Textual',
    'Português',
    'médio',
    'Acervo com mais de 700 atividades de gêneros textuais. Produção e análise de textos narrativos, descritivos, argumentativos e poéticos.',
    'Gênero Textual',
    8,
    12,
    true,
    true
  ),
  (
    'Atividades de Interpretação de Texto',
    'Português',
    'médio',
    'Mais de 600 atividades com gabarito. Desenvolvem compreensão leitora, identificação de ideias principais e inferências.',
    'Interpretação de Texto',
    7,
    12,
    true,
    true
  ),
  (
    'Atividades de Gramática',
    'Português',
    'médio',
    'Mais de 600 atividades de gramática com gabarito. Trabalha concordância, pontuação e construção de frases.',
    'Gramática',
    7,
    10,
    true,
    true
  ),
  (
    'Atividades de Ortografia',
    'Português',
    'fácil',
    'Mais de 600 atividades com gabarito para fortalecer a escrita correta, ampliar vocabulário e aplicar regras ortográficas de forma divertida.',
    'Ortografia',
    7,
    11,
    true,
    true
  ),
  (
    'Método Numérico Infantil',
    'Matemática',
    'fácil',
    'Atividades de matemática com método lúdico e infantil. Introdução aos números, quantidade, contagem e primeiras somas.',
    'Matemática Inicial',
    4,
    6,
    true,
    true
  ),
  (
    'Atividades de Fonética – Caderno N1, N2 e N3',
    'Português',
    'fácil',
    'Atividades de fonética para estimular a consciência sonora e facilitar a leitura. Reconhecimento, diferenciação e combinação de sons de forma divertida.',
    'Aprendendo a Ler',
    4,
    6,
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_papercrafts_updated_at BEFORE UPDATE ON public.papercrafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.educational_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMENTÁRIOS EXPLICATIVOS
-- ============================================================================

COMMENT ON TABLE public.papercrafts IS
'Tabela com papercrafts disponíveis. Admin pode gerenciar através do painel de admin.';

COMMENT ON TABLE public.educational_activities IS
'Tabela com atividades educacionais. Admin pode gerenciar através do painel de admin.';

COMMENT ON TABLE public.user_downloads IS
'Rastreia downloads de papercrafts e atividades por usuário. Usado para progresso e estatísticas.';
