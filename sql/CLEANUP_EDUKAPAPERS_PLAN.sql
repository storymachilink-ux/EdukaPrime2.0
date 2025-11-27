-- ============================================================
-- LIMPEZA: Remover plano EdukaPapers de todos os usuários
-- ============================================================
-- PASSO 1: Verificar quantas subscriptions serão removidas
SELECT COUNT(*) as subscriptions_a_remover
FROM user_subscriptions us
JOIN plans_v2 p ON us.plan_id = p.id
WHERE p.display_name LIKE '%EdukaPapers%';

-- PASSO 2: Listar as subscriptions que serão removidas (para referência)
SELECT us.id, us.user_id, p.display_name, us.created_at
FROM user_subscriptions us
JOIN plans_v2 p ON us.plan_id = p.id
WHERE p.display_name LIKE '%EdukaPapers%'
ORDER BY us.created_at DESC;

-- PASSO 3: REMOVER as subscriptions (execute apenas se tiver certeza!)
-- ⚠️ CUIDADO: Isto é IRREVERSÍVEL!
DELETE FROM user_subscriptions
WHERE plan_id IN (
  SELECT id FROM plans_v2
  WHERE display_name LIKE '%EdukaPapers%'
);

-- PASSO 4: Verificar se foi removido
SELECT COUNT(*) as subscriptions_restantes
FROM user_subscriptions us
JOIN plans_v2 p ON us.plan_id = p.id
WHERE p.display_name LIKE '%EdukaPapers%';

-- Se retornar 0, foi bem-sucedido!
