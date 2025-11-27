# 🔗 Guia de Atualização dos Links de Checkout

## 📋 Visão Geral

Este documento explica como atualizar os links de checkout dos planos em TODO o sistema EdukaPrime.

---

## ⚠️ IMPORTANTE

Os links de checkout estão **centralizados** em arquivos de constantes. Isso significa que você **NÃO precisa** procurar em cada arquivo individual para atualizar.

**Basta atualizar 2 arquivos** e tudo será atualizado automaticamente! 🎉

---

## 🎯 Arquivos de Checkout Centralizados

### 1️⃣ **Área Interna da Plataforma**
📁 **Arquivo:** `src/constants/checkout.ts`

**Afeta:**
- ✅ Página de Planos (área logada: `/planos`)
- ✅ Modal de Upgrade (quando usuário tenta acessar conteúdo bloqueado)
- ✅ Botões de "Fazer Upgrade"
- ✅ Botões de "Assinar Plano"

### 2️⃣ **Landing Page (Site Externo)**
📁 **Arquivo:** `landing-page/src/constants/checkout.ts`

**Afeta:**
- ✅ Seção de Planos da Landing Page
- ✅ Botões "Assinar Agora"
- ✅ CTAs de conversão

---

## 🔄 Como Atualizar os Links

### Passo 1: Localize os Arquivos

```
project/
├── src/
│   └── constants/
│       └── checkout.ts          ← ARQUIVO 1 (Área Interna)
└── landing-page/
    └── src/
        └── constants/
            └── checkout.ts      ← ARQUIVO 2 (Landing Page)
```

### Passo 2: Abra o Arquivo

Abra qualquer um dos arquivos acima no seu editor de código.

### Passo 3: Atualize os Links

Procure por esta seção:

```typescript
export const CHECKOUT_LINKS = {
  essencial: 'https://www.ggcheckout.com/checkout/v2/...',
  evoluir: 'https://www.ggcheckout.com/checkout/v2/...',
  prime: 'https://www.ggcheckout.com/checkout/v2/...',
} as const;
```

### Passo 4: Substitua os URLs

Substitua os URLs pelos novos links de checkout:

```typescript
export const CHECKOUT_LINKS = {
  essencial: 'SEU_NOVO_LINK_ESSENCIAL_AQUI',
  evoluir: 'SEU_NOVO_LINK_EVOLUIR_AQUI',
  prime: 'SEU_NOVO_LINK_PRIME_AQUI',
} as const;
```

### Passo 5: Salve e Pronto! ✅

Todos os botões em TODO o sistema serão atualizados automaticamente!

---

## 📍 Links Atuais (Referência)

**Sistema:** GGCheckout
**Última atualização:** 02/10/2025

| Plano | Link Atual |
|-------|-----------|
| **Essencial** | `https://www.ggcheckout.com/checkout/v2/8S2J21JhLk3xIhbiRJiq` |
| **Evoluir** | `https://www.ggcheckout.com/checkout/v2/XIGp0MeoklnQxhGEnJIe` |
| **Prime** | `https://www.ggcheckout.com/checkout/v2/jgSa1tc6CfVFYBaku7JV` |

---

## 🗺️ Onde os Links São Usados

### **Área Interna (Logada):**

1. **Página de Planos** (`/planos`)
   - Arquivo: `src/pages/Planos.tsx`
   - Botão: "Fazer Upgrade"
   - Importa de: `src/constants/checkout.ts`

2. **Modal de Upgrade**
   - Arquivo: `src/components/ui/AttractiveUpgradeModal.tsx`
   - Redireciona para: `/planos` (que usa os links de checkout)

3. **Conteúdo Bloqueado**
   - Quando usuário sem plano tenta acessar:
     - Atividades bloqueadas
     - Vídeos bloqueados
     - Bônus bloqueados
   - Mostra modal que vai para `/planos`

### **Landing Page (Site Externo):**

1. **Seção de Planos**
   - Arquivo: `landing-page/src/components/sections/Planos.tsx`
   - Botão: "Assinar Agora"
   - Importa de: `landing-page/src/constants/checkout.ts`

2. **CTAs de Conversão**
   - Todos os botões que levam aos planos
   - Importam do mesmo arquivo de constantes

---

## ✅ Checklist de Atualização

Quando precisar atualizar os links de checkout:

- [ ] Atualizar `src/constants/checkout.ts`
- [ ] Atualizar `landing-page/src/constants/checkout.ts`
- [ ] Atualizar a data neste README
- [ ] Atualizar a tabela "Links Atuais (Referência)" acima
- [ ] Testar cada plano:
  - [ ] Plano Essencial abre o checkout correto
  - [ ] Plano Evoluir abre o checkout correto
  - [ ] Plano Prime abre o checkout correto

---

## 🐛 Solução de Problemas

### Problema: "Atualizei o link mas não mudou no site"

**Solução:**
1. Certifique-se de que salvou o arquivo
2. Reinicie o servidor de desenvolvimento (`npm run dev`)
3. Limpe o cache do navegador (Ctrl + Shift + R)

### Problema: "Link está errado em um lugar específico"

**Solução:**
1. Verifique se o arquivo está importando de `constants/checkout.ts`
2. Se estiver usando URL direta (hard-coded), substitua pela importação:

```typescript
// ❌ ERRADO (não fazer)
const link = 'https://checkout.com/...';

// ✅ CORRETO (sempre usar)
import { CHECKOUT_LINKS } from '@/constants/checkout';
const link = CHECKOUT_LINKS.essencial;
```

---

## 📝 Notas Importantes

1. **NUNCA** coloque links de checkout diretamente no código (hard-coded)
2. **SEMPRE** importe de `constants/checkout.ts`
3. Mantenha os 2 arquivos sincronizados (área interna + landing page)
4. Atualize a data quando modificar os links
5. Teste após qualquer alteração

---

## 📞 Suporte

Se tiver dúvidas sobre atualização de links:

1. Leia este README primeiro
2. Verifique se está editando os arquivos corretos
3. Confira se importou as constantes corretamente

---

**Última atualização deste documento:** 02/10/2025
**Responsável:** Sistema EdukaPrime
**Versão:** 1.0
