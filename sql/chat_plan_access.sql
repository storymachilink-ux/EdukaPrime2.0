-- Tabela para controlar acesso ao chat por plano
CREATE TABLE IF NOT EXISTS chat_plan_access (
  plano_id INTEGER PRIMARY KEY,
  chat_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão para todos os planos
INSERT INTO chat_plan_access (plano_id, chat_enabled)
VALUES
  (0, true),  -- Gratuito
  (1, true),  -- Essencial
  (2, true),  -- Evoluir
  (3, true)   -- Prime
ON CONFLICT (plano_id) DO NOTHING;

COMMENT ON TABLE chat_plan_access IS 'Controle de acesso ao chat por plano';
COMMENT ON COLUMN chat_plan_access.plano_id IS 'ID do plano (0=Gratuito, 1=Essencial, 2=Evoluir, 3=Prime)';
COMMENT ON COLUMN chat_plan_access.chat_enabled IS 'Se o chat está habilitado para este plano';

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_chat_plan_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_plan_access_updated_at
BEFORE UPDATE ON chat_plan_access
FOR EACH ROW
EXECUTE FUNCTION update_chat_plan_access_updated_at();

-- Permitir admins gerenciar
CREATE POLICY "Admins podem gerenciar acesso ao chat"
ON chat_plan_access FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Todos podem ler
CREATE POLICY "Todos podem ler configurações do chat"
ON chat_plan_access FOR SELECT
TO authenticated
USING (true);

-- Habilitar RLS
ALTER TABLE chat_plan_access ENABLE ROW LEVEL SECURITY;

SELECT '✅ Controle de acesso ao chat por plano criado!' as status;
