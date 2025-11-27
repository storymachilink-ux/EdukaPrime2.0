-- ============================================
-- TABELA DE GASTOS DO ADMIN
-- ============================================

CREATE TABLE IF NOT EXISTS admin_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) DEFAULT 'outros',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_expenses_created_at ON admin_expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_expenses_category ON admin_expenses(category);

-- RLS Policies (apenas admins podem gerenciar)
ALTER TABLE admin_expenses ENABLE ROW LEVEL SECURITY;

-- Service role acesso total
DROP POLICY IF EXISTS "admin_expenses_service_all" ON admin_expenses;
CREATE POLICY "admin_expenses_service_all"
ON admin_expenses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Apenas admins autenticados podem gerenciar
DROP POLICY IF EXISTS "admin_expenses_admin_all" ON admin_expenses;
CREATE POLICY "admin_expenses_admin_all"
ON admin_expenses FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- ============================================
-- ✅ TABELA CRIADA
-- ============================================

SELECT '✅ Tabela admin_expenses criada com sucesso!' as status;
