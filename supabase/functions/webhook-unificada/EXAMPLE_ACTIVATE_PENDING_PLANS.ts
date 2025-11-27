/**
 * EXEMPLO: Como chamar activate_pending_plans() após signup
 *
 * Quando um usuário se registra, você deve:
 * 1. Criar o usuário em auth.users
 * 2. Criar o registro em users table
 * 3. Chamar a função activate_pending_plans() para ativar seus pending_plans
 *
 * Esta é uma EDGE FUNCTION de exemplo que você pode integrar ao seu signup
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { user_id, user_email } = await req.json()

    if (!user_id || !user_email) {
      return new Response(
        JSON.stringify({ error: 'user_id e user_email são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔄 Ativando pending_plans para: ${user_email}`)

    // ═══════════════════════════════════════════════════════════════════════════
    // CHAMAR A FUNÇÃO: activate_pending_plans()
    // ═══════════════════════════════════════════════════════════════════════════
    const { data, error } = await supabase
      .rpc('activate_pending_plans', {
        p_user_id: user_id,
        p_user_email: user_email,
      })

    if (error) {
      console.error('❌ Erro ao ativar pending_plans:', error.message)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Pending plans ativados:`, data)

    // data = [{ total_activated: 2, last_plan_id: 1 }]
    const result = data?.[0]
    const total_activated = result?.total_activated || 0
    const last_plan_id = result?.last_plan_id || null

    return new Response(
      JSON.stringify({
        success: true,
        message: `${total_activated} plano(s) ativado(s)`,
        total_activated,
        last_plan_id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('❌ ERRO:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * COMO USAR:
 *
 * // No seu signup (React, Next.js, etc):
 * const activatePendingPlans = async (userId: string, email: string) => {
 *   const response = await fetch(
 *     'https://seu-supabase-url/functions/v1/activate-pending-plans',
 *     {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({
 *         user_id: userId,
 *         user_email: email,
 *       }),
 *     }
 *   )
 *   const result = await response.json()
 *   console.log(`${result.total_activated} plano(s) ativado(s)`)
 * }
 *
 * // Chamar após criar usuário:
 * await activatePendingPlans(newUser.id, newUser.email)
 */

/**
 * ALTERNATIVA: Chamar SQL diretamente (sem Edge Function)
 *
 * Se você estiver em um contexto onde pode executar SQL diretamente:
 *
 * const { data, error } = await supabase
 *   .rpc('activate_pending_plans', {
 *     p_user_id: userId,
 *     p_user_email: userEmail,
 *   })
 *
 * if (error) console.error('Erro:', error)
 * else console.log('Planos ativados:', data)
 */
