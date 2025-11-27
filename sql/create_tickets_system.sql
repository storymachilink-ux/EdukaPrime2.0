-- Criar tabela de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('problemas', 'contribuicao', 'pedir_atividades')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email TEXT,
  contact_whatsapp TEXT,
  file_url TEXT,
  link TEXT,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'aprovado', 'recusado', 'atendido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de respostas de tickets
CREATE TABLE IF NOT EXISTS ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de configurações de tickets
CREATE TABLE IF NOT EXISTS ticket_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT UNIQUE NOT NULL CHECK (category IN ('problemas', 'contribuicao', 'pedir_atividades')),
  is_active BOOLEAN DEFAULT TRUE,
  custom_message TEXT,
  require_file BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category, status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket ON ticket_responses(ticket_id, created_at);

-- Comentários
COMMENT ON TABLE tickets IS 'Sistema de suporte com tickets de usuários';
COMMENT ON COLUMN tickets.category IS 'Categoria: problemas, contribuicao, pedir_atividades';
COMMENT ON COLUMN tickets.status IS 'Status: aberto, em_andamento, resolvido, aprovado, recusado, atendido';
COMMENT ON COLUMN tickets.file_url IS 'URL do arquivo enviado (Supabase Storage)';
COMMENT ON COLUMN tickets.link IS 'Link externo fornecido pelo usuário';

COMMENT ON TABLE ticket_responses IS 'Respostas e atualizações de tickets';
COMMENT ON COLUMN ticket_responses.is_internal IS 'Se true, é uma nota interna não visível para o usuário';

COMMENT ON TABLE ticket_settings IS 'Configurações das categorias de tickets';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ticket_timestamp ON tickets;
CREATE TRIGGER trigger_update_ticket_timestamp
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamp();

-- Trigger para definir resolved_at quando status mudar para resolvido
CREATE OR REPLACE FUNCTION set_ticket_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('resolvido', 'aprovado', 'recusado', 'atendido') AND OLD.status != NEW.status THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ticket_resolved_at ON tickets;
CREATE TRIGGER trigger_set_ticket_resolved_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_resolved_at();

-- Inserir configurações padrão
INSERT INTO ticket_settings (category, is_active, custom_message, require_file)
VALUES
  ('problemas', true, 'Descreva seu problema em detalhes para que possamos ajudá-lo.', false),
  ('contribuicao', true, 'Envie atividades ou materiais para nossa plataforma. Agradecemos sua contribuição!', false),
  ('pedir_atividades', true, 'Solicite atividades específicas. Recurso exclusivo para membros PRIME.', false)
ON CONFLICT (category) DO NOTHING;

-- Função para contar tickets por status
CREATE OR REPLACE FUNCTION count_tickets_by_status(status_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  ticket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ticket_count
  FROM tickets
  WHERE status = status_param;

  RETURN ticket_count;
END;
$$ LANGUAGE plpgsql;

-- Função para contar tickets por categoria
CREATE OR REPLACE FUNCTION count_tickets_by_category(category_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  ticket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ticket_count
  FROM tickets
  WHERE category = category_param;

  RETURN ticket_count;
END;
$$ LANGUAGE plpgsql;

-- Política RLS (Row Level Security) - usuários só veem seus próprios tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os tickets (necessário criar política separada para admins)
CREATE POLICY "Admins podem ver todos os tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar todos os tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS para respostas
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver respostas de seus tickets"
  ON ticket_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_responses.ticket_id
      AND tickets.user_id = auth.uid()
      AND ticket_responses.is_internal = false
    )
  );

CREATE POLICY "Admins podem gerenciar respostas"
  ON ticket_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS para settings (apenas admins)
ALTER TABLE ticket_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler configurações"
  ON ticket_settings FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem alterar configurações"
  ON ticket_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
