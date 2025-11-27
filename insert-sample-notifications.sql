-- Inserir notificações de exemplo
INSERT INTO notifications (title, message, type, target_plans) VALUES
(
  '🎉 Bem-vindo ao EdukaPrime!',
  'Obrigado por se juntar à nossa plataforma educacional. Explore todas as atividades disponíveis no seu plano.',
  'success',
  '{0,1,2,3,5}'
),
(
  '📚 Novas Atividades Adicionadas',
  '15 novas atividades de matemática foram adicionadas para o ensino fundamental. Confira agora!',
  'info',
  '{1,2,3,5}'
),
(
  '🎥 Novos Vídeos Disponíveis',
  'Adicionamos 5 novos vídeos sobre técnicas de alfabetização. Disponível para planos Evoluir e Prime.',
  'info',
  '{2,3,5}'
),
(
  '🎁 Materiais Bônus Exclusivos',
  'Novos materiais bônus foram liberados! Planejamentos de aula e jogos educativos aguardam por você.',
  'success',
  '{2,3,5}'
),
(
  '⭐ Upgrade seu Plano',
  'Aproveite nossa promoção especial e faça upgrade para o plano Prime com 30% de desconto!',
  'warning',
  '{0,1,2}'
),
(
  '👑 Funcionalidades Prime',
  'Como usuário Prime, você tem acesso a suporte VIP e todos os conteúdos exclusivos da plataforma.',
  'info',
  '{3,5}'
),
(
  '🔧 Manutenção Programada',
  'Teremos uma breve manutenção no sistema amanhã das 2h às 4h da manhã. Pedimos desculpas por qualquer inconveniente.',
  'warning',
  '{0,1,2,3,5}'
);