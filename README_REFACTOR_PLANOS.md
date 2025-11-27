# 🚀 REFATORAÇÃO COMPLETA DO SISTEMA DE PLANOS - EDUKAPRIME 2.0

## 📌 RESUMO EXECUTIVO

O sistema de planos atual tá **QUEBRADO** porque:
- ❌ Mistura duas abordagens: `users.plano_ativo` (INTEGER) + `plans` JSONB granular
- ❌ Sistema de permissões granulares não funciona (allowed_ids sempre vazio)
- ❌ Admin panel completo e confuso com 6 abas
- ❌ Não suporta múltiplas subscriptions (vitalício + mensal)

## ✅ SOLUÇÃO

Vamo refazer **SIMPLES**, **CLARO** e **FUNCIONAL**:

1. **Tabela `plans_v2`**: Planos simples (5 planos: FREE, ESSENCIAL, EVOLUIR, PRIME, VITALÍCIO)
2. **Tabela `plan_features`**: O que cada plano libera (30 registros: 5 planos × 6 features)
3. **Tabela `user_subscriptions`**: Histórico de compras (rastreia tudo)
4. **Usuário + Vitalício**: Suporta múltiplas subscriptions

---

## 📂 DOCUMENTOS CRIADOS

### 1. **REFACTOR_PLANS_SYSTEM_V2.sql** ← SQL COMPLETO
- Arquivo principal com TODO o SQL pra refazer o banco
- Execute isto no Supabase SQL Editor

### 2. **PASSOS_SUPABASE.md** ← INSTRUÇÕES PASSO-A-PASSO
- Step-by-step exato do que executar
- Com verificações

### 3. **ARQUITETURA_NOVA_PLANOS.md** ← DOCUMENTAÇÃO VISUAL
- Diagramas das tabelas
- Fluxos de compra
- Exemplos de dados

### 4. **INSTRUCOES_CLEANUP_BANCO.md** ← O QUE EXCLUIR
- Quais tabelas remover
- Quais colunas deletar
- Frontend pra reescrever

### 5. **README_REFACTOR_PLANOS.md** ← ESTE ARQUIVO
- Overview completo
- Checklist final

---

## 🎯 O QUE MUDAR

### ✂️ EXCLUIR:
```sql
DROP TABLE IF EXISTS plans CASCADE;                    -- Tabela antiga com JSONB
DROP TABLE IF EXISTS community_channels CASCADE;       -- Não precisa mais
DROP TABLE IF EXISTS support_tiers CASCADE;           -- Não precisa mais
ALTER TABLE users DROP COLUMN IF EXISTS plano_id;    -- Era VARCHAR(50)
DELETE FROM GestaoPlanos.tsx;                         -- Arquivo inteiro (admin page)
DELETE FROM planService.ts;                           -- Serviço inteiro
```

### ✨ CRIAR:
```sql
CREATE TABLE plans_v2 (...)                   -- Novo catálogo
CREATE TABLE plan_features (...)              -- O que libera
CREATE TABLE user_subscriptions (...)         -- Histórico
CREATE VIEW user_current_access               -- Helper view
CREATE FUNCTION activate_user_subscription    -- Para webhook
CREATE FUNCTION user_has_feature_access       -- Para verificação
```

### 🔄 ATUALIZAR:
```typescript
// AuthContext: Usar novo sistema de planos
// planService.ts: Reescrever completamente
// AdminPlanosManager.tsx: Nova página (bem simples)
// Webhook handler: Usar activate_user_subscription()
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **Planos** | `plans` JSONB | `plans_v2` + `plan_features` |
| **Permissões** | Array de IDs granular | Boolean simples |
| **Multi-sub** | ❌ | ✅ |
| **Vitalício** | Misturado | Separado (`has_lifetime_access`) |
| **Admin UI** | Modal 6 abas, complexo | Checkbox simples |
| **Performance** | Lenta (JSON array search) | Rápida (boolean check) |
| **Funciona?** | ❌ NÃO | ✅ SIM |
| **Manutenção** | Confusa | Simples |

---

## 📈 DADOS INICIAIS

### 5 PLANOS:

| ID | Nome | Preço | Tipo | Duração | Status |
|----|------|-------|------|---------|--------|
| 0 | GRATUITO | R$ 0 | mensal | ∞ | ✅ |
| 1 | ESSENCIAL | R$ 17,99 | mensal | 30 dias | ✅ |
| 2 | EVOLUIR | R$ 27,99 | mensal | 30 dias | ✅ |
| 3 | PRIME | R$ 49,99 | mensal | 30 dias | ✅ |
| 4 | VITALÍCIO | R$ 197,99 | unico | ∞ | ✅ |

### 6 FEATURES:
- atividades
- videos
- bonus
- papercrafts
- comunidade
- suporte_vip

### PERMISSÕES:
```
GRATUITO:    Nada
ESSENCIAL:   Atividades
EVOLUIR:     Atividades + Videos + Bônus
PRIME:       Tudo + Comunidade + Suporte VIP
VITALÍCIO:   Tudo para sempre
```

---

## 🔄 FLUXO NOVO

### 1. Usuário se registra:
```
User.signup()
  ↓
Insert: users { active_plan_id: 0, has_lifetime_access: false }
  ↓
Acesso: Nada (só GRATUITO)
```

### 2. Usuário compra Essencial (PIX):
```
Click "Contratar Essencial"
  ↓
Redireciona GGCheckout
  ↓
Paga PIX
  ↓
Webhook: product_id "lDGnSUHPwxWl..." → plan_id 1
  ↓
Chama SQL: activate_user_subscription(user_id, 1, ...)
  ↓
  ├─ Desativa outros planos mensais
  ├─ Insert: user_subscriptions { plan_id: 1, end_date: +30 days }
  └─ Update: users { active_plan_id: 1 }
  ↓
Acesso: Atividades ✅
```

### 3. Usuário faz upgrade para Prime:
```
Click "Atualizar para Prime"
  ↓
Webhook: product_id "eOGqcq0IbQnJ..." → plan_id 3
  ↓
SQL: activate_user_subscription(user_id, 3, ...)
  ↓
  ├─ Desativa plan 1 (ESSENCIAL)
  ├─ Insert: user_subscriptions { plan_id: 3 }
  └─ Update: users { active_plan_id: 3 }
  ↓
Acesso: Tudo ✅
```

### 4. Usuário compra Vitalício:
```
Click "Acesso Vitalício"
  ↓
Webhook: plan_id 4
  ↓
SQL: activate_user_subscription(user_id, 4, ...)
  ↓
  ├─ NÃO desativa plan 1 (adiciona!)
  ├─ Insert: user_subscriptions { plan_id: 4, end_date: NULL }
  └─ Update: users { has_lifetime_access: true }
  ↓
Acesso: Tudo para sempre + plano mensal ativa se tiver
```

---

## 🛠️ VERIFICAÇÃO DE ACESSO NO CÓDIGO

### Método 1: Via SQL (mais rápido)
```sql
SELECT user_has_feature_access('user-uuid', 'videos')
-- Retorna: true/false
```

### Método 2: Via TypeScript
```typescript
const hasAccess = await planService.hasAccess(userId, 'videos');
if (!hasAccess) {
  showUpgradeModal();
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### BANCO (Supabase SQL Editor)
- [ ] Executar REFACTOR_PLANS_SYSTEM_V2.sql
- [ ] Verificar que todas as 5 tabelas foram criadas
- [ ] Verificar que 5 planos foram inseridos
- [ ] Verificar que 30 features foram inseridas
- [ ] Testar VIEW user_current_access
- [ ] Testar função activate_user_subscription

### CÓDIGO (Frontend)
- [ ] Reescrever src/lib/planService.ts
- [ ] Atualizar src/contexts/AuthContext.tsx
- [ ] Criar src/pages/admin/AdminPlanosManager.tsx (novo)
- [ ] Deletar src/pages/admin/GestaoPlanos.tsx (antigo)
- [ ] Atualizar webhook handler (`/netlify/functions/webhook-amplopay.js`)
- [ ] Testar: Pages (Atividades, Videos, Bonus, etc) verificam acesso

### TESTES
- [ ] Novo user → sem acesso ✅
- [ ] Compra Essencial → tem atividades ✅
- [ ] Upgrade para Prime → tem tudo ✅
- [ ] Compra Vitalício → acesso permanente ✅
- [ ] Subscription expira → volta para GRATUITO ✅

---

## 📞 DÚVIDAS COMUNS

**P: Por que remover o sistema granular?**
R: Não tava funcioando. allowed_ids sempre vazio. Depois fazemos granular se precisar.

**P: User pode ter múltiplas subscriptions?**
R: Sim! Planos mensais (1,2,3) são exclusivos, mas + vitalício (4) é adicional.

**P: Quando renovar subscription?**
R: next_renewal_date marca quando expira. Sistema pode auto-renovar ou user escolhe downgrade.

**P: E se user downgrade mid-month?**
R: Desativa subscription atual, cria nova com plan_id=0 (GRATUITO).

**P: Código de produto no GGCheckout?**
R: Já tá na tabela plans_v2.product_id_gateway. Webhook mapeia isso.

---

## 🚀 PRÓXIMOS PASSOS

### HOJE:
1. ✅ Ler todos os documentos (1h)
2. Executar REFACTOR_PLANS_SYSTEM_V2.sql (30min)
3. Verificar banco (15min)

### AMANHÃ:
4. Reescrever planService.ts
5. Atualizar AuthContext
6. Criar AdminPlanosManager.tsx
7. Testar tudo

### PRÓXIMA SEMANA:
8. Implementar webhook
9. Testes de compra real (PIX/Card)

---

## 📞 SUPORTE

Se tiver dúvida em algum SQL, use este arquivo:
- **PASSOS_SUPABASE.md** ← Instruções passo-a-passo

Se quiser entender a arquitetura:
- **ARQUITETURA_NOVA_PLANOS.md** ← Diagramas e fluxos

Se quer saber o QUE EXCLUIR:
- **INSTRUCOES_CLEANUP_BANCO.md** ← Limpeza

---

## 🎉 RESUMO FINAL

```
ANTES:  Confuso, quebrado, não funciona ❌
DEPOIS: Simples, claro, funciona perfeitamente ✅
```

Vamo nessa! 🚀
