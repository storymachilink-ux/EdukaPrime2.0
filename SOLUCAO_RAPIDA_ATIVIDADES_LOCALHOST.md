# ⚡ Solução Rápida: Atividades em Localhost

**Versão Rápida**: Não quer ler tudo? Siga isto!

---

## 🎯 Solução em 5 Passos

### Passo 1: Verifique o Console
```
1. Abra seu app em http://localhost:5173
2. Pressione F12 (abre DevTools)
3. Vá para aba "Console"
4. Procure por erros vermelhos relacionados a "CORS" ou "supabase"
5. Se tiver erro CORS → Solução é aquela abaixo
```

### Passo 2: Limpar Cache
```
1. Abra DevTools (F12)
2. Vá para Application → LocalStorage
3. Procure por "supabase" e delete tudo
4. Pressione Ctrl+Shift+Delete
5. Selecione "All Time" e "Clear"
6. Recarregue a página (Ctrl+R)
```

### Passo 3: Configurar CORS (SE TIVER ERRO CORS)
```
1. Abra: https://app.supabase.com
2. Selecione seu projeto
3. Vá para: Settings → CORS
4. Adicione: http://localhost:5173
5. Clique Save
6. Volte para http://localhost:5173
7. Recarregue a página (Ctrl+Shift+R)
```

### Passo 4: Verificar Autenticação
```
1. Abra DevTools (F12)
2. Vá para Application → LocalStorage
3. Procure por: sb-lkhfbhvamnqgcqlrriaw-auth-token
4. Se não encontrar → Faça login novamente
5. Se encontrar → Copie o valor e cole em jwt.io
6. Verifique se não está expirado
```

### Passo 5: Testar Atividades
```
1. Abra http://localhost:5173
2. Vá para Atividades
3. Deverá carregar a lista
4. Se estiver vazio → Seu plano não tem acesso
5. Se tiver acesso → Deverá ver atividades
```

---

## ✅ Esperado Após Solução

```
✅ Console não tem erros CORS
✅ Atividades carregam rapidamente
✅ Consegue ver lista de atividades
✅ Consegue fazer download (se tiver acesso ao plano)
✅ Funciona igual à produção
```

---

## ❌ Se Ainda Não Funcionar

### Problema: CORS Error
```
Erro: "Access to XMLHttpRequest has been blocked by CORS policy"

Solução:
1. Vá para https://app.supabase.com
2. Settings → CORS
3. Adicione: http://localhost:5173
4. Salve e recarregue
```

### Problema: Atividades Vazias
```
Erro: Carrega mas não mostra atividades

Causas possíveis:
1. Seu plano não tem acesso (normal se plano = 0 ou demo)
2. Nenhuma atividade foi criada ainda
3. active_plan_id está undefined

Verificação:
- Faça login com usuário que tem plano Premium
- Vá para Atividades
- Deverá ver atividades para esse plano
```

### Problema: Erro de Autenticação
```
Erro: "user is not authenticated"

Solução:
1. Deslogue (clique em Sair)
2. Abra DevTools → Application → Clear All
3. Limpe cookies e localStorage
4. Recarregue
5. Faça login novamente
```

### Problema: Timeout (Carrega Muito Lento)
```
Erro: "Connection timeout" ou carregando 5+ segundos

Solução:
1. Verifique sua conexão de internet
2. Feche abas/programas que usam muita banda
3. Se persistir, use:
   npm run dev -- --no-hmr
```

---

## 🧪 Teste Rápido no Console

Abra DevTools (F12) → Console → Cole isto:

```javascript
// Teste de autenticação
fetch('https://lkhfbhvamnqgcqlrriaw.supabase.co/auth/v1/user', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('sb-lkhfbhvamnqgcqlrriaw-auth-token')?.split('"')[1]
  }
})
  .then(r => r.json())
  .then(d => console.log('Auth Status:', d))
  .catch(e => console.error('Auth Error:', e));
```

Se retornar seus dados de usuário → Autenticação OK ✅

---

## 🚀 Commands Úteis

```bash
# Limpar cache e rodar fresh
rm -rf node_modules/.vite .next
npm run dev

# Rodar sem HMR (se tiver problemas)
npm run dev -- --no-hmr

# Rodar com debug
DEBUG=* npm run dev

# Build para testar produção em local
npm run build
npm run preview
```

---

## 📱 Diferença: Localhost vs Produção

| Item | Localhost | Produção |
|------|-----------|----------|
| URL | http://localhost:5173 | https://seu-site.com |
| CORS | Pode bloquear | Configurado |
| SSL | Desativado | Ativado |
| Cache | Desativado | Ativado |
| Problema Comum | CORS | Raramente |

---

## 🎯 Resumo

1. ✅ **Limpar cache** (passo 2)
2. ✅ **Verificar console** (passo 1)
3. ✅ **Configurar CORS** (passo 3)
4. ✅ **Fazer login novamente** (passo 4)
5. ✅ **Testar** (passo 5)

**Em 95% dos casos, isto resolve!**

---

Se nada funcionar → Veja **DIAGNOSTICO_ATIVIDADES_LOCALHOST.md** para debugging avançado.
