# 🎯 Guia Completo de Setup: Webhooks + Ativação Automática de Planos

## 📋 Resumo do que foi criado:

### 1. ✅ SQL Migration
**Arquivo:** `sql/001_add_gateway_ids_to_plans.sql`

Adiciona 3 novos campos a `plans_v2`:
- `vega_product_id` (VARCHAR)
- `ggcheckout_product_id` (VARCHAR)
- `amplopay_product_id` (VARCHAR)

Também cria índices para performance de lookup.

---

### 2. ✅ Webhook Function (Deno/Supabase Edge Functions)
**Arquivo:** `supabase/functions/webhook-unificada/index.ts`

**Funcionalidades:**
- Detecta plataforma (Vega, GGCheckout, AmploPay)
- Extrai ID do produto de cada plataforma
- Faz lookup do plano baseado no ID da plataforma
- Cria automaticamente `user_subscriptions`
- Atualiza `users.plano_ativo` e `users.data_expiracao_plano`
- Marca webhook como 'success' ou 'failed'

**Fluxo:**
```
1. Webhook chega → Detecta plataforma
2. Extrai product_id (vega: items[0].code, gg: products[0].id, etc)
3. Busca plano em plans_v2 pelo ID correto da plataforma
4. Encontra usuário pelo email
5. Cria subscription em user_subscriptions
6. Atualiza users com plano ativo e data de expiração
7. Marca webhook como 'success'
```

---

### 3. ✅ Interface Gerenciar Planos (React Component)
**Arquivo:** `src/pages/admin/AdminPlanosManager.tsx`

**Melhorias:**
- 3 campos de entrada (um por plataforma)
- Badges/pills coloridas mostrando IDs configurados
- Formulário de criar novo plano com 3 campos
- Edição de planos com 3 campos
- Indicador visual quando um plano está sem IDs configurados

---

## 🚀 Próximos Passos (O que fazer no Supabase):

### PASSO 1: Rodar SQL Migration

1. Abra Supabase → SQL Editor
2. Cole o conteúdo de `sql/001_add_gateway_ids_to_plans.sql`
3. Execute (Run)

```sql
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS vega_product_id VARCHAR;
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS ggcheckout_product_id VARCHAR;
ALTER TABLE plans_v2 ADD COLUMN IF NOT EXISTS amplopay_product_id VARCHAR;

CREATE INDEX IF NOT EXISTS idx_plans_vega_id ON plans_v2(vega_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_ggcheckout_id ON plans_v2(ggcheckout_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_amplopay_id ON plans_v2(amplopay_product_id);
```

---

### PASSO 2: Criar/Atualizar Edge Function

1. Supabase → Functions
2. Crie uma nova função chamada `webhook-unificada` (ou renomeie a existente)
3. Cole o código de `supabase/functions/webhook-unificada/index.ts`
4. Certifique-se que as variáveis de ambiente estão configuradas:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

**URL da função após deploy:**
```
https://[seu-projeto].supabase.co/functions/v1/webhook-unificada
```

---

### PASSO 3: Atualizar Configuração de Webhooks

Configure as plataformas para apontar para:
```
https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada
```

**Vega:**
- URL Webhook: `https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada`

**GGCheckout:**
- URL Webhook: `https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada`

**AmploPay:**
- URL Webhook: `https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-unificada`

---

### PASSO 4: Configurar Planos no Admin

1. Acesse: Dashboard Admin → Gerenciar Planos
2. Edite um plano existente ou crie um novo
3. Preencha os 3 campos de ID:
   - **Vega:** Insira o `code` do produto (ex: `3MGN9O`)
   - **GGCheckout:** Insira o `id` do produto (ex: `WpjID8aV49ShaQ07ABzP`)
   - **AmploPay:** Insira o `product_id` (ex: `prod_123`)
4. Salve o plano
5. Os badges coloridos aparecerão automaticamente

**Exemplo:**
```
🟢 Vega: 3MGN9O
🔵 GGCheckout: WpjID8aV49ShaQ07ABzP
🟣 AmploPay: prod_123
```

---

## 🧪 Teste End-to-End

### Cenário de Teste:

1. **Criar um plano de teste:**
   - Nome: "TESTE_WEBHOOK"
   - Tipo: Mensal
   - Duração: 30 dias
   - Vega ID: Use um ID real do seu Vega
   - GGCheckout ID: Use um ID real do seu GGCheckout
   - AmploPay ID: Use um ID real do seu AmploPay

2. **Gerar uma compra:**
   - Vá para o site
   - Compre o produto em uma das plataformas
   - **NÃO PAGUE** (use dados de teste se disponível)

3. **Verificar webhook:**
   - Dashboard Admin → Webhooks Recebidos
   - Procure o webhook recente
   - Status deve ser: `success`
   - Processed_at deve estar preenchido

4. **Verificar ativação:**
   - Acesse a conta de teste
   - Verifique se `plano_ativo` foi atualizado
   - Verifique se `data_expiracao_plano` está correta

---

## 📊 Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ Cliente Compra → Gateway/Checkout                              │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ Gateway envia Webhook para:                                     │
│ https://.../functions/v1/webhook-unificada                     │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. Detecta Plataforma                                           │
│ 2. Extrai Product ID                                            │
│ 3. Insere em webhook_logs com status='received'                │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Busca Plano em plans_v2 usando:                             │
│    - plans_v2.vega_product_id = product_id (se Vega)          │
│    - plans_v2.ggcheckout_product_id = product_id (se GGCheckout)
│    - plans_v2.amplopay_product_id = product_id (se AmploPay)  │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Busca Usuário pelo email                                    │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Cria Subscription em user_subscriptions:                    │
│    - user_id                                                    │
│    - plan_id                                                    │
│    - status = 'active'                                          │
│    - start_date = now()                                         │
│    - end_date = now() + duration_days (se mensal)              │
│    - product_id_gateway = ID do produto                        │
│    - webhook_id = ID do webhook                                │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Atualiza users:                                             │
│    - plano_ativo = plan_id                                     │
│    - data_expiracao_plano = end_date                           │
│    - updated_at = now()                                         │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Atualiza webhook_logs:                                      │
│    - status = 'success'                                        │
│    - processed_at = now()                                       │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Cliente tem acesso ao plano automaticamente!                │
│ ✅ Dashboard mostra webhook com status success                 │
│ ✅ Auditoria completa em webhook_logs                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Webhook recebido mas não processa:

1. **Verificar em webhook_logs:**
   - `status = 'failed'`?
   - Se sim, o erro está em uma dessas etapas:
     - Plano não encontrado → Verifique se o ID está correto em plans_v2
     - Usuário não encontrado → Email do webhook diferente do cadastro
     - Erro ao criar subscription → Problema na tabela user_subscriptions

2. **Verificar logs do Edge Function:**
   - Supabase → Functions → webhook-unificada → Logs
   - Procure por mensagens com ❌ ou ⚠️

3. **Verificar se IDs estão corretos:**
   ```sql
   SELECT id, vega_product_id, ggcheckout_product_id, amplopay_product_id
   FROM plans_v2
   WHERE name LIKE '%TESTE%';
   ```

---

## 📝 Checklist Final

- [ ] SQL migration executada com sucesso
- [ ] 3 novos campos visíveis em plans_v2
- [ ] Edge function `webhook-unificada` criada e deployed
- [ ] URLs de webhook atualizadas em todas as plataformas
- [ ] AdminPlanosManager mostra 3 campos de ID + badges
- [ ] Pelo menos 1 plano tem IDs configurados
- [ ] Teste end-to-end realizado com sucesso
- [ ] Webhook aparece em Dashboard com status 'success'
- [ ] Usuário de teste tem plano_ativo atualizado
- [ ] Data de expiração está correta

---

## ❓ Dúvidas?

Se algo não funcionar, verifique:

1. **Logs do Edge Function** (Supabase → Functions → webhook-unificada → Logs)
2. **webhook_logs** para ver o status e mensagem de erro
3. **plans_v2** para confirmar que os IDs estão preenchidos
4. **users** para confirmar que email corresponde exatamente

---

**Status:** ✅ COMPLETO - Pronto para deployment no Supabase
