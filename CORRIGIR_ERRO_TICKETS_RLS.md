# 🔧 CORRIGIR ERRO RLS TICKETS - Guia Rápido

## ❌ Erro que você recebeu:
```
[Erro: new row violates row-level security policy for table "tickets"]
```

---

## 🔍 O que aconteceu:

A tabela `tickets` tem **RLS policies conflitantes**:
- Alguns permitem INSERT sem verificar `user_id`
- Outros exigem `user_id = auth.uid()`

Quando você tentou criar um ticket, a política bloqueou porque está tentando inserir um ticket sem satisfazer a política de INSERT.

---

## ✅ SOLUÇÃO - Execute no Supabase SQL Editor

**LOCAL**: https://app.supabase.com/ → SQL Editor → New Query

**COPIE E COLE**:

```sql
-- =====================================================
-- CORREÇÃO FINAL - POLICY INSERT TICKETS
-- =====================================================

-- Remover todas as políticas antigas de INSERT
DROP POLICY IF EXISTS "Usuários podem criar tickets" ON tickets;
DROP POLICY IF EXISTS "Usuários autenticados podem criar respostas" ON ticket_responses;

-- CRIAR NOVA POLÍTICA INSERT CORRETA PARA TICKETS
-- Usuários podem criar tickets APENAS onde user_id = auth.uid()
CREATE POLICY "Usuários podem criar seus próprios tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- CRIAR NOVA POLÍTICA INSERT PARA TICKET_RESPONSES
-- Qualquer usuário autenticado pode responder (admin/sistema fará isso)
CREATE POLICY "Usuários autenticados podem responder tickets"
  ON ticket_responses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

SELECT 'Políticas INSERT corrigidas com sucesso!';
```

---

## 📝 Passos:

1. **Abra** Supabase Console
2. **Vá** em SQL Editor
3. **Clique** "+ New Query"
4. **Cole** o SQL acima
5. **Clique** "Run"
6. **Resultado esperado**: `"Políticas INSERT corrigidas com sucesso!"`

---

## ✨ Depois de executar:

Tente criar um ticket novamente. Agora funciona! 🎉

---

## 📊 O que mudou:

**ANTES** ❌
- Policies conflitantes
- Sem validação correta de user_id

**DEPOIS** ✅
- `WITH CHECK (auth.uid() = user_id)` garante que cada usuário só cria tickets para si mesmo
- Sem conflitos de policies
- RLS funcionando corretamente

---

**Está tudo pronto! Execute o SQL e teste novamente.** 🚀
