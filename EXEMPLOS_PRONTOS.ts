// ============================================================
// 📋 EXEMPLOS PRONTOS PARA USAR
// ============================================================

// ============================================================
// 1️⃣ EXEMPLO: Usar PIX no Componente Chat
// ============================================================

import { usePixPayment } from '../hooks/usePixPayment';

export function PixPaymentExample() {
  const { transaction, generatePix, loading, error, success } = usePixPayment();

  const handleClick = async () => {
    try {
      const pix = await generatePix(
        'João Silva',           // nome
        'joao@email.com',       // email
        '11999999999',          // telefone
        '12345678901',          // cpf
        5840                    // valor em centavos (R$ 58,40)
      );

      console.log('✅ PIX Gerado!');
      console.log('QR Code:', pix.pix.qrcode);
      console.log('Vencimento:', pix.pix.expirationDate);
    } catch (err) {
      console.error('❌ Erro:', err);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? '⏳ Gerando...' : '📱 Gerar PIX'}
      </button>

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {success && transaction && (
        <div style={{ border: '1px solid green', padding: '20px' }}>
          <h2>✅ PIX Gerado com Sucesso!</h2>
          <p>
            <strong>Escaneie o QR Code:</strong>
          </p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              transaction.pix.qrcode
            )}`}
            alt="QR Code PIX"
            style={{ width: '300px', height: '300px' }}
          />
          <p>
            <strong>Ou copie este código:</strong>
          </p>
          <code
            style={{
              background: '#f0f0f0',
              padding: '10px',
              display: 'block',
              wordBreak: 'break-all',
            }}
          >
            {transaction.pix.qrcode}
          </code>
          <p>
            <strong>Válido até:</strong>{' '}
            {new Date(transaction.pix.expirationDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2️⃣ EXEMPLO: Verificar Status de Pagamento
// ============================================================

import { usePixPayment } from '../hooks/usePixPayment';

export function CheckPaymentExample() {
  const { checkPaymentStatus, isPaid } = usePixPayment();

  const handleCheckStatus = async () => {
    try {
      const status = await checkPaymentStatus('200014');
      console.log('Status:', status.status);
      console.log('Valor:', `R$ ${(status.amount / 100).toFixed(2)}`);

      if (status.status === 'paid') {
        console.log('✅ PIX foi pago!');
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleCheckIfPaid = async () => {
    const paid = await isPaid('200014');
    if (paid) {
      console.log('✅ Este PIX foi pago!');
    } else {
      console.log('⏳ Este PIX ainda não foi pago');
    }
  };

  return (
    <div>
      <button onClick={handleCheckStatus}>Verificar Status</button>
      <button onClick={handleCheckIfPaid}>Foi Pago?</button>
    </div>
  );
}

// ============================================================
// 3️⃣ EXEMPLO: Backend - Receber Webhook
// ============================================================

// arquivo: webhook.ts (Express)

import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

interface WebhookPayload {
  data: {
    id: string;
    status: string;
    amount: number;
    customer: {
      document: { number: string };
      email: string;
      name: string;
    };
  };
}

// URL: https://seu-dominio.com/fmatwcswzobzzdsgrkgv1p9kz049g57m
app.post('/fmatwcswzobzzdsgrkgv1p9kz049g57m', (req: Request, res: Response) => {
  const payload: WebhookPayload = req.body;

  console.log('🔔 Webhook recebido!');
  console.log('Transaction:', payload.data.id);
  console.log('Status:', payload.data.status);
  console.log('Cliente:', payload.data.customer.email);

  // ✅ Pagamento confirmado
  if (payload.data.status === 'paid' || payload.data.status === 'confirmed') {
    console.log('✅ PAGAMENTO CONFIRMADO');

    // 1. Atualizar banco de dados
    // const user = await User.findByCPF(payload.data.customer.document.number);
    // await user.update({ inscriptionPaid: true });

    // 2. Enviar email
    // await sendEmail(payload.data.customer.email, 'Inscrição confirmada!');

    // 3. Liberar acesso
    // await grantAccess(payload.data.customer.email);
  }

  // ❌ Pagamento falhou
  if (payload.data.status === 'failed' || payload.data.status === 'cancelled') {
    console.log('❌ PAGAMENTO FALHOU');
    // await handleFailedPayment(payload.data.customer.email);
  }

  // IMPORTANTE: Retornar 200 para confirmar recebimento
  res.status(200).json({ success: true });
});

app.listen(3001, () => {
  console.log('🚀 Webhook server rodando na porta 3001');
});

// ============================================================
// 4️⃣ EXEMPLO: Chamar Serviço Direto
// ============================================================

import { createPixTransaction, checkPixTransactionStatus } from '../services/pixPaymentService';

async function exemploDiretoSemHook() {
  try {
    // 1. Criar PIX
    const transaction = await createPixTransaction({
      customer: {
        name: 'Maria Silva',
        email: 'maria@email.com',
        phone: '21987654321',
        cpf: '98765432101',
      },
      amount: 5840,
      expiresInDays: 1,
    });

    console.log('✅ PIX criado:', transaction.id);
    console.log('QR Code:', transaction.pix.qrcode);

    // 2. Verificar status depois
    const status = await checkPixTransactionStatus(transaction.id);
    console.log('Status atual:', status.status);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================
// 5️⃣ EXEMPLO: Validar Dados Antes de Gerar PIX
// ============================================================

function validarDadosPIX(dados: {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
}): boolean {
  const erros: string[] = [];

  if (!dados.nome || dados.nome.length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres');
  }

  if (!dados.email || !dados.email.includes('@')) {
    erros.push('Email inválido');
  }

  const phone = dados.telefone?.replace(/\D/g, '') || '';
  if (phone.length < 10) {
    erros.push('Telefone deve ter pelo menos 10 dígitos');
  }

  const cpf = dados.cpf?.replace(/\D/g, '') || '';
  if (cpf.length !== 11) {
    erros.push('CPF deve ter 11 dígitos');
  }

  if (erros.length > 0) {
    console.error('❌ Erros de validação:');
    erros.forEach(e => console.error(`   - ${e}`));
    return false;
  }

  console.log('✅ Dados válidos!');
  return true;
}

// Usar:
if (validarDadosPIX({
  nome: 'João',
  email: 'joao@email.com',
  telefone: '11999999999',
  cpf: '12345678901'
})) {
  // Gerar PIX
}

// ============================================================
// 6️⃣ EXEMPLO: Integrar com Formulário
// ============================================================

import { usePixPayment } from '../hooks/usePixPayment';
import { useState } from 'react';

export function PixFormExample() {
  const { generatePix, loading, transaction } = usePixPayment();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const pix = await generatePix(
        formData.nome,
        formData.email,
        formData.telefone,
        formData.cpf,
        5840
      );

      console.log('✅ PIX Gerado!');
      // Mostrar QR Code
    } catch (error) {
      console.error('❌ Erro:', error);
      alert('Erro ao gerar PIX');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={formData.nome}
        onChange={e => setFormData({ ...formData, nome: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Telefone"
        value={formData.telefone}
        onChange={e => setFormData({ ...formData, telefone: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="CPF"
        value={formData.cpf}
        onChange={e => setFormData({ ...formData, cpf: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar PIX'}
      </button>

      {transaction && (
        <div>
          <h2>PIX Gerado!</h2>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              transaction.pix.qrcode
            )}`}
            alt="QR Code"
          />
        </div>
      )}
    </form>
  );
}

// ============================================================
// 7️⃣ EXEMPLO: Polling - Verificar Pagamento Periodicamente
// ============================================================

import { usePixPayment } from '../hooks/usePixPayment';
import { useEffect } from 'react';

export function PixPollingExample({ transactionId }: { transactionId: string }) {
  const { checkPaymentStatus, isPaid } = usePixPayment();

  useEffect(() => {
    const interval = setInterval(async () => {
      const paid = await isPaid(transactionId);

      if (paid) {
        console.log('✅ Pagamento recebido!');
        clearInterval(interval);
        // Redirecionar para página de sucesso
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, [transactionId]);

  return <p>⏳ Aguardando pagamento...</p>;
}

// ============================================================
// 8️⃣ EXEMPLO: Testar via Terminal
// ============================================================

/*
# Arquivo: test-pix.js

const API_KEY = 'pk_live_6f981087a75280e1cb126b9f728296b9';
const SECRET_KEY = 'sk_live_a4f17310be395f61ea7763a27236621e';

function createAuthHeader() {
  const credentials = `${API_KEY}:${SECRET_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

async function testPix() {
  const payload = {
    customer: {
      name: 'Teste User',
      email: 'teste@email.com',
      phone: '11999999999',
      cpf: '12345678901',
    },
    amount: 5840,
    paymentMethod: 'pix',
    externalId: `test-${Date.now()}`,
    items: [
      {
        name: 'Inscrição',
        quantity: '1',
        unitPrice: '5840',
        externalRef: 'item-001',
      },
    ],
    pix: { expiresInDays: 1 },
  };

  const response = await fetch(
    'https://gateway.evollute.tech/transactions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();
  console.log(result);
}

testPix();

// Executar: node test-pix.js
*/

export {}; // Para TypeScript não reclamar
