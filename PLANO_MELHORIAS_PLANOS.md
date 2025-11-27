# 📋 PLANO DE MELHORIAS: Gerenciar Planos + Job de Expiração

## PARTE 1: ANÁLISE DE PROBLEMAS ATUAIS

### Interface: "Gerenciar Planos" (Lista de planos)
**Problemas:**
- ❌ Formulário de criar plano toma muito espaço na tela
- ❌ Campos de payment_type (único/mensal) não mostram claramente diferença
- ❌ Duration_days é confuso: "Optional" mas essencial para planos mensais
- ❌ IDs de gateway misturados com campos principais
- ❌ Sem feedback visual sobre: vitalício vs. expiração
- ❌ Sem indicador de quantos usuários têm cada plano
- ❌ Sem status de plano (ativo/inativo/pausado)

### Interface: "Editar Plano" (Detalhes + Items)
**Problemas:**
- ❌ Muitos IDs de products por gateway na mesma tela
- ❌ Lista de items muito grande e sem busca/filtro
- ❌ Items não mostram em qual(is) plano(s) estão vinculados
- ❌ Sem visualização clara de quantos items cada categoria tem
- ❌ Checkboxes podem desabilitar acidentalmente items
- ❌ Sem undo/confirmar antes de salvar
- ❌ Sem separação clara entre configuração de items e dados do plano

---

## PARTE 2: PLANO LÓGICO DE MELHORIAS

### A) Interface: "Gerenciar Planos"

#### Layout Proposto:
```
┌─ HEADER ──────────────────────────────────────────────────┐
│ 📦 Gerenciar Planos              [+ Criar Novo Plano]     │
└────────────────────────────────────────────────────────────┘

┌─ FILTROS ─────────────────────────────────────────────────┐
│ Status: [Todos ▼] | Tipo: [Todos ▼] | Buscar: [_______]  │
└────────────────────────────────────────────────────────────┘

┌─ TABELA DE PLANOS ────────────────────────────────────────┐
│ #  Nome          Preço    Tipo      Duração    Usuários   │
│ ─────────────────────────────────────────────────────────  │
│ 1  Essencial     R$ 29    Mensal    30 dias    45 👥       │
│ 2  Evoluir       R$ 59    Mensal    30 dias    12 👥       │
│ 3  Prime         R$ 99    Mensal    30 dias     8 👥       │
│ 4  Lifetime      Grátis   Vitalício ∞         128 👥       │
│ 5  Papercrafts   R$ 19    Único     -           23 👥       │
└────────────────────────────────────────────────────────────┘
```

#### Melhorias:
1. **Tabela clara** com colunas: Nome, Preço, Tipo, Duração, Usuários, Status, Ações
2. **Badge visual** para tipo:
   - 🟢 Mensal (com ícone de relógio)
   - 🔵 Único (com ícone de sacola)
   - 🟣 Vitalício (com ícone de infinito)
3. **Contador de usuários** com número realista
4. **Status ativo/inativo** para pausar plano
5. **Ações**: Editar | Visualizar Usuários | Pausar/Ativar | Duplicar | Deletar

---

### B) Interface: "Criar Novo Plano" (Modal)

#### Layout Proposto:
```
┌─ MODAL ────────────────────────────────────────────────────┐
│ ➕ Criar Novo Plano                               [X]       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ DADOS BÁSICOS                                              │
│ ┌──────────────────┬──────────────────────────────────┐    │
│ │ Nome Interno *   │ Código do plano (ex: ESSENCIAL) │    │
│ └──────────────────┴──────────────────────────────────┘    │
│ ┌──────────────────┬──────────────────────────────────┐    │
│ │ Nome Exibição *  │ Como aparece pro cliente         │    │
│ └──────────────────┴──────────────────────────────────┘    │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Descrição (opcional)                                 │   │
│ │ ──────────────────────────────────────────────────── │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ PREÇO E DURAÇÃO                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Tipo de Pagamento: [○ Único] [● Mensal] [○ Vitalício]│   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────┬──────────────────────────────────┐    │
│ │ Preço (R$) *     │ 0.00                             │    │
│ └──────────────────┴──────────────────────────────────┘    │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Se Mensal: Duração em dias *  [30 ▼]                │   │
│ │ ⓘ Isso define quando o acesso expira                │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ IDS DOS GATEWAYS (opcional)                                │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 🟢 Vega Checkout ID        [________________]         │   │
│ │ 🔵 GGCheckout ID           [________________]         │   │
│ │ 🟣 AmploPay ID             [________________]         │   │
│ │ ⓘ Configure após conectar os gateways                │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
│ PERSONALIZAÇÃO                                             │
│ ┌──────────────────┬──────────────────────────────────┐    │
│ │ Cor do Plano     │ [■ Azul]  ← Picker de cores    │    │
│ └──────────────────┴──────────────────────────────────┘    │
│                                                             │
│                          [Cancelar] [Criar Plano]         │
└────────────────────────────────────────────────────────────┘
```

#### Melhorias:
1. **Modal separado** (não inline na página)
2. **Campos agrupados** em seções (Básicos, Preço, Gateways, Personalização)
3. **Validação em tempo real** com ícones ✓/✗
4. **Dicas (tooltips)** explicando cada campo
5. **Filtro de tipo inteligente**:
   - Seleciona Mensal → aparece campo de duração
   - Seleciona Único → duration_days = NULL
   - Seleciona Vitalício → duration_days = NULL

---

### C) Interface: "Editar Plano" (Detalhes + Items)

#### Layout Proposto - TAB 1: "Configuração"
```
┌─────────────────────────────────────────────────────────────┐
│ ✏️ Editar: Essencial                  [Salvar] [Deletar]    │
├─────────────────────────────────────────────────────────────┤
│ [Configuração] [Items] [Usuários] [Histórico]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ℹ️ Informações Básicas                                      │
│ ├─ Nome Interno: ESSENCIAL                                 │
│ ├─ Nome Exibição: Plano Essencial                          │
│ ├─ Preço: R$ 29,99                                         │
│ ├─ Tipo: Mensal (expira após 30 dias)                      │
│ └─ Status: ✅ Ativo                                         │
│                                                              │
│ 🔗 IDs dos Gateways                                         │
│ ├─ 🟢 Vega:       3MGN9O        [Verificar ✓]              │
│ ├─ 🔵 GGCheckout: StGEOqJNGqeEb  [Verificar ✓]             │
│ └─ 🟣 AmploPay:   (não configurado)                        │
│                                                              │
│ 📊 Estatísticas                                             │
│ ├─ Usuários Ativos: 45                                     │
│ ├─ Usuários Expirados: 3                                   │
│ ├─ Receita (30 dias): R$ 1.349,55                          │
│ └─ Última compra: Há 2 horas                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Layout Proposto - TAB 2: "Items"
```
┌─────────────────────────────────────────────────────────────┐
│ ✏️ Editar: Essencial                  [Salvar] [Deletar]    │
├─────────────────────────────────────────────────────────────┤
│ [Configuração] [Items] [Usuários] [Histórico]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Buscar items: [_____________]  |  Categoria: [Todas ▼]    │
│                                                              │
│ 📚 ATIVIDADES (12 items)          [✓ Expandir / Recolher]  │
│ ├─ ☑️ Atividades de Gramática                              │
│ ├─ ☑️ Atividades de Ortografia                             │
│ ├─ ☑️ Atividades de Interpretação                          │
│ ├─ ☐ Atividades de Sistematização                         │
│ └─ + 8 outros...                                           │
│                                                              │
│ 🎥 VÍDEOS (5 items)               [✓ Expandir / Recolher]  │
│ ├─ ☑️ Vídeo de Introdução                                  │
│ ├─ ☐ Vídeo de Técnicas Avançadas                          │
│ └─ + 3 outros...                                           │
│                                                              │
│ 🎁 BÔNUS (3 items)                [✓ Expandir / Recolher]  │
│ ├─ ☑️ E-book Completo                                      │
│ ├─ ☑️ Templates em PDF                                     │
│ └─ ☑️ Planilhas Prontas                                    │
│                                                              │
│ ✂️ PAPERCRAFTS (8 items)          [✓ Expandir / Recolher]  │
│ ├─ ☑️ Papercrafts Natalinos                                │
│ ├─ ☑️ Papercrafts Infantis                                 │
│ └─ + 6 outros...                                           │
│                                                              │
│ 🎁 EXTRA FEATURES                                          │
│ ├─ ☑️ Comunidade (Chat)                                    │
│ └─ ☑️ Suporte VIP                                          │
│                                                              │
│ [Descartar Mudanças] [Salvar Items]                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Melhorias:
1. **Abas separadas** (Configuração vs Items)
2. **Busca e filtro** de items
3. **Categorias expansíveis** (não tudo na tela)
4. **Contador visual** de items por categoria
5. **Undo/Confirmar** antes de salvar
6. **Features extras** (Chat, Suporte VIP) como checkboxes
7. **Estatísticas do plano** (usuários, receita) no topo

#### TAB 3: "Usuários" (Novo!)
```
┌─────────────────────────────────────────────────────────────┐
│ ✏️ Editar: Essencial                                         │
├─────────────────────────────────────────────────────────────┤
│ [Configuração] [Items] [Usuários] [Histórico]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 45 Usuários Ativos | 3 Expirados | 12 Pendentes           │
│                                                              │
│ Buscar: [_____________] | Status: [Ativos ▼]              │
│                                                              │
│ Nome            Email              Início      Expira      │
│ ─────────────────────────────────────────────────────────   │
│ João Silva      joao@email.com     20/11/2024  20/12/2024  │
│ Maria Santos    maria@email.com    15/11/2024  15/12/2024  │
│ Pedro Oliveira  pedro@email.com    10/11/2024  10/12/2024  │
│ ...                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## PARTE 3: IMPLEMENTAÇÃO - Job de Expiração Diária

### Objetivo
Criar uma **Edge Function** que:
1. Roda **uma vez por dia** (verificação diária de expiração)
2. Busca todas as subscriptions com `end_date < NOW()` e `status = 'active'`
3. Muda `status` para `'expired'`
4. Cria notificação `'plan_expired'` para o usuário
5. Remove acesso do usuário a conteúdo premium

### Arquivo a Criar
```
/supabase/functions/check-plan-expiration/index.ts
```

### Lógica do Job

```typescript
// Pseudocódigo

async function checkPlanExpiration() {
  // [1] Buscar todas as subscriptions expiradas
  const expiredSubscriptions = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id, end_date')
    .lt('end_date', NOW())  // end_date < agora
    .eq('status', 'active')  // status = active

  // [2] Para cada subscripção expirada
  for (const sub of expiredSubscriptions) {
    // [2A] Atualizar status para 'expired'
    await supabase
      .from('user_subscriptions')
      .update({ status: 'expired' })
      .eq('id', sub.id)

    // [2B] Criar notificação
    await supabase.from('notifications').insert({
      user_id: sub.user_id,
      type: 'plan_expired',
      title: 'Seu plano expirou',
      message: 'Seu acesso expirou. Renove agora para continuar!',
      action_url: '/renovar-plano',
      read: false
    })

    // [2C] Log para auditoria
    console.log(`✅ Plano expirado para user ${sub.user_id} (subscription ${sub.id})`)
  }

  // [3] Retornar resultado
  return {
    status: 'success',
    expired_count: expiredSubscriptions.length,
    timestamp: new Date().toISOString()
  }
}
```

### Como Disparar Diariamente

**Opção 1: Postgres Cron** (Recomendado)
```sql
-- Executar todo dia às 00:00 UTC
SELECT cron.schedule(
  'check-plan-expiration',
  '0 0 * * *',  -- Cron: 00:00 todos os dias
  $$SELECT http_post(
    'https://[YOUR_PROJECT_ID].supabase.co/functions/v1/check-plan-expiration',
    '{}'::jsonb,
    'application/json'
  )$$
);
```

**Opção 2: GitHub Actions** (Alternativa)
```yaml
name: Check Plan Expiration
on:
  schedule:
    - cron: '0 0 * * *'  # Todos os dias 00:00 UTC

jobs:
  expiration-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Call expiration function
        run: |
          curl -X POST \
            https://[PROJECT_ID].supabase.co/functions/v1/check-plan-expiration \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

---

## RESUMO DE MUDANÇAS

| Componente | Antes | Depois |
|-----------|-------|--------|
| Gerenciar Planos | Formulário inline | Tabela + Modal |
| Editar Plano | Tudo na mesma página | Abas: Config, Items, Usuários |
| Items | Lista grande | Categorias expansíveis |
| Expiração | Nenhuma verificação | Job diário automático |
| Notificações | Não implementadas | Automáticas ao expirar |

---

## ORDEM DE IMPLEMENTAÇÃO

1. **Fase 1:** Job de expiração (5-10 min) - Crítico
2. **Fase 2:** Interface "Gerenciar Planos" (30 min)
3. **Fase 3:** Modal "Criar Plano" (30 min)
4. **Fase 4:** Interface "Editar Plano" com abas (45 min)
5. **Fase 5:** Testes e-to-e (20 min)

**Total estimado:** 2-2.5 horas

---

## PRÓXIMAS ETAPAS

1. ✅ Entender necessidades
2. ⏳ Implementar job de expiração
3. ⏳ Melhorar interfaces
4. ⏳ Testar com dados reais
