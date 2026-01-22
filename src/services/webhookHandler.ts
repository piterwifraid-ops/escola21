/**
 * Webhook Handler para Evollute PIX
 * Processa notificações de pagamento
 * 
 * URL: https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m
 */

// Status possíveis conforme documentação da API
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'paid' 
  | 'rejected' 
  | 'authorized' 
  | 'protesting' 
  | 'refunded' 
  | 'cancelled' 
  | 'chargeback';

export interface WebhookPayload {
  success: boolean;
  data: {
    id: string;
    externalId: string;
    amount: number;
    refundedAmount: number;
    companyId: number;
    paymentMethod: 'pix' | string;
    status: PaymentStatus;
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

export interface PaymentStatusInfo {
  transactionId: string;
  externalId: string;
  status: PaymentStatus;
  amount: number;
  amountFormatted: string;
  customer: {
    name: string;
    email: string;
    document: string;
  };
  paidAt: string | null;
  receivedAt: string;
  isPaid: boolean;
  isRefunded: boolean;
  isChargeback: boolean;
}

/**
 * Converte valor em centavos para formato moeda brasileira
 */
function formatCurrency(centavos: number): string {
  return `R$ ${(centavos / 100).toFixed(2)}`.replace('.', ',');
}

/**
 * Processa webhook de pagamento PIX
 * Salva no localStorage e dispara eventos
 * 
 * ⚠️ IMPORTANTE: Esta função é chamada pelo seu backend quando recebe webhook
 */
export async function handlePixWebhook(payload: WebhookPayload): Promise<void> {
  try {
    console.log('🔔 Webhook recebido:', payload);

    if (!payload.success || !payload.data) {
      console.error('❌ Webhook inválido:', payload);
      throw new Error('Payload do webhook inválido');
    }

    const transaction = payload.data;
    const receivedAt = new Date().toISOString();

    // Criar objeto de status formatado
    const paymentStatus: PaymentStatusInfo = {
      transactionId: transaction.id,
      externalId: transaction.externalId,
      status: transaction.status,
      amount: transaction.amount,
      amountFormatted: formatCurrency(transaction.amount),
      customer: {
        name: transaction.customer.name,
        email: transaction.customer.email,
        document: transaction.customer.document.number,
      },
      paidAt: transaction.paidAt,
      receivedAt,
      isPaid: transaction.status === 'paid',
      isRefunded: transaction.status === 'refunded',
      isChargeback: transaction.status === 'chargeback',
    };

    // Salvar em localStorage
    localStorage.setItem(
      `pix-payment-${transaction.id}`,
      JSON.stringify(paymentStatus)
    );

    // Log para auditoria
    const auditLog = {
      timestamp: receivedAt,
      event: 'PIX_WEBHOOK_RECEIVED',
      transactionId: transaction.id,
      externalId: transaction.externalId,
      status: transaction.status,
      amount: paymentStatus.amountFormatted,
      customer: transaction.customer.email,
    };

    console.log('📋 Auditoria:', auditLog);

    // Disparar evento customizado para o frontend
    window.dispatchEvent(
      new CustomEvent('pix-payment-update', {
        detail: paymentStatus,
      })
    );

    // Se o pagamento foi confirmado
    if (transaction.status === 'paid' || transaction.status === 'authorized') {
      console.log('✅ Pagamento confirmado!', transaction.id);

      // Aqui você pode:
      // 1. Redirecionar para página de sucesso
      // 2. Atualizar estado global
      // 3. Fazer logout automático
      // 4. Gerar certificado
      // 5. Enviar email de confirmação

      window.dispatchEvent(
        new CustomEvent('pix-payment-success', {
          detail: {
            transactionId: transaction.id,
            amount: paymentStatus.amountFormatted,
            customer: transaction.customer,
            paidAt: transaction.paidAt,
          },
        })
      );
    }

    // Se o pagamento falhou ou foi rejeitado
    if (transaction.status === 'rejected' || transaction.status === 'cancelled') {
      console.warn('⚠️ Pagamento foi rejeitado ou cancelado:', transaction.id);

      window.dispatchEvent(
        new CustomEvent('pix-payment-failed', {
          detail: {
            transactionId: transaction.id,
            status: transaction.status,
          },
        })
      );
    }

    // Se houve reembolso
    if (transaction.status === 'refunded') {
      console.warn('💰 Pagamento foi reembolsado:', transaction.id);
      
      window.dispatchEvent(
        new CustomEvent('pix-payment-refunded', {
          detail: {
            transactionId: transaction.id,
            amount: paymentStatus.amountFormatted,
            refundedAmount: formatCurrency(transaction.refundedAmount),
          },
        })
      );
    }

    // Se houve chargeback
    if (transaction.status === 'chargeback') {
      console.error('⚠️ CHARGEBACK INICIADO:', transaction.id);
      
      window.dispatchEvent(
        new CustomEvent('pix-payment-chargeback', {
          detail: {
            transactionId: transaction.id,
            amount: paymentStatus.amountFormatted,
          },
        })
      );
    }
  } catch (error) {
    console.error('🔥 Erro ao processar webhook:', error);
    throw error;
  }
}

/**
 * Recupera status de pagamento salvo no localStorage
 */
export function getPaymentStatus(transactionId: string): PaymentStatusInfo | null {
  try {
    const status = localStorage.getItem(`pix-payment-${transactionId}`);
    return status ? JSON.parse(status) as PaymentStatusInfo : null;
  } catch (error) {
    console.error('Erro ao recuperar status de pagamento:', error);
    return null;
  }
}

/**
 * Verifica se um pagamento foi confirmado
 */
export function isPaymentConfirmed(transactionId: string): boolean {
  const status = getPaymentStatus(transactionId);
  return status?.isPaid ?? false;
}

/**
 * Verifica se um pagamento foi reembolsado
 */
export function isPaymentRefunded(transactionId: string): boolean {
  const status = getPaymentStatus(transactionId);
  return status?.isRefunded ?? false;
}

/**
 * Verifica se há chargeback
 */
export function hasChargeback(transactionId: string): boolean {
  const status = getPaymentStatus(transactionId);
  return status?.isChargeback ?? false;
}

/**
 * Limpa dados de pagamento (use após confirmação)
 */
export function clearPaymentData(transactionId: string): void {
  localStorage.removeItem(`pix-payment-${transactionId}`);
  console.log('🧹 Dados de pagamento removidos:', transactionId);
}

/**
 * Monitora mudanças de pagamento em tempo real
 * Retorna função para cancelar a observação
 */
export function onPaymentStatusChange(
  callback: (data: PaymentStatusInfo) => void
): (() => void) {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail as PaymentStatusInfo);
    }
  };

  window.addEventListener('pix-payment-update', handler);

  // Retorna função para remover listener
  return () => window.removeEventListener('pix-payment-update', handler);
}

/**
 * Monitora sucesso de pagamento
 * Retorna função para cancelar a observação
 */
export function onPaymentSuccess(
  callback: (data: {
    transactionId: string;
    amount: string;
    customer: any;
    paidAt: string | null;
  }) => void
): (() => void) {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener('pix-payment-success', handler);

  return () => window.removeEventListener('pix-payment-success', handler);
}

/**
 * Monitora falha de pagamento
 * Retorna função para cancelar a observação
 */
export function onPaymentFailure(
  callback: (data: { transactionId: string; status: string }) => void
): (() => void) {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener('pix-payment-failed', handler);

  return () => window.removeEventListener('pix-payment-failed', handler);
}

/**
 * Monitora reembolso de pagamento
 * Retorna função para cancelar a observação
 */
export function onPaymentRefunded(
  callback: (data: { transactionId: string; amount: string; refundedAmount: string }) => void
): (() => void) {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener('pix-payment-refunded', handler);

  return () => window.removeEventListener('pix-payment-refunded', handler);
}

/**
 * Monitora chargeback
 * Retorna função para cancelar a observação
 */
export function onPaymentChargeback(
  callback: (data: { transactionId: string; amount: string }) => void
): (() => void) {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener('pix-payment-chargeback', handler);

  return () => window.removeEventListener('pix-payment-chargeback', handler);
}
