ETAPA 3: INTEGRAR WEBHOOK REPROCESSOR - SEU DASHBOARD ESPECÍFICO
===============================================================

Seu arquivo AdminDashboard.tsx JÁ TEM um sistema de abas!

Estrutura atual:
- activeTab = 'dashboard' | 'integractions' | 'webhooks' | 'metricas'
- Já existe: WebhooksDashboard (linha 880)

Vamos ADICIONAR WebhookReprocessor à aba "webhooks" existente

---

PASSO 1: Abrir o arquivo
=======================

Arquivo: src/pages/admin/AdminDashboard.tsx

Abra no seu editor (VS Code, etc)

---

PASSO 2: Adicionar o IMPORT
============================

Procure pela linha 6 onde estão os imports:

import { WebhooksDashboard } from '../../components/admin/WebhooksDashboard';
import { IntegrationsDashboard } from '../../components/admin/IntegrationsDashboard';
import { FinancialMetricsDashboard } from '../../components/admin/FinancialMetricsDashboard';

ADICIONE DEPOIS:

import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

Ficará assim:

import { WebhooksDashboard } from '../../components/admin/WebhooksDashboard';
import { IntegrationsDashboard } from '../../components/admin/IntegrationsDashboard';
import { FinancialMetricsDashboard } from '../../components/admin/FinancialMetricsDashboard';
import WebhookReprocessor from '../../components/admin/WebhookReprocessor';

---

PASSO 3: Procurar onde renderiza a aba "webhooks"
=================================================

Procure por:

{activeTab === 'webhooks' && (
  <WebhooksDashboard />
)}

Você encontrará perto da LINHA 879-880

---

PASSO 4: Adicionar WebhookReprocessor à aba
============================================

MUDE:

{activeTab === 'webhooks' && (
  <WebhooksDashboard />
)}

PARA:

{activeTab === 'webhooks' && (
  <div className="space-y-8">
    <WebhooksDashboard />
    <div className="border-t pt-8 mt-8">
      <h2 className="text-2xl font-bold mb-6">Reprocessamento de Webhooks</h2>
      <WebhookReprocessor />
    </div>
  </div>
)}

---

PASSO 5: Salvar
===============

Ctrl + S (Windows) ou Cmd + S (Mac)

O arquivo irá compilar automaticamente

---

PASSO 6: Testar
===============

1. Abra seu admin no navegador
2. Vá até a ABA "🔔 Webhooks"
3. Role para baixo
4. Você verá a seção "Reprocessamento de Webhooks"
5. Se aparecer "Nenhum webhook pendente" = FUNCIONANDO!

---

VALIDAÇÃO FINAL
===============

Checklist:

✅ Arquivo AdminDashboard.tsx salvo
✅ Import adicionado (linha ~7)
✅ Componente renderizado na aba webhooks
✅ Console do navegador sem erros (F12)
✅ Botões "Reprocessar", "Editar", "Deletar" visíveis
✅ Hard refresh (Ctrl + Shift + R) mostra componente

---

PRÓXIMO PASSO: ETAPA 4 - TESTES
================================

Depois de salvar, execute os 3 testes em:
WEBHOOK_REPROCESSING_IMPLEMENTATION.md

Sucesso! ✅
