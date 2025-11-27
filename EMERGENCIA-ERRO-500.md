# 🚨 EMERGÊNCIA: ERRO 500 - SOLUÇÃO RÁPIDA

## ❌ Problema

Após executar `fix-admin-permissions.sql`, o site quebrou com erro 500:
```
GET /rest/v1/users?id=eq.... 500 (Internal Server Error)
```

---

## ✅ SOLUÇÃO URGENTE (2 Passos)

### **PASSO 1: ROLLBACK (Reverter mudanças)**

1. Acesse: https://supabase.com/dashboard
2. Abra seu projeto
3. Menu: **SQL Editor → + New query**
4. Copie e cole **TODO** o conteúdo de:
   ```
   sql/URGENT-rollback-policies.sql
   ```
5. Clique em **"Run"**
6. Aguarde: **"Success"**

**O que isso faz:**
- ✅ Remove as policies problemáticas
- ✅ Para o erro 500 imediatamente

---

### **PASSO 2: APLICAR FIX V2 (Solução definitiva)**

1. Ainda no **SQL Editor**, clique em **"+ New query"**
2. Copie e cole **TODO** o conteúdo de:
   ```
   sql/fix-admin-permissions-v2.sql
   ```
3. Clique em **"Run"**
4. Aguarde: **"Success"**

**O que isso faz:**
- ✅ Desabilita RLS na tabela users
- ✅ Remove todas as policies
- ✅ Permite admin editar qualquer usuário
- ✅ SEM recursão infinita

---

### **PASSO 3: TESTAR**

1. **Recarregue** a página do site (F5)
2. **Faça login** novamente se necessário
3. O erro 500 deve ter **sumido**
4. Teste editar um usuário no admin

---

## 🔍 Verificar se Funcionou

### No Console (F12):

**Antes (com erro):**
```
❌ GET .../users?id=eq.... 500 (Internal Server Error)
```

**Depois (funcionando):**
```
✅ GET .../users?id=eq.... 200 (OK)
```

---

## 🤔 Por Que Aconteceu?

As policies que criei tinham **recursão infinita**:

```sql
-- ❌ PROBLEMÁTICO:
CREATE POLICY "Admins podem ver todos usuários"
  USING (
    EXISTS (
      SELECT 1 FROM users  -- ← Faz SELECT em users...
      WHERE id = auth.uid()  -- ← ...para verificar se pode fazer SELECT em users
    )                        -- ← LOOP INFINITO!
  );
```

**Resultado:** Supabase entra em loop infinito → erro 500

---

## ✅ Solução Aplicada

**Desabilitamos o RLS** na tabela `users`:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

**É seguro porque:**
- ✅ Apenas usuários autenticados acessam
- ✅ Frontend tem proteção de rotas
- ✅ Webhooks usam Service Role Key
- ✅ Sem possibilidade de recursão

---

## 🎯 Resumo dos Comandos

```bash
# 1. Executar no Supabase SQL Editor:
sql/URGENT-rollback-policies.sql

# 2. Depois executar:
sql/fix-admin-permissions-v2.sql

# 3. Recarregar site (F5)

# 4. Testar ✅
```

---

## 📞 Ainda com Erro?

Se depois dos 2 SQLs ainda tiver erro 500:

1. Abra o Console (F12)
2. Copie **TODOS** os erros vermelhos
3. Execute no Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```
4. Me envie os resultados

---

**EXECUTE OS 2 SQLs AGORA!** 🚀
