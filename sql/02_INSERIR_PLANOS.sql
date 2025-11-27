-- ========================================
-- PASSO 2: INSERIR 5 PLANOS
-- ========================================
-- Execute ISSO TERCEIRO no Supabase SQL Editor

INSERT INTO plans_v2 (id, name, display_name, description, price, payment_type, duration_days, checkout_url, product_id_gateway, icon, order_position, is_active)
VALUES
  (0, 'GRATUITO', 'Plano Gratuito', 'Acesso limitado com alguns conteúdos gratuitos', 0.00, 'mensal', NULL, NULL, NULL, '🎁', 0, true),
  (1, 'ESSENCIAL', 'Plano Essencial', 'Acesso a atividades BNCC + Suporte WhatsApp', 17.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGM', 'lDGnSUHPwxWlHBlPEIFy', '⭐', 1, true),
  (2, 'EVOLUIR', 'Plano Evoluir', 'Atividades + Vídeos + Bônus', 27.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGO', 'WpjID8aV49ShaQ07ABzP', '🚀', 2, true),
  (3, 'PRIME', 'Plano Prime', 'Acesso total + Suporte VIP 24/7', 49.99, 'mensal', 30, 'https://checkout.edukaprime.com.br/VCCL1O8SCCGP', 'eOGqcq0IbQnJUpjKRpsG', '👑', 3, true),
  (4, 'VITALICIO', 'Acesso Vitalício', 'Acesso permanente a todos os conteúdos', 197.99, 'unico', NULL, 'https://checkout.edukaprime.com.br/VITALICIO', NULL, '💎', 4, true);

-- Verificar: SELECT COUNT(*) FROM plans_v2; (deve retornar 5)

-- ========================================
-- PRONTO! Agora execute o próximo arquivo:
-- 03_CRIAR_PLAN_FEATURES.sql
-- ========================================
