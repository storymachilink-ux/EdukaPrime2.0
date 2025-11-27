# 🔧 FIX: Erro na função activate_pending_plans()

## ❌ O Erro

```
Error: Failed to run sql query: ERROR: 42P13: cannot change return type of existing function
DETAIL: Row type defined by OUT parameters is different.
HINT: Use DROP FUNCTION activate_pending_plans(uuid,character varying) first.
```

## ✅ Solução

Esse erro significa que a função `activate_pending_plans()` já existe em seu banco com uma assinatura diferente.

### **OPÇÃO 1: Usar o arquivo CORRIGIDO (Recomendado)**

Em vez de executar o arquivo `003_criar_ou_ajustar_pending_plans.sql` original, execute:

**`sql/003_FIX_criar_ou_ajustar_pending_plans.sql`** ← NOVO ARQUIVO

Este arquivo:
- ✅ Remove a função antiga AUTOMATICAMENTE
- ✅ Cria a tabela pending_plans
- ✅ Cria a função nova com a assinatura correta
- ✅ Tudo em um comando único

### **OPÇÃO 2: Remover função manualmente (Se preferir)**

Se você já executou o arquivo antigo, execute isto no Supabase SQL Editor:

```sql
-- Remover a função antiga
DROP FUNCTION IF EXISTS activate_pending_plans(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS activate_pending_plans(uuid, character varying) CASCADE;
```

Depois execute o arquivo original `003_criar_ou_ajustar_pending_plans.sql`

---

## 📋 RESUMO DOS PASSOS

### **Se você ainda NÃO executou o arquivo SQL 003:**

```
1. Execute 001_ajustar_plans_v2_ids_gateway.sql
2. Execute 002_add_constraints_idempotencia_subscriptions.sql
3. Execute 003_FIX_criar_ou_ajustar_pending_plans.sql ← ESTE (o novo)
4. Execute 004_ajustar_webhook_logs.sql
```

### **Se você JÁ executou o arquivo SQL 003 original:**

```
1. Execute no Supabase:
   DROP FUNCTION IF EXISTS activate_pending_plans(UUID, VARCHAR) CASCADE;

2. Depois execute:
   003_FIX_criar_ou_ajustar_pending_plans.sql

3. Depois continue com:
   004_ajustar_webhook_logs.sql
```

---

## ✔️ VERIFICAR SE ESTÁ CORRETO

Após executar o arquivo FIX, verifique:

```sql
-- No Supabase SQL Editor, execute:

-- Ver se a tabela existe
SELECT COUNT(*) FROM pending_plans;

-- Ver se a função existe
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'activate_pending_plans';

-- Ver os parâmetros da função
SELECT pg_get_functiondef('activate_pending_plans(uuid, character varying)'::regprocedure);
```

Deve retornar:
- ✅ Tabela pending_plans criada
- ✅ Função activate_pending_plans existe
- ✅ Sem erros

---

## 🎯 PRÓXIMO PASSO

Após resolver isso, execute:

```
004_ajustar_webhook_logs.sql
```

E pronto! Sua webhook-unificada estará 100% funcional! 🚀

---

## 💡 POR QUE ISSO ACONTECEU?

A função `activate_pending_plans()` pode ter sido criada anteriormente com parâmetros OUT diferentes. PostgreSQL não permite mudar a assinatura de uma função sem removê-la primeiro.

O arquivo FIX faz isso automaticamente com:
```sql
DROP FUNCTION IF EXISTS activate_pending_plans(UUID, VARCHAR) CASCADE;
```

Isso garante que você sempre terá a versão correta! ✅
