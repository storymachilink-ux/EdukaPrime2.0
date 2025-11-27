# Integração de Pending Plans no Signup

## 📋 O que fazer

Quando um usuário se registra/faz signup no site, você deve chamar a função `activate_pending_plans` para verificar se ele tem algum plano pendente.

---

## 🎯 Cenários

### **Cenário 1: Usuário paga PIX ANTES de se registrar**
```
1. Gera PIX (webhook-unificada registra em pending_plans)
2. Usuário se registra
3. Na confirmação de registro, chamar activate_pending_plans
4. ✅ Plano é automaticamente ativado
```

### **Cenário 2: Usuário se registra SEM ter pago**
```
1. Usuário se registra
2. Na confirmação de registro, chamar activate_pending_plans
3. ✅ Nenhum plano pendente → function retorna count = 0
4. Usuário fica sem plano (como esperado)
```

---

## 🔧 Como integrar no seu signup

### **Opção A: No componente de signup (React)**

Se você tem um arquivo de signup, adicione:

```typescript
import { supabase } from '@/lib/supabase'

async function handleSignup(email: string, password: string) {
  try {
    // 1. Registrar usuário na Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('Erro ao registrar:', authError)
      return
    }

    const userId = authData.user?.id

    // 2. Esperar um pouco para o trigger de criação de usuário
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 3. Ativar planos pendentes
    console.log('Verificando planos pendentes...')
    const { data, error: pendingError } = await supabase
      .rpc('activate_pending_plans', {
        user_id: userId,
        user_email: email.toLowerCase(),
      })

    if (pendingError) {
      console.error('Erro ao ativar planos pendentes:', pendingError)
    } else {
      console.log('✅ Planos ativados:', data)
      if (data?.[0]?.activated_count > 0) {
        console.log(`🎉 ${data[0].activated_count} plano(s) ativado(s)!`)
        // Aqui você pode mostrar uma notificação ao usuário
      }
    }

    return { success: true, userId }
  } catch (error) {
    console.error('Erro no signup:', error)
    return { success: false, error }
  }
}
```

---

### **Opção B: Em uma Edge Function**

Se você tem uma edge function para signup:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body = await req.json()
  const { user_id, email } = body

  // Ativar planos pendentes
  const { data, error } = await supabase
    .rpc('activate_pending_plans', {
      user_id: user_id,
      user_email: email.toLowerCase(),
    })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 200 })
})
```

---

### **Opção C: Via Trigger (automático)**

Se você quer que seja automático sem alterar o código, pode criar um trigger:

```sql
CREATE OR REPLACE FUNCTION activate_plans_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar a função de ativação quando novo usuário é criado
  PERFORM activate_pending_plans(NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_activate_plans_on_signup
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION activate_plans_on_user_creation();
```

---

## ⚙️ Requisitos

1. **Tabela `pending_plans` criada** ✅
   ```bash
   # Execute o SQL:
   # sql/CREATE_PENDING_PLANS.sql
   ```

2. **Função `activate_pending_plans` criada** ✅
   - Já incluída no CREATE_PENDING_PLANS.sql

3. **Webhook-unificada atualizada** ✅
   - Registra em pending_plans quando usuário não existe

---

## 🧪 Como testar

### **Teste 1: Pagar → Registrar → Verificar**

```
1. Gerar PIX com email: teste@example.com
2. Confirmar pagamento (webhook vai registrar em pending_plans)
3. Fazer signup com mesmo email: teste@example.com
4. Verificar no Supabase:
   - pending_plans: status muda de 'pending' para 'activated'
   - user_subscriptions: novo registro criado
   - users.plano_ativo: deve ter o ID do plano
```

### **Teste 2: Verificar logs**

No Supabase:
```sql
-- Ver planos pendentes
SELECT * FROM pending_plans WHERE email = 'teste@example.com';

-- Ver subscriptions do usuário
SELECT * FROM user_subscriptions
WHERE user_id = (SELECT id FROM users WHERE email = 'teste@example.com');

-- Ver plano ativo
SELECT id, email, plano_ativo, data_expiracao_plano
FROM users WHERE email = 'teste@example.com';
```

---

## 📊 Resposta da função

A função retorna:
```typescript
{
  plan_id: INTEGER,        // ID do plano ativado
  activated_count: INTEGER // Quantos planos foram ativados
}
```

Exemplo:
```typescript
if (data?.[0]?.activated_count > 0) {
  console.log(`✅ ${data[0].activated_count} plano(s) ativado com sucesso!`)
}
```

---

## ✅ Checklist

- [ ] CREATE_PENDING_PLANS.sql executado no Supabase
- [ ] webhook-unificada atualizada
- [ ] Função activate_pending_plans está sendo chamada no signup
- [ ] Testou o fluxo: pagar PIX → registrar → verificar plano
