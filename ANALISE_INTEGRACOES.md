# 🔍 Análise: Página de Integrações - O que Não Funciona

## 📊 Estado Atual da Página

```
AmploPay        ✅ Ativo | S/ Secret | 0 webhooks | 0% taxa de sucesso | Último: Nunca
GGCheckout      ✅ Ativo | S/ Secret | 3 webhooks | 66.7% taxa de sucesso | Último: 27/11/2025
Vega Checkout   ✅ Ativo | S/ Secret | 97 webhooks | 0% taxa de sucesso | Último: 26/11/2025
```

---

## 🚨 PROBLEMAS ENCONTRADOS

### ⛔ PROBLEMA #1: MÉTRICAS NÃO ESTÃO SENDO CALCULADAS (CRÍTICO)

**O que vemos:**
- Vega: 97 webhooks, 0% sucesso (suspeito - deveria ter sucessos)
- GGCheckout: 3 webhooks, 66.7% sucesso (parece OK)
- AmploPay: 0 webhooks nunca (talvez correto, sem integrações)

**Causa raiz:**
- A tabela `integrations_status` DEVERIA ser atualizada automaticamente por um trigger quando webhooks chegam
- O trigger (`update_integrations_trigger.sql`) tenta usar `platform` para contar webhooks
- MAS a tabela `webhook_logs` pode NÃO ter a coluna `platform` definida corretamente

**Verificação necessária:**
```sql
-- Para verificar se platform existe em webhook_logs:
SELECT column_name FROM information_schema.columns
WHERE table_name='webhook_logs';
```

---

### ⛔ PROBLEMA #2: VALIDAÇÃO DE SECRETS NÃO ESTÁ FUNCIONANDO (CRÍTICO)

**O que a interface mostra:**
```
🔒 Gerenciar Secrets
┌──────────────────────────────────────────┐
│ Vega         [Input Secret]  [Salvar]    │
│ GGCheckout   [Input Secret]  [Salvar]    │
│ AmploPay     [Input Secret]  [Salvar]    │
└──────────────────────────────────────────┐
```

**O que está acontecendo:**
1. ✅ Secrets SÃO salvos no banco de dados (tabela `webhook_secrets`)
2. ❌ MAS os Edge Functions NÃO estão usando os secrets para validar as assinaturas HMAC SHA256
3. ❌ Os webhooks estão sendo processados SEM validação de segurança

**Evidência:**
- `IntegrationsDashboard.tsx` (linhas 97-131): Interface para salvar secrets funciona
- `webhook-unificada-v2/index.ts` (linhas 18-57): Código de validação HMAC existe
- `webhook-ggcheckout/index.ts` (linha 173): NÃO chama validação de HMAC
- `vega-webhook/index.ts`: Apenas redireciona, não valida

**Risco de segurança:** Qualquer pessoa pode enviar webhooks fake para seu sistema!

---

### ⛔ PROBLEMA #3: MÚLTIPLOS HANDLERS DE WEBHOOK REDUNDANTES (MÉDIO)

**Situação confusa:**

O projeto tem **7 Edge Functions diferentes** para webhooks:

```
🔴 vega-webhook/              → Redireciona para webhook-unificada (v1)
🔴 checkout-webhook/          → Redireciona para webhook-unificada-v2
🔴 amplopay-webhook/          → Redireciona para webhook-unificada-v2
🟢 webhook-unificada/         → Handler original (v1) - Processa Vega?
🟢 webhook-unificada-v2/      → Handler novo (v2) - Processa GG + Amplo?
🟡 webhook-ggcheckout/        → Handler específico - Por que existe se tem v2?
🟡 webhook/ (genérico)        → Handler detector de plataforma
```

**Problema:**
- Não está claro qual handler REALMENTE processa cada plataforma
- Há redirects desnecessários (vega-webhook apenas redireciona)
- Duas versões do handler unificado (v1 e v2) - qual é a correta?

---

### ⛔ PROBLEMA #4: INCONSISTÊNCIA DE STATUS DOS WEBHOOKS (MÉDIO)

**Valores esperados de `status` em diferentes partes do código:**

```
create_webhook_logs.sql:        'success' | 'error' | 'ignored'
004_ajustar_webhook_logs.sql:   'received' | 'success' | 'pending' | 'failed'
webhook-ggcheckout/index.ts:    'received' | 'pending' | 'success' | 'failed'
webhook-unificada/index.ts:     'success' | 'failed'
```

**Impacto:**
- Trigger procura por `status = 'success'` mas Edge Functions salvam `status = 'pending'`
- Taxa de sucesso fica incorreta porque a query não encontra os webhooks certos

---

### ⛔ PROBLEMA #5: SCHEMA DA TABELA webhook_logs INCONSISTENTE (CRÍTICO)

**A tabela webhook_logs tem conflitos entre definições:**

Coluna original (`create_webhook_logs.sql`):
```sql
- event_type, status, message
- customer_email, customer_name, customer_document
- product_id, plan_name, expiration_date
- payment_id, payment_method, amount
❌ NÃO TEM: platform, transaction_id, raw_payload
```

Mas o código espera (Edge Functions):
```sql
✅ TEM que ter: platform (para trigger funcionar)
✅ TEM que ter: transaction_id (para deduplicação)
✅ TEM que ter: raw_payload (para processar dados)
✅ TEM que ter: product_ids (array de produtos)
```

**Resultado:**
- Trigger tenta `WHERE platform = NEW.platform` e FALHA silenciosamente
- Metrics nunca são atualizadas corretamente
- Dados podem estar duplicados sem transaction_id

---

## 📋 CHECKLIST: O QUE DELETAR, ATUALIZAR E EDITAR

### ❌ DELETAR

#### 1. Remove Handlers de Webhook Redundantes
```
supabase/functions/vega-webhook/index.ts
supabase/functions/checkout-webhook/index.ts
supabase/functions/amplopay-webhook/index.ts
```
**Por quê:** Eles apenas redirecionam. A redireção pode ser feita na configuração do webhook, não no código.

#### 2. Remove Código de Serviços Antigos (se não está sendo usado)
```
src/services/webhook.ts          (código de teste/simulação)
src/services/webhookHandler.ts   (exemplos de endpoints antigos)
```
**Por quê:** Código legado que confunde quando precisa debugar

---

### ✏️ ATUALIZAR

#### 1. Fixar Schema da Tabela webhook_logs

**Executar no Supabase SQL Editor:**
```sql
-- Adicionar colunas faltando se não existirem
ALTER TABLE webhook_logs
ADD COLUMN IF NOT EXISTS platform TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS raw_payload JSONB,
ADD COLUMN IF NOT EXISTS product_ids TEXT[],
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_platform
ON webhook_logs(platform);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_status
ON webhook_logs(status);

-- Garantir que platform está preenchido
UPDATE webhook_logs
SET platform = CASE
  WHEN raw_payload->>'platform' IS NOT NULL THEN raw_payload->>'platform'
  WHEN event_type LIKE '%vega%' THEN 'vega'
  WHEN event_type LIKE '%gg%' THEN 'ggcheckout'
  WHEN event_type LIKE '%amplo%' THEN 'amplopay'
  ELSE 'unknown'
END
WHERE platform IS NULL;
```

---

#### 2. Implementar Validação HMAC em Todos os Handlers

**Padrão a seguir (webhook-unificada-v2 já tem isso):**

```typescript
// No início de cada handler:
import crypto from 'crypto';

const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
};

// Ao receber webhook:
const signature = req.headers['x-signature'] || req.headers['x-hmac-signature'];
const secret = await getWebhookSecret(platform); // Buscar do banco

if (secret && !validateWebhookSignature(bodyString, signature, secret)) {
  return { statusCode: 401, body: 'Invalid signature' };
}
```

**Aplicar em:**
- `webhook-ggcheckout/index.ts` (linhas ~173)
- `webhook/index.ts` (genérico)
- `webhook-unificada/index.ts` (v1)

---

#### 3. Padronizar Valores de Status

**Decidir um padrão único:**
```
RECOMENDADO: 'received' → 'pending' → 'success' OU 'failed'
```

**Atualizar em:**
- `create_webhook_logs.sql` - comentário de constraint
- `004_ajustar_webhook_logs.sql` - constraint de validação
- Todos os Edge Functions - sempre usar os mesmos valores

**SQL:**
```sql
-- Adicionar constraint para garantir valores válidos
ALTER TABLE webhook_logs
ADD CONSTRAINT check_valid_status
CHECK (status IN ('received', 'pending', 'success', 'failed'));
```

---

### 📝 EDITAR

#### 1. Consolidar em UM Único Handler Unificado

**Escolher entre:**
- Opção A: Manter `webhook-unificada-v2` (mais recente, já tem validação HMAC)
- Opção B: Usar apenas `webhook/` (genérico, simples)

**Recomendação:** Usar `webhook-unificada-v2` e renomear para `webhook/` para clareza

**Fazer:**
1. Fazer backup de `webhook-unificada/` e `webhook/` (antiga)
2. Renomear `webhook-unificada-v2/` → `webhook/` (nova)
3. Atualizar URLs do webhook nas três plataformas:
   ```
   Vega:       https://.../functions/v1/webhook
   GGCheckout: https://.../functions/v1/webhook
   AmploPay:   https://.../functions/v1/webhook
   ```

---

#### 2. Atualizar IntegrationsDashboard.tsx (Pequenas Melhorias)

**Linha 209-210:** Adicionar comentário:
```typescript
// O status "S/ Secret" é normal - webhooks funcionam mesmo sem secret
// Mas a validação HMAC não funciona sem secret configurado
```

**Linha 317-326:** Melhorar mensagem:
```typescript
{secretsStatus.find(s => s.platform === integration.platform)?.is_configured ? (
  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
    <Lock className="w-3 h-3" />
    Secret OK ✅
  </div>
) : (
  <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600 flex items-center gap-1">
    <Lock className="w-3 h-3" />
    ⚠️ Sem validação
  </div>
)}
```

---

#### 3. Fixar Trigger de Atualização de Stats

**Arquivo:** `update_integrations_trigger.sql`

**Problema atual:** Tenta usar `platform` que pode não existir

**Solução:**
```sql
CREATE OR REPLACE FUNCTION update_integrations_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que platform está preenchido
  IF NEW.platform IS NULL THEN
    NEW.platform := COALESCE(NEW.raw_payload->>'platform', 'unknown');
  END IF;

  -- Atualizar stats
  UPDATE integrations_status
  SET
    total_webhooks = (
      SELECT COUNT(*) FROM webhook_logs
      WHERE platform = NEW.platform AND created_at > NOW() - INTERVAL '90 days'
    ),
    successful_webhooks = (
      SELECT COUNT(*) FROM webhook_logs
      WHERE platform = NEW.platform AND status IN ('success', 'completed')
      AND created_at > NOW() - INTERVAL '90 days'
    ),
    failed_webhooks = (
      SELECT COUNT(*) FROM webhook_logs
      WHERE platform = NEW.platform AND status = 'failed'
      AND created_at > NOW() - INTERVAL '90 days'
    ),
    last_webhook_at = NEW.created_at,
    updated_at = NOW()
  WHERE LOWER(platform) = LOWER(NEW.platform);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### Fase 1: CRÍTICO (Hoje)
1. ✅ Executar SQL para adicionar colunas faltando em webhook_logs
2. ✅ Fixar trigger para usar corretamente a coluna `platform`
3. ✅ Testar se metrics começam a atualizar

### Fase 2: IMPORTANTE (Esta semana)
1. ✅ Consolidar handlers de webhook (deletar redirects, usar apenas webhook-unificada-v2)
2. ✅ Implementar validação HMAC em todos os handlers
3. ✅ Padronizar valores de status em todo o projeto

### Fase 3: LIMPEZA (Próxima semana)
1. ✅ Deletar código legacy (vega-webhook, checkout-webhook, amplopay-webhook)
2. ✅ Deletar serviços antigos (webhook.ts, webhookHandler.ts)
3. ✅ Documentar o novo fluxo de webhooks

---

## 📊 RESUMO DO ESTADO ATUAL

| Item | Status | Problema |
|------|--------|----------|
| **Interface de Integrações** | ✅ Funciona | Exibe dados (talvez incorretos) |
| **Metrics (Contadores)** | ❌ Não calcula | Schema inconsistente, trigger falha silenciosamente |
| **Secret Management** | 🟡 Parcial | Salva secrets mas NÃO usa para validar |
| **Webhook Handlers** | 🟡 Confuso | Múltiplos, redundantes, sem clear owner |
| **HMAC Validation** | ❌ Desativado | Código existe mas não é chamado |
| **Status Consistency** | ❌ Inconsistente | Diferentes valores em diferentes partes |

---

## 🔐 RISCO DE SEGURANÇA

⚠️ **CRÍTICO:** Webhooks estão sendo aceitos e processados **SEM validação de assinatura HMAC**

Isso significa:
- Qualquer pessoa pode enviar um webhook fake
- Planos podem ser ativados sem realmente ter sido pago
- Seus dados financeiros estão em risco

**Ação imediata recomendada:** Implementar validação HMAC

---

**Análise realizada em:** 26/11/2025
**Prioridade:** ALTA - Especialmente validação HMAC
