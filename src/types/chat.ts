/**
 * Tipo de remetente da mensagem
 */
export type MessageRole = 'user' | 'assistant';
export type MessageSender = 'user' | 'bot';

/**
 * Interface para uma mensagem do chat
 */
export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;  // Pode conter markdown, incluindo imagens ![texto](url)
  timestamp: string;
  role?: MessageRole;
  sources?: string[];
  isError?: boolean;
  isHumanized?: boolean;
  isSchedule?: boolean;
  imageUrl?: string;
}

/**
 * Interface para a resposta da API
 */
export interface ApiResponse {
  answer?: string;
  response?: string;
  sources?: string[];
  humanizedText?: string;
  error?: string;
} 