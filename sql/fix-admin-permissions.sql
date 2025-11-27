-- ===============================================
-- FIX: PERMISSÕES DE ADMIN PARA GESTÃO DE USUÁRIOS
-- ===============================================
-- Este script corrige as policies RLS para permitir que admins
-- possam editar planos e dados de outros usuários
--
-- PROBLEMA: Admins não conseguem atualizar outros usuários porque
-- o RLS só permite usuários atualizarem a si mesmos
--
-- SOLUÇÃO: Adicionar policies específicas para admins
--
-- COMO EXECUTAR:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Abra seu projeto
-- 3. Menu lateral: SQL Editor
-- 4. Clique em: "+ New query"
-- 5. Cole TODO este código
-- 6. Clique em: "Run"
-- ===============================================

-- ===============================================
-- PASSO 1: REMOVER POLICIES ANTIGAS (se existirem)
-- ===============================================

-- Remover policies antigas para recriar
DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;
DROP POLICY IF EXISTS "Admins podem inserir usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem deletar usuários" ON public.users;

-- ===============================================
-- PASSO 2: CRIAR POLICIES PARA ADMINS
-- ===============================================

-- Policy 1: Admins podem VER todos os usuários
CREATE POLICY "Admins podem ver todos usuários"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

-- Policy 2: Admins podem ATUALIZAR qualquer usuário (PRINCIPAL!)
CREATE POLICY "Admins podem atualizar qualquer usuário"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

-- Policy 3: Admins podem INSERIR novos usuários
CREATE POLICY "Admins podem inserir usuários"
  ON public.users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

-- Policy 4: Admins podem DELETAR usuários
CREATE POLICY "Admins podem deletar usuários"
  ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

-- ===============================================
-- PASSO 3: VERIFICAR SE AS POLICIES FORAM CRIADAS
-- ===============================================

-- Execute esta query para ver todas as policies da tabela users:
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- ===============================================
-- RESULTADO ESPERADO:
-- ===============================================
-- Você deve ver as seguintes policies:
-- 1. "Usuários podem ver seus próprios dados" (SELECT)
-- 2. "Usuários podem atualizar seus próprios dados" (UPDATE)
-- 3. "Service role pode fazer tudo em users" (ALL)
-- 4. "Admins podem ver todos usuários" (SELECT) ← NOVA
-- 5. "Admins podem atualizar qualquer usuário" (UPDATE) ← NOVA
-- 6. "Admins podem inserir usuários" (INSERT) ← NOVA
-- 7. "Admins podem deletar usuários" (DELETE) ← NOVA
-- ===============================================

-- ===============================================
-- TESTE RÁPIDO (OPCIONAL)
-- ===============================================
-- Para testar se funcionou, você pode executar:
--
-- 1. Verifique se você é admin:
-- SELECT id, email, is_admin FROM users WHERE email = 'seu-email@exemplo.com';
--
-- 2. Se is_admin = true, tente atualizar outro usuário:
-- UPDATE users SET plano_ativo = 1 WHERE email = 'outro-usuario@exemplo.com';
--
-- 3. Se funcionou, você verá: "UPDATE 1" (1 linha afetada)
-- ===============================================

-- FIM DO SCRIPT
-- Após executar, volte para o painel admin e teste editar um usuário
