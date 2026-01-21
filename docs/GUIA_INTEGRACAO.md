# 🎯 Integração PIX - Guia Completo

## ✅ Status da Integração

- ✅ API Evollute configurada e testada
- ✅ Credenciais validadas
- ✅ URL de postback configurada
- ✅ Serviço de pagamento com retry logic
- ✅ Hook customizado para React
- ✅ Componente Chat atualizado
- ✅ Build sem erros

---

## 📋 Configuração de Credenciais

Arquivo: `.env.local`

```bash
# API Keys da Evollute (já configuradas)
VITE_EVOLLUTE_API_KEY=pk_live_6f981087a75280e1cb126b9f728296b9
VITE_EVOLLUTE_SECRET_KEY=sk_live_a4f17310be395f61ea7763a27236621e

# URL para postback (já configurada)
VITE_POSTBACK_URL=https://www.agentescoladofuturo.org/fmatwcswzobzzdsgrkgv1p9kz049g57m
```

---

## 🔧 Estrutura de Arquivos

```
src/
├── services/
│   └── pixPaymentService.ts          ← Serviço principal
├── hooks/
│   └── usePixPayment.ts              ← Hook React
├── pages/
│   └── Chat.tsx                      ← Componente usando PIX
└── components/
    ├── PixQRCodeDisplay.tsx          ← Exibir QR Code
    └── ... outros

docs/
├── WEBHOOK_HANDLER.ts                ← Exemplo de webhook
└── GUIA_INTEGRACAO.md                ← Este arquivo

webhook-server.ts                     ← Servidor webhook (exemplo)
test-pix-api.js                      ← Script de teste
```

---

## 🚀 Fluxo de Pagamento

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuário acessa /chat                                 │
│    └─ Preenche dados de inscrição                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Clica em "GERAR PIX - FINALIZAR INSCRIÇÃO"           │
│    └─ Chat carrega dados do localStorage                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Hook usePixPayment.generatePix() é chamado           │
│    └─ Valida dados (nome, email, phone, cpf)            │
│    └─ Chama createPixTransaction()                      │
│    └─ Implementa retry logic com exponenciação          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. API Evollute retorna QR Code                         │
│    └─ Status: 201 Created                               │
│    └─ QR Code + Código PIX cópiavel                     │
│    └─ Data de expiração                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Usuário escaneia QR Code com seu banco               │
│    └─ Ou copia o código PIX manualmente                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Usuário confirma pagamento no app bancário           │
│    └─ Banco processa transação                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Banco envia confirmação para Evollute                │
│    └─ Status muda de "pending" para "paid"              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Evollute envia webhook para seu servidor             │
│    POST /fmatwcswzobzzdsgrkgv1p9kz049g57m               │
│    └─ Com dados de confirmação                          │
│    └─ Com status "paid"                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 9. Seu backend processa webhook                         │
│    └─ Atualiza banco de dados                           │
│    └─ Libera acesso do usuário                          │
│    └─ Envia email de confirmação                        │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Como Usar

### 1️⃣ No Componente React (Chat.tsx)

```tsx
import { usePixPayment } from '../hooks/usePixPayment';

export default function Chat() {
  const { transaction, generatePix, loading, error } = usePixPayment();

  const handleGeneratePix = async () => {
    try {
      const pix = await generatePix(
        'João Silva',
        'joao@email.com',
        '11999999999',
        '12345678901',
        5840 // R$ 58,40
      );
      
      console.log('PIX gerado:', pix.pix.qrcode);
      // Exibir QR Code na tela
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGeneratePix} disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar PIX'}
      </button>
      
      {transaction && (
        <div>
          <p>Escaneie o QR Code:</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transaction.pix.qrcode)}`} />
          <p>Ou copie este código PIX:</p>
          <code>{transaction.pix.qrcode}</code>
        </div>
      )}
    </div>
  );
}
```

### 2️⃣ Serviço Direto

```tsx
import { createPixTransaction, checkPixTransactionStatus } from '../services/pixPaymentService';

// Criar transação
const transaction = await createPixTransaction({
  customer: {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    cpf: '12345678901',
  },
  amount: 5840, // R$ 58,40 em centavos
  expiresInDays: 1,
});

// Verificar status
const status = await checkPixTransactionStatus(transaction.id);
console.log(status.status); // 'pending', 'paid', etc
```

---

## 🔄 Recursos Implementados

### ✅ Retry Logic
- Tenta até 3 vezes automaticamente
- Espera exponencial entre tentativas (1s, 2s, 4s)
- Ideal para erros de rede temporários

### ✅ Validações
- Nome com mínimo 3 caracteres
- Email válido (contém @)
- Telefone com mínimo 10 dígitos
- CPF com 11 dígitos
- Valor positivo

### ✅ Tratamento de Erros
- Mensagens de erro claras em português
- Logs detalhados para debug
- Não lança exceção não tratada

### ✅ Limite de Expiração
- Máximo 90 dias (limite da API)
- Defaut de 1 dia

---

## 📡 Webhook - Receber Confirmações

### Estrutura da Payload

```json
{
  "success": true,
  "data": {
    "id": "200014",
    "externalId": "inscricao-12345678901-1768959640470",
    "amount": 5840,
    "status": "paid",
    "paymentMethod": "pix",
    "customer": {
      "id": 62,
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "document": {
        "number": "12345678901",
        "type": "cpf"
      }
    },
    "pix": {
      "qrcode": "00020101021226850014...",
      "end2EndId": null,
      "receiptUrl": null,
      "expirationDate": "2026-01-23"
    },
    "paidAt": "2026-01-20T22:45:30.000Z",
    "createdAt": "2026-01-20T22:35:00.000Z",
    "updatedAt": "2026-01-20T22:45:30.000Z"
  }
}
```

### Implementação Backend (Express)

```typescript
app.post('/fmatwcswzobzzdsgrkgv1p9kz049g57m', async (req, res) => {
  const { data } = req.body;

  // Verificar status do pagamento
  if (data.status === 'paid' || data.status === 'confirmed') {
    // ✅ Pagamento confirmado!
    
    // 1. Atualizar banco de dados
    await User.updateOne(
      { cpf: data.customer.document.number },
      { inscriptionPaid: true, transactionId: data.id }
    );

    // 2. Enviar email
    await sendEmail({
      to: data.customer.email,
      subject: 'Inscrição Confirmada!',
      body: `Seu pagamento de R$ ${(data.amount / 100).toFixed(2)} foi recebido.`
    });

    // 3. Liberar acesso
    await grantAccess(data.customer.email);
  }

  // IMPORTANTE: Retornar 200
  res.status(200).json({ success: true });
});
```

---

## 🧪 Testar a Integração

### Teste via Terminal

```bash
cd /Users/visiondigitall/Downloads/escola22-main\ 4
node test-pix-api.js
```

Resultado esperado:
```
✅ SUCESSO! Transação criada com sucesso!
📱 Detalhes da Transação:
   ID: 200014
   Valor: R$ 58.40
   Status: pending
```

### Teste via Chat

1. Abra http://localhost:5173/chat
2. Preencha os dados
3. Clique em "GERAR PIX - FINALIZAR INSCRIÇÃO"
4. Veja o QR Code aparecer

---

## 🐛 Troubleshooting

### Erro: "CPF deve ser válido"
- Certifique-se de passar um CPF válido com 11 dígitos

### Erro: "Dias para expiração deve ser no máximo 90"
- Não ultrapasse 90 dias de expiração

### Erro: "Referência externa do item obrigatória"
- Adicione `externalRef` aos items

### Erro: "Dados do usuário incompletos"
- Verifique se localStorage tem: nome, email, telefone, cpf

### Webhook não é recebido
- Certifique-se que URL é acessível externamente (HTTPS)
- Verifique firewall/CORS
- Teste com webhook.site para debug

---

## 📊 Monitoramento

### Verificar Status de Transação

```typescript
const { checkPaymentStatus } = usePixPayment();
const transaction = await checkPaymentStatus('200014');
console.log(transaction.status); // 'pending', 'paid', etc
```

### Verificar se PIX foi Pago

```typescript
import { isPixPaid } from '../services/pixPaymentService';

const paid = await isPixPaid('200014');
if (paid) {
  console.log('PIX foi pago!');
}
```

---

## 📚 Documentação Oficial

- **Evollute API**: https://gateway.evollute.tech
- **Portal**: https://payment.evolute.tech/settings/api-keys

---

## 🎓 Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `.env.local` | ✅ URL postback configurada |
| `pixPaymentService.ts` | ✅ Retry logic + validações |
| `usePixPayment.ts` | ✅ Hook React novo |
| `Chat.tsx` | ✅ Usando novo hook |
| `test-pix-api.js` | ✅ Script de teste |
| `webhook-server.ts` | ✅ Exemplo backend |

---

## ✨ Próximos Passos

1. **Implementar Backend**
   - Criar endpoint para receber webhooks
   - Armazenar transações no banco de dados
   - Liberar acesso após pagamento

2. **Email de Confirmação**
   - Enviar confirmação após pagamento
   - Template personalizado

3. **Dashboard Admin**
   - Visualizar transações
   - Gerenciar reembolsos

4. **Testes com Casos Reais**
   - Testar com PIX verdadeiro
   - Validar todo o fluxo

---

**Integração PIX completa! 🎉**
