import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onPaymentSuccess } from '../services/webhookHandler';

/**
 * Hook que redireciona para /upsell4 quando PIX é pago
 * Use este hook em qualquer página que tenha PIX
 * 
 * Exemplo:
 * function PixPayment() {
 *   usePixRedirect();
 *   return <div>Aguardando pagamento...</div>;
 * }
 */
export function usePixRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta o evento de sucesso de pagamento
    const unsubscribe = onPaymentSuccess((paymentData) => {
      console.log('✅ PIX Pago! Redirecionando para /upsell4...');
      console.log('Dados do pagamento:', paymentData);

      // Aguarda um pouco para garantir que o backend processou
      setTimeout(() => {
        navigate('/upsell4', {
          state: {
            paymentData,
            from: 'pix-webhook',
          },
        });
      }, 1000);
    });

    return () => unsubscribe();
  }, [navigate]);
}

export default usePixRedirect;
