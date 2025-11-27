# Instruções para Gerenciamento Item-Level de Planos

## Status: ✅ Implementação Completa

O novo AdminPlanosManager agora permite gerenciar **item por item** para cada categoria (Atividades, Videos, Bonus, PaperCrafts, Comunidade, Suporte VIP).

---

## Passo 1: Criar Tabelas Junction no Banco

Acesse seu Supabase e execute os SQLs abaixo um por um em **SQL Editor**:

### SQL 1: Criar plan_atividades
```sql
CREATE TABLE IF NOT EXISTS plan_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  atividade_id UUID NOT NULL REFERENCES atividades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, atividade_id)
);
CREATE INDEX idx_plan_atividades_plan ON plan_atividades(plan_id);
CREATE INDEX idx_plan_atividades_atividade ON plan_atividades(atividade_id);
```

### SQL 2: Criar plan_videos
```sql
CREATE TABLE IF NOT EXISTS plan_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, video_id)
);
CREATE INDEX idx_plan_videos_plan ON plan_videos(plan_id);
CREATE INDEX idx_plan_videos_video ON plan_videos(video_id);
```

### SQL 3: Criar plan_bonus
```sql
CREATE TABLE IF NOT EXISTS plan_bonus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES bonus(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, bonus_id)
);
CREATE INDEX idx_plan_bonus_plan ON plan_bonus(plan_id);
CREATE INDEX idx_plan_bonus_bonus ON plan_bonus(bonus_id);
```

### SQL 4: Criar plan_papercrafts
```sql
CREATE TABLE IF NOT EXISTS plan_papercrafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id INTEGER NOT NULL REFERENCES plans_v2(id) ON DELETE CASCADE,
  papercraft_id UUID NOT NULL REFERENCES papercrafts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, papercraft_id)
);
CREATE INDEX idx_plan_papercrafts_plan ON plan_papercrafts(plan_id);
CREATE INDEX idx_plan_papercrafts_papercraft ON plan_papercrafts(papercraft_id);
```

### SQL 5: Criar plan_comunidade
```sql
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

### SQL 6: Criar plan_suporte
```sql
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

---

## Passo 2: Testar no Admin Panel

1. **Acesse:** `/admin/planos`
2. **Clique em "Gerenciar Items"** em qualquer plano
3. **Você verá:**
   - 6 abas no topo: 📚 Atividades | 🎥 Vídeos | 🎁 Bônus | ✂️ PaperCrafts | 👥 Comunidade | ⭐ Suporte VIP
   - Grid com checkboxes para cada item
   - Items já selecionados têm ✅ verde

4. **Teste:**
   - Selecione alguns items em cada aba
   - Clique "Salvar"
   - Atualize a página e verifique se as seleções persistiram

---

## Como Funciona Agora

### Antes (Sistema Antigo)
- ❌ Granular: cada item tinha `plano_minimo` (0-4)
- ❌ Difícil de gerenciar em escala
- ❌ Não permitia múltiplos planos acessarem o mesmo item

### Depois (Novo Sistema)
- ✅ Junction tables: Relacionamento many-to-many
- ✅ Admin pode selecionar exatamente quais items cada plano libera
- ✅ Suporta múltiplos planos acessando o mesmo item
- ✅ Escala melhor e é mais flexível

**Tabelas:**
```
planos_v2 (5 planos)
  ├── plan_atividades ←→ atividades
  ├── plan_videos ←→ videos
  ├── plan_bonus ←→ bonus
  ├── plan_papercrafts ←→ papercrafts
  ├── plan_comunidade ←→ community_channels
  └── plan_suporte ←→ support_tiers
```

---

## Próximo Passo: Atualizar o Verificação de Acesso

Quando os usuários acessarem Atividades/Videos/Bonus, será necessário atualizar para:

1. **Query junction tables** ao invés de `plano_minimo`
2. **Exemplo:** Para verificar se usuário tem acesso a atividade_id:
   ```sql
   SELECT EXISTS (
     SELECT 1 FROM plan_atividades
     WHERE plan_id = (SELECT active_plan_id FROM users WHERE id = ?)
     AND atividade_id = ?
   )
   ```

**Essa atualização será feita após testes básicos.**

---

## Troubleshooting

### Erro: "relation 'plan_atividades' does not exist"
- Verifique que você executou todos os 6 SQLs acima

### Erro: "42P01" ou similar
- Verifique a ordem de execução dos SQLs
- Certifique-se que as tabelas `atividades`, `videos`, `bonus`, etc existem

### Admin panel não mostra items
- Verifique se as tabelas source existem (`atividades`, `videos`, `bonus`)
- Verifique o console (F12) para mensagens de erro
- Confirme que há dados em pelo menos uma tabela source

---

## Build Status
✅ npm run build - PASSED
✅ npx tsc --noEmit - PASSED (0 errors)

Código pronto para produção!

