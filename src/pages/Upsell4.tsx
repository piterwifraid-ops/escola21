import React from 'react';
import useUtmNavigator from '../hooks/useUtmNavigator';
import { usePixelTracking } from '../hooks/usePixelTracking';

const Upsell4: React.FC = () => {
  usePixelTracking();
  
  const navigate = useUtmNavigator();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Obtenha seu Certificado Oficial e destaque-ses!
          </h1>

          <p className="text-lg text-gray-700 mb-8">
            Complete a capacitação prévia para aumentar suas chances de ganhar mais e conseguir um cargo melhor:
          </p>

          <div className="flex flex-col items-center mb-8">
            <img
              src="https://i.ibb.co/XxH83n80/f7334729-ece3-4e31-8d8e-1849d6b04657.png"
              alt="Certificado de Capacitação"
              className="w-64 mb-6 border-2 border-gray-200 rounded-lg"
            />
            
            <div className="space-y-4 w-full text-left">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Valoriza seu curriculo imediataemente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Demonstra preparo e compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Certificação oficial reconhecida</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Pode ser exigido na apresentação inicial</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-xl">De R$ 159,90</p>
            <p className="text-4xl font-bold mb-6">por apenas R$ 29,90</p>
          </div>
          
<div className="space-y-4">
          <button
            onClick={() => window.location.href = 'https://pay.inscricao-agenteescoladofuturo.online/6YQPgjnj51Agpxz?utm_source=utm_source&utm_campaign=utm_campaign&utm_medium=utm_medium&utm_content=utm_content'}
            className="w-full bg-green-500 text-white text-xl font-bold py-4 rounded-lg hover:bg-green-600 transition-colors mb-4"
          >
            QUERO MEU CERTIFICADO OFICIAL AGORA
          </button>

    <button
              onClick={() => navigate('/Sucesso')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-xl transition-colors text-sm">
              Não quero o combo económico
            </button>

 </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span>🔒</span>
            <span>Pagamento 100% seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upsell4;