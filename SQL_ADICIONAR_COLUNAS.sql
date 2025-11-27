-- Adicionar colunas de Comunidade e Suporte VIP na tabela plans_v2

ALTER TABLE plans_v2
ADD COLUMN IF NOT EXISTS has_comunidade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_suporte_vip BOOLEAN DEFAULT false;

-- Verificar se foram adicionadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plans_v2'
AND column_name IN ('has_comunidade', 'has_suporte_vip')
ORDER BY column_name;
