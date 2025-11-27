/**
 * WEBHOOK ENDPOINT SIMPLES - PARA USAR EM QUALQUER SERVIDOR
 *
 * Este arquivo pode ser usado em:
 * - Vercel (vercel.com) - GRATUITO
 * - Netlify Functions - GRATUITO
 * - Railway (railway.app) - GRATUITO
 * - Heroku - GRATUITO (com limitações)
 * - Qualquer servidor Node.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://vijlwgrgaliptkbghfdg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamx3Z3JnYWxpcHRrYmdoZmRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM5NTg0MywiZXhwIjoyMDczOTcxODQzfQ.m3k4J5K3lG-QfXwF4vZH9LRuKfCd2vFaP8qE7nT6xYw'; // Substitua pela SERVICE_ROLE_KEY real

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Função principal do webhook
 */
async function handleWebhook(request) {
  console.log('🚀 [WEBHOOK] Recebida requisição');

  // Permitir CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Parse do body
    const webhookData = await request.json();

    console.log('📋 [WEBHOOK] Dados recebidos:', {
      event: webhookData.event,
      email: webhookData.client?.email,
      offerCode: webhookData.offerCode,
      transactionId: webhookData.transaction?.id
    });

    // Chamar função SQL do Supabase
    const { data: result, error } = await supabase
      .rpc('process_amplopay_webhook', {
        webhook_data: webhookData
      });

    if (error) {
      console.error('❌ [WEBHOOK] Erro na função SQL:', error);
      throw new Error(`Erro SQL: ${error.message}`);
    }

    console.log('✅ [WEBHOOK] Resultado:', result);

    if (!result.success) {
      return new Response(
        JSON.stringify(result),
        { status: 400, headers: corsHeaders }
      );
    }

    // Resposta de sucesso
    return new Response(
      JSON.stringify({
        ...result,
        timestamp: new Date().toISOString(),
        processed_by: 'EdukaPrime Webhook'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('💥 [WEBHOOK] Erro crítico:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// ====================
// DEPLOY EM VERCEL
// ====================
// 1. Criar conta no vercel.com
// 2. Instalar Vercel CLI: npm i -g vercel
// 3. Na pasta do projeto: vercel --prod
// 4. URL gerada será algo como: https://projeto.vercel.app/api/webhook

// Para Vercel, exporte assim:
module.exports = async (req, res) => {
  const request = {
    method: req.method,
    json: () => Promise.resolve(req.body)
  };

  const response = await handleWebhook(request);
  const data = await response.json();

  res.status(response.status).json(data);
};

// ====================
// DEPLOY EM NETLIFY
// ====================
// 1. Criar pasta netlify/functions/
// 2. Colocar este arquivo como netlify/functions/webhook.js
// 3. Deploy no netlify.com
// 4. URL será: https://site.netlify.app/.netlify/functions/webhook

// Para Netlify, descomente:
/*
exports.handler = async (event, context) => {
  const request = {
    method: event.httpMethod,
    json: () => Promise.resolve(JSON.parse(event.body || '{}'))
  };

  const response = await handleWebhook(request);
  const data = await response.json();

  return {
    statusCode: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
};
*/

// ====================
// DEPLOY EM RAILWAY
// ====================
// 1. Criar conta no railway.app
// 2. Conectar repositório GitHub
// 3. Railway faz deploy automático
// 4. URL será: https://projeto.railway.app/webhook

// Para Railway/Express, descomente:
/*
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const request = {
    method: 'POST',
    json: () => Promise.resolve(req.body)
  };

  const response = await handleWebhook(request);
  const data = await response.json();

  res.status(response.status).json(data);
});

app.listen(port, () => {
  console.log(`🚀 Webhook rodando na porta ${port}`);
});
*/