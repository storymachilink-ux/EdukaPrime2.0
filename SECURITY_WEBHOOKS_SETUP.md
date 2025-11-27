# 🔐 Configuração de Webhooks com Validação HMAC

## ⚠️ CRÍTICO: Configurar Secrets dos Webhooks

A validação HMAC foi implementada em todos os webhooks. Para que funcione corretamente, você **DEVE** configurar os secrets no Supabase.

---

## 📋 Secrets a Configurar

No **Supabase Dashboard → Function Secrets**, adicione:

```
VEGA_WEBHOOK_SECRET = [seu_secret_da_vega]
GGCHECKOUT_WEBHOOK_SECRET = [seu_secret_ggcheckout]
AMPLOPAY_WEBHOOK_SECRET = [seu_secret_amplopay]
```

### Onde encontrar esses secrets:

#### 🔷 Vega Checkout
1. Ir para https://checkout.vega.ai/dashboard
2. Settings → Webhooks
3. Copiar o **Secret** da webhook
4. Cole em `VEGA_WEBHOOK_SECRET`

#### 🟢 GGCheckout
1. Ir para https://app.ggcheckout.com
2. Settings → API/Webhooks
3. Copiar o **Webhook Secret**
4. Cole em `GGCHECKOUT_WEBHOOK_SECRET`

#### 🟣 AmploPay
1. Ir para https://amplopay.com/dashboard
2. Settings → Webhooks
3. Copiar o **Secret Key**
4. Cole em `AMPLOPAY_WEBHOOK_SECRET`

---

## 🚀 Como Funciona a Validação

### ✅ Com Secret Configurado (SEGURO)
```
Webhook vem com Header: X-Signature
Sistema calcula HMAC SHA256
Compara com assinatura recebida
Se válida → Processa webhook
Se inválida → Retorna 401 (Unauthorized)
```

### ⚠️ Sem Secret Configurado (TEMPORÁRIO)
```
Sistema loga: ⚠️ WEBHOOK SEM VALIDAÇÃO
Processa webhook mesmo assim (para testes)
Isso é inseguro - configure os secrets em produção!
```

---

## 📝 Resumo das Mudanças

### Arquivos Modificados:
- ✅ `supabase/functions/webhook-unificada-v2/index.ts`
- ✅ `supabase/functions/webhook-unificada/index.ts`
- ✅ `supabase/functions/webhook-amplopay/index.ts`

### O que Foi Adicionado:
1. **Função `validateWebhookSignature()`** - Valida HMAC SHA256
2. **Verificação no início do handler** - Valida antes de processar
3. **Header suporte** - Aceita `X-Signature` ou `X-Webhook-Signature`
4. **Feedback de logs** - Mostra se foi validado ou não

---

## ⚡ Próximos Passos

1. ✅ Adicionar secrets ao Supabase (AGORA)
2. 🔜 Remover ANON_KEY dos endpoints admin
3. 🔜 Fortalecer RLS Policies
4. 🔜 Remover console.logs sensíveis

---

## 🧪 Testando a Validação

### Teste com Secret Inválido:
```bash
curl -X POST https://seu-webhook-url \
  -H "Content-Type: application/json" \
  -H "X-Signature: invalid-signature" \
  -d '{"customer":{"email":"test@test.com"},"product_id":"123"}'

# Resultado esperado: 401 Unauthorized
```

### Teste com Secret Válido (desenvolvimento):
```bash
# Sem secret configurado = aceita tudo
# Com secret configurado = rejeita sem assinatura correta
```

---

## 🎯 Benefícios da Implementação

✅ **Previne fraude de pagamentos** - Webhooks falsos são rejeitados
✅ **Valida autenticidade** - Apenas gateways legítimos conseguem processar
✅ **Sem impacto na funcionalidade** - Webhooks legítimos funcionam normalmente
✅ **Implementação timing-safe** - Protege contra timing attacks

---

## ❓ FAQ

**P: E se eu não configurar os secrets?**
A: O sistema vai aceitar qualquer webhook (inseguro). Configure ASAP em produção!

**P: Como obtenho o secret de cada gateway?**
A: Veja a seção "Onde encontrar esses secrets" acima.

**P: Qual header devo enviar?**
A: Use `X-Signature` ou `X-Webhook-Signature` com a assinatura HMAC SHA256.

**P: Preciso mudar algo no código dos gateways?**
A: Não, eles já devem estar enviando a assinatura. Caso contrário, contacte o suporte deles.

