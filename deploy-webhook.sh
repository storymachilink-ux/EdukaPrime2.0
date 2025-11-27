#!/bin/bash

echo "🚀 Deploy do Sistema de Webhook AmploPay - EdukaPrime"
echo "===================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_ID="vijlwgrgaliptkbghfdg"
PRODUCTION_URL="https://edukaprime.com.br"

echo -e "${BLUE}📋 Configuração:${NC}"
echo "   Project ID: $PROJECT_ID"
echo "   Production URL: $PRODUCTION_URL"
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não encontrado. Instalando...${NC}"
    npm install -g supabase
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar Supabase CLI${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"

# Verificar se está logado
echo -e "${BLUE}🔐 Verificando login no Supabase...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}❌ Não está logado no Supabase.${NC}"
    echo -e "${YELLOW}Execute: supabase login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login verificado${NC}"

# Verificar se está no diretório correto
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}❌ Arquivo supabase/config.toml não encontrado${NC}"
    echo -e "${YELLOW}Certifique-se de que está no diretório raiz do projeto${NC}"
    exit 1
fi

# Link do projeto
echo -e "${BLUE}🔗 Conectando ao projeto...${NC}"
supabase link --project-ref $PROJECT_ID
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao conectar ao projeto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Projeto conectado${NC}"

# Aplicar migrations primeiro
echo -e "${BLUE}🗄️ Aplicando migrations do banco de dados...${NC}"
supabase db push
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations aplicadas com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️ Erro ao aplicar migrations (pode ser normal se já estiverem aplicadas)${NC}"
fi

# Deploy da Edge Function
echo -e "${BLUE}📦 Fazendo deploy da Edge Function...${NC}"
supabase functions deploy amplopay-webhook --project-ref $PROJECT_ID
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Edge Function deployed com sucesso!${NC}"
    WEBHOOK_URL="https://$PROJECT_ID.supabase.co/functions/v1/amplopay-webhook"
    echo -e "${GREEN}📡 URL do webhook: $WEBHOOK_URL${NC}"
else
    echo -e "${RED}❌ Erro ao fazer deploy da Edge Function${NC}"
    exit 1
fi

# Testar a função
echo -e "${BLUE}🧪 Testando a função...${NC}"
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$WEBHOOK_URL" > /tmp/webhook_test
if [ "$(cat /tmp/webhook_test)" = "200" ]; then
    echo -e "${GREEN}✅ Função está respondendo corretamente${NC}"
else
    echo -e "${YELLOW}⚠️ Função pode não estar respondendo (código: $(cat /tmp/webhook_test))${NC}"
fi

# Verificar logs recentes
echo -e "${BLUE}📋 Verificando logs recentes...${NC}"
supabase functions logs --project-ref $PROJECT_ID | head -10

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📝 Configuração no AmploPay:${NC}"
echo "   1. Acesse o painel AmploPay"
echo "   2. Vá em Configurações > Webhooks"
echo "   3. Adicione um novo webhook:"
echo -e "      ${YELLOW}URL: $WEBHOOK_URL${NC}"
echo -e "      ${YELLOW}Eventos: TRANSACTION_PAID${NC}"
echo -e "      ${YELLOW}Método: POST${NC}"
echo -e "      ${YELLOW}Content-Type: application/json${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "   ${YELLOW}Ver logs:${NC} supabase functions logs amplopay-webhook"
echo -e "   ${YELLOW}Testar localmente:${NC} supabase functions serve"
echo -e "   ${YELLOW}Atualizar função:${NC} supabase functions deploy amplopay-webhook"
echo ""
echo -e "${BLUE}🎯 Para testar:${NC}"
echo "   1. Use o simulador em Admin > Webhook no painel"
echo "   2. Ou faça uma compra real no AmploPay"
echo "   3. Monitore os logs para debug"
echo ""

# Criar arquivo de configuração para referência
cat > webhook-config.txt << EOF
🚀 Configuração do Webhook AmploPay - EdukaPrime

URL do Webhook: $WEBHOOK_URL
Project ID: $PROJECT_ID
Deploy Date: $(date)

Configuração no AmploPay:
- URL: $WEBHOOK_URL
- Eventos: TRANSACTION_PAID
- Método: POST
- Content-Type: application/json

Offer Codes:
- LIGRMS3: Plano Essencial (Nível 1)
- ZMTP2IV: Plano Evoluir (Nível 2)
- VBAQ4J3: Plano Prime (Nível 3)

Comandos úteis:
- Ver logs: supabase functions logs amplopay-webhook
- Deploy: supabase functions deploy amplopay-webhook
- Link: supabase link --project-ref $PROJECT_ID
EOF

echo -e "${GREEN}📁 Configuração salva em: webhook-config.txt${NC}"
echo -e "${GREEN}✅ Tudo pronto para produção!${NC}"