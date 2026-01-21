/**
 * EXEMPLO PRÁTICO: Usar a Integração UTMIFY
 * 
 * Este arquivo mostra como usar a integração em seus componentes
 */

// ============================================
// EXEMPLO 1: Component React - Criar Pedido PIX
// ============================================

import React, { useState } from 'react';

interface PixPaymentFormProps {
  onSuccess?: (data: any) => void;
}

export function PixPaymentForm({ onSuccess }: PixPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePix = async () => {
    setLoading(true);
    setError(null);

    try {
      // ============================================
      // PASSO 1: Extrair UTMs do URL
      // ============================================

      const params = new URLSearchParams(window.location.search);
      const utmParams = {
        utm_source: params.get('utm_source') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_content: params.get('utm_content') || undefined,
        utm_term: params.get('utm_term') || undefined,
      };

      // ============================================
      // PASSO 2: Obter IP do Cliente
      // ============================================

      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const clientIP = ipData.ip;

      // ============================================
      // PASSO 3: Preparar dados do pedido
      // ============================================

      const orderData = {
        customer: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '+5511999999999',
          document: '12345678900', // CPF
        },
        product: {
          id: 'curso-001',
          name: 'Curso de Programação com Python',
          quantity: 1,
          price: 299.90, // Em reais
        },
        utmParams,
        ip: clientIP,
        userAgent: navigator.userAgent,
      };

      // ============================================
      // PASSO 4: Chamar endpoint para criar PIX
      // ============================================

      const response = await fetch('/api/orders/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar pedido');
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Pedido criado com sucesso:', result.data);

        // Salvar ordem ID para polling depois
        sessionStorage.setItem('orderId', result.data.orderId);
        sessionStorage.setItem('transactionId', result.data.transactionId);

        // Exibir QR Code
        setQrCode(result.data.qrcode);

        // Iniciar polling para verificar pagamento
        startPaymentPolling(result.data.transactionId);

        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.error || 'Erro ao criar pedido');
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pix-form">
      <h2>Pagar com PIX</h2>

      {error && <div className="error">{error}</div>}

      {qrCode ? (
        <div className="qr-code-container">
          <p>Escaneie o QR Code com seu aplicativo bancário:</p>
          <img src={qrCode} alt="QR Code PIX" />
          <p className="info">Aguardando pagamento...</p>
        </div>
      ) : (
        <button onClick={handleCreatePix} disabled={loading}>
          {loading ? 'Gerando PIX...' : 'Criar PIX'}
        </button>
      )}
    </div>
  );
}

// ============================================
// EXEMPLO 2: Polling para Verificar Pagamento
// ============================================

function startPaymentPolling(transactionId: string) {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/orders/${transactionId}`);
      const data = await response.json();

      if (data.status === 'PAID') {
        console.log('✅ PAGAMENTO CONFIRMADO!');
        clearInterval(pollInterval);

        // Redirecionar para sucesso
        window.location.href = '/upsell4';
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  }, 3000); // Verificar a cada 3 segundos

  // Parar após 10 minutos
  setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
}

// ============================================
// EXEMPLO 3: Backend - Express Routes
// ============================================

/**
 * Arquivo: src/server/main.ts
 */

import express from 'express';
import ordersRouter from './routes/orders';
import webhookRouter from './routes/webhook';

const app = express();

app.use(express.json());

// Middleware para extrair IP
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] as string ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress;
  
  (req as any).clientIP = ip;
  next();
});

// Rotas
app.use('/api/orders', ordersRouter);
app.use('/webhook', webhookRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 Webhook: http://localhost:${PORT}/webhook/fmatwcswzobzzdsgrkgv1p9kz049g57m`);
});

// ============================================
// EXEMPLO 4: Usar Service UTMIFY Diretamente
// ============================================

import { utmifyService, OrderData } from './services/utmifyTrackingService';

async function exemploUsoManual() {
  // Dados do pedido
  const orderData: OrderData = {
    orderId: 'order-001',
    externalId: 'tx-001',
    amount: 299.90,
    status: 'pending',
    customer: {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+5511999999999',
      document: '12345678900',
      ip: '192.168.1.1',
    },
    products: [
      {
        id: 'curso-001',
        name: 'Curso Python',
        quantity: 1,
        price: 299.90,
      },
    ],
    utmParams: {
      utm_source: 'google',
      utm_campaign: 'curso_python',
      utm_medium: 'cpc',
    },
  };

  // Registrar pedido em UTMIFY (Momento 1)
  console.log('📤 Enviando para UTMIFY...');
  const result1 = await utmifyService.trackOrderCreated(orderData);
  console.log('Resultado:', result1);

  // Depois quando PIX for pago...
  const paidOrderData: OrderData = {
    ...orderData,
    status: 'paid',
    paidAt: new Date().toISOString(),
  };

  console.log('📤 Atualizando em UTMIFY...');
  const result2 = await utmifyService.trackOrderPaid(paidOrderData);
  console.log('Resultado:', result2);
}

// ============================================
// EXEMPLO 5: Testes com cURL
// ============================================

/*

# TESTE 1: Criar Pedido PIX
curl -X POST http://localhost:3000/api/orders/create-pix \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+5511999999999",
      "document": "12345678900"
    },
    "product": {
      "id": "curso-001",
      "name": "Curso de Programação",
      "quantity": 1,
      "price": 299.90
    },
    "utmParams": {
      "utm_source": "google",
      "utm_campaign": "curso_python",
      "utm_medium": "cpc"
    },
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }'

# TESTE 2: Simular Webhook PIX Pago
curl -X POST http://localhost:3000/webhook/fmatwcswzobzzdsgrkgv1p9kz049g57m \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "data": {
      "id": "tx-123",
      "externalId": "order-123",
      "amount": 29990,
      "refundedAmount": 0,
      "status": "paid",
      "paidAt": "2026-01-21T12:00:00Z",
      "createdAt": "2026-01-21T11:50:00Z",
      "updatedAt": "2026-01-21T12:00:00Z",
      "customer": {
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "+5511999999999",
        "document": {
          "number": "12345678900",
          "type": "cpf"
        }
      }
    }
  }'

*/

// ============================================
// EXEMPLO 6: Variáveis de Ambiente
// ============================================

/*

# .env.local

# UTMIFY
UTMIFY_TOKEN=Uf0hPSmaWRJWRWIfOscqQmx6s2Yw0RJtODMJ

# EVOLLUTE
EVOLLUTE_API_KEY=sua_chave_evollute
WEBHOOK_URL=https://agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m

# DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/escola22

# ENV
NODE_ENV=development

*/

export { PixPaymentForm, startPaymentPolling, exemploUsoManual };
