WEBHOOK-VEGA CORRIGIDO - APENAS ALTERE ESSA LINHA:

Linha original:
const amt = body.total_price ? body.total_price / 100 : 0;

Mude para:
const amt = body.total_price ? body.total_price : 0;

Ou tente isso se ainda estiver errado:
const amt = typeof body.total_price === 'string' ? parseFloat(body.total_price) : (body.total_price || 0);
