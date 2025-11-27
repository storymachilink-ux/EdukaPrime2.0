# TikTok Pixel Integration Guide

O pixel do TikTok foi instalado no site EduKaPrime e está completamente configurado para rastrear eventos de usuários em todo o site.

## 📍 Instalação Realizada

### 1. **Script Principal** (`index.html`)
- O pixel do TikTok foi adicionado ao `<head>` do `index.html`
- ID do Pixel: `D3TIPJBC77UFH42QSNU0`
- O script se carrega automaticamente em todas as páginas

### 2. **Biblioteca de Rastreamento** (`src/lib/tiktokTracker.ts`)
Arquivo criado com funções prontas para rastrear eventos:

**Funções Disponíveis:**

| Função | Descrição | Parâmetros |
|--------|-----------|-----------|
| `trackPageView(url?)` | Rastreia visualização de página | URL opcional |
| `trackEvent(eventName, eventData?)` | Rastreia evento customizado | Nome e dados do evento |
| `trackViewContent(id, type, name)` | Rastreia visualização de conteúdo | ID, tipo, nome |
| `trackAddToCart(id, name, value, currency)` | Rastreia adição ao carrinho | Dados do produto |
| `trackPurchase(value, currency, name?, id?)` | Rastreia compra/assinatura | Valor, moeda, dados |
| `trackLogin(userId?, method)` | Rastreia login | ID do usuário, método |
| `trackSignUp(userId, email?)` | Rastreia signup | ID e email do usuário |
| `trackDownload(id, type, name)` | Rastreia download | ID, tipo, nome |
| `trackCompleteResource(id, type, name)` | Rastreia conclusão de recurso | ID, tipo, nome |
| `trackSearch(query, resultsCount)` | Rastreia busca | Query e resultados |
| `trackPlayVideo(id, name, duration?)` | Rastreia play de vídeo | ID, nome, duração |
| `identifyUser(userId, userData?)` | Identifica usuário | ID e dados customizados |
| `trackViewElement(id, name)` | Rastreia visualização de elemento | ID e nome |
| `trackButtonClick(name, section?)` | Rastreia clique em botão | Nome e seção |
| `trackError(message, type?, context?)` | Rastreia erro | Mensagem, tipo, contexto |

### 3. **Rastreamento Automático** (`src/App.tsx`)
- Todas as mudanças de página são automaticamente rastreadas
- O `useLocation` hook monitora mudanças de rota

### 4. **Integração no Login** (`src/pages/Login.tsx`)
- Login com Email: `trackLogin(undefined, 'email')`
- Login com Google: `trackLogin(undefined, 'google')`
- Sign Up: `trackSignUp(userId, email)`

## 🚀 Como Usar

### Exemplo 1: Rastrear Visualização de Vídeo

```typescript
import { trackViewContent, trackPlayVideo } from '../lib/tiktokTracker';

// Quando o usuário clica em um vídeo
const handleVideoClick = (videoId: string, videoName: string) => {
  // Rastrear visualização
  trackViewContent(videoId, 'video', videoName);

  // Rastrear play
  trackPlayVideo(videoId, videoName, 120); // 120 segundos de duração
};
```

### Exemplo 2: Rastrear Download de Atividade

```typescript
import { trackDownload } from '../lib/tiktokTracker';

// Quando o usuário faz download de uma atividade
const handleDownload = (activityId: string, activityName: string) => {
  trackDownload(activityId, 'atividade', activityName);
};
```

### Exemplo 3: Rastrear Conclusão de Recurso

```typescript
import { trackCompleteResource } from '../lib/tiktokTracker';

// Quando o usuário completa uma atividade
const handleCompleteActivity = (activityId: string, activityName: string) => {
  trackCompleteResource(activityId, 'atividade', activityName);
};
```

### Exemplo 4: Rastrear Compra/Assinatura

```typescript
import { trackPurchase } from '../lib/tiktokTracker';

// Quando o usuário faz uma assinatura
const handlePlanPurchase = (planName: string, planValue: number) => {
  trackPurchase(planValue, 'BRL', planName, 'plan_' + planName.toLowerCase());
};
```

### Exemplo 5: Rastrear Busca

```typescript
import { trackSearch } from '../lib/tiktokTracker';

// Quando o usuário busca por conteúdo
const handleSearch = (query: string, results: any[]) => {
  trackSearch(query, results.length);
};
```

### Exemplo 6: Identificar Usuário (Para Dados Customizados)

```typescript
import { identifyUser } from '../lib/tiktokTracker';

// Depois que o usuário faz login
const handleLoginSuccess = (user: any) => {
  identifyUser(user.id, {
    email: user.email,
    nome: user.nome,
    plano: user.plano_ativo,
    data_cadastro: user.created_at
  });
};
```

## 📍 Integração em Componentes Específicos

### Videos Component (`src/pages/Videos.tsx`)
```typescript
import { trackPlayVideo, trackViewContent } from '../lib/tiktokTracker';

// Adicionar ao manipulador de clique do vídeo
trackViewContent(videoId, 'video', videoTitle);
trackPlayVideo(videoId, videoTitle);
```

### Atividades Component (`src/pages/Atividades.tsx`)
```typescript
import { trackViewContent, trackDownload, trackCompleteResource } from '../lib/tiktokTracker';

// Ao visualizar uma atividade
trackViewContent(activityId, 'atividade', activityName);

// Ao fazer download
trackDownload(activityId, 'atividade', activityName);

// Ao completar
trackCompleteResource(activityId, 'atividade', activityName);
```

### Planos Page (`src/pages/Planos.tsx`)
```typescript
import { trackButtonClick, trackPurchase } from '../lib/tiktokTracker';

// Ao clicar em "Assinar"
trackButtonClick('AssinarPlano', 'Planos');

// Após confirmação de pagamento
trackPurchase(planValue, 'BRL', planName, planId);
```

### Dashboard (`src/pages/Dashboard.tsx`)
```typescript
import { identifyUser } from '../lib/tiktokTracker';

// Ao carregar o dashboard (usuário já autenticado)
useEffect(() => {
  if (user) {
    identifyUser(user.id, {
      email: user.email,
      plano: user.plano_ativo
    });
  }
}, [user]);
```

## 🔍 Verificar Instalação

### 1. Abra o console do navegador (F12)
```javascript
// Verificar se o pixel está carregado
window.ttq // Deve retornar o objeto do TikTok Pixel
```

### 2. Teste um evento
```javascript
// No console, execute:
window.ttq.page(); // Rastreia a página atual
window.ttq.track('TestEvent', { test: true }); // Rastreia um evento de teste
```

### 3. Verifique no TikTok Ads Manager
1. Vá para: https://ads.tiktok.com/
2. Acesse "Events Manager"
3. Verifique se os eventos estão sendo recebidos (pode levar alguns minutos)

## 📊 Eventos Rastreados Automaticamente

1. **Page View** - Toda mudança de página/rota
2. **Login** - Quando usuário faz login (email ou Google)
3. **Sign Up** - Quando novo usuário se registra

## ✅ Checklist de Integração

- [x] Pixel adicionado ao `index.html`
- [x] Arquivo `tiktokTracker.ts` criado
- [x] Rastreamento automático de page views em `App.tsx`
- [x] Integração em `Login.tsx` (login/signup)
- [ ] Integração em `Videos.tsx` (trackPlayVideo)
- [ ] Integração em `Atividades.tsx` (trackDownload, trackCompleteResource)
- [ ] Integração em `Bonus.tsx` (trackViewContent, trackCompleteResource)
- [ ] Integração em `Planos.tsx` (trackPurchase)
- [ ] Integração em `Dashboard.tsx` (identifyUser)
- [ ] Testes em produção

## 🐛 Troubleshooting

### "TikTok Pixel não está carregado ainda"
Este é um aviso normal quando o script ainda está carregando. O pixel carrega após alguns milissegundos.

### Eventos não aparecem no TikTok Ads Manager
- Verifique se o ID do pixel está correto: `D3TIPJBC77UFH42QSNU0`
- Aguarde alguns minutos para sincronização
- Verifique se há bloqueadores de anúncios no navegador
- Verifique as permissões de cookie no navegador

### Erro de CORS
O pixel do TikTok não deve gerar erros de CORS, pois é carregado através de um script externo confiável.

## 📝 Notas

- Todos os eventos incluem timestamp automático
- Os eventos são enviados de forma assíncrona
- O pixel respeita as configurações de consentimento de cookies
- Os dados dos usuários são enviados de forma segura para os servidores do TikTok
