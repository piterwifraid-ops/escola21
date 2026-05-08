import React from 'react';
import { Accessibility } from 'lucide-react';
import { usePixelTracking } from '../hooks/usePixelTracking';

const AccessibilityButton: React.FC = () => {
  usePixelTracking();

  return (
    <button 
      className="fixed bottom-5 right-5 bg-[#1351B4] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#1351B4]/90 transition-colors"
      aria-label="Acessibilidade"
    >
      <Accessibility size={24} />
    </button>
  );
};

export default AccessibilityButton;