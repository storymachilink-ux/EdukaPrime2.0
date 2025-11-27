# 🔧 CORRIGIR DESBLOQUEIO AUTOMÁTICO DE BADGES

**Problema Identificado**: As badges aparecem com progresso correto, mas não se desbloqueiam automaticamente

**Exemplo**:
```
Explorador - Baixe 10 materiais
Progresso: 12 / 10  ← Já completou! Mas não desbloqueou
Status: 🔒 Bloqueada  ← Deveria estar ✅ Desbloqueada
```

---

## 🔍 ROOT CAUSE

Os **triggers automáticos não estão acionando as funções de desbloqueio** quando:
- Novo download/conclusão é inserido em `user_progress`
- Novos pontos são adicionados em `chat_user_stats`

**Razão possível**: RLS ou permissões na tabela `user_badges`

---

## ✅ SOLUÇÃO IMEDIATA

### PASSO 1: Executar SQL de Desbloqueio Manual

Arquivo: **`sql/FORCAR_DESBLOQUEIO_BADGES_AGORA.sql`**

1. Abra Supabase: https://lkhfbhvamnqgcqlrriaw.supabase.co
2. SQL Editor → New Query
3. Copie TODO o arquivo `FORCAR_DESBLOQUEIO_BADGES_AGORA.sql`
4. Cole no editor
5. Clique em **RUN**

Este script vai:
- ✅ Verificar progresso de cada usuário
- ✅ Contar downloads e conclusões
- ✅ Desbloquear automaticamente as badges que já foram completadas
- ✅ Evitar duplicatas

### PASSO 2: Recarregar o App

```
F5 ou Ctrl+Shift+R (limpar cache)
```

### PASSO 3: Verificar Conquistas

Vá para **Conquistas** e veja:
- ✅ Explorador deve estar **DESBLOQUEADA** (12 ≥ 10)
- ✅ Mestre Completo deve mostrar progresso maior
- ✅ Todas as que completou devem estar ✅ marcadas

---

## 🔧 SOLUÇÃO PERMANENTE

Para que os triggers funcionem automaticamente no futuro, precisamos:

### Opção A: Revisar RLS (Mais seguro)

```sql
-- Verificar se RLS está bloqueando inserts automáticos
SELECT * FROM user_badges LIMIT 1;

-- Se não há dados ou há erro de permissão, executar:
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;

-- Depois recriar policies corretas:
CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (true);
```

### Opção B: Testar Triggers (Debug)

```sql
-- Verificar se triggers existem
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table LIKE 'user_progress';
```

### Opção C: Chamar Função Manualmente (Teste)

```sql
-- Teste para usuário específico
SELECT * FROM check_and_unlock_download_badges('seu-user-id-aqui');
```

---

## 📋 CHECKLIST

- [ ] Executar `FORCAR_DESBLOQUEIO_BADGES_AGORA.sql` no Supabase
- [ ] Recarregar app (Ctrl+Shift+R)
- [ ] Verificar se badges aparecem desbloqueadas
- [ ] Testar novo download/conclusão (deve desbloquear em tempo real)

---

## 🆘 SE AINDA NÃO FUNCIONAR

Executar este SQL para diagnóstico:

```sql
-- Verificar quantas badges estão desbloqueadas
SELECT COUNT(*) as total_badges_desbloqueadas FROM user_badges;

-- Verificar badges em relação ao progresso
SELECT
  b.id,
  b.title,
  b.requirement_value,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.badge_id = b.id) as desbloqueadas
FROM badges b
ORDER BY b.type, b.requirement_value;
```

---

## 📝 PRÓXIMOS PASSOS

1. **AGORA**: Executar `FORCAR_DESBLOQUEIO_BADGES_AGORA.sql`
2. **DEPOIS**: Recarregar app e verificar Conquistas
3. **FUTURO**: Se não desbloquear automaticamente, investigar RLS/Triggers

---

**Esse script vai desbloquear todas as badges que o usuário já completou!** 🚀
