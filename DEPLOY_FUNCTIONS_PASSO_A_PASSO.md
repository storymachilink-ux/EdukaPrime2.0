# 🚀 Deploy de Functions no Netlify - Passo a Passo

## 🔍 PROBLEMA IDENTIFICADO

- ✅ `netlify.toml` está correto
- ❌ Functions não aparecem no painel do Netlify
- ❌ URL retorna tela em branco

**Causa:** Functions não foram enviadas ou Netlify não as reconheceu.

---

## ✅ SOLUÇÃO (Passo a Passo)

### **PASSO 1: Verificar arquivos localmente**

No terminal/cmd, execute:

```bash
cd "C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project"
dir netlify\functions
```

**Deve mostrar:**
```
webhook-amplopay.js
webhook-test.js
package.json
```

✅ Se aparecer os 3 arquivos → Continue para PASSO 2
❌ Se faltar algum → Me avise qual está faltando

---

### **PASSO 2: Verificar se está no Git**

```bash
git status
```

**Você deve ver:**
```
modified:   netlify/functions/webhook-amplopay.js
Untracked files:
  netlify/functions/webhook-test.js
  netlify/functions/package.json
```

Se aparecer `netlify/functions/` em vermelho ou "untracked", faça:

```bash
git add netlify/functions/
git status
```

Agora deve aparecer em verde.

---

### **PASSO 3: Commit e Push**

```bash
git add .
git commit -m "Deploy: Adicionar Netlify Functions"
git push origin main
```

**Importante:** Se der erro de push, execute:
```bash
git pull origin main
git push origin main
```

---

### **PASSO 4: Aguardar Deploy no Netlify**

1. Acesse: https://app.netlify.com
2. Entre no projeto **edukaprime.com.br**
3. Vá em: **Deploys**
4. Você verá um deploy em andamento (amarelo/animado)

**Aguarde até ficar:**
- ✅ Verde com "Published" → Sucesso!
- ❌ Vermelho com "Failed" → Erro (veja PASSO 5)

**Tempo estimado:** 2-4 minutos

---

### **PASSO 5: Se o Deploy Falhar (vermelho)**

1. Clique no deploy com erro
2. Clique em: **Deploy log**
3. **Procure por linhas em vermelho** no final do log
4. **Tire print do erro completo**
5. Me envie

**Erros comuns:**

#### Erro: "Build script returned non-zero exit code: 1"
Ignore - esse erro é do frontend, não afeta as functions.
Functions deployam separadamente.

#### Erro: "Failed to install dependencies in netlify/functions"
**Solução:** O `package.json` pode estar com formato errado.
Me envie o erro completo.

---

### **PASSO 6: Verificar se Functions Apareceram**

Depois do deploy verde:

1. No Netlify, clique em: **Functions**
2. **Tire print da tela toda**
3. Me envie

**Deve aparecer:**
- `webhook-amplopay` (verde/ativo)
- `webhook-test` (verde/ativo)

---

### **PASSO 7: Testar as Functions**

#### Teste 1:
Abra no navegador:
```
https://edukaprime.com.br/.netlify/functions/webhook-test
```

**Deve retornar JSON:**
```json
{"success":true,"message":"Função Netlify funcionando!"}
```

#### Teste 2:
Abra no navegador:
```
https://edukaprime.com.br/.netlify/functions/webhook-amplopay
```

**Deve retornar JSON:**
```json
{"error":"Method not allowed"}
```

---

## 🔧 ALTERNATIVA: Verificar Build Settings

Se as functions ainda não aparecerem:

1. Netlify: **Site settings → Build & deploy → Build settings**
2. Verifique:
   - **Functions directory:** `netlify/functions`

Se estiver vazio ou diferente:
3. Clique em **Edit settings**
4. Em **Functions directory**, coloque: `netlify/functions`
5. Clique em **Save**
6. Vá em **Deploys → Trigger deploy → Deploy site**

---

## 📋 CHECKLIST - Me envie:

Execute e me envie os resultados:

### ✅ Checklist:

- [ ] **PASSO 1:** `dir netlify\functions` mostra os 3 arquivos?
- [ ] **PASSO 2:** `git status` mostra os arquivos?
- [ ] **PASSO 3:** `git push` funcionou sem erros?
- [ ] **PASSO 4:** Deploy ficou verde?
- [ ] **PASSO 6:** Functions aparecem no painel? (ENVIE PRINT)
- [ ] **PASSO 7:** URLs retornam JSON? (COLE AQUI O QUE APARECE)

---

## 🚨 ATALHO RÁPIDO SE ESTIVER COM PRESSA:

Execute tudo de uma vez:

```bash
cd "C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project"
git add netlify/functions/
git commit -m "Add Netlify Functions"
git push origin main
```

Depois:
1. Aguarde 3 minutos
2. Abra: `https://edukaprime.com.br/.netlify/functions/webhook-test`
3. Me diga o que aparece

---

**Execute os passos e me envie os resultados!** 🚀
