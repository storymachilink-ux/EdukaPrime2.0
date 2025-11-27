-- ============================================================================
-- ADICIONAR CAMPO DRIVE_FOLDER_URL À TABELA PAPERCRAFTS
-- ============================================================================

-- Adicionar coluna drive_folder_url (se não existir)
ALTER TABLE public.papercrafts
ADD COLUMN IF NOT EXISTS drive_folder_url TEXT;

-- Criar comentário descritivo
COMMENT ON COLUMN public.papercrafts.drive_folder_url IS 'URL da pasta Google Drive contendo os PDFs e arquivos do papercraft';

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- 1. Esta migração adiciona a coluna drive_folder_url ao papercrafts
-- 2. Você pode atualizar os URLs das pastas Google Drive após executar este SQL
-- 3. Exemplo: UPDATE public.papercrafts SET drive_folder_url = 'https://drive.google.com/drive/folders/FOLDER_ID' WHERE title = 'Turma EdukaBoo';
