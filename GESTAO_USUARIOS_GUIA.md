# 👥 Guia de Gestão de Usuários - EdukaPrime

## 📋 Como Usar a Área de Gestão de Usuários

### Acessar a Gestão de Usuários

1. Faça login como **admin**
2. No menu lateral, clique em **"Gestão de Usuários"**
3. Você verá a lista completa de todos os usuários cadastrados

---

## 🎯 Funcionalidades Disponíveis

### 1. **Editar Plano do Usuário**

Para alterar o plano de um usuário:

1. Clique no ícone **✏️ Editar** ao lado do usuário
2. Na seção **"Plano"**, selecione o novo plano:
   - **Gratuito** (level 0) - Acesso básico
   - **Essencial** (level 1) - Primeiro nível pago
   - **Evoluir** (level 2) - Segundo nível pago
   - **Prime** (level 3) - Nível premium

3. Clique em **"Salvar"**

✅ A alteração é **imediata** e reflete na conta do usuário instantaneamente!

📝 **Histórico:** Todas as mudanças de plano ficam registradas na aba "Histórico de Planos".

---

### 2. **Controlar Acessos Customizados**

Você pode **sobrescrever** os acessos padrão do plano para usuários específicos.

#### Como Funcionam os 3 Estados:

Cada acesso pode ter 3 configurações:

| Estado | Ícone | Descrição |
|--------|-------|-----------|
| **🔵 Padrão** | - | Usa as regras do plano (recomendado) |
| **✅ Forçar LIBERAR** | ✅ | Usuário SEMPRE terá acesso (mesmo que o plano não permita) |
| **❌ Forçar BLOQUEAR** | ❌ | Usuário NUNCA terá acesso (mesmo que o plano permita) |

#### Tipos de Acessos:

1. **📚 Atividades** - Download de atividades PDF
2. **🎥 Vídeos** - Visualização de vídeos educacionais
3. **🎁 Bônus** - Acesso a materiais bônus
4. **👑 Suporte VIP** - Acesso ao suporte prioritário

---

### 3. **Exemplos de Uso**

#### Exemplo 1: Dar Acesso Especial (Brinde)
**Situação:** Usuário está no plano Gratuito, mas você quer liberar os Bônus para ele como cortesia.

**Como fazer:**
1. Editar usuário
2. Em **"🎁 Bônus"**, selecionar: **✅ Forçar LIBERAR**
3. Salvar

**Resultado:** Usuário mantém plano Gratuito, mas tem acesso aos Bônus.

---

#### Exemplo 2: Bloquear Acesso Específico
**Situação:** Usuário está no plano Prime (tem tudo), mas você quer bloquear temporariamente o Suporte VIP dele.

**Como fazer:**
1. Editar usuário
2. Em **"👑 Suporte VIP"**, selecionar: **❌ Forçar BLOQUEAR**
3. Salvar

**Resultado:** Usuário mantém acesso a tudo do Prime, exceto Suporte VIP.

---

#### Exemplo 3: Resetar para Usar Plano Padrão
**Situação:** Você deu acesso customizado, mas agora quer voltar ao normal.

**Como fazer:**
1. Editar usuário
2. Clicar no botão **"🔄 Resetar Todos"**
3. Salvar

**Resultado:** Todos os acessos voltam a seguir as regras do plano.

---

### 4. **Definir Data de Expiração**

Você pode definir quando o plano do usuário vai expirar:

1. Editar usuário
2. Na seção **"📅 Data de Expiração do Plano"**, selecionar a data
3. Salvar

**Comportamento:**
- Quando a data chegar, o sistema automaticamente:
  - Muda o plano para **Gratuito (0)**
  - Registra no histórico como "Expiração"
  - Remove acessos pagos

**Para planos vitalícios:** Deixe o campo em branco.

---

### 5. **Bloquear/Desbloquear Usuário**

#### Bloquear:
1. Clique no ícone **🔒 Bloquear**
2. Confirme

**Resultado:** Usuário não consegue mais fazer login.

#### Desbloquear:
1. Clique no ícone **🔓 Desbloquear**
2. Confirme

**Resultado:** Usuário volta a ter acesso normal.

---

### 6. **Tornar Admin**

Para dar permissões de administrador a um usuário:

1. Editar usuário
2. Marcar **"👑 Tornar Administrador"**
3. Salvar

⚠️ **CUIDADO:** Admins têm acesso total ao sistema!

---

### 7. **Ver Históricos**

Na tela de edição, você pode ver:

#### 📜 Histórico de Planos
- Todas as mudanças de plano
- Motivo da mudança (upgrade, downgrade, expiração, admin)
- Data e hora
- Quem fez a alteração

#### 📊 Histórico de Atividades
- Downloads realizados
- Vídeos assistidos
- Recursos acessados
- Data e hora de cada ação

---

## 📊 Estatísticas do Dashboard

No topo da página, você vê:

- **Total de Usuários** - Quantidade total cadastrada
- **Novos esta Semana** - Cadastros dos últimos 7 dias
- **Usuários Bloqueados** - Quantos estão bloqueados
- **Por Plano** - Distribuição entre planos

---

## 🔍 Filtros

Use os filtros para encontrar usuários:

### Buscar:
Digite email ou nome do usuário

### Filtrar por Plano:
- Todos os planos
- Gratuito
- Essencial
- Evoluir
- Prime

### Filtrar por Status:
- Todos os status
- Ativos
- Bloqueados

---

## 💡 Dicas e Boas Práticas

### ✅ Recomendações:

1. **Use "Padrão" sempre que possível** - Facilita manutenção
2. **Documente mudanças importantes** - Use o histórico como referência
3. **Teste antes de bloquear** - Verifique se o usuário realmente deve ser bloqueado
4. **Configure datas de expiração** - Para planos temporários/promocionais

### ⚠️ Cuidados:

1. **Não delete usuários sem backup** - A ação é irreversível
2. **Cuidado ao dar admin** - Apenas para pessoas de confiança
3. **Verifique antes de bloquear em massa** - Pode afetar usuários pagos
4. **Acessos customizados sobrescrevem TUDO** - Use com moderação

---

## 🎨 Legenda Visual

### Planos:
- 🔵 **Gratuito** (0)
- 🟦 **Essencial** (1)
- 🟪 **Evoluir** (2)
- 🟨 **Prime** (3)

### Acessos:
- ✅ - Forçado LIBERAR
- ❌ - Forçado BLOQUEAR
- 🔵 - Padrão (usa plano)

### Recursos:
- 📚 - Atividades
- 🎥 - Vídeos
- 🎁 - Bônus
- 👑 - Suporte VIP

---

## 🔄 Fluxo de Atualização

```
1. Admin edita usuário
         ↓
2. Altera plano ou acessos
         ↓
3. Clica em "Salvar"
         ↓
4. Sistema atualiza banco de dados
         ↓
5. Registra no histórico (se mudou plano)
         ↓
6. Usuário vê mudanças IMEDIATAMENTE
         ↓
7. Acessos são atualizados em tempo real
```

---

## ❓ FAQ

### P: As mudanças são imediatas?
**R:** Sim! Assim que você clica em "Salvar", a conta do usuário é atualizada instantaneamente.

### P: O usuário é notificado?
**R:** Atualmente não, mas você pode implementar notificações por email.

### P: Posso cancelar uma mudança?
**R:** Sim, basta editar novamente e voltar ao estado anterior. O histórico mantém tudo registrado.

### P: O que acontece se eu bloquear um usuário pagante?
**R:** Ele não consegue fazer login, mas o plano continua ativo. Ao desbloquear, ele volta ao normal.

### P: Posso dar acesso parcial?
**R:** Sim! Use os acessos customizados para liberar apenas alguns recursos.

### P: Como faço para dar 7 dias de teste?
**R:**
1. Mude o plano para Essencial/Evoluir/Prime
2. Configure data de expiração para daqui 7 dias
3. Salve

Após 7 dias, o sistema automaticamente volta para Gratuito.

---

## 🚀 Casos de Uso Avançados

### Caso 1: Promoção "Acesso Temporário VIP"
```
1. Manter plano atual
2. Forçar LIBERAR todos os acessos
3. Configurar data de expiração para fim da promoção
```

### Caso 2: Beta Tester (Acesso Especial)
```
1. Plano Gratuito
2. Forçar LIBERAR apenas Vídeos e Atividades
3. Deixar Bônus como Padrão (bloqueado para Gratuito)
```

### Caso 3: Usuário Problemático
```
1. Bloquear acesso ao Suporte VIP
2. Manter outros acessos normais
3. Monitorar atividades no histórico
```

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique o histórico do usuário
2. Confira os logs no console
3. Teste com usuário de teste primeiro
4. Documente o problema e entre em contato

---

**Última atualização:** Janeiro 2025
**Versão:** 2.0
