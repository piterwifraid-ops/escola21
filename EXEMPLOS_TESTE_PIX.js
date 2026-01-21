// 🧪 EXEMPLOS DE TESTE - API PIX EVOLLUTE

// ============================================================================
// EXEMPLO 1: Teste com Dados Válidos (Sucesso)
// ============================================================================

/**
 * Este é o fluxo que acontece quando um usuário preenche o formulário
 * corretamente e clica em "GERAR PIX"
 */

// Dados do usuário preenchidos no formulário:
const userData = {
  nome: 'Maria Silva Santos',
  email: 'maria.silva@email.com',
  telefone: '11987654321', // Pode ser com ou sem formatação
  cpf: '12345678901', // Pode ser com ou sem formatação (111.222.333-44)
  cep: '01310100',
  escola: 'Escola Municipal ABC'
};

// O Chat.tsx extrai esses dados e chama:
// const transaction = await createPixTransaction({
//   customer: {
//     name: userData.nome,
//     email: userData.email,
//     phone: userData.telefone,
//     cpf: userData.cpf,
//   },
//   amount: 5840, // R$ 58,40 em centavos
//   externalId: `inscricao-${userData.cpf}-${Date.now()}`,
//   expiresInDays: 1,
// });

/**
 * RESPOSTA ESPERADA DA API EVOLLUTE:
 */
const pixResponse = {
  success: true,
  data: {
    id: '62',
    externalId: 'inscricao-12345678901-1705742400000',
    amount: 5840,
    refundedAmount: 0,
    companyId: 2,
    paymentMethod: 'pix',
    status: 'pending',
    postbackUrl: 'https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m',
    createdAt: '2026-01-20T15:30:46.624Z',
    updatedAt: '2026-01-20T15:30:46.624Z',
    paidAt: null,
    customer: {
      id: 62,
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '11987654321',
      document: {
        number: '12345678901',
        type: 'cpf'
      }
    },
    items: [
      {
        title: 'Inscrição - Programa Agente Escola',
        unitPrice: 5840,
        quantity: 1
      }
    ],
    fee: {
      fixedAmount: 140,
      spreadPercentage: 0,
      estimatedFee: 140,
      netAmount: 5700
    },
    pix: {
      qrcode: '00020126490014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx5204000053039865406100.005802BR5919PROGRAMA AGENTE62250521mpqrinter124665835180303B38',
      end2EndId: null,
      receiptUrl: null,
      expirationDate: '2026-01-21'
    }
  }
};

/**
 * CONSOLE ESPERADO:
 */
console.log('📋 Validando dados do cliente...');
console.log('✅ Dados validados com sucesso');
console.log('📤 Enviando transação PIX para API Evollute...');
console.log('🔐 Authorization Header: Basic ...');
console.log('💰 Valor: R$ 58,40');
console.log('👤 Cliente: Maria Silva Santos');
console.log('✅ Transação criada com sucesso!');
console.log('📝 ID da transação: 62');
console.log('📱 QR Code gerado');

// ============================================================================
// EXEMPLO 2: Email Inválido
// ============================================================================

const userData_EmailInvalido = {
  nome: 'João Silva',
  email: 'joao.invalido', // ❌ INVÁLIDO: Sem @
  telefone: '11987654321',
  cpf: '12345678901'
};

/**
 * ERRO ESPERADO:
 */
// ❌ Erro: "Falha ao gerar PIX: ❌ Email inválido"

/**
 * CONSOLE:
 */
console.log('📋 Validando dados do cliente...');
console.error('❌ Email inválido');

// ============================================================================
// EXEMPLO 3: CPF Inválido
// ============================================================================

const userData_CPFInvalido = {
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: '11987654321',
  cpf: '123456789' // ❌ INVÁLIDO: Só 9 dígitos (precisa de 11)
};

/**
 * ERRO ESPERADO:
 */
// ❌ Erro: "Falha ao gerar PIX: ❌ CPF inválido (deve ter 11 dígitos)"

/**
 * CONSOLE:
 */
console.log('📋 Validando dados do cliente...');
console.error('❌ CPF inválido (deve ter 11 dígitos)');

// ============================================================================
// EXEMPLO 4: Telefone Inválido
// ============================================================================

const userData_TelefoneInvalido = {
  nome: 'Carlos Santos',
  email: 'carlos@email.com',
  telefone: '119', // ❌ INVÁLIDO: Só 3 dígitos (precisa de 10-11)
  cpf: '12345678901'
};

/**
 * ERRO ESPERADO:
 */
// ❌ Erro: "Falha ao gerar PIX: ❌ Telefone inválido (deve ter 10 ou 11 dígitos)"

/**
 * CONSOLE:
 */
console.log('📋 Validando dados do cliente...');
console.error('❌ Telefone inválido (deve ter 10 ou 11 dígitos)');

// ============================================================================
// EXEMPLO 5: Valor Fora do Range
// ============================================================================

const requestComValorInvalido = {
  customer: {
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '11987654321',
    cpf: '12345678901'
  },
  amount: 50 // ❌ INVÁLIDO: Menor que R$ 1,00 (100 centavos)
};

/**
 * ERRO ESPERADO:
 */
// ❌ Erro: "Falha ao gerar PIX: ❌ Valor deve estar entre R$ 1,00 e R$ 99.999,99"

/**
 * CONSOLE:
 */
console.log('📋 Validando dados do cliente...');
console.error('❌ Valor deve estar entre R$ 1,00 e R$ 99.999,99');

// ============================================================================
// EXEMPLO 6: Retry Logic em Ação
// ============================================================================

/**
 * Cenário: API Evollute está indisponível (HTTP 500)
 * O serviço tentará 3 vezes automaticamente
 */

/**
 * CONSOLE ESPERADO:
 */
console.log('📋 Validando dados do cliente...');
console.log('✅ Dados validados com sucesso');
console.log('📤 Enviando transação PIX para API Evollute...');

// Tentativa 1: Erro 500
console.warn('⚠️ Servidor indisponível (500). Tentativa 1/3. Aguardando 1000ms...');

// Tentativa 2: Erro 500
console.warn('⚠️ Servidor indisponível (500). Tentativa 2/3. Aguardando 2000ms...');

// Tentativa 3: Erro 500
console.warn('⚠️ Servidor indisponível (500). Tentativa 3/3. Aguardando 4000ms...');

// Falha definitiva
console.error('❌ Erro ao criar transação PIX: Erro HTTP 500');

// ============================================================================
// EXEMPLO 7: Webhook Postback
// ============================================================================

/**
 * Quando o usuário paga o PIX, a API Evollute envia um POST para:
 * https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m
 */

/**
 * PAYLOAD RECEBIDO (quando o pagamento é confirmado):
 */
const webhookPayload_Paid = {
  success: true,
  data: {
    id: '62',
    externalId: 'inscricao-12345678901-1705742400000',
    amount: 5840,
    refundedAmount: 0,
    companyId: 2,
    paymentMethod: 'pix',
    status: 'confirmed', // ← Mudou de "pending" para "confirmed"
    postbackUrl: 'https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m',
    createdAt: '2026-01-20T15:30:46.624Z',
    updatedAt: '2026-01-20T15:35:12.624Z',
    paidAt: '2026-01-20T15:35:10.000Z', // ← Agora tem data de pagamento
    customer: {
      id: 62,
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '11987654321',
      document: {
        number: '12345678901',
        type: 'cpf'
      }
    },
    items: [
      {
        title: 'Inscrição - Programa Agente Escola',
        unitPrice: 5840,
        quantity: 1
      }
    ],
    fee: {
      fixedAmount: 140,
      spreadPercentage: 0,
      estimatedFee: 140,
      netAmount: 5700
    },
    pix: {
      qrcode: '00020126490014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx5204000053039865406100.005802BR5919PROGRAMA AGENTE62250521mpqrinter124665835180303B38',
      end2EndId: 'E26012620262XXXXXXXXXXXXX123', // ← end2EndId foi preenchido
      receiptUrl: null,
      expirationDate: '2026-01-21'
    }
  }
};

// ============================================================================
// EXEMPLO 8: Dados com Formatação (Aceita sim!)
// ============================================================================

/**
 * O serviço aceita dados com formatação e remove automaticamente
 */

const userData_Formatado = {
  nome: 'João da Silva',
  email: 'JOAO@EMAIL.COM', // ✅ Será convertido para lowercase
  telefone: '(11) 98765-4321', // ✅ Será removido parênteses e hífen → 11987654321
  cpf: '123.456.789-01' // ✅ Será removido pontos e hífen → 12345678901
};

/**
 * APÓS SANITIZAÇÃO:
 */
const userData_Sanitizado = {
  nome: 'João da Silva',
  email: 'joao@email.com',
  telefone: '11987654321',
  cpf: '12345678901'
};

// ============================================================================
// EXEMPLO 9: Verificar Status de uma Transação
// ============================================================================

/**
 * Depois de criar uma transação, você pode verificar o status:
 */

// const status = await checkPixTransactionStatus('62');

/**
 * RESPOSTA ESPERADA (pagamento confirmado):
 */
const statusResponse_Confirmed = {
  success: true,
  data: {
    id: '62',
    status: 'confirmed',
    paidAt: '2026-01-20T15:35:10.000Z',
    pix: {
      end2EndId: 'E26012620262XXXXXXXXXXXXX123'
    }
  }
};

/**
 * CONSOLE:
 */
console.log('🔍 Verificando status da transação: 62');
console.log('✅ Status atualizado: confirmed');

// ============================================================================
// EXEMPLO 10: Fluxo Completo no Chat
// ============================================================================

/**
 * Este é o fluxo que acontece quando o usuário interage com o Chat:
 */

async function testeFluxoCompletoChat() {
  try {
    // 1. Usuário preenche formulário
    const userData = {
      nome: 'Maria Silva',
      email: 'maria@email.com',
      telefone: '11987654321',
      cpf: '12345678901'
    };

    // 2. Usuário clica "GERAR PIX"
    console.log('⏳ Usuário clicou em "GERAR PIX"');

    // 3. Chat carrega dados do localStorage
    console.log('📥 Carregando dados do usuário...');

    // 4. Chat valida dados localmente (TODO: você pode adicionar isso)
    console.log('✅ Dados carregados');

    // 5. Chat chama createPixTransaction()
    console.log('📋 Validando dados do cliente...');
    console.log('✅ Dados validados com sucesso');
    console.log('📤 Enviando transação PIX para API Evollute...');

    // 6. Serviço envia para API
    // ... (retry logic em ação se necessário)

    // 7. API retorna QR Code
    console.log('✅ Transação criada com sucesso!');
    console.log('📝 ID da transação: 62');
    console.log('📱 QR Code gerado');

    // 8. Chat exibe QR Code na tela
    console.log('👁️  QR Code exibido na tela');

    // 9. Usuário escaneia PIX
    console.log('👤 Usuário escaneia o QR Code no celular');

    // 10. Usuário paga
    console.log('💳 Usuário efetua o pagamento');

    // 11. Webhook notifica
    console.log('📬 Webhook recebido em https://www.agentescoladofuturo.org/...');
    console.log('✅ Status atualizado: confirmed');

    // 12. Usuário é redirecionado
    console.log('🎉 Inscrição confirmada!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ============================================================================
// COMO EXECUTAR ESTE TESTE
// ============================================================================

/**
 * 1. Abra o navegador em http://localhost:5173/chat
 * 2. Abra o Console: F12 → Console
 * 3. Cole o código de teste que deseja executar
 * 4. Veja os logs aparecendo em tempo real
 *
 * Exemplos de testes:
 *   - Teste com dados válidos
 *   - Teste com email inválido
 *   - Teste com CPF inválido
 *   - Teste com dados formatados
 *   - Teste do fluxo completo
 */

// ============================================================================
// VALORES VÁLIDOS PARA TESTES
// ============================================================================

/**
 * EMAIL
 * ✅ Válido: joao@email.com, maria.silva@empresa.com.br
 * ❌ Inválido: joao.email.com, @email.com, joao@
 *
 * CPF
 * ✅ Válido: 12345678901, 111.222.333-44, 111 222 333 44
 * ❌ Inválido: 123456789, 12345678901234 (muito grande)
 *
 * TELEFONE
 * ✅ Válido: 11987654321, (11) 98765-4321, 11 98765-4321
 * ❌ Inválido: 119, 119876543210 (muito grande)
 *
 * VALOR
 * ✅ Válido: 100 (R$ 1,00) até 9999999 (R$ 99.999,99)
 * ❌ Inválido: 50 (menor que R$ 1,00), 10000000 (maior que R$ 99.999,99)
 *
 * DIAS EXPIRAÇÃO
 * ✅ Válido: 1 até 90
 * ❌ Inválido: 0, 100, -1
 */

// ============================================================================

// Desenvolvido em 20 de janeiro de 2026
// Status: 🟢 PRONTO PARA TESTES
