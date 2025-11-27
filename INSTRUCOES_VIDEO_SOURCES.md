# 🎬 Implementação: Múltiplas Plataformas de Vídeo

## 📋 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/20250127000100_add_video_sources.sql` | **PRINCIPAL** - Migração SQL completa |
| `supabase/migrations/VIDEO_SOURCES_GUIDE.md` | Guia técnico com exemplos |
| `supabase/migrations/TEST_video_sources.sql` | Script para testar a migração |

---

## 🚀 PASSO 1: EXECUTAR A MIGRAÇÃO SQL

### No Supabase Dashboard:

1. Abra: **https://app.supabase.com/**
2. Selecione seu projeto **EduKaPrime**
3. Vá para **SQL Editor**
4. Clique em **+ New Query**
5. **Cole o conteúdo completo** de: `supabase/migrations/20250127000100_add_video_sources.sql`
6. Clique em **Run** (botão verde)
7. Resultado esperado:

```
✅ Migration: add_video_sources completed successfully!
   - Table: video_sources created
   - Indexes: 3 created
   - RPCs: 4 created
   - RLS: Enabled with appropriate policies
   - Data: Existing YouTube URLs migrated automatically
```

**Tempo estimado**: 2-3 segundos

---

## ✅ PASSO 2: VALIDAR A MIGRAÇÃO

### Execute o script de teste:

1. Ainda no **SQL Editor**
2. Clique em **+ New Query**
3. **Cole o conteúdo** de: `supabase/migrations/TEST_video_sources.sql`
4. Execute cada query uma por uma (comentadas para você escolher)
5. Verifique os resultados:

```sql
-- [1] Verificar tabela criada
SELECT table_name FROM information_schema.tables
WHERE table_name = 'video_sources';
-- Resultado: 1 row (video_sources)

-- [2] Verificar dados migrados
SELECT COUNT(*) as total_sources FROM public.video_sources;
-- Resultado: N rows (depende de quantos vídeos tem)

-- [3] Verificar se é_primary está correto
SELECT COUNT(*) as primary_sources
FROM public.video_sources
WHERE is_primary = true;
-- Resultado: Deve haver pelo menos alguns registros
```

**Tempo estimado**: 1-2 minutos

---

## 📊 O QUE FOI CRIADO NO BANCO

### Tabela: `video_sources`

```
Coluna          | Tipo              | Descrição
─────────────────────────────────────────────────
id              | UUID              | Chave primária
video_id        | UUID (FK)         | Referencia videos.id
source_type     | VARCHAR(50)       | 'youtube' | 'wistia' | 'vturb'
source_data     | JSONB             | Dados específicos da plataforma
is_primary      | BOOLEAN           | Qual fonte usar como padrão
created_at      | TIMESTAMPTZ       | Quando foi criada
updated_at      | TIMESTAMPTZ       | Última atualização
```

### Índices (Performance)

- `idx_video_sources_video_id` - Buscar sources de um vídeo
- `idx_video_sources_type` - Filtrar por tipo
- `idx_video_sources_primary` - Buscar source primária (otimizado)

### RPCs (Stored Procedures)

```typescript
// 1. Criar ou atualizar uma source
create_or_update_video_source(
  p_video_id UUID,
  p_source_type VARCHAR,
  p_source_data JSONB,
  p_is_primary BOOLEAN = true
) → { id, source_type, is_primary, created_at }

// 2. Obter todas as sources de um vídeo
get_video_sources(p_video_id UUID)
  → [{ id, source_type, source_data, is_primary, created_at, updated_at }]

// 3. Obter apenas a source primária
get_primary_video_source(p_video_id UUID)
  → { id, source_type, source_data, created_at }

// 4. Deletar uma source
delete_video_source(p_source_id UUID)
  → { success BOOLEAN, message VARCHAR }
```

### RLS (Segurança)

- ✅ Qualquer um pode **LER** (SELECT)
- 🔒 Só `service_role` pode **MODIFICAR** (INSERT/UPDATE/DELETE)
- ✅ Isso significa: admin edita via RPC, usuários normais só leem

---

## 📚 ESTRUTURA DE DADOS POR PLATAFORMA

### YouTube

```json
{
  "video_id": "JvmXVeem2lI",
  "url": "https://www.youtube.com/watch?v=JvmXVeem2lI",
  "thumbnail": "https://img.youtube.com/vi/JvmXVeem2lI/hqdefault.jpg"
}
```

**Como obter**:
1. URL do YouTube: `https://www.youtube.com/watch?v=JvmXVeem2lI`
2. Video ID: `JvmXVeem2lI` (parte após `v=`)
3. Thumbnail: `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg`

### Wistia

```json
{
  "media_id": "78docpnbgg",
  "embed_code": "<script src=\"https://fast.wistia.com/player.js\" async></script>...",
  "thumbnail": "https://fast.wistia.com/embed/medias/78docpnbgg/swatch"
}
```

**Como obter**:
1. Dashboard Wistia → Vídeo → Share → Embed → HTML
2. **Copiar código completo** (inclui `<script>` tags)
3. Media ID está em: `media-id='78docpnbgg'`

### Vturb

```json
{
  "player_id": "vid-691cb6488e05537f6925540e",
  "embed_code": "<vturb-smartplayer id=\"vid-691cb6488e05537f6925540e\" style=\"...\"></vturb-smartplayer>...",
  "thumbnail": "https://imagens.converteai.net/..."
}
```

**Como obter**:
1. Dashboard ConvertAI/Vturb → Player → Embed
2. **Copiar código HTML completo**
3. Player ID está em: `id="vid-691cb6488e05537f6925540e"`

---

## 🔄 MIGRAÇÃO AUTOMÁTICA

A migration executa automaticamente:

```sql
-- 1. Detecta se coluna youtube_url existe em videos
-- 2. Para cada vídeo com youtube_url:
--    - Extrai video_id da URL
--    - Cria registro em video_sources com source_type='youtube'
--    - Marca como is_primary=true

-- Resultado: Todos os vídeos antigos ficam mapeados
```

**Verificar migração**:

```sql
SELECT
  v.id,
  v.title,
  vs.source_type,
  vs.source_data->>'video_id' as video_id
FROM public.videos v
LEFT JOIN public.video_sources vs ON v.id = vs.video_id
LIMIT 5;
```

---

## 📝 PRÓXIMAS FASES

Após executar a migração SQL:

### Fase 2: Componentes React
- [ ] `VideoSourceSelector` - Abas YouTube/Wistia/Vturb
- [ ] `VideoSourceInput` - Campo dinâmico por tipo
- [ ] `VideoSourcePreview` - Pré-visualização em tempo real
- [ ] `VideoPlayer` - Player universal que detecta tipo

### Fase 3: Admin UI
- [ ] Atualizar `src/pages/admin/GestaoVideos.tsx`
- [ ] Adicionar CTRL+C / CTRL+V inteligente
- [ ] Validação automática de tipo
- [ ] Teste com YouTube, Wistia e Vturb

### Fase 4: Frontend
- [ ] Atualizar `src/pages/Videos.tsx` para usar novo player
- [ ] Atualizar `src/components/dashboard/sections/Videos.tsx`
- [ ] Suporte a fallback (se uma plataforma falhar, usar outra)

---

## 🧪 TESTE MANUAL (Opcional)

Após migração, testar inserindo uma nova source:

```sql
-- 1. Encontrar um vídeo existente
SELECT id, title FROM public.videos LIMIT 1;

-- 2. Copiar o ID (exemplo: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
--    e executar:

SELECT * FROM create_or_update_video_source(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'youtube',
  jsonb_build_object(
    'video_id', 'dQw4w9WgXcQ',
    'url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'thumbnail', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  ),
  true
);

-- 3. Verificar se foi inserida
SELECT * FROM get_video_sources('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid);

-- Resultado esperado:
-- - 2 rows (YouTube original + novo YouTube)
-- - Último deve ter is_primary=true
-- - Anterior é_primary=false
```

---

## ✨ RESUMO

| Step | Arquivo | O Quê | Status |
|------|---------|-------|--------|
| 1 | `add_video_sources.sql` | Executar no Supabase | 👉 **VOCÊ FAZ AGORA** |
| 2 | `TEST_video_sources.sql` | Testar migração | 👉 **VOCÊ FAZ AGORA** |
| 3 | React Components | Criar seletores | ⏳ Próximo |
| 4 | `GestaoVideos.tsx` | Atualizar admin | ⏳ Depois |
| 5 | Frontend | Atualizar players | ⏳ Depois |

---

## 📞 TROUBLESHOOTING

### ❌ "relation 'video_sources' does not exist"
**Causa**: Migração não foi executada
**Solução**: Execute `20250127000100_add_video_sources.sql` no Supabase SQL Editor

### ❌ "permission denied"
**Causa**: Tentando inserir diretamente (sem RPC)
**Solução**: Sempre use `create_or_update_video_source()` RPC

### ❌ "duplicate key value violates unique constraint"
**Causa**: 2 sources do mesmo tipo para o mesmo vídeo
**Solução**: Use `create_or_update_video_source()` que faz UPDATE

### ❌ "video_id does not exist"
**Causa**: Video UUID é inválido
**Solução**: Verificar que `SELECT id FROM videos` retorna registros

---

## 🎯 PRÓXIMO PASSO

**Após completar a migração SQL:**

Me avise quando fizer:
1. ✅ Executou o arquivo SQL no Supabase
2. ✅ Testou com o script de teste
3. ✅ Verificou que dados foram migrados

Aí vamos para **Fase 2: Componentes React** 🚀
