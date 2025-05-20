import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Tenta carregar variáveis do .env se existir
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Arquivo .env carregado:', envPath);
  } else {
    console.log('Arquivo .env não encontrado:', envPath);
  }
} catch (error) {
  console.warn('Erro ao carregar arquivo .env:', error);
}

// Definir a chave diretamente no código como fallback
const OPENROUTER_KEY_FALLBACK = 'PLACEHOLDER_OPENROUTER_API_KEY'; // Substitua pela sua chave ou use variáveis de ambiente
const OPENAI_KEY_FALLBACK = 'PLACEHOLDER_OPENAI_API_KEY'; // Substitua pela sua chave ou use variáveis de ambiente

// Carrega as configurações do arquivo ou usa as variáveis de ambiente
let backendConfig: any;
try {
  // Lista de caminhos possíveis para procurar o arquivo de configuração
  const possiblePaths = [
    path.join(process.cwd(), 'env.backend.js'),               // Atual diretório de trabalho
    path.join(process.cwd(), 'backend', 'env.backend.js'),    // Pasta backend no diretório de trabalho
    path.join(process.cwd(), 'config', 'env.backend.js'),     // Pasta config no diretório de trabalho
    path.join(process.cwd(), '..', 'config', 'env.backend.js'), // Pasta config acima do diretório atual
    path.join(__dirname, '..', 'env.backend.js'),             // Diretório pai do arquivo atual
    path.join(__dirname, '..', '..', 'config', 'env.backend.js') // Pasta config dois níveis acima
  ];
  
  // Tenta encontrar o arquivo em cada um dos caminhos possíveis
  let configPath = '';
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      configPath = testPath;
      break;
    }
  }
  
  if (configPath) {
    backendConfig = require(configPath);
    console.log('Configurações carregadas do arquivo:', configPath);
  } else {
    console.log('Arquivo de configuração não encontrado em nenhum dos caminhos possíveis.');
    backendConfig = {
      PORT: process.env.PORT || 3001,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || OPENROUTER_KEY_FALLBACK,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || OPENAI_KEY_FALLBACK,
      CORS_ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174']
    };
    console.log('Usando variáveis de ambiente ou valores padrão');
  }
} catch (error) {
  console.warn('Erro ao carregar configurações:', error);
  backendConfig = {
    PORT: process.env.PORT || 3001,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || OPENROUTER_KEY_FALLBACK,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || OPENAI_KEY_FALLBACK,
    CORS_ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174']
  };
}

export const PORT = backendConfig.PORT || 3001;
export const OPENROUTER_API_KEY = backendConfig.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || OPENROUTER_KEY_FALLBACK;
export const CORS_ORIGIN = backendConfig.CORS_ORIGIN || process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'];
export const OPENAI_API_KEY = backendConfig.OPENAI_API_KEY || process.env.OPENAI_API_KEY || OPENAI_KEY_FALLBACK;

// Verificação das chaves necessárias
if (!OPENROUTER_API_KEY) {
  console.warn('AVISO: OPENROUTER_API_KEY não definida. A API de chat não funcionará.');
} else {
  console.log('OPENROUTER_API_KEY configurada com sucesso.');
}

if (!OPENAI_API_KEY) {
  console.warn('AVISO: OPENAI_API_KEY não definida. A geração de imagens não funcionará.');
} else {
  console.log('OPENAI_API_KEY configurada com sucesso.');
}

export default {
  PORT,
  OPENROUTER_API_KEY,
  CORS_ORIGIN,
  OPENAI_API_KEY
}; 
