# 🏗️ ARQUITETURA NOVA DO SISTEMA DE PLANOS

## VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO NOVO ENTRA                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Auth Users (Supabase Auth)  │
        │  - id (UUID)                 │
        │  - email                     │
        └──────────────────┬───────────┘
                           │
                           ↓
        ┌─────────────────────────────────────────────┐
        │         TABELA: users                       │
        │  - id (FK → auth.users)                    │
        │  - email                                    │
        │  - active_plan_id INT (FK → plans_v2)      │ ← Qual plano mensal?
        │  - has_lifetime_access BOOLEAN              │ ← Tem vitalício?
        │  - is_admin                                 │
        │  - created_at, updated_at                  │
        └──────────────────────┬──────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ↓                             ↓
    ┌──────────────────────────┐  ┌──────────────────────────┐
    │  user_subscriptions      │  │  plans_v2                │
    │  (Histórico de compras)  │  │  (Catálogo de planos)    │
    ├──────────────────────────┤  ├──────────────────────────┤
    │ id (UUID)                │  │ id (INT: 0-4)            │
    │ user_id (FK)             │──→ name ('GRATUITO', ...) │
    │ plan_id (INT)            │  │ price (DECIMAL)          │
    │ status ('active')        │  │ payment_type ('mensal')  │
    │ start_date               │  │ duration_days (30/NULL)  │
    │ end_date (NULL=vitalício)│  │ checkout_url             │
    │ payment_id               │  │ product_id_gateway       │
    │ payment_method ('pix')   │  │ is_active                │
    │ amount_paid              │  └──────────────┬───────────┘
    │ next_renewal_date        │                 │
    └──────────────────────────┘                 ↓
                                  ┌──────────────────────────┐
                                  │  plan_features           │
                                  │  (O que cada plano libra)│
                                  ├──────────────────────────┤
                                  │ plan_id (FK → plans_v2)  │
                                  │ feature_name ('videos')  │
                                  │ is_enabled (true/false)  │
                                  └──────────────────────────┘
```

---

## DADOS INICIAIS

### Tabela `plans_v2`:

| ID | Name | Payment | Price | Duration | GW Product ID | Status |
|----|------|---------|-------|----------|---------------|--------|
| 0 | GRATUITO | mensal | 0.00 | NULL | NULL | ✅ |
| 1 | ESSENCIAL | mensal | 17.99 | 30 | lDGnSUHPwxWl... | ✅ |
| 2 | EVOLUIR | mensal | 27.99 | 30 | WpjID8aV49Sh... | ✅ |
| 3 | PRIME | mensal | 49.99 | 30 | eOGqcq0IbQnJ... | ✅ |
| 4 | VITALÍCIO | unico | 197.99 | NULL | TBD | ✅ |

### Tabela `plan_features`:

```
Plan 0 (GRATUITO):
  - atividades: false
  - videos: false
  - bonus: false
  - papercrafts: false
  - comunidade: false
  - suporte_vip: false

Plan 1 (ESSENCIAL):
  - atividades: TRUE  ← Libera
  - videos: false
  - bonus: false
  - papercrafts: false
  - comunidade: false
  - suporte_vip: false

Plan 2 (EVOLUIR):
  - atividades: TRUE  ← Libera
  - videos: TRUE      ← Libera
  - bonus: TRUE       ← Libera
  - papercrafts: false
  - comunidade: false
  - suporte_vip: false

Plan 3 (PRIME):
  - atividades: TRUE  ← Libera
  - videos: TRUE      ← Libera
  - bonus: TRUE       ← Libera
  - papercrafts: TRUE ← Libera
  - comunidade: TRUE  ← Libera
  - suporte_vip: TRUE ← Libera

Plan 4 (VITALÍCIO):
  - atividades: TRUE  ← Libera
  - videos: TRUE      ← Libera
  - bonus: TRUE       ← Libera
  - papercrafts: TRUE ← Libera
  - comunidade: TRUE  ← Libera
  - suporte_vip: TRUE ← Libera
```

---

## FLUXO 1: USUÁRIO NOVO SE REGISTRA (FREE)

```
1. User.signup()
   ↓
2. AuthContext cria usuário em auth.users
   ↓
3. Insere em users table:
   {
     id: uuid,
     email: user@email.com,
     active_plan_id: 0,              ← GRATUITO
     has_lifetime_access: false,
     is_admin: false
   }
   ↓
4. AuthContext busca plan_features para plan_id = 0
   ↓
5. Sistema mostra o que usuário tem acesso:
   - atividades? false  ❌
   - videos? false      ❌
   - bonus? false       ❌
   ↓
6. Ao clicar em "Atividades", mostra modal:
   "Este conteúdo está em Essencial, Evoluir ou Prime"
```

---

## FLUXO 2: USUÁRIO COMPRA PLANO MENSUAL (PIX)

```
1. User clica em "Contratar Essencial" (R$ 17,99/mês)
   ↓
2. Redireciona para GGCheckout
   Link: https://checkout.edukaprime.com.br/VCCL1O8SCCGM
   (Product ID no GGCheckout: lDGnSUHPwxWlHBlPEIFy)
   ↓
3. User paga com PIX
   ↓
4. GGCheckout envia webhook:
   POST https://seu-site.com/api/webhook/amplopay
   {
     "event": "pix.paid",
     "product_id": "lDGnSUHPwxWlHBlPEIFy",  ← ID do GGCheckout
     "customer_email": "user@email.com",
     "amount": 1799,                          ← R$ 17,99
     "payment_id": "pix_abc123"
   }
   ↓
5. Webhook handler executa:
   - Mapeia product_id → plan_id (1 = ESSENCIAL)
   - Busca user por email
   - Chama função SQL: activate_user_subscription()
   ↓
6. SQL executa:
   a) Desativa outros planos mensais (1,2,3)
   b) Insere em user_subscriptions:
      {
        user_id: uuid,
        plan_id: 1,                    ← ESSENCIAL
        status: 'active',
        start_date: NOW(),
        end_date: NOW() + 30 days,     ← Expira em 30 dias
        next_renewal_date: NOW() + 30,
        payment_id: 'pix_abc123',
        amount_paid: 17.99
      }
   c) Atualiza users:
      {
        active_plan_id: 1,             ← Novo plano
        has_lifetime_access: false     ← (não afeta)
      }
   ↓
7. AuthContext recarrega e busca novo plano:
   SELECT current_plan_id FROM user_current_access
   ↓
8. Sistema verifica plan_features para plan_id = 1:
   - atividades: TRUE  ✅ AGORA ACESSA!
   - videos: false     ❌
   - bonus: false      ❌
   ↓
9. User tem acesso imediato! 🎉
```

---

## FLUXO 3: UPGRADE DURANTE SUBSCRIPTION

```
User tinha Essencial (plan_id = 1)
Compra Evoluir (plan_id = 2) no meio do mês
                ↓
Webhook: product_id → plan_id 2
                ↓
SQL:
  1. Marca antiga subscription como 'inactive'
  2. Cria nova subscription para plan_id = 2
  3. Usa mesma data de início (ou recalcula pro)
                ↓
User agora tem:
  - atividades: TRUE  ✅
  - videos: TRUE      ✅ (novo!)
  - bonus: TRUE       ✅ (novo!)
```

---

## FLUXO 4: COMPRA VITALÍCIO (PAGAMENTO ÚNICO)

```
1. User clica em "Acesso Vitalício" (R$ 197,99)
   ↓
2. Redireciona para GGCheckout
   Link: https://checkout.edukaprime.com.br/VITALICIO
   (Product ID: TBD)
   ↓
3. User paga CARD (pagamento único)
   ↓
4. Webhook: product_id → plan_id 4
   ↓
5. SQL: activate_user_subscription(user_id, plan_id=4, ...)
   ├─ NÃO desativa outros planos (vitalício é adicional!)
   └─ Insere subscription:
      {
        plan_id: 4,
        duration_days: NULL,  ← Sem expiração!
        end_date: NULL,
        next_renewal_date: NULL,
        auto_renew: false
      }
   ├─ Atualiza users:
      {
        has_lifetime_access: true  ← Marca como vitalício!
      }
   ↓
6. User agora tem:
   - Plan mensal: Essencial (ou qual tiver)
   - + Vitalício: SIM
   ↓
7. Plan features agora verificam:
   if (has_lifetime_access OR plan_features[feature])
     return true
```

---

## VERIFICAÇÃO DE ACESSO NO CÓDIGO

### Antes (Quebrado):
```typescript
// src/hooks/usePlanAccess.ts
const hasAccessToItem = (contentType, itemId) => {
  // Verificava se itemId estava em plan.permissions.atividades.allowed_ids
  // Mas allowed_ids tava sempre vazio! 🤦
}
```

### Depois (Funciona):
```typescript
// src/hooks/usePlanAccess.ts
const hasAccess = async (featureName) => {
  // 1. Pega plan_id atual do usuário
  const { current_plan_id, has_lifetime } = await getUserAccess(userId);

  // 2. Se tem vitalício, libera tudo
  if (has_lifetime) return true;

  // 3. Senão, verifica se plano libera feature
  const allowed = await checkFeatureAccess(current_plan_id, featureName);
  return allowed;
}
```

### Query SQL equivalente:
```sql
SELECT pf.is_enabled
FROM plan_features pf
WHERE pf.plan_id = (
  SELECT COALESCE(us.plan_id, 0)
  FROM user_subscriptions us
  WHERE us.user_id = $1 AND us.status = 'active'
  ORDER BY us.created_at DESC LIMIT 1
)
AND pf.feature_name = $2;
```

---

## ADMIN: EDITAR PLANOS

### Antes (Confuso):
- Modal com 6 abas
- Seleção de items granular (Atividade 1, Atividade 2, etc)
- Salvar permissões complexas em JSONB
- **NÃO FUNCIONA**

### Depois (Simples):
- Página `/admin/planos` lista todos os 5 planos
- Clica em EDITAR
- Modal com apenas 2 seções:
  ```
  EDITAR: Essencial

  Informações Básicas:
  - Nome: Essencial
  - Preço: R$ 17,99
  - Tipo: Mensal
  - Link Checkout: https://...
  - Ativo: ✅

  Liberar Recursos:
  ☑ Atividades
  ☐ Vídeos
  ☐ Bônus
  ☐ PaperCrafts
  ☐ Comunidade
  ☐ Suporte VIP

  [SALVAR] [CANCELAR]
  ```

### Query para atualizar:
```sql
-- Admin marca "Vídeos" como TRUE para Essencial
UPDATE plan_features
SET is_enabled = true
WHERE plan_id = 1 AND feature_name = 'videos';

-- Pronto! Todos os usuários com plan_id=1 agora têm acesso a videos
```

---

## VISÃO GERAL: MUDANÇAS PRINCIPAIS

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **Tabelas** | plans (JSONB) | plans_v2 + plan_features |
| **Plan por User** | users.plano_id | users.active_plan_id |
| **Multi-subscription** | ❌ Não suporta | ✅ user_subscriptions |
| **Vitalício** | ❌ Misturado com mensal | ✅ users.has_lifetime_access |
| **Admin** | Modal 6 abas, granular | Checkbox simples |
| **Performance** | Verifica JSONB array | Verifica booleano |
| **Manutenção** | Confusa | Clara |
| **Funciona?** | ❌ NÃO | ✅ SIM |

---

## CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Executar REFACTOR_PLANS_SYSTEM_V2.sql
- [ ] Excluir tabela plans antiga
- [ ] Reescrever planService.ts
- [ ] Atualizar AuthContext
- [ ] Criar nova página AdminPlanosManager.tsx
- [ ] Atualizar webhook handler
- [ ] Testar fluxo: free → essencial → upgrade → vitalício
- [ ] Remover GestaoPlanos.tsx antigo

---

## DÚVIDAS FREQUENTES

**P: E os itens granulares? Tipo, liberar só Atividade 1?**
R: Simplicidade acima de tudo! Se no futuro precisa, é fácil adicionar. Por enquanto, plano libera TODA categoria ou nada.

**P: User pode ter múltiplas subscriptions simultâneas?**
R: Sim! Planos mensais (1,2,3) são exclusivos, mas pode ter um mensal + vitalício (4) ao mesmo tempo.

**P: Quando subscription expira?**
R: Sistema cria `next_renewal_date`. No dia, você pode:
- Auto-renovar (se `auto_renew=true`)
- Downgrade pra GRATUITO
- Só admin renueva manualmente

**P: E se o usuário downgrade?**
R: Sistema desativa subscription atual, cria nova com plan_id=0 (GRATUITO).

Pronto! Agora tá bem organizado! Executa o SQL e depois a gente programa o frontend!
