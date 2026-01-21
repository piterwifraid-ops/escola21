/**
 * EXEMPLO PRÁTICO: Integração Webhook PIX
 * 
 * Este arquivo mostra um exemplo completo de como integrar webhook
 * em uma página de pagamento real
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  handlePixWebhook,
  getPaymentStatus,
  isPaymentConfirmed,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentRefunded,
  onPaymentChargeback,
  PaymentStatusInfo,
} from '../services/webhookHandler';
import { createPixTransaction } from '../services/pixPaymentService';

/**
 * Componente: Página de Pagamento com Webhook
 * 
 * Responsabilidades:
 * 1. Criar transação PIX
 * 2. Ouvir webhook do backend
 * 3. Atualizar UI conforme status
 * 4. Redirecionar após confirmação
 */
export function PixPaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Estados
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [paymentInfo, setPaymentInfo] = useState<PaymentStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Criar transação PIX ao carregar
  useEffect(() => {
    async function initializePayment() {
      try {
        setLoading(true);

        // Criar transação com URL do webhook
        const response = await createPixTransaction({
          customer: {
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '11999999999',
            cpf: '11122233344',
          },
          amount: 10000, // R$ 100,00
          externalId: orderId || 'order-123',
          // 👇 URL do webhook - deve ser seu domínio real
          postbackUrl: 'https://seu-dominio.com/webhook/pix',
          items: [
            {
              name: 'Programa de Treinamento',
              quantity: '1',
              unitPrice: '10000',
            },
          ],
        });

        const id = response.data.id;
        setTransactionId(id);

        // Salvar transactionId para consulta posterior
        localStorage.setItem('current-transaction', id);

        console.log('✅ Transação criada:', id);
      } catch (err) {
        setError('Erro ao criar transação PIX');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    initializePayment();
  }, [orderId]);

  // 2. Ouvir webhook de sucesso
  useEffect(() => {
    if (!transactionId) return;

    const unsubscribe = onPaymentSuccess((data) => {
      console.log('✅ Pagamento confirmado pelo webhook!', data);
      setStatus('paid');
      setPaymentInfo({
        transactionId: data.transactionId,
        externalId: orderId || 'order-123',
        status: 'paid',
        amount: 10000,
        amountFormatted: data.amount,
        customer: {
          name: 'João Silva',
          email: 'joao@email.com',
          document: '11122233344',
        },
        paidAt: data.paidAt,
        receivedAt: new Date().toISOString(),
        isPaid: true,
        isRefunded: false,
        isChargeback: false,
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/success', { state: { transactionId: data.transactionId } });
      }, 2000);
    });

    return unsubscribe;
  }, [transactionId, orderId, navigate]);

  // 3. Ouvir webhook de falha
  useEffect(() => {
    if (!transactionId) return;

    const unsubscribe = onPaymentFailure((data) => {
      console.log('❌ Pagamento falhou:', data);
      setStatus('failed');
      setError('Pagamento não confirmado. Tente novamente.');
    });

    return unsubscribe;
  }, [transactionId]);

  // 4. Ouvir webhook de reembolso
  useEffect(() => {
    if (!transactionId) return;

    const unsubscribe = onPaymentRefunded((data) => {
      console.log('💰 Reembolso processado:', data);
      setStatus('refunded');
      setError('Seu pagamento foi reembolsado.');
    });

    return unsubscribe;
  }, [transactionId]);

  // 5. Ouvir webhook de chargeback
  useEffect(() => {
    if (!transactionId) return;

    const unsubscribe = onPaymentChargeback((data) => {
      console.log('⚠️ Chargeback iniciado:', data);
      setStatus('chargeback');
      setError('Houve uma disputa em seu pagamento. Entraremos em contato.');
    });

    return unsubscribe;
  }, [transactionId]);

  // 6. Verificar status inicial (caso página recarregar)
  useEffect(() => {
    if (!transactionId) return;

    const saved = getPaymentStatus(transactionId);
    if (saved) {
      console.log('💾 Status salvo encontrado:', saved);
      setPaymentInfo(saved);
      setStatus(saved.status);

      // Se já estava pago, redirecionar
      if (saved.isPaid) {
        setTimeout(() => {
          navigate('/success', { state: { transactionId } });
        }, 1000);
      }
    }
  }, [transactionId, navigate]);

  // Renderizar
  if (loading) {
    return (
      <div className="payment-container">
        <div className="spinner">⏳ Gerando código PIX...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container error">
        <h2>❌ Erro</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {status === 'paid' ? (
        <div className="success-preview">
          <h1>✅ Pagamento Confirmado!</h1>
          <p>Redirecionando para próxima página...</p>
        </div>
      ) : (
        <div className="pending-payment">
          <h1>💳 Pagamento PIX</h1>

          {paymentInfo && (
            <div className="payment-info">
              <p>
                <strong>Valor:</strong> {paymentInfo.amountFormatted}
              </p>
              <p>
                <strong>ID:</strong> {paymentInfo.externalId}
              </p>
              <p>
                <strong>Status:</strong> {paymentInfo.status}
              </p>
            </div>
          )}

          <div className="instructions">
            <h2>📱 Escaneie o código abaixo com seu celular</h2>
            <p>Use qualquer app de banco ou Pix para escanear</p>

            {/* QR Code seria renderizado aqui */}
            <div className="qrcode-placeholder">[QR Code será exibido aqui]</div>

            <p className="expiration">Código expira em 30 minutos</p>
          </div>

          <div className="status-monitor">
            <h3>⏳ Aguardando Confirmação...</h3>
            <p>
              Assim que você escaneier e pagar, receberemos a confirmação
              automaticamente
            </p>

            {/* Debug: Simular webhook localmente */}
            {process.env.NODE_ENV === 'development' && transactionId && (
              <details className="debug">
                <summary>🔧 DEBUG</summary>
                <button
                  onClick={() => {
                    // Simular webhook de sucesso
                    handlePixWebhook({
                      success: true,
                      data: {
                        id: transactionId,
                        externalId: orderId || 'order-123',
                        amount: 10000,
                        refundedAmount: 0,
                        companyId: 2,
                        paymentMethod: 'pix',
                        status: 'paid',
                        postbackUrl: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        paidAt: new Date().toISOString(),
                        customer: {
                          id: 1,
                          name: 'João Silva',
                          email: 'joao@email.com',
                          phone: '11999999999',
                          document: {
                            number: '11122233344',
                            type: 'cpf',
                          },
                        },
                        items: [
                          {
                            title: 'Programa',
                            unitPrice: 10000,
                            quantity: 1,
                          },
                        ],
                        fee: {
                          fixedAmount: 140,
                          spreadPercentage: 0,
                          estimatedFee: 140,
                          netAmount: 9860,
                        },
                        pix: {
                          qrcode: '00020126490014br.gov.bcb...',
                          end2EndId: null,
                          receiptUrl: null,
                          expirationDate: new Date().toISOString(),
                        },
                      },
                    });
                  }}
                  className="btn-debug"
                >
                  Simular Pagamento (Dev)
                </button>
              </details>
            )}
          </div>
        </div>
      )}

      <style>{`
        .payment-container {
          max-width: 500px;
          margin: 40px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          text-align: center;
        }

        .spinner {
          font-size: 24px;
          padding: 40px;
        }

        .error {
          background-color: #fee;
          border-color: #f00;
        }

        .success-preview {
          background-color: #efe;
          padding: 40px;
          border-radius: 8px;
        }

        .payment-info {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          text-align: left;
        }

        .qrcode-placeholder {
          background-color: #e8e8e8;
          width: 300px;
          height: 300px;
          margin: 30px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 14px;
          color: #999;
        }

        .expiration {
          font-size: 12px;
          color: #999;
          margin-top: 15px;
        }

        .status-monitor {
          margin-top: 30px;
          padding: 20px;
          background-color: #f0f8ff;
          border-radius: 6px;
        }

        .debug {
          margin-top: 20px;
          padding: 10px;
          background-color: #fffacd;
          border-radius: 4px;
          text-align: left;
        }

        .btn-debug {
          background-color: #ff9800;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-debug:hover {
          background-color: #f57c00;
        }

        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}

export default PixPaymentPage;
