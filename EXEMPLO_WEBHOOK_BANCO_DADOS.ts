/**
 * EXEMPLO: Integração Backend com Banco de Dados
 * 
 * Este arquivo mostra como processar webhook e salvar no banco de dados
 * usando um ORM como Prisma ou TypeORM
 */

// ============================================================================
// EXEMPLO 1: Usando Prisma ORM
// ============================================================================

import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

/**
 * Webhook: Receber notificação de pagamento PIX
 */
app.post('/webhook/pix', async (req, res) => {
  try {
    const { data } = req.body;

    console.log(`\n🔔 Webhook: ${data.status} - ${data.externalId}`);
    console.log(`   Email: ${data.customer.email}`);
    console.log(`   Valor: R$ ${(data.amount / 100).toFixed(2)}\n`);

    // Verificar se webhook já foi processado (idempotência)
    const existing = await prisma.webhookLog.findUnique({
      where: { transactionId: data.id }
    });

    if (existing) {
      console.log('⚠️ Webhook já processado, ignorando...');
      return res.status(200).json({ success: true });
    }

    // Registrar webhook recebido
    await prisma.webhookLog.create({
      data: {
        transactionId: data.id,
        externalId: data.externalId,
        status: data.status,
        payload: JSON.stringify(data),
        receivedAt: new Date(),
      }
    });

    // Processar conforme status
    switch (data.status) {
      case 'paid':
        await processPaidPayment(data);
        break;

      case 'refunded':
        await processRefund(data);
        break;

      case 'chargeback':
        await processChargeback(data);
        break;

      case 'rejected':
      case 'cancelled':
        await processFailedPayment(data);
        break;
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    // Ainda retornar 200 para evitar retentativas
    res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Processar pagamento confirmado
 */
async function processPaidPayment(data: any) {
  console.log('✅ Processando pagamento confirmado...');

  // 1. Atualizar pedido
  const order = await prisma.order.update({
    where: { externalId: data.externalId },
    data: {
      status: 'PAID',
      paidAt: new Date(data.paidAt),
      transactionId: data.id,
      amount: data.amount / 100, // Converter para reais
    }
  });

  // 2. Atualizar usuário (liberar acesso)
  await prisma.user.update({
    where: { email: data.customer.email },
    data: {
      hasAccess: true,
      accessGrantedAt: new Date(),
      program: { connect: { id: order.programId } }
    }
  });

  // 3. Criar registro de pagamento
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: data.amount / 100,
      method: 'PIX',
      status: 'COMPLETED',
      transactionId: data.id,
      endToEndId: data.pix?.end2EndId,
      paidAt: new Date(data.paidAt),
    }
  });

  // 4. Enviar email de confirmação (exemplo)
  await sendConfirmationEmail(data.customer.email, order);

  // 5. Gerar certificado (exemplo)
  await generateCertificate(order.id, data.customer.name);

  console.log(`✅ Pagamento processado: ${order.id}`);
}

/**
 * Processar reembolso
 */
async function processRefund(data: any) {
  console.log('💰 Processando reembolso...');

  // 1. Atualizar pedido
  const order = await prisma.order.update({
    where: { externalId: data.externalId },
    data: {
      status: 'REFUNDED',
      refundedAmount: data.refundedAmount / 100,
    }
  });

  // 2. Revogar acesso
  await prisma.user.update({
    where: { email: data.customer.email },
    data: {
      hasAccess: false,
      accessRevokedAt: new Date(),
      accessReason: 'Reembolso processado'
    }
  });

  // 3. Notificar usuário
  await sendRefundEmail(data.customer.email, data.refundedAmount / 100);

  console.log(`💰 Reembolso processado: ${order.id}`);
}

/**
 * Processar chargeback (ação urgente!)
 */
async function processChargeback(data: any) {
  console.log('⚠️ CHARGEBACK INICIADO - AÇÃO URGENTE!');

  // 1. Bloquear usuário
  const order = await prisma.order.update({
    where: { externalId: data.externalId },
    data: {
      status: 'CHARGEBACK',
      blockedAt: new Date(),
    }
  });

  // 2. Revogar acesso imediatamente
  await prisma.user.update({
    where: { email: data.customer.email },
    data: {
      hasAccess: false,
      blocked: true,
      accessReason: 'Chargeback iniciado'
    }
  });

  // 3. Notificar admin urgentemente
  await sendAdminAlert(
    'CHARGEBACK!',
    `Chargeback iniciado para ${data.customer.email}. Valor: R$ ${(data.amount / 100).toFixed(2)}`
  );

  // 4. Log de segurança
  await prisma.securityLog.create({
    data: {
      event: 'CHARGEBACK',
      userId: order.userId,
      details: JSON.stringify(data),
    }
  });

  console.log(`⚠️ Chargeback: ${order.id} - Usuário bloqueado`);
}

/**
 * Processar pagamento falho
 */
async function processFailedPayment(data: any) {
  console.log('❌ Processando pagamento rejeitado...');

  // Atualizar pedido
  const order = await prisma.order.update({
    where: { externalId: data.externalId },
    data: {
      status: 'FAILED',
      failedAt: new Date(),
    }
  });

  // Notificar usuário
  await sendFailureEmail(data.customer.email, 'Seu pagamento não foi confirmado');

  console.log(`❌ Pagamento falho: ${order.id}`);
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Enviar email de confirmação
 */
async function sendConfirmationEmail(email: string, order: any) {
  console.log(`📧 Enviando email de confirmação para ${email}`);
  
  // Implementar com seu serviço de email (Sendgrid, AWS SES, etc)
  // const result = await sendgrid.send({
  //   to: email,
  //   subject: 'Pagamento Confirmado!',
  //   html: `<h1>Seu pagamento foi confirmado!</h1>...`
  // });
}

/**
 * Enviar email de reembolso
 */
async function sendRefundEmail(email: string, amount: number) {
  console.log(`📧 Enviando email de reembolso para ${email}`);
  
  // Implementar com seu serviço de email
}

/**
 * Enviar email de falha
 */
async function sendFailureEmail(email: string, reason: string) {
  console.log(`📧 Enviando email de falha para ${email}`);
  
  // Implementar com seu serviço de email
}

/**
 * Alertar admin sobre chargeback
 */
async function sendAdminAlert(title: string, message: string) {
  console.log(`🚨 Alerta admin: ${title}`);
  console.log(`   ${message}`);
  
  // Implementar: enviar para email/slack/discord
}

/**
 * Gerar certificado
 */
async function generateCertificate(orderId: string, userName: string) {
  console.log(`🎓 Gerando certificado para ${userName}`);
  
  // Implementar: gerar PDF, salvar arquivo, enviar
}

// ============================================================================
// EXEMPLO 2: Schema Prisma (schema.prisma)
// ============================================================================

/*

model Order {
  id            String    @id @default(cuid())
  externalId    String    @unique
  userId        String
  programId     String
  
  status        String    @default("PENDING") // PENDING, PAID, REFUNDED, FAILED, CHARGEBACK
  amount        Float
  refundedAmount Float?
  
  transactionId String?   @unique
  paidAt        DateTime?
  refundedAt    DateTime?
  failedAt      DateTime?
  blockedAt     DateTime?
  
  user          User      @relation(fields: [userId], references: [id])
  program       Program   @relation(fields: [programId], references: [id])
  payment       Payment?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  
  hasAccess     Boolean   @default(false)
  blocked       Boolean   @default(false)
  
  accessGrantedAt DateTime?
  accessRevokedAt DateTime?
  accessReason  String?
  
  orders        Order[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Payment {
  id            String    @id @default(cuid())
  orderId       String    @unique
  
  amount        Float
  method        String    // PIX, CARD, etc
  status        String    // COMPLETED, PENDING, FAILED
  
  transactionId String?   @unique
  endToEndId    String?   // PIX end-to-end ID
  
  paidAt        DateTime?
  
  order         Order     @relation(fields: [orderId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model WebhookLog {
  id            String    @id @default(cuid())
  
  transactionId String    @unique
  externalId    String
  status        String
  payload       String    @db.Text
  
  receivedAt    DateTime  @default(now())
  processedAt   DateTime?
  
  createdAt     DateTime  @default(now())
}

model SecurityLog {
  id            String    @id @default(cuid())
  
  event         String    // CHARGEBACK, FRAUD, etc
  userId        String?
  details       String    @db.Text
  
  createdAt     DateTime  @default(now())
}

*/

// ============================================================================
// ROTAS ADICIONAIS ÚTEIS
// ============================================================================

/**
 * Verificar status de pagamento
 */
app.get('/api/orders/:externalId', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { externalId: req.params.externalId },
      include: { payment: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        paidAt: order.paidAt,
        payment: order.payment
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.WEBHOOK_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor webhook rodando em http://localhost:${PORT}`);
  console.log(`📝 Webhook URL: http://localhost:${PORT}/webhook/pix\n`);
});

export { app, prisma };
