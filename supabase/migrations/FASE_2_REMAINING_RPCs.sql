-- ============================================================================
-- FASE 2 - REMAINING RPC FUNCTIONS
-- Tickets, Chat, and Notifications
-- ============================================================================

-- ============================================================================
-- TICKET FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_support_ticket(
  p_user_id UUID,
  p_category TEXT,
  p_title TEXT,
  p_description TEXT,
  p_contact_email TEXT DEFAULT NULL,
  p_contact_whatsapp TEXT DEFAULT NULL,
  p_file_url TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, success BOOLEAN, message TEXT) AS $$
BEGIN
  INSERT INTO tickets (user_id, category, title, description, contact_email, contact_whatsapp, file_url, link, status, created_at)
  VALUES (p_user_id, p_category, p_title, p_description, p_contact_email, p_contact_whatsapp, p_file_url, p_link, 'aberto', NOW())
  RETURNING tickets.id, TRUE, 'Ticket criado com sucesso'::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_user_ticket(
  p_ticket_id UUID,
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  DELETE FROM tickets WHERE id = p_ticket_id AND user_id = p_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Ticket deletado com sucesso'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'Ticket não encontrado ou acesso negado'::TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CHAT FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION send_chat_message(
  p_user_id UUID,
  p_message_text TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_message_id UUID;
  v_existing_stats RECORD;
BEGIN
  INSERT INTO chat_messages (user_id, message_text, image_url, created_at)
  VALUES (p_user_id, p_message_text, p_image_url, NOW())
  RETURNING chat_messages.id INTO v_message_id;

  SELECT * INTO v_existing_stats FROM chat_user_stats WHERE user_id = p_user_id;

  IF v_existing_stats IS NOT NULL THEN
    UPDATE chat_user_stats
    SET total_points = total_points + 10,
        last_message_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    INSERT INTO chat_user_stats (user_id, total_points, last_message_at)
    VALUES (p_user_id, 10, NOW());
  END IF;

  RETURN QUERY SELECT v_message_id, TRUE, 'Mensagem enviada com sucesso'::TEXT;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION accept_chat_terms(
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE users
  SET chat_terms_accepted = TRUE,
      chat_terms_accepted_at = NOW()
  WHERE id = p_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Termos aceitos com sucesso'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'Usuário não encontrado'::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTIFICATION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_broadcast_notification(
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT,
  p_button_color TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_is_pinned BOOLEAN DEFAULT FALSE,
  p_days_to_expire INT DEFAULT NULL,
  p_target_audience TEXT DEFAULT 'all'
)
RETURNS TABLE(id UUID, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_broadcast_id UUID;
BEGIN
  INSERT INTO broadcast_notifications (
    type, title, message, icon, button_color, action_url, action_label,
    is_pinned, days_to_expire, target_audience, is_active, created_at
  )
  VALUES (
    p_type, p_title, p_message, p_icon, p_button_color, p_action_url, p_action_label,
    p_is_pinned, p_days_to_expire, p_target_audience, TRUE, NOW()
  )
  RETURNING broadcast_notifications.id INTO v_broadcast_id;

  RETURN QUERY SELECT v_broadcast_id, TRUE, 'Notificação broadcast criada com sucesso'::TEXT;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_individual_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_is_pinned BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(id UUID, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, icon, action_url, action_label,
    is_pinned, read, created_at
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_icon, p_action_url, p_action_label,
    p_is_pinned, FALSE, NOW()
  )
  RETURNING notifications.id INTO v_notification_id;

  RETURN QUERY SELECT v_notification_id, TRUE, 'Notificação criada com sucesso'::TEXT;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_broadcast_notification(
  p_broadcast_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  DELETE FROM broadcast_notifications WHERE id = p_broadcast_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Notificação broadcast deletada para todos os usuários'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'Broadcast não encontrado'::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID,
  p_source TEXT DEFAULT 'individual'
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  IF p_source = 'broadcast' THEN
    INSERT INTO broadcast_notification_reads (broadcast_id, user_id)
    VALUES (p_notification_id, p_user_id)
    ON CONFLICT DO NOTHING;
    RETURN QUERY SELECT TRUE, 'Notificação broadcast marcada como lida'::TEXT;
  ELSE
    UPDATE notifications
    SET read = TRUE, read_at = NOW()
    WHERE id = p_notification_id AND user_id = p_user_id;
    RETURN QUERY SELECT TRUE, 'Notificação marcada como lida'::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID,
  p_broadcast_ids UUID[] DEFAULT NULL,
  p_individual_ids UUID[] DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  IF p_broadcast_ids IS NOT NULL AND array_length(p_broadcast_ids, 1) > 0 THEN
    INSERT INTO broadcast_notification_reads (broadcast_id, user_id)
    SELECT unnest(p_broadcast_ids), p_user_id
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_individual_ids IS NOT NULL AND array_length(p_individual_ids, 1) > 0 THEN
    UPDATE notifications
    SET read = TRUE, read_at = NOW()
    WHERE id = ANY(p_individual_ids) AND user_id = p_user_id;
  END IF;

  RETURN QUERY SELECT TRUE, 'Todas as notificações marcadas como lidas'::TEXT;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_notification(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  DELETE FROM notifications WHERE id = p_notification_id AND user_id = p_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Notificação deletada'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'Notificação não encontrada ou acesso negado'::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_broadcast_read(
  p_broadcast_id UUID,
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  DELETE FROM broadcast_notification_reads
  WHERE broadcast_id = p_broadcast_id AND user_id = p_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Notificação broadcast removida'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'Leitura de broadcast não encontrada'::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
