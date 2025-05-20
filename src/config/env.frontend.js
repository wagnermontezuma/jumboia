// Configurações para o frontend

/**
 * Obtém a URL da API a partir de variáveis de ambiente ou usa o valor padrão
 * Este arquivo permite configurar a aplicação sem precisar alterar o código
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Função para verificar se estamos em ambiente de desenvolvimento
 */
export const isDevelopment = () => {
  return import.meta.env.DEV === true || window.location.hostname === 'localhost';
};

/**
 * Configuração da API de chat
 */
export const apiConfig = {
  openrouterKey: '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',
  defaultModel: 'deepseek/deepseek-r1-distill-llama-70b:free'
};

/**
 * Configurações da aplicação
 */
export const appConfig = {
  name: 'JumboIA',
  version: '1.0.0',
  description: 'Assistente de IA baseado em DeepSeek',
  maxInputLength: 4000, // Limite máximo de caracteres para entrada
  defaultModel: 'deepseek/deepseek-r1-distill-llama-70b:free'
};

export default {
  API_URL,
  isDevelopment,
  appConfig,
  apiConfig,
  VITE_PORT: 5173,
  VITE_BACKEND_URL: 'http://localhost:3001'
}; 