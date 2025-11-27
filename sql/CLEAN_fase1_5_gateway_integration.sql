-- Executar One Step

-- Criar função auxiliar para detectar e validar estrutura de payload
CREATE OR REPLACE FUNCTION validate_webhook_structure(
  p_payload JSONB,
  p_platform TEXT
)
RETURNS TABLE(
  valid BOOLEAN,
  error_message TEXT,
  platform TEXT
) AS $$
BEGIN
  IF p_platform = 'vega' THEN
    IF NOT (p_payload ? 'customer' AND p_payload->'customer' ? 'email') THEN
      RETURN QUERY SELECT FALSE, 'Vega: customer.email ausente', 'vega';
      RETURN;
    END IF;
    IF NOT (p_payload ? 'products' OR p_payload ? 'items') THEN
      RETURN QUERY SELECT FALSE, 'Vega: products/items array ausente', 'vega';
      RETURN;
    END IF;
  ELSIF p_platform = 'ggcheckout' THEN
    IF NOT (p_payload ? 'customer' AND p_payload->'customer' ? 'email') THEN
      RETURN QUERY SELECT FALSE, 'GGCheckout: customer.email ausente', 'ggcheckout';
      RETURN;
    END IF;
    IF NOT (p_payload ? 'products') THEN
      RETURN QUERY SELECT FALSE, 'GGCheckout: products array ausente', 'ggcheckout';
      RETURN;
    END IF;
  ELSIF p_platform = 'amplopay' THEN
    IF NOT (p_payload ? 'customer' AND p_payload->'customer' ? 'email') THEN
      RETURN QUERY SELECT FALSE, 'AmploPay: customer.email ausente', 'amplopay';
      RETURN;
    END IF;
    IF NOT (p_payload ? 'product_id') THEN
      RETURN QUERY SELECT FALSE, 'AmploPay: product_id ausente', 'amplopay';
      RETURN;
    END IF;
  ELSE
    RETURN QUERY SELECT FALSE, 'Plataforma desconhecida: ' || p_platform, p_platform;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT, p_platform;
END;
$$ LANGUAGE plpgsql;

-- Criar função para normalizar webhook para padrão interno
CREATE OR REPLACE FUNCTION normalize_webhook_payload(
  p_payload JSONB,
  p_platform TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF p_platform = 'vega' THEN
    v_result := jsonb_build_object(
      'platform', 'vega',
      'customer', p_payload->'customer',
      'items', COALESCE(p_payload->'items', p_payload->'products'),
      'products', COALESCE(p_payload->'products', p_payload->'items'),
      'status', p_payload->>'status',
      'method', p_payload->>'method',
      'total_price', p_payload->>'total_price',
      'transaction_token', p_payload->>'transaction_token'
    );

  ELSIF p_platform = 'ggcheckout' THEN
    v_result := jsonb_build_object(
      'platform', 'ggcheckout',
      'customer', p_payload->'customer',
      'products', p_payload->'products',
      'payment', p_payload->'payment',
      'event', p_payload->>'event',
      'status', p_payload->>'status'
    );

  ELSIF p_platform = 'amplopay' THEN
    v_result := jsonb_build_object(
      'platform', 'amplopay',
      'customer', p_payload->'customer',
      'product_id', p_payload->>'product_id',
      'amount', p_payload->>'amount',
      'status', p_payload->>'status',
      'payment_method', p_payload->>'payment_method'
    );

  ELSE
    v_result := p_payload;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
