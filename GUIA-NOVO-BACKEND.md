# 🚀 Guia Completo: Novo Backend EdukaPrime

## 📋 Índice
1. [O que você tem agora](#o-que-você-tem-agora)
2. [Opções de Backend](#opções-de-backend)
3. [Recomendação: Firebase](#recomendação-firebase)
4. [Passo a Passo com Firebase](#passo-a-passo-com-firebase)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Próximos Passos](#próximos-passos)

---

## 🎯 O que você tem agora

### ✅ Landing Page (Pronta!)
- **Local:** `landing-page/`
- **Status:** Funcional, sem dependências de backend
- **Deploy:** Vercel ou Netlify
- **URL sugerida:** `www.edukaprime.com`

### 🔨 Aplicação Interna (A criar)
- **Status:** Precisa ser reconstruída do zero
- **URL sugerida:** `app.edukaprime.com`

---

## 🎨 Opções de Backend

### 1️⃣ Firebase (⭐ RECOMENDADO)
**Por quê escolher:**
- ✅ **Grátis** para começar (até 50k reads/dia)
- ✅ **Fácil** de usar (sem programação backend)
- ✅ **Rápido** de configurar (1-2 horas)
- ✅ **Autenticação pronta** (Google, Email, etc)
- ✅ **Banco de dados em tempo real**
- ✅ **Hospedagem inclusa**
- ✅ **Documentação em português**

**Contra:**
- ⚠️ Vendor lock-in (fica preso ao Google)
- ⚠️ Custos podem subir com muitos usuários

---

### 2️⃣ Supabase (Alternativa)
**Por quê escolher:**
- ✅ Similar ao Firebase
- ✅ **Open source** (pode hospedar você mesmo)
- ✅ Usa PostgreSQL (banco SQL familiar)
- ✅ Grátis para começar

**Contra:**
- ⚠️ Documentação menos completa
- ⚠️ Menor comunidade
- ⚠️ Você já teve problemas com ele 😅

---

### 3️⃣ Backend Próprio (Node.js + MongoDB)
**Por quê escolher:**
- ✅ Controle total
- ✅ Sem limites de vendor
- ✅ Flexibilidade máxima

**Contra:**
- ⚠️ **Precisa programar backend**
- ⚠️ Precisa gerenciar servidor
- ⚠️ Mais tempo para desenvolver (1-2 semanas)
- ⚠️ Custos de hospedagem

---

## 🏆 Recomendação: Firebase

Para você que não programa, **Firebase é a melhor escolha!**

---

## 📝 Passo a Passo com Firebase

### **FASE 1: Configuração Inicial (30 min)**

#### 1. Criar Projeto Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: **EdukaPrime**
4. Desabilite Google Analytics (não precisa agora)
5. Clique em **"Criar projeto"**

#### 2. Ativar Autenticação
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Ative os seguintes métodos:
   - ✅ **E-mail/Senha**
   - ✅ **Google** (para login social)
4. Copie suas credenciais (vamos usar depois)

#### 3. Criar Banco de Dados (Firestore)
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Modo de teste"** (vamos configurar segurança depois)
4. Escolha localização: **southamerica-east1** (São Paulo)
5. Clique em **"Ativar"**

#### 4. Configurar Storage (Arquivos)
1. No menu lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Aceite as regras padrão
4. Clique em **"Concluído"**

---

### **FASE 2: Estrutura do Banco de Dados**

No Firestore, crie as seguintes coleções:

#### 📁 Coleção: `users`
```
users/
  └─ {userId}/
      ├─ email: string
      ├─ nome: string
      ├─ plano_ativo: number (0, 1, 2, 3)
      ├─ data_ativacao: timestamp
      ├─ is_admin: boolean
      └─ created_at: timestamp
```

#### 📁 Coleção: `atividades`
```
atividades/
  └─ {atividadeId}/
      ├─ title: string
      ├─ age_range: string
      ├─ description: string
      ├─ image: string (URL)
      ├─ category: string
      ├─ drive_url: string
      ├─ available_for_plans: array [1, 2, 3]
      └─ created_at: timestamp
```

#### 📁 Coleção: `videos`
```
videos/
  └─ {videoId}/
      ├─ title: string
      ├─ description: string
      ├─ youtube_url: string
      ├─ thumbnail: string
      ├─ category: string
      ├─ available_for_plans: array [1, 2, 3]
      └─ created_at: timestamp
```

#### 📁 Coleção: `bonus`
```
bonus/
  └─ {bonusId}/
      ├─ title: string
      ├─ description: string
      ├─ drive_url: string
      ├─ category: string
      ├─ available_for_plans: array [1, 2, 3]
      └─ created_at: timestamp
```

---

### **FASE 3: Criar Aplicação React**

#### 1. Criar novo projeto
```bash
cd "C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project"
npm create vite@latest edukaprime-app -- --template react-ts
cd edukaprime-app
npm install
```

#### 2. Instalar Firebase
```bash
npm install firebase
npm install react-router-dom
npm install lucide-react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3. Configurar Firebase

Crie o arquivo `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefgh"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**⚠️ IMPORTANTE:**
- Pegue suas credenciais em: **Firebase Console > Configurações do Projeto > Seus Apps**
- Clique no ícone `</>` para criar um app web
- Copie o `firebaseConfig` e cole no arquivo acima

---

### **FASE 4: Implementar Autenticação**

Crie o arquivo `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  email: string;
  nome: string;
  plano_ativo: number;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setProfile(docSnap.data() as UserProfile);
    }
  };

  // Listener de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login com email/senha
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Cadastro
  const signUp = async (email: string, password: string, nome: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Criar perfil no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      nome,
      plano_ativo: 0,
      is_admin: false,
      created_at: new Date()
    });
  };

  // Login com Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    // Verificar se perfil já existe
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Criar perfil se não existir
      await setDoc(docRef, {
        email: user.email,
        nome: user.displayName || 'Usuário',
        plano_ativo: 0,
        is_admin: false,
        created_at: new Date()
      });
    }
  };

  // Logout
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

---

### **FASE 5: Regras de Segurança do Firestore**

No Firebase Console > Firestore > Regras, substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuários podem ler apenas seu próprio perfil
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;

      // Admins podem ler/escrever tudo
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }

    // Atividades: todos autenticados podem ler
    match /atividades/{atividadeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }

    // Vídeos: todos autenticados podem ler
    match /videos/{videoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }

    // Bonus: todos autenticados podem ler
    match /bonus/{bonusId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
  }
}
```

---

## 🎨 Estrutura do Projeto

```
edukaprime-app/
├── src/
│   ├── components/
│   │   ├── auth/           # LoginModal, SignUpModal
│   │   ├── dashboard/      # Componentes do dashboard
│   │   └── ui/             # Componentes reutilizáveis
│   ├── contexts/
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── lib/
│   │   └── firebase.ts     # Configuração do Firebase
│   ├── pages/
│   │   ├── Login.tsx       # Página de login
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   └── Atividades.tsx  # Página de atividades
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

---

## 🚀 Próximos Passos

### 1️⃣ Testar Landing Page
```bash
cd landing-page
npm install
npm run dev
```

### 2️⃣ Deploy Landing Page
```bash
npm run build
vercel
# OU
netlify deploy
```

### 3️⃣ Criar Backend Firebase
- Siga as instruções da **FASE 1** e **FASE 2**

### 4️⃣ Criar Aplicação React
- Siga as instruções da **FASE 3**, **FASE 4** e **FASE 5**

### 5️⃣ Integrar Pagamento (AmloPay)
- Criar endpoint de webhook
- Atualizar `plano_ativo` no Firestore quando pagamento confirmado

---

## 💰 Custos Estimados

### Firebase (Plano Grátis)
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 5 GB de armazenamento
- ✅ 1 GB de transferência/dia

**Suficiente para ~500 usuários ativos/dia**

### Quando pagar?
- Firebase Blaze (paga por uso): ~R$ 50-200/mês com 2-5k usuários
- Vercel/Netlify: Grátis para landing page
- Domínio: ~R$ 40/ano

---

## 📞 Suporte

Se tiver dúvidas:
1. Documentação Firebase: [firebase.google.com/docs](https://firebase.google.com/docs)
2. Vídeos no YouTube: "Firebase React Tutorial"
3. ChatGPT/Claude: "Como fazer X no Firebase?"

---

## ✅ Checklist Final

- [ ] Landing page rodando local
- [ ] Landing page com deploy
- [ ] Projeto Firebase criado
- [ ] Autenticação configurada
- [ ] Firestore estruturado
- [ ] App React criado
- [ ] Firebase integrado
- [ ] Login funcionando
- [ ] Dashboard básico
- [ ] Regras de segurança configuradas
- [ ] Primeiro usuário admin criado
- [ ] Integração AmloPay (webhooks)

---

**BOA SORTE! 🚀**