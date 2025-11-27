# 🚀 GUIA RÁPIDO: Deploy do Job de Expiração

> **Status:** ✅ Código pronto, build passou, apenas 3 passos para ativar

---

## ⚡ DEPLOY AGORA (10 minutos)

### Passo 1: Deploy da Edge Function

```bash
cd seu-projeto/
supabase functions deploy check-plan-expiration
```

**Esperado:**
```
✓ Deployed function check-plan-expiration
  Endpoint: https://[PROJECT_ID].supabase.co/functions/v1/check-plan-expiration
```

---

### Passo 2: Executar Setup SQL

1. Abra seu navegador: https://app.supabase.com/project/[SEU_ID]/sql/new
2. Abra o arquivo: `supabase/migrations/setup-plan-expiration-cron.sql`
3. **⚠️ IMPORTANTE:** Substitua **TODAS** as ocorrências de `[YOUR_PROJECT_ID]` pelo seu Project ID real
   - Seu Project ID: Encontre em `https://app.supabase.com/project/[COPIE_AQUI]`
4. Cole o conteúdo inteiro no SQL Editor
5. Clique "Run" (botão verde com triângulo)

**Esperado:**
```
Query completed successfully
```

---

### Passo 3: Confirmar que Job está Ativo

Execute no SQL Editor:
```sql
SELECT jobname, schedule, active FROM cron.job
WHERE jobname = 'check-plan-expiration-daily';
```

**Esperado:**
```
jobname                        | schedule    | active
-------------------------------|-------------|--------
check-plan-expiration-daily    | 0 0 * * *   | t
```

---

## ✅ PRONTO!

Job está rodando! Todos os dias às **00:00 UTC** ele vai:
- ✅ Verificar planos expirados
- ✅ Mudar status para 'expired'
- ✅ Criar notificações automáticas
- ✅ Registrar logs para auditoria

---

## 📊 Monitorar Execução

Depois de alguns dias, verifique se está funcionando:

```sql
-- Ver logs de expiração
SELECT execution_date, expired_subscriptions_count, notifications_created, status
FROM plan_expiration_logs
ORDER BY execution_date DESC LIMIT 10;
```

---

## 🧪 Testar Agora (Opcional)

Se quiser testar antes de esperar 00:00 UTC:

```bash
# Copie e execute (substitua PROJECT_ID e token)
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
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

---

## 📚 Documentação Detalhada

Se tiver dúvidas:
- **Quickstart rápido:** `README_EXPIRACAO_PLANOS.md`
- **Passo-a-passo completo:** `CHECKLIST_EXPIRACAO.md`
- **Troubleshooting:** `IMPLEMENTACAO_JOB_EXPIRACAO.md`

---

## 🎉 Conclusão

Sistema de expiração automática de planos está pronto!

Próximos passos (opcional):
- Melhorar interface "Gerenciar Planos" (veja `PLANO_MELHORIAS_PLANOS.md`)
- Notificação 7 dias antes de expiração
- Auto-renew automático

---

**Criado:** 27 de Novembro de 2024
**Status:** ✅ Pronto para produção
