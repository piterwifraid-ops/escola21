import React from 'react';

const Obrigado: React.FC = () => {
  const registrationNumber = 'AFT-2025-54879';
  const registrationDate = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="text-6xl text-green-600 leading-none">✔</div>
        <h1 className="text-2xl font-bold text-green-600 mt-3">INSCRIÇÃO REALIZADA COM SUCESSO!</h1>

        <div className="mt-6 border-2 border-[#1351B4] rounded-lg overflow-hidden relative">
          {/* picote vertical */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px opacity-50" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 6px, #ccc 6px, #ccc 12px)', transform: 'translateX(-50%)' }} />

          <div className="bg-[#1351B4] text-white px-5 py-3 text-sm font-semibold uppercase">Comprovante de Inscrição</div>

          <div className="p-6 flex flex-col md:flex-row md:justify-between text-left">
            <div className="md:w-1/2 w-full">
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase">NÚMERO DE INSCRIÇÃO</div>
                <div className="text-lg font-bold text-gray-800"><strong>{registrationNumber}</strong></div>
              </div>
            </div>

            <div className="md:w-1/2 w-full mt-4 md:mt-0">
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase">DATA DE INSCRIÇÃO</div>
                <div className="text-base text-gray-800">{registrationDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">STATUS</div>
                <div className="text-base font-bold text-green-600">RECEBIDA</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 text-center border-t border-dashed border-gray-300 text-sm">Salve seu comprovante oficial.</div>
        </div>

        <div className="mt-6 p-4 border rounded-md bg-blue-50 border-gray-200">
          <h3 className="text-lg font-semibold text-[#0C336F] text-center mb-3">O que acontece agora?</h3>

          <div className="flex items-start gap-4">
            <div className="text-3xl">🔍</div>
            <div>
              <p className="m-0"><strong className="text-[#0C336F]">Análise de Dados:</strong></p>
              <p className="m-0">Sua inscrição será avaliada pela equipe responsável com base nos critérios do programa.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 mt-4">
            <div className="text-3xl">📅</div>
            <div>
              <p className="m-0"><strong className="text-[#0C336F]">Prazos:</strong></p>
              <p className="m-0">As análises ocorrerão até o dia 16 de Janeiro. <strong>Os candidatos selecionados para a próxima etapa serão comunicados por e-mail e/ou telefone.</strong></p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <a href="https://www.gov.br/servidor/pt-br/central-de-conteudo/oportunidades/divulgacao" className="inline-block bg-[#1351B4] hover:bg-[#0C336F] text-white py-3 px-6 rounded-md font-semibold">FINALIZAR</a>
          <p className="text-sm text-gray-500 mt-3">Não perca a data: acompanhe seu e-mail (incluindo a caixa de Spam) e o Portal do Candidato.</p>
        </div>
      </div>
    </div>
  );
};

export default Obrigado;
