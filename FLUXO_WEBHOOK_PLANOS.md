# 🎯 Fluxo Completo: Webhook → Clientes → Planos

## 1️⃣ Visão Geral do Sistema

```
CLIENTE             GATEWAY               SUPABASE            SITE
┌──────┐           ┌──────┐            ┌──────────┐         ┌──────┐
│ Vega │ ─ PIX ─> │Vega  │ ─ POST ──> │ Webhook  │ ──────> │React │
│      │          │      │            │ Function │         │      │
└──────┘          └──────┘            └──────────┘         └──────┘
  Paga               Aprova               Processa            Mostra
  R$99               Pagamento            Dados               Acesso
```

---

## 2️⃣ AS 3 PLATAFORMAS DE PAGAMENTO (GATEWAYS)

### A) VEGA (PIX)
- **O que é**: Plataforma de pagamento com PIX
- **Webhook envia**: `payload.items`, `payload.status`, `payload.customer`
- **Nosso produto ID**: `vega_product_id` (configurado em `plans_v2`)

### B) GGCHECKOUT
- **O que é**: Checkout do GG (plataforma de cursos)
- **Webhook envia**: `payload.products`, `payload.status`, `payload.customer`
- **Nosso produto ID**: `ggcheckout_product_id`

### C) AMPLOPAY
- **O que é**: Plataforma de pagamento (alternativa)
- **Webhook envia**: `payload.product_id`, `payload.status`, `payload.customer`
- **Nosso produto ID**: `amplopay_product_id`

---

## 3️⃣ FLUXO PASSO A PASSO

### CENÁRIO 1: Cliente Paga ANTES de Ter Conta

```
1. Cliente vê anúncio do curso
   └─> Clica em "Comprar"

2. Gateway (Vega/GG/Amplo) processa pagamento
   └─> Cliente paga R$ 99
   └─> Pagamento APROVADO ✅

3. Gateway envia WEBHOOK para nossa função:
   POST /functions/webhook-unificada

   Payload exemplo (Vega):
   {
     "customer": {
       "email": "cliente@gmail.com",
       "name": "João Silva"
     },
     "items": [{ "code": "VEGA_PROD_123" }],
     "status": "approved",
     "total_price": 9900  // R$ 99.00 em centavos
   }

4. NOSSA FUNÇÃO (supabase/functions/webhook-unificada/index_SIMPLES.ts):

   ✓ Detecta plataforma: "vega"
   ✓ Extrai dados:
     - email: "cliente@gmail.com"
     - amount: 99.00
     - product_id: "VEGA_PROD_123"
     - event_type: "payment.approved"

   ✓ Insere em webhook_logs (registro de tudo)

   ✓ Procura o plano em plans_v2:
     SELECT * FROM plans_v2
     WHERE vega_product_id = "VEGA_PROD_123"

     Retorna: { id: 2, nome: "Premium", duration_days: 30 }

   ✓ Busca usuário:
     SELECT * FROM users WHERE email = "cliente@gmail.com"

     ❌ USUÁRIO NÃO EXISTE!

5. CRIAR PENDING_PLAN (plano pendente):

   INSERT INTO pending_plans {
     email: "cliente@gmail.com",
     plan_id: 2,           // Premium
     status: "pending",
     start_date: now(),
     end_date: now() + 30 days,
     payment_id: "vega_12345",
     amount_paid: 99.00,
     platform: "vega"
   }

   ✅ Pendente criado! Aguardando signup...

6. Cliente recebe email:
   "Seu pagamento foi confirmado!"
   "Clique aqui para criar conta e acessar"

7. Cliente clica no link e faz SIGNUP:
   - Email: cliente@gmail.com
   - Senha: ****
   - Nome: João Silva

   ✅ Usuário criado em auth_users

8. AUTH CONTEXT CHECA PENDING PLANS (RPC):

   RPC 'activate_pending_plans' executa:

   UPDATE pending_plans
   SET status = 'activated'
   WHERE email = 'cliente@gmail.com'
   RETURNING activated_count

   ✅ 1 plano ativado!

9. CRIAR SUBSCRIPTION (subscrição ativa):

   INSERT INTO user_subscriptions {
     user_id: "uuid_novo_usuario",
     plan_id: 2,
     status: "active",
     start_date: data_original_do_pagamento,
     end_date: data_original + 30 days,
     payment_id: "vega_12345"
   }

   UPDATE users
   SET active_plan_id = 2
   WHERE id = "uuid_novo_usuario"

10. CLIENTE VENDO O SITE:
    - Dashboard carrega
    - Vê: "Premium - Válido até 25/01/2025"
    - Botão "Acessar Atividades" aparece
    - Pode baixar papercrafts, assistir vídeos

11. RPC 'user_has_feature_access' checa acesso:

    SELECT EXISTS(
      SELECT 1 FROM user_subscriptions
      WHERE user_id = 'uuid' AND plan_id IN (2) -- Premium
      AND NOW() BETWEEN start_date AND end_date
    )

    ✅ TRUE - Acesso liberado!
```

---

### CENÁRIO 2: Cliente Paga DEPOIS de Ter Conta

```
1. Cliente já tem conta criada:
   users { id: "uuid_456", email: "cliente@gmail.com" }

2. Vê premium e clica em "Upgrade"
   └─> Vai para Vega/GG/Amplo
   └─> Paga R$ 99
   └─> Status: "approved"

3. Webhook chega com email "cliente@gmail.com"

4. Nossa função processa:
   ✓ Busca usuário pelo email:
     SELECT id FROM users WHERE email = 'cliente@gmail.com'
     └─> Encontra: id = "uuid_456" ✅

5. CRIAR SUBSCRIPTION DIRETO:

   INSERT INTO user_subscriptions {
     user_id: "uuid_456",
     plan_id: 2,
     status: "active",
     start_date: now(),
     end_date: now() + 30 days,
     payment_id: "vega_12345"
   }

6. ATUALIZAR PLANO DO USUÁRIO:

   UPDATE users
   SET active_plan_id = 2
   WHERE id = "uuid_456"

7. Cliente faz F5 no site
   └─> AuthContext carrega profile
   └─> active_plan_id = 2
   └─> Dashboard mostra "Premium Ativo"
   └─> Acesso a todas features liberado
```

---

## 4️⃣ BANCO DE DADOS - TABELAS PRINCIPAIS

### `plans_v2` - Os Planos Disponíveis
```
id  | nome      | duration_days | vega_product_id | ggcheckout_product_id | amplopay_product_id
────┼───────────┼───────────────┼─────────────────┼───────────────────────┼────────────────────
1   | Gratuito  | 0             | NULL            | NULL                  | NULL
2   | Premium   | 30            | "VEGA_PROD_123" | "GG_PROD_456"         | "AMPLO_PROD_789"
3   | Lifetime  | 36500         | "VEGA_PROD_999" | "GG_PROD_888"         | NULL
```

### `users` - Clientes Registrados
```
id        | email              | nome          | active_plan_id | is_admin
──────────┼────────────────────┼───────────────┼────────────────┼──────────
uuid_001  | joao@gmail.com     | João Silva    | 2              | false
uuid_002  | maria@gmail.com    | Maria Santos  | 1              | false
uuid_003  | admin@email.com    | Admin User    | 3              | true
```

### `pending_plans` - Pagamentos Aguardando Signup
```
id  | email              | plan_id | status       | payment_id     | amount_paid
────┼────────────────────┼─────────┼──────────────┼────────────────┼─────────────
1   | novo@gmail.com     | 2       | pending      | "vega_12345"   | 99.00
2   | outro@gmail.com    | 3       | activated    | "gg_67890"     | 399.00
```

### `user_subscriptions` - Subscrições Ativas
```
id  | user_id   | plan_id | status | start_date        | end_date          | payment_id
────┼───────────┼─────────┼────────┼───────────────────┼───────────────────┼────────────
1   | uuid_001  | 2       | active | 2024-11-01        | 2024-12-01        | "vega_12345"
2   | uuid_002  | 1       | active | 2024-01-01        | 2099-01-01        | NULL
3   | uuid_003  | 3       | active | 2024-11-15        | 2025-11-15        | "gg_67890"
```

### `webhook_logs` - Registro de Todos Webhooks
```
id  | platform | event_type      | status    | customer_email     | amount | created_at
────┼──────────┼─────────────────┼───────────┼────────────────────┼────────┼────────────────
1   | vega     | payment.pending | received  | novo@gmail.com     | 99.00  | 2024-11-26 10:15
2   | vega     | payment.approved| success   | novo@gmail.com     | 99.00  | 2024-11-26 10:16
3   | gg       | payment.approved| success   | outro@gmail.com    | 399.00 | 2024-11-26 11:20
```

---

## 5️⃣ FLUXO NO REACT (FRONTEND)

### AuthContext.tsx
```typescript
// 1. Usuário faz login ou F5
const { data: { session } } = await supabase.auth.getSession()

// 2. Se tem sessão, carrega profile
if (session?.user) {
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  setProfile(profile)  // Agora tem active_plan_id
}

// 3. Ativa pending_plans se houver
const { data: activated } = await supabase.rpc(
  'activate_pending_plans',
  { user_id: session.user.id, user_email: session.user.email }
)
// Retorna: { activated_count: 1, plan_id: 2 }
```

### Dashboard.tsx
```typescript
// Checa acesso baseado em profile.active_plan_id
if (profile?.active_plan_id === 0) {
  // Gratuito - mostra only free content
} else if (profile?.active_plan_id === 2) {
  // Premium - mostra tudo
} else if (profile?.active_plan_id === 3) {
  // Lifetime - mostra TUDO + admin
}

// Ou usa RPC para verificação complexa
const hasAccess = await supabase.rpc('user_has_feature_access', {
  p_user_id: user.id,
  p_feature_name: 'videos'  // videos, atividades, papercrafts, etc
})
```

---

## 6️⃣ FLUXO WEBHOOK - FUNÇÃO DETALHADA

### `supabase/functions/webhook-unificada/index_SIMPLES.ts`

```typescript
serve(async (req: Request) => {
  const payload = await req.json()

  // 1. DETECTAR PLATAFORMA
  let platform = 'unknown'
  if (payload.items) platform = 'vega'
  else if (payload.products) platform = 'ggcheckout'
  else if (payload.product_id) platform = 'amplopay'

  // 2. EXTRAIR DADOS
  let customer_email, amount, product_id, event_type

  if (platform === 'vega') {
    customer_email = payload.customer?.email?.toLowerCase()
    amount = payload.total_price / 100  // Centavos para reais
    product_id = payload.items?.[0]?.code
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
  }
  // ... mesmo para GG e Amplo

  // 3. REGISTRAR LOG
  const { data: insertData } = await supabase
    .from('webhook_logs')
    .insert({ platform, event_type, customer_email, amount, ... })
    .select()

  // 4. SE PAGAMENTO APROVADO
  if (event_type === 'payment.approved') {
    // Buscar plano pelo product_id
    const { data: planData } = await supabase
      .from('plans_v2')
      .select('id, duration_days')
      .or(`vega_product_id.eq.${product_id},ggcheckout_product_id.eq.${product_id},...`)
      .maybeSingle()

    if (planData) {
      // Buscar usuário
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer_email)
        .maybeSingle()

      if (userData) {
        // USUÁRIO EXISTE -> Criar subscription direto
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userData.id,
            plan_id: planData.id,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + planData.duration_days * 86400000).toISOString(),
            payment_id: payload.id
          })

        // Atualizar plano do usuário
        await supabase
          .from('users')
          .update({ active_plan_id: planData.id })
          .eq('id', userData.id)
      } else {
        // USUÁRIO NÃO EXISTE -> Criar pending_plan
        await supabase
          .from('pending_plans')
          .insert({
            email: customer_email,
            plan_id: planData.id,
            status: 'pending',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + planData.duration_days * 86400000).toISOString(),
            payment_id: payload.id,
            platform
          })
      }
    }
  }

  return { success: true }
})
```

---

## 7️⃣ RPC FUNCTIONS (Supabase SQL Functions)

### `activate_pending_plans`
```sql
CREATE OR REPLACE FUNCTION activate_pending_plans(
  user_id UUID,
  user_email TEXT
) RETURNS TABLE(activated_count INT, plan_id INT) AS $$
BEGIN
  -- Atualizar pending_plans
  UPDATE pending_plans
  SET status = 'activated'
  WHERE email = user_email AND status = 'pending'
  RETURNING plan_id;

  -- Criar subscription de cada pending_plan
  INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_id)
  SELECT user_id, plan_id, 'active', start_date, end_date, payment_id
  FROM pending_plans
  WHERE email = user_email AND status = 'activated';

  -- Atualizar active_plan_id do usuário
  UPDATE users
  SET active_plan_id = (SELECT plan_id FROM pending_plans WHERE email = user_email LIMIT 1)
  WHERE id = user_id;

  RETURN QUERY SELECT COUNT(*), MAX(plan_id) FROM pending_plans WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;
```

### `user_has_feature_access`
```sql
CREATE OR REPLACE FUNCTION user_has_feature_access(
  p_user_id UUID,
  p_feature_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Se é admin, libera tudo
  IF (SELECT is_admin FROM users WHERE id = p_user_id) THEN
    RETURN true;
  END IF;

  -- Se é lifetime, libera tudo
  IF (SELECT has_lifetime_access FROM users WHERE id = p_user_id) THEN
    RETURN true;
  END IF;

  -- Verificar se tem subscription ativa para este feature
  RETURN EXISTS(
    SELECT 1 FROM user_subscriptions us
    JOIN plan_atividades pa ON us.plan_id = pa.plan_id
    WHERE us.user_id = p_user_id
      AND pa.feature_name = p_feature_name
      AND NOW() BETWEEN us.start_date AND us.end_date
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 8️⃣ FLUXO VISUAL COMPLETO

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CENÁRIO: NOVO CLIENTE PAGA                       │
└─────────────────────────────────────────────────────────────────────┘

   CLIENTE                GATEWAY              SUPABASE          REACT

1. Clica em
   "Comprar"  ──────────►  Vega/GG/Amplo

2.                         Processa PIX
                           Aprovado ✅
                                  │
3.                                └──────► webhook_logs
                                          (registra)
                                                 │
4.                                         plans_v2
                                          (busca plano)
                                                 │
5.                                         users
                                    (busca cliente)
                                                 │
                            ┌─── NÃO EXISTE ───┘
                            │
6.                      pending_plans
                     (cria plano pendente)
                                │
7. Recebe email                 │
   "Pagamento OK"               │
   "Clique para signin"          │
                                 │
8. Clica no link                 │
   Faz signup                     │
   users ◄──────────────────────┘
   (novo usuário criado)
                                 │
9.                         onAuthStateChange
                           AuthContext.tsx
                                 │
10.                      activate_pending_plans
                              (RPC)
                                 │
11.                         user_subscriptions
                        (ativa subscrição)
                                 │
12.                            users
                      (atualiza active_plan_id)
                                 │
13. Dashboard                     │
    carrega ◄─────────────────────┘
    Vê: "Premium - Até 25/01"
    Botões liberam ✅
```

---

## 9️⃣ FLUXOS ALTERNATIVOS

### Se Cliente Já Tem Conta
```
Paga → Webhook → Busca user BY EMAIL → ENCONTRA ✅
→ Cria subscription direto → Atualiza active_plan_id
→ F5 no site → Mostra novo plano
```

### Se Subscription Expirar
```
active_plan_id = 2 (Premium)
end_date = 2024-12-01

F5 no site → RPC user_has_feature_access
→ Verifica: NOW() BETWEEN start_date AND end_date?
→ NÃO! → Retorna FALSE
→ Mostra: "Premium expirado, renove!"
```

### Se Client Fizer Chargeback (Devolver Dinheiro)
```
Gateway envia: event_type = "payment.chargeback"

Webhook recebe → status = "chargeback"
→ webhook_logs registra

[AQUI VOCÊ PRECISA ADICIONAR LÓGICA]
Opção 1: Remover active_plan_id
Opção 2: Bloquear usuário
Opção 3: Avisar admin
```

---

## 🔟 CAMPOS IMPORTANTES EM plans_v2

```
id                    | Identificador (1, 2, 3...)
nome                  | "Premium", "Lifetime"...
duration_days         | Quantos dias dura (30, 365, 36500)
vega_product_id       | ID do produto na Vega
ggcheckout_product_id | ID do produto na GGCheckout
amplopay_product_id   | ID do produto na Amplopay
price                 | Preço em reais
```

**IMPORTANTE**: Você PRECISA preencher os `*_product_id` campos em plans_v2 para cada plataforma!

Exemplo:
```sql
UPDATE plans_v2
SET
  vega_product_id = 'VEGA_PROD_123',
  ggcheckout_product_id = 'GG_PROD_456',
  amplopay_product_id = 'AMPLO_PROD_789'
WHERE id = 2;
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

- [ ] `plans_v2` preenchido com `vega_product_id`, `ggcheckout_product_id`, `amplopay_product_id`
- [ ] Webhook URL configurada em cada gateway (Vega, GG, Amplo)
- [ ] RPC `activate_pending_plans` criado
- [ ] RPC `user_has_feature_access` criado
- [ ] `supabase/functions/webhook-unificada/index_SIMPLES.ts` deployado
- [ ] RLS desabilitado em todas as tabelas
- [ ] AuthContext carregando profile corretamente

---

## 🎯 RESUMO FINAL

**O Sistema Funciona Assim:**

1. **Cliente paga** em qualquer gateway (Vega/GG/Amplo)
2. **Gateway envia webhook** com dados do pagamento
3. **Nossa função recebe**, identifica a plataforma e plano
4. **Se usuário existe**: Cria subscription direto
5. **Se não existe**: Cria pending_plan (aguarda signup)
6. **Quando usuário faz signup**: RPC ativa os pending_plans
7. **Dashboard mostra acesso**: Baseado em active_plan_id
8. **RPC verifica cada feature**: Antes de liberar conteúdo

**Resultado**: Fluxo automático de pagamento → acesso sem admin manual! 🚀
