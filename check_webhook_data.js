import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lkhfbhvamnqgcqlrriaw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraGZiaHZhbW5xZ2NxbHJyaWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQxODk4MjksImV4cCI6MjAwOTc2OTgyOX0.WPeO4RxB_X0jIKIKvlLBPaMQWRhqWzLOwvw62pC4qbY'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkWebhookData() {
  try {
    console.log('Verificando últimos 5 webhooks...\n')

    const { data, error } = await supabase
      .from('webhook_logs')
      .select('id, created_at, platform, customer_email, product_id, product_title, amount, raw_payload')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    console.log('Dados dos webhooks:\n')
    data.forEach((log, idx) => {
      console.log(`${idx + 1}. ID: ${log.id}`)
      console.log(`   Data: ${log.created_at}`)
      console.log(`   Platform: ${log.platform}`)
      console.log(`   Email: ${log.customer_email}`)
      console.log(`   product_id: ${log.product_id || 'NULL'}`)
      console.log(`   product_title: ${log.product_title || 'NULL'}`)
      console.log(`   amount no banco: ${log.amount}`)

      // Tentar achar amount no raw_payload
      if (log.raw_payload) {
        console.log(`   raw_payload.amount: ${log.raw_payload.amount || 'não encontrado'}`)
        console.log(`   raw_payload.total_price: ${log.raw_payload.total_price || 'não encontrado'}`)
      }
      console.log()
    })

  } catch (error) {
    console.error('Erro:', error.message)
  }
}

checkWebhookData()
