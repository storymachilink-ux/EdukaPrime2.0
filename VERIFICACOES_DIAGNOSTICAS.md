# 🔧 VERIFICAÇÕES DIAGNÓSTICAS - Executar no Supabase

## ⚠️ IMPORTANTE
Execute TODOS esses SQLs no Supabase SQL Editor e **envie os resultados** para que eu identifique o EXATO problema.

---

## VERIFICAÇÃO 1: Status do seu usuário admin

```sql
-- EXECUTE E ENVIE O RESULTADO
SELECT
  id,
  email,
  is_admin,
  created_at
FROM users
WHERE email = (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1);
```

**O que você deve ver:**
- `email`: seu email
- `is_admin`: `true` (se false, você não consegue ver os webhooks!)

---

## VERIFICAÇÃO 2: Estrutura da tabela webhook_logs

```sql
-- EXECUTE E ENVIE O RESULTADO
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'webhook_logs'
ORDER BY ordinal_position;
```

**O que você deve ver:**
- `platform` - TEXT
- `product_ids` - JSONB
- `transaction_id` - TEXT
- `expires_at` - TIMESTAMP
- `reprocess_count` - INTEGER
- `processed_at` - TIMESTAMP
- `product_id` - TEXT (coluna original)

**Se faltar colunas:** aviso!

---

## VERIFICAÇÃO 3: Quantidade de webhooks no banco

```sql
-- EXECUTE E ENVIE O RESULTADO
SELECT
  COUNT(*) as total_webhooks,
  status,
  platform,
  event_type
FROM webhook_logs
GROUP BY status, platform, event_type
ORDER BY total_webhooks DESC;
```

**O que você deve ver:**
- Quantos webhooks por status
- Qual platform (vega, ggcheckout, amplopay, NULL)
- Qual event_type

---

## VERIFICAÇÃO 4: Os 10 webhooks mais recentes

```sql
-- EXECUTE E ENVIE O RESULTADO (COMPLETO OU SCREENSHOT)
SELECT
  id,
  created_at,
  platform,
  customer_email,
  status,
  event_type,
  amount,
  product_id,
  transaction_id
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

**O que procurar:**
- `created_at`: Data do webhook que você enviou
- `platform`: Vega ou NULL? (se NULL = PROBLEMA!)
- `status`: received, success, pending, failed?
- `customer_email`: Seu email de teste?

---

## VERIFICAÇÃO 5: Webhooks do seu email de teste

```sql
-- SUBSTITUA 'seu-email@teste.com' pelo email que usou no PIX
-- EXECUTE E ENVIE O RESULTADO
SELECT
  id,
  created_at,
  platform,
  customer_email,
  status,
  event_type,
  amount,
  product_ids,
  raw_payload
FROM webhook_logs
WHERE customer_email = 'seu-email@teste.com'
ORDER BY created_at DESC;
```

**O que procurar:**
- Quantos webhooks para esse email?
- Qual status (received, pending, success)?
- Qual platform (vega, ggcheckout, amplopay, NULL)?
- Se product_ids é um array JSON: `["ABC123", "DEF456"]` ou vazio?

---

## VERIFICAÇÃO 6: Mapeamento de produtos no plans_v2

```sql
-- EXECUTE E ENVIE O RESULTADO
SELECT
  id,
  name,
  vega_product_id,
  ggcheckout_product_id,
  amplopay_product_id,
  payment_type,
  price
FROM plans_v2
ORDER BY id;
```

**O que procurar:**
- Seus planos estão mapeados com `vega_product_id`?
- Ou estão NULL? (se NULL = PROBLEMA!)

---

## VERIFICAÇÃO 7: Testar RLS da sua posição

```sql
-- TESTE SE VOCÊ CONSEGUE VER WEBHOOKS COM SUA PERMISSÃO ATUAL
-- EXECUTE E ENVIE O RESULTADO
SELECT COUNT(*) as webhooks_visiveis
FROM webhook_logs;
```

**Resultado esperado:**
- Se retorna número > 0 → você consegue ver ✅
- Se retorna 0 → RLS está bloqueando ou table está vazia ⚠️

---

## VERIFICAÇÃO 8: RLS Policies aplicadas

```sql
-- VER TODAS AS RLS POLICIES DA TABELA
-- EXECUTE E ENVIE O RESULTADO
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'webhook_logs'
ORDER BY policyname;
```

**O que procurar:**
- Quantas policies tem?
- Todas começam com "Apenas admins"?

---

## VERIFICAÇÃO 9: Testar processo_webhook_payment RPC

```sql
-- TESTE A FUNÇÃO RPC (substitua os valores)
-- EXECUTE E ENVIE O RESULTADO (ou erro)
SELECT * FROM process_webhook_payment(
  p_webhook_id::UUID,
  p_customer_email := 'seu-email@teste.com',
  p_product_ids := '["ABC123"]'::jsonb,
  p_transaction_id := 'TEST123'
);
```

**O que procurar:**
- Erro ou sucesso?
- Quantos planos foram ativados?

---

## VERIFICAÇÃO 10: Trigger de reprocessamento

```sql
-- VER SE O TRIGGER EXISTE
-- EXECUTE E ENVIE O RESULTADO
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name LIKE '%webhook%';
```

**O que procurar:**
- Trigger `trigger_reprocess_webhook_on_user_created` existe?

---

## 📝 TEMPLATE DE RESPOSTA

Quando executar as verificações, envie para mim assim:

```
VERIFICAÇÃO 1:
[seu resultado aqui]

VERIFICAÇÃO 2:
[seu resultado aqui]

VERIFICAÇÃO 3:
[seu resultado aqui]

...

QUESTÕES:
- Você consegue ver webhooks no dashboard? (sim/não)
- Qual é o email de teste que você usou?
- Qual é o ID do produto Vega que você gerou PIX?
- Quando foi o último PIX que você enviou? (data/hora)
```

---

## 🎯 Após enviar as respostas:

Vou saber EXATAMENTE:
1. ✅ Se você tem permissão para ver webhooks (is_admin)
2. ✅ Se o webhook foi inserido no banco de dados
3. ✅ Qual é o status do webhook (received, pending, success, etc)
4. ✅ Se a coluna `platform` está vazia ou preenchida
5. ✅ Se o produto está mapeado em plans_v2
6. ✅ Se a RLS policy está bloqueando
7. ✅ Exatamente qual é o problema
8. ✅ Como corrigir

---

## ⚡ ORDEM DE EXECUÇÃO RECOMENDADA

1. **VERIFICAÇÃO 1** - Confirmar que você é admin
2. **VERIFICAÇÃO 2** - Ver estrutura da tabela
3. **VERIFICAÇÃO 3** - Quantos webhooks existem?
4. **VERIFICAÇÃO 4** - Ver dados dos webhooks
5. **VERIFICAÇÃO 5** - Dados específicos do seu teste
6. **VERIFICAÇÃO 6** - Verificar mapeamento de produtos
7. **VERIFICAÇÃO 7** - Testar sua visualização com RLS
8. **Se faltar algo, execute 8, 9, 10**

---

## ✨ Depois de fazer as verificações:

Envie os resultados que vou:
1. Identificar o EXATO ponto de falha
2. Criar a solução definitiva
3. Aplicar com garantia de funcionamento
4. Documentar tudo para evitar problemas futuros

**Vamos resolver isso da forma certa!** 🎯

