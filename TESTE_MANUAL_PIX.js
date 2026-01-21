// 🧪 TESTE MANUAL - GERAÇÃO DE PIX
// Este arquivo simula a chamada da API Evollute
// Node 24 tem fetch built-in, não precisa importar

// ============================================================================
// CREDENCIAIS
// ============================================================================

const API_KEY = 'pk_live_6f981087a75280e1cb126b9f728296b9';
const SECRET_KEY = 'sk_live_a4f17310be395f61ea7763a27236621e';
const GATEWAY_URL = 'https://gateway.evollute.tech';

// ============================================================================
// FUNÇÕES HELPER
// ============================================================================

function createAuthHeader() {
  const credentials = `${API_KEY}:${SECRET_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

function cleanData(text) {
  return text.replace(/\D/g, '');
}

// ============================================================================
// TESTE 1: DADOS VÁLIDOS
// ============================================================================

async function teste1_DadosValidos() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║  TESTE 1: GERAÇÃO DE PIX COM DADOS VÁLIDOS            ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const payload = {
    customer: {
      name: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: cleanData('(11) 98765-4321'),
      cpf: cleanData('123.456.789-01'),
    },
    amount: 5840, // R$ 58,40
    paymentMethod: 'pix',
    externalId: `teste-${Date.now()}`,
    postbackUrl: 'https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m',
    items: [
      {
        name: 'Inscrição - Programa Agente Escola',
        quantity: '1',
        unitPrice: '5840',
        isPhysical: false,
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    ip: '127.0.0.1',
    trackingParameters: {
      utm_source: 'null',
      utm_medium: 'null',
      utm_campaign: 'null',
      utm_content: 'null',
      utm_term: 'null',
      sck: 'null',
      src: 'null',
    },
  };

  console.log('\n📋 DADOS ENVIADOS:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Nome: ${payload.customer.name}`);
  console.log(`Email: ${payload.customer.email}`);
  console.log(`CPF: ${payload.customer.cpf}`);
  console.log(`Telefone: ${payload.customer.phone}`);
  console.log(`Valor: R$ ${(payload.amount / 100).toFixed(2)}`);
  console.log(`URL Postback: ${payload.postbackUrl}`);

  try {
    console.log('\n🔐 Autenticação: Basic Auth');
    console.log(`Authorization: ${createAuthHeader().substring(0, 30)}...`);

    console.log('\n📤 Enviando requisição para API Evollute...');
    console.log(`URL: ${GATEWAY_URL}/transactions`);

    const response = await fetch(`${GATEWAY_URL}/transactions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    console.log(`\n📊 Status da resposta: ${response.status} ${response.statusText}`);

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('\n✅ SUCESSO! PIX GERADO COM SUCESSO!');
      console.log('─────────────────────────────────────────────────────');
      console.log(`ID da Transação: ${result.data.id}`);
      console.log(`Status: ${result.data.status}`);
      console.log(`Valor: R$ ${(result.data.amount / 100).toFixed(2)}`);
      console.log(`Valor da Taxa: R$ ${(result.data.fee.fixedAmount / 100).toFixed(2)}`);
      console.log(`Valor Líquido: R$ ${(result.data.fee.netAmount / 100).toFixed(2)}`);
      console.log(`Data de Expiração: ${result.data.pix.expirationDate}`);
      console.log(`\n📱 QR CODE PIX:`);
      console.log(`${result.data.pix.qrcode}`);
      console.log(`\n🔗 Para gerar imagem do QR Code:`);
      console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.data.pix.qrcode)}`);
      
      return result.data;
    } else {
      console.log('\n❌ ERRO NA RESPOSTA');
      console.log('─────────────────────────────────────────────────────');
      console.log(JSON.stringify(result, null, 2));
      return null;
    }
  } catch (error) {
    console.log('\n❌ ERRO AO CHAMAR API');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Erro: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
    return null;
  }
}

// ============================================================================
// TESTE 2: VERIFICAR STATUS
// ============================================================================

async function teste2_VerificarStatus(transactionId) {
  if (!transactionId) {
    console.log('⚠️  Pulando teste 2 (sem ID de transação)');
    return;
  }

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║  TESTE 2: VERIFICAR STATUS DA TRANSAÇÃO               ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    console.log(`\n🔍 Verificando status da transação: ${transactionId}`);

    const response = await fetch(`${GATEWAY_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('\n✅ STATUS OBTIDO COM SUCESSO!');
      console.log('─────────────────────────────────────────────────────');
      console.log(`ID: ${result.data.id}`);
      console.log(`Status: ${result.data.status}`);
      console.log(`Valor: R$ ${(result.data.amount / 100).toFixed(2)}`);
      console.log(`Criada em: ${result.data.createdAt}`);
      console.log(`Atualizada em: ${result.data.updatedAt}`);
      console.log(`Paga em: ${result.data.paidAt || 'Ainda não paga'}`);
    } else {
      console.log('\n❌ ERRO AO VERIFICAR STATUS');
      console.log('─────────────────────────────────────────────────────');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('\n❌ ERRO AO CHAMAR API');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Erro: ${error.message}`);
  }
}

// ============================================================================
// TESTE 3: DADOS INVÁLIDOS (EMAIL)
// ============================================================================

async function teste3_EmailInvalido() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║  TESTE 3: VALIDAÇÃO - EMAIL INVÁLIDO                  ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const payload = {
    customer: {
      name: 'João Silva',
      email: 'joao.invalido', // ❌ SEM @
      phone: '11987654321',
      cpf: '12345678901',
    },
    amount: 5840,
    paymentMethod: 'pix',
    externalId: `teste-${Date.now()}`,
    items: [
      {
        name: 'Inscrição',
        quantity: '1',
        unitPrice: '5840',
        isPhysical: false,
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    ip: '127.0.0.1',
  };

  console.log('\n📋 EMAIL ENVIADO: joao.invalido (SEM @)');

  try {
    const response = await fetch(`${GATEWAY_URL}/transactions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log(`\n📊 Status: ${response.status}`);

    if (!response.ok || !result.success) {
      console.log('\n✅ VALIDAÇÃO FUNCIONOU!');
      console.log('─────────────────────────────────────────────────────');
      console.log('API rejeitou email inválido (conforme esperado)');
      console.log(`Mensagem de erro: ${result.message || JSON.stringify(result)}`);
    } else {
      console.log('\n⚠️  API aceitou email inválido (verificar com Evollute)');
    }
  } catch (error) {
    console.log('\n❌ ERRO AO CHAMAR API');
    console.log(`Erro: ${error.message}`);
  }
}

// ============================================================================
// TESTE 4: DADOS INVÁLIDOS (CPF)
// ============================================================================

async function teste4_CPFInvalido() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║  TESTE 4: VALIDAÇÃO - CPF INVÁLIDO                    ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const payload = {
    customer: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11987654321',
      cpf: '123456789', // ❌ APENAS 9 DÍGITOS
    },
    amount: 5840,
    paymentMethod: 'pix',
    externalId: `teste-${Date.now()}`,
    items: [
      {
        name: 'Inscrição',
        quantity: '1',
        unitPrice: '5840',
        isPhysical: false,
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    ip: '127.0.0.1',
  };

  console.log('\n📋 CPF ENVIADO: 123456789 (APENAS 9 DÍGITOS)');

  try {
    const response = await fetch(`${GATEWAY_URL}/transactions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log(`\n📊 Status: ${response.status}`);

    if (!response.ok || !result.success) {
      console.log('\n✅ VALIDAÇÃO FUNCIONOU!');
      console.log('─────────────────────────────────────────────────────');
      console.log('API rejeitou CPF inválido (conforme esperado)');
      console.log(`Mensagem de erro: ${result.message || JSON.stringify(result)}`);
    } else {
      console.log('\n⚠️  API aceitou CPF inválido (verificar com Evollute)');
    }
  } catch (error) {
    console.log('\n❌ ERRO AO CHAMAR API');
    console.log(`Erro: ${error.message}`);
  }
}

// ============================================================================
// EXECUTAR TESTES
// ============================================================================

async function executarTestes() {
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                          ║');
  console.log('║             🧪 TESTE MANUAL - INTEGRAÇÃO PIX EVOLLUTE 🧪                ║');
  console.log('║                                                                          ║');
  console.log('║                         Iniciando testes...                             ║');
  console.log('║                                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');

  // Teste 1: Dados válidos
  const transaction = await teste1_DadosValidos();

  // Teste 2: Verificar status
  if (transaction) {
    await new Promise(r => setTimeout(r, 2000)); // Aguarda 2 segundos
    await teste2_VerificarStatus(transaction.id);
  }

  // Teste 3: Email inválido
  await new Promise(r => setTimeout(r, 1000));
  await teste3_EmailInvalido();

  // Teste 4: CPF inválido
  await new Promise(r => setTimeout(r, 1000));
  await teste4_CPFInvalido();

  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                          ║');
  console.log('║                    ✅ TESTES CONCLUÍDOS!                                ║');
  console.log('║                                                                          ║');
  console.log('║  Resultado: Verifique acima para ver o status de cada teste             ║');
  console.log('║                                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// Executar
executarTestes().catch(console.error);
