import React from 'react';
import useUtmNavigator from '../hooks/useUtmNavigator';
import { FileText, Backpack, Book, Headphones } from 'lucide-react';
import { usePixelTracking } from '../hooks/usePixelTracking';

const Upsell3: React.FC = () => {
  usePixelTracking();
  
  const navigate = useUtmNavigator();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Combo Econômico
            </h1>
            
            <div className="text-3xl font-bold text-[#1351B4] mb-8">
              INSCRIÇÃO + KIT EPI + CURSO + SUPORTE
            </div>

            <p className="text-xl text-gray-600">
              Garanta a inscrição, materiais de segurança, apostila profissional e suporte contínuo.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Inscrição</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Backpack className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Kit EPI</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Book className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Curso</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Suporte</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-4">O que você recebe:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-green-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Inscrição garantida no programa</span>
              </li>
              <li className="flex items-center gap-2 text-green-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Kit completo de equipamentos de proteção</span>
              </li>
              <li className="flex items-center gap-2 text-green-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Curso preparatório com certificado</span>
              </li>
              <li className="flex items-center gap-2 text-green-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Suporte prioritário durante todo o processo</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = 'https://pay.inscricao-agenteescoladofuturo.online/RmA83EaXV213PVp?utm_source=utm_source&utm_campaign=utm_campaign&utm_medium=utm_medium&utm_content=utm_content'}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              SELECIONAR COMBO COMPLETO
            </button>

            <button
              onClick={() => navigate('/upsell4')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-xl transition-colors text-sm"
            >
              Não quero o combo económico
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
            <span>🔒</span>
            <span>Pagamento 100% seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upsell3;