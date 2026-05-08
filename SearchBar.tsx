import React from 'react';

const GovLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img
        src="https://barra.sistema.gov.br/v1/assets/govbr.webp"
        alt="Logo gov.br"
        className="h-[34px] w-auto"
      />
    </div>
  );
};

export default GovLogo;
