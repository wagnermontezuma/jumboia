import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types/chat';
import { PlusIcon, ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSpecialPrompts, setShowSpecialPrompts] = useState(false);
  const [showConversations, setShowConversations] = useState(false);

  // Inicializar com uma conversa vazia
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);

  // Atualizar mensagens quando a conversa ativa mudar
  useEffect(() => {
    if (activeConversationId) {
      const activeConversation = conversations.find(conv => conv.id === activeConversationId);
      if (activeConversation) {
        setMessages(activeConversation.messages);
      }
    }
  }, [activeConversationId, conversations]);

  // Rolar para o final quando chegarem novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Criar uma nova conversa
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: `Nova conversa ${conversations.length + 1}`,
      messages: [],
      updatedAt: new Date().toISOString()
    };
    
    setConversations(prevConversations => [...prevConversations, newConversation]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
    setInputMessage('');
    setError(null);
  };

  // Excluir uma conversa
  const deleteConversation = (id: string) => {
    setConversations(prevConversations => prevConversations.filter(conv => conv.id !== id));
    
    // Se a conversa ativa foi excluída, selecione outra ou crie uma nova
    if (id === activeConversationId) {
      const remaining = conversations.filter(conv => conv.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
        setMessages(remaining[0].messages);
      } else {
        createNewConversation();
      }
    }
  };

  // Atualizar a conversa ativa
  const updateActiveConversation = (newMessages: ChatMessage[]) => {
    if (!activeConversationId) return;
    
    setMessages(newMessages);
    
    // Atualizar a conversa no estado geral
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === activeConversationId 
          ? { 
              ...conv, 
              messages: newMessages, 
              updatedAt: new Date().toISOString(),
              // Atualizar título baseado na primeira mensagem do usuário
              title: conv.title === `Nova conversa ${conversations.length}` && newMessages.length > 0
                ? newMessages.find(msg => msg.sender === 'user')?.content.substring(0, 20) + '...'
                : conv.title
            } 
          : conv
      )
    );
  };

  // Componente de digitação
  const TypingIndicator = () => (
    <div className="flex mb-4 justify-start">
      <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none max-w-[80%]">
        <div className="flex items-center">
          <span className="ml-1 flex">
            <span className="h-2 w-2 bg-gray-400 rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '200ms' }}></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '400ms' }}></span>
          </span>
        </div>
      </div>
    </div>
  );

  // Função para enviar uma mensagem
  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversationId) return;

    // Limpar o erro anterior
    setError(null);

    // Adicionar mensagem do usuário ao estado
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      role: 'user'
    };

    const newMessages = [...messages, userMessage];
    updateActiveConversation(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Fazer requisição para a API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          history: messages.map(msg => ({
            role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
            content: msg.content
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar a mensagem');
      }

      // Adicionar resposta da IA ao estado
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'bot',
        content: data.answer || data.response || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date().toISOString(),
        role: 'assistant',
        sources: data.sources
      };

      updateActiveConversation([...newMessages, aiMessage]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Adicionar mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Please try again.',
        timestamp: new Date().toISOString(),
        role: 'assistant',
        isError: true
      };

      updateActiveConversation([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Função para limpar o histórico de mensagens
  const handleClearChat = () => {
    updateActiveConversation([]);
    setError(null);
  };

  // Renderizar a mensagem com base no tipo (usuário ou IA)
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <div 
        key={message.id} 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div 
          className={`max-w-[80%] p-3 rounded-lg ${
            isUser 
              ? 'bg-green-500 text-white rounded-tr-none' 
              : 'bg-white border border-gray-200 rounded-tl-none'
          } ${message.isError ? 'border-red-300 bg-red-50' : ''}`}
        >
          <p className={`text-base font-medium ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {message.content}
          </p>
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-semibold">Fontes:</p>
              <ul className="list-disc pl-4">
                {message.sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Lista de conversas no lado esquerdo */}
      <div className="w-72 h-full bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 border-b pb-2">Suas Conversas</h3>
          {conversations.length === 0 ? (
            <p className="text-gray-500">Nenhuma conversa encontrada</p>
          ) : (
            <ul>
              {conversations.map(conv => (
                <li 
                  key={conv.id} 
                  className={`flex justify-between items-center p-2 mb-1 rounded-lg hover:bg-gray-100 cursor-pointer ${
                    activeConversationId === conv.id ? 'bg-green-50 border border-green-200' : ''
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-grow flex flex-col bg-gray-100">
        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto p-4 bg-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="mb-2 text-2xl font-bold">Bem-vindo ao JumboIA</p>
              <p className="text-base font-medium">Envie uma mensagem para começar a conversa</p>
            </div>
          ) : (
            <div>
              {messages.map(renderMessage)}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-2 text-center text-sm text-red-500 bg-red-50 border-t border-red-200">
            {error}
          </div>
        )}

        {/* Input form */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] text-base font-medium bg-gradient-to-r from-green-50 to-green-100"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputMessage.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowSpecialPrompts(!showSpecialPrompts)}
                className="bg-gray-200 text-gray-600 p-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                title="Mostrar prompts especiais"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
              
              <button
                onClick={handleClearChat}
                className="text-sm font-medium text-gray-500 hover:text-red-500 mx-auto"
              >
                Limpar conversa
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-green-500 to-green-400 text-white px-8 py-3 rounded-lg text-lg font-bold hover:from-green-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </form>

          {showSpecialPrompts && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setInputMessage("Ajude-me a fazer uma redação sobre ");
                  setShowSpecialPrompts(false);
                }}
                className="text-sm font-medium bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Redação
              </button>
              <button
                onClick={() => {
                  setInputMessage("Faça um resumo do conteúdo sobre ");
                  setShowSpecialPrompts(false);
                }}
                className="text-sm font-medium bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Resumo
              </button>
              <button
                onClick={() => {
                  setInputMessage("Crie um quiz sobre ");
                  setShowSpecialPrompts(false);
                }}
                className="text-sm font-medium bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Quizzes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
