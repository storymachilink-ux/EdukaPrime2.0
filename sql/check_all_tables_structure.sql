SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('atividades', 'videos', 'bonus') AND column_name = 'is_active' ORDER BY table_name;
