# 🚨 INSTRUÇÃO URGENTE: Desabilitar RLS no Supabase

## Problema Identificado
O RLS (Row Level Security) **ainda está ativo** na tabela `users` e outras tabelas. Isso está bloqueando todas as queries da aplicação.

## Solução: Execute este SQL

### Passo 1: Abra o Supabase Dashboard
1. Vá para https://supabase.com/
2. Faça login com sua conta
3. Clique no projeto Edukaprime

### Passo 2: Abra o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### Passo 3: Cole o SQL Completo

Copie TODO o conteúdo do arquivo `sql/FORCE_DISABLE_RLS_NOW.sql` e cole na janela do SQL Editor.

### Passo 4: Execute

Clique no botão **▶ Run** (ou pressione Ctrl+Enter)

### Passo 5: Verifique o Resultado

Na aba "Results", você deve ver:
```
✅ RLS DESABILITADO para a tabela users
✅ RLS DESABILITADO para a tabela atividades
✅ RLS DESABILITADO para a tabela videos
... etc
```

E ao final:
```
✅ RLS FOI DESABILITADO COM SUCESSO!
```

---

## Depois de Executar

Assim que o SQL terminar:
1. **Volta para o navegador**
2. **Faça F5** na sua aplicação
3. Tudo deve funcionar agora!

---

## Se Tiver Erro

Se receber erro como:
- `ERROR: policy with name does not exist`
- `ERROR: permission denied`

**Ignora e continua**. Os erros são normais - apenas significa que aquela policy já não existia.

O importante é que no final você veja:
- ✅ RLS DESABILITADO
- ✅ Total policies: 0

---

## Resumo Rápido

| Tabela | RLS Antes | RLS Depois |
|--------|-----------|-----------|
| users | ❌ ATIVO | ✅ DESABILITADO |
| atividades | ❌ ATIVO | ✅ DESABILITADO |
| videos | ❌ ATIVO | ✅ DESABILITADO |
| bonus | ❌ ATIVO | ✅ DESABILITADO |
| user_subscriptions | ❌ ATIVO | ✅ DESABILITADO |
| webhook_logs | ❌ ATIVO | ✅ DESABILITADO |
| pending_plans | ❌ ATIVO | ✅ DESABILITADO |

---

**Após executar, me avisa e testa F5 novamente!** ✅
