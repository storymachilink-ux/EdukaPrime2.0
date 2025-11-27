# 🚀 Deploy Manual das Functions no Netlify

## ⚠️ SITUAÇÃO ATUAL

- ✅ Functions criadas localmente (webhook-amplopay.js, webhook-test.js, package.json)
- ✅ Commit feito localmente
- ❌ Repositório não conectado (sem remote)
- ❌ Não é possível fazer `git push`

---

## 🔍 PASSO 1: Descobrir Como Está Deployado

1. Acesse: https://app.netlify.com
2. Entre no projeto **edukaprime.com.br**
3. Vá em: **Site settings → Build & deploy → Continuous deployment**

**O que você vê em "Repository"?**

### Opção A: Aparece um link do GitHub/GitLab
Exemplo: `github.com/seu-usuario/edukaprime`

✅ **Tem repositório!**
- Copie o link completo
- Me envie aqui
- Vou configurar o remote e fazer push

### Opção B: Aparece "Netlify Drop" ou "Manual deploys"
❌ **Sem repositório Git**
- Significa que você faz upload manual
- Precisa fazer novo upload com as functions

---

## 📤 SOLUÇÃO A: Se Tem Repositório GitHub/GitLab

**Me envie o link do repositório que aparece no Netlify.**

Exemplo:
```
https://github.com/edukaprime/site
```

Depois eu configuro e faço push automaticamente.

---

## 📤 SOLUÇÃO B: Se Usa Netlify Drop (Upload Manual)

### IMPORTANTE: Fazer build antes

1. **Instalar dependências (se ainda não fez):**
```bash
cd "C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project"
npm install
```

2. **Fazer build do projeto:**
```bash
npm run build
```

3. **Copiar functions para a pasta dist:**
```bash
xcopy /E /I /Y netlify\functions dist\netlify\functions
xcopy /Y netlify.toml dist\
```

4. **Upload no Netlify:**
   - Acesse: https://app.netlify.com
   - Vá em: **Deploys**
   - Arraste a pasta `dist` para a área de upload
   - Aguarde deploy completar

---

## 📤 SOLUÇÃO C: Conectar Repositório Novo (Recomendado)

Se você tem conta no GitHub:

### 1. Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `edukaprime-saas`
3. **Privado** ✅
4. **NÃO** marcar "Initialize with README"
5. Clique em: **Create repository**

### 2. Copiar a URL que aparecer

Exemplo:
```
https://github.com/seu-usuario/edukaprime-saas.git
```

### 3. Me envie essa URL

Vou configurar e fazer push.

---

## 🎯 ATALHO RÁPIDO

**Execute e me envie o resultado:**

1. Acesse: https://app.netlify.com
2. Entre no projeto
3. Vá em: **Site settings → Build & deploy**
4. **Tire print da tela toda**
5. Me envie

Isso vai me mostrar:
- ✅ Se tem repositório conectado
- ✅ Qual o link do repositório
- ✅ Tipo de deploy (Git/Drop)

---

## 📋 PERGUNTAS PARA VOCÊ:

**Por favor responda:**

1. **Você usa GitHub, GitLab ou Bitbucket?** (Sim/Não/Qual?)

2. **No Netlify, em "Site settings → Build & deploy", o que aparece em "Repository"?**
   - Nome do repositório? (ex: github.com/user/repo)
   - Ou "Manual deploys"?

3. **Você quer:**
   - **A)** Conectar a um repositório Git (recomendado - deploy automático)
   - **B)** Continuar com upload manual (mais trabalhoso)

---

**Aguardando sua resposta para continuar!** 🚀
