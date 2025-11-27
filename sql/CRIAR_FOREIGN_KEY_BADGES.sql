-- ============================================
-- CRIAR FOREIGN KEY ENTRE user_badges e badges
-- ============================================

-- Verificar se a FK já existe
DO $$
BEGIN
    -- Tentar criar a foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_badges_badge_id_fkey'
        AND table_name = 'user_badges'
    ) THEN
        -- Criar Foreign Key
        ALTER TABLE user_badges
        ADD CONSTRAINT user_badges_badge_id_fkey
        FOREIGN KEY (badge_id) REFERENCES badges(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✅ Foreign Key criada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Foreign Key já existe';
    END IF;
END $$;

-- Verificar se foi criada
SELECT
    '✅ VERIFICAÇÃO DE FOREIGN KEYS' as status,
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_badges'
    AND constraint_type = 'FOREIGN KEY';

-- Recarregar schema cache do PostgREST (Supabase)
NOTIFY pgrst, 'reload schema';

SELECT '🔄 Schema cache recarregado!' as status;
