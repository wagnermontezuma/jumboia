import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types/chat';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para o final quando chegarem novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Funções auxiliares para tipos especiais de mensagens
  const addSpecialPrompt = (type: string) => {
    let prompt = '';
    switch (type) {
      case 'redacao':
        prompt = 'Por favor, me ajude a desenvolver uma redação sobre: ';
        break;
      case 'resumo':
        prompt = 'Por favor, faça um resumo sobre o seguinte assunto: ';
        break;
      case 'quiz':
        prompt = 'Por favor, crie um quiz educativo sobre: ';
        break;
      case 'materias':
        prompt = 'Por favor, forneça materiais educativos sobre: ';
        break;
      case 'sequencia':
        prompt = 'Por favor, crie uma sequência didática sobre: ';
        break;
      case 'mapa':
        prompt = 'Por favor, gere um mapa mental explicativo sobre: ';
        break;
      case 'flashcards':
        prompt = 'Por favor, crie flashcards educativos sobre: ';
        break;
      default:
        return;
    }
    setInputMessage(prompt);
  };

  // Função para enviar uma mensagem
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
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
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
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

      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Adicionar mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date().toISOString(),
        role: 'assistant',
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Função para lidar com o pressionamento de Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#e8f5e8] to-[#d0ebd0]">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Tela inicial quando não há mensagens
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-light text-gray-700 mb-8">No que você está pensando hoje?</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-8">
              <div onClick={() => addSpecialPrompt('redacao')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Redação</h3>
                <p className="text-sm text-gray-500 font-light">Ajuda na criação de textos dissertativos</p>
              </div>
              
              <div onClick={() => addSpecialPrompt('resumo')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Resumo de Assunto</h3>
                <p className="text-sm text-gray-500 font-light">Resumos concisos sobre qualquer tema</p>
              </div>
              
              <div onClick={() => addSpecialPrompt('quiz')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Quiz</h3>
                <p className="text-sm text-gray-500 font-light">Questionários para testar conhecimentos</p>
              </div>
              
              <div onClick={() => addSpecialPrompt('materias')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Materiais</h3>
                <p className="text-sm text-gray-500 font-light">Conteúdos educativos organizados</p>
              </div>
              
              <div onClick={() => addSpecialPrompt('sequencia')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Sequência Didática</h3>
                <p className="text-sm text-gray-500 font-light">Planejamento de aulas estruturadas</p>
              </div>
              
              <div onClick={() => addSpecialPrompt('mapa')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Mapa Mental</h3>
                <p className="text-sm text-gray-500 font-light">Organização visual de conceitos</p>
              </div>
              
              <div onClick={() => addSpecialPrompt('flashcards')} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1">
                <h3 className="font-light text-gray-700">Flashcards</h3>
                <p className="text-sm text-gray-500 font-light">Cartões para memorização eficiente</p>
              </div>
            </div>
          </div>
        ) : (
          // Conversação 
          <div className="w-full max-w-5xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`py-6 ${message.sender === 'bot' ? 'bot-message-container' : 'user-message-container'}`}
              >
                <div className="message-inner-container">
                  <div className="flex flex-col">
                    <div className="message-sender">
                      {message.sender === 'user' ? 'Você' : 'JumboIA'}
                    </div>
                    <div className="message-content">{message.content}</div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 text-sm">
                        <p className="font-light">Fontes:</p>
                        <ul className="list-disc pl-5 font-light">
                          {message.sources.map((source, index) => (
                            <li key={index}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="py-6 bot-message-container">
                <div className="message-inner-container">
                  <div className="flex flex-col">
                    <div className="message-sender">
                      JumboIA
                    </div>
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                      <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Formulário de entrada */}
      <div className="border-t border-green-200 bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-xl font-light">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              className="w-full border border-gray-300 rounded-xl py-3 pl-4 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-light"
              placeholder="Pergunte alguma coisa"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '52px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              className={`absolute right-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center ${
                isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-md'
              }`}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="flex mt-2 gap-2 justify-center">
              <div onClick={() => addSpecialPrompt('redacao')} className="cursor-pointer bg-white border border-green-200 hover:bg-green-50 rounded-full px-4 py-1 text-xs text-gray-600 font-light">
                Redação
              </div>
              <div onClick={() => addSpecialPrompt('resumo')} className="cursor-pointer bg-white border border-green-200 hover:bg-green-50 rounded-full px-4 py-1 text-xs text-gray-600 font-light">
                Resumo
              </div>
              <div onClick={() => addSpecialPrompt('quiz')} className="cursor-pointer bg-white border border-green-200 hover:bg-green-50 rounded-full px-4 py-1 text-xs text-gray-600 font-light">
                Quiz
              </div>
              <div onClick={() => addSpecialPrompt('materias')} className="cursor-pointer bg-white border border-green-200 hover:bg-green-50 rounded-full px-4 py-1 text-xs text-gray-600 font-light">
                Materiais
              </div>
              <div onClick={() => addSpecialPrompt('mapa')} className="cursor-pointer bg-white border border-green-200 hover:bg-green-50 rounded-full px-4 py-1 text-xs text-gray-600 font-light">
                Mapa Mental
              </div>
              <div onClick={() => addSpecialPrompt('flashcards')} className="cursor-pointer bg-white border border-green-200 hover:bg-green-50 rounded-full px-4 py-1 text-xs text-gray-600 font-light">
                Flashcards
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 