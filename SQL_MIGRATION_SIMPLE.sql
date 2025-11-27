-- Adicionar coluna available_for_plans em todas as tabelas
ALTER TABLE atividades ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE bonus ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
ALTER TABLE papercrafts ADD COLUMN IF NOT EXISTS available_for_plans INTEGER[] DEFAULT '{}'::INTEGER[];
