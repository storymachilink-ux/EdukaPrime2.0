ETAPA 3: INTEGRAR WEBHOOK REPROCESSOR NO DASHBOARD ADMIN
=========================================================

PASSO 1: Localizar o arquivo de Dashboard Admin
===============================================

Seu dashboard admin está provavelmente aqui:

Opção A (Mais comum):
Arquivo: src/pages/admin/AdminDashboard.tsx

Opção B (Se não existir):
Arquivo: src/pages/admin/index.tsx

Opção C (Procure por):
- src/pages/admin/GestaoUsuarios.tsx
- src/pages/admin/AdminPlanosManager.tsx
- src/pages/admin/GestaoNotificacoes.tsx

Qualquer um destes pode servir como "Dashboard Admin"

ABRA o arquivo principal (AdminDashboard.tsx ou equivalente)

---

PASSO 2: Verificar se tem sistema de ABAS
==========================================

Procure por código assim no arquivo que abriu:

const [activeTab, setActiveTab] = useState<'usuarios' | 'planos' | 'notificacoes'>(...)

OU

const [tab, setTab] = useState(...)

OU

<button onClick={() => setActiveTab('usuarios')}>...</button>

SE ENCONTRAR: Passe para PASSO 3A
SE NÃO ENCONTRAR: Passe para PASSO 3B

---

PASSO 3A: Adicionar ABA (Se o Dashboard já tem abas)
====================================================

Exemplo do seu código atual (em AdminDashboard.tsx):

const [activeTab, setActiveTab] = useState<'usuarios' | 'planos' | 'webhooks'>('usuarios')

MUDE PARA:

const [activeTab, setActiveTab] = useState<'usuarios' | 'planos' | 'webhooks' | 'reprocessamento'>('usuarios')

---

Procure pelo local onde tem os botões de ABA (tipo isso):

<button onClick={() => setActiveTab('usuarios')}>
  👥 Usuários
</button>
<button onClick={() => setActiveTab('planos')}>
  📋 Planos
</button>

ADICIONE DEPOIS:

<button onClick={() => setActiveTab('reprocessamento')}>
  🔄 Webhooks
</button>

---

Procure por onde renderiza o conteúdo (tipo isso):

{activeTab === 'usuarios' && (
  <GestaoUsuarios />
)}

{activeTab === 'planos' && (
  <AdminPlanosManager />
)}

ADICIONE DEPOIS:

{activeTab === 'reprocessamento' && (
  <WebhookReprocessor />
)}

---

PASSO 3B: Criar um Dashboard se não existir (Alternativa)
=========================================================

Se seu AdminDashboard não tem sistema de abas, crie um novo arquivo:

Arquivo: src/pages/admin/WebhookDashboard.tsx

Conteúdo:

import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

export default function WebhookDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Webhooks</h1>
      <WebhookReprocessor />
    </div>
  );
}

Depois, no seu App.tsx ou roteador principal, adicione:

import WebhookDashboard from './pages/admin/WebhookDashboard';

E adicione a rota:

<Route path="/admin/webhooks" element={<WebhookDashboard />} />

---

PASSO 4: Adicionar o IMPORT no arquivo principal
=================================================

No TOPO do arquivo AdminDashboard.tsx (ou qual você está editando):

Procure pelos outros imports (tipo isso):

import GestaoUsuarios from '../admin/GestaoUsuarios';
import AdminPlanosManager from '../admin/AdminPlanosManager';

ADICIONE:

import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

---

PASSO 5: Salvar o arquivo
==========================

Ctrl + S (Windows) ou Cmd + S (Mac)

Depois aguarde o arquivo compilar (verá mensagem no console ou IDE)

---

PASSO 6: Testar no navegador
=============================

1. Abra seu painel admin no navegador
2. Procure pela ABA "🔄 Webhooks" (ou acesse /admin/webhooks)
3. Você deve ver a tela de Webhook Reprocessor
4. Se aparecer "Nenhum webhook pendente" = FUNCIONANDO!

---

EXEMPLO COMPLETO (Para AdminDashboard.tsx)
==========================================

import { useState } from 'react';
import GestaoUsuarios from './GestaoUsuarios';
import AdminPlanosManager from './AdminPlanosManager';
import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'planos' | 'webhooks' | 'reprocessamento'>('usuarios');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 ${activeTab === 'usuarios' ? 'border-b-2 border-blue-500' : ''}`}
        >
          👥 Usuários
        </button>
        <button
          onClick={() => setActiveTab('planos')}
          className={`px-4 py-2 ${activeTab === 'planos' ? 'border-b-2 border-blue-500' : ''}`}
        >
          📋 Planos
        </button>
        <button
          onClick={() => setActiveTab('reprocessamento')}
          className={`px-4 py-2 ${activeTab === 'reprocessamento' ? 'border-b-2 border-blue-500' : ''}`}
        >
          🔄 Webhooks
        </button>
      </div>

      {activeTab === 'usuarios' && (
        <GestaoUsuarios />
      )}

      {activeTab === 'planos' && (
        <AdminPlanosManager />
      )}

      {activeTab === 'reprocessamento' && (
        <WebhookReprocessor />
      )}
    </div>
  );
}

---

DÚVIDAS COMUNS
==============

P: Não acho o arquivo AdminDashboard.tsx
R: Procure em src/pages/admin/ por qualquer arquivo que tenha "Dashboard" ou "Admin" no nome

P: Meu dashboard não tem abas
R: Use PASSO 3B - crie um novo arquivo e integre no roteador

P: Errro: "Cannot find module WebhookReprocessor"
R: Verifique se:
   1. Arquivo existe em: src/components/admin/WebhookReprocessor.tsx
   2. O import está correto: import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

P: Componente não aparece
R:
   1. Verifique se a ABA é ativada ao clicar
   2. Verifique browser console (F12) por erros
   3. Fça hard refresh (Ctrl + Shift + R)

---

VALIDAÇÃO FINAL
===============

Após terminar, procure por:

✅ ABA "Webhooks" ou "🔄" visível no admin
✅ Ao clicar, mostra componente WebhookReprocessor
✅ Mensagem "Nenhum webhook pendente" ou lista de webhooks
✅ Botões "Reprocessar", "Editar", "Deletar" funcionam
✅ Console do navegador sem erros vermelhos
