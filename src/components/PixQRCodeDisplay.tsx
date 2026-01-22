import { useState } from 'react';
import { PixTransaction } from '../services/pixPaymentService';

interface PixQRCodeDisplayProps {
  transaction: PixTransaction;
  onCopyQRCode: () => void;
}

export default function PixQRCodeDisplay({
  transaction,
  onCopyQRCode,
}: PixQRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(transaction.pix.qrcode);
    setCopied(true);
    onCopyQRCode();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* QR Code */}
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Escaneie o QR Code</h3>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
            transaction.pix.qrcode
          )}`}
          alt="QR Code PIX"
          className="w-64 h-64 border-4 border-green-500 rounded-lg shadow-md"
        />
      </div>

      {/* Código PIX para copiar */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800">Ou copie o código</h3>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between gap-3">
          <code className="text-sm text-gray-700 break-all flex-1">
            {transaction.pix.qrcode}
          </code>
          <button
            onClick={handleCopyCode}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copied ? '✅ Copiado!' : '📋 Copiar'}
          </button>
        </div>
      </div>

      {/* Informações da transação */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-lg font-bold text-gray-800">Informações</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Valor:</span>
            <span className="font-bold text-gray-800">
              R$ {(transaction.amount / 100).toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Taxa:</span>
            <span className="font-bold text-gray-800">
              R$ {(transaction.fee.estimatedFee / 100).toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Valor líquido:</span>
            <span className="font-bold text-green-600">
              R$ {(transaction.fee.netAmount / 100).toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Vencimento:</span>
            <span className="font-bold text-gray-800">
              {new Date(transaction.pix.expirationDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-bold ${
              transaction.status === 'pending'
                ? 'text-yellow-600'
                : transaction.status === 'paid'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {transaction.status === 'pending'
                ? '⏳ Aguardando pagamento'
                : transaction.status === 'paid'
                ? '✅ Pago'
                : '❌ Cancelado'}
            </span>
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Você pode escanear o QR Code com a câmera do seu celular
          ou usar qualquer app de banco que suporte PIX.
        </p>
      </div>
    </div>
  );
}
