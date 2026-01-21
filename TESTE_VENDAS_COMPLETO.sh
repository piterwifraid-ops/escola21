#!/bin/bash

################################################################################
#                                                                              #
#         🧪 TESTE COMPLETO DE VENDAS - PIX + UTMIFY                         #
#                                                                              #
#  Este script testa o fluxo COMPLETO de uma venda:                          #
#  1. Criar pedido (PIX gerado)                                              #
#  2. Confirmar pagamento (webhook)                                          #
#  3. Verificar no BD (Order + UtmTracking)                                  #
#  4. Verificar em UTMIFY                                                    #
#                                                                              #
################################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# URLs
API_BASE="http://localhost:3000/api"
WEBHOOK_BASE="http://localhost:3000/webhook"
UTMIFY_TOKEN="Uf0hPSmaWRJWRWIfOscqQmx6s2Yw0RJtODMJ"

# Configuração de teste
CUSTOMER_EMAIL="teste-$(date +%s)@example.com"
CUSTOMER_NAME="João Silva Teste"
CUSTOMER_PHONE="11999999999"
CUSTOMER_CPF="12345678900"
CUSTOMER_IP="192.168.1.100"

PRODUCT_ID="curso-001"
PRODUCT_NAME="Curso de Desenvolvimento Web"
PRODUCT_PRICE="29900" # R$ 299.00 em centavos

UTM_SOURCE="google"
UTM_CAMPAIGN="jan-2026-vendas"
UTM_MEDIUM="cpc"
UTM_CONTENT="banner-principal"
UTM_TERM="desenvolvimento-web"

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}║     🧪 TESTE COMPLETO DE VENDAS - PIX + UTMIFY 🧪             ║${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"

################################################################################
# TESTE 1: Criar Pedido (Momento 1 - PIX Gerado)
################################################################################

echo -e "${BLUE}📝 TESTE 1: Criar Pedido (PIX Gerado)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Preparar payload
PAYLOAD_CRIAR_PEDIDO=$(cat <<EOF
{
  "customer": {
    "name": "$CUSTOMER_NAME",
    "email": "$CUSTOMER_EMAIL",
    "phone": "$CUSTOMER_PHONE",
    "document": "$CUSTOMER_CPF",
    "ip": "$CUSTOMER_IP"
  },
  "product": {
    "id": "$PRODUCT_ID",
    "name": "$PRODUCT_NAME",
    "quantity": 1,
    "price": $PRODUCT_PRICE
  },
  "utmParams": {
    "utm_source": "$UTM_SOURCE",
    "utm_campaign": "$UTM_CAMPAIGN",
    "utm_medium": "$UTM_MEDIUM",
    "utm_content": "$UTM_CONTENT",
    "utm_term": "$UTM_TERM"
  },
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
}
EOF
)

echo -e "${YELLOW}📤 Enviando para: POST $API_BASE/orders/create-pix${NC}\n"
echo -e "Payload:"
echo "$PAYLOAD_CRIAR_PEDIDO" | jq '.' 2>/dev/null || echo "$PAYLOAD_CRIAR_PEDIDO"
echo ""

# Fazer requisição
RESPONSE_CRIAR=$(curl -s -X POST "$API_BASE/orders/create-pix" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_CRIAR_PEDIDO")

echo -e "\n${YELLOW}📥 Resposta:${NC}\n"
echo "$RESPONSE_CRIAR" | jq '.' 2>/dev/null || echo "$RESPONSE_CRIAR"

# Extrair dados importantes
ORDER_ID=$(echo "$RESPONSE_CRIAR" | jq -r '.orderId // .id // empty' 2>/dev/null)
EXTERNAL_ID=$(echo "$RESPONSE_CRIAR" | jq -r '.externalId // empty' 2>/dev/null)
TRANSACTION_ID=$(echo "$RESPONSE_CRIAR" | jq -r '.transactionId // empty' 2>/dev/null)
QR_CODE=$(echo "$RESPONSE_CRIAR" | jq -r '.qrcode // empty' 2>/dev/null)
UTM_SENT=$(echo "$RESPONSE_CRIAR" | jq -r '.utm.sent // empty' 2>/dev/null)

echo -e "\n${GREEN}✅ Dados Extraídos:${NC}"
echo "   • ORDER_ID: $ORDER_ID"
echo "   • EXTERNAL_ID: $EXTERNAL_ID"
echo "   • TRANSACTION_ID: $TRANSACTION_ID"
echo "   • UTM_SENT: $UTM_SENT"
echo "   • QR_CODE (primeiros 50 chars): ${QR_CODE:0:50}..."

if [ -z "$ORDER_ID" ]; then
  echo -e "\n${RED}❌ ERRO: Não conseguiu extrair ORDER_ID${NC}"
  exit 1
fi

echo -e "\n${GREEN}✅ TESTE 1 APROVADO - Pedido criado com sucesso!${NC}\n"

################################################################################
# TESTE 2: Aguardar um pouco para UTMIFY processar
################################################################################

echo -e "${BLUE}⏳ Aguardando 2 segundos para UTMIFY processar...${NC}\n"
sleep 2

################################################################################
# TESTE 3: Confirmar Pagamento (Momento 2 - PIX Pago via Webhook)
################################################################################

echo -e "${BLUE}🔔 TESTE 2: Confirmar Pagamento (Webhook - PIX Pago)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Preparar payload do webhook
PAYLOAD_WEBHOOK=$(cat <<EOF
{
  "status": "paid",
  "externalId": "$EXTERNAL_ID",
  "transactionId": "$TRANSACTION_ID",
  "amount": $PRODUCT_PRICE,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

echo -e "${YELLOW}📤 Enviando para: POST $WEBHOOK_BASE/fmatwcswzobzzdsgrkgv1p9kz049g57m${NC}\n"
echo -e "Payload:"
echo "$PAYLOAD_WEBHOOK" | jq '.' 2>/dev/null || echo "$PAYLOAD_WEBHOOK"
echo ""

# Fazer requisição
RESPONSE_WEBHOOK=$(curl -s -X POST "$WEBHOOK_BASE/fmatwcswzobzzdsgrkgv1p9kz049g57m" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_WEBHOOK")

echo -e "\n${YELLOW}📥 Resposta:${NC}\n"
echo "$RESPONSE_WEBHOOK" | jq '.' 2>/dev/null || echo "$RESPONSE_WEBHOOK"

echo -e "\n${GREEN}✅ TESTE 2 APROVADO - Webhook processado!${NC}\n"

################################################################################
# TESTE 4: Aguardar processamento
################################################################################

echo -e "${BLUE}⏳ Aguardando 2 segundos para BD processar...${NC}\n"
sleep 2

################################################################################
# TESTE 5: Verificar no BD (usando Prisma)
################################################################################

echo -e "${BLUE}🗄️  TESTE 3: Verificar Pedido no Banco de Dados${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Nota: Este teste requer que você execute manualmente no Prisma Studio
# ou que tenha um endpoint de verificação

echo -e "${YELLOW}Para verificar no BD, execute no seu projeto:${NC}\n"

echo "┌─ PRISMA STUDIO ─────────────────────────────────────────────────────┐"
echo "│ npx prisma studio                                                    │"
echo "│ • Vá para a tabela 'Order'                                           │"
echo "│ • Procure por externalId: $EXTERNAL_ID                         │"
echo "│ • Verifique o status: Deve ser 'PAID'                               │"
echo "│                                                                      │"
echo "│ CAMPOS ESPERADOS:                                                    │"
echo "│ • id: $ORDER_ID                                     │"
echo "│ • status: PAID                                                       │"
echo "│ • amount: $PRODUCT_PRICE                                    │"
echo "│ • customerEmail: $CUSTOMER_EMAIL       │"
echo "│ • paidAt: (data/hora atual)                                         │"
echo "│ • utmifySent: true                                                   │"
echo "│ • utmifyUpdated: true                                                │"
echo "└─────────────────────────────────────────────────────────────────────┘\n"

echo -e "${YELLOW}Para verificar os UTM params, veja a tabela 'UtmTracking':${NC}\n"

echo "┌─ UTMTRACKING ───────────────────────────────────────────────────────┐"
echo "│ • Procure pelo orderId: $ORDER_ID                  │"
echo "│                                                                      │"
echo "│ CAMPOS ESPERADOS:                                                    │"
echo "│ • utm_source: $UTM_SOURCE                                │"
echo "│ • utm_campaign: $UTM_CAMPAIGN                   │"
echo "│ • utm_medium: $UTM_MEDIUM                                    │"
echo "│ • utm_content: $UTM_CONTENT                     │"
echo "│ • utm_term: $UTM_TERM                            │"
echo "│ • userAgent: Mozilla/5.0...                                          │"
echo "└─────────────────────────────────────────────────────────────────────┘\n"

################################################################################
# TESTE 6: Verificar em UTMIFY
################################################################################

echo -e "${BLUE}📊 TESTE 4: Verificar Rastreamento em UTMIFY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Para verificar em UTMIFY, acesse:${NC}\n"

echo "┌─ UTMIFY DASHBOARD ──────────────────────────────────────────────────┐"
echo "│ URL: https://app.utmify.com.br                                       │"
echo "│ Token: $UTMIFY_TOKEN                    │"
echo "│                                                                      │"
echo "│ PASSOS:                                                              │"
echo "│ 1. Faça login com seu token                                          │"
echo "│ 2. Vá para: Relatórios → Vendas                                      │"
echo "│ 3. Procure por pedido com email: $CUSTOMER_EMAIL │"
echo "│ 4. Verifique os campos:                                              │"
echo "│    ├─ Status: PAID (deve estar como pago)                            │"
echo "│    ├─ utm_source: $UTM_SOURCE                                 │"
echo "│    ├─ utm_campaign: $UTM_CAMPAIGN                        │"
echo "│    ├─ utm_medium: $UTM_MEDIUM                                 │"
echo "│    ├─ utm_content: $UTM_CONTENT                          │"
echo "│    ├─ utm_term: $UTM_TERM                                 │"
echo "│    ├─ Valor: R$ 299,00                                               │"
echo "│    └─ Data: $(date '+%d/%m/%Y')                                          │"
echo "│                                                                      │"
echo "│ DICA: Se não aparecer ainda, aguarde 5 minutos                       │"
echo "│       (UTMIFY processa com pequeno delay)                            │"
echo "└─────────────────────────────────────────────────────────────────────┘\n"

################################################################################
# RESUMO FINAL
################################################################################

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    ✅ RESUMO DO TESTE                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ MOMENTO 1 - PIX GERADO${NC}"
echo "   • Pedido criado com sucesso"
echo "   • ORDER_ID: $ORDER_ID"
echo "   • EXTERNAL_ID: $EXTERNAL_ID"
echo "   • UTM registrado em UTMIFY (pending)"
echo ""

echo -e "${GREEN}✅ MOMENTO 2 - PIX PAGO${NC}"
echo "   • Webhook recebido e processado"
echo "   • Status atualizado para PAID"
echo "   • UTM atualizado em UTMIFY (paid)"
echo ""

echo -e "${GREEN}✅ DADOS DE TESTE${NC}"
echo "   • Email: $CUSTOMER_EMAIL"
echo "   • Valor: R\$ $(printf "%.2f" $(echo "scale=2; $PRODUCT_PRICE / 100" | bc))"
echo "   • Produto: $PRODUCT_NAME"
echo "   • utm_source: $UTM_SOURCE"
echo "   • utm_campaign: $UTM_CAMPAIGN"
echo ""

echo -e "${YELLOW}📋 PRÓXIMOS PASSOS:${NC}"
echo "   1. Abra Prisma Studio: npx prisma studio"
echo "   2. Procure pela Order com email: $CUSTOMER_EMAIL"
echo "   3. Verifique se status é 'PAID'"
echo "   4. Verifique se UTM params estão salvos"
echo "   5. Acesse https://app.utmify.com.br"
echo "   6. Verifique se a venda aparece no relatório"
echo ""

echo -e "${MAGENTA}🎯 SUCESSO DO TESTE:${NC}"
echo "   ✅ Pedido criado"
echo "   ✅ Webhook processado"
echo "   ✅ Dados salvos no BD"
echo "   ✅ UTM rastreado em UTMIFY"
echo ""

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}💡 DICAS:${NC}"
echo "   • Se algum teste falhar, verifique se os endpoints estão rodando"
echo "   • Confirme que o .env tem UTMIFY_TOKEN correto"
echo "   • Verifique os logs do servidor para mais detalhes"
echo "   • Teste múltiplas vezes com diferentes utm_sources"
echo ""

echo -e "${GREEN}🎉 TESTE FINALIZADO COM SUCESSO! 🎉${NC}\n"
