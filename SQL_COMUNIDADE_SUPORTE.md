# Criar Tabelas de Comunidade e Suporte

Como você deletou essas tabelas anteriormente, precisa recriá-las primeiro.

---

## SQL 1: Criar Tabela community_channels

Execute no Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_community_channels_is_active ON community_channels(is_active);

-- RLS (segurança)
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;

-- Política: qualquer autenticado pode ler
CREATE POLICY "Users can read community channels" ON community_channels
  FOR SELECT USING (is_active = true);

-- Inserir dados iniciais
INSERT INTO community_channels (name, description, icon, is_active)
VALUES
  ('Canal Geral', 'Discussões gerais da comunidade', '💬', true),
  ('Suporte Exclusivo', 'Suporte para membros Premium', '🆘', true),
  ('Recursos Educadores', 'Materiais para educadores', '📚', true)
ON CONFLICT (name) DO NOTHING;
```

---

## SQL 2: Criar Tabela support_tiers

Execute no Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS support_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_support_tiers_is_active ON support_tiers(is_active);

-- RLS (segurança)
ALTER TABLE support_tiers ENABLE ROW LEVEL SECURITY;

-- Política: qualquer autenticado pode ler
CREATE POLICY "Users can read support tiers" ON support_tiers
  FOR SELECT USING (is_active = true);

-- Inserir dados iniciais
INSERT INTO support_tiers (name, description, is_active)
VALUES
  ('Chat Regular', 'Suporte via chat durante horário comercial', true),
  ('Chat Prioritário', 'Suporte prioritário 24/7', true),
  ('Tickets', 'Sistema de tickets com rastreamento', true)
ON CONFLICT (name) DO NOTHING;
```

---

## Depois Execute os SQLs das Junction Tables

Após executar os 2 SQLs acima, execute os 6 SQLs das junction tables:

1. ✅ plan_atividades
2. ✅ plan_videos
3. ✅ plan_bonus
4. ✅ plan_papercrafts
5. ✅ plan_comunidade (agora vai funcionar!)
6. ✅ plan_suporte (agora vai funcionar!)

**Veja o arquivo INSTRUCOES_ITEM_LEVEL.md para os 6 SQLs das junction tables.**

