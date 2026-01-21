import { useState, useCallback, useEffect } from 'react';
import {
  createPixTransaction,
  checkPixTransactionStatus,
  type PixTransaction,
} from '../services/pixPaymentService';
import { onPaymentSuccess, onPaymentFailure } from '../services/webhookHandler';

export interface UsePixPaymentOptions {
  onSuccess?: (transaction: PixTransaction) => void;
  onError?: (error: Error) => void;
  autoCheckStatus?: boolean;
  checkStatusInterval?: number;
}

export interface UsePixPaymentState {
  transaction: PixTransaction | null;
  isLoading: boolean;
  error: Error | null;
  status: 'idle' | 'loading' | 'success' | 'error' | 'checking';
}

/**
 * Hook para gerenciar transações PIX
 */
export function usePixPayment(options: UsePixPaymentOptions = {}) {
  const { onSuccess, onError, autoCheckStatus = true, checkStatusInterval = 5000 } = options;

  const [state, setState] = useState<UsePixPaymentState>({
    transaction: null,
    isLoading: false,
    error: null,
    status: 'idle',
  });

  const [checkInterval, setCheckInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Criar transação PIX
  const createTransaction = useCallback(
    async (data: Parameters<typeof createPixTransaction>[0]) => {
      setState(prev => ({ ...prev, isLoading: true, status: 'loading', error: null }));

      try {
        const transaction = await createPixTransaction(data);
        setState(prev => ({
          ...prev,
          transaction,
          isLoading: false,
          status: 'success',
        }));

        onSuccess?.(transaction);

        // Iniciar verificação automática de status
        if (autoCheckStatus && transaction.id) {
          const interval = setInterval(() => {
            checkStatus(transaction.id);
          }, checkStatusInterval);
          setCheckInterval(interval);
        }

        return transaction;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err,
          status: 'error',
        }));
        onError?.(err);
        throw err;
      }
    },
    [onSuccess, onError, autoCheckStatus, checkStatusInterval]
  );

  // Verificar status da transação
  const checkStatus = useCallback(async (transactionId: string) => {
    setState(prev => ({ ...prev, status: 'checking' }));

    try {
      const transaction = await checkPixTransactionStatus(transactionId);
      setState(prev => ({
        ...prev,
        transaction,
        status: transaction.status === 'paid' ? 'success' : 'checking',
      }));

      // Se foi pago, parar de verificar
      if (
        transaction.status === 'paid' ||
        transaction.status === 'completed' ||
        transaction.status === 'failed'
      ) {
        if (checkInterval) {
          clearInterval(checkInterval);
          setCheckInterval(null);
        }
      }

      return transaction;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        error: err,
        status: 'error',
      }));
      throw err;
    }
  }, [checkInterval]);

  // Copiar código PIX para clipboard
  const copyQrCode = useCallback(async () => {
    if (!state.transaction?.pix.qrcode) {
      throw new Error('QR Code não disponível');
    }

    try {
      await navigator.clipboard.writeText(state.transaction.pix.qrcode);
      return true;
    } catch (error) {
      console.error('Erro ao copiar QR Code:', error);
      throw error;
    }
  }, [state.transaction?.pix.qrcode]);

  // Limpar
  const reset = useCallback(() => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setState({
      transaction: null,
      isLoading: false,
      error: null,
      status: 'idle',
    });
  }, [checkInterval]);

  // Setup webhook listeners
  useEffect(() => {
    const unsubscribeSuccess = onPaymentSuccess(() => {
      setState(prev => ({ ...prev, status: 'success' }));
      onSuccess?.(state.transaction!);
    });

    const unsubscribeFailure = onPaymentFailure(() => {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: new Error('Pagamento falhou'),
      }));
    });

    return () => {
      unsubscribeSuccess();
      unsubscribeFailure();
    };
  }, [onSuccess, state.transaction]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  return {
    ...state,
    createTransaction,
    checkStatus,
    copyQrCode,
    reset,
  };
}
