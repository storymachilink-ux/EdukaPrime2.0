console.log('SQL para verificar se trigger esta sobrescrevendo:')
console.log(`
SELECT
  u.email,
  pu.plano_ativo,
  pu.created_at,
  u.created_at as auth_created
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email = 'storymachilink@gmail.com';
`)

console.log('\nSQL para desabilitar trigger temporariamente:')
console.log(`
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
`)

console.log('\nSQL para recriar trigger SEM sobrescrever dados existentes:')
console.log(`
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plano_ativo, is_admin)
  VALUES (new.id, new.email, 0, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`)