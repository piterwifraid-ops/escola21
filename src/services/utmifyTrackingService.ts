/**
 * UTMIFY Tracking Service
 * 
 * Integração Server-Side com API UTMIFY para rastreamento de vendas PIX
 * 
 * Documentação: https://docs.utmify.com.br/api-credentials
 * Token: Armazenar em process.env.UTMIFY_TOKEN
 */

import axios, { AxiosError } from 'axios';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface UtmParams {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  [key: string]: string | undefined;
}

export interface OrderData {
  orderId: string;
  externalId: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string; // CPF/CNPJ
    ip: string;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  utmParams: UtmParams;
  createdAt?: string;
  paidAt?: string;
}

export interface UtmifyResponse {
  success: boolean;
  data?: {
    id: string;
    orderId: string;
    status: string;
    createdAt: string;
  };
  error?: string;
}

// ============================================
// UTMIFY SERVICE
// ============================================

class UtmifyTrackingService {
  private apiUrl = 'https://api.utmify.com.br/api-credentials/orders';
  private apiToken: string;
  private axiosInstance = axios.create({
    timeout: 10000, // 10 segundos de timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.apiToken = process.env.UTMIFY_TOKEN || '';
    
    if (!this.apiToken) {
      console.warn('⚠️ UTMIFY_TOKEN não configurado em process.env');
    }
  }

  /**
   * MOMENTO 1: PIX GERADO (Registrar pedido como "pending")
   * 
   * Chamado quando o pedido é criado no banco de dados
   * 
   * @param orderData Dados do pedido com parâmetros UTM
   * @returns Promise com resposta da API
   */
  async trackOrderCreated(orderData: OrderData): Promise<UtmifyResponse> {
    try {
      console.log('📤 Enviando pedido PENDING para UTMIFY:', {
        orderId: orderData.externalId,
        amount: orderData.amount,
        status: 'pending',
      });

      const payload = this.buildOrderPayload(orderData, 'pending');

      const response = await this.axiosInstance.post(
        this.apiUrl,
        payload,
        {
          headers: {
            'x-api-token': this.apiToken,
          },
        }
      );

      console.log('✅ Pedido registrado em UTMIFY com sucesso');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError('trackOrderCreated', error, orderData);
    }
  }

  /**
   * MOMENTO 2: PIX PAGO (Atualizar pedido para "paid")
   * 
   * Chamado quando webhook confirma pagamento (status = "paid")
   * 
   * @param orderData Dados do pedido atualizado
   * @returns Promise com resposta da API
   */
  async trackOrderPaid(orderData: OrderData): Promise<UtmifyResponse> {
    try {
      console.log('📤 Atualizando pedido para PAID em UTMIFY:', {
        orderId: orderData.externalId,
        amount: orderData.amount,
        status: 'paid',
      });

      const payload = this.buildOrderPayload(orderData, 'paid');

      const response = await this.axiosInstance.post(
        this.apiUrl,
        payload,
        {
          headers: {
            'x-api-token': this.apiToken,
          },
        }
      );

      console.log('✅ Pedido atualizado em UTMIFY com sucesso');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError('trackOrderPaid', error, orderData);
    }
  }

  /**
   * Constrói o payload para envio à API UTMIFY
   */
  private buildOrderPayload(orderData: OrderData, status: string) {
    return {
      orderId: orderData.externalId, // ID do pedido no seu sistema
      platform: 'GlobalPay', // ou seu nome de plataforma
      paymentMethod: 'pix',
      status: status,
      createdAt: orderData.createdAt || new Date().toISOString(),
      approvedDate: status === 'paid' ? (orderData.paidAt || new Date().toISOString()) : null,
      refundedAt: null,
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        document: this.formatDocument(orderData.customer.document),
        country: 'BR',
        ip: orderData.customer.ip,
      },
      products: orderData.products.map(product => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        priceInCents: product.price * 100, // Converter para centavos
      })),
      trackingParameters: {
        src: null,
        sck: null,
        utm_source: orderData.utmParams.utm_source || null,
        utm_campaign: orderData.utmParams.utm_campaign || null,
        utm_medium: orderData.utmParams.utm_medium || null,
        utm_content: orderData.utmParams.utm_content || null,
        utm_term: orderData.utmParams.utm_term || null,
      },
      commission: {
        totalPriceInCents: orderData.amount * 100,
        gatewayFeeInCents: Math.round(orderData.amount * 100 * 0.015), // 1.5%
        userCommissionInCents: Math.round(orderData.amount * 100 * 0.015),
      },
      isTest: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Formata documento removendo caracteres especiais
   */
  private formatDocument(document: string): string {
    return document.replace(/[\.\-\/]/g, '');
  }

  /**
   * Tratamento de erros com logging
   */
  private handleError(
    functionName: string,
    error: unknown,
    orderData: OrderData
  ): UtmifyResponse {
    const axiosError = error as AxiosError;

    let errorMessage = 'Erro desconhecido';
    let errorDetails = {};

    if (axiosError.response) {
      // Erro da API
      errorMessage = `UTMIFY API Error: ${axiosError.response.status}`;
      errorDetails = axiosError.response.data;
      console.error(`❌ ${functionName} falhou:`, {
        status: axiosError.response.status,
        data: axiosError.response.data,
      });
    } else if (axiosError.request) {
      // Erro de rede
      errorMessage = 'Erro de conexão com UTMIFY (sem resposta)';
      console.error(`❌ ${functionName} falhou - Rede:`, axiosError.message);
    } else {
      // Erro de configuração
      errorMessage = axiosError.message;
      console.error(`❌ ${functionName} falhou:`, error);
    }

    // Log estruturado para auditoria
    console.log('📋 Auditoria de Erro UTMIFY:', {
      timestamp: new Date().toISOString(),
      function: functionName,
      orderId: orderData.externalId,
      error: errorMessage,
      details: errorDetails,
    });

    // ⚠️ IMPORTANTE: Não lançar erro para não travar a venda
    // A venda continua, mas o rastreamento falhou
    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * Validação básica dos dados do pedido
   */
  validateOrderData(orderData: OrderData): boolean {
    const requiredFields = [
      'orderId',
      'externalId',
      'amount',
      'customer.email',
      'customer.phone',
      'customer.document',
    ];

    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj: any, key) => obj?.[key], orderData);
      if (!value) {
        console.warn(`⚠️ Campo obrigatório ausente: ${field}`);
        return false;
      }
    }

    return true;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const utmifyService = new UtmifyTrackingService();

export default utmifyService;
