# 🚀 Plano de Implementação - 3 Níveis de Melhoria

## 📋 Estrutura Atual do Projeto
```
✅ webhook_logs table (colunas básicas)
✅ webhook-unificada-v2 Edge Function (parsing)
✅ WebhooksDashboard (10 por página, pills de produtos)
✅ RLS policies (admin access)
✅ Trigger de reprocessamento automático
✅ RPC process_webhook_payment
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO (por dependência lógica)

### FASE 0: Preparação (Pré-requisito para tudo)
**Sem isso, nada funciona bem**

#### 0.1 Criar tabela webhook_errors
```sql
CREATE TABLE webhook_errors (
  id UUID PRIMARY KEY,
  webhook_id UUID REFERENCES webhook_logs(id),
  error_type TEXT,
  error_message TEXT,
  error_detail JSONB,
  created_at TIMESTAMP
);
```

#### 0.2 Adicionar colunas em webhook_logs
```sql
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS processed_successfully BOOLEAN DEFAULT NULL;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS processed_user_id UUID REFERENCES users(id);
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS last_processed_at TIMESTAMP;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS reprocess_attempts INTEGER DEFAULT 0;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
```

**Tempo: 15 min**

---

### FASE 1: NÍVEL 1 - CRÍTICO ✅
**Torna o sistema visível e recuperável**

#### 1.1 Validação de Dados + Registro de Erros
**Arquivo:** `supabase/functions/webhook-unificada-v2/index.ts`

**O que fazer:**
1. Antes de inserir em webhook_logs, validar:
   - customer_email é um email válido
   - transaction_id não está vazio
   - amount > 0
   - products array não está vazio

2. Se validação falhar:
   - NÃO inserir em webhook_logs
   - Inserir em webhook_errors com motivo
   - Retornar erro 400 (não reenviar mais)

**Tempo: 45 min**

---

#### 1.2 Atualizar Edge Function para Salvar Campos
**Arquivo:** `supabase/functions/webhook-unificada-v2/index.ts`

**O que fazer:**
```typescript
const insertData = {
  platform: ...,
  status: 'received',
  processed_successfully: false,  // ← NOVO
  reprocess_attempts: 0,           // ← NOVO
  last_processed_at: null,         // ← NOVO
  processed_user_id: null,         // ← NOVO
  // ... resto dos campos
}
```

**Tempo: 15 min**

---

#### 1.3 Atualizar RPC para Salvar processed_user_id
**Arquivo:** `sql/webhook_reprocessing_setup.sql` (update RPC)

**O que fazer:**
```sql
UPDATE webhook_logs SET
  processed_successfully = (v_subs_count > 0),
  processed_user_id = v_user_id,        -- ← NOVO
  last_processed_at = NOW(),             -- ← NOVO
  reprocess_attempts = reprocess_attempts + 1,
  status = CASE WHEN v_subs_count > 0 THEN 'success' ELSE 'failed' END
WHERE id = p_webhook_id;
```

**Tempo: 20 min**

---

#### 1.4 Adicionar Botão Reprocessar no Dashboard
**Arquivo:** `src/components/admin/WebhooksDashboard.tsx`

**O que fazer:**
1. Adicionar botão "Reprocessar" em cada linha
2. Função que chama RPC `process_webhook_payment`
3. Atualizar UI com novo status

**Tempo: 60 min**

---

#### 1.5 Integrar GGCheckout + AmploPay
**Arquivos:** `supabase/functions/checkout-webhook/index.ts` + criar `amplopay-webhook`

**O que fazer:**
- `checkout-webhook` redireciona para `webhook-unificada-v2` (como vega-webhook)
- Criar `amplopay-webhook` que redireciona também

**Tempo: 30 min**

---

### FASE 2: NÍVEL 2 - IMPORTANTE 🟨
**Deixa o sistema robusto e auditável**

#### 2.1 Deduplicação por transaction_id
**Arquivo:** `supabase/functions/webhook-unificada-v2/index.ts`

**O que fazer:**
```typescript
// Antes de inserir, verificar:
const existing = await supabase
  .from('webhook_logs')
  .select('id, status')
  .eq('transaction_id', transaction_id)
  .eq('platform', platform)
  .maybeSingle();

if (existing && existing.status === 'success') {
  // Duplicado bem-sucedido → skip
  return 200 com "já processado"
}
```

**Tempo: 20 min**

---

#### 2.2 Validação de Estrutura por Plataforma
**Arquivo:** `supabase/functions/webhook-unificada-v2/index.ts`

**O que fazer:**
```typescript
function validatePayloadStructure(payload: any, platform: string): string | null {
  if (platform === 'vega') {
    if (!payload.customer?.email) return "Vega: customer.email ausente";
    if (!payload.products || !Array.isArray(payload.products)) return "Vega: products array ausente";
    return null;
  }
  // ... validações para ggcheckout, amplopay
}
```

**Tempo: 30 min**

---

#### 2.3 Histórico de Reprocessamentos
**Arquivo:** SQL migration

**O que fazer:**
```sql
CREATE TABLE webhook_reprocess_history (
  id UUID PRIMARY KEY,
  webhook_id UUID REFERENCES webhook_logs(id),
  attempt_number INTEGER,
  reason TEXT,
  result TEXT (success/failed),
  error_message TEXT,
  processed_user_id UUID,
  created_at TIMESTAMP
);
```

Cada vez que reprocessa, insere uma linha aqui.

**Tempo: 45 min**

---

#### 2.4 Limpeza de Webhooks Expirados
**Arquivo:** SQL + criar scheduled job

**O que fazer:**
```sql
UPDATE webhook_logs
SET status = 'expired'
WHERE status = 'pending'
AND expires_at < NOW();
```

Executar diariamente (criar job no Supabase).

**Tempo: 20 min**

---

### FASE 3: NÍVEL 3 - NICE TO HAVE 🟩
**Deixa lindo e profissional**

#### 3.1 Dashboard de Relatórios
**Arquivo:** Novo componente `src/components/admin/WebhooksAnalytics.tsx`

**O que fazer:**
- Gráfico de webhooks por dia
- Taxa de sucesso/falha
- Produtos mais vendidos
- Plataformas mais usadas

**Tempo: 120 min**

---

#### 3.2 Sempre Responder 200 (Async Processing)
**Arquivo:** `supabase/functions/webhook-unificada-v2/index.ts`

**O que fazer:**
```typescript
// Responder IMEDIATAMENTE
return new Response(JSON.stringify({ success: true }), { status: 200 });

// Processar DEPOIS (async, não bloqueia)
processWebhookAsync(payload, platform);
```

**Tempo: 30 min**

---

#### 3.3 Timeout Protection
**Arquivo:** `supabase/functions/webhook-unificada-v2/index.ts`

**O que fazer:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
```

**Tempo: 15 min**

---

---

## 📊 RESUMO DE TEMPO

| Fase | Nível | Componentes | Tempo Estimado |
|------|-------|-------------|---|
| 0 | Prep | SQL tables | 15 min |
| 1.1 | Crítico | Validação | 45 min |
| 1.2 | Crítico | Edge Function | 15 min |
| 1.3 | Crítico | RPC | 20 min |
| 1.4 | Crítico | Dashboard Button | 60 min |
| 1.5 | Crítico | GGCheckout/AmploPay | 30 min |
| **FASE 1 Total** | | | **180 min (3h)** |
| 2.1 | Importante | Deduplicação | 20 min |
| 2.2 | Importante | Validação | 30 min |
| 2.3 | Importante | História | 45 min |
| 2.4 | Importante | Limpeza | 20 min |
| **FASE 2 Total** | | | **115 min (2h)** |
| 3.1 | Nice | Analytics | 120 min |
| 3.2 | Nice | Async | 30 min |
| 3.3 | Nice | Timeout | 15 min |
| **FASE 3 Total** | | | **165 min (2.75h)** |

**TOTAL: ~8 horas**

---

## ✅ Implementação Recomendada

### Semana 1 (Crítico)
- [ ] Fase 0 (15 min)
- [ ] 1.1 + 1.2 + 1.3 (80 min)
- [ ] 1.4 (60 min)
- [ ] 1.5 (30 min)

### Semana 2 (Importante)
- [ ] 2.1 (20 min)
- [ ] 2.2 (30 min)
- [ ] 2.3 (45 min)
- [ ] 2.4 (20 min)

### Semana 3 (Nice)
- [ ] 3.1 (120 min)
- [ ] 3.2 (30 min)
- [ ] 3.3 (15 min)

---

## 🎯 Qual você quer começar?

**Recomendo FASE 0 + Fase 1.1-1.3** (80 min) para deixar o sistema visível e seguro.

Depois **1.4-1.5** (90 min) para deixar funcional.

Quer que eu comece por qual?
