# ✅ PASSOS 1, 2 E 3 - INSTRUÇÕES PARA EXECUTAR

## ⚠️ IMPORTANTE
Estes passos DEVEM ser executados ANTES do PASSO 4 (salvar AdminDashboard.tsx)

---

## PASSO 1: Executar SQL Migration no Supabase
### ⏱️ Tempo: ~2 minutos

**LOCAL**: Supabase Console → SQL Editor

**AÇÃO**:
1. Abra: https://app.supabase.com/
2. Vá ao seu projeto
3. Clique em "SQL Editor" (no menu esquerdo)
4. Clique em "+ New Query"
5. **COPIE E COLE TODO O CÓDIGO ABAIXO**:

```sql
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS product_ids JSONB DEFAULT '[]'::JSONB;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS reprocess_count INTEGER DEFAULT 0;
ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS last_reprocess_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_webhook_logs_expires ON webhook_logs(expires_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_pending ON webhook_logs(status) WHERE status IN ('pending', 'failed');

CREATE OR REPLACE FUNCTION process_webhook_payment(
  p_webhook_id UUID,
  p_customer_email TEXT,
  p_product_ids JSONB,
  p_transaction_id TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  subscriptions_created INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_product_id TEXT;
  v_plan_id INTEGER;
  v_subs_count INTEGER := 0;
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_error_msg TEXT := '';
BEGIN
  v_user_id := NULL;

  SELECT id INTO v_user_id FROM users WHERE email = p_customer_email LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Usuário não encontrado', 0;
    RETURN;
  END IF;

  FOR v_product_id IN SELECT jsonb_array_elements_text(p_product_ids)
  LOOP
    SELECT id INTO v_plan_id FROM plans_v2
    WHERE vega_product_id = v_product_id
    OR ggcheckout_product_id = v_product_id
    OR amplopay_product_id = v_product_id
    LIMIT 1;

    IF v_plan_id IS NOT NULL THEN
      BEGIN
        INSERT INTO user_subscriptions (
          user_id,
          plan_id,
          status,
          start_date,
          end_date,
          payment_id,
          product_id_gateway,
          payment_method,
          webhook_id
        )
        SELECT
          v_user_id,
          v_plan_id,
          'active',
          NOW(),
          CASE
            WHEN (SELECT payment_type FROM plans_v2 WHERE id = v_plan_id) = 'mensal'
            THEN NOW() + INTERVAL '30 days'
            ELSE NULL
          END,
          p_transaction_id,
          v_product_id,
          (SELECT payment_method FROM webhook_logs WHERE id = p_webhook_id),
          p_webhook_id
        WHERE NOT EXISTS (
          SELECT 1 FROM user_subscriptions
          WHERE user_id = v_user_id
          AND plan_id = v_plan_id
          AND status = 'active'
          AND payment_id = p_transaction_id
        );

        v_subs_count := v_subs_count + 1;

        UPDATE users SET
          plano_ativo = v_plan_id,
          data_expiracao_plano = (
            SELECT end_date FROM user_subscriptions
            WHERE user_id = v_user_id
            AND plan_id = v_plan_id
            ORDER BY created_at DESC LIMIT 1
          ),
          updated_at = NOW()
        WHERE id = v_user_id;

      EXCEPTION WHEN unique_violation THEN
        CONTINUE;
      END;
    END IF;
  END LOOP;

  UPDATE webhook_logs SET
    status = CASE WHEN v_subs_count > 0 THEN 'success' ELSE 'failed' END,
    processed_at = NOW(),
    reprocess_count = reprocess_count + 1,
    last_reprocess_at = NOW()
  WHERE id = p_webhook_id;

  RETURN QUERY SELECT (v_subs_count > 0),
    CASE WHEN v_subs_count > 0
      THEN 'Processado: ' || v_subs_count::TEXT || ' plano(s) ativado(s)'
      ELSE 'Nenhum plano mapeado encontrado'
    END,
    v_subs_count;

EXCEPTION WHEN OTHERS THEN
  UPDATE webhook_logs SET status = 'error', processed_at = NOW() WHERE id = p_webhook_id;
  RETURN QUERY SELECT FALSE, 'Erro: ' || SQLERRM, 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reprocess_pending_webhooks_for_user()
RETURNS TRIGGER AS $$
DECLARE
  v_webhook_record RECORD;
BEGIN
  FOR v_webhook_record IN
    SELECT id, product_ids, transaction_id, customer_email
    FROM webhook_logs
    WHERE customer_email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  LOOP
    PERFORM process_webhook_payment(
      v_webhook_record.id,
      v_webhook_record.customer_email,
      v_webhook_record.product_ids,
      v_webhook_record.transaction_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reprocess_webhook_on_user_created ON users;

CREATE TRIGGER trigger_reprocess_webhook_on_user_created
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION reprocess_pending_webhooks_for_user();

CREATE OR REPLACE FUNCTION expire_old_webhooks()
RETURNS TABLE(expired_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE webhook_logs
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

SELECT 'Webhook reprocessing setup completo!';
```

6. Clique em **"Run"** ou pressione **Ctrl + Enter**
7. **Resultado esperado**: Você verá `"Webhook reprocessing setup completo!"` na mensagem de sucesso
8. ✅ Se não houver erro vermelho = PASSO 1 COMPLETO

---

## PASSO 2: Aplicar RLS Policies no Supabase
### ⏱️ Tempo: ~1 minuto

**LOCAL**: Supabase Console → SQL Editor (novo query)

**AÇÃO**:
1. Clique em "+ New Query" novamente
2. **COPIE E COLE O CÓDIGO ABAIXO**:

```sql
CREATE POLICY "admin_view_webhook_logs" ON webhook_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "admin_update_webhook_logs" ON webhook_logs
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "admin_delete_webhook_logs" ON webhook_logs
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

SELECT 'RLS policies aplicadas com sucesso!';
```

3. Clique em **"Run"** ou pressione **Ctrl + Enter**
4. **Resultado esperado**: Você verá `"RLS policies aplicadas com sucesso!"` na mensagem de sucesso
5. ✅ Se não houver erro vermelho = PASSO 2 COMPLETO

---

## PASSO 3: Atualizar Edge Function
### ⏱️ Tempo: ~3 minutos

**LOCAL**: Seu editor de código (VS Code, etc)

**ARQUIVO PARA ABRIR**: `supabase/functions/webhook-unificada/index.ts`

**AÇÃO**:

1. Abra o arquivo `supabase/functions/webhook-unificada/index.ts` no seu editor
2. **SELECIONE TUDO** o conteúdo (Ctrl + A)
3. **COPIE E COLE O CÓDIGO COMPLETO ABAIXO** (substituindo tudo):

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function detectPlatform(payload: any): string {
  if (payload.items && Array.isArray(payload.items) && payload.items[0]?.code) {
    return 'vega'
  }
  if (payload.products && Array.isArray(payload.products) && payload.products[0]?.id) {
    return 'ggcheckout'
  }
  if (payload.product_id || payload.gateway === 'amplopay') {
    return 'amplopay'
  }
  return 'unknown'
}

function extractProductIds(payload: any, platform: string): string[] {
  const productIds: string[] = []

  if (platform === 'vega' && payload.items && Array.isArray(payload.items)) {
    payload.items.forEach((item: any) => {
      if (item.code) productIds.push(item.code)
    })
  } else if (platform === 'ggcheckout' && payload.products && Array.isArray(payload.products)) {
    payload.products.forEach((product: any) => {
      if (product.id) productIds.push(product.id)
    })
  } else if (platform === 'amplopay' && payload.product_id) {
    productIds.push(payload.product_id)
  }

  return productIds
}

function extractWebhookData(payload: any, platform: string) {
  let customer_email = 'unknown@example.com'
  let customer_name = null
  let payment_method = null
  let amount = 0
  let transaction_id = null
  let event_type = 'unknown'
  let product_titles: string[] = []

  if (platform === 'vega') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment?.method || payload.method || null
    const price = parseInt(String(payload.total_price || 0))
    amount = price / 100
    transaction_id = payload.transaction_token || payload.id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    if (payload.items && Array.isArray(payload.items)) {
      product_titles = payload.items.map((item: any) => item.title || 'Unknown').filter(Boolean)
    }
  } else if (platform === 'ggcheckout') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment?.method || null
    amount = payload.payment?.amount || payload.products?.[0]?.price || 0
    transaction_id = payload.id || payload.transaction_id || null
    event_type = payload.status === 'paid' ? 'payment.approved' : 'payment.pending'
    if (payload.products && Array.isArray(payload.products)) {
      product_titles = payload.products.map((product: any) => product.name || 'Unknown').filter(Boolean)
    }
  } else if (platform === 'amplopay') {
    customer_email = payload.customer?.email?.toLowerCase() || 'unknown@example.com'
    customer_name = payload.customer?.name || null
    payment_method = payload.payment_method || null
    amount = payload.amount || 0
    transaction_id = payload.id || payload.transaction_id || null
    event_type = payload.status === 'approved' ? 'payment.approved' : 'payment.pending'
    product_titles = [payload.product_name || 'Unknown']
  }

  return {
    platform,
    event_type,
    customer_email,
    customer_name,
    payment_method,
    amount,
    transaction_id,
    product_titles,
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '*'

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      }
    })
  }

  try {
    const payload = await req.json()
    const platform = detectPlatform(payload)
    const product_ids = extractProductIds(payload, platform)

    console.log(`🌐 WEBHOOK UNIFICADA - Platform: ${platform}, Product IDs: ${product_ids.join(', ')}`)

    const webhookData = extractWebhookData(payload, platform)

    console.log(`📧 Email: ${webhookData.customer_email}`)
    console.log(`💰 Valor: ${webhookData.amount}`)
    console.log(`📦 Produtos: ${webhookData.product_titles.join(', ')}`)
    console.log(`🔗 IDs: ${product_ids.join(', ')}`)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const result = await supabase
      .from('webhook_logs')
      .insert({
        platform: webhookData.platform,
        event_type: webhookData.event_type,
        status: 'received',
        customer_email: webhookData.customer_email,
        customer_name: webhookData.customer_name,
        amount: webhookData.amount,
        payment_method: webhookData.payment_method,
        transaction_id: webhookData.transaction_id,
        product_ids: product_ids,
        expires_at: expiresAt,
        raw_payload: payload,
      })
      .select()

    if (result.error) {
      console.error('❌ Erro ao inserir webhook:', result.error.message)
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Webhook inserido com sucesso')
    const webhookId = result.data?.[0]?.id

    if (webhookData.event_type === 'payment.approved' && webhookId && product_ids.length > 0) {
      console.log('💳 Pagamento aprovado - Processando ativação...')

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', webhookData.customer_email)
        .maybeSingle()

      if (user) {
        console.log(`👤 Usuário encontrado: ${user.id}`)

        const { data: processResult } = await supabase
          .rpc('process_webhook_payment', {
            p_webhook_id: webhookId,
            p_customer_email: webhookData.customer_email,
            p_product_ids: product_ids,
            p_transaction_id: webhookData.transaction_id,
          })

        if (processResult && processResult[0]) {
          console.log(`✅ Processamento bem-sucedido: ${processResult[0].subscriptions_created} plano(s) ativado(s)`)
        } else {
          console.log(`⚠️ Nenhum plano foi ativado`)
          await supabase
            .from('webhook_logs')
            .update({ status: 'failed', processed_at: new Date().toISOString() })
            .eq('id', webhookId)
        }
      } else {
        console.log(`⏳ Usuário não encontrado - Webhook guardado como PENDING`)
        await supabase
          .from('webhook_logs')
          .update({ status: 'pending', processed_at: new Date().toISOString() })
          .eq('id', webhookId)
      }
    } else {
      console.log(`ℹ️ Webhook registrado mas não processado (pendente ou sem produtos)`)
    }

    return new Response(JSON.stringify({
      success: true,
      webhook_id: webhookId,
      platform: platform,
      product_ids: product_ids,
      customer_email: webhookData.customer_email,
    }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      }
    })
  }
})
```

4. Pressione **Ctrl + S** para salvar (deploy será automático)
5. ✅ Quando o arquivo salvar = PASSO 3 COMPLETO

---

## ✅ CHECKLIST - PASSOS 1, 2, 3

Após executar os 3 passos acima, verifique:

- [ ] **PASSO 1**: SQL migration executada (mensagem: "Webhook reprocessing setup completo!")
- [ ] **PASSO 2**: RLS policies aplicadas (mensagem: "RLS policies aplicadas com sucesso!")
- [ ] **PASSO 3**: Edge Function atualizada (arquivo salvo com Ctrl+S)

Se todos os 3 passos completarem SEM ERROS:

---

## 📝 PASSO 4: Você deve fazer
Agora você deve fazer **UMA ÚNICA COISA**:

1. Abra: `src/pages/admin/AdminDashboard.tsx`
2. Pressione **Ctrl + S** para salvar (o arquivo já foi modificado anteriormente)

**Isso é tudo!** Depois que fizer o PASSO 4, estamos prontos para a **FASE DE TESTES** 🚀

---

## ⚡ RESUMO DO QUE FOI FEITO

✅ **PASSO 1**: Adicionou 4 colunas ao webhook_logs + 2 índices + 3 funções SQL + 1 trigger
✅ **PASSO 2**: Adicionou 3 RLS policies para acesso de admin
✅ **PASSO 3**: Atualizou Edge Function para processar múltiplos produtos
✅ **PASSO 4**: Salvar AdminDashboard.tsx com o componente integrado

**Quando terminar todos os 4: Estaremos prontos para FASE 4 DE TESTES** 🎯
