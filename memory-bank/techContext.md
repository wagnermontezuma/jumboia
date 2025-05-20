# Contexto Técnico - JumboIA

## Stack Tecnológica

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Estilização**: TailwindCSS
- **Componentes UI**: Componentes customizados
- **Gerenciamento de Estado**: React Hooks (useState, useEffect, useRef)
- **Cliente HTTP**: Fetch API nativa

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Linguagem**: JavaScript/TypeScript
- **API Integration**: OpenRouter API (DeepSeek)
- **Middleware**: CORS, Error Handling, Logging

### Infraestrutura
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Versionamento**: Git/GitHub

### Ambiente de Desenvolvimento
- **Sistema Operacional**: Windows 10
- **Terminal**: PowerShell
- **Editor**: VS Code (recomendado)
- **Controle de Versão**: Git para Windows
- **Navegador**: Chrome/Edge para testes

## Configuração de Ambiente

### Variáveis de Ambiente

#### Frontend (.env.development)
```
VITE_API_URL=http://localhost:3000
```

#### Backend (.env)
```
PORT=3000
OPENROUTER_API_KEY=sua-chave-aqui
CORS_ORIGIN=http://localhost:5173
```

### Portas e Endpoints
- **Frontend Dev Server**: http://localhost:5173
- **Backend Server**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api/chat

## Dependências Principais

### Frontend
- React
- React DOM
- TypeScript
- TailwindCSS
- PostCSS
- Vite

### Backend
- Express
- CORS
- Dotenv
- Node-fetch
- Body-parser

## Fluxo de Desenvolvimento

### Setup Local (Windows)
1. Clone do repositório: `git clone https://github.com/wagnermontezuma/JumboIA-app.git`
2. Configuração das variáveis de ambiente:
   - Criar `.env.development` na raiz
   - Criar `.env` na pasta backend
3. Instalação de dependências:
   ```bash
   # Na raiz do projeto
   npm install
   
   # Na pasta backend
   cd backend
   npm install
   ```
4. Execução do backend:
   ```bash
   # Na pasta backend
   npm run dev
   ```
5. Execução do frontend:
   ```bash
   # Na raiz do projeto
   npm run dev
   ```

### Considerações para Windows
- Usar caminhos com barras invertidas (`\`) ou barras normais (`/`) de forma consistente
- Verificar firewall para permissão de portas 3000 e 5173
- Em caso de problemas com instalação de pacotes, considerar usar `npm cache clean --force`
- Para problemas de permissão, considerar executar terminal como administrador

### Processo de Deploy
1. Push para repositório GitHub
2. Vercel detecta mudanças e faz deploy do frontend
3. Railway detecta mudanças e faz deploy do backend

## Restrições Técnicas
- Compatibilidade com Node.js 18+
- Requisitos de CORS entre frontend e backend
- Limites da API do OpenRouter
- Complexidade de prompt para o modelo DeepSeek
- Resolução de caminhos de arquivo em ambiente Windows

## Integração com OpenRouter API
- **Endpoint**: https://openrouter.ai/api/v1/chat/completions
- **Modelo**: DeepSeek
- **Autenticação**: API Key via Header
- **Formato de Requisição**: JSON com messages array
- **Formato de Resposta**: JSON com choices e message content 