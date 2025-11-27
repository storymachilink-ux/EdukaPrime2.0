-- ============================================
-- VERIFICAR E CORRIGIR TABELA user_progress
-- ============================================

-- 1. Ver estrutura da tabela user_progress
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- 2. Ver constraints únicas
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_progress';

-- 3. Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_progress';

-- 4. Verificar se existe constraint única correta
-- Deve ter: UNIQUE(user_id, resource_type, resource_id)

-- 5. Se não existir a constraint, criar:
-- DESCOMENTE SE NECESSÁRIO:
/*
ALTER TABLE user_progress
DROP CONSTRAINT IF EXISTS user_progress_user_id_resource_type_resource_id_key;

ALTER TABLE user_progress
ADD CONSTRAINT user_progress_user_id_resource_type_resource_id_key
UNIQUE (user_id, resource_type, resource_id);
*/

-- 6. Ver dados duplicados (se houver)
SELECT
  user_id,
  resource_type,
  resource_id,
  COUNT(*) as duplicatas
FROM user_progress
GROUP BY user_id, resource_type, resource_id
HAVING COUNT(*) > 1;
