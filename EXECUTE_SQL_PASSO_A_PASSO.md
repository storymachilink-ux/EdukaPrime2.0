# 🚀 EXECUTE O SQL PASSO A PASSO

Dividir em **9 passos pequenos** é muito melhor do que tentar executar tudo de uma vez!

## 📋 ORDEM EXATA DE EXECUÇÃO

### PASSO 1️⃣: Excluir antigas (00_EXCLUIR_ANTIGO.sql)
```
Abra Supabase → SQL Editor
Cole o conteúdo de: 00_EXCLUIR_ANTIGO.sql
Execute (Ctrl+Enter)

✅ Se passou: Tabelas antigas foram deletadas (ou já não existiam)
❌ Se teve erro: Pode ignorar, provavelmente tabela já não existe
```

---

### PASSO 2️⃣: Criar plans_v2 (01_CRIAR_PLANS_V2.sql)
```
Cole o conteúdo de: 01_CRIAR_PLANS_V2.sql
Execute

✅ Se passou: Tabela plans_v2 foi criada (vazia)
```

---

### PASSO 3️⃣: Inserir 5 planos (02_INSERIR_PLANOS.sql)
```
Cole o conteúdo de: 02_INSERIR_PLANOS.sql
Execute

✅ Se passou: 5 planos foram inseridos
```

**Verificação rápida:**
```sql
SELECT COUNT(*) FROM plans_v2;
-- Deve retornar: 5
```

---

### PASSO 4️⃣: Criar plan_features (03_CRIAR_PLAN_FEATURES.sql)
```
Cole o conteúdo de: 03_CRIAR_PLAN_FEATURES.sql
Execute

✅ Se passou: Tabela plan_features foi criada (vazia)
```

---

### PASSO 5️⃣: Inserir 30 features (04_INSERIR_FEATURES.sql)
```
Cole o conteúdo de: 04_INSERIR_FEATURES.sql
Execute

✅ Se passou: 30 features foram inseridas
```

**Verificação rápida:**
```sql
SELECT COUNT(*) FROM plan_features;
-- Deve retornar: 30
```

---

### PASSO 6️⃣: Criar user_subscriptions (05_CRIAR_USER_SUBSCRIPTIONS.sql)
```
Cole o conteúdo de: 05_CRIAR_USER_SUBSCRIPTIONS.sql
Execute

✅ Se passou: Tabela user_subscriptions foi criada (vazia)
```

---

### PASSO 7️⃣: Atualizar users (06_ATUALIZAR_USERS.sql)
```
Cole o conteúdo de: 06_ATUALIZAR_USERS.sql
Execute

✅ Se passou: Colunas foram adicionadas em users
```

---

### PASSO 8️⃣: Criar funções (07_CRIAR_FUNCOES.sql)
```
Cole o conteúdo de: 07_CRIAR_FUNCOES.sql
Execute

✅ Se passou: 2 funções foram criadas:
   - activate_user_subscription()
   - user_has_feature_access()
```

---

### PASSO 9️⃣: Criar view (08_CRIAR_VIEW.sql)
```
Cole o conteúdo de: 08_CRIAR_VIEW.sql
Execute

✅ Se passou: View user_current_access foi criada
```

---

### PASSO 1️⃣0️⃣: Verificações (09_VERIFICACAO_FINAL.sql)
```
Cole o conteúdo de: 09_VERIFICACAO_FINAL.sql
Execute

Se todos os testes passarem ✅, o banco está PRONTO!
```

---

## 📁 ARQUIVOS A EXECUTAR (nesta ordem)

```
1. sql/00_EXCLUIR_ANTIGO.sql           ← Primeiro
2. sql/01_CRIAR_PLANS_V2.sql
3. sql/02_INSERIR_PLANOS.sql
4. sql/03_CRIAR_PLAN_FEATURES.sql
5. sql/04_INSERIR_FEATURES.sql
6. sql/05_CRIAR_USER_SUBSCRIPTIONS.sql
7. sql/06_ATUALIZAR_USERS.sql
8. sql/07_CRIAR_FUNCOES.sql
9. sql/08_CRIAR_VIEW.sql
10. sql/09_VERIFICACAO_FINAL.sql      ← Último
```

---

## 🎯 RESUMO DAS VERIFICAÇÕES

Após executar TUDO, deve ter:

| Item | Verificação | Resultado Esperado |
|------|-------------|-------------------|
| **Planos** | `SELECT COUNT(*) FROM plans_v2` | **5** |
| **Features** | `SELECT COUNT(*) FROM plan_features` | **30** |
| **User Subs** | `SELECT COUNT(*) FROM user_subscriptions` | **0** (vazia) |
| **View** | `SELECT * FROM user_current_access LIMIT 1` | Retorna dados |
| **Função 1** | `SELECT user_has_feature_access(...)` | true/false |
| **Função 2** | Webhook usa `activate_user_subscription()` | Funciona |

---

## ✅ PRONTO!

Se tudo passou, o banco está **100% refatorado** e pronto pra usar!

Próximo passo: Reescrever o **FRONTEND**!
