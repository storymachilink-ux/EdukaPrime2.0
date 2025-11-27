import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const payload = await req.json()

    const { action, platform, secret, token } = payload

    if (!action) {
      return new Response(
        JSON.stringify({ success: false, message: 'Action obrigatória' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Usuário não autenticado' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!userData?.is_admin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Apenas admins podem gerenciar secrets' }),
        { status: 403, headers: corsHeaders }
      )
    }

    if (action === 'save') {
      if (!platform || !secret) {
        return new Response(
          JSON.stringify({ success: false, message: 'Platform e secret são obrigatórios' }),
          { status: 400, headers: corsHeaders }
        )
      }

      if (!['vega', 'ggcheckout', 'amplopay'].includes(platform)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Platform inválida' }),
          { status: 400, headers: corsHeaders }
        )
      }

      if (!secret || secret.trim() === '') {
        return new Response(
          JSON.stringify({ success: false, message: 'Secret não pode estar vazio' }),
          { status: 400, headers: corsHeaders }
        )
      }

      const { data, error } = await supabase
        .from('webhook_secrets')
        .upsert(
          {
            platform: platform,
            secret: secret,
            is_active: true,
            created_by: user.id,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'platform' }
        )
        .select()

      if (error) {
        console.error('Erro ao salvar secret:', error)
        return new Response(
          JSON.stringify({ success: false, message: 'Erro ao salvar secret: ' + error.message }),
          { status: 500, headers: corsHeaders }
        )
      }

      console.log(`✅ Secret de ${platform} salvo por ${user.email}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Secret de ${platform} salvo com sucesso!`,
          platform: platform
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (action === 'status') {
      const { data, error } = await supabase
        .from('webhook_secrets')
        .select('platform, is_active, updated_at')
        .order('platform')

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Erro ao carregar status' }),
          { status: 500, headers: corsHeaders }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: data?.map(s => ({
            platform: s.platform,
            is_configured: true,
            is_active: s.is_active,
            updated_at: s.updated_at
          })) || []
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (action === 'delete') {
      if (!platform) {
        return new Response(
          JSON.stringify({ success: false, message: 'Platform obrigatória' }),
          { status: 400, headers: corsHeaders }
        )
      }

      const { error } = await supabase
        .from('webhook_secrets')
        .delete()
        .eq('platform', platform)

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Erro ao deletar secret' }),
          { status: 500, headers: corsHeaders }
        )
      }

      console.log(`✅ Secret de ${platform} deletado por ${user.email}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Secret de ${platform} deletado com sucesso!`
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Action inválida' }),
      { status: 400, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
