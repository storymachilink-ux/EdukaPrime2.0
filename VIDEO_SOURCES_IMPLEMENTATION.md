# 🎬 Implementação: Sistema de Múltiplas Plataformas de Vídeo

**Data**: 27 de Novembro de 2025
**Status**: ✅ COMPLETO E PRONTO PARA USO

---

## 📋 O Que Foi Feito

### ✅ Fase 1: Banco de Dados (CONCLUÍDO)
- ✅ Migration SQL: `20250127000100_add_video_sources.sql`
- ✅ Tabela `video_sources` criada
- ✅ 4 RPCs criadas (create_or_update, get_all, get_primary, delete)
- ✅ RLS (Row Level Security) configurado
- ✅ Índices de performance criados

### ✅ Fase 2: TypeScript Types (CONCLUÍDO)
**Arquivo**: `src/types/index.ts`

```typescript
// Tipos criados:
- SourceType = 'youtube' | 'wistia' | 'vturb'
- YouTubeSourceData
- WistiaSourceData
- VturbSourceData
- SourceData (union)
- VideoSource (interface completa)
- VideoWithSources (estende Video com sources)
```

### ✅ Fase 3: React Hook (CONCLUÍDO)
**Arquivo**: `src/hooks/useVideoSources.ts`

```typescript
export function useVideoSources(videoId?: string) {
  // Métodos:
  - fetchVideoSources(id)        // Buscar todas
  - fetchPrimarySource(id)       // Buscar primária
  - createOrUpdateSource(...)    // Criar/atualizar
  - deleteSource(...)            // Deletar
  - addYouTubeSource(...)        // Helper YouTube
  - extractYouTubeId(...)        // Parser YouTube
  - initialize(id)               // Inicializar

  // Estados:
  - sources[]
  - primarySource
  - loading
  - error
}
```

### ✅ Fase 4: Componentes React (CONCLUÍDO)

#### 4.1 VideoSourceSelector
**Arquivo**: `src/components/video/VideoSourceSelector.tsx`

```typescript
<VideoSourceSelector
  videoId={videoId}
  onSourcesChanged={(sources) => { /* ... */ }}
  onError={(error) => { /* ... */ }}
/>
```

**Features**:
- Abas para YouTube, Wistia, Vturb
- Parsing automático de URLs
- Validação de entrada
- Lista de fontes com opção de deletar
- Indicador de fonte primária

#### 4.2 VideoPlayer
**Arquivo**: `src/components/video/VideoPlayer.tsx`

```typescript
<VideoPlayer
  source={singleSource}      // OU
  sources={multipleSource}   // Array com fallback
  title="Video Title"
  autoplay={false}
/>
```

**Features**:
- Suporte completo para YouTube, Wistia, Vturb
- Seletor de plataforma se múltiplas sources
- Fallback automático
- Thumbnail preview component
- Resposta de erro tratada

#### 4.3 VideoThumbnail (Helper)
```typescript
<VideoThumbnail
  source={source}
  sources={sources}
  className="aspect-video"
/>
```

### ✅ Fase 5: Admin UI (CONCLUÍDO)
**Arquivo**: `src/pages/admin/GestaoVideos.tsx`

**Melhorias**:
- ✅ Tab "Informações" (dados básicos do vídeo)
- ✅ Tab "Múltiplas Fontes" (gerenciar video_sources)
- ✅ Integração do VideoSourceSelector
- ✅ Mensagens de erro ao adicionar fontes
- ✅ Validação completa

---

## 🚀 Como Usar

### 1. Criar um Novo Vídeo com Múltiplas Fontes

**No Admin Panel**:
1. Vá para **Gestão de Vídeos**
2. Clique em **Novo Vídeo**
3. Preencha: Título, Descrição, Categoria, Planos
4. Salve o vídeo
5. Clique em **Editar** → **Múltiplas Fontes**
6. Adicione fontes (YouTube, Wistia, Vturb)

### 2. No Frontend - Exibir Vídeo com Fallback

```typescript
import { useVideoSources } from '@/hooks/useVideoSources';
import { VideoPlayer, VideoThumbnail } from '@/components/video/VideoPlayer';

function VideoView({ videoId }) {
  const { sources, primarySource, initialize } = useVideoSources();

  useEffect(() => {
    initialize(videoId);
  }, [videoId]);

  return (
    <>
      {/* Thumbnail */}
      <VideoThumbnail source={primarySource} className="aspect-video" />

      {/* Player com fallback automático */}
      <VideoPlayer sources={sources} />
    </>
  );
}
```

### 3. Adicionar Manualmente via Hook

```typescript
const { addYouTubeSource, createOrUpdateSource } = useVideoSources();

// YouTube (helper)
await addYouTubeSource(
  videoId,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  true  // isPrimary
);

// Ou genérico (qualquer plataforma)
await createOrUpdateSource(
  videoId,
  'wistia',
  {
    media_id: '78docpnbgg',
    embed_code: '...',
    thumbnail: '...'
  },
  false  // isPrimary
);
```

---

## 📊 Estrutura de Dados

### Banco de Dados (video_sources)

```sql
-- Tabela
CREATE TABLE video_sources (
  id UUID,
  video_id UUID (FK),
  source_type VARCHAR,     -- 'youtube' | 'wistia' | 'vturb'
  source_data JSONB,       -- Dados específicos
  is_primary BOOLEAN,      -- Qual usar como padrão
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Índices
- idx_video_sources_video_id
- idx_video_sources_type
- idx_video_sources_primary
```

### YouTube Source Data

```json
{
  "video_id": "dQw4w9WgXcQ",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
}
```

### Wistia Source Data

```json
{
  "media_id": "78docpnbgg",
  "embed_code": "<script src=\"https://fast.wistia.com/...\"",
  "thumbnail": "https://fast.wistia.com/embed/medias/78docpnbgg/swatch"
}
```

### Vturb Source Data

```json
{
  "player_id": "vid-691cb6488e05537f",
  "embed_code": "<vturb-smartplayer id=\"vid-...\"></vturb-smartplayer>",
  "thumbnail": "https://imagens.converteai.net/..."
}
```

---

## 📝 Próximos Passos (Opcional)

### 1. Atualizar Componentes de Vídeo (Opcional)

**Arquivos sugeridos para atualizar**:
- `src/components/dashboard/sections/Videos.tsx`
- `src/components/papel/VideoCard.tsx`
- `src/components/papel/VideoDetail.tsx`
- `src/pages/Videos.tsx`

**Alteração sugerida**:
```typescript
// Antes
import { Video } from '../types';
const video: Video; // Tem youtube_url

// Depois
import { VideoWithSources } from '../types';
import { VideoPlayer, VideoThumbnail } from '../components/video/VideoPlayer';

const video: VideoWithSources;
<VideoThumbnail sources={video.sources} />
<VideoPlayer sources={video.sources} />
```

### 2. Migrar Dados Automáticos (Opcional)

Se tiver muitos vídeos, criar um script para migrar de `youtube_url` para `video_sources`:

```typescript
// Script em: src/scripts/migrateYouTubeToSources.ts
async function migrateVideos() {
  const videos = await supabase.from('videos').select('*');

  for (const video of videos.data) {
    if (video.youtube_url) {
      const youtubeId = extractYouTubeId(video.youtube_url);
      await supabase.rpc('create_or_update_video_source', {
        p_video_id: video.id,
        p_source_type: 'youtube',
        p_source_data: {
          video_id: youtubeId,
          url: video.youtube_url,
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        },
        p_is_primary: true
      });
    }
  }
}
```

---

## 🧪 Testando

### Test 1: Adicionar YouTube Source (Admin Panel)

1. Vá para Admin → Gestão de Vídeos
2. Edite um vídeo existente
3. Abra a tab "Múltiplas Fontes"
4. Cole: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Clique em Adicionar
6. ✅ Deve aparecer na lista

### Test 2: Adicionar Wistia Source

1. Vá para `https://fast.wistia.com/` (seu vídeo)
2. Clique em "Share" → "Embed HTML"
3. Copie o código completo
4. No Admin, Múltiplas Fontes, selecione "Wistia"
5. Cole o código
6. Clique em Adicionar
7. ✅ Deve aparecer

### Test 3: Usar no Frontend

```typescript
const { sources } = useVideoSources();
useEffect(() => {
  initialize(videoId);
}, [videoId]);

<VideoPlayer sources={sources} />
```

---

## 🔒 Segurança

### RLS (Row Level Security) Está Ativado

- ✅ **SELECT**: Qualquer um pode ler (usuários veem vídeos)
- ✅ **INSERT/UPDATE/DELETE**: Só `service_role` (admin)

Isso significa:
- Usuários normais **não conseguem** criar/editar via SQL
- Admin usa o VideoSourceSelector (que chama RPCs)
- RPCs têm `SECURITY DEFINER` para permitir admin

---

## 📚 Arquivos Criados/Modificados

```
✅ CRIADOS:
- src/hooks/useVideoSources.ts
- src/components/video/VideoSourceSelector.tsx
- src/components/video/VideoPlayer.tsx
- supabase/migrations/20250127000100_add_video_sources.sql

✅ MODIFICADOS:
- src/types/index.ts (adicionados tipos)
- src/pages/admin/GestaoVideos.tsx (integração)
```

---

## ❓ FAQ

**P: Posso adicionar mais de 3 plataformas?**
R: Sim! Basta:
1. Adicionar novo `SourceType` em types/index.ts
2. Adicionar nova interface de dados
3. Adicionar suporte no VideoPlayer (novo componente)
4. Atualizar VideoSourceSelector com novo type

**P: Como faço fallback automático?**
R: Já está feito! Se a primeira source falhar de carregar, o VideoPlayer mostra a próxima automaticamente.

**P: E se não tiver nenhuma source?**
R: Mostra mensagem "Nenhuma fonte de vídeo disponível" + ícone de alerta.

**P: Preciso de mais edições no SQL?**
R: **NÃO**. O SQL está 100% completo. Todas as RPCs necessárias já existem.

**P: O banco de dados ficou maior?**
R: Sim, mas pouco. Apenas a nova tabela `video_sources` + 3 índices + 4 funções.

---

## 🎯 Resumo Final

| Componente | Arquivo | Status |
|-----------|---------|--------|
| Banco de Dados | `20250127000100_add_video_sources.sql` | ✅ Pronto |
| Types | `src/types/index.ts` | ✅ Pronto |
| Hook | `src/hooks/useVideoSources.ts` | ✅ Pronto |
| Selector | `src/components/video/VideoSourceSelector.tsx` | ✅ Pronto |
| Player | `src/components/video/VideoPlayer.tsx` | ✅ Pronto |
| Admin UI | `src/pages/admin/GestaoVideos.tsx` | ✅ Pronto |

**TUDO ESTÁ PRONTO PARA USAR!** 🚀

---

## 📞 Support

Se encontrar problemas:

1. Verifique se o SQL foi executado: `SELECT COUNT(*) FROM video_sources;`
2. Verifique RLS: `SELECT * FROM information_schema.tables WHERE tablename = 'video_sources';`
3. Verifique funções: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
4. Teste no admin panel (seção Múltiplas Fontes)
