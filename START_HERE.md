# 🚀 COMECE AQUI - WEBHOOK UNIFICADA

**Bem-vindo!** Você tem tudo pronto para implementar webhooks de pagamento em seu Eduka Prime.

---

## ⏱️ TEMPO NECESSÁRIO

- **Setup SQL:** 5 minutos
- **Teste:** 10 minutos
- **Integração completa:** 30 minutos

---

## 📋 PASSO 1: EXECUTAR SQL (5 min)

### Abra Supabase
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** (esquerda)

### Execute os 4 arquivos SQL NA ORDEM:

```
1. sql/001_ajustar_plans_v2_ids_gateway.sql
2. sql/002_add_constraints_idempotencia_subscriptions.sql
3. sql/003_criar_ou_ajustar_pending_plans.sql
4. sql/004_ajustar_webhook_logs.sql
```

**Como fazer:**
1. Abra o primeiro arquivo `.sql`
2. Copie TODO o conteúdo
3. Cole no Supabase SQL Editor
4. Clique em `Execute` (botão azul, canto superior direito)
5. Aguarde a mensagem ✅ de sucesso
6. Repita para os próximos 3 arquivos

---

## 🗺️ PASSO 2: MAPEAR PRODUCT IDs (2 min)

Você precisa dizer ao sistema quais product IDs correspondem a quais planos.

### No Supabase SQL Editor, execute:

```sql
-- Exemplo: Mapeando plano ID 1 ao product Vega "3MGN9O"
UPDATE plans_v2
SET vega_product_id = '3MGN9O'
WHERE id = 1;

-- Repita para seus outros planos e gateways
UPDATE plans_v2 SET ggcheckout_product_id = 'gg-id-123' WHERE id = 2;
UPDATE plans_v2 SET amplopay_product_id = 'amp-id-456' WHERE id = 3;
```

**Precisa saber seus product IDs?**
- Vega: Dashboard → Produtos → Copie o "code" (ex: "3MGN9O")
- GGCheckout: Dashboard → Produtos → Copie o "id"
- Amplopay: Dashboard → Produtos → Copie o "id"

---

## 🧪 PASSO 3: TESTAR WEBHOOK (10 min)

### Teste com o payload real:

```bash
curl -X POST \
  https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada \
  -H "Content-Type: application/json" \
  -d '{
    "plans": [{"id": "3MGN9O", "products": [...]}],
    "products": [{"code": "3MGN9O", "title": "Seu Produto", "amount": 2999}],
    "method": "pix",
    "status": "approved",
    "customer": {
      "name": "João Silva",
      "email": "seu-email@example.com",
      "phone": "11999999999",
      "document": "12345678900"
    },
    "total_price": 2999,
    "transaction_token": "TEST_UNIQUE_ID_001",
    "sale_code": "TEST_SALE_001",
    "business_name": "Eduka Prime"
  }'
```

### Verificar resultado:

```sql
-- No Supabase SQL Editor:
SELECT * FROM webhook_logs
WHERE transaction_id = 'TEST_UNIQUE_ID_001'
ORDER BY created_at DESC
LIMIT 1;
```

**Deve ter:**
- ✅ `status = 'success'`
- ✅ `customer_email = 'seu-email@example.com'`
- ✅ `platform = 'vega'`
- ✅ `amount = 29.99`

---

## 🔗 PASSO 4: CONFIGURAR WEBHOOKS NOS GATEWAYS (10 min)

### Vega
1. Dashboard → Webhooks
2. Adicione URL: `https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada`
3. Selecione eventos: "Pagamento aprovado"
4. Salve

### GGCheckout
1. Dashboard → Integrações → Webhooks
2. URL: `https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada`
3. Eventos: `payment.approved`, `payment.pending`
4. Salve

### Amplopay
1. Dashboard → Webhooks
2. URL: `https://YOUR_SUPABASE_URL/functions/v1/webhook-unificada`
3. Eventos: Status = "approved"
4. Salve

---

## 💳 PASSO 5: INTEGRAR NO SIGNUP (10 min)

Quando usuário se registra, você precisa ativar seus pending_plans:

### Em sua função de signup, adicione:

```typescript
// Após criar usuário em auth:
const { data: user } = await supabase.auth.signUp({
  email: email,
  password: password,
})

// Depois crie em users table:
await supabase.from('users').insert({
  id: user.user.id,
  email: email,
  nome: nome,
})

// AGORA ATIVE SEUS PENDING_PLANS:
const { data: activated } = await supabase.rpc('activate_pending_plans', {
  p_user_id: user.user.id,
  p_user_email: email,
})

console.log(`${activated[0].total_activated} plano(s) ativado(s)!`)
```

---

## ✅ PRONTO!

Se chegou aqui, sua webhook está **100% funcional!**

---

## 🎯 PRÓXIMAS LEITURAS (OPCIONAL)

1. **Entender o fluxo:** Leia `WEBHOOK_IMPLEMENTATION_SUMMARY.md`
2. **Testes avançados:** Leia `WEBHOOK_TESTS.md`
3. **Troubleshooting:** Leia `GUIA_IMPLEMENTACAO_WEBHOOKS.md`

---

## 🆘 ALGO NÃO FUNCIONAR?

### Problema: "Plano não encontrado"
```
❌ Você não mapeou o product_id em plans_v2

✅ Solução: Execute
UPDATE plans_v2 SET vega_product_id = '3MGN9O' WHERE id = 1;
```

### Problema: "Unknown platform"
```
❌ Payload do webhook está com estrutura errada

✅ Solução: Copie exatamente o payload de exemplo acima
```

### Problema: Subscription não criada mas webhook diz "success"
```
❌ Usuário não existe, então criou pending_plan em vez de subscription

✅ Solução: Crie o usuário primeiro, ou integre activate_pending_plans() no signup
```

### Problema: Subscriptions duplicadas
```
❌ Você não executou o arquivo SQL 002

✅ Solução: Execute sql/002_add_constraints_idempotencia_subscriptions.sql
```

---

## 📞 RESUMO RÁPIDO

| Etapa | Ação | Tempo |
|-------|------|-------|
| 1 | Executar 4 arquivos SQL | 5 min |
| 2 | Mapear product IDs | 2 min |
| 3 | Testar com curl/Postman | 10 min |
| 4 | Configurar em gateways | 10 min |
| 5 | Integrar no signup | 10 min |
| **TOTAL** | | **37 min** |

---

## 🚀 VOCÊ JÁ ESTÁ PRONTO!

**Bora ativar esses webhooks! 💪**

Qualquer dúvida, leia os arquivos de documentação inclusos.
