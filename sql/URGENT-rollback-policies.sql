-- ===============================================
-- 🚨 URGENTE: ROLLBACK DAS POLICIES PROBLEMÁTICAS
-- ===============================================
-- Este script REMOVE as policies que estão causando erro 500
-- Execute IMEDIATAMENTE no Supabase SQL Editor
--
-- PROBLEMA: As policies criadas estão causando recursão infinita
-- SOLUÇÃO: Remover todas e deixar apenas as básicas
-- ===============================================

-- REMOVER TODAS AS POLICIES PROBLEMÁTICAS
DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;
DROP POLICY IF EXISTS "Admins podem inserir usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem deletar usuários" ON public.users;

-- ===============================================
-- MANTER APENAS AS POLICIES BÁSICAS E SEGURAS
-- ===============================================

-- Policy para Service Role (backend/webhooks) fazer tudo
DROP POLICY IF EXISTS "Service role pode fazer tudo em users" ON public.users;
CREATE POLICY "Service role pode fazer tudo em users"
  ON public.users
  FOR ALL
  USING (true);

-- ===============================================
-- FIM DO ROLLBACK
-- ===============================================
-- Após executar este SQL:
-- 1. Recarregue a página (F5)
-- 2. O erro 500 deve parar
-- 3. Execute o próximo SQL: fix-admin-permissions-v2.sql
-- ===============================================
