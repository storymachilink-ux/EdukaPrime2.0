# ✅ Como Testar o Sistema de Badges - Passo a Passo

## 🎯 Cenário Atual
- ✅ Páginas de Atividades, Vídeos e Bônus com botões funcionais
- ✅ Botão "Baixar Agora" → registra download
- ✅ Botão "Marcar como Concluído" → registra conclusão
- ❓ Badges devem ser desbloqueadas automaticamente

---

## 🚀 Teste Rápido (5 minutos)

### **Teste 1: Verificar Triggers no Banco**

1. Abra Supabase → SQL Editor
2. Execute:
```sql
SELECT COUNT(*) FROM badges;
```

**Resultado esperado:** `12`

**Se retornar 0:**
→ Execute o arquivo `sql/FINAL_badges_system.sql`

---

### **Teste 2: Forçar Desbloqueio de Badges**

**Se você já baixou/concluiu materiais mas não vê badges:**

1. Abra `sql/FORCAR_DESBLOQUEIO_BADGES.sql`
2. Execute o PASSO 1 para descobrir seu `user_id`
3. Copie seu `user_id`
4. Descomente e execute o PASSO 3:
```sql
SELECT * FROM check_and_unlock_download_badges('SEU_USER_ID');
SELECT * FROM check_and_unlock_completed_badges('SEU_USER_ID');
```
5. Recarregue o Dashboard (F5)
6. ✨ Badges devem aparecer coloridas!

---

### **Teste 3: Testar Nova Ação**

1. Limpe cache: `Ctrl + Shift + R`
2. Vá em **Atividades**
3. Clique em **"Baixar Agora"** em qualquer atividade
4. Abra Console do navegador (F12)
5. Deve aparecer:
```
✅ Recurso marcado como iniciado: [Nome da Atividade]
```
6. **Aguarde 2-3 segundos**
7. ✨ Notificação com emojis caindo deve aparecer
8. ✨ Badge "Primeiro Download" deve ficar colorida no Dashboard
9. ✨ Imagem "Lembrança em Desenho" deve revelar 8.33% de cor

---

### **Teste 4: Marcar como Concluído**

1. Clique em **"Marcar como Concluído"** na mesma atividade
2. Botão deve mudar para "Concluído ✓" (azul)
3. **Aguarde 2-3 segundos**
4. ✨ Nova notificação com badge "Primeiro Passo"
5. ✨ Mais 8.33% revelado na imagem (total: 16.66%)

---

## 🎨 Como Saber se Badge Foi Desbloqueada?

### **No Dashboard:**

✅ **Badge Desbloqueada:**
- SEM escala de cinza
- Borda branca brilhante
- Glow effect ao redor do ícone
- Etiqueta "✓ Conquistado"
- Overlay de gradiente colorido

❌ **Badge Bloqueada:**
- Em escala de cinza
- Opacidade reduzida
- Barra de progresso (ex: "0 / 1")

### **Na Imagem "Lembrança em Desenho":**
- 0 badges = imagem totalmente cinza
- 1 badge = 8.33% revelado (cor sobe de baixo)
- 2 badges = 16.66% revelado
- 12 badges = 100% revelado + botão verde ativo

---

## 🔍 Debug: Se Não Funcionar

### **Problema 1: Nenhuma badge aparece no Dashboard**

Execute:
```sql
SELECT COUNT(*) FROM badges;
```

Se retornar `0`:
→ Execute `sql/FINAL_badges_system.sql`

---

### **Problema 2: Cliquei em "Baixar" mas badge não desbloqueou**

1. Abra Console (F12)
2. Verifique se aparece erro
3. Execute SQL para forçar verificação:
```sql
SELECT * FROM check_and_unlock_download_badges('SEU_USER_ID');
```

---

### **Problema 3: Badge desbloqueada mas ainda em cinza**

1. Limpe cache: `Ctrl + Shift + R`
2. Feche e abra o navegador
3. Ou teste em aba anônima

---

### **Problema 4: Notificação não aparece**

1. Verifique se Supabase Realtime está ativo:
   - Supabase Dashboard → Database → Replication
   - Tabela `user_badges` deve ter Realtime habilitado

2. Verifique Console (F12) por erros de WebSocket

---

## 📊 Ver Estatísticas

No Dashboard, você deve ver:

**Cards de Estatísticas:**
- Total de Downloads: `X`
- Pontos do Chat: `Y`
- Recursos Concluídos: `Z / Total`
- Badges Conquistadas: `N / 12`

**Seção "🏆 Minhas Conquistas":**
- Grid com as 12 badges
- Badges desbloqueadas em **COR**
- Badges bloqueadas em **CINZA**

---

## 🆘 Ainda Não Funciona?

1. Leia o guia completo: `SOLUCAO_BADGES_NAO_FUNCIONAM.md`

2. Execute verificação completa: `sql/verify_triggers.sql`

3. Recrie todo sistema:
   - Execute `sql/FINAL_badges_system.sql`
   - Isso limpa e recria tudo do zero

4. Verifique permissões RLS:
```sql
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('badges', 'user_badges');
```

---

## ✅ Resultado Final Esperado

Depois de seguir este guia:
1. ✅ 12 badges aparecem no Dashboard
2. ✅ Ao baixar 1 material → Badge colorida + notificação
3. ✅ Ao concluir 1 atividade → Badge colorida + notificação
4. ✅ Imagem revela cor progressivamente (8.33% por badge)
5. ✅ 12 badges = 100% revelado + botão verde ativo
