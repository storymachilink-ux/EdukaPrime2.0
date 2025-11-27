-- ============================================================================
-- SOLUÇÃO: Permitir Admin Atualizar Pontos de Chat
-- ============================================================================
-- Problema: RLS bloqueia admin de atualizar pontos de outro usuário
-- Solução: Criar função RPC com SECURITY DEFINER
-- ============================================================================

-- 1. CRIAR FUNÇÃO RPC PARA ATUALIZAR PONTOS
-- Esta função contorna RLS e permite que admin atualize qualquer usuário
CREATE OR REPLACE FUNCTION update_user_chat_points(
  target_user_id UUID,
  points_delta INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Ignora RLS!
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN;
  current_points INTEGER;
  new_points INTEGER;
BEGIN
  -- Pegar ID do usuário autenticado atual
  current_user_id := auth.uid();

  -- Se não está autenticado, retornar erro
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Não autenticado'
    );
  END IF;

  -- VERIFICAR SE É ADMIN (sem RLS bloquear)
  SELECT users.is_admin INTO is_admin
  FROM public.users
  WHERE users.id = current_user_id;

  -- Se não é admin, retornar erro
  IF is_admin IS NULL OR is_admin = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permissão negada. Apenas admin pode atualizar pontos.'
    );
  END IF;

  -- VERIFICAR SE O USUÁRIO ALVO EXISTE
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ID do usuário inválido'
    );
  END IF;

  -- BUSCAR PONTOS ATUAIS
  SELECT chat_user_stats.total_points INTO current_points
  FROM public.chat_user_stats
  WHERE chat_user_stats.user_id = target_user_id;

  -- Se não existe registro, criar com pontos iniciais
  IF current_points IS NULL THEN
    new_points := GREATEST(0, COALESCE(points_delta, 0));

    INSERT INTO public.chat_user_stats (user_id, total_points)
    VALUES (target_user_id, new_points)
    ON CONFLICT (user_id) DO UPDATE
    SET total_points = GREATEST(0, chat_user_stats.total_points + points_delta);

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Registro criado e pontos adicionados',
      'old_points', 0,
      'new_points', new_points,
      'delta', points_delta
    );
  END IF;

  -- CALCULAR NOVOS PONTOS (nunca negativo)
  new_points := GREATEST(0, current_points + points_delta);

  -- ATUALIZAR PONTOS
  UPDATE public.chat_user_stats
  SET
    total_points = new_points,
    updated_at = NOW()
  WHERE user_id = target_user_id;

  -- RETORNAR SUCESSO
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE
      WHEN points_delta > 0 THEN points_delta::TEXT || ' ponto(s) adicionado(s)'
      WHEN points_delta < 0 THEN (ABS(points_delta))::TEXT || ' ponto(s) removido(s)'
      ELSE 'Nenhuma mudança'
    END,
    'old_points', current_points,
    'new_points', new_points,
    'delta', points_delta
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Erro ao atualizar: ' || SQLERRM
  );
END;
$$;

-- 2. CRIAR PERMISSÃO DE EXECUÇÃO
-- Permitir que usuários autenticados executem esta função
GRANT EXECUTE ON FUNCTION update_user_chat_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_chat_points(UUID, INTEGER) TO anon;

-- 3. COMENTÁRIO EXPLICATIVO
COMMENT ON FUNCTION update_user_chat_points(UUID, INTEGER) IS
'Função segura para admin atualizar pontos de chat de qualquer usuário.
Verifica se o usuário é admin e retorna erro se não for.
Use com points_delta positivo para adicionar ou negativo para remover.
Exemplo: SELECT * FROM update_user_chat_points(user_id, -10);';

-- ============================================================================
-- GUIA DE USO
-- ============================================================================

/*
USAR ESSA FUNÇÃO NO CÓDIGO TypeScript:

import { supabase } from '../lib/supabase';

const handleUpdatePoints = async () => {
  if (!selectedUser) {
    alert('Selecione um usuário!');
    return;
  }

  if (pointsToAdd === 0) {
    alert('Digite uma quantidade de pontos!');
    return;
  }

  try {
    const { data, error } = await supabase
      .rpc('update_user_chat_points', {
        target_user_id: selectedUser,
        points_delta: pointsToAdd
      });

    if (error) {
      alert(`Erro: ${error.message}`);
      return;
    }

    const result = data;
    if (result.success) {
      alert(`✅ ${result.message}\nAntes: ${result.old_points} pts\nDepois: ${result.new_points} pts`);
      setPointsToAdd(0);
      setSelectedUser('');
      loadUsers();
    } else {
      alert(`❌ ${result.error}`);
    }
  } catch (error: any) {
    console.error('Erro ao atualizar pontos:', error);
    alert(`Erro: ${error.message}`);
  }
};

*/

-- ============================================================================
-- TESTES (Executar no Supabase SQL Editor)
-- ============================================================================

/*
-- Teste 1: Listar todos os usuários (para pegar um ID para teste)
SELECT id, nome, email, is_admin FROM public.users LIMIT 10;

-- Teste 2: Verificar pontos atuais de um usuário
SELECT user_id, total_points FROM public.chat_user_stats
WHERE user_id = '9f8b3e0c-d82f-4d6f-9e3b-2c8a1f6d4b2e';

-- Teste 3: Adicionar 50 pontos
SELECT update_user_chat_points(
  '9f8b3e0c-d82f-4d6f-9e3b-2c8a1f6d4b2e'::uuid,
  50
);

-- Teste 4: Remover 30 pontos
SELECT update_user_chat_points(
  '9f8b3e0c-d82f-4d6f-9e3b-2c8a1f6d4b2e'::uuid,
  -30
);

-- Teste 5: Tentar como não-admin (vai falhar com "Permissão negada")
-- (Fazer login com conta não-admin e executar)
SELECT update_user_chat_points(
  '9f8b3e0c-d82f-4d6f-9e3b-2c8a1f6d4b2e'::uuid,
  10
);

*/

-- ============================================================================
-- INFORMAÇÕES IMPORTANTES
-- ============================================================================

/*
✅ VANTAGENS DESSA SOLUÇÃO:
- Contorna o RLS completamente com SECURITY DEFINER
- Verifica se usuário é admin (segurança)
- Nunca permite valores negativos de pontos
- Cria registro automaticamente se não existir
- Retorna informações completas do sucesso/erro
- Sem recursão infinita em policies

⚠️ NOTAS IMPORTANTES:
- A função faz a verificação de is_admin DENTRO da função
- Pode ler a tabela users sem RLS bloquear (porque está em SECURITY DEFINER)
- O TypeScript precisa chamar com .rpc() em vez de .from()
- Nenhuma política RLS bloqueia funções com SECURITY DEFINER

🔒 SEGURANÇA:
- A função valida que o usuário é admin
- Sem service_role_key exposto no frontend
- Pode ser auditada (log de quem executou)
*/
