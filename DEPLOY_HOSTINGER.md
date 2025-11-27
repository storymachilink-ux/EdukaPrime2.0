# 🚀 Guia de Deploy - Hostinger

## 📋 Problema Identificado

A tela branca acontece porque **as variáveis de ambiente do Vite são embutidas no código durante o build**, não em runtime. O arquivo `.env` só funciona localmente.

## ✅ Solução Completa

### Passo 1: Verificar Variáveis de Ambiente

As variáveis estão no arquivo `.env`:
```
VITE_SUPABASE_URL=https://lkhfbhvamnqgcqlrriaw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDM4NTcsImV4cCI6MjA3NDgxOTg1N30.LpFCAgjgkNekAkXMx73e6eUppFYLC4n1BXziRzMp7xA
```

### Passo 2: Fazer Build Correto (LOCAL)

No seu computador, execute:

```bash
npm run build
```

✅ **IMPORTANTE**: O build deve ser feito **no seu computador local** onde o arquivo `.env` existe, não no servidor.

### Passo 3: Upload para Hostinger

#### Opção A: Via File Manager (Painel Hostinger)

1. Acesse o **File Manager** do painel Hostinger
2. Navegue até a pasta `public_html`
3. **DELETE** todos os arquivos antigos dentro de `public_html`
4. Faça upload de **TODO O CONTEÚDO** da pasta `dist/` para `public_html`
   - Isso inclui: `index.html`, pasta `assets/`, arquivo `.htaccess`, etc.

#### Opção B: Via FTP

1. Conecte via FTP (FileZilla, WinSCP, etc.)
   - Host: ftp.edukaprime.com.br (ou conforme painel Hostinger)
   - Usuário: seu usuário FTP
   - Senha: sua senha FTP
2. Navegue até `public_html`
3. **DELETE** todos os arquivos antigos
4. Faça upload de **TODO O CONTEÚDO** da pasta `dist/`

### Passo 4: Verificar Estrutura no Servidor

Após upload, a estrutura em `public_html` deve estar assim:

```
public_html/
├── index.html
├── .htaccess
├── favicon.ico
├── assets/
│   ├── index-C8tSA6DL.js
│   ├── index-Z2cdsoFs.css
│   └── ... (outros arquivos)
└── img/ (se existir)
```

### Passo 5: Verificar .htaccess

O arquivo `.htaccess` já está correto na pasta `public/` e será copiado para `dist/` durante o build. Ele contém:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

Isso garante que todas as rotas do React Router funcionem corretamente.

### Passo 6: Limpar Cache e Testar

1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Ou use modo anônimo (Ctrl + Shift + N)
3. Acesse: https://edukaprime.com.br/
4. O site deve carregar corretamente

## 🔍 Verificação de Problemas

### Se ainda aparecer tela branca:

#### 1. Verificar Console do Navegador
- Pressione F12 no navegador
- Vá na aba **Console**
- Procure por erros em vermelho
- Tire screenshot e analise

#### 2. Verificar Aba Network
- Pressione F12 → Aba **Network**
- Recarregue a página (F5)
- Veja se `index.html` carrega (deve retornar status 200)
- Veja se arquivos em `/assets/` carregam corretamente

#### 3. Verificar se Build Incluiu Variáveis
Abra o arquivo `dist/assets/index-C8tSA6DL.js` (o nome pode variar) e procure por:
- `lkhfbhvamnqgcqlrriaw.supabase.co`

Se você **NÃO** encontrar essa URL no arquivo JS compilado, significa que o build não incluiu as variáveis de ambiente.

### Solução se variáveis não foram incluídas:

1. Verifique se o arquivo `.env` está na **raiz do projeto** (mesmo nível que `package.json`)
2. Verifique se as variáveis começam com `VITE_` (obrigatório para Vite)
3. Rode novamente: `npm run build`
4. Faça upload novamente para Hostinger

## 📝 Checklist Final

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] Variáveis começam com `VITE_`
- [ ] Executou `npm run build` localmente
- [ ] Verificou que pasta `dist/` foi criada
- [ ] Deletou arquivos antigos em `public_html`
- [ ] Fez upload de **TODO** conteúdo de `dist/` para `public_html`
- [ ] Arquivo `.htaccess` existe em `public_html`
- [ ] Limpou cache do navegador
- [ ] Testou em modo anônimo

## 🆘 Suporte Adicional

Se o problema persistir, forneça:
1. Screenshot do console do navegador (F12 → Console)
2. Screenshot da estrutura de arquivos em `public_html` (File Manager)
3. Conteúdo das primeiras linhas de `public_html/index.html`

## 🎯 Comando Rápido para Build + Verificação

```bash
# Build
npm run build

# Verificar se variáveis foram incluídas (Windows PowerShell)
Select-String -Path "dist/assets/*.js" -Pattern "lkhfbhvamnqgcqlrriaw"

# Verificar se variáveis foram incluídas (Windows CMD)
findstr /S "lkhfbhvamnqgcqlrriaw" dist\assets\*.js

# Se retornar resultado, as variáveis FORAM incluídas ✅
# Se NÃO retornar nada, as variáveis NÃO foram incluídas ❌
```

---

**Criado**: 2025-10-13
**Projeto**: EdukaPrime - Pequenos Artistas
**Hospedagem**: Hostinger
