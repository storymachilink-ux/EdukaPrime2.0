-- ============================================
-- ADICIONAR CAMPO DE BLOQUEIO DE CHAT
-- ============================================

-- Adicionar coluna para bloquear usuário do chat
ALTER TABLE users
ADD COLUMN IF NOT EXISTS chat_blocked BOOLEAN DEFAULT false;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_chat_blocked ON users(chat_blocked);

-- ============================================
-- ✅ CAMPO ADICIONADO
-- ============================================

SELECT '✅ Campo chat_blocked adicionado à tabela users!' as status;
