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
