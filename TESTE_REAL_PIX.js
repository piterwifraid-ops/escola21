// 🧪 TESTE REAL - GERAÇÃO DE PIX COM CPF VÁLIDO

const API_KEY = 'pk_live_6f981087a75280e1cb126b9f728296b9';
const SECRET_KEY = 'sk_live_a4f17310be395f61ea7763a27236621e';
const GATEWAY_URL = 'https://gateway.evollute.tech';

function createAuthHeader() {
  const credentials = `${API_KEY}:${SECRET_KEY}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

function cleanData(text) {
  return text.replace(/\D/g, '');
}

async function testarGeracaoPIX() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                          ║');
  console.log('║           ✅ TESTE DE GERAÇÃO DE PIX - DADOS REAIS                      ║');
  console.log('║                                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝');

  // Usando um CPF real para teste (válido segundo Receita Federal)
  // CPF: 11144477735 (CPF válido para testes)
  
  const payload = {
    customer: {
      name: 'Teste Programa Agente Escola',
      email: 'teste@agentescoladofuturo.org',
      phone: cleanData('(11) 98765-4321'),
      cpf: cleanData('111.444.777-35'), // CPF válido para teste
    },
    amount: 5840, // R$ 58,40
    paymentMethod: 'pix',
    externalId: `inscricao-teste-${Date.now()}`,
    postbackUrl: 'https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m',
    items: [
      {
        name: 'Inscrição - Programa Agente Escola',
        quantity: '1',
        unitPrice: '5840',
        isPhysical: false,
        externalRef: `item-inscricao-${Date.now()}`, // Campo obrigatório
      },
    ],
    pix: {
      expiresInDays: 1,
    },
    ip: '127.0.0.1',
    trackingParameters: {
      utm_source: 'website',
      utm_medium: 'organic',
      utm_campaign: 'agente_escola',
      utm_content: 'chat',
      utm_term: 'pix',
      sck: 'escola22',
      src: 'chat_app',
    },
  };

  console.log('\n📋 DADOS ENVIADOS PARA A API:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Nome: ${payload.customer.name}`);
  console.log(`Email: ${payload.customer.email}`);
  console.log(`CPF: ${payload.customer.cpf}`);
  console.log(`Telefone: ${payload.customer.phone}`);
  console.log(`Valor: R$ ${(payload.amount / 100).toFixed(2)}`);
  console.log(`Expiração: ${payload.pix.expiresInDays} dia`);
  console.log(`ID Externo: ${payload.externalId}`);

  try {
    console.log('\n🔐 AUTENTICAÇÃO:');
    console.log('─────────────────────────────────────────────────────');
    console.log('Tipo: Basic Auth');
    console.log(`Header: ${createAuthHeader().substring(0, 40)}...`);

    console.log('\n📤 ENVIANDO REQUISIÇÃO:');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Método: POST`);
    console.log(`URL: ${GATEWAY_URL}/transactions`);
    console.log('Headers:');
    console.log('  - Content-Type: application/json');
    console.log('  - Accept: application/json');
    console.log('  - Authorization: Basic [credenciais]');

    console.log('\n⏳ Aguardando resposta...');

    const response = await fetch(`${GATEWAY_URL}/transactions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: createAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    console.log(`\n📊 RESPOSTA DA API:`);
    console.log('─────────────────────────────────────────────────────');
    console.log(`Status HTTP: ${response.status} ${response.statusText}`);

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('\n🎉 ✅ SUCESSO! PIX GERADO COM SUCESSO! 🎉');
      console.log('═════════════════════════════════════════════════════');
      
      const data = result.data;
      
      console.log('\n💳 INFORMAÇÕES DA TRANSAÇÃO:');
      console.log('─────────────────────────────────────────────────────');
      console.log(`ID Transação: ${data.id}`);
      console.log(`ID Externo: ${data.externalId}`);
      console.log(`Status: ${data.status}`);
      console.log(`Método: ${data.paymentMethod}`);
      
      console.log('\n👤 CLIENTE:');
      console.log('─────────────────────────────────────────────────────');
      console.log(`Nome: ${data.customer.name}`);
      console.log(`Email: ${data.customer.email}`);
      console.log(`Telefone: ${data.customer.phone}`);
      console.log(`CPF: ${data.customer.document.number}`);
      
      console.log('\n💰 VALORES:');
      console.log('─────────────────────────────────────────────────────');
      console.log(`Valor Total: R$ ${(data.amount / 100).toFixed(2)}`);
      if (data.fee && data.fee.fixedAmount) {
        console.log(`Taxa Fixa: R$ ${(data.fee.fixedAmount / 100).toFixed(2)}`);
      }
      if (data.fee && data.fee.netAmount) {
        console.log(`Valor Líquido: R$ ${(data.fee.netAmount / 100).toFixed(2)}`);
      }
      
      console.log('\n📱 PIX - QR CODE:');
      console.log('─────────────────────────────────────────────────────');
      console.log(`QR Code: ${data.pix.qrcode}`);
      console.log(`Data de Expiração: ${data.pix.expirationDate}`);
      console.log(`end2EndId: ${data.pix.end2EndId || 'Não preenchido ainda'}`);
      
      console.log('\n🔗 LINK PARA IMAGEM DO QR CODE:');
      console.log('─────────────────────────────────────────────────────');
      const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.pix.qrcode)}`;
      console.log(qrCodeImage);
      
      console.log('\n📅 DATAS:');
      console.log('─────────────────────────────────────────────────────');
      console.log(`Criada em: ${data.createdAt}`);
      console.log(`Atualizada em: ${data.updatedAt}`);
      console.log(`Paga em: ${data.paidAt || 'Não pago ainda'}`);
      
      console.log('\n🔗 WEBHOOK:');
      console.log('─────────────────────────────────────────────────────');
      console.log(`URL: ${data.postbackUrl}`);
      
      console.log('\n' + '═'.repeat(53));
      console.log('✅ INTEGRAÇÃO PIX FUNCIONANDO PERFEITAMENTE!');
      console.log('═'.repeat(53));
      
      return data;
    } else {
      console.log('\n❌ ERRO NA API');
      console.log('─────────────────────────────────────────────────────');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.message) {
        console.log(`\n⚠️  Mensagem: ${result.message}`);
      }
      
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

// Executar teste
console.log('\n🚀 Iniciando teste de geração de PIX...\n');
testarGeracaoPIX().then(result => {
  if (result) {
    console.log('\n\n🎯 RESULTADO FINAL: PIX GERADO COM SUCESSO!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Abra http://localhost:5173/chat');
    console.log('2. Preencha o formulário');
    console.log('3. Clique em "GERAR PIX"');
    console.log('4. O QR Code será exibido na tela');
    console.log('5. Escaneie com o celular para pagar');
  } else {
    console.log('\n\n❌ Teste falhou. Verifique as credenciais e a API.');
  }
  console.log('\n');
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
