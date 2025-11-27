# 🎓 EdukaPrime - Landing Page

Landing Page oficial da plataforma EdukaPrime.

## 📦 Instalação

```bash
npm install
```

## 🚀 Rodando Localmente

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## 🌐 Deploy

### Vercel (Recomendado)

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Instale o CLI: `npm i -g vercel`
3. Execute: `vercel`
4. Siga as instruções

### Netlify

1. Crie uma conta em [netlify.com](https://netlify.com)
2. Arraste a pasta `dist` para o site
3. Ou use o CLI: `npm i -g netlify-cli && netlify deploy`

### Configuração

No arquivo `src/App.tsx`, altere a URL de redirecionamento do login:

```typescript
const handleLoginClick = () => {
  window.location.href = 'https://app.edukaprime.com'; // ← Altere aqui
};
```

## 📁 Estrutura

```
landing-page/
├── src/
│   ├── components/
│   │   ├── layout/      # Header, Footer
│   │   ├── sections/    # Hero, Planos, FAQ, etc
│   │   └── ui/          # Componentes reutilizáveis
│   ├── App.tsx          # ← Altere URL do login aqui
│   └── main.tsx
├── public/              # Imagens e assets
└── package.json
```

## 🔗 Próximos Passos

Após fazer o deploy da Landing Page:

1. Configure um domínio customizado (ex: `edukaprime.com`)
2. Crie a aplicação interna em um novo projeto
3. Configure o domínio da app (ex: `app.edukaprime.com`)
4. Atualize a URL no `App.tsx`