-- Adicionar coluna auto_delete_on_click à tabela notifications
ALTER TABLE notifications
ADD COLUMN auto_delete_on_click BOOLEAN DEFAULT FALSE;

-- Adicionar coluna auto_delete_on_click à tabela broadcast_notifications
ALTER TABLE broadcast_notifications
ADD COLUMN auto_delete_on_click BOOLEAN DEFAULT FALSE;
