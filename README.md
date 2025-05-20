# JumboIA - Assistente de IA

Um assistente de IA construído com React, Vite, Node.js e Express, utilizando a API do OpenRouter para gerar respostas inteligentes.

## 🚀 Ambiente Local

### Pré-requisitos

- Node.js >= 18
- npm ou yarn

### Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/wagnermontezuma/JumboIA-app.git
cd JumboIA-app
```

2. Configure as variáveis de ambiente:

   Crie um arquivo `.env` na raiz do projeto e outro dentro da pasta `backend/` com as seguintes variáveis:

```
PORT=3001
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY_HERE
OPENAI_API_KEY=sua_chave_openai_aqui
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

   > ⚠️ **IMPORTANTE**: Nunca compartilhe ou cometa suas chaves de API em repositórios públicos!

#### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:3001
```

#### Backend (.env)
```env
PORT=3000
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY_HERE
CORS_ORIGIN=http://localhost:5173
```

3. Inicie o backend:
```bash
cd backend
npm install
npm run dev
```

4. Em outro terminal, inicie o frontend:
```bash
npm install
npm run dev
```

5. Acesse o aplicativo:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 🌐 Deploy em Produção

### Frontend (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_API_URL`: URL do backend no Railway (ex: https://jumboia-api.up.railway.app)

### Backend (Railway)

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente:
   - `PORT`: Será configurado automaticamente pelo Railway
   - `OPENROUTER_API_KEY`: Sua chave da API do OpenRouter
   - `CORS_ORIGIN`: URL do frontend no Vercel (ex: https://jumboia.vercel.app)

## ✨ Funcionalidades

- Interface de chat moderna e responsiva
- Integração com modelo DeepSeek via OpenRouter
- Função de humanização de texto
- Limite de caracteres com contador
- Indicador de digitação animado

## 🧪 Verificação do Ambiente

### Checklist:
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] Backend rodando em `http://localhost:3000`
- [ ] Comunicação entre front e back sem erros de CORS
- [ ] OpenRouter respondendo com a chave configurada
- [ ] Mensagens sendo exibidas corretamente na interface

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Por favor, leia o [guia de contribuição](CONTRIBUTING.md) primeiro. 