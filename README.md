# 🎓 EdukaPrime - Landing Page

Landing Page oficial da plataforma EdukaPrime.

## 📦 O que foi feito

Este projeto foi **simplificado** e agora contém **APENAS a landing page**:
- ✅ Página inicial pública
- ✅ Seções: Hero, Benefícios, Educadores, Planos, FAQ
- ✅ Sem dependências de backend
- ✅ Sem Supabase, sem autenticação complexa

## 🗂️ Arquivos importantes salvos

- **`TEXTOS-AREAS-INTERNAS.txt`** - Todos os textos das áreas internas (Dashboard, Atividades, Vídeos, Bônus, Suporte, Config)
- **`GUIA-NOVO-BACKEND.md`** - Guia completo para criar backend com Firebase/Supabase
- **`COMECAR-AQUI.md`** - Guia rápido de primeiros passos
- **`RESUMO-EXECUTIVO.md`** - Visão geral do projeto

## 🚀 Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## 🏗️ Build para produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## 🌐 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

Ou arraste a pasta `dist` para o site do Vercel/Netlify.

## ⚙️ Configurando redirecionamento

No arquivo `src/App.tsx`, linha 13, altere a URL para sua aplicação interna:

```typescript
const handleLoginClick = () => {
  window.location.href = 'https://app.edukaprime.com'; // ← Altere aqui
};
```

## 📁 Estrutura

```
project/
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── sections/      # Hero, Planos, FAQ, etc
│   │   └── ui/            # Componentes reutilizáveis
│   ├── App.tsx            # ← Altere URL do login aqui
│   └── main.tsx
├── public/                # Imagens e assets
├── TEXTOS-AREAS-INTERNAS.txt  # 📝 Textos salvos
├── GUIA-NOVO-BACKEND.md       # 📖 Guia Supabase/Firebase
└── package.json
```

## 🔗 Próximos passos

1. Deploy da landing page (Vercel/Netlify)
2. Criar nova aplicação interna com Supabase
3. Usar `TEXTOS-AREAS-INTERNAS.txt` como referência
4. Seguir `GUIA-NOVO-BACKEND.md` para estrutura

## 📞 Suporte

- E-mail: storymachilink@gmail.com
- Telefone: (67) 99309-1209