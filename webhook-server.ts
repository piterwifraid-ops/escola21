/**
 * EXEMPLO DE BACKEND EM EXPRESS PARA PROCESSAR WEBHOOKS DO PIX
 * 
 * Para usar este arquivo:
 * 1. npm install express cors dotenv
 * 2. Salve como webhook-server.ts ou webhook-server.js
 * 3. Execute com: node webhook-server.js ou npm run webhook
 * 
 * Configure seu .env:
 * WEBHOOK_PORT=3001
 * DATABASE_URL=sua_url_do_banco_de_dados
 */

import express, { Request, Response } from 'express';
import cors from 'cors';

interface WebhookPayload {
  success: boolean;
  data: {
    id: string;
    externalId: string;
    amount: number;
    refundedAmount: number;
    companyId: number;
    paymentMethod: 'pix' | string;
    status: 'pending' | 'processing' | 'paid' | 'rejected' | 'authorized' | 'protesting' | 'refunded' | 'cancelled' | 'chargeback';
    postbackUrl: string;
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    customer: {
      id: number;
      name: string;
      email: string;
      phone: string;
      document: {
        number: string;
        type: 'cpf' | string;
      };
    };
    items: Array<{
      title: string;
      unitPrice: number;
      quantity: number;
    }>;
    fee: {
      fixedAmount: number;
      spreadPercentage: number;
      estimatedFee: number;
      netAmount: number;
    };
    pix: {
      qrcode: string;
      end2EndId: string | null;
      receiptUrl: string | null;
      expirationDate: string;
    };
  };
}

const app = express();
app.use(express.json());
app.use(cors());

// Simulação de banco de dados em memória
const transactions: Map<string, any> = new Map();

/**
 * ROTA: Receber webhook de pagamento do PIX
 * URL: POST https://seu-dominio.com/fmatwcswzobzzdsgrkgv1p9kz049g57m
 * 
 * O gateway Evollute envia um POST para essa URL com o payload abaixo
 * toda vez que o status de uma transação muda.
 */
app.post('/fmatwcswzobzzdsgrkgv1p9kz049g57m', (req: Request, res: Response) => {
  try {
    const payload: WebhookPayload = req.body;

    // Validação básica
    if (!payload.success || !payload.data) {
      console.error('❌ Payload inválido recebido');
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const data = payload.data;
    const amountFormatted = `R$ ${(data.amount / 100).toFixed(2)}`;

    console.log('\n🔔 WEBHOOK RECEBIDO DA EVOLLUTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('📌 Transaction ID:', data.id);
    console.log('📌 External ID:', data.externalId);
    console.log('📊 Status:', data.status);
    console.log('👤 Cliente:', data.customer.name);
    console.log('📧 Email:', data.customer.email);
    console.log('🆔 CPF:', data.customer.document.number);
    console.log('💰 Valor:', amountFormatted);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Armazenar transação em "banco de dados"
    transactions.set(data.id, {
      ...data,
      receivedAt: new Date().toISOString(),
    });

    // 2. Processar conforme o status
    // ⚠️ Status possíveis conforme documentação:
    // pending, processing, paid, rejected, authorized, protesting, refunded, cancelled, chargeback
    switch (data.status) {
      case 'paid':
        console.log('✅ PAGAMENTO CONFIRMADO!');
        console.log(`   Usuário: ${data.customer.email}`);
        console.log(`   Valor: ${amountFormatted}`);
        console.log('   Ações sugeridas:');
        console.log('   ✓ Atualizar status no banco de dados');
        console.log('   ✓ Enviar email de confirmação de pagamento');
        console.log('   ✓ Liberar acesso ao programa/produto');
        console.log('   ✓ Gerar certificado ou recibo');
        console.log('   ✓ Atualizar dashboard do usuário\n');
        
        // TODO: Implementar suas ações aqui
        // Ex: updateUserStatus(data.externalId, 'paid');
        //     sendConfirmationEmail(data.customer.email);
        //     grantAccess(data.externalId);
        break;

      case 'authorized':
        console.log('✅ PAGAMENTO AUTORIZADO');
        console.log(`   Crédito aguardando liquidação`);
        console.log(`   Usuário: ${data.customer.email}\n`);
        
        // TODO: Para cartão de crédito
        break;

      case 'processing':
        console.log('⏳ PROCESSANDO PAGAMENTO');
        console.log(`   Transação em processamento`);
        console.log(`   Aguarde confirmação\n`);
        
        // TODO: Manter usuário em modo "aguardando"
        break;

      case 'pending':
        console.log('⏳ AGUARDANDO PAGAMENTO');
        console.log(`   QR Code PIX gerado, aguardando escaneamento`);
        console.log(`   Expiração: ${data.pix.expirationDate}\n`);
        break;

      case 'rejected':
        console.log('❌ PAGAMENTO REJEITADO');
        console.log(`   Motivo: Rejeição do banco/liquidante`);
        console.log(`   Email: ${data.customer.email}\n`);
        
        // TODO: Notificar usuário para tentar novamente
        break;

      case 'cancelled':
        console.log('🚫 PAGAMENTO CANCELADO');
        console.log(`   Cancelado pelo usuário ou expirou`);
        console.log(`   Email: ${data.customer.email}\n`);
        
        // TODO: Limpar tentativa de pagamento
        break;

      case 'refunded':
        console.log('💰 REEMBOLSO PROCESSADO');
        console.log(`   Valor original: ${amountFormatted}`);
        console.log(`   Valor reembolsado: R$ ${(data.refundedAmount / 100).toFixed(2)}`);
        console.log(`   Email: ${data.customer.email}\n`);
        
        // TODO: Revogar acesso e notificar usuário
        // Ex: revokeAccess(data.externalId);
        break;

      case 'chargeback':
        console.log('⚠️  CHARGEBACK INICIADO - AÇÃO URGENTE!');
        console.log(`   Disputa de cartão recebida`);
        console.log(`   Valor em disputa: ${amountFormatted}`);
        console.log(`   Email: ${data.customer.email}`);
        console.log(`   CPF: ${data.customer.document.number}\n`);
        
        // TODO: Ações urgentes de segurança
        // Ex: blockUser(data.externalId);
        //     notifyAdmins(data);
        break;

      case 'protesting':
        console.log('⚠️  PROTESTO EM ANDAMENTO');
        console.log(`   Transação em disputa`);
        console.log(`   Email: ${data.customer.email}\n`);
        break;

      default:
        console.warn('⚠️ Status desconhecido:', data.status);
    }

    // 3. IMPORTANTE: Sempre retornar 200 OK
    // Se não retornar 200, a Evollute tentará reenviar o webhook
    // depois de alguns minutos
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      transactionId: data.id,
      status: data.status,
      receivedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('🔥 Erro ao processar webhook:', error);
    
    // IMPORTANTE: Retornar 200 mesmo em erro para evitar retentativas infinitas
    // Registre o erro em um log para investigação posterior
    res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      receivedAt: new Date().toISOString(),
    });
  }
});

/**
 * ROTA: Verificar status de uma transação
 * GET http://localhost:3001/api/transactions/:transactionId
 */
app.get('/api/transactions/:transactionId', (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const transaction = transactions.get(transactionId);

  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }

  res.json({
    success: true,
    data: transaction,
  });
});

/**
 * ROTA: Listar todas as transações
 * GET http://localhost:3001/api/transactions
 */
app.get('/api/transactions', (req: Request, res: Response) => {
  const allTransactions = Array.from(transactions.values());

  res.json({
    success: true,
    total: allTransactions.length,
    data: allTransactions,
  });
});

/**
 * ROTA: Health check
 * GET http://localhost:3001/health
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * ROTA: Listar todas as rotas disponíveis
 * GET http://localhost:3001/
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Servidor de Webhook da Evollute',
    routes: {
      webhook: {
        method: 'POST',
        path: '/fmatwcswzobzzdsgrkgv1p9kz049g57m',
        description: 'Recebe notificações de pagamento PIX',
      },
      checkTransaction: {
        method: 'GET',
        path: '/api/transactions/:transactionId',
        description: 'Verifica status de uma transação',
      },
      listTransactions: {
        method: 'GET',
        path: '/api/transactions',
        description: 'Lista todas as transações',
      },
      health: {
        method: 'GET',
        path: '/health',
        description: 'Verifica status do servidor',
      },
    },
  });
});

// Iniciar servidor
const PORT = process.env.WEBHOOK_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor de webhook rodando em http://localhost:${PORT}`);
  console.log(`\n📝 Webhook URL: http://localhost:${PORT}/fmatwcswzobzzdsgrkgv1p9kz049g57m`);
  console.log(`\nPara usar em produção, configure um domínio seguro (HTTPS)`);
  console.log(`\nExemplo de URL de produção:`);
  console.log(`https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m\n`);
});

// Exportar para testes
export { app };
