import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Importar handlers dos webhooks
let webhookAmplopay;
let webhookVega;

try {
  const amplopayModule = await import('./netlify/functions/webhook-amplopay.js');
  webhookAmplopay = amplopayModule.handler;
  console.log('✅ Webhook Amplopay carregado');
} catch (error) {
  console.error('❌ Erro ao carregar webhook-amplopay:', error.message);
}

try {
  const vegaModule = await import('./netlify/functions/webhook-vega.js');
  webhookVega = vegaModule.handler;
  console.log('✅ Webhook Vega carregado');
} catch (error) {
  console.error('❌ Erro ao carregar webhook-vega:', error.message);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook Amplopay (GGCheckout)
app.post('/api/webhook-amplopay', async (req, res) => {
  try {
    console.log('📥 Webhook Amplopay recebido');

    if (!webhookAmplopay) {
      return res.status(503).json({ error: 'Webhook handler not loaded' });
    }

    // Criar evento compatível com Netlify Functions
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers,
      queryStringParameters: req.query,
    };

    const response = await webhookAmplopay(event, {});

    // Parse response
    const responseBody = typeof response.body === 'string'
      ? JSON.parse(response.body)
      : response.body;

    res.status(response.statusCode || 200).json(responseBody);
  } catch (error) {
    console.error('❌ Erro no webhook Amplopay:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook Vega
app.post('/api/webhook-vega', async (req, res) => {
  try {
    console.log('📥 Webhook Vega recebido');

    if (!webhookVega) {
      return res.status(503).json({ error: 'Webhook handler not loaded' });
    }

    // Criar evento compatível com Netlify Functions
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers,
      queryStringParameters: req.query,
    };

    const response = await webhookVega(event, {});

    // Parse response
    const responseBody = typeof response.body === 'string'
      ? JSON.parse(response.body)
      : response.body;

    res.status(response.statusCode || 200).json(responseBody);
  } catch (error) {
    console.error('❌ Erro no webhook Vega:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📌 Webhook Amplopay: POST http://localhost:${PORT}/api/webhook-amplopay`);
  console.log(`📌 Webhook Vega: POST http://localhost:${PORT}/api/webhook-vega`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
});
