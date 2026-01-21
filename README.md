# Escola PIX

Sistema de pagamento com PIX integrado a rastreamento de vendas via UTMIFY.

## 📋 Descrição

Projeto de integração completa de PIX com rastreamento de origem de vendas através de UTM parameters, utilizando a API UTMIFY para análise de campanha em tempo real.

## 🎯 Funcionalidades

- ✅ Geração de QR Code PIX via Evollute
- ✅ Rastreamento de origem (UTM params)
- ✅ Webhook para confirmação de pagamento
- ✅ Integração com UTMIFY para análise de vendas
- ✅ Banco de dados com Prisma ORM
- ✅ Interface React com TypeScript
- ✅ Redirecionamento automático após pagamento

## 🚀 Tech Stack

### Frontend
- React 18.3.1
- TypeScript 5.2.2
- Vite 5.0.12
- React Router DOM 6.22.3
- Tailwind CSS 3.4.1

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL

### APIs Externas
- Evollute PIX Gateway
- UTMIFY (Server-side tracking)

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   ├── pages/               # Páginas da aplicação
│   ├── services/            # Serviços (PIX, UTMIFY)
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context
│   └── utils/               # Funções utilitárias
├── prisma/
│   └── schema.prisma        # Schema do banco de dados
├── docs/                    # Documentação
└── public/                  # Arquivos estáticos
```

## 🔧 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL 12+

### Setup

1. Clone o repositório
```bash
git clone https://github.com/piterwifraid-ops/escola-pix.git
cd escola-pix
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

4. Execute as migrações do Prisma
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 📝 Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Evollute PIX Gateway
EVOLLUTE_API_KEY=sua_chave_api

# UTMIFY Tracking
UTMIFY_TOKEN=seu_token_utmify

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/escola_pix

# Servidor
WEBHOOK_URL=https://seu-dominio.com/webhook/seu-webhook-id

# Ambiente
NODE_ENV=development
```

## 🔄 Fluxo de Pagamento PIX

### Momento 1: PIX Gerado
1. Usuário completa checkout
2. Sistema envia request ao Evollute
3. Evollute gera PIX com QR Code
4. Order é salva no BD com status `PENDING`
5. UTM params são registrados em UTMIFY (status: `pending`)
6. QR Code é exibido para cliente

### Momento 2: PIX Pago
1. Cliente confirma pagamento
2. Evollute detecta confirmação
3. Webhook é enviado para seu servidor
4. Order é atualizada para status `PAID`
5. UTMIFY é notificado (status: `paid`)
6. Usuário é redirecionado para `/upsell4`

## 📊 Banco de Dados

### Tabelas Principais

**Order**
- id: String (PK)
- externalId: String (ID do Evollute)
- transactionId: String (ID da transação)
- status: Enum (PENDING, PAID, REFUNDED, CANCELLED)
- customerName, customerEmail, customerPhone, customerDocument
- amount: Int (em centavos)
- utmifySent: Boolean
- utmifyUpdated: Boolean
- createdAt, paidAt: DateTime

**UtmTracking**
- id: String (PK)
- orderId: String (FK)
- utm_source, utm_campaign, utm_medium, utm_content, utm_term
- userAgent, referrer
- createdAt: DateTime

## 🧪 Testando

### Executar Testes Automatizados
```bash
node teste-vendas-completo.js
```

### Verificar no Prisma Studio
```bash
npx prisma studio
```

### Monitorar em UTMIFY
Acesse: https://app.utmify.com.br

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Visualizar build
npm run lint         # Verificar linting
```

## 🔐 Segurança

- ✅ Variáveis sensíveis em `.env` (não commitadas)
- ✅ Validação de webhook
- ✅ HTTPS obrigatório em produção
- ✅ Timeout nas requests (10s padrão)
- ✅ Error handling sem quebrar vendas

## 📈 Análise em UTMIFY

Acesse o dashboard UTMIFY para analisar:

- Vendas por fonte de tráfego (utm_source)
- Taxa de conversão por campanha
- ROI de cada canal
- Histórico de vendas com UTM params

## 🚀 Deploy

### Vercel (Recomendado para frontend)
```bash
vercel deploy
```

### Heroku (Para backend)
```bash
heroku create
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## 📝 Logs

Verifique os logs para debugar problemas:

```bash
# Backend logs
tail -f logs/server.log

# UTMIFY integration logs
grep "UTMIFY" logs/server.log
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato.

---

**Última atualização:** 2026-01-21
**Status:** ✅ Pronto para Produção
# escola-pix
# escola-pix
