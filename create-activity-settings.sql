-- Script SQL para criar tabela de configurações das atividades base
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela activity_settings para links editáveis das atividades base
CREATE TABLE IF NOT EXISTS public.activity_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id TEXT NOT NULL UNIQUE,
    drive_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.activity_settings ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler configurações
CREATE POLICY "Authenticated users can view activity_settings" ON public.activity_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política: Apenas admins podem modificar configurações
CREATE POLICY "Admins can manage activity_settings" ON public.activity_settings
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_metadata'::text::json ->> 'role' = 'admin'
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_activity_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS on_activity_settings_updated ON public.activity_settings;
CREATE TRIGGER on_activity_settings_updated
    BEFORE UPDATE ON public.activity_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_activity_settings_updated_at();

-- Inserir configurações iniciais para as 7 atividades base
INSERT INTO public.activity_settings (activity_id, drive_url, is_active) VALUES
('atividades-fonetica', 'https://drive.google.com/drive/folders/1jPO2rcf0JTExMV3ygEmD00LaSrl64Vyn?usp=sharing', true),
('metodo-numerico-infantil', 'https://drive.google.com/drive/folders/1cJyhpEAGsS188IKnqI8k5BDN4knSUEu-?usp=sharing', true),
('atividades-ortografia', 'https://drive.google.com/file/d/15JzN0qH0c0mluXlHI7nfoSdwwfFx6wVD/view?usp=sharing', true),
('atividades-gramatica', 'https://drive.google.com/file/d/1y9l1oK1xB-lowpqs053ahdRhwmJSdiYj/view?usp=sharing', true),
('atividades-interpretacao', 'https://drive.google.com/file/d/1XVjvHgbAGh1z6kqSmdUUEgAY-xh0rdhu/view?usp=sharing', true),
('atividades-genero-textual', 'https://drive.google.com/file/d/1GooGfBmTNVbWz59KvR35HXLWxcYcjng1/view?usp=sharing', true),
('coletanea-textos-literarios', 'https://drive.google.com/file/d/1nJ-gqn6vL_mj6y7znaMu2bfgbIba5Z5A/view?usp=sharing', true)
ON CONFLICT (activity_id) DO UPDATE SET
    drive_url = EXCLUDED.drive_url,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Comentários para documentação
COMMENT ON TABLE public.activity_settings IS 'Configurações editáveis para as atividades base do sistema';
COMMENT ON COLUMN public.activity_settings.activity_id IS 'ID da atividade base (deve corresponder ao ID em baseActivities.ts)';
COMMENT ON COLUMN public.activity_settings.drive_url IS 'URL do Google Drive editável via admin';
COMMENT ON COLUMN public.activity_settings.is_active IS 'Se a atividade está ativa ou desativada';