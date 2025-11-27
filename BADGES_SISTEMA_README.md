# 🎨 Sistema de Badges - Dashboard

Sistema de 12 badges que revelam progressivamente a imagem "Lembrança em Desenho" no Dashboard.

---

## 🚀 INSTALAÇÃO

### **Passo 1: Executar SQL Principal**
No Supabase > SQL Editor, execute:
```
sql/FINAL_badges_system.sql
```

Este SQL vai:
- ✅ Limpar completamente o sistema antigo
- ✅ Criar as 12 badges novas
- ✅ Configurar triggers automáticos
- ✅ Configurar permissões (RLS)

### **Passo 2: Limpar Cache**
- Pressione `Ctrl + Shift + R` no navegador
- Ou abra aba anônima para testar

### **Passo 3: Verificar Console**
Abra o Console do navegador (F12) e vá no Dashboard.
Você deve ver:
```
🎨 DASHBOARD - Sistema de Badges:
📊 Badges desbloqueadas: 0 / 12
💧 Revelação da imagem: 0.00%
🏆 Badges: []
```

---

## 🏆 AS 12 BADGES

### **📥 Badges de Download** (4 badges)
Desbloqueadas quando o usuário **baixa** materiais:
1. 📥 **Primeiro Download** - 1 material
2. 📚 **Colecionador** - 5 materiais
3. 🎯 **Explorador** - 10 materiais
4. 📖 **Biblioteca Pessoal** - 15 materiais

### **✅ Badges de Conclusão** (4 badges)
Desbloqueadas quando o usuário **conclui** atividades:
1. ✅ **Primeiro Passo** - 1 atividade
2. 💪 **Dedicado** - 5 atividades
3. ⭐ **Persistente** - 10 atividades
4. 👑 **Mestre Completo** - 15 atividades

### **💬 Badges de Chat** (4 badges)
Desbloqueadas quando o usuário **envia mensagens**:
1. 💬 **Comunicativo** - 10 mensagens (100 pontos)
2. 🗨️ **Locutor** - 50 mensagens (500 pontos)
3. 💫 **Porta-Voz** - 100 mensagens (1.000 pontos)
4. 🔥 **Estrela da Comunidade** - 200 mensagens (2.000 pontos)

---

## 🎯 COMO FUNCIONA

### **Dashboard - Card "Lembrança em Desenho"**

1. **Imagem em escala de cinza** (0% revelado)
2. Conforme badges são desbloqueadas:
   - Cada badge = **+8.33%** revelado
   - Efeito de **água sobe** progressivamente
   - Imagem vai ganhando **cor** de baixo para cima

3. **12 badges = 100% revelado**:
   - Imagem totalmente colorida
   - Botão verde "Liberar minha arte exclusiva" ativo
   - Usuário pode solicitar desenho personalizado

### **Desbloqueio Automático**

As badges são desbloqueadas **automaticamente** quando:

✅ **Usuário clica em "Baixar"** numa atividade/bonus
→ Trigger verifica badges de download

✅ **Usuário marca como "Concluído"**
→ Trigger verifica badges de conclusão

✅ **Usuário envia mensagem no chat**
→ Trigger verifica badges de chat (10 pontos por mensagem)

---

## 🧪 TESTAR O SISTEMA

### **Opção 1: Testar Automaticamente**
1. Baixe algumas atividades
2. Marque como concluído
3. Envie mensagens no chat
4. Veja o console do navegador
5. Observe a imagem revelando progressivamente

### **Opção 2: Testar Manualmente**
Execute: `sql/TEST_badges_manual.sql`

1. Descubra seu user_id:
```sql
SELECT id, email FROM auth.users LIMIT 5;
```

2. Desbloquear badge manualmente (teste):
```sql
INSERT INTO user_badges (user_id, badge_id)
VALUES ('seu-user-id-aqui', 'material_download_1');
```

3. Ver suas badges:
```sql
SELECT * FROM user_badges WHERE user_id = 'seu-user-id-aqui';
```

4. Ver porcentagem:
```sql
SELECT
  COUNT(*) as badges,
  ROUND((COUNT(*) * 100.0 / 12), 2) as porcentagem
FROM user_badges
WHERE user_id = 'seu-user-id-aqui';
```

---

## 🔍 DEBUG

### **Ver logs no Console (F12)**
Quando você acessa o Dashboard, verá:
```
🎨 DASHBOARD - Sistema de Badges:
📊 Badges desbloqueadas: X / 12
💧 Revelação da imagem: XX.XX%
🏆 Badges: ['badge_id_1', 'badge_id_2', ...]
```

### **Badges não aparecem?**
1. Execute `sql/verify_badges.sql` no Supabase
2. Confirme que existem 12 badges
3. Limpe cache do navegador (Ctrl + Shift + R)
4. Verifique Console por erros

### **Efeito de água não aparece?**
- O efeito só aparece se `revealPercentage > 0`
- Desbloqueie pelo menos 1 badge
- Veja no Console se a % está calculando

---

## 📊 ARQUITETURA

```
user_progress (atividade concluída/baixada)
    ↓
trigger_check_material_badges()
    ↓
check_and_unlock_download_badges() OU check_and_unlock_completed_badges()
    ↓
INSERT INTO user_badges
    ↓
Dashboard recarrega (ArtRevealCard.loadBadges())
    ↓
Efeito de água sobe + Imagem revela
```

---

## ✅ CHECKLIST DE SUCESSO

- [ ] SQL executado sem erros
- [ ] 12 badges criadas no banco
- [ ] Console mostra "0 / 12" ao abrir Dashboard
- [ ] Ao baixar material → badge desbloqueada
- [ ] Ao concluir atividade → badge desbloqueada
- [ ] Ao enviar mensagem → badge desbloqueada
- [ ] Efeito de água sobe conforme badges
- [ ] Imagem ganha cor progressivamente
- [ ] 12 badges = Botão verde ativado

---

## 🎉 PRONTO!

O sistema está 100% funcional. Cada badge desbloqueada revela **8.33%** da imagem no Dashboard!
