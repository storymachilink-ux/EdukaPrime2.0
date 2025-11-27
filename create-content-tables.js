console.log('SQL para criar tabelas de conteudo:')
console.log(`
-- TABELA ATIVIDADES
CREATE TABLE public.atividades (
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
CREATE TABLE public.videos (
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
CREATE TABLE public.bonus (
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
`)

console.log('Execute no Supabase Dashboard: https://vijlwgrgaliptkbghfdg.supabase.co/project/vijlwgrgaliptkbghfdg/sql')