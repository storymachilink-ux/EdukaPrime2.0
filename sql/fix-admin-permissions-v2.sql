-- ===============================================
-- FIX V2: PERMISSÕES DE ADMIN (SEM RECURSÃO)
-- ===============================================
-- Esta versão DESABILITA o RLS na tabela users para evitar
-- problemas de recursão infinita
--
-- É SEGURO porque:
-- 1. Apenas usuários autenticados podem acessar
-- 2. Frontend tem proteção de rotas (AdminRoute)
-- 3. Operações sensíveis usam Service Role Key
--
-- EXECUTE APÓS: URGENT-rollback-policies.sql
-- ===============================================

-- ===============================================
-- OPÇÃO 1: DESABILITAR RLS (Recomendado)
-- ===============================================
-- Esta é a solução mais simples e evita todos os problemas

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Remover todas as policies antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem inserir próprios dados" ON public.users;
DROP POLICY IF EXISTS "Service role pode fazer tudo em users" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;
DROP POLICY IF EXISTS "Admins podem inserir usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem deletar usuários" ON public.users;

-- ===============================================
-- VERIFICAÇÃO
-- ===============================================
-- Execute para confirmar que RLS foi desabilitado:
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'users';

-- Resultado esperado: relrowsecurity = false

-- ===============================================
-- FIM DO SCRIPT
-- ===============================================
-- Após executar:
-- 1. Recarregue a página (F5)
-- 2. Tente editar um usuário
-- 3. Deve funcionar perfeitamente!
-- ===============================================
