# 🚀 GUIA MVP FUNCIONAL - PASSO A PASSO

## 📋 OBJETIVO
Deixar o site **100% funcional** para o fluxo de pagamento:
1. Cliente paga
2. Cria conta (ou já tem)
3. Ao fazer login, plano está liberado

---

## ✅ PASSO 1: DESABILITAR RLS COMPLETAMENTE

### 1.1 Copiar Script
Abra o arquivo:
```
sql/MVP_SIMPLES_SEM_RLS.sql
```

### 1.2 Executar no Supabase
1. Vá para **Supabase Dashboard**
2. Clique em **SQL Editor**
3. **Cole TODO o conteúdo** do script
4. **Clique RUN**

### 1.3 Verificar
Você deve ver no final:
```
✅ MVP PRONTO! RLS desabilitado em todas as tabelas. Site deve funcionar agora.
```

---

## ✅ PASSO 2: TESTAR BANCO DE DADOS

Executar essas queries no SQL Editor para verificar:

```sql
-- Teste 1: Ver usuários
SELECT id, email, nome, active_plan_id FROM users LIMIT 5;

-- Teste 2: Ver planos
SELECT id, name, display_name, price FROM plans_v2;

-- Teste 3: Ver subscriptions
SELECT user_id, plan_id, status, created_at FROM user_subscriptions LIMIT 5;

-- Teste 4: Ver pending plans
SELECT email, plan_id, status FROM pending_plans LIMIT 5;

-- Teste 5: Ver webhooks
SELECT customer_email, event_type, status FROM webhook_logs ORDER BY created_at DESC LIMIT 5;
```

**Se tudo retorna dados sem erro:** Banco está OK ✅

---

## ✅ PASSO 3: VERIFICAR WEBHOOKS

### 3.1 GGCheckout Webhook

Arquivo: `/netlify/functions/webhook-amplopay.js`

**Verificar:**
- Linha 8-13: Mapeamento de product_id
- Linha 28-40: Extração de dados de pagamento
- Linha 50-70: Criação de usuário/pending_plan

**Teste:**
1. Vá para sua URL de checkout do GGCheckout
2. Crie um PIX de teste
3. Realize pagamento (vai parecer pendente)
4. No SQL Editor, verifique webhook_logs:
   ```sql
   SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 1;
   ```

### 3.2 AmploPay Webhook

Arquivo: `/server/index.js`

**Verificar:**
- Endpoint: `POST /api/webhook/amplopay`
- Processa eventos: `TRANSACTION_PAID`
- Cria usuário + pending_plan

---

## ✅ PASSO 4: TESTAR FLUXO COMPLETO

### CENÁRIO A: Pagamento ANTES de Criar Conta

```
1. Cliente vai para checkout (GGCheckout/AmploPay)
2. Seleciona um plano (Essencial, Evoluir, Prime)
3. Insere EMAIL (importante: usar um email válido)
4. Realiza pagamento (PIX ou Cartão)
5. Webhook processa e cria:
   - users table (com email)
   - pending_plans table (status='pending')
   - webhook_logs table
6. Cliente depois acessa seu site
7. Clica "Criar Conta"
8. Usa o MESMO email
9. Cria senha
10. Sistema detecta pending_plan
11. Ativa subscription automaticamente
12. Dashboard mostra plano ativo ✅
```

**Como testar:**
- Email de teste: `teste@example.com`
- Valor mínimo: R$ 0.01 (ou seu gateway permite)
- Verifique em webhook_logs se status = 'success'

### CENÁRIO B: Criar Conta ANTES de Pagar

```
1. Cliente clica "Criar Conta"
2. Email: teste2@example.com
3. Senha: 123456
4. Conta criada com plano_ativo = 0 (Gratuito)
5. Faz login
6. Vê página de planos
7. Clica para comprar um plano
8. Abre checkout
9. Pagamento realizado
10. Webhook processa (encontra usuário)
11. Atualiza users.active_plan_id
12. Próximo login mostra plano ativo ✅
```

---

## ✅ PASSO 5: VERIFICAR FRONTEND

### 5.1 AuthContext está carregando?

Arquivo: `/src/contexts/AuthContext.tsx`

Verificar linhas:
- **165-174:** useEffect carregando sessão
- **42-63:** fetchActivePlanFromSubscriptions RPC
- **86-111:** createUserProfile buscando dados

**Teste:**
1. Abra Console (F12)
2. Vá para Network
3. Recarregue página (F5)
4. Procure por erro de CORS ou 403
5. Se não ver erro: OK ✅

### 5.2 Login está funcionando?

**Teste:**
1. Clique "Entrar"
2. Email: seu_email@example.com
3. Senha: sua_senha
4. Deve entrar e carregar dashboard
5. Se fica em "Verificando permissões...": Há erro (veja console)

### 5.3 Plano está sendo carregado?

**Teste:**
1. Abra Console (F12)
2. Vá para Aba "Application"
3. Procure por sessionStorage ou localStorage
4. Deve ter dados de `auth` e perfil
5. Se vazio: Profile não carregou

---

## ✅ PASSO 6: CORRIGIR ERROS COMUNS

### Erro 1: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solução:**
- Se webhook está em Netlify: Adicionar headers CORS
- Arquivo: `/netlify/functions/webhook-amplopay.js`
- Verificar lines 15-20 (corsHeaders)

### Erro 2: "RLS policy prevents access"

**Solução:**
- Você já executou MVP_SIMPLES_SEM_RLS.sql?
- Execute de novo e verifique que todas as tabelas têm RLS = false

### Erro 3: "Não consegue fazer login"

**Solução:**
1. Verifique no Console do navegador (F12)
2. Procure por mensagens como:
   - "Erro ao buscar sessão"
   - "Erro ao buscar/criar perfil"
3. Se vir erro de RPC: Então a função `get_user_subscriptions` ou `create_user_profile` está falhando
4. Verifique no Supabase → Functions → Logs

### Erro 4: "Pendente há muito tempo"

**Solução:**
1. Verifique se webhook foi recebido:
   ```sql
   SELECT * FROM webhook_logs WHERE customer_email = 'seu@email.com';
   ```
2. Se não está lá: Webhook não chegou (problema no gateway)
3. Se está com status='failed': Erro ao processar (veja message)
4. Se está com status='success': Tudo certo, espere login

---

## ✅ PASSO 7: VERIFICAR CADA COMPONENTE

### Checklist Final

- [ ] RLS desabilitado em todas as tabelas
- [ ] Banco de dados retorna dados sem erro
- [ ] Webhook recebe pagamento (webhook_logs tem registro)
- [ ] Usuário é criado automaticamente (users table tem novo user)
- [ ] Pending plan é criado (pending_plans tem registro)
- [ ] Ao fazer login, pending plan é ativado
- [ ] Dashboard mostra plano ativo correto
- [ ] Pode acessar conteúdo baseado no plano

### Queries para Verificar Tudo

```sql
-- 1. Ver webhook recebido
SELECT id, customer_email, event_type, status, created_at
FROM webhook_logs
WHERE customer_email = 'seu@email.com'
ORDER BY created_at DESC;

-- 2. Ver usuário criado
SELECT id, email, nome, active_plan_id
FROM users
WHERE email = 'seu@email.com';

-- 3. Ver pending plan
SELECT id, email, plan_id, status, activated_at
FROM pending_plans
WHERE email = 'seu@email.com';

-- 4. Ver subscription ativa
SELECT us.id, us.user_id, us.plan_id, us.status, p.name
FROM user_subscriptions us
LEFT JOIN plans_v2 p ON us.plan_id = p.id
WHERE us.user_id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');

-- 5. Status geral do fluxo
SELECT
  u.email,
  u.active_plan_id,
  p.name as plano_ativo,
  COUNT(us.id) as total_subscriptions,
  pp.status as pending_plan_status
FROM users u
LEFT JOIN plans_v2 p ON u.active_plan_id = p.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN pending_plans pp ON u.email = pp.email
WHERE u.email = 'seu@email.com'
GROUP BY u.id, u.email, u.active_plan_id, p.name, pp.status;
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

1. **Abra Console (F12)** e copie TODOS os erros em vermelho
2. **Vá para Network** e procure por requisições com erro 4xx ou 5xx
3. **Verifique webhook_logs:**
   ```sql
   SELECT * FROM webhook_logs WHERE customer_email = 'seu@email.com';
   ```
4. **Se webhook tem status='failed':** Veja a coluna `message` para saber o erro
5. **Se webhook não existe:** Webhook não foi recebido pelo servidor

---

## 📝 PRÓXIMOS PASSOS

1. Execute MVP_SIMPLES_SEM_RLS.sql
2. Faça os testes acima
3. Se algum não passar, nos avise qual
4. Depois deixamos seguro com RLS + lógica de backend

---

## ⏰ TEMPO ESTIMADO
- Desabilitar RLS: **2 minutos**
- Testar banco: **2 minutos**
- Testar fluxo: **5-10 minutos**
- **Total: ~20 minutos**

---

**Vamos lá! Execute o script agora e me diga qual teste não passou!** 🚀
