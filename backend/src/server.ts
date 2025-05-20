import express from 'express';
import cors from 'cors';
import { askDeepSeek, humanizeTextWithDeepSeek } from './services';
import OpenAI from 'openai';
import * as quizController from './controllers/quizController';
import config, { PORT, OPENROUTER_API_KEY, CORS_ORIGIN, OPENAI_API_KEY } from './config';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
// Usar a porta da configuração
const port = PORT; 

// Criar servidor HTTP para suporte ao Socket.IO
const httpServer = createServer(app);
// Inicializar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Transformar CORS_ORIGIN em um formato que o módulo cors possa usar
let corsOrigin = CORS_ORIGIN;
if (Array.isArray(CORS_ORIGIN)) {
  // Se já for um array, use-o diretamente
  corsOrigin = CORS_ORIGIN;
} else if (typeof CORS_ORIGIN === 'string') {
  // Se for uma string e tiver vírgula, divida em array
  if (CORS_ORIGIN.includes(',')) {
    corsOrigin = CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  // Caso contrário, use a string como está
}

// Configuração CORS aprimorada
const corsOptions = {
  origin: corsOrigin, // Usar a origem processada
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Log da configuração CORS
console.log('Configuração CORS:', { origin: typeof corsOrigin === 'object' ? JSON.stringify(corsOrigin) : corsOrigin });

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Verifica se a chave da API do OpenAI existe
const openaiApiKey = OPENAI_API_KEY;
console.log('Valor de OPENAI_API_KEY:', openaiApiKey ? 'Chave presente (valor oculto por segurança)' : 'Chave não encontrada');

// Só inicializa o cliente OpenAI se a chave estiver presente
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// Configurar Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Manipular eventos de live data
  socket.on('joinLiveChannel', (channel) => {
    console.log(`Cliente ${socket.id} entrou no canal: ${channel}`);
    socket.join(channel);
  });
  
  // Receber pedido de atualizações ao vivo
  socket.on('requestLiveData', (data) => {
    console.log(`Solicitação de dados ao vivo de ${socket.id}:`, data);
    // Aqui você processaria a solicitação e enviaria atualizações
  });

  // Eventos de desconexão
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Dados para simulação de atualizações em tempo real
let liveDataSources = {
  'mercado': { 
    lastUpdate: Date.now(),
    data: [
      { ticker: 'PETR4', price: 35.75, change: 1.25 },
      { ticker: 'VALE3', price: 68.20, change: -0.35 },
      { ticker: 'ITUB4', price: 32.15, change: 0.45 }
    ]
  },
  'clima': {
    lastUpdate: Date.now(),
    data: {
      temperatura: 27.5,
      umidade: 65,
      previsao: 'Parcialmente nublado'
    }
  },
  'noticias': {
    lastUpdate: Date.now(),
    data: [
      { id: 1, titulo: 'Nova tecnologia revoluciona mercado', timestamp: Date.now() - 3600000 },
      { id: 2, titulo: 'Descoberta científica importante anunciada', timestamp: Date.now() - 7200000 }
    ]
  }
};

// Definir um tipo para as chaves de liveDataSources
type LiveDataSourceKey = keyof typeof liveDataSources;

// Simular atualizações periódicas para dados em tempo real
setInterval(() => {
  // Atualiza os dados de mercado
  liveDataSources.mercado.data.forEach(item => {
    // Variação aleatória de -1% a 1%
    const change = (Math.random() * 2 - 1) * item.price * 0.01;
    item.price = parseFloat((item.price + change).toFixed(2));
    item.change = parseFloat(change.toFixed(2));
  });
  liveDataSources.mercado.lastUpdate = Date.now();
  
  // Atualiza os dados de clima
  const tempChange = (Math.random() * 2 - 1) * 0.5;
  liveDataSources.clima.data.temperatura = parseFloat((liveDataSources.clima.data.temperatura + tempChange).toFixed(1));
  liveDataSources.clima.data.umidade = Math.min(100, Math.max(0, 
    liveDataSources.clima.data.umidade + (Math.random() * 6 - 3)
  ));
  liveDataSources.clima.lastUpdate = Date.now();
  
  // Emitir atualizações para os clientes inscritos
  io.to('mercado').emit('liveUpdate', { 
    type: 'mercado', 
    data: liveDataSources.mercado 
  });
  
  io.to('clima').emit('liveUpdate', { 
    type: 'clima', 
    data: liveDataSources.clima 
  });
}, 5000); // Atualiza a cada 5 segundos

// Simular notícias novas ocasionalmente
setInterval(() => {
  if (Math.random() > 0.7) { // 30% de chance
    const noticiaId = liveDataSources.noticias.data.length + 1;
    const titulos = [
      'Novos avanços em inteligência artificial',
      'Mercado financeiro reage a anúncios econômicos',
      'Descobertas importantes na área de saúde',
      'Novas políticas ambientais são anunciadas',
      'Inovações tecnológicas prometem transformar indústria'
    ];
    
    const titulo = titulos[Math.floor(Math.random() * titulos.length)];
    
    liveDataSources.noticias.data.unshift({
      id: noticiaId,
      titulo: titulo,
      timestamp: Date.now()
    });
    
    // Manter apenas as 10 notícias mais recentes
    if (liveDataSources.noticias.data.length > 10) {
      liveDataSources.noticias.data.pop();
    }
    
    liveDataSources.noticias.lastUpdate = Date.now();
    
    io.to('noticias').emit('liveUpdate', {
      type: 'noticias',
      data: liveDataSources.noticias
    });
  }
}, 15000); // Verifica a cada 15 segundos

// Rota para obter os dados ao vivo disponíveis
app.get('/api/live/sources', (req, res) => {
  const sources = Object.keys(liveDataSources).map(key => {
    const sourceKey = key as LiveDataSourceKey; // Fazer o cast da chave aqui
    return {
      id: sourceKey,
      name: sourceKey.charAt(0).toUpperCase() + sourceKey.slice(1),
      lastUpdate: liveDataSources[sourceKey].lastUpdate // Usar a chave tipada
    };
  });
  
  res.json({ sources });
});

// Rota para obter os dados mais recentes de uma fonte específica
app.get('/api/live/:source', (req, res) => {
  const { source } = req.params;
  const sourceKey = source as LiveDataSourceKey; // Usar asserção de tipo
  
  if (liveDataSources[sourceKey]) { // Usar a chave tipada
    res.json({ 
      success: true,
      data: liveDataSources[sourceKey] // Usar a chave tipada
    });
  } else {
    res.status(404).json({
      success: false,
      error: `Fonte de dados '${source}' não encontrada`
    });
  }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando corretamente!' });
});

// Rota principal para processar perguntas - alterada de /ask para /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { question, responseLanguage, message, history } = req.body; // Adicionar message e history
    
    // Priorizar 'message' se 'question' não estiver presente (para compatibilidade)
    const currentMessage = message || question;
    
    // Verifica se a chave da API foi carregada
    if (!OPENROUTER_API_KEY) {
      console.error('Erro Crítico: Variável de ambiente OPENROUTER_API_KEY não encontrada!');
      return res.status(500).json({
        error: 'Erro interno do servidor: Chave da API não configurada.'
      });
    }

    if (!currentMessage) {
      return res.status(400).json({ error: 'A pergunta é obrigatória' });
    }

    // Passa o idioma selecionado e o histórico para a função askDeepSeek
    const answer = await askDeepSeek(currentMessage, responseLanguage, history); // Modificar chamada
    res.json({ answer }); // Manter a resposta como { answer: ... } se o frontend espera isso, ou ajustar para { message: ... }
  } catch (error: any) {
    // Log aprimorado
    console.error(`Erro ao processar pergunta: ${error.message}`, error.stack);
    console.error('Detalhes adicionais (se houver):', error.response?.data);

    // Verifica explicitamente por erros de autenticação
    if (error.message.includes('autenticação') || error.message.includes('JWT') || error.message.includes('token-invalid') || error.message.includes('No auth credentials')) {
      return res.status(401).json({ 
        error: 'Erro de autenticação com a API. Verifique a chave em backend/.env.' 
      });
    }

    if (error.message.includes('token limit') || error.message.includes('Limite de tokens')) {
      return res.status(400).json({ 
        error: 'A mensagem excedeu o limite de tokens permitido.' 
      });
    }

    // Retorna o erro genérico para outros casos
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
    });
  }
});

// Nova rota para humanizar texto
app.post('/humanize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'O texto é obrigatório para humanização.' });
    }

    // Verifica a chave da API (boa prática reutilizar a verificação)
    if (!OPENROUTER_API_KEY) {
      console.error('Erro Crítico (Humanize): Variável de ambiente OPENROUTER_API_KEY não encontrada!');
      return res.status(500).json({
        error: 'Erro interno do servidor: Chave da API não configurada.'
      });
    }

    console.log(`Recebida requisição para humanizar: "${text.substring(0, 50)}..."`);
    const humanizedText = await humanizeTextWithDeepSeek(text);
    console.log(`Texto humanizado: "${humanizedText.substring(0, 50)}..."`);
    
    res.json({ humanizedText });

  } catch (error: any) {
    // Log e tratamento de erro específicos para a humanização
    console.error(`Erro ao humanizar texto: ${error.message}`, error.stack);
    console.error('Detalhes adicionais (Humanize):', error.response?.data);
    
    // Retorna mensagens de erro mais específicas baseadas no erro lançado pela função
    if (error.message.includes('autenticação')) {
        return res.status(401).json({ error: error.message });
    }
    if (error.message.includes('Limite de tokens')) {
        return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('API ao humanizar')) {
         return res.status(502).json({ error: error.message }); // Bad Gateway se a API externa falhou
    }
    
    // Erro genérico
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao tentar humanizar o texto. Por favor, tente novamente.'
    });
  }
});

// Rota para geração de imagens via OpenAI
app.post('/image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório para gerar a imagem.' });
  }
  
  // Verifica se o cliente OpenAI foi inicializado
  if (!openaiClient) {
    return res.status(500).json({ error: 'Serviço de geração de imagens não disponível. Verifique a configuração da API.' });
  }
  
  try {
    console.log('Gerando imagem com o prompt:', prompt.substring(0, 50) + '...');
    
    const response = await openaiClient.images.generate({ 
      prompt, 
      n: 1, 
      size: "1024x1024",
      model: "dall-e-2",
      quality: "standard",
      response_format: "url"
    });
    
    // Garantindo que o resultado existe antes de acessar a URL
    if (!response.data || response.data.length === 0) {
      throw new Error('A API não retornou imagens');
    }
    
    console.log('Imagem gerada com sucesso, retornando URL');
    const imageUrl = response.data[0].url;
    return res.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Erro ao gerar imagem via OpenAI:', error);
    // Log mais detalhado para ajudar no diagnóstico
    if (error.response) {
      console.error('Detalhes do erro da OpenAI:', JSON.stringify(error.response.data || {}, null, 2));
    }
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar imagem.' });
  }
});

// Rotas para o sistema de quizzes
app.post('/quiz/generate', quizController.generateQuiz);
app.get('/quiz/:quizId', quizController.getQuiz);
app.post('/quiz/:quizId/submit', quizController.submitQuiz);

// Middleware para verificar tentativas expiradas
app.use('/quiz/:quizId/submit', (req, res, next) => {
  // Verifica se há um parâmetro startTime na query
  const { startTime } = req.query;
  if (startTime) {
    const startTimestamp = parseInt(startTime as string);
    const currentTime = Date.now();
    const timeDifference = currentTime - startTimestamp;
    
    // Se passaram mais de 5 minutos (300000 ms)
    if (timeDifference > 300000) {
      return res.status(400).json({ error: 'Tempo limite excedido (5 minutos)' });
    }
  }
  next();
});

// Inicia o servidor
const startServer = (portToUse: number) => {
  try {
    const server = httpServer.listen(portToUse, () => {
      console.log(`Servidor rodando em http://localhost:${portToUse}`);
      console.log(`Socket.IO configurado e pronto para conexões em tempo real`);
      
      if (!OPENROUTER_API_KEY) {
        console.warn('Atenção: Variável de ambiente OPENROUTER_API_KEY não carregada!');
      } else {
        console.log('Chave da API OpenRouter carregada com sucesso.');
      }
        
      // Status das funcionalidades
      console.log('-------------- STATUS DAS FUNCIONALIDADES --------------');
      console.log('Chat com DeepSeek:', OPENROUTER_API_KEY ? 'DISPONÍVEL ✅' : 'INDISPONÍVEL ❌');
      console.log('Geração de imagens:', openaiApiKey ? 'DISPONÍVEL ✅' : 'INDISPONÍVEL ❌');
      console.log('Sistema de Quiz:', 'DISPONÍVEL ✅');
      console.log('Dados em tempo real (Live):', 'DISPONÍVEL ✅');
      console.log('----------------------------------------------------');
      
      // Log específico para ambiente Windows
      if (process.platform === 'win32') {
        console.log('Sistema detectado: Windows');
        console.log('Certifique-se de que o firewall permita conexões nas portas 3001 e 5174');
      }
    });

    // Gestão de encerramento do processo
    process.on('SIGTERM', () => {
      console.log('Sinal SIGTERM recebido: fechando servidor HTTP');
      server.close(() => {
        console.log('Servidor HTTP encerrado');
      });
    });

    process.on('SIGINT', () => {
      console.log('Sinal SIGINT recebido: fechando servidor HTTP');
      server.close(() => {
        console.log('Servidor HTTP encerrado');
      });
    });

    return server;
  } catch (error: any) {
    console.error(`Erro ao iniciar o servidor: ${error.message}`, error.stack);
    process.exit(1);
  }
};

// Tratamento para porta ocupada - tenta incrementar a porta
const tryPort = (portToTry: number): void => {
  try {
    startServer(portToTry);
  } catch (error: any) {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Porta ${portToTry} já está em uso. Tentando porta ${portToTry + 1}...`);
      tryPort(portToTry + 1);
    } else {
      console.error(`Erro ao iniciar servidor: ${error.message}`);
      process.exit(1);
    }
  }
};

// Inicia o servidor com tratamento de porta ocupada
tryPort(parseInt(port.toString()));

// Para uso em testes e importação como módulo
export default app; 