-- ============================================
-- ADICIONAR CAMPO DE ACEITE DE TERMOS DO CHAT
-- ============================================

-- Adicionar coluna para rastrear se o usuário aceitou os termos do chat
ALTER TABLE users
ADD COLUMN IF NOT EXISTS chat_terms_accepted BOOLEAN DEFAULT false;

-- Adicionar coluna para timestamp de quando aceitou
ALTER TABLE users
ADD COLUMN IF NOT EXISTS chat_terms_accepted_at TIMESTAMPTZ;

-- ============================================
-- ✅ CAMPO ADICIONADO
-- ============================================

SELECT '✅ Campo chat_terms_accepted adicionado à tabela users!' as status;
