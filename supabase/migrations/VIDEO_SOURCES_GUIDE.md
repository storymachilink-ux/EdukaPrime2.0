# Video Sources - Guia de Implementação

## Visão Geral

A tabela `video_sources` permite armazenar múltiplas fontes de vídeo (YouTube, Wistia, Vturb) para cada vídeo.

## Estrutura de Dados

### YouTube

```json
{
  "source_type": "youtube",
  "source_data": {
    "video_id": "JvmXVeem2lI",
    "url": "https://www.youtube.com/watch?v=JvmXVeem2lI",
    "thumbnail": "https://img.youtube.com/vi/JvmXVeem2lI/hqdefault.jpg"
  }
}
```

**URL de entrada**: `https://www.youtube.com/watch?v=JvmXVeem2lI`

**Tipos de URL YouTube válidas**:
- `https://www.youtube.com/watch?v=JvmXVeem2lI`
- `https://youtu.be/JvmXVeem2lI`
- `https://youtube.com/watch?v=JvmXVeem2lI`
- `https://www.youtube.com/watch?v=JvmXVeem2lI&t=10s` (com timestamps)

---

### Wistia

```json
{
  "source_type": "wistia",
  "source_data": {
    "media_id": "78docpnbgg",
    "embed_code": "<script src=\"https://fast.wistia.com/player.js\" async></script><script src=\"https://fast.wistia.com/embed/78docpnbgg.js\" async type=\"module\"></script><style>wistia-player[media-id='78docpnbgg']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/78docpnbgg/swatch'); display: block; filter: blur(5px); }</style> <wistia-player media-id=\"78docpnbgg\" aspect=\"0.5625\" style=\"width: 640px;height: 1138px;\"></wistia-player>",
    "thumbnail": "https://fast.wistia.com/embed/medias/78docpnbgg/swatch"
  }
}
```

**Como obter o código Wistia**:

1. Acesse seu painel Wistia: https://home.wistia.com/
2. Selecione um vídeo
3. Clique em "Share" (Compartilhar)
4. Selecione "Embed"
5. Escolha a opção "HTML"
6. **COPIE O CÓDIGO COMPLETO** (inclui `<script>` tags)

**Media ID**: Extraído do código ou da URL
- Está em: `media-id='78docpnbgg'`

**Thumbnail**: URL automática gerada

---

### Vturb

```json
{
  "source_type": "vturb",
  "source_data": {
    "player_id": "vid-691cb6488e05537f6925540e",
    "embed_code": "<vturb-smartplayer id=\"vid-691cb6488e05537f6925540e\" style=\"display: block; margin: 0 auto; width: 100%; max-width: 400px;\"></vturb-smartplayer> <script type=\"text/javascript\"> var s=document.createElement(\"script\"); s.src=\"https://scripts.converteai.net/724c5a0d-b090-4c32-902f-782b3ead311a/players/691cb6488e05537f6925540e/v4/player.js\", s.async=!0,document.head.appendChild(s); </script>",
    "thumbnail": "https://imagens.converteai.net/..."
  }
}
```

**Como obter o código Vturb**:

1. Acesse seu painel Vturb/ConvertKit: https://app.converteai.net/
2. Selecione seu player
3. Clique em "Embed"
4. **COPIE O CÓDIGO HTML COMPLETO**

**Player ID**: Extraído do código
- Está em: `id="vid-691cb6488e05537f6925540e"`

**Thumbnail**: URL automática (pode variar)

---

## Exemplos SQL

### Inserir uma fonte YouTube

```sql
SELECT * FROM create_or_update_video_source(
  p_video_id => '123e4567-e89b-12d3-a456-426614174000'::uuid,
  p_source_type => 'youtube',
  p_source_data => jsonb_build_object(
    'video_id', 'JvmXVeem2lI',
    'url', 'https://www.youtube.com/watch?v=JvmXVeem2lI',
    'thumbnail', 'https://img.youtube.com/vi/JvmXVeem2lI/hqdefault.jpg'
  ),
  p_is_primary => true
);
```

### Inserir uma fonte Wistia

```sql
SELECT * FROM create_or_update_video_source(
  p_video_id => '123e4567-e89b-12d3-a456-426614174000'::uuid,
  p_source_type => 'wistia',
  p_source_data => jsonb_build_object(
    'media_id', '78docpnbgg',
    'embed_code', '<script src="..."></script>...',
    'thumbnail', 'https://fast.wistia.com/embed/medias/78docpnbgg/swatch'
  ),
  p_is_primary => false
);
```

### Obter todas as fontes de um vídeo

```sql
SELECT * FROM get_video_sources(
  p_video_id => '123e4567-e89b-12d3-a456-426614174000'::uuid
);
```

### Obter apenas a fonte primária

```sql
SELECT * FROM get_primary_video_source(
  p_video_id => '123e4567-e89b-12d3-a456-426614174000'::uuid
);
```

### Deletar uma fonte específica

```sql
SELECT * FROM delete_video_source(
  p_source_id => 'source-uuid-aqui'::uuid
);
```

---

## Migração de Dados

A migration executa automaticamente:

1. **Detecta** se há coluna `youtube_url` em videos
2. **Extrai** video_id de cada URL
3. **Cria** registros em `video_sources` com `source_type='youtube'`
4. **Marca** como `is_primary=true`

### Se houver dados manualmente:

```sql
-- Verificar dados migrados
SELECT
  vs.video_id,
  vs.source_type,
  vs.source_data->>'video_id' as video_id,
  vs.is_primary
FROM public.video_sources vs
WHERE vs.source_type = 'youtube'
LIMIT 10;
```

---

## Estrutura de Relacionamento

```
videos (1)
  ├── id
  ├── title
  ├── description
  └── ...

video_sources (N) [ONE-TO-MANY]
  ├── video_id (FK to videos.id)
  ├── source_type ('youtube' | 'wistia' | 'vturb')
  ├── source_data (JSON)
  └── is_primary (boolean)

Constraints:
- UNIQUE(video_id, source_type) - 1 source por tipo
- ON DELETE CASCADE - se vídeo deletado, sources também
```

---

## Performance

### Índices criados:

1. **idx_video_sources_video_id** - Buscar todas as sources de um vídeo (rápido)
2. **idx_video_sources_type** - Filtrar por tipo de plataforma
3. **idx_video_sources_primary** - Buscar source primária (otimizado)

### Queries típicas:

```sql
-- Buscar source primária (usa índice)
SELECT * FROM video_sources
WHERE video_id = ? AND is_primary = true
LIMIT 1;

-- Buscar todas as sources de um vídeo (usa índice)
SELECT * FROM video_sources
WHERE video_id = ?
ORDER BY is_primary DESC;
```

---

## RLS Policies

| Operação | Quem pode | Detalhes |
|----------|-----------|----------|
| SELECT | Todos | Públicamente legível |
| INSERT | service_role | Apenas via RPC ou backend |
| UPDATE | service_role | Apenas via RPC ou backend |
| DELETE | service_role | Apenas via RPC ou backend |

**Resultado**: Admin edita via RPC no frontend, usuários normais só leem.

---

## Próximos Passos

1. ✅ **Executar** esta migration no Supabase SQL Editor
2. ⏳ **Verificar** que dados foram migrados automaticamente
3. ⏳ **Criar componentes React**:
   - `VideoSourceSelector` - Abas YouTube/Wistia/Vturb
   - `VideoSourceInput` - Campo dinâmico por tipo
   - `VideoSourcePreview` - Pré-visualização
4. ⏳ **Atualizar** admin/GestaoVideos.tsx
5. ⏳ **Criar** player universal que detecta tipo

---

## Troubleshooting

### ❌ "video_id does not exist"

**Problema**: Trying to insert video_source para um vídeo inexistente

**Solução**:
```sql
-- Verificar se vídeo existe
SELECT id FROM videos WHERE id = 'seu-uuid';

-- Se não existir, criar o vídeo primeiro
INSERT INTO videos (title, description, category, youtube_url) VALUES (...);
```

### ❌ "duplicate key value violates unique constraint"

**Problema**: Tentando inserir 2 sources do mesmo tipo para o mesmo vídeo

**Solução**: Use `create_or_update_video_source()` que faz UPDATE se já existe

### ❌ "permission denied"

**Problema**: Tentando inserir diretamente (sem RPC)

**Solução**: Sempre use `create_or_update_video_source()` RPC ou editar via backend

---

## Notes

- Sempre use `is_primary=true` para a fonte principal
- Se deletar a source primária, outra é automaticamente promovida
- `source_data` é flexível - adicione campos conforme necessário
- Thumbnail é opcional mas recomendado para UI
- Não delete `youtube_url` de videos ainda (compatibilidade)
