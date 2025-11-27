# 📋 PLANO DE IMPLEMENTAÇÃO - DASHBOARD MELHORADO

## 🎯 Objetivo
Integrar materiais de `/paper-dashboard` no `/dashboard` com sistema de abas para alternar entre:
- **Atividades BNCC** (atividades educacionais)
- **Coleções de PaperCrafts** (papercrafts temáticos)

---

## 📐 ARQUITETURA PROPOSTA

```
Dashboard.tsx (página principal)
├── Header (nome do usuário, logout)
├── GamificationWidget (XP, nível, badges)
├── ArtRevealCard (lembrança em desenho)
├── Seção de Bônus Quiz
│   ├── Descrição
│   ├── Toggle Buttons (Atividades BNCC | Coleções de PaperCrafts)
│   └── Conteúdo Dinâmico
│       ├── Se "Atividades" → MaterialList (atual)
│       └── Se "PaperCrafts" → PaperCraftGrid (novo)
```

---

## 🎨 INTERFACE DO TOGGLE

### Visual Esperado

```
┌─────────────────────────────────────────────┐
│ Bônus Quiz                                  │
│ Acesse seus bônus conquistados no Quiz...  │
│                                             │
│ [Atividades BNCC] [Coleções PaperCrafts]  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Conteúdo Dinâmico                       │ │
│ │ (muda baseado no botão selecionado)     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 💡 DICAS DE IMPLEMENTAÇÃO

### Dica #1: Criar Componente de Toggle/Abas

```typescript
// src/components/dashboard/BonusSelector.tsx

interface BonusSelectorProps {
  activeTab: 'atividades' | 'papercrafts';
  onTabChange: (tab: 'atividades' | 'papercrafts') => void;
}

export const BonusSelector: React.FC<BonusSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => onTabChange('atividades')}
        className={`
          px-6 py-3 rounded-lg font-semibold transition-all
          ${activeTab === 'atividades'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }
        `}
      >
        📚 Atividades BNCC
      </button>

      <button
        onClick={() => onTabChange('papercrafts')}
        className={`
          px-6 py-3 rounded-lg font-semibold transition-all
          ${activeTab === 'papercrafts'
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }
        `}
      >
        🎨 Coleções PaperCrafts
      </button>
    </div>
  );
};
```

### Dica #2: Criar Grid Responsivo para PaperCrafts

```typescript
// src/components/dashboard/PaperCraftGrid.tsx

interface PaperCraft {
  id: string;
  title: string;
  category: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageGroup: string;
  description: string;
  image?: string;
  modelCount: string;
}

export const PaperCraftGrid: React.FC<{ items: PaperCraft[] }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((craft) => (
        <div
          key={craft.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
        >
          {/* Imagem */}
          {craft.image && (
            <img
              src={craft.image}
              alt={craft.title}
              className="w-full h-48 object-cover"
            />
          )}

          {/* Conteúdo */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-600">
                {craft.category}
              </span>
              <span className={`
                text-xs px-2 py-1 rounded
                ${craft.difficulty === 'fácil' ? 'bg-green-100 text-green-700' :
                  craft.difficulty === 'médio' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'}
              `}>
                {craft.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {craft.title}
            </h3>

            <p className="text-sm text-gray-600 mb-2">
              {craft.modelCount}
            </p>

            <p className="text-sm text-gray-700 mb-4">
              {craft.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                👶 {craft.ageGroup}
              </span>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Dica #3: Integrar no Dashboard.tsx

```typescript
// src/pages/Dashboard.tsx (adicionar isto)

export default function Dashboard() {
  // ... código existente ...

  const [bonusTab, setBonusTab] = useState<'atividades' | 'papercrafts'>('atividades');

  // Dados dos papercrafts (ou buscar do Supabase)
  const paperCrafts: PaperCraft[] = [
    {
      id: 'natal-basico',
      title: 'Kit Básico Natalino',
      category: 'Natal',
      difficulty: 'fácil',
      ageGroup: '4-12 anos',
      description: 'Kit Básico Natalino — 20 modelos',
      modelCount: '20 modelos',
    },
    {
      id: 'natal-completo',
      title: 'Kit Completo Natal',
      category: 'Natal',
      difficulty: 'médio',
      ageGroup: '4-12 anos',
      description: 'Kit Completo Natal — 60+ modelos',
      modelCount: '60+ modelos',
    },
    // ... mais papercrafts ...
  ];

  return (
    <DashboardLayout>
      {/* ... código existente ... */}

      {/* NOVA SEÇÃO - BÔNUS QUIZ COM TOGGLE */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#0F2741] mb-2">🎁 Bônus Quiz</h2>
        <p className="text-gray-600 mb-6">
          Acesse seus bônus conquistados no Quiz, kit de selos interativos para ter um contato mais leve na hora de avaliar! e uma atividade Natalina especial 🎄
        </p>

        {/* TOGGLE BUTTONS */}
        <BonusSelector
          activeTab={bonusTab}
          onTabChange={setBonusTab}
        />

        {/* CONTEÚDO DINÂMICO */}
        <div className="mt-8">
          {bonusTab === 'atividades' ? (
            // Mostrar atividades BNCC (componente existente)
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Acervo de Atividades
              </h3>
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6"
              />
              {/* Aqui entra a lista de atividades existente */}
            </div>
          ) : (
            // Mostrar PaperCrafts
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Coleções de PaperCrafts
              </h3>
              <PaperCraftGrid items={paperCrafts} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## 🎯 DADOS DOS PAPERCRAFTS

### Estrutura Recomendada (Supabase)

**Tabela: `papercrafts`**

```sql
CREATE TABLE papercrafts (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  difficulty VARCHAR CHECK (difficulty IN ('fácil', 'médio', 'difícil')),
  description TEXT,
  model_count INTEGER,
  min_age INTEGER,
  max_age INTEGER,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Dados Estáticos (se não quiser banco)

```typescript
const PAPER_CRAFTS = [
  {
    id: 'natal-basico',
    title: 'Kit Básico Natalino',
    category: 'Natal',
    difficulty: 'fácil' as const,
    ageGroup: '4-12 anos',
    description: 'Kit Básico Natalino — 20 modelos',
    modelCount: '20 modelos',
    image: '/images/natal-basico.jpg',
  },
  {
    id: 'natal-completo',
    title: 'Kit Completo Natal',
    category: 'Natal',
    difficulty: 'médio' as const,
    ageGroup: '4-12 anos',
    description: 'Kit Completo Natal — 60+ modelos',
    modelCount: '60+ modelos',
    image: '/images/natal-completo.jpg',
  },
  {
    id: 'natal-bonus',
    title: 'Bônus Natalinos',
    category: 'Natal',
    difficulty: 'médio' as const,
    ageGroup: '4-12 anos',
    description: 'Bônus Natalinos — Exclusivos',
    modelCount: 'Exclusivos',
    image: '/images/natal-bonus.jpg',
  },
  {
    id: 'halloween-edukaboo',
    title: 'Turma EdukaBoo',
    category: 'Personagens',
    difficulty: 'fácil' as const,
    ageGroup: '4-12 anos',
    description: 'Conheça e monte todos os personagens icônicos da turma EdukaBoo',
    modelCount: 'Múltiplos',
    image: '/images/edukaboo.jpg',
  },
  {
    id: 'decoracao',
    title: 'Decoração',
    category: 'Decoração',
    difficulty: 'médio' as const,
    ageGroup: '5-12 anos',
    description: 'Crie decorações incríveis para sua casa ou sala de aula',
    modelCount: 'Variados',
    image: '/images/decoracao.jpg',
  },
  {
    id: 'historias',
    title: 'Histórias',
    category: 'Narrativa',
    difficulty: 'médio' as const,
    ageGroup: '6-12 anos',
    description: 'Papercrafts temáticos inspirados em histórias clássicas e modernas',
    modelCount: 'Variados',
    image: '/images/historias.jpg',
  },
  {
    id: 'atividades-ludicas',
    title: 'Atividades Lúdicas',
    category: 'Educativo',
    difficulty: 'fácil' as const,
    ageGroup: '4-10 anos',
    description: 'Atividades divertidas que combinam aprendizado com diversão',
    modelCount: 'Variados',
    image: '/images/atividades-ludicas.jpg',
  },
];
```

---

## 🎨 RESPONSIVIDADE - BREAKPOINTS

### Mobile (< 768px)
```typescript
grid-cols-1  // 1 coluna
gap-4        // gap menor
p-4          // padding menor
```

### Tablet (768px - 1024px)
```typescript
md:grid-cols-2  // 2 colunas
gap-5           // gap médio
```

### Desktop (> 1024px)
```typescript
lg:grid-cols-3  // 3 colunas
xl:grid-cols-4  // 4 colunas em telas muito grandes
gap-6           // gap maior
```

---

## 🔄 FLUXO DE INTERAÇÃO

```
1. Usuário abre Dashboard
   ↓
2. Vê seção "Bônus Quiz" com dois botões
   ├─ "📚 Atividades BNCC" (ativo por padrão)
   └─ "🎨 Coleções PaperCrafts"
   ↓
3. Clica em "Coleções PaperCrafts"
   ↓
4. Grid de papercrafts é exibido (responsivo)
   ↓
5. Cada card mostra:
   ├─ Imagem (ou placeholder)
   ├─ Categoria (ex: "Natal")
   ├─ Dificuldade (badge colorida)
   ├─ Título
   ├─ Descrição
   ├─ Idade recomendada
   └─ Botão "Ver Detalhes"
   ↓
6. Clica em "Ver Detalhes"
   → Abre modal ou navega para página de detalhes
```

---

## 📁 ESTRUTURA DE ARQUIVOS A CRIAR

```
src/
├── components/
│   └── dashboard/
│       ├── BonusSelector.tsx          (novo - toggle buttons)
│       ├── PaperCraftGrid.tsx         (novo - grid de papercrafts)
│       ├── PaperCraftCard.tsx         (novo - card individual)
│       └── BonusSection.tsx           (novo - seção completa)
├── data/
│   └── papercrafts.ts                 (novo - dados dos papercrafts)
├── pages/
│   └── Dashboard.tsx                  (modificar)
└── types/
    └── papercraft.ts                  (novo - interfaces)
```

---

## 🔌 INTEGRAÇÃO COM SUPABASE (Optional)

Se quiser buscar do banco:

```typescript
// src/lib/paperCraftService.ts

export async function getPaperCrafts() {
  const { data, error } = await supabase
    .from('papercrafts')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Erro ao buscar papercrafts:', error);
    return [];
  }

  return data;
}
```

Depois em Dashboard.tsx:

```typescript
useEffect(() => {
  const loadPaperCrafts = async () => {
    const crafts = await getPaperCrafts();
    setPaperCrafts(crafts);
  };

  loadPaperCrafts();
}, []);
```

---

## ✨ MELHORIAS ADICIONAIS

### 1. Filtros (Opcional)
```typescript
// Adicionar filtros por categoria, dificuldade, idade
<div className="flex gap-4 mb-6">
  <select className="px-4 py-2 border rounded-lg">
    <option>Todas as categorias</option>
    <option>Natal</option>
    <option>Halloween</option>
    {/* ... mais ... */}
  </select>

  <select className="px-4 py-2 border rounded-lg">
    <option>Todos os níveis</option>
    <option>Fácil</option>
    <option>Médio</option>
    <option>Difícil</option>
  </select>
</div>
```

### 2. Search (Busca)
```typescript
// Filtrar papercrafts por título
const [search, setSearch] = useState('');
const filtered = paperCrafts.filter(craft =>
  craft.title.toLowerCase().includes(search.toLowerCase())
);
```

### 3. Skeleton Loading (Enquanto carrega)
```typescript
// Mostrar placeholders enquanto dados carregam
<div className="bg-gray-200 h-48 rounded-lg animate-pulse" />
```

### 4. Animações ao mudar aba
```typescript
// Usar framer-motion para suave transição
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Conteúdo */}
</motion.div>
```

---

## 🎯 PRIORIDADES

### Fase 1 (MVP - Essencial)
- ✅ Toggle buttons
- ✅ Grid responsivo
- ✅ Cards básicos com dados estáticos
- ✅ Estilo coerente com design atual

### Fase 2 (Melhoria)
- 🔄 Buscar dados do Supabase
- 🔄 Filtros por categoria/dificuldade
- 🔄 Busca por título

### Fase 3 (Polish)
- 🔄 Animações suaves
- 🔄 Modal de detalhes
- 🔄 Skeleton loading
- 🔄 Histórico de favoritados

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar arquivo `BonusSelector.tsx`
- [ ] Criar arquivo `PaperCraftGrid.tsx`
- [ ] Criar arquivo `PaperCraftCard.tsx`
- [ ] Adicionar dados dos papercrafts
- [ ] Integrar no Dashboard.tsx
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Testar toggle entre abas
- [ ] Adicionar imagens dos papercrafts
- [ ] Estilizar para combinar com design atual
- [ ] Testar em navegadores diferentes

---

## 🚀 PRÓXIMOS PASSOS

1. **Comece com o componente BonusSelector** (simples)
2. **Depois crie PaperCraftCard** (reutilizável)
3. **Depois crie PaperCraftGrid** (usa o Card)
4. **Por fim, integre no Dashboard** (tudo junto)

Isso permite desenvolvimento incremental e testes contínuos! 🎨
