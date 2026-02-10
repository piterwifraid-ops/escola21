import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PreSSellProps {
  title?: string;
  description?: string;
  descriptionHighlights?: string[];
  buttonText?: string;
  buttonAction?: () => void;
  logoSrc?: string;
  logoAlt?: string;
  processLabel?: string;
  showSecurityBadge?: boolean;
  redirectTo?: string;
}

const PreSSel: React.FC<PreSSellProps> = ({
  title = 'Novas vagas abertas para trabalho nas escolas públicas',
  description = 'Inscrições simplificadas disponíveis para sua região. Vagas com carteira assinada e capacitação inclusa.',
  descriptionHighlights = ['sua região', 'carteira assinada'],
  buttonText = 'Ver vagas disponíveis',
  buttonAction,
  logoSrc = 'https://i.ibb.co/wFLKpSHD/Design-sem-nome.png',
  logoAlt = 'Escolas Conectadas',
  processLabel = 'Processo Seletivo Simplificado',
  showSecurityBadge = true,
  redirectTo = '/main',
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction();
    } else if (redirectTo) {
      navigate(redirectTo);
    }
  };

  // Função para destacar palavras no texto
  const highlightText = (text: string, highlights: string[]) => {
    if (highlights.length === 0) return text;

    let result = text;
    highlights.forEach((highlight) => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      result = result.replace(
        regex,
        `<span class="bg-yellow-100 px-1 font-medium">$1</span>`
      );
    });

    return result;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes shadowPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(38, 135, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 15px 8px rgba(38, 135, 68, 0.05);
          }
        }
        .button-pulse {
          animation: shadowPulse 2s infinite;
        }
      `}</style>
      {/* Header */}
      <div className="bg-[#1351B4] py-2">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-white text-xs text-center font-medium">
            Comunicado Oficial • Governo Federal
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center">
          {/* Logo and Header */}
          <div className="mb-6">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-10 mx-auto object-contain mb-4"
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgb(113, 113, 113)',
              }}
            >
              {processLabel}
            </span>

            {/* Title */}
            <h1
              className="mt-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                lineHeight: 1.3,
                color: 'rgb(12, 50, 111)',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p className="text-[#555] text-sm mt-3 leading-relaxed">
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightText(description, descriptionHighlights),
                }}
              />
            </p>
          </div>

          {/* Button */}
          <div className="w-full m-auto text-center">
            <button
              onClick={handleButtonClick}
              className="button-pulse bg-[#268744] m-auto text-white p-4 font-bold rounded-[51px] w-[250px] hover:bg-[#1e6b36] transition-colors disabled:opacity-60"
              style={{
                border: '12px solid rgb(237, 237, 237)',
              }}
            >
              {buttonText}
            </button>
          </div>

          {/* Security Badge */}
          {showSecurityBadge && (
            <div className="mt-6 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#168821]"></div>
                <span className="text-xs text-[#555] font-medium">
                  Conexão segura estabelecida
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                Seus dados estão protegidos
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <img
            src="https://i.ibb.co/1f1PVjp6/logo-mec-governo-DLOfvp-Lc.png"
            alt="Ministério da Educação - Governo do Brasil"
            className="h-12 mx-auto object-contain"
          />
        </div>
      </footer>
    </div>
  );
};

export default PreSSel;
