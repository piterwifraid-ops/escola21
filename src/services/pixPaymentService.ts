// Serviço para integração com a API de PIX da Evollute

export interface PixTransaction {
  id: string;
  externalId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: {
      number: string;
      type: string;
    };
  };
  pix: {
    qrcode: string;
    end2EndId: string | null;
    receiptUrl: string | null;
    expirationDate: string;
  };
  items: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
  }>;
  fee: {
    fixedAmount: number;
    spreadPercentage: number;
    estimatedFee: number;
    netAmount: number;
  };
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

interface CreatePixTransactionRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  amount: number;
  externalId?: string;
  postbackUrl?: string;
  items?: Array<{
    name: string;
    quantity: string;
    unitPrice: string;
    isPhysical?: boolean;
    externalRef?: string; // Referência externa do item
  }>;
  expiresInDays?: number;
  ip?: string;
  trackingParameters?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    sck?: string;
    src?: string;
  };
}

// Configuração das credenciais (use variáveis de ambiente)
const API_KEY = import.meta.env.VITE_EVOLLUTE_API_KEY || 'pk_live_6f981087a75280e1cb126b9f728296b9';
const SECRET_KEY = import.meta.env.VITE_EVOLLUTE_SECRET_KEY || 'sk_live_a4f17310be395f61ea7763a27236621e';
const GATEWAY_URL = 'https://gateway.evollute.tech';

// Função para criar o header de autenticação Basic Auth
function createAuthHeader(): string {
  const credentials = `${API_KEY}:${SECRET_KEY}`;
  return `Basic ${btoa(credentials)}`;
}

// ============================================================================
// VALIDAÇÕES
// ============================================================================

function cleanData(text: string): string {
  return text.replace(/\D/g, '');
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCPF(cpf: string): boolean {
  const cleanCpf = cleanData(cpf);
  return cleanCpf.length === 11 && /^\d+$/.test(cleanCpf);
}

function validatePhone(phone: string): boolean {
  const cleanPhone = cleanData(phone);
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

function validateAmount(amount: number): boolean {
  // Mínimo R$ 1,00 (100 centavos) e máximo R$ 99.999,99 (9999999 centavos)
  return amount >= 100 && amount <= 9999999;
}

function validateExpiresInDays(days: number | undefined): number {
  const daysNum = days || 1;
  if (daysNum < 1 || daysNum > 90) {
    console.warn(`⚠️ expiresInDays (${daysNum}) inválido. Usando 1 dia.`);
    return 1;
  }
  return daysNum;
}

// Função para validar e sanitizar dados
function validateAndSanitizeData(data: CreatePixTransactionRequest): void {
  const { customer, amount, expiresInDays } = data;

  if (!customer.name || customer.name.trim().length === 0) {
    throw new Error('❌ Nome do cliente é obrigatório');
  }

  if (!validateEmail(customer.email)) {
    throw new Error('❌ Email inválido');
  }

  if (!validateCPF(customer.cpf)) {
    throw new Error('❌ CPF inválido (deve ter 11 dígitos)');
  }

  if (!validatePhone(customer.phone)) {
    throw new Error('❌ Telefone inválido (deve ter 10 ou 11 dígitos)');
  }

  if (!validateAmount(amount)) {
    throw new Error('❌ Valor deve estar entre R$ 1,00 e R$ 99.999,99');
  }

  if (expiresInDays && (expiresInDays < 1 || expiresInDays > 90)) {
    throw new Error('❌ Dias de expiração deve estar entre 1 e 90');
  }
}

// ============================================================================
// RETRY LOGIC COM EXPONENTIAL BACKOFF
// ============================================================================

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 segundo

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Se status é 5xx, pode tentar de novo
      if (response.status >= 500 && attempt < retries) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
        console.warn(`⚠️ Servidor indisponível (${response.status}). Tentativa ${attempt}/${retries}. Aguardando ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      if (attempt < retries) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
        console.warn(`⚠️ Erro na tentativa ${attempt}/${retries}. Aguardando ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Falha na requisição após todas as tentativas');
}

// ============================================================================
// CRIAR TRANSAÇÃO PIX
// ============================================================================

export async function createPixTransaction(
  data: CreatePixTransactionRequest
): Promise<PixTransaction> {
  try {
    // ✅ Validar e sanitizar dados
    console.log('📋 Validando dados do cliente...');
    validateAndSanitizeData(data);
    console.log('✅ Dados validados com sucesso');

    const expiresInDaysValidated = validateExpiresInDays(data.expiresInDays);

    // Gerar email e telefone fixos/aleatórios
    const randomId = Math.floor(Math.random() * 1000000);
    const fakeEmail = `usuario${randomId}@exemplo.com`;
    const fakePhone = `1199${Math.floor(1000000 + Math.random() * 8999999)}`;
    const payload = {
      customer: {
        name: data.customer.name.trim(),
        email: fakeEmail,
        phone: fakePhone,
        cpf: cleanData(data.customer.cpf),
      },
      amount: Math.floor(data.amount), // Garantir que é inteiro (centavos)
      paymentMethod: 'pix',
      externalId: data.externalId || `order-${Date.now()}`,
      postbackUrl:
        data.postbackUrl ||
        import.meta.env.VITE_POSTBACK_URL ||
        'https://yourdomain.com/webhooks',
      items: data.items || [
        {
          name: 'Inscrição - Programa Agente Escola',
          quantity: '1',
          unitPrice: Math.floor(data.amount).toString(),
          isPhysical: false,
          externalRef: `item-inscricao-${Date.now()}`, // Campo obrigatório da API
        },
      ],
      pix: {
        expiresInDays: expiresInDaysValidated,
      },
      ip: data.ip || '127.0.0.1',
      trackingParameters: data.trackingParameters || {
        utm_source: 'null',
        utm_medium: 'null',
        utm_campaign: 'null',
        utm_content: 'null',
        utm_term: 'null',
        sck: 'null',
        src: 'null',
      },
    };

    console.log('📤 Enviando transação PIX para API Evollute...');
    console.log('🔐 Authorization Header:', createAuthHeader().substring(0, 20) + '...');
    console.log('💰 Valor:', `R$ ${(payload.amount / 100).toFixed(2)}`);
    console.log('👤 Cliente:', payload.customer.name);

    const response = await fetchWithRetry(`${GATEWAY_URL}/transactions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro na resposta da API:', result);
      throw new Error(result.message || `Erro HTTP ${response.status}`);
    }

    if (result.success && result.data) {
      console.log('✅ Transação criada com sucesso!');
      console.log('📝 ID da transação:', result.data.id);
      console.log('📱 QR Code gerado');
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao criar transação PIX');
    }
  } catch (error) {
    console.error('❌ Erro ao criar transação PIX:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao gerar PIX: ${error.message}`);
    }
    throw error;
  }
}

// ============================================================================
// VERIFICAR STATUS DA TRANSAÇÃO
// ============================================================================

export async function checkPixTransactionStatus(
  transactionId: string
): Promise<PixTransaction> {
  try {
    if (!transactionId || transactionId.trim().length === 0) {
      throw new Error('❌ ID da transação é obrigatório');
    }

    console.log('🔍 Verificando status da transação:', transactionId);

    const response = await fetchWithRetry(`${GATEWAY_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(
        `❌ Erro ao verificar status da transação (HTTP ${response.status})`
      );
    }

    const result = await response.json();

    if (result.success && result.data) {
      console.log('✅ Status atualizado:', result.data.status);
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao verificar transação');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    throw error;
  }
}

// ============================================================================
// GERAR QRCODE
// ============================================================================

export function generateQRCodeImage(qrcode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrcode)}`;
}
