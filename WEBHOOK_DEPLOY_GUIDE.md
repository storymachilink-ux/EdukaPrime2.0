# 🚀 Guia de Deploy do Webhook GGCheckout

## Visão Geral

Este guia ensina como fazer o deploy completo do sistema de webhooks do GGCheckout para ativar planos automaticamente quando os usuários comprarem.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. ✅ Conta no Supabase com seu projeto criado
2. ✅ [Supabase CLI instalado](https://supabase.com/docs/guides/cli/getting-started)
3. ✅ Conta no GGCheckout com produtos criados
4. ✅ Acesso ao terminal/prompt de comando

---

## 🔧 Passo 1: Criar a Tabela de Logs

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `sql/create_webhook_logs.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Você deve ver a mensagem: ✅ Tabela webhook_logs criada com sucesso!

**Verificação:**
```sql
-- Execute esta query para confirmar que a tabela foi criada
SELECT * FROM webhook_logs LIMIT 1;
```

---

## 🚢 Passo 2: Deploy da Edge Function

### 2.1. Instalar Supabase CLI

Se ainda não instalou, execute:

```bash
# Windows (PowerShell)
scoop install supabase

# macOS
brew install supabase/tap/supabase

# Linux
brew install supabase/tap/supabase
```

### 2.2. Login no Supabase

```bash
supabase login
```

Isso abrirá seu navegador para autenticação.

### 2.3. Linkar seu Projeto

```bash
supabase link --project-ref seu-project-ref
```

**Como encontrar seu project-ref:**
- No Supabase Dashboard, vá em **Settings** → **General**
- Copie o **Reference ID**

### 2.4. Fazer Deploy da Function

No diretório raiz do projeto, execute:

```bash
supabase functions deploy checkout-webhook
```

**Saída esperada:**
```
Deploying checkout-webhook (typescript)
Deployed checkout-webhook (version xxx)
https://seu-projeto.supabase.co/functions/v1/checkout-webhook
```

**⚠️ IMPORTANTE:** Copie a URL completa que apareceu! Você vai precisar dela no próximo passo.

---

## 🔗 Passo 3: Configurar Webhook no GGCheckout

1. Acesse o [GGCheckout Dashboard](https://www.ggcheckout.com)
2. Faça login na sua conta
3. No menu lateral, clique em **Webhooks**
4. Clique em **Adicionar Webhook**
5. Configure assim:

```
URL do Webhook: https://seu-projeto.supabase.co/functions/v1/checkout-webhook
Eventos:
  ✅ pix.paid
  ✅ card.paid
  ⬜ Desmarque todos os outros
```

6. Clique em **Salvar**

---

## ✅ Passo 4: Testar o Webhook

### Teste Manual no GGCheckout

1. No GGCheckout Dashboard, vá em **Webhooks**
2. Clique em **Testar** ao lado do webhook criado
3. Selecione o evento `pix.paid`
4. Clique em **Enviar Teste**

### Verificar no Supabase

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute:

```sql
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 10;
```

Você deve ver o webhook de teste registrado!

### Testar com Compra Real (Ambiente de Teste)

1. No GGCheckout, configure um produto em **modo teste**
2. Faça uma compra de teste usando as credenciais de teste do GGCheckout
3. Verifique se:
   - O webhook foi registrado em `webhook_logs`
   - O usuário foi criado ou atualizado em `users`
   - O plano foi ativado corretamente
   - A data de expiração está correta

---

## 📊 Passo 5: Acessar Painel de Logs

Depois do deploy:

1. Faça login como **admin** no sistema EdukaPrime
2. Acesse: `https://seu-dominio.com/admin/webhooks`
3. Você verá todos os webhooks recebidos em tempo real

---

## 🔍 Verificação de Logs

### Ver Logs da Edge Function

```bash
supabase functions logs checkout-webhook
```

Isso mostra todos os console.log() da função.

### Ver Logs em Tempo Real

```bash
supabase functions logs checkout-webhook --tail
```

---

## 🛠️ Troubleshooting

### Problema: "Function not found"

**Solução:**
```bash
# Verifique se a função está deployada
supabase functions list

# Se não estiver, faça deploy novamente
supabase functions deploy checkout-webhook
```

### Problema: Webhook retorna erro 500

1. Verifique os logs:
```bash
supabase functions logs checkout-webhook --tail
```

2. Teste localmente:
```bash
supabase functions serve checkout-webhook
```

3. Verifique se as variáveis de ambiente estão setadas:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Problema: Usuário não é criado

1. Verifique se o email está correto no payload
2. Verifique os logs do webhook:
```sql
SELECT * FROM webhook_logs WHERE status = 'error' ORDER BY created_at DESC;
```

3. Veja a coluna `message` para entender o erro

### Problema: Plano não é ativado

1. Verifique se o `product_id` está no mapeamento:
```sql
-- No SQL Editor do Supabase, execute:
SELECT raw_payload->>'product' FROM webhook_logs WHERE status = 'error' LIMIT 1;
```

2. Compare com os IDs em `supabase/functions/checkout-webhook/index.ts` (linhas 27-31)

3. Se o ID for diferente, atualize o mapeamento:
```typescript
const PRODUCT_PLAN_MAPPING = {
  'seu-novo-id-aqui': { plan: 1, name: 'Essencial' },
  // ...
};
```

4. Faça deploy novamente:
```bash
supabase functions deploy checkout-webhook
```

---

## 🔒 Segurança

### Variáveis de Ambiente

As seguintes variáveis são automaticamente injetadas pelo Supabase:
- ✅ `SUPABASE_URL` - URL do seu projeto
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (bypass RLS)

**NÃO é necessário configurar manualmente.**

### RLS (Row Level Security)

A tabela `webhook_logs` está protegida:
- ✅ Apenas admins podem visualizar
- ✅ Ninguém pode inserir manualmente (só via service role)
- ✅ Ninguém pode editar ou deletar

---

## 📝 Manutenção

### Atualizar IDs de Produtos

Se você mudar produtos no GGCheckout:

1. Abra `supabase/functions/checkout-webhook/index.ts`
2. Atualize a constante `PRODUCT_PLAN_MAPPING` (linha 27)
3. Atualize `sql/webhook_product_mapping.sql` (documentação)
4. Faça deploy novamente:
```bash
supabase functions deploy checkout-webhook
```

### Limpar Logs Antigos

Se a tabela ficar muito grande:

```sql
-- CUIDADO: Isso apaga permanentemente!
DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 📞 Suporte

Se encontrar problemas:

1. 📖 Verifique a documentação do Supabase: https://supabase.com/docs/guides/functions
2. 📖 Verifique a documentação do GGCheckout
3. 🔍 Verifique os logs da Edge Function
4. 📊 Verifique os logs na tabela `webhook_logs`

---

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] Tabela `webhook_logs` criada no Supabase
- [ ] Edge Function deployada com sucesso
- [ ] Webhook configurado no GGCheckout
- [ ] Teste manual funcionando
- [ ] Compra de teste processada corretamente
- [ ] Usuário criado/atualizado automaticamente
- [ ] Plano ativado com data de expiração correta
- [ ] Painel admin acessível em `/admin/webhooks`
- [ ] Logs aparecendo corretamente no painel

---

## 🎉 Pronto!

Seu sistema de ativação automática de planos está funcionando! 🚀

Agora, sempre que alguém comprar um plano no GGCheckout:
1. 💳 Pagamento aprovado → Webhook enviado
2. 🔔 Edge Function recebe o webhook
3. 👤 Usuário criado automaticamente (se não existir)
4. ✅ Plano ativado imediatamente
5. 📧 Usuário pode fazer login e acessar o conteúdo
6. 📊 Tudo registrado no painel admin

**Vendas no automático! 🎊**
