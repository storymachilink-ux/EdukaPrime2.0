-- Criar tabela para armazenar webhook secrets de forma segura
CREATE TABLE IF NOT EXISTS public.webhook_secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_platform
ON public.webhook_secrets(platform);

CREATE INDEX IF NOT EXISTS idx_webhook_secrets_active
ON public.webhook_secrets(is_active);

-- Adicionar comentários
COMMENT ON TABLE public.webhook_secrets IS 'Armazena webhook secrets de forma segura - apenas admins podem acessar';
COMMENT ON COLUMN public.webhook_secrets.platform IS 'Nome da plataforma (vega, ggcheckout, amplopay)';
COMMENT ON COLUMN public.webhook_secrets.secret IS 'Secret HMAC para validação de webhooks';
COMMENT ON COLUMN public.webhook_secrets.is_active IS 'Se o secret está ativo para validação';

-- RLS (Row Level Security) - apenas admins podem ver/modificar
ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem ver webhook secrets"
ON public.webhook_secrets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem inserir webhook secrets"
ON public.webhook_secrets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem atualizar webhook secrets"
ON public.webhook_secrets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Apenas admins podem deletar webhook secrets"
ON public.webhook_secrets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- RPC Function: Salvar ou atualizar webhook secret
CREATE OR REPLACE FUNCTION public.save_webhook_secret(
  p_platform TEXT,
  p_secret TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  platform TEXT
) AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se o usuário é admin
  SELECT users.is_admin INTO v_is_admin
  FROM public.users
  WHERE users.id = auth.uid();

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT false, 'Acesso negado: apenas admins podem gerenciar secrets'::TEXT, p_platform;
    RETURN;
  END IF;

  -- Validar plataforma
  IF p_platform NOT IN ('vega', 'ggcheckout', 'amplopay') THEN
    RETURN QUERY SELECT false, 'Plataforma inválida'::TEXT, p_platform;
    RETURN;
  END IF;

  -- Validar secret (não pode estar vazio)
  IF p_secret IS NULL OR p_secret = '' THEN
    RETURN QUERY SELECT false, 'Secret não pode estar vazio'::TEXT, p_platform;
    RETURN;
  END IF;

  -- Inserir ou atualizar
  INSERT INTO public.webhook_secrets (platform, secret, created_by, is_active)
  VALUES (p_platform, p_secret, auth.uid(), true)
  ON CONFLICT (platform) DO UPDATE
  SET secret = EXCLUDED.secret,
      updated_at = NOW(),
      is_active = true;

  RETURN QUERY SELECT true, 'Secret salvo com sucesso'::TEXT, p_platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Deletar webhook secret
CREATE OR REPLACE FUNCTION public.delete_webhook_secret(
  p_platform TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_deleted BOOLEAN;
BEGIN
  -- Verificar se o usuário é admin
  SELECT users.is_admin INTO v_is_admin
  FROM public.users
  WHERE users.id = auth.uid();

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT false, 'Acesso negado: apenas admins podem gerenciar secrets';
    RETURN;
  END IF;

  -- Deletar secret
  DELETE FROM public.webhook_secrets
  WHERE platform = p_platform;

  IF FOUND THEN
    RETURN QUERY SELECT true, 'Secret deletado com sucesso';
  ELSE
    RETURN QUERY SELECT false, 'Secret não encontrado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Verificar quais secrets estão configurados (sem retornar o valor)
CREATE OR REPLACE FUNCTION public.get_webhook_secrets_status()
RETURNS TABLE (
  platform TEXT,
  is_configured BOOLEAN,
  is_active BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    ws.platform,
    true as is_configured,
    ws.is_active,
    ws.updated_at
  FROM public.webhook_secrets ws
  ORDER BY ws.platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
