-- Adicionar vídeos da seção Criatividade (papercrafts tutoriais)
-- Categoria: Criatividade
-- Estes são vídeos do paper-dashboard movidos para a área de vídeos

INSERT INTO public.videos (
  titulo,
  duracao,
  categoria,
  descricao,
  youtube_url,
  thumbnail,
  plano_minimo,
  created_at
) VALUES
(
  'Fazendo Estrela da Sorte',
  '12:34',
  'Criatividade',
  'Tutorial para criar uma estrela da sorte decorativa e divertida',
  'https://www.youtube.com/watch?v=aCa861SPWxA',
  'https://img.youtube.com/vi/aCa861SPWxA/maxresdefault.jpg',
  2,
  NOW()
),
(
  'Como fazer um Dragão',
  '15:20',
  'Criatividade',
  'Tutorial completo para montar um dragão incrível em papel',
  'https://www.youtube.com/watch?v=YqHG9Zfs1pg',
  'https://img.youtube.com/vi/YqHG9Zfs1pg/maxresdefault.jpg',
  2,
  NOW()
),
(
  'Morcego com Asas Móveis',
  '18:45',
  'Criatividade',
  'Tutorial avançado para criar um morcego com asas que se movem',
  'https://www.youtube.com/watch?v=kBJGchWe6uU',
  'https://img.youtube.com/vi/kBJGchWe6uU/maxresdefault.jpg',
  2,
  NOW()
),
(
  'Mini Garras de Papel',
  '10:30',
  'Criatividade',
  'Aprenda a criar mini garras assustadoras e divertidas em papel',
  'https://www.youtube.com/watch?v=7DgeeWsf_dQ',
  'https://img.youtube.com/vi/7DgeeWsf_dQ/maxresdefault.jpg',
  2,
  NOW()
),
(
  'Gato Pulante de Origami',
  '12:15',
  'Criatividade',
  'Aprenda a criar um gato pulante divertido usando técnicas de origami',
  'https://www.youtube.com/watch?v=JvmXVeem2lI',
  'https://img.youtube.com/vi/JvmXVeem2lI/maxresdefault.jpg',
  2,
  NOW()
),
(
  'Criando Decorações Extras',
  '14:15',
  'Criatividade',
  'Ideias criativas para complementar seus papercrafts com decorações únicas',
  'https://www.youtube.com/watch?v=DYbiE1OdCfE',
  'https://img.youtube.com/vi/DYbiE1OdCfE/maxresdefault.jpg',
  2,
  NOW()
);
