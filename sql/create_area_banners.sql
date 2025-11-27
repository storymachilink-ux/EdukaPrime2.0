-- Criar tabela area_banners se não existir
CREATE TABLE IF NOT EXISTS area_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT,
  button_url TEXT,
  banner_url TEXT,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir áreas padrão se não existirem
INSERT INTO area_banners (area, active) VALUES
  ('atividades_topo', FALSE),
  ('atividades_rodape', FALSE),
  ('bonus_topo', FALSE),
  ('bonus_rodape', FALSE),
  ('planos_rodape', FALSE),
  ('suporte_topo', FALSE)
ON CONFLICT (area) DO NOTHING;

-- Habilitar RLS
ALTER TABLE area_banners ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Public read access" ON area_banners
  FOR SELECT
  USING (TRUE);

-- Política para admin fazer update
CREATE POLICY "Admin update access" ON area_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Política para admin fazer insert
CREATE POLICY "Admin insert access" ON area_banners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para admin fazer delete
CREATE POLICY "Admin delete access" ON area_banners
  FOR DELETE
  USING (auth.role() = 'authenticated');
