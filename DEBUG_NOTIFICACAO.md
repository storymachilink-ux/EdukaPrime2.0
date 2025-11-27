# 🐛 DEBUG - Notificação de Badges

## 🔍 Passo a Passo para Descobrir o Problema

### **1. Limpar e Preparar**
1. Limpe o cache: `Ctrl + Shift + R`
2. Abra o Console (F12)
3. Faça login no sistema

---

### **2. Verificar Logs do Hook**

**Quando entrar no Dashboard, deve aparecer no Console:**

```
🔧 useBadgeNotifications - Hook iniciado, profile: [seu-uuid]
🔧 unlockedBadge atual: null
✅ useBadgeNotifications - Profile ID encontrado: [seu-uuid]
⏰ Iniciando polling de badges a cada 2s...
🔍 Verificando novas badges...
📊 Badges atuais: X, Anteriores: 0
🎯 Definindo contador inicial de badges: X
🔔 Subscrevendo a Realtime para user_id: [seu-uuid]
📡 Status da subscrição Realtime: SUBSCRIBED
```

**❓ O que aparecer para você?** Me envie todos os logs que começam com 🔧, ✅, ⏰, 🔍, 📊, 🎯, 🔔, 📡

---

### **3. Marcar Atividade como Concluída**

1. Vá em **Atividades**
2. Clique **"Marcar como Concluído"** em uma atividade
3. **Observe o Console** - deve aparecer os logs já conhecidos:

```
🔵 handleToggleComplete chamado para: [Nome]
👤 User ID: [uuid]
📊 Já está concluído? false
🚀 Marcando como concluído...
...
✅ Recurso marcado como concluído: [Nome]
```

---

### **4. Verificar Desbloqueio de Badge**

**Após marcar como concluído, deve aparecer um destes:**

#### **A) Se detectar via Polling (a cada 2s):**
```
🔍 Verificando novas badges...
📊 Badges atuais: 1, Anteriores: 0
🎉 BADGE DESBLOQUEADA (polling): { id: "...", title: "...", ... }
🔐 ProtectedRoute - unlockedBadge: { ... }
🎨 BadgeUnlockedNotification renderizou, badge: { ... }
🎉 Badge recebida no componente, iniciando animação: { ... }
```

#### **B) Se detectar via Realtime:**
```
🔔 Nova badge detectada via Realtime: { ... }
🎊 MOSTRANDO NOTIFICAÇÃO (Realtime): { ... }
🔐 ProtectedRoute - unlockedBadge: { ... }
🎨 BadgeUnlockedNotification renderizou, badge: { ... }
🎉 Badge recebida no componente, iniciando animação: { ... }
```

---

### **5. Cenários e Soluções**

#### **Cenário 1: Não aparece nada após marcar como concluído**
**Possível causa:** Badge não está sendo desbloqueada no banco

**Verificar no Supabase SQL Editor:**
```sql
-- Substitua [seu-user-id] pelo seu UUID real
SELECT * FROM user_badges
WHERE user_id = '[seu-user-id]'
ORDER BY created_at DESC;
```

Se estiver vazio → Badge não foi inserida (problema nos triggers)

---

#### **Cenário 2: Aparece "📊 Badges atuais: 0, Anteriores: 0" sempre**
**Possível causa:** Nenhuma badge foi desbloqueada

**Verificar se trigger está funcionando:**
```sql
-- Ver triggers ativos
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%badge%';
```

Deve retornar:
- `trigger_material_badges_on_progress` → user_progress
- `trigger_chat_points_badges_on_update` → chat_user_stats

---

#### **Cenário 3: Badge é desbloqueada mas notificação não aparece**
**Possível causa:** Realtime não habilitado ou componente não renderiza

**Verificar Realtime:**
```
📡 Status da subscrição Realtime: ???
```

Deve ser `SUBSCRIBED`. Se não for:
1. Vá no Supabase → Database → Replication
2. Habilite Realtime para a tabela `user_badges`

---

#### **Cenário 4: Aparece erro ao buscar badges**
```
❌ Erro ao buscar badges: { ... }
```

**Possível causa:** Problema de permissão RLS

**Solução:** Verifique RLS policies na tabela `user_badges`

---

## 📋 Me Envie Estas Informações

Após testar, me envie:

1. ✅ **Todos os logs do Console** que começam com:
   - 🔧, ✅, ⏰, 🔍, 📊, 🎯, 🔔, 📡, 🎉, 🎊, 🔐, 🎨

2. ✅ **Screenshot do Console** após clicar "Marcar como Concluído"

3. ✅ **Resultado deste SQL:**
   ```sql
   -- Substitua [seu-user-id]
   SELECT
     b.title,
     b.description,
     b.icon,
     ub.created_at
   FROM user_badges ub
   JOIN badges b ON b.id = ub.badge_id
   WHERE ub.user_id = '[seu-user-id]'
   ORDER BY ub.created_at DESC;
   ```

4. ✅ **Qual cenário aconteceu?** (1, 2, 3 ou 4)

---

## 🎯 Teste Rápido de Força Bruta

Se nada funcionar, teste manualmente inserir uma badge:

```sql
-- Substitua [seu-user-id] e [badge-id]
-- Para pegar um badge-id válido:
SELECT id, title FROM badges LIMIT 1;

-- Inserir manualmente
INSERT INTO user_badges (user_id, badge_id)
VALUES ('[seu-user-id]', '[badge-id]')
ON CONFLICT DO NOTHING;
```

**Se a notificação aparecer após inserir manualmente** → Problema está nos triggers, não na notificação.

**Se a notificação NÃO aparecer** → Problema está no hook/componente.

---

Com essas informações, vou identificar exatamente onde está o problema! 🚀
