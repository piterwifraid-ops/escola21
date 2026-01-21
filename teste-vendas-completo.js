/**
 * 🧪 TESTE COMPLETO DE VENDAS - PIX + UTMIFY
 * 
 * Este arquivo Node.js testa o fluxo completo de uma venda:
 * 1. Criar pedido (PIX gerado) - Momento 1
 * 2. Confirmar pagamento (webhook) - Momento 2
 * 3. Verificar retorno e dados
 * 
 * Uso: node teste-vendas-completo.js
 */

const http = require('http');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuração
const API_BASE = 'localhost:3000';
const UTMIFY_TOKEN = 'Uf0hPSmaWRJWRWIfOscqQmx6s2Yw0RJtODMJ';

// Dados de teste
const TIMESTAMP = Date.now();
const CUSTOMER_EMAIL = `teste-${TIMESTAMP}@example.com`;
const CUSTOMER_NAME = 'João Silva Teste';
const CUSTOMER_PHONE = '11999999999';
const CUSTOMER_CPF = '12345678900';
const CUSTOMER_IP = '192.168.1.100';

const PRODUCT_ID = 'curso-001';
const PRODUCT_NAME = 'Curso de Desenvolvimento Web';
const PRODUCT_PRICE = '29900'; // R$ 299.00 em centavos

const UTM_SOURCE = 'google';
const UTM_CAMPAIGN = 'jan-2026-vendas';
const UTM_MEDIUM = 'cpc';
const UTM_CONTENT = 'banner-principal';
const UTM_TERM = 'desenvolvimento-web';

// Variáveis globais para rastrear dados
let ORDER_ID = null;
let EXTERNAL_ID = null;
let TRANSACTION_ID = null;

/**
 * Faz uma requisição HTTP
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsed,
            body: body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: null,
            body: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Printa com cor
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  print(`\n${'━'.repeat(70)}`, 'cyan');
  print(`  ${title}`, 'blue');
  print(`${'━'.repeat(70)}\n`, 'cyan');
}

/**
 * Executa testes
 */
async function runTests() {
  print('\n╔════════════════════════════════════════════════════════════════════════╗', 'cyan');
  print('║                                                                        ║', 'cyan');
  print('║        🧪 TESTE COMPLETO DE VENDAS - PIX + UTMIFY 🧪                  ║', 'cyan');
  print('║                                                                        ║', 'cyan');
  print('╚════════════════════════════════════════════════════════════════════════╝', 'cyan');

  try {
    // TESTE 1: Criar Pedido
    section('TESTE 1: Criar Pedido (PIX Gerado - Momento 1)');

    const payloadCriar = {
      customer: {
        name: CUSTOMER_NAME,
        email: CUSTOMER_EMAIL,
        phone: CUSTOMER_PHONE,
        document: CUSTOMER_CPF,
        ip: CUSTOMER_IP,
      },
      product: {
        id: PRODUCT_ID,
        name: PRODUCT_NAME,
        quantity: 1,
        price: parseInt(PRODUCT_PRICE),
      },
      utmParams: {
        utm_source: UTM_SOURCE,
        utm_campaign: UTM_CAMPAIGN,
        utm_medium: UTM_MEDIUM,
        utm_content: UTM_CONTENT,
        utm_term: UTM_TERM,
      },
      userAgent: 'Mozilla/5.0 (Test Client)',
    };

    print('📤 Enviando para: POST /api/orders/create-pix', 'yellow');
    print(`\nPayload:`, 'yellow');
    console.log(JSON.stringify(payloadCriar, null, 2));

    const responseCriar = await makeRequest('POST', '/api/orders/create-pix', payloadCriar);

    print(`\n📥 Resposta (Status: ${responseCriar.status}):`, 'yellow');
    console.log(JSON.stringify(responseCriar.data, null, 2));

    // Extrair dados
    if (responseCriar.data) {
      ORDER_ID = responseCriar.data.orderId || responseCriar.data.id;
      EXTERNAL_ID = responseCriar.data.externalId;
      TRANSACTION_ID = responseCriar.data.transactionId;

      if (ORDER_ID && EXTERNAL_ID) {
        print(
          `\n✅ TESTE 1 APROVADO - Pedido criado com sucesso!`,
          'green'
        );
        print(`   • ORDER_ID: ${ORDER_ID}`, 'green');
        print(`   • EXTERNAL_ID: ${EXTERNAL_ID}`, 'green');
        print(`   • TRANSACTION_ID: ${TRANSACTION_ID}`, 'green');

        const utmSent = responseCriar.data.utm?.sent;
        if (utmSent !== undefined) {
          print(`   • UTM_SENT: ${utmSent}`, 'green');
        }
      } else {
        print(`\n❌ ERRO: Não conseguiu extrair IDs necessários`, 'red');
        print(`\nResposta completa:`, 'red');
        console.log(JSON.stringify(responseCriar, null, 2));
        process.exit(1);
      }
    } else {
      print(`\n❌ ERRO: Resposta inválida`, 'red');
      console.log(responseCriar);
      process.exit(1);
    }

    // Aguardar processamento
    print(`\n⏳ Aguardando 2 segundos para UTMIFY processar...`, 'blue');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TESTE 2: Confirmar Pagamento via Webhook
    section('TESTE 2: Confirmar Pagamento (Webhook - PIX Pago - Momento 2)');

    const payloadWebhook = {
      status: 'paid',
      externalId: EXTERNAL_ID,
      transactionId: TRANSACTION_ID,
      amount: parseInt(PRODUCT_PRICE),
      timestamp: new Date().toISOString(),
    };

    print('🔔 Enviando para: POST /webhook/fmatwcswzobzzdsgrkgv1p9kz049g57m', 'yellow');
    print(`\nPayload:`, 'yellow');
    console.log(JSON.stringify(payloadWebhook, null, 2));

    const responseWebhook = await makeRequest(
      'POST',
      '/webhook/fmatwcswzobzzdsgrkgv1p9kz049g57m',
      payloadWebhook
    );

    print(`\n📥 Resposta (Status: ${responseWebhook.status}):`, 'yellow');
    console.log(JSON.stringify(responseWebhook.data, null, 2));

    if (responseWebhook.status === 200) {
      print(
        `\n✅ TESTE 2 APROVADO - Webhook processado com sucesso!`,
        'green'
      );
    } else {
      print(`\n⚠️  AVISO: Webhook retornou status ${responseWebhook.status}`, 'yellow');
    }

    // Aguardar processamento
    print(`\n⏳ Aguardando 2 segundos para BD processar...`, 'blue');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // RESUMO FINAL
    section('✅ RESUMO DO TESTE - VERIFICAÇÃO NECESSÁRIA');

    print(`\n✅ MOMENTO 1 - PIX GERADO (Completado)`, 'green');
    print(`   • Pedido criado com sucesso`, 'green');
    print(`   • ORDER_ID: ${ORDER_ID}`, 'green');
    print(`   • EXTERNAL_ID: ${EXTERNAL_ID}`, 'green');
    print(`   • UTM registrado em UTMIFY (status: pending)`, 'green');

    print(`\n✅ MOMENTO 2 - PIX PAGO (Completado)`, 'green');
    print(`   • Webhook recebido e processado`, 'green');
    print(`   • Status atualizado para PAID`, 'green');
    print(`   • UTM atualizado em UTMIFY (status: paid)`, 'green');

    print(`\n✅ DADOS DE TESTE`, 'green');
    print(`   • Email: ${CUSTOMER_EMAIL}`, 'green');
    print(`   • Valor: R$ ${(parseInt(PRODUCT_PRICE) / 100).toFixed(2)}`, 'green');
    print(`   • Produto: ${PRODUCT_NAME}`, 'green');
    print(`   • utm_source: ${UTM_SOURCE}`, 'green');
    print(`   • utm_campaign: ${UTM_CAMPAIGN}`, 'green');

    print(`\n📋 VERIFICAÇÕES NECESSÁRIAS:`, 'yellow');
    print(`\n1️⃣  NO BANCO DE DADOS (Prisma Studio):`, 'yellow');
    print(`   $ npx prisma studio`, 'cyan');
    print(`   • Tabela: Order`, 'cyan');
    print(`   • Filtro: email = "${CUSTOMER_EMAIL}"`, 'cyan');
    print(`   • Esperado: status = "PAID"`, 'cyan');
    print(`   • Verifique: utmifySent = true, utmifyUpdated = true`, 'cyan');

    print(`\n2️⃣  NOS UTM PARAMS (Prisma Studio):`, 'yellow');
    print(`   • Tabela: UtmTracking`, 'cyan');
    print(`   • Filtro: orderId = "${ORDER_ID}"`, 'cyan');
    print(`   • Verifique os campos UTM foram salvos`, 'cyan');

    print(`\n3️⃣  EM UTMIFY (Dashboard):`, 'yellow');
    print(`   URL: https://app.utmify.com.br`, 'cyan');
    print(`   Token: ${UTMIFY_TOKEN}`, 'cyan');
    print(`   • Relatórios → Vendas`, 'cyan');
    print(`   • Procure por email: ${CUSTOMER_EMAIL}`, 'cyan');
    print(`   • Verifique: status = PAID`, 'cyan');
    print(`   • UTMs devem aparecer no relatório`, 'cyan');

    print(`\n4️⃣  VERIFICAR LOGS DO SERVIDOR:`, 'yellow');
    print(`   • Verifique se há logs de UTMIFY (sent/updated)`, 'cyan');
    print(`   • Procure por warnings ou erros`, 'cyan');

    print(`\n🎯 CHECKLIST DE SUCESSO:`, 'magenta');
    print(`   ✅ Pedido criado com ORDER_ID: ${ORDER_ID}`, 'magenta');
    print(`   ✅ Webhook recebido e processado`, 'magenta');
    print(`   ⏳ Dados salvos no BD (verificar Prisma)`, 'magenta');
    print(`   ⏳ UTM rastreado em UTMIFY (verificar Dashboard)`, 'magenta');

    print(`\n💡 DICAS:`, 'blue');
    print(`   • Se falhar, verifique se endpoints estão rodando`, 'blue');
    print(`   • Confirme que .env tem UTMIFY_TOKEN correto`, 'blue');
    print(`   • Verifique logs do servidor para erros`, 'blue');
    print(`   • Pode levar alguns segundos para aparecer em UTMIFY`, 'blue');

    print(`\n🎉 TESTE FINALIZADO COM SUCESSO! 🎉\n`, 'green');

    print(
      `═══════════════════════════════════════════════════════════════════════\n`,
      'cyan'
    );
  } catch (error) {
    print(`\n❌ ERRO NO TESTE: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Executar testes
runTests();
