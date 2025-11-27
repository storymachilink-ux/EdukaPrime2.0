# Checklist de Verificação dos SQLs

Execute estes comandos no **Supabase SQL Editor** e me reporte os resultados.

---

## ✅ Verificação 1: Tabelas Base Foram Criadas

Execute no Supabase:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('community_channels', 'support_tiers')
ORDER BY table_name;
```

**Resultado esperado:** 2 linhas
```
community_channels
support_tiers
```

**Copie o resultado e me reporte:**
```
[ cole aqui o resultado ]
```

---

## ✅ Verificação 2: Dados Foram Inseridos em community_channels

```sql
SELECT COUNT(*) as total_canais FROM community_channels;
```

**Resultado esperado:** 1 linha com valor `3`
```
total_canais
3
```

**Copie o resultado:**
```
[ cole aqui: total_canais = ? ]
```

---

## ✅ Verificação 3: Dados Foram Inseridos em support_tiers

```sql
SELECT COUNT(*) as total_suportes FROM support_tiers;
```

**Resultado esperado:** 1 linha com valor `3`
```
total_suportes
3
```

**Copie o resultado:**
```
[ cole aqui: total_suportes = ? ]
```

---

## ✅ Verificação 4: Junction Tables Foram Criadas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'plan_%'
ORDER BY table_name;
```

**Resultado esperado:** 6 linhas
```
plan_atividades
plan_bonus
plan_comunidade
plan_papercrafts
plan_suporte
plan_videos
```

**Copie o resultado:**
```
[ cole aqui as 6 tabelas ]
```

---

## ✅ Verificação 5: Índices Foram Criados

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('plan_atividades', 'plan_videos', 'plan_bonus', 'plan_papercrafts', 'plan_comunidade', 'plan_suporte')
ORDER BY indexname;
```

**Resultado esperado:** Múltiplos índices (um ou dois por tabela)
```
idx_plan_atividades_atividade
idx_plan_atividades_plan
idx_plan_bonus_bonus
idx_plan_bonus_plan
idx_plan_comunidade_channel
idx_plan_comunidade_plan
idx_plan_papercrafts_papercraft
idx_plan_papercrafts_plan
idx_plan_suporte_plan
idx_plan_suporte_tier
idx_plan_videos_plan
idx_plan_videos_video
```

**Copie o resultado:**
```
[ cole aqui os índices ]
```

---

## ✅ Verificação 6: Teste Rápido - Inserir Item no Plano

Vamos testar se podemos linkar um item a um plano. Execute:

```sql
-- Pegar IDs reais do banco
SELECT id FROM atividades LIMIT 1;
```

**Resultado:** Você verá um UUID. Copie-o.

Depois execute (substituindo ATIVIDADE_ID pelo UUID que você pegou):

```sql
INSERT INTO plan_atividades (plan_id, atividade_id)
VALUES (1, 'ATIVIDADE_ID_AQUI')
RETURNING *;
```

**Resultado esperado:** Uma linha mostrando:
```
id | plan_id | atividade_id | created_at
...
```

**Copie o resultado:**
```
[ cole aqui se conseguiu inserir ]
```

---

## 📋 Formulário de Confirmação

Copie e preencha:

```
VERIFICAÇÃO 1 (Tabelas base criadas):
[ ] SIM - apareceram 2 tabelas
[ ] NÃO - erro no resultado

Resultado:
_______________________

VERIFICAÇÃO 2 (community_channels tem 3 registros):
[ ] SIM - total_canais = 3
[ ] NÃO - outro valor

Resultado:
_______________________

VERIFICAÇÃO 3 (support_tiers tem 3 registros):
[ ] SIM - total_suportes = 3
[ ] NÃO - outro valor

Resultado:
_______________________

VERIFICAÇÃO 4 (6 junction tables criadas):
[ ] SIM - apareceram 6 tabelas
[ ] NÃO - menos tabelas

Resultado:
_______________________

VERIFICAÇÃO 5 (Índices criados):
[ ] SIM - apareceram múltiplos índices
[ ] NÃO - nenhum índice

Resultado:
_______________________

VERIFICAÇÃO 6 (Teste de inserção):
[ ] SIM - conseguiu inserir
[ ] NÃO - erro ao inserir

Resultado:
_______________________

CONCLUSÃO:
[ ] TUDO OK - Pronto para testar admin panel
[ ] ALGUNS ERROS - Precisa corrigir
```

---

## 🚀 Próximo Passo

Se TUDO OK, você pode:

1. Acesse: `http://localhost:5173/admin/planos`
2. Clique "Gerenciar Items" em qualquer plano
3. Você verá 6 abas com items
4. Teste: selecione um item e clique "Salvar"

**Depois me reporte se funcionou!**

