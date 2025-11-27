# ✅ Comunidade - Regras em Accordion

## 🔧 Mudanças Implementadas

### 1. ✅ Removida Rolagem Automática para Regras

**Antes:**
- Não havia rolagem automática específica para regras (apenas para mensagens)

**Agora:**
- Mantido comportamento: scroll automático só para mensagens do chat
- Regras ficam na parte inferior, sem scroll forçado

---

### 2. ✅ Regras Transformadas em Accordion Colapsável

**Como Funciona:**

- **Título:** "📌 Regras de Educação no Chat"
- **Estado Inicial:** Fechado (colapsado)
- **Ao Clicar:** Expande/Colapsa o conteúdo
- **Ícone:**
  - ▼ (ChevronDown) quando fechado
  - ▲ (ChevronUp) quando aberto

**Componente:**
```tsx
<button onClick={() => setRulesExpanded(!rulesExpanded)}>
  📌 Regras de Educação no Chat
  {rulesExpanded ? <ChevronUp /> : <ChevronDown />}
</button>

{rulesExpanded && (
  <div className="animate-fade-in">
    {/* Conteúdo das regras */}
  </div>
)}
```

---

## 🎨 Aparência Visual

### **Título (Fechado):**
- Fundo transparente com glassmorphism
- Hover: fundo branco semi-transparente
- Ícone seta para baixo (▼)

### **Título (Aberto):**
- Mesmo estilo
- Ícone seta para cima (▲)

### **Conteúdo Expandido:**
- Animação suave (fade-in)
- Lista de regras com bullet points verdes
- Card vermelho com aviso de banimento

---

## 📋 Como Testar

1. **Vá em Comunidade** (página Ranking/Chat)
2. **Role até o final** da página
3. **Veja a caixa:** "📌 Regras de Educação no Chat"
4. **Estado inicial:** Fechado (só mostra título + seta ▼)
5. **Clique no título** → Expande mostrando regras
6. **Clique novamente** → Colapsa escondendo regras

---

## ✅ Comportamento Esperado

### **Fechado:**
```
┌─────────────────────────────────────┐
│ 📌 Regras de Educação no Chat    ▼ │
└─────────────────────────────────────┘
```

### **Aberto:**
```
┌─────────────────────────────────────┐
│ 📌 Regras de Educação no Chat    ▲ │
├─────────────────────────────────────┤
│ • Respeite todos os participantes   │
│ • Mantenha o foco em temas educativos│
│ • Evite spam, propagandas ou links  │
│ • Valorize a diversidade de opiniões│
│ • Seja claro e objetivo             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️ Descumprimento das regras    │ │
│ │ resultará na perda da conta     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📁 Arquivo Modificado

**`src/pages/Ranking.tsx`**

**Mudanças:**
1. ✅ Importado `ChevronDown` e `ChevronUp` do lucide-react
2. ✅ Adicionado estado `rulesExpanded` (boolean)
3. ✅ Transformado título em `<button>` clicável
4. ✅ Adicionado toggle de ícones (▼/▲)
5. ✅ Conteúdo só aparece quando `rulesExpanded === true`
6. ✅ Animação `animate-fade-in` ao expandir

---

## 🎯 Benefícios

✅ **Interface mais limpa** - Regras escondidas por padrão
✅ **Melhor UX** - Usuário escolhe quando ler as regras
✅ **Menos scroll** - Conteúdo opcional colapsado
✅ **Visual moderno** - Accordion pattern comum em UIs

---

## 🐛 Troubleshooting

**Problema:** Accordion não expande/colapsa

**Solução:**
- Verifique se o estado `rulesExpanded` está sendo atualizado
- Limpe cache: `Ctrl + Shift + R`

---

**Problema:** Animação não aparece

**Solução:**
- Verifique se a classe `animate-fade-in` existe no Tailwind
- Se não existir, a div ainda funciona, só sem animação

---

**Teste agora e confirme se está funcionando!** 🚀
