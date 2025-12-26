import React, { createContext, useContext, useState } from 'react';

interface School {
  id: string;
  name: string;
  type: string;
  distance: number;
}

interface LocationContextType {
  selectedCEP: string;
  nearbySchools: School[];
  setLocationInfo: (cep: string, schools: School[]) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCEP, setSelectedCEP] = useState('');
  const [nearbySchools, setNearbySchools] = useState<School[]>([]);

  const setLocationInfo = (cep: string, schools: School[]) => {
    setSelectedCEP(cep);
    setNearbySchools(schools);
  };

  return (
    <LocationContext.Provider value={{ selectedCEP, nearbySchools, setLocationInfo }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};