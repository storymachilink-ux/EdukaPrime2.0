# 🗑️ INSTRUÇÕES PARA LIMPAR O BANCO DE DADOS

## SITUAÇÃO ATUAL
O banco tá com **DUAS ABORDAGENS MISTURADAS** que não funcionam bem juntas:

1. **Sistema ANTIGO** (funciona): `users.plano_ativo` (INTEGER 0-3)
2. **Sistema NOVO** (não funciona): Tabela `plans` com JSONB granular

## SOLUÇÃO: Vamos usar o NOVO SISTEMA simples mas funcional

---

## ⚠️ FASE 1: EXCLUIR/DESABILITAR O ANTIGO

### 1. Excluir a tabela `plans` antiga (com JSONB)
```sql
DROP TABLE IF EXISTS plans CASCADE;
```
**Razão**: Tá incompleta, confunde o sistema, as permissões não tão sendo salvas.

### 2. Excluir tabelas relacionadas ao sistema antigo
```sql
DROP TABLE IF EXISTS community_channels CASCADE;
DROP TABLE IF EXISTS support_tiers CASCADE;
```
**Razão**: Foram criadas para funcionar com o sistema JSONB que não vai usar.

### 3. Remover referências de `plano_id` VARCHAR em users
```sql
-- Se a coluna existe:
ALTER TABLE users DROP COLUMN IF EXISTS plano_id CASCADE;
```
**Razão**: Era `VARCHAR(50)` referenciando `plans(id)` que vamos excluir.

### 4. Remover arquivo antigo (se quiser manter para referência):
```bash
# No seu computador, renomear para arquivo morto:
rename create_plans_system.sql create_plans_system.sql.bak
```

---

## ✅ FASE 2: EXECUTAR O NOVO SISTEMA

Execute NO SUPABASE SQL EDITOR nesta ORDEM:

### PASSO 1: Criar tabela `plans_v2`
```sql
-- Copiar a parte de criação de plans_v2 do arquivo REFACTOR_PLANS_SYSTEM_V2.sql
```

### PASSO 2: Criar tabela `plan_features`
```sql
-- Copiar a parte de plan_features do arquivo REFACTOR_PLANS_SYSTEM_V2.sql
```

### PASSO 3: Criar tabela `user_subscriptions`
```sql
-- Copiar a parte de user_subscriptions do arquivo REFACTOR_PLANS_SYSTEM_V2.sql
```

### PASSO 4: Adicionar colunas em `users`
```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_plan_id INTEGER REFERENCES plans_v2(id),
  ADD COLUMN IF NOT EXISTS has_lifetime_access BOOLEAN DEFAULT false;
```

### PASSO 5: Criar VIEW e FUNÇÃO
```sql
-- Copiar a VIEW user_current_access do arquivo REFACTOR_PLANS_SYSTEM_V2.sql
-- Copiar a FUNÇÃO activate_user_subscription do arquivo REFACTOR_PLANS_SYSTEM_V2.sql
```

---

## 🔧 FASE 3: ATUALIZAR O CÓDIGO FRONTEND

### 1. Atualizar o contexto de autenticação
**Arquivo**: `src/contexts/AuthContext.tsx`

Onde tá carregando:
```typescript
// ❌ ANTIGO
const profile = await getProfile(user.id);

// ✅ NOVO
const profile = await getUserWithSubscriptions(user.id);
```

### 2. Criar novo serviço planService
**Arquivo**: `src/lib/planService.ts` (REESCREVER COMPLETAMENTE)

```typescript
import { supabase } from './supabase';

export const planService = {
  // Obter plano atual do usuário
  async getUserCurrentPlan(userId: string) {
    const { data } = await supabase.rpc('get_user_current_plan', { p_user_id: userId });
    return data;
  },

  // Ativar subscription via webhook
  async activateSubscription(userId: string, planId: number, paymentData: any) {
    const { data } = await supabase.rpc('activate_user_subscription', {
      p_user_id: userId,
      p_plan_id: planId,
      p_payment_id: paymentData.payment_id,
      p_product_id_gateway: paymentData.product_id_gateway,
      p_payment_method: paymentData.payment_method,
      p_amount_paid: paymentData.amount_paid
    });
    return data;
  },

  // Verificar se usuário tem acesso a um recurso
  async hasAccess(userId: string, featureName: string): Promise<boolean> {
    const { data } = await supabase.rpc('user_has_feature_access', {
      p_user_id: userId,
      p_feature_name: featureName
    });
    return data;
  },

  // Listar todos os planos ativos
  async getAllPlans() {
    const { data } = await supabase
      .from('plans_v2')
      .select('*')
      .eq('is_active', true)
      .order('order_position');
    return data;
  },

  // Obter detalhes de um plano específico
  async getPlanById(planId: number) {
    const { data } = await supabase
      .from('plans_v2')
      .select(`
        *,
        features:plan_features(feature_name, is_enabled)
      `)
      .eq('id', planId)
      .single();
    return data;
  }
};
```

### 3. Criar nova página de Admin para gerir planos
**Arquivo**: `src/pages/admin/PlanosManager.tsx`

Será bem mais simples porque não precisa de modal com abas. Só vai ter:
- Lista de planos com preço, tipo, status
- Botão EDITAR para cada plano
- Modal simples com formulário (nome, preço, link checkout, etc)
- **NÃO TEM** seleção de itens granulares (isso era o problema!)

### 4. Remover o arquivo antigo
**Arquivo**: `src/pages/admin/GestaoPlanos.tsx`

Deletar completamente! Vamos criar um novo.

### 5. Atualizar AuthContext para usar novo sistema
**Arquivo**: `src/contexts/AuthContext.tsx`

Mudar a interface UserProfile:
```typescript
interface UserProfile {
  id: string;
  email: string;
  nome?: string;
  active_plan_id: number;          // ID do plano mensal ativo (1, 2, 3 ou 0)
  has_lifetime_access: boolean;    // Tem acesso vitalício?
  is_admin: boolean;
  // Remover: plano_ativo, acesso_atividades, acesso_videos, etc
}
```

---

## 📝 FASE 4: TESTAR FLUXO COMPLETO

### Teste 1: Usuário novo sem subscription
1. Entrar no site
2. Deve mostrar GRATUITO como plano atual
3. Deve bloquear acesso a videos, bonus, etc

### Teste 2: Usuário faz checkout e recebe webhook
1. Clicar em "Contratar Essencial"
2. Ir para GGCheckout
3. Fazer pagamento com PIX ou Card
4. Webhook chega em `/api/webhook/amplopay`
5. Deve chamar `activate_user_subscription()` com plan_id = 1
6. Usuário deve ter acesso imediato

### Teste 3: Usuário com vitalício
1. Fazer checkout com plano vitalício (plan_id = 4)
2. Receber webhook com plan_id = 4
3. Campo `has_lifetime_access` deve ficar true
4. Deve manter acesso mesmo se plano mensal expirar

### Teste 4: Upgrade de plano
1. Usuário com Essencial (plan_id = 1)
2. Compra Evoluir (plan_id = 2)
3. Webhook chega com plan_id = 2
4. Sistema deve desativar subscription anterior (plan_id = 1)
5. Criar nova subscription com plan_id = 2

---

## 🎯 O QUE VAI FICAR SIMPLES

### Antes (Confuso):
- Tabela `plans` com JSONB complexo
- Modal com 6 abas
- Seleção granular de itens
- Sistema não funciona

### Depois (Simples):
- Tabela `plans_v2` com campos simples
- Tabela `plan_features` com 1 linha por plan x feature
- Admin edita: nome, preço, link checkout (só isso!)
- Sistema funciona perfeito

### Feature Access:
```
User faz login
  ↓
System busca: SELECT current_plan_id FROM user_current_access WHERE user_id = ?
  ↓
Busca features daquele plano:
  SELECT * FROM plan_features WHERE plan_id = 1 AND feature_name = 'videos'
  ↓
Se is_enabled = true → Usuário tem acesso
Se is_enabled = false → Mostra modal de upgrade
```

---

## 📱 WEBHOOK AGORA FICA ASSIM

```
GGCheckout Payment Event
  ↓
POST /api/webhook/amplopay
  ↓
{
  "event": "pix.paid",
  "product_id": "lDGnSUHPwxWlHBlPEIFy",  // ID do produto no GGCheckout
  "customer_email": "user@email.com",
  "amount": 1799  // R$ 17,99 em centavos
}
  ↓
Backend mapeia: product_id → plan_id (usando tabela plans_v2)
  ↓
Busca user por email
  ↓
Chama: activate_user_subscription(user_id, plan_id, payment_data)
  ↓
✅ Usuário tem acesso imediato!
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar SQL** para criar novas tabelas (REFACTOR_PLANS_SYSTEM_V2.sql)
2. **Reescrever** planService.ts com funções simples
3. **Atualizar** AuthContext para usar novo sistema
4. **Criar** nova página AdminPlanosManager.tsx (simples)
5. **Atualizar** webhook handler para usar `activate_user_subscription()`
6. **Testar** fluxo completo

---

## ⚡ RESUME: O QUE EXCLUIR NO BANCO

```sql
-- Tira tudo do sistema antigo
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS community_channels CASCADE;
DROP TABLE IF EXISTS support_tiers CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS plano_id;

-- Pronto! Agora executa o REFACTOR_PLANS_SYSTEM_V2.sql
```

Pronto! Depois me avisa quando tiver executado o SQL que vou reescrever o frontend!
