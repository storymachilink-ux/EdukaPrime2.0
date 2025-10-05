// Função de teste super simples - SEMPRE retorna JSON válido
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Content-Type': 'application/json'
  };

  // Aceita qualquer método para teste
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Função Netlify funcionando!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      hasBody: !!event.body
    })
  };
};
