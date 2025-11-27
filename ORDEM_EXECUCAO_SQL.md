# Ordem Correta de Execução dos SQLs

## Resumo Rápido

```
1️⃣  SQL_COMUNIDADE_SUPORTE.md (SQL 1)   → Criar community_channels
2️⃣  SQL_COMUNIDADE_SUPORTE.md (SQL 2)   → Criar support_tiers
3️⃣  INSTRUCOES_ITEM_LEVEL.md (SQL 1)    → plan_atividades
4️⃣  INSTRUCOES_ITEM_LEVEL.md (SQL 2)    → plan_videos
5️⃣  INSTRUCOES_ITEM_LEVEL.md (SQL 3)    → plan_bonus
6️⃣  INSTRUCOES_ITEM_LEVEL.md (SQL 4)    → plan_papercrafts
7️⃣  INSTRUCOES_ITEM_LEVEL.md (SQL 5)    → plan_comunidade ✅ AGORA FUNCIONA
8️⃣  INSTRUCOES_ITEM_LEVEL.md (SQL 6)    → plan_suporte ✅ AGORA FUNCIONA
```

---

## Passo a Passo Detalhado

### Fase 1: Recriar Tabelas Base (SQL_COMUNIDADE_SUPORTE.md)

**Por quê:** Você deletou essas tabelas no PASSO 0. Precisa recriá-las antes de usar as junction tables.

**Passo 1.1:** Abra Supabase → SQL Editor
```
1. Cole o conteúdo de "SQL 1: Criar Tabela community_channels"
2. Clique "Run"
3. Espere terminar (deve dizer "Success")
```

**Passo 1.2:** Crie a tabela de support_tiers
```
1. Cole o conteúdo de "SQL 2: Criar Tabela support_tiers"
2. Clique "Run"
3. Espere terminar (deve dizer "Success")
```

✅ **Após terminar Fase 1, você terá:**
- ✅ Tabela `community_channels` com 3 canais
- ✅ Tabela `support_tiers` com 3 níveis

---

### Fase 2: Criar Junction Tables (INSTRUCOES_ITEM_LEVEL.md)

**Por quê:** Essas tabelas linkam planos a items específicos.

**Passo 2.1 a 2.4:** SQLs 1-4 (atividades, videos, bonus, papercrafts)
```
Execute os 4 primeiros SQLs exatamente como antes.
```

**Passo 2.5:** SQL 5 (plan_comunidade)
```
Agora vai funcionar porque community_channels existe!

CREATE TABLE IF NOT EXISTS plan_comunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, channel_id)
);
CREATE INDEX idx_plan_comunidade_plan ON plan_comunidade(plan_id);
CREATE INDEX idx_plan_comunidade_channel ON plan_comunidade(channel_id);
```

**Passo 2.6:** SQL 6 (plan_suporte)
```
Agora vai funcionar porque support_tiers existe!

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

✅ **Após terminar Fase 2, você terá:**
- ✅ plan_atividades (atividades ↔ planos)
- ✅ plan_videos (videos ↔ planos)
- ✅ plan_bonus (bonus ↔ planos)
- ✅ plan_papercrafts (papercrafts ↔ planos)
- ✅ plan_comunidade (community_channels ↔ planos)
- ✅ plan_suporte (support_tiers ↔ planos)

---

## Verificação Final

Após executar todos os SQLs, verifique no Supabase:

**Tabelas criadas (8 no total):**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
```
community_channels
plan_atividades
plan_bonus
plan_comunidade
plan_papercrafts
plan_suporte
plan_videos
support_tiers
```

---

## Próxima Etapa

Após executar todos os SQLs:

1. Acesse `/admin/planos`
2. Clique "Gerenciar Items" em qualquer plano
3. Você verá 6 abas funcionando
4. Selecione items e clique "Salvar"

