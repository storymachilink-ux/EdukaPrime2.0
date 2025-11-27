-- ============================================================================
-- INSERIR DADOS REAIS DE PAPERCRAFTS (Do PaperSection.tsx)
-- ============================================================================

-- Limpar dados antigos se existirem
DELETE FROM public.papercrafts WHERE category IN ('Personagens', 'Decoração', 'Narrativa', 'Educativo', 'Natal', 'Halloween');

-- Inserir Papercrafts
INSERT INTO public.papercrafts (
  title,
  category,
  difficulty,
  description,
  model_count,
  min_age,
  max_age,
  image_url,
  price,
  is_active
) VALUES

-- ============= PERSONAGENS =============
(
  'Turma EdukaBoo',
  'Personagens',
  'fácil',
  'Conheça e monte todos os personagens icônicos da turma EdukaBoo. Personagens divertidos e educativos.',
  '27 modelos',
  4,
  12,
  '/paperlogin/TurmaEdukaboo.png',
  0,
  true
),

-- ============= DECORAÇÃO =============
(
  'Decoração',
  'Decoração',
  'médio',
  'Crie decorações incríveis para sua casa ou sala de aula. Padrões variados e criativos.',
  '25 modelos',
  5,
  12,
  '/paperlogin/decoracaoboo.png',
  0,
  true
),

-- ============= NARRATIVA =============
(
  'Histórias',
  'Narrativa',
  'médio',
  'Papercrafts temáticos inspirados em histórias clássicas e modernas. Mergulhe em aventuras criativas.',
  'Variados',
  6,
  12,
  '/paperlogin/Historiaboo.png',
  0,
  true
),

-- ============= EDUCATIVO =============
(
  'Atividades Lúdicas',
  'Educativo',
  'fácil',
  'Atividades divertidas que combinam aprendizado com diversão. Brincadeiras que ensinam.',
  '6 modelos',
  4,
  10,
  '/paperlogin/Atividadesboo.png',
  0,
  true
),

-- ============= NATAL =============
(
  'Kit Básico Natalino',
  'Natal',
  'fácil',
  'Kit Básico Natalino — 20 modelos perfeitos para iniciantes. Inclui enfeites simples e criativos.',
  '20 modelos',
  4,
  12,
  '/Natal/BasicoNatal.png',
  0,
  true
),

(
  'Kit Completo Natal',
  'Natal',
  'médio',
  'Kit Completo Natal — 60+ modelos para explorar criatividade completa. Inclui desde enfeites a presentes.',
  '60+ modelos',
  4,
  12,
  '/Natal/CompletoNatal.png',
  0,
  true
),

(
  'Bônus Natalinos',
  'Natal',
  'médio',
  'Bônus Natalinos — Exclusivos. Coleção especial com modelos únicos e premium.',
  'Exclusivos',
  4,
  12,
  '/Natal/BonusNatal.png',
  0,
  true
)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Usamos ON CONFLICT DO NOTHING para evitar duplicatas
-- 2. Todos começam com preço 0 (grátis para usuários com acesso)
-- 3. is_active = true para que apareçam no dashboard
-- 4. Os campos description e model_count foram adaptados da PaperSection
-- 5. As imagens devem existir nas pastas /public/paperlogin/ e /public/Natal/
