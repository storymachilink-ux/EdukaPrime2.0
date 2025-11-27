-- Adicionar campo de acesso personalizado ao Suporte VIP
ALTER TABLE users
ADD COLUMN IF NOT EXISTS acesso_suporte_vip BOOLEAN DEFAULT FALSE;

-- Comentário
COMMENT ON COLUMN users.acesso_suporte_vip IS 'Acesso personalizado ao Suporte VIP (Pedir Atividades), independente do plano';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_users_suporte_vip ON users(acesso_suporte_vip);
