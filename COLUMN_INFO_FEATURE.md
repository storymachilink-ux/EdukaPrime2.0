# ℹ️ Feature: Informações sobre Colunas da Tabela

## 🎯 O que é

Ícones informativos discretos ao lado de cada coluna da tabela que, ao clicar, mostram:
- ✅ Título da coluna
- ✅ Descrição do que ela contém
- ✅ Exemplos dos valores que podem aparecer

---

## 📍 Onde está

**Arquivo:** `src/components/admin/WebhooksDashboard.tsx`

**Localização:** Cabeçalho da tabela "Webhooks Recebidos"

```
[ℹ️] Data    [ℹ️] Plataforma    [ℹ️] Email    [ℹ️] Método    [ℹ️] Valor    [ℹ️] Status    [ℹ️] Ações
```

---

## 🎨 Visual

### **Estado Padrão (Discreto):**
```
Data ℹ️
```
- Ícone pequeno (w-3 h-3)
- Cor cinza (text-gray-400)
- Hover escurece (hover:text-gray-600)
- Cursor muda para help

### **Clicado (Tooltip Aberto):**
```
┌──────────────────────────────┐
│ Data                         │
│                              │
│ Data e hora que o webhook    │
│ foi recebido                 │
│                              │
│ 26/11/2025, 14:30 •          │
│ 25/11/2025, 10:15            │
└──────────────────────────────┘
```

---

## 📝 Cada Coluna Explicada

### **1. ☑️ Seleção (Checkbox)**
```
Título: Seleção
Descrição: Selecione webhooks para reprocessar ou deletar em lotes
Exemplos:
  • Marque para reprocessar múltiplos
  • Marque para deletar em lotes
```

### **2. 📅 Data**
```
Título: Data
Descrição: Data e hora que o webhook foi recebido
Exemplos:
  • 26/11/2025, 14:30
  • 25/11/2025, 10:15
```

### **3. 🏢 Plataforma**
```
Título: Plataforma
Descrição: De qual gateway de pagamento o webhook veio
Exemplos:
  • VEGA (azul)
  • GGCHECKOUT (verde)
  • AMPLOPAY (roxo)
```

### **4. 📧 Email**
```
Título: Email do Cliente
Descrição: Email do cliente que fez a compra. Clique no lápis para editar
Exemplos:
  • user@email.com
  • Editável: clique no ícone ✏️
```

### **5. 💳 Método**
```
Título: Método de Pagamento
Descrição: Como o cliente pagou
Exemplos:
  • PIX
  • CARD
  • BOLETO
```

### **6. 💰 Valor**
```
Título: Valor
Descrição: Valor total da transação em reais
Exemplos:
  • R$ 12,99
  • R$ 299,90
  • R$ 1.999,00
```

### **7. 🎯 Status**
```
Título: Status
Descrição: Estado atual do webhook
Exemplos:
  • ✅ Sucesso (verde)
  • ⏳ Pendente (amarelo)
  • 🔴 Falhado (vermelho)
  • 📭 Recebido (cinza)
```

### **8. ⚙️ Ações**
```
Título: Ações
Descrição: Operações disponíveis para este webhook
Exemplos:
  • 👁️ Ver JSON (detalhes completos)
  • ✏️ Editar email
  • 🗑️ Deletar webhook
  • 🔄 Reprocessar (só se falhado)
```

---

## 🔧 Como Funciona

### **State Management**
```typescript
const [showColumnInfo, setShowColumnInfo] = useState<string | null>(null);
```
- Armazena qual coluna está com info aberta
- `null` = nenhuma aberta
- `'data'` = info da data aberta
- etc.

### **Toggle da Info**
```typescript
onClick={() => setShowColumnInfo(showColumnInfo === 'data' ? null : 'data')}
```
- Clica 1x → abre
- Clica 2x → fecha
- Clica em outra → fecha anterior e abre nova

### **Estrutura de Dados**
```typescript
const columnInfo = {
  data: {
    title: 'Data',
    description: '...',
    examples: ['26/11/2025, 14:30', ...]
  },
  // ... outras colunas
}
```

---

## 🎨 Estilo do Tooltip

```css
/* Fundo */
bg-gray-900 (cinza escuro)

/* Texto */
text-white (branco)
text-xs (extra pequeno)
rounded-lg (bordas arredondadas)

/* Posicionamento */
absolute left-0 top-6 (abaixo do ícone)
z-50 (acima de tudo)

/* Sombra */
shadow-lg (sombra grande)

/* Padding */
p-3 (espaço interno)

/* Largura */
w-48 (padrão)
w-56 (ações - mais larga)
```

---

## 📱 Responsividade

- ✅ Funciona em mobile (tooltip aparece)
- ✅ Não quebra layout
- ✅ Clique funciona normalmente
- ⚠️ Em telas pequenas tooltip pode sair da tela (considerar mudar `left-0` para `right-0` se necessário)

---

## 🧪 Como Testar

### **Teste 1: Abrir Tooltip**
```
1. Abrir WebhooksDashboard
2. Procurar tabela "Webhooks Recebidos"
3. Clicar no ℹ️ ao lado de "Data"
4. ✅ Tooltip deve aparecer abaixo do ícone
```

### **Teste 2: Fechar Tooltip**
```
1. Com tooltip aberto
2. Clicar novamente no ℹ️
3. ✅ Tooltip deve desaparecer
```

### **Teste 3: Trocar de Tooltip**
```
1. Abrir tooltip de "Data"
2. Clicar no ℹ️ de "Email"
3. ✅ Tooltip de Data fecha
4. ✅ Tooltip de Email abre
```

### **Teste 4: Conteúdo Correto**
```
1. Clicar em cada ℹ️
2. ✅ Verificar se título, descrição e exemplos aparecem
3. ✅ Verificar se está relevante para a coluna
```

---

## 🎯 Casos de Uso

### **Usuário Novo (Não Entende)**
```
"O que significa essa coluna?"
👉 Clica no ℹ️
👈 Vê explicação clara e exemplos
```

### **Usuário Confuso com Status**
```
"Quais são os possíveis status?"
👉 Clica no ℹ️ de Status
👈 Vê: ✅ Sucesso, ⏳ Pendente, 🔴 Falhado, 📭 Recebido
```

### **Usuário Quer Saber o que Fazer**
```
"Como edito o email?"
👉 Clica no ℹ️ de Email
👈 Vê: "Editável: clique no ícone ✏️"
```

---

## 💡 Exemplo Visual Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 📥 WEBHOOKS RECEBIDOS                                           │
│ Todos os webhooks recebidos das plataformas de pagamento       │
│                                                                 │
│ Filtros: [Email] [Plataforma] [Status] [Período] [Atualizar]  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ☑️ Data ℹ️ │ Plataforma ℹ️ │ Email ℹ️ │ Método ℹ️ │ ... │││
│ ├─────────────────────────────────────────────────────────────┤│
│ │ ☑ │ 26/11/2025, 14:30 │ VEGA │ user@test.com ✏️ │...  │││
│ │ ☐ │ 25/11/2025, 10:15 │ GG   │ admin@test.com ✏️│...  │││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ 📌 Se clicar no ℹ️ de "Data":                                  │
│ ┌──────────────────────────────┐                              │
│ │ Data                         │                              │
│ │                              │                              │
│ │ Data e hora que o webhook    │                              │
│ │ foi recebido                 │                              │
│ │                              │                              │
│ │ 26/11/2025, 14:30 •          │                              │
│ │ 25/11/2025, 10:15            │                              │
│ └──────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Discreto** | Ícone pequeno, não pollui interface |
| **Intuitivo** | Símbolo ℹ️ claramente indica informação |
| **Informativo** | Explica cada coluna de forma clara |
| **Exemplos** | Mostra valores reais que podem aparecer |
| **On-demand** | Usuário controla quando quer ver |
| **Mobile-friendly** | Funciona em dispositivos pequenos |

---

## 🔄 Fluxo de Uso

```
Usuário abre tabela
        ↓
"O que é essa coluna?"
        ↓
Clica no ℹ️
        ↓
Tooltip abre com:
  ✅ Título
  ✅ Descrição
  ✅ Exemplos
        ↓
Lê informação
        ↓
Clica novamente (ou em outro ℹ️)
        ↓
Tooltip fecha
        ↓
Continua usando tabela
```

---

## 📊 Estado do Build

```
✓ 2939 modules transformed
✓ built in 9.14s
✓ 0 TypeScript errors
```

---

## 🎉 Conclusão

A feature de informações sobre colunas é:
- ✅ Leve (pouco código)
- ✅ Discreta (não pollui UI)
- ✅ Informativa (ajuda usuário novo)
- ✅ Funcional (ao clicar funciona bem)
- ✅ Pronta para produção

**Ideal para melhorar UX sem adicionar complexidade!** 🚀
