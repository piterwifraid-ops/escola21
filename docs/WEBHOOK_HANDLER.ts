/**
 * WEBHOOK HANDLER PARA NOTIFICAÇÕES DE PIX
 * 
 * Este arquivo deve ser implementado no seu backend (Node.js/Express por exemplo)
 * 
 * Exemplo de uso com Express:
 * 
 * app.post('/fmatwcswzobzzdsgrkgv1p9kz049g57m', webhookHandler);
 */

// Tipo da payload que você receberá
export interface WebhookPayload {
  success: boolean;
  data: {
    id: string;
    externalId: string;
    amount: number;
    refundedAmount: number;
    companyId: number;
    paymentMethod: 'pix' | string;
    status: 'pending' | 'paid' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
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
        type: 'cpf';
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

/**
 * Exemplo de implementação com Express
 * 
 * POST /fmatwcswzobzzdsgrkgv1p9kz049g57m
 * 
 * Headers esperados:
 * - X-Postback-Token: token para validar (opcional, fornecido pela Evollute)
 * 
 * Body: WebhookPayload
 */
export async function webhookHandler(req: any, res: any) {
  try {
    const payload: WebhookPayload = req.body;

    console.log('🔔 Webhook recebido da Evollute');
    console.log('Transaction ID:', payload.data.id);
    console.log('Status:', payload.data.status);
    console.log('CPF:', payload.data.customer.document.number);

    // 1. Validar a assinatura/token (opcional)
    const token = req.headers['x-postback-token'];
    if (token) {
      // Aqui você pode validar o token fornecido pela Evollute
      // const isValid = validateToken(token);
      // if (!isValid) {
      //   return res.status(401).json({ error: 'Unauthorized' });
      // }
    }

    // 2. Verificar se o status é de sucesso
    if (payload.data.status === 'paid' || payload.data.status === 'confirmed') {
      console.log('✅ Pagamento confirmado!');
      
      // 3. Atualizar seu banco de dados
      // Exemplo: const user = await User.findByCPF(payload.data.customer.document.number);
      // await user.update({ 
      //   inscriptionPaid: true,
      //   transactionId: payload.data.id,
      //   paidAt: new Date()
      // });

      // 4. Enviar email de confirmação
      // await sendConfirmationEmail(payload.data.customer.email);

      // 5. Gerar certificado ou liberar acesso
      // await grantAccess(payload.data.customer.email);

      console.log('✅ Inscrição confirmada para:', payload.data.customer.email);
      
      return res.json({ success: true, message: 'Pagamento processado com sucesso' });
    }

    // 6. Verificar outros status
    if (payload.data.status === 'failed' || payload.data.status === 'cancelled') {
      console.log('❌ Pagamento falhou ou foi cancelado');
      
      // Atualizar status no banco de dados
      // await Transaction.updateStatus(payload.data.id, payload.data.status);
      
      return res.json({ success: true, message: 'Status atualizado' });
    }

    if (payload.data.status === 'refunded') {
      console.log('💰 Reembolso processado');
      
      // Processar reembolso
      // await handleRefund(payload.data);
      
      return res.json({ success: true, message: 'Reembolso processado' });
    }

    // Status pendente ou outros
    console.log('⏳ Status:', payload.data.status);
    
    return res.json({ success: true, message: 'Webhook recebido' });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Importante: retornar 200 mesmo em erro para que a API não tente reenviar
    return res.status(200).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

/**
 * EXEMPLO DE IMPLEMENTAÇÃO COM EXPRESS
 * 
 * import express from 'express';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * // Rota do webhook
 * app.post('/fmatwcswzobzzdsgrkgv1p9kz049g57m', webhookHandler);
 * 
 * // Iniciar servidor
 * app.listen(3000, () => {
 *   console.log('Servidor de webhook rodando na porta 3000');
 * });
 */

/**
 * FLUXO DE PAGAMENTO COM WEBHOOK
 * 
 * 1. Usuário clica em "GERAR PIX"
 *    ↓
 * 2. Frontend chama createPixTransaction()
 *    ↓
 * 3. API Evollute retorna QR Code com transactionId
 *    ↓
 * 4. Usuário escaneia QR Code e paga
 *    ↓
 * 5. Banco envia confirmação para Evollute
 *    ↓
 * 6. Evollute envia webhook para seu servidor
 *    ↓
 * 7. Seu servidor atualiza status no banco de dados
 *    ↓
 * 8. (Opcional) Enviar email ou liberar acesso
 *    ↓
 * 9. Usuário recebe confirmação
 */
