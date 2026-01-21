#!/usr/bin/env node

/**
 * SERVIDOR WEBHOOK SIMPLES EM NODE.JS
 * Sem dependências - apenas módulos nativos
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 3001;
const transactionHistory = [];

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`\n📡 ${new Date().toISOString()} - ${method} ${pathname}`);

  // Health check
  if (pathname === '/health' && method === 'GET') {
    console.log('✅ Health check OK');
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date() }));
    return;
  }

  // Webhook principal
  if (pathname === '/fmatwcswzobzzdsgrkgv1p9kz049g57m' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log('📦 Payload recebido:');
        console.log('   ID:', payload.data?.id);
        console.log('   ExternalID:', payload.data?.externalId);
        console.log('   Status:', payload.data?.status);
        console.log('   Valor:', (payload.data?.amount / 100).toFixed(2));

        // Salvar histórico
        const transaction = {
          id: payload.data?.id,
          externalId: payload.data?.externalId,
          status: payload.data?.status,
          amount: payload.data?.amount,
          customerEmail: payload.data?.customer?.email,
          receivedAt: new Date().toISOString(),
          payloadSize: body.length
        };

        transactionHistory.push(transaction);

        // Log de processamento
        if (payload.data?.status === 'paid') {
          console.log('✅ PAGAMENTO CONFIRMADO!');
          console.log(`   ${payload.data?.customer?.name} pagou R$ ${(payload.data?.amount / 100).toFixed(2)}`);
        } else if (payload.data?.status === 'pending') {
          console.log('⏳ Aguardando pagamento...');
        } else if (payload.data?.status === 'refunded') {
          console.log('💸 Reembolso processado');
        } else if (payload.data?.status === 'chargeback') {
          console.log('❌ Chargeback acionado!');
        }

        // Responder com 200
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Webhook recebido com sucesso',
          transactionId: payload.data?.id,
          status: payload.data?.status
        }));
      } catch (error) {
        console.error('❌ Erro ao processar:', error.message);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // Lista de transações
  if (pathname === '/api/transactions' && method === 'GET') {
    console.log(`📋 Total de transações: ${transactionHistory.length}`);
    res.writeHead(200);
    res.end(JSON.stringify({ transactions: transactionHistory }));
    return;
  }

  // Detalhes de uma transação
  if (pathname.startsWith('/api/transactions/') && method === 'GET') {
    const txId = pathname.split('/').pop();
    const tx = transactionHistory.find(t => t.id === txId || t.externalId === txId);
    if (tx) {
      console.log(`✅ Transação encontrada: ${txId}`);
      res.writeHead(200);
      res.end(JSON.stringify(tx));
    } else {
      console.log(`❌ Transação não encontrada: ${txId}`);
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Transação não encontrada' }));
    }
    return;
  }

  // Not found
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVIDOR WEBHOOK RODANDO!');
  console.log('='.repeat(60));
  console.log(`📍 Porta: http://localhost:${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/fmatwcswzobzzdsgrkgv1p9kz049g57m`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Transações: http://localhost:${PORT}/api/transactions`);
  console.log('='.repeat(60));
  console.log('Aguardando webhooks...\n');
});

// Tratamento de erro
server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n📊 SUMÁRIO FINAL:');
  console.log(`Total de webhooks recebidos: ${transactionHistory.length}`);
  if (transactionHistory.length > 0) {
    transactionHistory.forEach((tx, i) => {
      console.log(`${i + 1}. ${tx.status} - ${tx.customerEmail} - R$ ${(tx.amount / 100).toFixed(2)}`);
    });
  }
  console.log('\n👋 Servidor encerrado');
  process.exit(0);
});
