-- ========================================
-- PASSO 0: EXCLUIR TUDO ANTIGO
-- ========================================
-- Execute ISSO PRIMEIRO no Supabase SQL Editor
-- Se der erro de "not exist", é OK, significa que já foi deletado

DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS community_channels CASCADE;
DROP TABLE IF EXISTS support_tiers CASCADE;

-- Remover coluna plano_id de users se existir
ALTER TABLE users DROP COLUMN IF EXISTS plano_id;

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 01_CRIAR_PLANS_V2.sql
-- ========================================
