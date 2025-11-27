# 🎯 Sistema de Badges Completo - Atualizado

## ✨ Novidades

- ✅ **Notificação visual com emojis caindo** quando uma badge é desbloqueada
- ✅ **Atualização em tempo real** usando Supabase Realtime
- ✅ **Sincronização automática** entre Dashboard e ArtRevealCard
- ✅ **12 badges** do banco de dados (sem hardcoded)
- ✅ **Triggers automáticos** para desbloquear badges

---

## 🏆 AS 12 BADGES

### 📥 Badges de Download (4)
Desbloqueadas quando o usuário **baixa** materiais:
1. 📥 **Primeiro Download** - 1 material
2. 📚 **Colecionador** - 5 materiais
3. 🎯 **Explorador** - 10 materiais
4. 📖 **Biblioteca Pessoal** - 15 materiais

### ✅ Badges de Conclusão (4)
Desbloqueadas quando o usuário **conclui** atividades:
1. ✅ **Primeiro Passo** - 1 atividade
2. 💪 **Dedicado** - 5 atividades
3. ⭐ **Persistente** - 10 atividades
4. 👑 **Mestre Completo** - 15 atividades

### 💬 Badges de Chat (4)
Desbloqueadas quando o usuário **envia mensagens**:
1. 💬 **Comunicativo** - 10 mensagens (100 pontos)
2. 🗨️ **Locutor** - 50 mensagens (500 pontos)
3. 💫 **Porta-Voz** - 100 mensagens (1.000 pontos)
4. 🔥 **Estrela da Comunidade** - 200 mensagens (2.000 pontos)

---

## 🎨 Como Funciona

### 1. **Ações do Usuário**

#### Baixar Material
```typescript
import { markAsStarted } from '../lib/progressTracker';

// Quando usuário clica em "Baixar"
await markAsStarted(userId, 'atividade', activityId, activityTitle);
// ✅ Trigger automático verifica badges de download
```

#### Concluir Atividade
```typescript
import { markAsCompleted } from '../lib/progressTracker';

// Quando usuário marca como concluído
await markAsCompleted(userId, 'atividade', activityId, activityTitle);
// ✅ Trigger automático verifica badges de conclusão
```

#### Enviar Mensagem no Chat
```sql
-- Quando usuário envia mensagem, chat_user_stats é atualizado
-- ✅ Trigger automático verifica badges de chat
```

### 2. **Sistema de Triggers (Backend)**

```
user_progress (INSERT/UPDATE)
    ↓
trigger_check_material_badges()
    ↓
check_and_unlock_download_badges() OU check_and_unlock_completed_badges()
    ↓
INSERT INTO user_badges (se badge desbloqueada)
    ↓
Supabase Realtime notifica frontend
```

### 3. **Frontend - Notificação em Tempo Real**

```typescript
// Hook personalizado escuta novas badges
const { unlockedBadge, clearUnlockedBadge } = useBadgeListener(userId);

// Quando badge é desbloqueada:
useEffect(() => {
  if (unlockedBadge) {
    // 1. Mostra notificação visual com emojis caindo
    // 2. Ativa confetes
    // 3. Atualiza ArtRevealCard (% da imagem)
    // 4. Recarrega estatísticas do dashboard
  }
}, [unlockedBadge]);
```

### 4. **Revelação da Imagem**

Cada badge desbloqueada = **8.33%** de revelação (12 badges = 100%)

```
0 badges   → 0%    → Imagem totalmente em cinza
1 badge    → 8.33% → Efeito de água sobe, cor começa a aparecer
...
12 badges  → 100%  → Imagem totalmente colorida + botão verde ativo
```

---

## 🔧 Arquivos Modificados/Criados

### **Criados**
- `src/components/ui/BadgeUnlockNotification.tsx` - Notificação visual com emojis
- `src/hooks/useBadgeListener.ts` - Hook para escutar badges em tempo real
- `sql/verify_triggers.sql` - Verificar se triggers estão ativos

### **Modificados**
- `src/lib/badgeSystem.ts` - Busca badges do banco (não mais hardcoded)
- `src/components/ui/BadgeCard.tsx` - Usa `title` e `requirement_value`
- `src/components/dashboard/ArtRevealCard.tsx` - Aceita ref, expõe `loadBadges()`
- `src/pages/Dashboard.tsx` - Usa `useBadgeListener` e `BadgeUnlockNotification`

---

## 🧪 Como Testar

### **1. Verificar Triggers**
Execute no Supabase SQL Editor:
```sql
-- Ver arquivo: sql/verify_triggers.sql
```

Deve retornar:
- ✅ 2 triggers ativos (`trigger_material_badges_on_progress`, `trigger_chat_points_badges_on_update`)
- ✅ 3 funções de verificação de badges
- ✅ 12 badges na tabela `badges`

### **2. Testar Download**
1. Vá em Atividades ou Bônus
2. Clique em "Baixar" em qualquer material
3. **Espere 1-2 segundos**
4. ✨ **Notificação visual aparece** com emojis caindo
5. 🎨 **Imagem no Dashboard revela 8.33%** de cor

### **3. Testar Conclusão**
1. Marque uma atividade como "Concluída"
2. **Espere 1-2 segundos**
3. ✨ **Notificação visual aparece**
4. 🎨 **Imagem revela mais 8.33%**

### **4. Testar Chat**
1. Envie 10 mensagens no chat
2. ✨ **Badge "Comunicativo" desbloqueada**
3. Continue enviando para desbloquear próximas badges

---

## 📊 Verificar Console do Navegador

Ao fazer ações, você deve ver logs:

```
🎨 DASHBOARD - Sistema de Badges:
📊 Badges desbloqueadas: 1 / 12
💧 Revelação da imagem: 8.33%
🏆 Badges: ['material_download_1']

🎉 Nova badge desbloqueada!
{ badge: { title: 'Primeiro Download', ... } }
```

---

## 🚨 Troubleshooting

### **Badges não desbloqueiam**
1. Execute `sql/verify_triggers.sql` para verificar triggers
2. Verifique Console do navegador por erros
3. Verifique se `user_progress` está sendo inserido corretamente

### **Notificação não aparece**
1. Limpe cache (Ctrl + Shift + R)
2. Verifique se `useBadgeListener` está ativo no console
3. Verifique se Supabase Realtime está habilitado

### **Imagem não atualiza**
1. Verifique se `ArtRevealCard` está recebendo a ref
2. Verifique se `loadBadges()` está sendo chamado
3. Verifique logs no console

---

## 🎉 Conclusão

O sistema está 100% funcional com:
- ✅ Desbloqueio automático via triggers
- ✅ Notificação visual em tempo real
- ✅ Revelação progressiva da imagem
- ✅ Sincronização completa entre componentes
