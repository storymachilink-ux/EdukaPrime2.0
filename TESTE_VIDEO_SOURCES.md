# 🧪 Teste Rápido: Sistema de Múltiplas Plataformas de Vídeo

**Status**: 🎬 PRONTO PARA TESTAR

---

## ✅ Checklist de Verificação

### [1] SQL Executado com Sucesso ✅
```
- Tabela video_sources criada: ✅
- RLS ativado: ✅
- 10 funções criadas: ✅
- 3 índices criados: ✅
```

### [2] Arquivos Criados ✅
```
✅ src/types/index.ts - Tipos adicionados
✅ src/hooks/useVideoSources.ts - Hook criado
✅ src/components/video/VideoSourceSelector.tsx - Componente criado
✅ src/components/video/VideoPlayer.tsx - Componente criado
✅ src/pages/admin/GestaoVideos.tsx - Integrado
```

---

## 🚀 Teste 1: Verificar Banco de Dados

**No Supabase SQL Editor:**

```sql
-- Verificar tabela
SELECT COUNT(*) as total FROM public.video_sources;
-- Esperado: 0 (vazio, é normal)

-- Verificar funções
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%video_source%'
ORDER BY routine_name;
-- Esperado: 4 funções (create_or_update, get, get_primary, delete)
```

---

## 🎬 Teste 2: Testar no Admin Panel

### Passo 1: Criar um Vídeo
1. Abra seu projeto em: `http://localhost:5173`
2. Vá para **Admin** → **Gestão de Vídeos**
3. Clique em **Novo Vídeo**
4. Preencha:
   - Título: "Teste Video Sources"
   - Descrição: "Video para testar múltiplas plataformas"
   - Categoria: "Teste"
   - Duração: "5:00"
   - URL YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Planos: Selecione pelo menos 1
5. Clique **Salvar**
6. ✅ Vídeo criado

### Passo 2: Adicionar Múltiplas Fontes
1. Clique em **Editar** no vídeo criado
2. **Abra a tab "Múltiplas Fontes"**
3. Verá a seção VideoSourceSelector com:
   - Botões: YouTube | Wistia | Vturb
   - Campo de input
   - Lista de fontes (vazia)

### Passo 3: Adicionar YouTube Source
1. Certifique que **YouTube** está selecionado
2. Cole em "Adicionar Nova Fonte":
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
3. Clique **Adicionar**
4. ✅ Esperado: Fonte aparece na lista com ✓ Primária

### Passo 4: Adicionar Segunda Fonte (Opcional)
1. Se tiver um vídeo Wistia, teste adicionando
2. Selecione **Wistia**
3. Cole o código ou media ID
4. Clique **Adicionar**
5. ✅ Duas fontes devem aparecer na lista

---

## 🧪 Teste 3: Verificar Dados no Banco

**No Supabase SQL Editor:**

```sql
-- Contar todas as sources
SELECT COUNT(*) as total_sources FROM public.video_sources;
-- Esperado: >= 1

-- Ver detalhes
SELECT
  id,
  video_id,
  source_type,
  is_primary,
  created_at
FROM public.video_sources
ORDER BY created_at DESC
LIMIT 5;
-- Esperado: Ver suas fontes adicionadas
```

---

## ⚙️ Teste 4: Usar Hook no Frontend (Avançado)

Se quiser testar o hook `useVideoSources` no código:

```typescript
// Em um componente React
import { useVideoSources } from '@/hooks/useVideoSources';

function TestComponent() {
  const { sources, primarySource, initialize } = useVideoSources();

  useEffect(() => {
    // Substitua pelo ID de um vídeo existente
    const videoId = 'seu-video-uuid';
    initialize(videoId);
  }, []);

  return (
    <div>
      <h2>Total de Fontes: {sources.length}</h2>
      {primarySource && (
        <p>Fonte Primária: {primarySource.source_type}</p>
      )}
      <ul>
        {sources.map(source => (
          <li key={source.id}>
            {source.source_type} {source.is_primary ? '(Primária)' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🎮 Teste 5: Testar VideoPlayer Component

```typescript
import { VideoPlayer, VideoThumbnail } from '@/components/video/VideoPlayer';
import { useVideoSources } from '@/hooks/useVideoSources';

function VideoTest() {
  const { sources, initialize } = useVideoSources();

  useEffect(() => {
    initialize('seu-video-uuid');
  }, []);

  if (!sources.length) return <p>Carregando...</p>;

  return (
    <div>
      {/* Thumbnail */}
      <VideoThumbnail
        sources={sources}
        className="aspect-video rounded-lg"
      />

      {/* Player */}
      <VideoPlayer
        sources={sources}
        title="Meu Vídeo"
        className="aspect-video mt-4"
      />
    </div>
  );
}
```

---

## ✅ Teste 6: Deletar Uma Fonte

1. Vá para Admin → Gestão de Vídeos
2. Edite um vídeo
3. Abra tab "Múltiplas Fontes"
4. Clique no ícone de lixeira na fonte
5. Confirme deletar
6. ✅ Fonte deve desaparecer da lista

---

## ❌ Troubleshooting

### Problema: "VideoSourceSelector não encontrado"
**Solução**: Certifique que o arquivo está em:
```
src/components/video/VideoSourceSelector.tsx
```

### Problema: "Hook useVideoSources não existe"
**Solução**: Certifique que o arquivo está em:
```
src/hooks/useVideoSources.ts
```

### Problema: "RPC 'create_or_update_video_source' não existe"
**Solução**: Execute o SQL novamente no Supabase:
```
supabase/migrations/20250127000100_add_video_sources.sql
```

### Problema: "CORS ou erro de permissão"
**Solução**: RLS pode estar bloqueando. Verifique:
```sql
-- No Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'video_sources';
-- Deve ter 4 políticas
```

### Problema: "Componente não renderiza"
**Solução**: Certifique que tem React 18+ e Tailwind configurado:
```bash
npm list react
npm list tailwindcss
```

---

## 📊 Resumo de Testes

| Teste | Arquivo | Status | ✅/❌ |
|-------|---------|--------|------|
| SQL | Supabase | Executar | ✅ |
| Admin Panel | GestaoVideos.tsx | Navegar | ⏳ |
| Add YouTube | VideoSourceSelector | Adicionar | ⏳ |
| Add Wistia | VideoSourceSelector | Adicionar | ⏳ |
| Banco | Supabase SQL | Verificar | ⏳ |
| Hook | useVideoSources | Testar | ⏳ |
| Player | VideoPlayer | Renderizar | ⏳ |
| Delete | VideoSourceSelector | Deletar | ⏳ |

---

## 🎯 Próximos Passos Após Testes

1. ✅ Tudo funcionando → Integre em seus componentes
2. ❌ Algo quebrou → Veja Troubleshooting
3. ❓ Dúvida → Veja o arquivo `VIDEO_SOURCES_IMPLEMENTATION.md`

---

## 🚀 Quick Start (Resumido)

```bash
# 1. Já feito - SQL executado
# 2. Já feito - Componentes criados
# 3. Agora - Teste no Admin Panel
# 4. Depois - Use nos seus componentes
```

---

**Pronto para começar a testar?** 🎬✨
