import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UTM_TEMPLATE } from './utils/utm';


// Adiciona UTM automaticamente ao acessar o site se não estiver presente
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  const hasUtm = url.searchParams.has('utm_source');
  if (!hasUtm) {
    const sep = url.search ? '&' : '?';
    window.location.replace(url.pathname + url.search + sep + UTM_TEMPLATE + url.hash);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
