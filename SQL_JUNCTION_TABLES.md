# Criação de Tabelas Junction para Gerenciamento Item-Level

Estas tabelas permitem que você gerencie quais items específicos (atividades, vídeos, etc) estão disponíveis em cada plano.

## Estrutura

```
plans_v2 (5 planos)
  ├── plan_atividades (link para atividades específicas)
  ├── plan_videos (link para vídeos específicos)
  ├── plan_bonus (link para bonus específicos)
  ├── plan_papercrafts (link para papercrafts específicos)
  ├── plan_comunidade (link para comunidade específica)
  └── plan_suporte (link para suporte_vip específico)
```

## SQL para Executar

### Passo 1: Criar tabelas junction

```sql
-- plan_atividades: liga planos a atividades específicas
CREATE TABLE IF NOT EXISTS plan_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  atividade_id UUID NOT NULL REFERENCES atividades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, atividade_id)
);
CREATE INDEX idx_plan_atividades_plan ON plan_atividades(plan_id);
CREATE INDEX idx_plan_atividades_atividade ON plan_atividades(atividade_id);

-- plan_videos: liga planos a vídeos específicos
CREATE TABLE IF NOT EXISTS plan_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, video_id)
);
CREATE INDEX idx_plan_videos_plan ON plan_videos(plan_id);
CREATE INDEX idx_plan_videos_video ON plan_videos(video_id);

-- plan_bonus: liga planos a bonus específicos
CREATE TABLE IF NOT EXISTS plan_bonus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES bonus(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, bonus_id)
);
CREATE INDEX idx_plan_bonus_plan ON plan_bonus(plan_id);
CREATE INDEX idx_plan_bonus_bonus ON plan_bonus(bonus_id);

-- plan_papercrafts: liga planos a papercrafts específicos
CREATE TABLE IF NOT EXISTS plan_papercrafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  papercraft_id UUID NOT NULL REFERENCES papercrafts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, papercraft_id)
);
CREATE INDEX idx_plan_papercrafts_plan ON plan_papercrafts(plan_id);
CREATE INDEX idx_plan_papercrafts_papercraft ON plan_papercrafts(papercraft_id);

-- plan_comunidade: liga planos a comunidade específica
CREATE TABLE IF NOT EXISTS plan_comunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, channel_id)
);
CREATE INDEX idx_plan_comunidade_plan ON plan_comunidade(plan_id);
CREATE INDEX idx_plan_comunidade_channel ON plan_comunidade(channel_id);

-- plan_suporte: liga planos a suporte_vip
CREATE TABLE IF NOT EXISTS plan_suporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  support_tier_id UUID NOT NULL REFERENCES support_tiers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, support_tier_id)
);
CREATE INDEX idx_plan_suporte_plan ON plan_suporte(plan_id);
CREATE INDEX idx_plan_suporte_tier ON plan_suporte(support_tier_id);
```

### Passo 2: Inserir dados iniciais (exemplo)

```sql
-- GRATUITO (plan_id = 0) pode acessar primeiras 2 atividades
INSERT INTO plan_atividades (plan_id, atividade_id)
SELECT 0, id FROM atividades ORDER BY created_at LIMIT 2;

-- ESSENCIAL (plan_id = 1) pode acessar todas as atividades
INSERT INTO plan_atividades (plan_id, atividade_id)
SELECT 1, id FROM atividades;

-- PRIME (plan_id = 3) pode acessar todos os vídeos
INSERT INTO plan_videos (plan_id, video_id)
SELECT 3, id FROM videos;

-- VITALÍCIO (plan_id = 4) pode acessar tudo
INSERT INTO plan_atividades (plan_id, atividade_id) SELECT 4, id FROM atividades;
INSERT INTO plan_videos (plan_id, video_id) SELECT 4, id FROM videos;
INSERT INTO plan_bonus (plan_id, bonus_id) SELECT 4, id FROM bonus;
INSERT INTO plan_papercrafts (plan_id, papercraft_id) SELECT 4, id FROM papercrafts;
```

### Passo 3: Atualizar SQL function para verificar acesso

```sql
CREATE OR REPLACE FUNCTION user_has_item_access(
  p_user_id UUID,
  p_item_type TEXT,
  p_item_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_plan INTEGER;
  v_has_lifetime BOOLEAN;
  v_item_allowed BOOLEAN := FALSE;
BEGIN
  -- Buscar plano atual do usuário
  SELECT active_plan_id, has_lifetime_access
  INTO v_current_plan, v_has_lifetime
  FROM users
  WHERE id = p_user_id;

  -- Admin e lifetime users têm acesso total
  IF v_has_lifetime THEN
    RETURN TRUE;
  END IF;

  -- Verificar acesso baseado no tipo de item
  CASE p_item_type
    WHEN 'atividade' THEN
      SELECT EXISTS (
        SELECT 1 FROM plan_atividades
        WHERE plan_id = v_current_plan AND atividade_id = p_item_id
      ) INTO v_item_allowed;

    WHEN 'video' THEN
      SELECT EXISTS (
        SELECT 1 FROM plan_videos
        WHERE plan_id = v_current_plan AND video_id = p_item_id
      ) INTO v_item_allowed;

    WHEN 'bonus' THEN
      SELECT EXISTS (
        SELECT 1 FROM plan_bonus
        WHERE plan_id = v_current_plan AND bonus_id = p_item_id
      ) INTO v_item_allowed;

    WHEN 'papercraft' THEN
      SELECT EXISTS (
        SELECT 1 FROM plan_papercrafts
        WHERE plan_id = v_current_plan AND papercraft_id = p_item_id
      ) INTO v_item_allowed;

    WHEN 'comunidade' THEN
      SELECT EXISTS (
        SELECT 1 FROM plan_comunidade
        WHERE plan_id = v_current_plan AND channel_id = p_item_id
      ) INTO v_item_allowed;

    WHEN 'suporte' THEN
      SELECT EXISTS (
        SELECT 1 FROM plan_suporte
        WHERE plan_id = v_current_plan AND support_tier_id = p_item_id
      ) INTO v_item_allowed;
  END CASE;

  RETURN COALESCE(v_item_allowed, FALSE);
END;
$$ LANGUAGE plpgsql;
```

## Próximos Passos

1. Execute os SQLs acima no Supabase
2. Vou reescrever o AdminPlanosManager para:
   - Carregar items de cada categoria
   - Mostrar checkboxes para cada item
   - Permitir toggle e salvar
3. Vou atualizar planService para usar essas tabelas

