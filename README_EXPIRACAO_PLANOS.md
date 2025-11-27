# 🎯 JOB DE EXPIRAÇÃO AUTOMÁTICA DE PLANOS MENSAIS

> **Status:** ✅ Pronto para implementação
> **Data:** 27/11/2024
> **Versão:** 1.0

---

## 🚀 TL;DR (Resumido)

Criamos um **sistema automático que expira planos toda madrugada** (00:00 UTC).

**3 arquivos foram criados:**

1. **Edge Function** (`check-plan-expiration/index.ts`) - Verifica e expira planos
2. **Cron Job Setup** (`setup-plan-expiration-cron.sql`) - Agenda para rodar diariamente
3. **Documentação** - Guias passo-a-passo

**O que fazemos:**
```
Todo dia às 00:00 UTC:
  1. Buscar subscriptions com end_date < AGORA
  2. Marcar como 'expired'
  3. Criar notificação para usuário
  4. Registrar em log
  ✅ Pronto!
```

---

## 📊 ANÁLISE DO PROBLEMA RESOLVIDO

### Antes (Problema)
```
Usuário compra plano de 30 dias
  ↓ (30 dias depois)
Expiração date chega
  ↓
❌ NÃO ACONTECE NADA
  ↓
Usuário continua com acesso indefinidamente
❌ Insegurança de dados
❌ Perda de receita
```

### Depois (Solução)
```
Usuário compra plano de 30 dias
  ↓ (30 dias depois)
Expiração date chega
  ↓
[00:00 UTC] JOB RODA:
  ✅ Status muda para 'expired'
  ✅ Notificação criada
  ✅ Log registrado
  ↓
Usuário perde acesso automaticamente
✅ Seguro
✅ Auditado
✅ Zero manual
```

---

## 📁 ARQUIVOS CRIADOS

```
projeto/
│
├─ 📋 PLANO_MELHORIAS_PLANOS.md
│  └─ Mockups e layout de melhorias nas interfaces
│
├─ 🚀 RESUMO_IMPLEMENTACOES.md
│  └─ Visão geral de tudo que foi criado
│
├─ 📖 IMPLEMENTACAO_JOB_EXPIRACAO.md
│  └─ Guia detalhado passo-a-passo
│
├─ ✅ CHECKLIST_EXPIRACAO.md
│  └─ Checklist visual com todos os passos
│
├─ 📖 README_EXPIRACAO_PLANOS.md (este arquivo)
│  └─ Visão geral rápida
│
└─ supabase/
   ├─ functions/check-plan-expiration/
   │  └─ index.ts ✅ EDGE FUNCTION (290 linhas)
   │     • Verifica expiração
   │     • Atualiza status
   │     • Cria notificações
   │     • Registra logs
   │
   └─ migrations/
      └─ setup-plan-expiration-cron.sql ✅ CRON JOB
         • Agenda execução diária
         • Cria tabela de logs
         • Setup completo
```

---

## ⚡ QUICKSTART (5 minutos)

### 1️⃣ Deploy da Function
```bash
supabase functions deploy check-plan-expiration
```

### 2️⃣ Execute o SQL
1. Abra: https://app.supabase.com/project/[SEU_ID]/sql/new
2. Cole: `supabase/migrations/setup-plan-expiration-cron.sql`
3. **⚠️ Substitua `[YOUR_PROJECT_ID]` pelo seu ID real**
4. Clique "Run"

### 3️⃣ Teste
```bash
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{}'
```

**Esperado:**
```json
{
  "status": "success",
  "expired_count": 0,
  "notifications_created": 0,
  "timestamp": "2024-11-27T..."
}
```

### 4️⃣ Confirmação no Banco
```sql
SELECT * FROM cron.job WHERE jobname = 'check-plan-expiration-daily';
```

✅ Pronto! Job está rodando!

---

## 🎯 O QUE ACONTECE AGORA

### Diariamente (00:00 UTC)

**Automaticamente:**
```
⏰ [00:00 UTC] Inicia
  │
  ├─ 🔍 Busca subscriptions com end_date < NOW() e status = 'active'
  │
  ├─ ✏️ Atualiza status = 'expired' para cada uma
  │
  ├─ 📧 Cria notificação 'plan_expired' para usuário
  │
  ├─ 📝 Registra em plan_expiration_logs
  │
  └─ ✅ [00:15 UTC] Concluído
```

**Exemplo de resultado:**
```
Subscriptions expiradas: 12
Notificações criadas: 12
Pending plans expirados: 3
Status: success ✅
```

---

## 📊 FLUXO VISUAL COMPLETO

```
                    USUÁRIO
                      │
                      ↓
            FAZ PAGAMENTO (30 dias)
                      │
                      ↓
        ┌─────────────────────────────┐
        │   WEBHOOK RECEBIDO          │
        │   → end_date = NOW() + 30d  │
        │   → status = 'active'       │
        │   → payment registrado      │
        └─────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │     DIAS 1-30               │
        │   Usuário TEM ACESSO ✅     │
        │   Usa conteúdo normalmente  │
        └─────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │     NOITE DO 30º DIA        │
        │   [23:45 UTC] Preparação    │
        │   [00:00 UTC] JOB INICIA ⚙️ │
        └─────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │   [JOB EXECUTA]             │
        │   ✅ Status: active → expired
        │   ✅ Notificação criada     │
        │   ✅ Log registrado         │
        └─────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │     DIA 31+                 │
        │   Usuário SEM ACESSO ❌     │
        │   Redirecionado para renew  │
        │   Recebe notificação        │
        └─────────────────────────────┘
```

---

## 🧪 TESTE RÁPIDO (10 min)

### Criar dados de teste

```sql
-- 1. Buscar usuário
SELECT id FROM users LIMIT 1;  -- Copie o ID

-- 2. Buscar plano
SELECT id FROM plans_v2 LIMIT 1;  -- Copie o ID

-- 3. Criar subscription que já expirou
INSERT INTO user_subscriptions (
  user_id, plan_id, status, start_date,
  end_date, payment_id, amount_paid
) VALUES (
  '[USER_ID]',
  [PLAN_ID],
  'active',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '1 day',  -- Expirou ontem
  'test-123',
  29.99
);

-- 4. Verificar antes
SELECT status, end_date FROM user_subscriptions
WHERE payment_id = 'test-123';
```

### Executar job

```bash
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{}'
```

### Verificar resultado

```sql
-- Status mudou?
SELECT status, end_date FROM user_subscriptions
WHERE payment_id = 'test-123';
-- Esperado: status = 'expired'

-- Notificação criada?
SELECT * FROM notifications
WHERE type = 'plan_expired'
ORDER BY created_at DESC LIMIT 1;
```

✅ Se ambos ok, sistema está funcionando!

---

## 📈 MONITORAMENTO

### Ver todas as expiações do dia
```sql
SELECT
  DATE(execution_date) as data,
  SUM(expired_subscriptions_count) as expiradas,
  SUM(notifications_created) as notificacoes
FROM plan_expiration_logs
WHERE execution_date > NOW() - INTERVAL '1 day'
GROUP BY DATE(execution_date);
```

### Ver erros
```sql
SELECT * FROM plan_expiration_logs
WHERE status = 'error'
ORDER BY execution_date DESC;
```

### Dashboard mensal
```sql
SELECT
  DATE_TRUNC('day', execution_date) as dia,
  COUNT(*) as execucoes,
  SUM(expired_subscriptions_count) as total_expirado,
  SUM(notifications_created) as notificacoes,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as erros
FROM plan_expiration_logs
WHERE execution_date > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', execution_date)
ORDER BY dia DESC;
```

---

## ⚙️ CUSTOMIZAÇÕES

### Mudar horário (Padrão: 00:00 UTC)

Para 02:00 AM UTC:
```sql
SELECT cron.alter(
  'check-plan-expiration-daily',
  '0 2 * * *'
);
```

**Horários úteis:**
- `'0 0 * * *'` → 00:00 (meia-noite UTC)
- `'0 3 * * *'` → 03:00 UTC
- `'0 18 * * *'` → 18:00 UTC

### Mudar mensagem de notificação

Edite em `supabase/functions/check-plan-expiration/index.ts`:

```typescript
const { error: notificationError } = await supabase
  .from("notifications")
  .insert({
    title: "🔴 Seu plano expirou!",  // ← Mude aqui
    message: "Seu acesso foi desativado...",  // ← E aqui
    // ...
  });
```

---

## 🚨 TROUBLESHOOTING

### Problema: Job não existe
```bash
# Redeploy
supabase functions deploy check-plan-expiration
```

### Problema: SQL error: function not found
```sql
-- Habilite pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Problema: Sem subscriptions expiradas
```sql
-- Verifique se há expiradas
SELECT COUNT(*) FROM user_subscriptions
WHERE end_date < NOW() AND status = 'active';

-- Se 0, crie uma de teste (veja Teste Rápido acima)
```

---

## 📚 DOCUMENTAÇÃO DETALHADA

| Documento | Conteúdo | Tempo |
|-----------|----------|-------|
| `CHECKLIST_EXPIRACAO.md` | Passo-a-passo com ✅ boxes | 15 min |
| `IMPLEMENTACAO_JOB_EXPIRACAO.md` | Guia completo + troubleshooting | 30 min |
| `PLANO_MELHORIAS_PLANOS.md` | Mockups de UI melhorada | 45 min |
| `RESUMO_IMPLEMENTACOES.md` | Visão geral de tudo | 10 min |

**Leia nesta ordem:**
1. Este arquivo (README) - Entender conceito
2. `CHECKLIST_EXPIRACAO.md` - Implementar
3. `IMPLEMENTACAO_JOB_EXPIRACAO.md` - Se tiver dúvidas
4. `PLANO_MELHORIAS_PLANOS.md` - Para melhorar UI depois

---

## ✅ VERIFICAÇÃO FINAL

Depois de implementar, confirme:

- [ ] Edge Function está deployada (`supabase functions list`)
- [ ] Job está agendado (`SELECT * FROM cron.job`)
- [ ] Teste manual retorna `"status": "success"`
- [ ] Tabela `plan_expiration_logs` tem registros
- [ ] Notificações são criadas quando subscription expira
- [ ] Status muda de 'active' para 'expired'

---

## 🎉 PRÓXIMOS PASSOS

**Agora que job está pronto:**

1. **Melhorar UI** (2 horas)
   - Seguir mockups em `PLANO_MELHORIAS_PLANOS.md`
   - Melhorar "Gerenciar Planos"
   - Melhorar "Editar Plano"

2. **Notificação 7 dias antes** (30 min)
   - Criar outro job
   - Verificar `end_date = NOW() + 7 dias`

3. **Auto-renew** (1 hora)
   - Implementar renovação automática
   - Webhook para processar pagamentos

4. **Dashboard de expiração** (45 min)
   - Mostrar estatísticas
   - Gráficos de tendências

---

## 📞 SUPORTE

**Dúvidas rápidas:**
- ✅ Arquivo `CHECKLIST_EXPIRACAO.md` tem resposta
- ✅ Arquivo `IMPLEMENTACAO_JOB_EXPIRACAO.md` tem detalhes

**Erros:**
- Verifique `plan_expiration_logs`
- Veja `cron.job_run_details` para logs do job
- Teste manual com curl

---

## 📊 STATS

**Arquivos criados:** 5
**Linhas de código:** ~850
**Tempo para implementar:** ~10 minutos
**Benefícios:** ∞ (Zero trabalho manual)

---

**Parabéns! Sistema de expiração está pronto! 🚀**

Agora planos expiram **automaticamente** toda madrugada!

Próximo passo: Melhorar interfaces de Gerenciar Planos (veja `PLANO_MELHORIAS_PLANOS.md`)
