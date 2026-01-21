import { useEffect, useState } from 'react';
import { generateQRCodeImage } from '../services/pixPaymentService';
import type { PixTransaction } from '../services/pixPaymentService';

interface PixQRCodeDisplayProps {
  transaction: PixTransaction;
  onCopy?: () => void;
  showDetails?: boolean;
}

/**
 * Componente para exibir QR Code PIX
 * Mostra código visual, código PIX copiável e detalhes
 */
export function PixQRCodeDisplay({
  transaction,
  onCopy,
  showDetails = true,
}: PixQRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (transaction.pix.qrcode) {
      const url = generateQRCodeImage(transaction.pix.qrcode);
      setQrCodeUrl(url);
    }
  }, [transaction.pix.qrcode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transaction.pix.qrcode);
      setCopied(true);
      onCopy?.();

      // Reset copied state após 2 segundos
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar QR Code:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return (value / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg border border-purple-200">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-purple-900 mb-2">
          💳 PIX Gerado com Sucesso
        </h3>
        <p className="text-gray-600">
          Escaneie ou copie o código abaixo para pagar
        </p>
      </div>

      {/* QR Code */}
      <div className="mb-6 flex justify-center">
        {qrCodeUrl && (
          <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
            <img
              src={qrCodeUrl}
              alt="QR Code PIX"
              className="w-64 h-64"
              title="Escaneie com seu celular"
            />
          </div>
        )}
      </div>

      {/* Código PIX copiável */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📋 Código PIX (Copia e Cola)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={transaction.pix.qrcode}
            readOnly
            className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-mono text-sm text-gray-800 truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {copied ? '✓ Copiado!' : '📋 Copiar'}
          </button>
        </div>
      </div>

      {/* Detalhes da transação */}
      {showDetails && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">📊 Detalhes</h4>

          <div className="space-y-3">
            {/* Valor */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Valor:</span>
              <span className="font-bold text-2xl text-green-600">
                {formatCurrency(transaction.amount)}
              </span>
            </div>

            {/* ID da Transação */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">ID:</span>
              <span className="text-sm text-gray-600 font-mono">
                {transaction.id.substring(0, 12)}...
              </span>
            </div>

            {/* Expiração */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Válido até:</span>
              <span className="text-sm text-gray-600">
                {formatDate(transaction.pix.expirationDate)}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  transaction.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {transaction.status === 'paid'
                  ? '✓ Pago'
                  : transaction.status === 'pending'
                    ? '⏳ Aguardando'
                    : '✗ Falhou'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de segurança */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          🔒 <strong>Seguro:</strong> Seu pagamento é criptografado e protegido
          pela Evollute.
        </p>
      </div>

      {/* Rodapé */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Criado em {new Date(transaction.createdAt).toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  );
}

export default PixQRCodeDisplay;
