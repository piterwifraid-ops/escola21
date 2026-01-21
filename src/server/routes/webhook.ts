/**
 * MOMENTO 2: PIX PAGO - Função de Webhook
 * 
 * Esta função é chamada quando o banco confirma o pagamento
 * Recebe webhook da Evollute com status = 'paid'
 * 
 * Fluxo:
 * 1. Receber notificação do banco (PIX foi pago)
 * 2. Validar assinatura/token (segurança)
 * 3. Buscar pedido no banco de dados
 * 4. Atualizar status para "PAID"
 * 5. Enviar para UTMIFY com status "paid"
 * 6. Responder com 200 OK
 * 
 * URL: https://agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m
 */

import express, { Request, Response } from 'express';
import { utmifyService, OrderData } from '../services/utmifyTrackingService';
import { prisma } from '../lib/prisma';

// ============================================
// TIPOS
// ============================================

interface WebhookPayload {
  success: boolean;
  data: {
    id: string;
    externalId: string;
    amount: number;
    refundedAmount: number;
    status: 'pending' | 'processing' | 'paid' | 'rejected' | 'refunded' | 'cancelled' | 'chargeback';
    customer: {
      name: string;
      email: string;
      phone: string;
      document: {
        number: string;
        type: string;
      };
    };
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

// ============================================
// FUNÇÃO: Webhook PIX Pago
// ============================================

/**
 * Recebe notificação de pagamento PIX
 * 
 * POST /fmatwcswzobzzdsgrkgv1p9kz049g57m
 * 
 * Chamado pela Evollute quando PIX é pago
 */
export async function handlePixPaymentWebhook(req: Request<WebhookPayload>, res: Response) {
  const receivedAt = new Date().toISOString();

  try {
    const payload = req.body;

    console.log('📡 Webhook recebido:', {
      timestamp: receivedAt,
      transactionId: payload.data?.id,
      status: payload.data?.status,
      amount: payload.data?.amount,
    });

    // ============================================
    // PASSO 1: Validar Payload
    // ============================================

    if (!payload.success || !payload.data) {
      console.warn('⚠️ Payload inválido');
      return res.status(200).json({ received: true }); // Retornar 200 mesmo assim
    }

    const webhookData = payload.data;

    // ============================================
    // PASSO 2: Buscar Pedido no Banco
    // ============================================

    const order = await prisma.order.findUnique({
      where: { externalId: webhookData.externalId },
      include: {
        items: true,
        utm: true,
      },
    });

    if (!order) {
      console.warn('⚠️ Pedido não encontrado:', webhookData.externalId);
      return res.status(200).json({ received: true });
    }

    console.log('✅ Pedido encontrado:', order.id);

    // ============================================
    // PASSO 3: Verificar Status do Pagamento
    // ============================================

    // Se pagamento foi confirmado
    if (webhookData.status === 'paid' || webhookData.status === 'authorized') {
      console.log('✅ PAGAMENTO CONFIRMADO:', {
        orderId: order.id,
        amount: webhookData.amount / 100,
        customer: webhookData.customer.email,
      });

      // ============================================
      // PASSO 4: Atualizar Pedido no Banco
      // ============================================

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(webhookData.paidAt || new Date()),
        },
      });

      console.log('✅ Pedido atualizado para PAID');

      // ============================================
      // PASSO 5: Enviar para UTMIFY (Momento 2)
      // ============================================

      const orderData: OrderData = {
        orderId: order.id,
        externalId: order.externalId,
        amount: webhookData.amount / 100, // Converter de centavos para reais
        status: 'paid',
        customer: {
          name: webhookData.customer.name,
          email: webhookData.customer.email,
          phone: webhookData.customer.phone,
          document: webhookData.customer.document.number,
          ip: order.customerIP || '0.0.0.0',
        },
        products: order.items.map(item => ({
          id: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price / 100, // Converter de centavos para reais
        })),
        utmParams: {
          utm_source: order.utm?.utm_source || undefined,
          utm_campaign: order.utm?.utm_campaign || undefined,
          utm_medium: order.utm?.utm_medium || undefined,
          utm_content: order.utm?.utm_content || undefined,
          utm_term: order.utm?.utm_term || undefined,
        },
        createdAt: order.createdAt.toISOString(),
        paidAt: updatedOrder.paidAt?.toISOString(),
      };

      // Chamar UTMIFY de forma assíncrona (sem bloquear resposta)
      utmifyService.trackOrderPaid(orderData).then(result => {
        if (result.success) {
          // Salvar que foi enviado
          prisma.order.update({
            where: { id: order.id },
            data: {
              utmifyUpdated: true,
              utmifyUpdatedAt: new Date(),
            },
          }).catch(err => console.error('Erro ao atualizar utmifyUpdated:', err));

          console.log('✅ Pedido atualizado em UTMIFY');
        } else {
          console.warn('⚠️ Falha ao atualizar em UTMIFY:', result.error);
        }
      }).catch(err => {
        console.error('❌ Erro ao chamar UTMIFY:', err);
      });

      // ============================================
      // PASSO 6: Disparar Eventos (Opcional)
      // ============================================

      // Aqui você pode:
      // - Enviar email de confirmação
      // - Gerar certificado
      // - Liberar acesso ao produto
      // - Chamar outros webhooks/APIs

      await handlePaymentConfirmed(order, webhookData);

    } else if (webhookData.status === 'refunded') {
      console.log('💸 REEMBOLSO PROCESSADO:', order.id);
      
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED' },
      });

    } else if (webhookData.status === 'chargeback') {
      console.log('❌ CHARGEBACK ACIONADO:', order.id);
      
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    }

    // ============================================
    // PASSO 7: Responder com 200 OK
    // ============================================

    return res.status(200).json({
      success: true,
      received: true,
      transactionId: webhookData.id,
      orderId: order.id,
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Sempre responder com 200 para evitar retries do banco
    return res.status(200).json({
      success: false,
      error: 'Erro ao processar',
      received: true,
    });
  }
}

// ============================================
// FUNÇÃO AUXILIAR: Ações após Pagamento Confirmado
// ============================================

async function handlePaymentConfirmed(order: any, webhookData: any) {
  try {
    // Aqui você implementa as ações pós-pagamento

    console.log('🎉 Processando ações pós-pagamento:', {
      orderId: order.id,
      customerEmail: order.customerEmail,
      amount: webhookData.amount / 100,
    });

    // Exemplo: Enviar email
    // await sendConfirmationEmail(order.customerEmail, {
    //   transactionId: webhookData.id,
    //   amount: webhookData.amount / 100,
    // });

    // Exemplo: Gerar certificado
    // await generateCertificate(order.id, {
    //   customerName: order.customerName,
    // });

    // Exemplo: Liberar acesso
    // await liberateProductAccess(order.customerEmail);

  } catch (error) {
    console.error('❌ Erro ao processar ações pós-pagamento:', error);
    // Não lançar erro - não deve impedir a confirmação
  }
}

// ============================================
// EXPORT ROUTER
// ============================================

const router = express.Router();

router.post('/fmatwcswzobzzdsgrkgv1p9kz049g57m', handlePixPaymentWebhook);

export default router;
