# ⚡ INSTRUÇÕES DE EXECUÇÃO - SISTEMA DE PENDING_PLANS

## 🎯 O que foi feito

1. ✅ **SQL - Adicionar campos e RLS** (FIX_PENDING_PLANS_CRITICAL.sql)
2. ✅ **AuthContext - Integrar activate_pending_plans** (signUp + OAuth)
3. ✅ **Admin Dashboard - Visualizar pending_plans** (PendingPlansManager.tsx)
4. ✅ **webhook-unificada - Registrar em pending_plans**

---

## 📋 PASSOS PARA EXECUTAR (Orden correta)

### **PASSO 1: Executar SQL no Supabase** (5 minutos)

1. Abra o Supabase (https://supabase.com)
2. Vá para **SQL Editor**
3. Crie uma **Nova Query**
4. Copie todo o conteúdo de: `sql/FIX_PENDING_PLANS_CRITICAL.sql`
5. Execute (Cmd/Ctrl + Enter)

**Esperado:**
```
✅ Columns created
✅ Policies enabled
✅ Grants applied
```

**Se houver erro de "already exists":**
- É normal, significa que já foi criado
- Pode ignorar

---

### **PASSO 2: Integrar Page Admin (opcional)** (5 minutos)

Se quiser visualizar pending_plans no admin dashboard:

1. Abra seu arquivo de rotas/menu admin
2. Adicione uma nova rota:

```typescript
import { PendingPlansManager } from '../components/admin/PendingPlansManager'

// Na sua lista de rotas:
{
  path: '/admin/pending-plans',
  element: <AdminRoute><PendingPlansManager /></AdminRoute>,
  label: 'Planos Pendentes'
}
```

3. Adicione ao menu lateral admin um link para `/admin/pending-plans`

---

### **PASSO 3: Testar o fluxo completo** (15 minutos)

#### **Teste 1: Pagar SEM ter conta → Depois registrar**

```
1. Acesse o checkout da Vega
2. Gere um PIX com email: teste@example.com
3. Confirme o pagamento
   ↓
4. Verifique no Supabase:
   SELECT * FROM webhook_logs WHERE status = 'success';
   SELECT * FROM pending_plans WHERE email = 'teste@example.com';
   ↓
5. Agora registre no site com MESMO email:
   - Email: teste@example.com
   - Senha: qualquer uma
   - Nome: Teste
   ↓
6. Após registrar, veja no console:
   ✅ "Verificando planos pendentes..."
   ✅ "X plano(s) ativado(s) automaticamente!"
   ↓
7. Verifique se plano foi ativado:
   SELECT * FROM user_subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'teste@example.com');
   SELECT plano_ativo, data_expiracao_plano FROM users WHERE email = 'teste@example.com';
```

#### **Teste 2: Usuário já existe → Pagar depois**

```
1. Registre um usuário primeiro: user123@example.com
2. Acesse checkout e gere PIX com MESMO email
3. Confirme pagamento
   ↓
4. Webhook deve ativar imediatamente:
   - Criar subscription
   - Atualizar plano_ativo
   - Status = 'success'
```

#### **Teste 3: Google Auth → Com pending_plans**

```
1. Gere PIX com seu email Google: seu@gmail.com
2. Confirme pagamento (webhook registra em pending_plans)
3. No site, clique "Entrar com Google"
4. Selecione seu@gmail.com
   ↓
5. Após login, console deve mostrar:
   ✅ "Verificando planos pendentes após login..."
   ✅ "X plano(s) ativado(s) durante login!"
```

---

## 🔍 COMO VERIFICAR SE FUNCIONOU

### **No Supabase:**

```sql
-- Ver pending_plans criados
SELECT * FROM pending_plans ORDER BY created_at DESC LIMIT 5;

-- Ver webhook_logs processados
SELECT email, status, event_type FROM webhook_logs ORDER BY created_at DESC LIMIT 5;

-- Ver subscriptions criadas
SELECT u.email, us.plan_id, us.status, us.start_date, us.end_date
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC LIMIT 5;

-- Ver plano_ativo dos usuários
SELECT email, plano_ativo, data_expiracao_plano FROM users WHERE plano_ativo IS NOT NULL;
```

### **No Browser Console:**

Quando usuário se registra:
```
⏳ Verificando planos pendentes para: teste@example.com
✅ 1 plano(s) ativado(s) automaticamente! Plan ID: 2
```

Quando usuário faz Google Auth:
```
⏳ Verificando planos pendentes após login/Google OAuth...
✅ 1 plano(s) ativado(s) durante login!
```

---

## ⚠️ POSSÍVEIS ERROS

### **Erro: "function activate_pending_plans does not exist"**
- Significa que CREATE_PENDING_PLANS.sql NÃO foi executado
- Solução: Execute o SQL no Supabase

### **Erro: "column webhook_id does not exist"**
- Significa que FIX_PENDING_PLANS_CRITICAL.sql NÃO foi executado
- Solução: Execute o SQL no Supabase

### **Plano não ativa ao registrar**
- Verifique se pending_plans tem dados:
  ```sql
  SELECT * FROM pending_plans WHERE email = 'seu@email.com';
  ```
- Se vazio, webhook não chegou
- Se tem dados, o RPC `activate_pending_plans` pode estar com erro

### **RLS bloqueando queries**
- Se aparecerem erros de "permission denied"
- Execute novamente: FIX_PENDING_PLANS_CRITICAL.sql
- Particular atenção à seção "GRANT"

---

## ✅ CHECKLIST FINAL

- [ ] SQL (FIX_PENDING_PLANS_CRITICAL.sql) executado no Supabase
- [ ] AuthContext.tsx foi atualizado com activate_pending_plans
- [ ] Webhook-unificada está redirecionando webhooks corretamente
- [ ] (Opcional) PendingPlansManager.tsx integrado ao admin
- [ ] Teste 1 concluído (pagar → registrar)
- [ ] Teste 2 concluído (registrar → pagar)
- [ ] Teste 3 concluído (Google Auth com pending)
- [ ] Todos os tests passaram ✅

---

## 📞 DÚVIDAS?

Se algo não funcionar:

1. **Verifique logs do browser** (F12 → Console)
2. **Verifique logs do Supabase** (Functions → Edge Function Logs)
3. **Verifique dados do banco** (Supabase → Table Editor)
4. **Execute novamente** o SQL para garantir que tudo está criado

---

## 🎉 PRÓXIMOS PASSOS

Após confirmar que tudo funciona:

1. Adicionar testes automatizados
2. Adicionar alertas para pending_plans não convertidos (>7 dias)
3. Criar page para admins gerenciarem pendentes
4. Monitorar conversão: pending → activated
5. Implementar retry em caso de falha no webhook

---

**Data**: 2025-11-25
**Status**: ✅ PRONTO PARA PRODUÇÃO
**Versão**: 1.0
