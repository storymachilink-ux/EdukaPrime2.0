Etapa 01: Executar SQL Migration

Arquivo: sql/webhook_reprocessing_setup.sql

Copie o arquivo inteiro e execute no Supabase SQL Editor.

Isso irá:
✅ Adicionar colunas: expires_at, product_ids, reprocess_count, last_reprocess_at
✅ Criar função process_webhook_payment() - processa pagamentos com múltiplos planos
✅ Criar função reprocess_pending_webhooks_for_user() - dispara ao criar novo user
✅ Criar trigger trigger_reprocess_webhook_on_user_created - reprocessamento automático
✅ Criar função expire_old_webhooks() - expira webhooks após 30 dias

---

Etapa 02: Substituir Edge Function

Arquivo Antigo: supabase/functions/webhook-unificada/index.ts
Arquivo Novo: supabase/functions/webhook-unificada-v2/index.ts

Opção A (Recomendado - Sem Downtime):
1. Copie todo o conteúdo de webhook-unificada-v2/index.ts
2. Abra webhook-unificada/index.ts no editor
3. Substitua tudo pelo novo conteúdo
4. Salve
5. Deploy automático

Opção B (Criar novo):
1. Crie um arquivo webhook-unificada-v2/index.ts no Supabase
2. Configure vega-webhook para chamar v2 ao invés de v1
3. Teste e valide

Mudanças principais:
✅ extractProductIds() - Extrai TODOS os product IDs (não apenas [0])
✅ Loop para processar múltiplos planos
✅ Status: pending quando user não existe
✅ Status: expired quando passa 30 dias
✅ Integração com função SQL process_webhook_payment()

---

Etapa 03: Adicionar Componente ao Dashboard Admin

Arquivo: src/components/admin/WebhookReprocessor.tsx

Importe no seu arquivo de Dashboard Admin:

import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

E adicione no render:

<WebhookReprocessor />

Funcionalidades:
✅ Lista webhooks PENDING, FAILED, ERROR
✅ Botão "Reprocessar" para cada webhook
✅ Editar email antes de reprocessar
✅ Deletar webhooks
✅ Status colorido
✅ Contador de tentativas
✅ Timestamps

---

Etapa 04: Testar Fluxo Completo

TESTE 1: Webhook com User Existente + Múltiplos Planos

1. Crie 2 planos com vega_product_id mapeado:
   - PLANO_A: vega_product_id = "ABC123"
   - PLANO_B: vega_product_id = "DEF456"

2. Crie usuário com email: teste@email.com

3. Envie webhook simulado:
{
  "items": [
    {"code": "ABC123", "title": "Plano A"},
    {"code": "DEF456", "title": "Plano B"}
  ],
  "customer": {
    "email": "teste@email.com",
    "name": "Teste User"
  },
  "transaction_token": "TXN123",
  "status": "approved"
}

Resultado esperado:
✅ Webhook inserido com status = "success"
✅ 2 subscriptions criadas
✅ user.plano_ativo atualizado com último plano

---

TESTE 2: Webhook sem User Existente (PENDING)

1. Não crie usuário para este email

2. Envie webhook com: email="novousuario@email.com"

Resultado esperado:
✅ Webhook inserido com status = "pending"
✅ Nenhuma subscription criada
✅ Webhook guardado para reprocessar depois

3. Crie agora o usuário com email="novousuario@email.com"

Resultado esperado:
✅ Trigger automático dispara
✅ Webhook reprocessado automaticamente
✅ Status muda para "success"
✅ Subscriptions criadas
✅ Dashboard mostra "sucesso"

---

TESTE 3: Reprocessamento Manual

1. Tenha um webhook com status = "failed"

2. No Dashboard Admin > Webhook Reprocessor:
   - Clique em "Editar" se email estiver errado
   - Digite email correto
   - Clique "Reprocessar"

Resultado esperado:
✅ Sistema processa webhook novamente
✅ Se user existe: Status muda para "success"
✅ Se user não existe: Status permanece "pending"

---

Etapa 05: Monitorar e Manter

Limpeza de Webhooks Antigos:

Para expirar webhooks com >30 dias, execute:

SELECT * FROM expire_old_webhooks();

Ou configure um cron job (CRON da Supabase):
SELECT expire_old_webhooks();

Checklist de Produção:

✅ SQL migration executada
✅ Edge function atualizada
✅ Dashboard component integrado
✅ Testes completos realizados
✅ RLS policies verificadas
✅ Backup do banco antes de começar

---

Fluxo Resumido:

CENÁRIO 1: User existe + 1 plano
1. Webhook chega → Busca user → Encontra
2. Cria subscription imediatamente
3. Status = success

CENÁRIO 2: User existe + múltiplos planos
1. Webhook chega → Busca user → Encontra
2. Loop em todos os product_ids
3. Cria subscriptions para CADA plano
4. Status = success

CENÁRIO 3: User não existe
1. Webhook chega → Busca user → NÃO encontra
2. Status = pending (guardado para depois)
3. Aguarda novo user se registrar
4. Trigger dispara automaticamente
5. Reprocessa webhook com novo user
6. Status = success

CENÁRIO 4: Admin quer reprocessar
1. Acessa Dashboard > Webhook Reprocessor
2. Clica "Reprocessar" no webhook FAILED
3. Sistema roda process_webhook_payment() novamente
4. Se user existe agora: Status = success
5. Se ainda não existe: Status = pending

---

Possíveis Problemas:

Problema: Webhook fica PENDING mesmo após user criado
Solução: Verifique se email é exatamente igual (case-sensitive convertido para lowercase)

Problema: Subscription duplicada
Solução: Função SQL verifica com "NOT EXISTS" - deve evitar duplicatas

Problema: Trigger não dispara ao criar user
Solução: Verifique se trigger está criado: SELECT * FROM pg_trigger WHERE tgname LIKE '%webhook%'

Problema: Reprocessamento não funciona
Solução: Verifique RLS policies da tabela webhook_logs e user_subscriptions
