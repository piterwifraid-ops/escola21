import React, { useState } from 'react';
import useUtmNavigator from '../hooks/useUtmNavigator';

const Teste: React.FC = () => {
  const navigate = useUtmNavigator();
  const [activeTab, setActiveTab] = useState<'documentos' | 'unidades' | 'contato'>('documentos');

  return (
    <main className="flex-grow bg-[#F9FAFB]">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mt-4 mb-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm text-gray-500">
            <li>
              <a href="https://www.gov.br" className="text-[#1351B4] hover:underline flex items-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </a>
            </li>
            <li className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[#1351B4] hover:underline cursor-pointer">Ministério da Saúde</span>
            </li>
            <li className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[#1351B4] hover:underline cursor-pointer">Programas</span>
            </li>
            <li className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 font-medium">Enxerga Brasil</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-[#071d41] text-2xl md:text-3xl font-bold mb-1">
              Projeto Enxerga Brasil
            </h1>
            <p className="text-gray-500 text-sm border-b border-gray-200 pb-4 mb-6">
              Programa de acesso gratuito a exames oftalmológicos para todos os brasileiros
            </p>

            {/* Imagem principal */}
            <div className="mb-6">
              <img
                src="https://www.gov.br/ibc/pt-br/assuntos/noticias/projeto-enxerga-if-faz-os-primeiros-atendimentos-em-baixa-visao/projeto-enxerga-if-cerof.jpeg/@@images/a4b88bfe-1a00-4933-96fe-b0177a83ddf6.jpeg"
                alt="Projeto Enxerga Brasil - Atendimento oftalmológico"
                loading="eager"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Info Box */}
            <div className="bg-[#dbe8fb] border-l-4 border-[#1351B4] rounded p-4 mb-6">
              <p className="font-bold text-[#071d41] mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1351B4]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Serviço 100% gratuito
              </p>
              <p className="text-[#071d41] text-sm">
                Qualquer cidadão brasileiro pode agendar seu exame de visão diretamente por este site, sem necessidade de encaminhamento médico e sem custo algum.
              </p>
            </div>

            {/* Sobre o programa */}
            <h2 className="text-[#1351B4] text-xl font-semibold mt-8 mb-3">Sobre o programa</h2>
            <p className="text-[#333] leading-7 mb-4">
              O <strong>Projeto Enxerga Brasil</strong> é uma iniciativa do Governo Federal, coordenada pelo Ministério da Saúde, que garante o acesso a exames oftalmológicos gratuitos para toda a população brasileira. Por meio de um sistema simples e online, o cidadão pode agendar seu atendimento em uma clínica credenciada próxima à sua residência.
            </p>
            <p className="text-[#333] leading-7 mb-4">
              O programa prioriza pessoas que nunca realizaram um exame de vista, crianças em idade escolar, idosos e populações em regiões com menor acesso a serviços especializados de saúde. Para municípios de difícil acesso, o Enxerga Brasil conta com unidades móveis oftalmológicas que percorrem cidades menores e zonas rurais.
            </p>

            {/* Sinais */}
            <h2 className="text-[#1351B4] text-xl font-semibold mt-8 mb-3">Você pode estar precisando de um exame</h2>
            <p className="text-[#333] leading-7 mb-4">
              Muitas pessoas convivem com problemas de visão sem perceber. Fique atento a estes sinais:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: '🤕', text: 'Dor de cabeça frequente' },
                { icon: '📖', text: 'Dificuldade de leitura' },
                { icon: '👁️', text: 'Visão embaçada ou dupla' },
                { icon: '😫', text: 'Olhos cansados ou lacrimejando' },
                { icon: '🎓', text: 'Queda no rendimento escolar' },
                { icon: '🔍', text: 'Dificuldade de enxergar à distância' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 bg-[#f8f9fc] border border-[#dce2ef] rounded-md px-4 py-3 text-[#333] text-sm"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Como funciona */}
            <h2 className="text-[#1351B4] text-xl font-semibold mt-8 mb-3">Como funciona o agendamento</h2>
            <p className="text-[#333] leading-7 mb-4">
              O processo é simples e leva menos de 5 minutos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { num: 1, title: 'Informe seu CEP', desc: 'O sistema localiza as clínicas credenciadas mais próximas de você.' },
                { num: 2, title: 'Escolha data e horário', desc: 'Selecione o dia e hora mais conveniente para você.' },
                { num: 3, title: 'Realize o exame', desc: 'Compareça à clínica e faça seu exame oftalmológico gratuitamente.' },
              ].map((step) => (
                <div key={step.num} className="border border-[#c5d4eb] rounded-lg p-5 text-center bg-white">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1351B4] text-white font-bold text-sm mb-3">
                    {step.num}
                  </div>
                  <p className="font-semibold text-[#071d41] text-sm mb-1">{step.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Quem pode participar */}
            <h2 className="text-[#1351B4] text-xl font-semibold mt-8 mb-3">Quem pode participar</h2>
            <ul className="list-disc pl-5 text-[#333] leading-7 mb-6 space-y-1">
              <li>Qualquer cidadão brasileiro, independentemente de idade ou renda</li>
              <li>Crianças com dificuldade de aprendizado que pode estar relacionada à visão</li>
              <li>Adultos que nunca realizaram um exame oftalmológico</li>
              <li>Idosos com queixa de visão embaçada ou dificuldade de leitura</li>
              <li>Pessoas sem plano de saúde privado</li>
              <li>Moradores de cidades pequenas e zonas rurais</li>
            </ul>

            {/* Após o exame */}
            <h2 className="text-[#1351B4] text-xl font-semibold mt-8 mb-3">O que acontece após o exame</h2>
            <p className="text-[#333] leading-7 mb-6">
              Ao final do atendimento, o paciente recebe os resultados e orientações completas sobre sua saúde visual. Caso seja identificada alguma necessidade de correção ou acompanhamento, o programa fornece as indicações de encaminhamento adequadas dentro da Rede de Atenção à Saúde.
            </p>

            {/* CTA */}
            <div className="bg-[#071d41] rounded-lg p-8 text-center my-8">
              <h2 className="text-white text-xl font-semibold mb-2">Agende seu exame agora</h2>
              <p className="text-white/70 mb-4">Gratuito, rápido e perto de você. Não deixe para depois.</p>
              <button
                onClick={() => navigate('/quiz')}
                className="bg-[#1351B4] hover:bg-[#0c3d8a] text-white font-semibold py-3 px-8 rounded-full transition-colors text-base inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar exame gratuito
              </button>
            </div>

            {/* Tabs - Informações adicionais */}
            <h2 className="text-[#1351B4] text-xl font-semibold mt-8 mb-3">Informações adicionais</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'documentos'
                      ? 'text-[#1351B4] border-b-2 border-[#1351B4] bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Documentos necessários
                </button>
                <button
                  onClick={() => setActiveTab('unidades')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'unidades'
                      ? 'text-[#1351B4] border-b-2 border-[#1351B4] bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Unidades móveis
                </button>
                <button
                  onClick={() => setActiveTab('contato')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'contato'
                      ? 'text-[#1351B4] border-b-2 border-[#1351B4] bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Central de atendimento
                </button>
              </div>

              {/* Tab content */}
              <div className="p-5 bg-white">
                {activeTab === 'documentos' && (
                  <div>
                    <p className="text-[#333] mb-3">Para o atendimento, leve:</p>
                    <ul className="list-disc pl-5 text-[#333] leading-7 space-y-1">
                      <li>Documento de identidade com foto (RG, CNH ou passaporte)</li>
                      <li>CPF</li>
                      <li>Cartão do SUS (se houver)</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'unidades' && (
                  <p className="text-[#333] leading-7">
                    Para municípios com menor cobertura de clínicas, o Enxerga Brasil disponibiliza unidades móveis oftalmológicas que percorrem uma rota mensal pelos estados brasileiros. Consulte a agenda de chegada da unidade móvel na sua região ao realizar o agendamento.
                  </p>
                )}
                {activeTab === 'contato' && (
                  <div className="text-[#333] leading-7 space-y-2">
                    <p><strong>Telefone:</strong> 0800 000 0000 (gratuito)</p>
                    <p><strong>Horário:</strong> Segunda a sexta, das 8h às 20h. Sábados, das 8h às 14h.</p>
                    <p><strong>E-mail:</strong> enxergabrasil@saude.gov.br</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0 pt-1">
            <p className="font-bold text-xs uppercase tracking-wide text-gray-600 mb-2">Nesta seção</p>
            <div className="flex flex-col border-t border-gray-200">
              {[
                'Sobre o programa',
                'Como agendar',
                'Clínicas credenciadas',
                'Unidades móveis',
                'Perguntas frequentes',
                'Legislação',
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-2 py-2.5 border-b border-gray-200 text-[#1351B4] text-sm hover:underline"
                >
                  <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {label}
                </a>
              ))}
            </div>

            {/* CTA sidebar */}
            <div className="mt-6">
              <p className="font-bold text-xs uppercase tracking-wide text-gray-600 mb-2">Acesso rápido</p>
              <button
                onClick={() => navigate('/quiz')}
                className="w-full bg-[#1351B4] hover:bg-[#0c3d8a] text-white font-semibold py-2.5 px-4 rounded transition-colors text-sm inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar exame
              </button>
            </div>

            {/* Help box */}
            <div className="mt-6 p-4 bg-[#f8f9fc] border border-[#dce2ef] rounded-md">
              <p className="font-bold text-xs uppercase tracking-wide text-gray-600 mb-1">Precisa de ajuda?</p>
              <p className="text-xs text-gray-500 mb-1">Ligue gratuitamente</p>
              <p className="text-lg font-bold text-[#071d41]">0800 000 0000</p>
              <p className="text-xs text-gray-400 mt-1">Seg–Sex 8h–20h · Sáb 8h–14h</p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default Teste;
