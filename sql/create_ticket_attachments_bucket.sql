-- Criar bucket para anexos de tickets de suporte
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir usuários autenticados fazerem upload
CREATE POLICY "Usuários autenticados podem fazer upload de anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

-- Política para permitir leitura pública dos anexos
CREATE POLICY "Anexos são publicamente acessíveis"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-attachments');

-- Política para permitir usuários autenticados deletarem seus próprios arquivos
CREATE POLICY "Usuários podem deletar seus próprios anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ticket-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
