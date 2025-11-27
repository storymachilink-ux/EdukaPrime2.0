import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { target_user_id, token } = payload

    if (!target_user_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'user_id obrigatório' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: { user: adminUser }, error: adminError } = await supabaseAuth.auth.getUser(token)

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'Usuário não autenticado' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { data: adminData } = await supabaseClient
      .from('users')
      .select('is_admin')
      .eq('id', adminUser.id)
      .maybeSingle()

    if (!adminData?.is_admin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Apenas admins podem resetar senhas' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const { data: targetUser, error: userError } = await supabaseAuth.auth.admin.getUserById(target_user_id)

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'Usuário não encontrado' }),
        { status: 404, headers: corsHeaders }
      )
    }

    const provider = targetUser.user_metadata?.provider || 'email'

    if (provider === 'google' || provider === 'github' || provider === 'oauth') {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Não é possível resetar senha para usuários com login ${provider}`
        }),
        { status: 400, headers: corsHeaders }
      )
    }

    const tempPassword = generateTemporaryPassword()

    const { error: updateError } = await supabaseAuth.auth.admin.updateUserById(target_user_id, {
      password: tempPassword
    })

    if (updateError) {
      console.error('Erro ao resetar senha:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao resetar senha: ' + updateError.message }),
        { status: 500, headers: corsHeaders }
      )
    }

    await supabaseClient
      .from('admin_password_resets')
      .insert({
        admin_id: adminUser.id,
        user_id: target_user_id,
        temp_password: tempPassword,
        email: targetUser.email
      })

    console.log(`✅ Senha resetada para ${targetUser.email} por ${adminUser.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha resetada com sucesso',
        temp_password: tempPassword,
        email: targetUser.email,
        provider: provider
      }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
