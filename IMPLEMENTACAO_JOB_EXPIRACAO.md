# 🔧 GUIA DE IMPLEMENTAÇÃO: Job de Expiração Diária de Planos

## 📋 RESUMO

Este guia explica como ativar a **verificação automática diária de expiração de planos** no seu projeto EduKaPrime.

**O que o job faz:**
- ✅ Roda **uma vez por dia** (00:00 UTC)
- ✅ Busca todas as subscriptions com `end_date < NOW()` e `status = 'active'`
- ✅ Muda status para `'expired'`
- ✅ Cria notificação automática para o usuário
- ✅ Registra log para auditoria

---

## 🎯 ARQUIVOS CRIADOS

```
supabase/functions/check-plan-expiration/index.ts
└─ Edge Function que verifica e expira planos

supabase/migrations/setup-plan-expiration-cron.sql
└─ Script SQL que agenda a execução diária
```

---

## 📦 PRÉ-REQUISITOS

- ✅ Projeto Supabase com extensão `pg_cron` habilitada
- ✅ Supabase CLI instalado (`npm install -g supabase`)
- ✅ Tabela `notifications` existente no banco
- ✅ Tabela `user_subscriptions` com coluna `end_date`
- ✅ Tabela `pending_plans` com coluna `end_date`

---

## 🚀 PASSO 1: DEPLOY DA EDGE FUNCTION

### 1.1 Verificar se a função existe
```bash
supabase functions list
```

### 1.2 Deploy da função
```bash
cd seu-projeto/
supabase functions deploy check-plan-expiration
```

**Esperado:**
```
✓ Deployed function check-plan-expiration
  Endpoint: https://[YOUR_PROJECT_ID].supabase.co/functions/v1/check-plan-expiration
```

### 1.3 Teste manual (opcional)
```bash
curl -X POST \
  https://[YOUR_PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Esperado:**
```json
{
  "status": "success",
  "expired_count": 5,
  "notifications_created": 5,
  "pending_plans_expired": 2,
  "timestamp": "2024-11-27T00:15:00.000Z"
}
```

---

## 🗓️ PASSO 2: AGENDAR EXECUÇÃO DIÁRIA

### 2.1 Encontrar seu Project ID
1. Acesse: https://app.supabase.com
2. Escolha seu projeto
3. Copy o Project ID da URL ou do painel

Exemplo: `lkhfbhvamnqgcqlrriaw` (está na URL)

### 2.2 Editar o arquivo SQL
Abra: `supabase/migrations/setup-plan-expiration-cron.sql`

Substitua TODAS as ocorrências de:
```
[YOUR_PROJECT_ID]
```

Por seu Project ID real, ex:
```
lkhfbhvamnqgcqlrriaw
```

### 2.3 Executar o script SQL
1. Acesse: https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql/new
2. Cole o conteúdo do arquivo `setup-plan-expiration-cron.sql`
3. Clique no botão **"Run"** (triângulo verde)

**Esperado:**
```
Query completed successfully
```

### 2.4 Verificar se o job foi criado
Execute esta query no SQL Editor:

```sql
SELECT * FROM cron.job
WHERE jobname = 'check-plan-expiration-daily';
```

**Esperado:**
```
jobid  | jobname                        | schedule | command | nodename | nodeport | database | username | active
-------|--------------------------------|----------|---------|----------|----------|----------|----------|--------
123    | check-plan-expiration-daily    | 0 0 * * * | ...     | localhost| 5432     | postgres | postgres | t
```

---

## 📊 PASSO 3: MONITORAR EXECUÇÕES

### 3.1 Ver histórico de execuções
Execute no SQL Editor:

```sql
SELECT *
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid
  FROM cron.job
  WHERE jobname = 'check-plan-expiration-daily'
)
ORDER BY start_time DESC
LIMIT 10;
```

**Colunas importantes:**
- `start_time` - Quando a execução começou
- `end_time` - Quando terminou
- `status` - 'succeeded' ou 'failed'
- `return_message` - Resultado ou erro

### 3.2 Ver logs da execução
Se quiser mais detalhes, verifique a tabela de logs:

```sql
SELECT *
FROM plan_expiration_logs
ORDER BY execution_date DESC
LIMIT 10;
```

---

## 🧪 PASSO 4: TESTAR COM DADOS REAIS

### 4.1 Criar uma subscription de teste com expiração próxima

```sql
-- Buscar um usuário para teste
SELECT id FROM users LIMIT 1;

-- Criar uma subscription que expira HOJE
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  start_date,
  end_date,
  payment_id,
  amount_paid
) VALUES (
  '[USER_ID_DO_TESTE]',
  1,  -- ID de um plano que existe
  'active',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '1 day',  -- Expirou ontem
  'test-payment-123',
  29.99
);
```

### 4.2 Executar o job manualmente

```bash
curl -X POST \
  https://[YOUR_PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4.3 Verificar se funcionou

Verifique se a subscription foi marcada como `expired`:

```sql
SELECT status, end_date
FROM user_subscriptions
WHERE end_date < NOW()
LIMIT 5;
```

**Esperado:** Todas as linhas devem ter `status = 'expired'`

Verifique se a notificação foi criada:

```sql
SELECT user_id, type, title, created_at
FROM notifications
WHERE type = 'plan_expired'
ORDER BY created_at DESC
LIMIT 5;
```

---

## ⚙️ PASSO 5: CONFIGURAR HORÁRIO DE EXECUÇÃO (Opcional)

Por padrão, o job roda às **00:00 UTC**.

Se quiser mudar para outro horário, edite a linha:

```sql
'0 0 * * *',  -- Altere aqui
```

**Sintaxe Cron:**
```
0 0 * * *
│ │ │ │ └─ Dia da semana (0=domingo, 6=sábado)
│ │ │ └─ Mês
│ │ └─ Dia do mês
│ └─ Hora
└─ Minuto
```

**Exemplos:**
- `'0 0 * * *'` - 00:00 UTC (meia-noite)
- `'0 2 * * *'` - 02:00 UTC
- `'0 12 * * *'` - 12:00 UTC (meio-dia)
- `'0 18 * * *'` - 18:00 UTC (6 PM)

Para **atualizar** o agendamento:

```sql
SELECT cron.alter(
  'check-plan-expiration-daily',
  '0 2 * * *'  -- Novo horário
);
```

---

## 🚨 DESABILITAR OU REMOVER

### Desabilitar temporariamente
```sql
SELECT cron.unschedule('check-plan-expiration-daily');
```

### Reativar depois
Execute novamente o arquivo `setup-plan-expiration-cron.sql`

### Remover completamente
```sql
SELECT cron.unschedule('check-plan-expiration-daily');
```

---

## 📈 MÉTRICAS E MONITORAMENTO

### Dashboard de Expiração (Query útil)

```sql
SELECT
  DATE(execution_date) as data,
  COUNT(*) as total_execucoes,
  SUM(expired_subscriptions_count) as total_expirado,
  SUM(notifications_created) as total_notificacoes,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as erros
FROM plan_expiration_logs
WHERE execution_date > NOW() - INTERVAL '30 days'
GROUP BY DATE(execution_date)
ORDER BY data DESC;
```

### Alertar se houver muitas expiações

```sql
-- Ver dias com picos de expiração
SELECT
  DATE(execution_date) as data,
  expired_subscriptions_count,
  notifications_created
FROM plan_expiration_logs
WHERE expired_subscriptions_count > 20  -- Mais de 20 expiradas
ORDER BY execution_date DESC
LIMIT 10;
```

---

## 🐛 TROUBLESHOOTING

### Problema: Job não executa
**Solução:**
1. Verifique se `pg_cron` está ativado:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```
2. Verifique se a Edge Function está ativa:
   ```bash
   supabase functions list
   ```
3. Verifique se a URL e token estão corretos no SQL

### Problema: Erro de autorização
**Solução:**
Verifique se você tem `SUPABASE_SERVICE_ROLE_KEY` válida

### Problema: Nenhuma notificação foi criada
**Solução:**
1. Verifique se a tabela `notifications` existe:
   ```sql
   SELECT * FROM notifications LIMIT 1;
   ```
2. Verifique se há subscriptions realmente expiradas:
   ```sql
   SELECT COUNT(*)
   FROM user_subscriptions
   WHERE end_date < NOW() AND status = 'active';
   ```

### Problema: Job roda mas não expira nada
**Solução:**
1. Verifique se há registros com `end_date` no passado:
   ```sql
   SELECT COUNT(*) FROM user_subscriptions WHERE end_date < NOW();
   ```
2. Verifique se estão com `status = 'active'`:
   ```sql
   SELECT COUNT(*) FROM user_subscriptions
   WHERE end_date < NOW() AND status = 'active';
   ```

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Edge Function `check-plan-expiration` foi deployada
- [ ] Arquivo SQL foi executado
- [ ] Job foi criado (verificado em `cron.job`)
- [ ] Teste manual funcionou
- [ ] Dados de teste foram marcados como `expired`
- [ ] Notificação foi criada
- [ ] Horário do job foi confirmado (00:00 UTC)
- [ ] Logs estão sendo registrados

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   supabase functions list check-plan-expiration
   supabase functions logs check-plan-expiration
   ```

2. **Teste a função manualmente:**
   ```bash
   curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -d '{}'
   ```

3. **Verifique se há erros no SQL:**
   - Acesse SQL Editor do Supabase
   - Execute: `SELECT * FROM cron.job_run_details LIMIT 1;`
   - Se houver erro, aparecerá em `return_message`

---

## 🎉 CONCLUSÃO

Agora seu sistema expira planos **automaticamente todo dia** às 00:00 UTC!

**Próximos passos:**
1. ✅ Implementar melhorias de UI (Gerenciar Planos, Editar Plano)
2. ✅ Notificação 7 dias antes de expiração
3. ✅ Dashboard mostrando estatísticas de expiração
