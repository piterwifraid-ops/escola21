/**
 * MOMENTO 1: PIX GERADO - Função para Criar Pedido
 * 
 * Esta função deve ser chamada quando o usuário clica em "Pagar com PIX"
 * e antes do QR Code ser exibido.
 * 
 * Fluxo:
 * 1. Receber dados do frontend (cliente, produto, UTM params)
 * 2. Gerar PIX no gateway Evollute
 * 3. Salvar pedido no banco de dados
 * 4. Enviar para UTMIFY com status "pending"
 * 
 * Arquivo: src/server/routes/orders.ts (ou similar)
 */

import express, { Request, Response } from 'express';
import { utmifyService, UtmParams, OrderData } from '../services/utmifyTrackingService';
import { prisma } from '../lib/prisma';
import axios from 'axios';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface CreateOrderRequest {
  // Cliente
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string; // CPF
  };
  
  // Produto/Serviço
  product: {
    id: string;
    name: string;
    quantity: number;
    price: number; // Valor em reais
  };
  
  // Parâmetros UTM (vindo do frontend)
  utmParams: UtmParams;
  
  // Dados da requisição
  ip: string;
  userAgent: string;
}

// ============================================
// FUNÇÃO: Criar Pedido com PIX
// ============================================

/**
 * Cria um novo pedido PIX e registra em UTMIFY
 * 
 * POST /api/orders/create-pix
 * 
 * Body:
 * {
 *   customer: { name, email, phone, document },
 *   product: { id, name, quantity, price },
 *   utmParams: { utm_source, utm_campaign, ... },
 *   ip: "192.168.1.1",
 *   userAgent: "Mozilla/5.0..."
 * }
 */
export async function createPixOrder(req: Request<CreateOrderRequest>, res: Response) {
  try {
    console.log('🔄 Iniciando criação de pedido PIX...');
    
    const { customer, product, utmParams, ip, userAgent } = req.body;

    // ============================================
    // PASSO 1: Validar Dados
    // ============================================

    if (!customer.email || !customer.document) {
      return res.status(400).json({
        success: false,
        error: 'Dados de cliente incompletos',
      });
    }

    console.log('✅ Dados validados');

    // ============================================
    // PASSO 2: Gerar PIX no Gateway Evollute
    // ============================================

    const pixResponse = await generatePixInEvollute({
      customer,
      product,
      utmParams,
    });

    if (!pixResponse.success) {
      return res.status(400).json({
        success: false,
        error: 'Falha ao gerar PIX',
        details: pixResponse.error,
      });
    }

    const { qrcode, transactionId, externalId } = pixResponse;
    console.log('✅ PIX gerado:', transactionId);

    // ============================================
    // PASSO 3: Salvar Pedido no Banco de Dados
    // ============================================

    const order = await prisma.order.create({
      data: {
        externalId: externalId,
        transactionId: transactionId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerDocument: customer.document,
        customerIP: ip,
        amount: Math.round(product.price * 100), // Converter para centavos
        status: 'PENDING',
        items: {
          create: {
            productId: product.id,
            name: product.name,
            quantity: product.quantity,
            price: Math.round(product.price * 100),
          },
        },
        utm: {
          create: {
            utm_source: utmParams.utm_source,
            utm_campaign: utmParams.utm_campaign,
            utm_medium: utmParams.utm_medium,
            utm_content: utmParams.utm_content,
            utm_term: utmParams.utm_term,
            referrer: req.get('referer'),
            userAgent: userAgent,
            language: req.get('accept-language'),
          },
        },
      },
      include: {
        items: true,
        utm: true,
      },
    });

    console.log('✅ Pedido salvo no banco:', order.id);

    // ============================================
    // PASSO 4: Enviar para UTMIFY (Momento 1)
    // ============================================

    const orderData: OrderData = {
      orderId: order.id,
      externalId: order.externalId,
      amount: product.price,
      status: 'pending',
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
        ip: ip || '0.0.0.0',
      },
      products: [
        {
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          price: product.price,
        },
      ],
      utmParams,
      createdAt: order.createdAt.toISOString(),
    };

    // Enviar para UTMIFY (sem bloquear a resposta)
    const utmifyResult = await utmifyService.trackOrderCreated(orderData);

    if (utmifyResult.success) {
      // Marcar que foi enviado
      await prisma.order.update({
        where: { id: order.id },
        data: {
          utmifySent: true,
          utmifySentAt: new Date(),
        },
      });
      console.log('✅ Pedido enviado para UTMIFY');
    } else {
      // Log sem bloquear (falha em UTMIFY não deve impedir venda)
      console.warn('⚠️ Falha ao enviar para UTMIFY:', utmifyResult.error);
    }

    // ============================================
    // PASSO 5: Retornar Resposta ao Frontend
    // ============================================

    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        transactionId: order.transactionId,
        externalId: order.externalId,
        qrcode,
        amount: product.price,
        customer: {
          email: customer.email,
          name: customer.name,
        },
        utm: {
          sent: utmifyResult.success,
          error: utmifyResult.error || null,
        },
      },
    });

  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao criar pedido',
    });
  }
}

// ============================================
// FUNÇÃO AUXILIAR: Gerar PIX em Evollute
// ============================================

interface PixGenerationData {
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  product: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  };
  utmParams: UtmParams;
}

interface PixGenerationResponse {
  success: boolean;
  qrcode?: string;
  transactionId?: string;
  externalId?: string;
  error?: string;
}

async function generatePixInEvollute(
  data: PixGenerationData
): Promise<PixGenerationResponse> {
  try {
    const externalId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await axios.post(
      'https://api.evollute.com.br/api/v2/transactions',
      {
        externalId,
        amount: Math.round(data.product.price * 100),
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          document: data.customer.document,
        },
        items: [
          {
            title: data.product.name,
            unitPrice: Math.round(data.product.price * 100),
            quantity: data.product.quantity,
          },
        ],
        paymentMethod: 'pix',
        postbackUrl: process.env.WEBHOOK_URL || 'https://agentescoladofuturo.org/webhook/pix',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.EVOLLUTE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      qrcode: response.data.data.pix.qrcode,
      transactionId: response.data.data.id,
      externalId: externalId,
    };
  } catch (error: any) {
    console.error('❌ Erro ao gerar PIX em Evollute:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao gerar PIX',
    };
  }
}

// ============================================
// EXPORT ROUTER
// ============================================

const router = express.Router();

router.post('/create-pix', createPixOrder);

export default router;
