# 🔧 Configurar Webhook no Netlify - Guia Completo

## ✅ O QUE FOI CORRIGIDO

- ✅ Convertido função de ES6 para CommonJS (compatível com Netlify)
- ✅ Criado `package.json` na pasta `netlify/functions/`
- ✅ Corrigido sintaxe: `require` ao invés de `import`

---

## 📋 PASSOS PARA CONFIGURAR (5 Minutos)

### **PASSO 1: Configurar Variáveis de Ambiente no Netlify**

1. Acesse: https://app.netlify.com
2. Entre no seu projeto **edukaprime.com.br**
3. Vá em: **Site settings → Environment variables**
4. Clique em: **Add a variable** e adicione **2 variáveis**:

#### **Variável 1:**
```
Key:   VITE_SUPABASE_URL
Value: https://vijlwgrgaliptkbghfdg.supabase.co
```

#### **Variável 2:**
```
Key:   SUPABASE_SERVICE_ROLE_KEY
Value: [SUA-CHAVE-SERVICE-ROLE-AQUI]
```

**⚠️ IMPORTANTE:** A chave Service Role está em:
- Supabase Dashboard → Project Settings → API → **service_role (secret)**
- ❌ NÃO use a `anon` key
- ✅ Use a `service_role` key (começa com `eyJ...`)

5. Clique em **Save**

---

### **PASSO 2: Fazer Deploy das Alterações**

Você tem **2 opções**:

#### **Opção A: Deploy Automático via Git (Recomendado)**

```bash
git add .
git commit -m "Fix: Corrigir webhook Netlify para CommonJS"
git push origin main
```

O Netlify vai detectar e fazer deploy automaticamente.

#### **Opção B: Deploy Manual**

1. Acesse: https://app.netlify.com
2. Entre no seu projeto
3. Vá em: **Deploys**
4. Clique em: **Trigger deploy → Deploy site**
5. Aguarde o build completar (~2-3 minutos)

---

### **PASSO 3: Verificar se o Deploy Funcionou**

1. No Netlify, vá em: **Functions**
2. Você deve ver: `webhook-amplopay`
3. Status deve estar: **Active** (verde)

Se aparecer erro:
- Clique na função
- Veja os logs de erro
- Geralmente é falta de variável de ambiente

---

### **PASSO 4: Testar a Função**

#### **Teste 1: Teste GET (deve retornar erro esperado)**

Acesse no navegador:
```
https://edukaprime.com.br/.netlify/functions/webhook-amplopay
```

**Resultado esperado:**
```json
{"error":"Method not allowed"}
```

✅ Se aparecer isso = função está funcionando!
❌ Se aparecer 404 = função não foi deployada
❌ Se aparecer HTML = variáveis de ambiente faltando

---

#### **Teste 2: Teste POST (via GGCheckout)**

1. Vá no painel do **GGCheckout**
2. Acesse: **Configurações → Webhooks**
3. Em **URL de Integração**, coloque:
   ```
   https://edukaprime.com.br/.netlify/functions/webhook-amplopay
   ```
4. Eventos para marcar:
   - ✅ `pix.paid`
   - ✅ `card.paid`
5. Clique em **Testar Integração**

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  ...
}
```

---

### **PASSO 5: Ver Logs da Função (Para Debug)**

1. No Netlify: **Functions → webhook-amplopay**
2. Clique em **View logs**
3. Você verá todos os logs coloridos:
   ```
   📨 WEBHOOK GGCHECKOUT RECEBIDO
   📦 Payload completo: {...}
   ✅ Plano identificado: Plano Essencial
   ✅ WEBHOOK PROCESSADO COM SUCESSO!
   ```

---

## 🔍 TROUBLESHOOTING

### Erro: "Resposta não-JSON recebida"

**Causa:** Variáveis de ambiente faltando ou função não deployada

**Solução:**
1. Verifique as variáveis no Netlify (Passo 1)
2. Faça novo deploy (Passo 2)
3. Aguarde 2-3 minutos
4. Teste novamente

---

### Erro: "Function not found" ou 404

**Causa:** Deploy não incluiu a função

**Solução:**
1. Verifique se existe: `netlify/functions/webhook-amplopay.js`
2. Verifique se existe: `netlify/functions/package.json`
3. Faça commit e push de TODOS os arquivos:
   ```bash
   git add netlify/functions/
   git commit -m "Add webhook function"
   git push
   ```
4. Aguarde deploy completar

---

### Erro: "Dados obrigatórios ausentes"

**Causa:** Payload do GGCheckout está diferente do esperado

**Solução:**
1. Veja os logs da função no Netlify
2. Procure por: `📦 Payload completo:`
3. Compare com o formato esperado:
   ```json
   {
     "event": "pix.paid",
     "customer": { "email": "...", "name": "..." },
     "payment": { "id": "...", "amount": 9.99, "method": "pix.paid" },
     "product": { "id": "lDGnSUHPwxWlHBlPEIFy" }
   }
   ```
4. Se estiver diferente, me avise para ajustar o código

---

### Erro: "Produto não mapeado"

**Causa:** O `product.id` recebido não está no mapeamento

**Solução:**
1. Veja nos logs qual `product.id` foi recebido
2. Adicione no arquivo `netlify/functions/webhook-amplopay.js`:
   ```javascript
   const PRODUCT_PLAN_MAPPING = {
     'lDGnSUHPwxWlHBlPEIFy': { level: 1, name: 'Plano Essencial' },
     'WpjID8aV49ShaQ07ABzP': { level: 2, name: 'Plano Evoluir' },
     'eOGqcq0IbQnJUpjKRpsG': { level: 3, name: 'Plano Prime' },
     'SEU-NOVO-ID-AQUI': { level: X, name: 'Nome do Plano' }  // ← Adicionar
   };
   ```
3. Commit e push

---

## 📊 COMO SABER SE ESTÁ FUNCIONANDO

### ✅ Sucesso Completo:

1. **No GGCheckout (Teste de Integração):**
   - Status: ✅ Sucesso
   - Resposta: JSON com `"success": true`

2. **Nos Logs do Netlify:**
   ```
   ✅ WEBHOOK PROCESSADO COM SUCESSO!
   📧 Email: teste@exemplo.com
   📦 Plano: Plano Essencial (1)
   💰 Valor: R$ 9.99
   ```

3. **No Supabase (Tabela users):**
   ```sql
   SELECT email, plano_ativo, data_ativacao
   FROM users
   WHERE email = 'teste@exemplo.com';
   ```
   - `plano_ativo` deve estar atualizado
   - `data_ativacao` deve estar com timestamp recente

4. **No Supabase (Tabela transactions):**
   ```sql
   SELECT * FROM transactions
   WHERE customer_email = 'teste@exemplo.com'
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - Deve ter registro da transação

---

## 🎯 RESUMO RÁPIDO

```bash
# 1. Configurar variáveis no Netlify:
# - VITE_SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY

# 2. Deploy:
git add .
git commit -m "Fix webhook"
git push

# 3. Aguardar deploy (2-3 min)

# 4. Testar no GGCheckout:
# URL: https://edukaprime.com.br/.netlify/functions/webhook-amplopay
# Eventos: pix.paid, card.paid

# 5. Verificar logs no Netlify
```

---

## 📞 Ainda com Problemas?

Se depois de seguir TODOS os passos ainda não funcionar:

1. **Tire prints de:**
   - Netlify → Environment variables (com valores censurados)
   - Netlify → Functions (mostrando webhook-amplopay)
   - Netlify → Logs da função (últimas 20 linhas)
   - GGCheckout → Resposta do teste de integração

2. **Me envie:**
   - Os prints acima
   - Mensagem de erro completa
   - Resultado de: `https://edukaprime.com.br/.netlify/functions/webhook-amplopay` no navegador

---

**Data:** Janeiro 2025
**Versão:** 2.0 (CommonJS)
