# 🔗 Configuração do Webhook GGCheckout - EdukaPrime

## ✅ O QUE FOI IMPLEMENTADO

### 1. Webhook Atualizado (Netlify Functions)
**Arquivo:** `netlify/functions/webhook-amplopay.js`

O webhook foi completamente atualizado para:
- ✅ Processar o novo formato de payload do GGCheckout
- ✅ Identificar produtos via `product.id` ao invés de `offerCode`
- ✅ Criar usuário automaticamente se não existir
- ✅ Atualizar plano do usuário existente
- ✅ Registrar transação para contabilização na área admin
- ✅ Calcular data de expiração (PIX = 30 dias, Cartão = 90 dias)

### 2. Mapeamento de Produtos
```javascript
'lDGnSUHPwxWlHBlPEIFy': { level: 1, name: 'Plano Essencial' }
'WpjID8aV49ShaQ07ABzP': { level: 2, name: 'Plano Evoluir' }
'eOGqcq0IbQnJUpjKRpsG': { level: 3, name: 'Plano Prime' }
```

### 3. Tabela de Transações
**Arquivo SQL:** `sql/create-transactions-table.sql`

Criada tabela `transactions` para registrar:
- Dados do pagamento (payment_id, amount, method, status)
- Dados do produto (product_id, plan_level, plan_name)
- Dados do cliente (email, name, phone)
- Payload completo para auditoria

### 4. Área Admin Atualizada
**Arquivo:** `src/pages/admin/AdminDashboard.tsx`

A área admin agora:
- ✅ Exibe faturamento total da tabela `transactions`
- ✅ Exibe gastos totais
- ✅ Calcula lucro líquido automaticamente
- ✅ Suporta fallback para `webhook_logs` (compatibilidade)

---

## 📋 PRÓXIMOS PASSOS

### PASSO 1: Criar Tabela de Transações no Supabase

1. Acesse: https://supabase.com/dashboard
2. Abra seu projeto
3. Menu lateral: **SQL Editor**
4. Clique em: **"+ New query"**
5. Copie e cole o conteúdo de: `sql/create-transactions-table.sql`
6. Clique em: **"Run"**
7. Aguarde mensagem: "Success. No rows returned"

### PASSO 2: Fazer Deploy do Webhook

#### Opção A: Deploy Automático (Recomendado)
```bash
# Se você tem integração GitHub + Netlify configurada
git add .
git commit -m "Atualizar webhook GGCheckout"
git push origin main
```
O Netlify vai fazer deploy automaticamente.

#### Opção B: Deploy Manual
1. Acesse: https://app.netlify.com
2. Entre no seu projeto
3. Vá em: **Deploys**
4. Clique em: **"Trigger deploy" → "Deploy site"**

### PASSO 3: Testar o Webhook

#### 3.1 Obter URL do Webhook
Após o deploy, a URL será:
```
https://[seu-site].netlify.app/.netlify/functions/webhook-amplopay
```

#### 3.2 Configurar no GGCheckout
1. Acesse o painel do GGCheckout
2. Vá em: **Configurações → Webhooks**
3. Cole a URL do webhook
4. Eventos a marcar:
   - ✅ `pix.paid`
   - ✅ `card.paid`
5. Salvar

#### 3.3 Testar com Postman/Insomnia
```json
POST https://[seu-site].netlify.app/.netlify/functions/webhook-amplopay

{
  "event": "pix.paid",
  "customer": {
    "email": "teste@gmail.com",
    "name": "Teste Usuario",
    "phone": "+5511999999999"
  },
  "payment": {
    "id": "test_payment_123",
    "amount": 9.99,
    "method": "pix.paid",
    "status": "pending"
  },
  "product": {
    "id": "lDGnSUHPwxWlHBlPEIFy",
    "type": "main"
  }
}
```

### PASSO 4: Verificar Logs

#### No Netlify:
1. Acesse: **Functions → webhook-amplopay → Logs**
2. Verifique se aparecem os logs coloridos com emojis

#### No Supabase:
```sql
-- Ver transações registradas
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- Ver usuários criados/atualizados
SELECT email, plano_ativo, data_ativacao
FROM users
ORDER BY data_ativacao DESC
LIMIT 10;
```

### PASSO 5: Verificar Área Admin
1. Acesse: https://[seu-site]/admin
2. Verifique se o **Faturamento Total** está aparecendo
3. Teste adicionar um gasto
4. Verifique se o **Lucro Líquido** está calculando corretamente

---

## 🔧 VARIÁVEIS DE AMBIENTE

Certifique-se de ter no Netlify:

```env
VITE_SUPABASE_URL=https://vijlwgrgaliptkbghfdg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role]
```

⚠️ **IMPORTANTE:** Use a **Service Role Key** (não a anon key) para o webhook poder criar usuários.

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro: "Could not find the 'cpf' column"
✅ **RESOLVIDO!** O webhook foi atualizado para não tentar inserir CPF.

### Erro: "Produto não mapeado"
Verifique se o `product.id` enviado está no mapeamento:
- lDGnSUHPwxWlHBlPEIFy (Essencial)
- WpjID8aV49ShaQ07ABzP (Evoluir)
- eOGqcq0IbQnJUpjKRpsG (Prime)

### Erro: "Tabela transactions não existe"
Execute o SQL em `sql/create-transactions-table.sql` no Supabase.

### Webhook não está sendo chamado
1. Verifique URL no GGCheckout
2. Verifique se os eventos `pix.paid` e `card.paid` estão marcados
3. Verifique logs no Netlify Functions

---

## 📊 COMO FUNCIONA

1. Cliente realiza compra no GGCheckout
2. GGCheckout envia webhook para: `/.netlify/functions/webhook-amplopay`
3. Webhook identifica o produto via `product.id`
4. Se usuário não existe:
   - Cria usuário no Auth com senha aleatória
   - Cria perfil na tabela `users`
5. Se usuário existe:
   - Atualiza `plano_ativo`
   - Atualiza `data_ativacao`
6. Registra transação na tabela `transactions`
7. Área admin exibe faturamento total automaticamente

---

## 🎯 FLUXO COMPLETO

```
Compra Realizada
      ↓
GGCheckout envia webhook
      ↓
Netlify Function processa
      ↓
Identifica produto (lDGnSUHPwxWlHBlPEIFy = Essencial)
      ↓
Busca usuário por email
      ↓
   ┌──────────┴──────────┐
   ↓                     ↓
Não existe          Existe
   ↓                     ↓
Cria usuário      Atualiza plano
   ↓                     ↓
   └──────────┬──────────┘
              ↓
   Registra transação
              ↓
   Área Admin atualizada
```

---

## 📝 ARQUIVOS MODIFICADOS

- ✅ `netlify/functions/webhook-amplopay.js` - Webhook atualizado
- ✅ `sql/create-transactions-table.sql` - Nova tabela
- ✅ `src/pages/admin/AdminDashboard.tsx` - Admin atualizado
- ✅ `WEBHOOK_GGCHECKOUT_CONFIGURACAO.md` - Esta documentação

---

## 💡 DICAS

- Os logs do webhook são coloridos e fáceis de entender
- Todas as transações são salvas para auditoria
- O sistema cria usuário automaticamente se não existir
- PIX dá 30 dias de acesso, Cartão dá 90 dias
- A área admin atualiza em tempo real

---

## ✨ PRÓXIMAS MELHORIAS SUGERIDAS

- [ ] Enviar email de boas-vindas ao criar usuário
- [ ] Notificar admin no Telegram quando houver venda
- [ ] Criar dashboard de vendas em tempo real
- [ ] Implementar sistema de cupons de desconto
- [ ] Adicionar webhook de cancelamento/reembolso
