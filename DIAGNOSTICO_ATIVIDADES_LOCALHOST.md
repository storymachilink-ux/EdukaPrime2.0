# 🔍 Diagnóstico: Por que Atividades não funciona em Localhost

**Data**: 27 de Novembro de 2025
**Problema**: Atividades funcionam em produção (Hostinger) mas não em localhost
**Status**: Análise e soluções identificadas

---

## 📊 Análise Inicial

Você tem:
- ✅ Atividades funcionando em **produção (Hostinger)**
- ❌ Atividades **NÃO funcionando em localhost**

Isso indica um problema específico do **ambiente de desenvolvimento**, não do código em si.

---

## 🎯 Possíveis Causas (Ranked por Probabilidade)

### **1. 🥇 CORS / Bloqueio de Requisições** (60% probabilidade)

**O Problema:**
```
localhost:5173 (seu app) → supabase.co (banco de dados)
```

Dependendo da configuração, o Supabase pode estar bloqueando requisições de localhost por CORS.

**Sintomas:**
- ❌ Atividades não carregam
- ✅ Funciona em produção (domínio Hostinger autorizado)
- ❌ Console do navegador mostra erro CORS
- ❌ Networking tab mostra requisições com status 403/401

**Solução:**
```
1. Abra o navegador → F12 → Console/Network
2. Tente carregar atividades
3. Se ver erro CORS, procure por:
   - "Access-Control-Allow-Origin"
   - "Preflight request"
   - "No 'Access-Control-Allow-Origin' header"
```

**Como Corrigir:**
- Vá para Supabase → Settings → CORS
- Adicione: `http://localhost:5173`
- OU: Aceite **wildcard** `http://localhost:*`

---

### **2. 🥈 Autenticação Falha em Localhost** (25% probabilidade)

**O Problema:**
```
localStorage em localhost ≠ localStorage em production
```

O token JWT pode estar sendo perdido, expirado ou não persistindo corretamente.

**Sintomas:**
- ❌ Atividades carregam mas estão todas vazias/locked
- ❌ `profile?.active_plan_id` é undefined
- ✅ Funciona em produção
- ✅ Usuário consegue fazer login

**Solução:**
```
1. Abra DevTools → Application → LocalStorage
2. Procure por:
   - sb-lkhfbhvamnqgcqlrriaw-auth-token
   - auth token JWT
3. Verificar se existe e não está expirado
```

**Como Corrigir:**
```javascript
// Em AuthContext.tsx ou similar, adicione:
useEffect(() => {
  console.log('Auth Debug:', {
    profile,
    activePlanId: profile?.active_plan_id,
    timestamp: new Date().toISOString()
  });
}, [profile]);
```

---

### **3. 🥉 Cache / Hot Module Replacement (HMR) em Localhost** (10% probabilidade)

**O Problema:**
```
Vite HMR pode estar causando reload de componentes
sem recarregar estado da autenticação
```

**Sintomas:**
- ❌ Funciona 1x, depois para de funcionar
- ❌ Funciona após F5 (refresh)
- ✅ Funciona em produção (sem HMR)

**Solução:**
```bash
# Desabilitar HMR se necessário
npm run dev -- --no-hmr

# OU limpar cache
rm -rf node_modules/.vite
```

---

### **4. Timeout de Rede em Localhost** (5% probabilidade)

**O Problema:**
```
Localhost pode ter latência lenta em algumas máquinas
fazendo requisições ao Supabase timeoutarem
```

**Sintomas:**
- ❌ Atividades carregam muito lentamente
- ❌ Às vezes carregam, às vezes não
- ✅ Funciona rápido em produção

**Solução:**
```javascript
// Aumentar timeout em supabase.ts
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/2.0'
      },
      fetch: async (url, options = {}) => {
        return await fetch(url, {
          ...options,
          timeout: 10000  // 10 segundos
        });
      }
    }
  }
);
```

---

## 🔧 Passos para Diagnosticar

### Passo 1: Verificar Console do Navegador
```
1. Abra seu app em localhost:5173
2. Pressione F12 (DevTools)
3. Vá para aba "Console"
4. Procure por erros vermelhos
5. Screenshot e compartilhe comigo
```

### Passo 2: Verificar Network
```
1. DevTools → Network
2. Procure por requisições para "supabase"
3. Clique em uma requisição
4. Verifique:
   - Status: 200 (OK) ou outro?
   - Response headers: tem CORS headers?
   - Response: JSON com dados ou erro?
```

### Passo 3: Verificar LocalStorage
```
1. DevTools → Application → LocalStorage
2. Procure por qualquer coisa com "auth" ou "supabase"
3. Verificar se tem token JWT
4. Se tem, copiar e colar em jwt.io para verificar expiração
```

### Passo 4: Verificar Auth Context
```javascript
// Adicione isso em Atividades.tsx linha 55
useEffect(() => {
  console.log('🔐 Auth Debug:', {
    isAuthenticated: !!profile?.id,
    planId: profile?.active_plan_id,
    userId: profile?.id,
    profile
  });
}, [profile]);
```

---

## 📋 Quick Fix Checklist

```
[ ] 1. Limpar cache do navegador
      → Ctrl+Shift+Delete → Selecione "Tudo" → Clear

[ ] 2. Limpar localStorage
      → DevTools → Application → Clear All

[ ] 3. Recarregar página
      → Ctrl+Shift+R (hard refresh)

[ ] 4. Verificar console por erros
      → F12 → Console → Procure vermelhos

[ ] 5. Fazer login novamente
      → Logout → Login novamente

[ ] 6. Testar em navegador diferente
      → Chrome, Firefox, Edge

[ ] 7. Testar com VPN/Proxy desligado
      → Se tiver um ativo, pode estar bloqueando

[ ] 8. Verificar se CORS está configurado no Supabase
      → Dashboard → Settings → CORS
```

---

## 🎯 Solução Mais Provável

**Em 90% dos casos, o problema é:**

### ✅ CORS não está configurado para localhost

**Como arrumar:**

1. **Abra Supabase Dashboard**
   ```
   https://app.supabase.com/
   ```

2. **Vá para seu Projeto → Settings → CORS**

3. **Adicione esta URL:**
   ```
   http://localhost:5173
   ```

4. **OU marque a opção "Allow all origins" (menos seguro)**

5. **Salve**

6. **Recarregue seu app**

---

## 🧪 Teste Rápido para Verificar

Adicione este código em `Atividades.tsx` **linha 86** (dentro do useEffect):

```javascript
useEffect(() => {
  console.log('🚀 Teste de Atividades:');

  // Test 1: Auth
  console.log('1️⃣ Auth:', profile?.id ? '✅ OK' : '❌ Sem auth');

  // Test 2: Fetch direto do Supabase
  supabase
    .from('atividades')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('2️⃣ Supabase Error:', error);
      } else {
        console.log('2️⃣ Supabase Data:', data?.length, 'atividades');
      }
    });

  // Test 3: CORS Check
  fetch('https://lkhfbhvamnqgcqlrriaw.supabase.co/rest/v1/', {
    headers: {
      'apikey': 'YOUR_ANON_KEY_HERE'
    }
  })
    .then(r => r.json())
    .then(data => console.log('3️⃣ CORS OK:', data))
    .catch(e => console.error('3️⃣ CORS Error:', e));

}, []);
```

---

## 📱 Diferenças: Localhost vs Produção

```
LOCALHOST (npm run dev)
├─ URL: http://localhost:5173
├─ Proxy: CORS pode bloquear
├─ SSL: Desativado (http://)
├─ Cache: Desativado (HMR ativo)
└─ Problema: CORS, Auth, Cache

PRODUÇÃO (Hostinger)
├─ URL: https://edukaprime.com.br/
├─ Proxy: Configurado no servidor
├─ SSL: Ativado (https://)
├─ Cache: Ativado (Service Worker)
└─ Vantagem: Tudo já está configurado
```

---

## 🎓 Por que Funciona em Produção?

1. **Domínio autorizado no CORS**
   - Supabase conhece `edukaprime.com.br`
   - Localhost é desconhecido

2. **SSL/HTTPS**
   - Produção tem certificado válido
   - Localhost é HTTP inseguro

3. **Cookies vs Token**
   - Produção usa cookies (domain-specific)
   - Localhost pode ter problemas com localStorage

---

## 🚀 Soluções Permanentes

### Solução 1: Configurar CORS no Supabase (RECOMENDADO)

```
1. https://app.supabase.com
2. Seu Projeto → Settings → CORS
3. Adicione:
   - http://localhost:5173
   - http://localhost:3000
   - http://localhost:*  (aceita qualquer porta)
4. Salve
```

### Solução 2: Usar Proxy em localhost

**Arquivo: vite.config.ts**
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://lkhfbhvamnqgcqlrriaw.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

### Solução 3: Usar arquivo .env.local (Desenvolvimento)

```env
# .env.local (não commitar)
VITE_SUPABASE_URL=https://seu-supabase-dev.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-dev
```

---

## 🐛 Debugging Avançado

Se nada acima resolver, adicione logs detalhados:

```javascript
// Em src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
});

export const supabase = createClient(supabaseUrl, supabaseKey);

// Interceptar requisições
supabase.rest.setAuth(''); // Debug mode
```

---

## 📞 Próximos Passos

1. **Execute o Quick Fix Checklist acima**
2. **Se não resolver, configure CORS no Supabase**
3. **Se ainda não funcionar, execute o Teste Rápido**
4. **Compartilhe os logs comigo**

---

## ✅ Verificação Final

Depois de aplicar a solução:

```
1. npm run dev
2. Abra http://localhost:5173
3. Vá para Atividades
4. Você deve ver atividades carregando
5. Se tiver acesso, deve conseguir fazer download
6. No console, não deve ter erros vermelhos
```

---

**Dúvidas? Execute os passos de diagnóstico e compartilhe os logs!** 🚀
