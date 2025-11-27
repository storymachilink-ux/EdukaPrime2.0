# 🔧 INSTRUÇÕES PARA CORRIGIR BUG DE REMOVER PONTOS

## Problema
Admin não consegue remover/adicionar pontos de usuários na página de moderação de chat.

**Causa:** Row Level Security (RLS) do Supabase está bloqueando a atualização porque a policy permite UPDATE apenas quando `user_id = auth.uid()`.

Quando o admin tenta atualizar pontos de outro usuário, a RLS bloqueia com erro silencioso.

---

## Solução
Criar uma **Função RPC com `SECURITY DEFINER`** que contorna RLS e verifica se o usuário é admin.

---

## PASSO 1: Executar Script SQL no Supabase

1. Abra o Supabase Console: https://app.supabase.com
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie TODO o conteúdo do arquivo: `sql/fix_admin_update_points.sql`
5. Cole no editor SQL
6. Clique em **Run**

**Esperado:** Mensagem de sucesso (sem erros em vermelho)

```
Executing...
Finished in 312ms
```

---

## PASSO 2: Testar a Função

Na mesma aba do SQL Editor, execute este teste:

```sql
-- Listar usuários para pegar IDs
SELECT id, nome, email, is_admin
FROM public.users
LIMIT 5;
```

**Copie um ID de usuário não-admin**

Depois execute:

```sql
-- Testar: Adicionar 100 pontos
SELECT update_user_chat_points(
  'COLE_O_ID_AQUI'::uuid,  -- ← Cole o ID copiado
  100
);
```

**Esperado:** Retorna JSON com sucesso:
```json
{
  "success": true,
  "message": "100 ponto(s) adicionado(s)",
  "old_points": 80,
  "new_points": 180,
  "delta": 100
}
```

---

## PASSO 3: Verificar a Mudança no Banco

```sql
-- Verificar se os pontos foram realmente atualizados
SELECT user_id, total_points
FROM public.chat_user_stats
WHERE user_id = 'COLE_O_ID_AQUI'::uuid;
```

**Esperado:** `total_points` deve ser 180 (ou outro valor refletindo a mudança)

---

## PASSO 4: Testar no Admin Dashboard

1. Abra: `https://seu-dominio.com/admin/moderacao-chat`
2. Selecione um usuário na lista de pontos
3. Digite um número (ex: `-10` para remover 10 pontos)
4. Clique em **➖ Remover Pontos**

**Esperado:**
- ✅ Mensagem de sucesso com valores antes/depois
- ✅ Top 10 atualizado com novos pontos
- ✅ Sem mais erros RLS

---

## 🚨 TROUBLESHOOTING

### Erro: "Função update_user_chat_points não existe"

**Solução:** Execute o script SQL novamente. Verifique se:
- [ ] Copiou TODO o arquivo `fix_admin_update_points.sql`
- [ ] Executou SEM erros no SQL Editor
- [ ] Espere 10-20 segundos e recarregue o navegador

### Erro: "Permissão negada. Apenas admin pode atualizar pontos."

**Solução:** Faça login com uma conta que tenha `is_admin = true` no banco.

Verificar:
```sql
SELECT id, nome, email, is_admin FROM public.users
WHERE email = 'seu-email@aqui.com';
```

Se `is_admin` for `false` ou `NULL`, execute:

```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'seu-email@aqui.com';
```

### Erro: "RLS ainda está bloqueando"

**Solução:** O TypeScript pode estar usando `.from()` ao invés de `.rpc()`.

Verifique se o arquivo `src/pages/admin/ChatModeracao.tsx` foi atualizado. Procure por:

```typescript
const { data, error } = await supabase
  .rpc('update_user_chat_points', {
    target_user_id: selectedUser,
    points_delta: pointsToAdd
  });
```

Se não encontrar, atualize manualmente o método `handleUpdatePoints`.

---

## 📋 Checklist de Confirmação

- [ ] Script SQL executado sem erros
- [ ] Teste com `SELECT update_user_chat_points(...)` retornou sucesso
- [ ] Pontos no banco foram realmente atualizados
- [ ] Frontend atualizado com novo código RPC
- [ ] Admin consegue remover pontos de usuários
- [ ] Mensagens de sucesso mostram valores corretos

---

## 🔍 Como Funciona a Solução

### Antes (❌ Bloqueado por RLS)
```
Admin clica em "Remover Pontos"
  ↓
ChatModeracao.tsx executa:
  supabase.from('chat_user_stats').update(...)
  ↓
RLS policy verifica: selectedUser == auth.uid() ?
  ↓
NÃO → UPDATE bloqueado (0 linhas afetadas)
```

### Depois (✅ Funciona com RPC)
```
Admin clica em "Remover Pontos"
  ↓
ChatModeracao.tsx executa:
  supabase.rpc('update_user_chat_points', {...})
  ↓
Função RPC (SECURITY DEFINER) ignora RLS
  ↓
Função valida: auth.uid().is_admin == true ?
  ↓
SIM → UPDATE permitido ✅
```

---

## 🔒 Segurança

A solução é segura porque:

1. ✅ **Função verifica se usuário é admin** - Não qualquer autenticado
2. ✅ **Sem exposure de service_role_key** - Service role não está no frontend
3. ✅ **Auditável** - Supabase registra quem executou a função
4. ✅ **Sem recursão infinita** - SECURITY DEFINER permite leitura sem RLS infinito
5. ✅ **Validações** - Nunca cria pontos negativos

---

## 📚 Referências

- Arquivo: `sql/fix_admin_update_points.sql`
- Código TypeScript: `src/pages/admin/ChatModeracao.tsx` (linha 264+)
- Documentação Supabase: https://supabase.com/docs/guides/auth/row-level-security

---

## ❓ Dúvidas?

Se tiver problemas:

1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs do Supabase (https://app.supabase.com → Logs)
3. Verifique se a função RPC foi criada:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'update_user_chat_points';
   ```

Se a função não aparecer, execute o script SQL novamente.
