import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaStop, FaArrowLeft, FaGlobe, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// API URL (mesmo usado para o chat de texto)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Lista de idiomas disponíveis
const LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Português (Portugal)' },
  { code: 'en', name: 'Inglês' },
  { code: 'es', name: 'Espanhol' },
  { code: 'fr', name: 'Francês' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Alemão' }
];

const LiveVoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  
  // Referências para reconhecimento de voz e síntese de voz
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Referências para canvas de visualização de ondas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Estado para a seleção de idioma
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Configuração do reconhecimento de voz
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }
    
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Erro ao parar reconhecimento:', err);
        }
      }

      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const interimTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setTranscript(interimTranscript);
        setInputText(interimTranscript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };
      
      // Configurar síntese de voz
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.lang = selectedLanguage;
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.0;
      
      speechSynthesisRef.current.onstart = () => {
        setIsSpeaking(true);
        startWaveAnimation();
      };
      
      speechSynthesisRef.current.onend = () => {
        setIsSpeaking(false);
        stopWaveAnimation();
      };

    } catch (err) {
      console.error('Erro ao inicializar reconhecimento de voz:', err);
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Erro ao parar reconhecimento:', err);
        }
      }
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [selectedLanguage, isListening]);
  
  // Inicializar o contexto de áudio para visualização
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const setupAudioContext = () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        if (isListening) {
          connectMicrophone();
        }
      } catch (err) {
        console.error('Erro ao configurar contexto de áudio:', err);
      }
    };
    
    setupAudioContext();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [canvasRef.current]);
  
  // Conectar o microfone ao analisador
  const connectMicrophone = async () => {
    if (!audioContextRef.current || !analyserRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      startWaveAnimation();
    } catch (err) {
      console.error('Erro ao acessar o microfone:', err);
    }
  };
  
  // Função para desenhar as ondas sonoras
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    const gradientUser = ctx.createLinearGradient(0, height, 0, 0);
    gradientUser.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
    gradientUser.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    
    const gradientAssistant = ctx.createLinearGradient(0, height, 0, 0);
    gradientAssistant.addColorStop(0, 'rgba(104, 211, 145, 0.7)');
    gradientAssistant.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = isSpeaking ? '#68d391' : '#3B82F6';
    
    const barWidth = (width / dataArrayRef.current.length) * 2.5;
    let x = 0;
    
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const barHeight = dataArrayRef.current[i] / 2;
      
      ctx.fillStyle = isSpeaking 
        ? gradientAssistant
        : gradientUser;
        
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };
  
  // Iniciar a animação de ondas
  const startWaveAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };
  
  // Parar a animação de ondas
  const stopWaveAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
  // Enviar a mensagem para o JumboIA
  const sendMessageToJumboIA = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      // Adicionar mensagem do usuário
      const userMessage = { role: 'user' as const, content: text };
      setMessages(prev => [...prev, userMessage]);
      
      // Limpar o input
      setInputText('');
      setTranscript('');
      
      // Fazer a requisição para a API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: text,
          responseLanguage: selectedLanguage
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Usar o texto humanizado se disponível, senão usar a resposta padrão
      const responseText = data.humanizedText || data.answer || 'Desculpe, não consegui processar sua pergunta.';
      setResponse(responseText);
      
      // Adicionar mensagem do assistente
      const assistantMessage = { role: 'assistant' as const, content: responseText };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Sintetizar a resposta em voz
      if (speechSynthesisRef.current && window.speechSynthesis) {
        speechSynthesisRef.current.text = responseText;
        window.speechSynthesis.speak(speechSynthesisRef.current);
      }
    } catch (err) {
      console.error('Erro ao comunicar com JumboIA:', err);
      setError(`Erro ao processar sua pergunta: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Alternar o reconhecimento de voz
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Erro ao parar reconhecimento:', err);
        }
      }
      setIsListening(false);
      stopWaveAnimation();
    } else {
      if (recognitionRef.current) {
        setError(null);
        try {
          recognitionRef.current.lang = selectedLanguage;
          recognitionRef.current.start();
          connectMicrophone();
        } catch (err) {
          console.error('Erro ao iniciar reconhecimento:', err);
        }
      }
    }
  };
  
  // Parar a síntese de voz
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      stopWaveAnimation();
    }
  };
  
  // Função para voltar à página anterior
  const handleBack = () => {
    navigate('/');
  };
  
  // Função para alternar exibição do seletor de idioma
  const toggleLanguageSelector = () => {
    setShowLanguageSelector(!showLanguageSelector);
  };
  
  // Função para alterar o idioma selecionado
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    localStorage.setItem('jumboIA_language', newLang);
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.lang = newLang;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
  };
  
  // Carregar preferência de idioma do localStorage ao iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('jumboIA_language');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);
  
  // Enviar mensagem com tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessageToJumboIA(inputText);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#4bd66e] to-white">
      {/* Cabeçalho */}
      <header className="p-4 bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Voltar"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-green-600">JumboIA</h1>
        </div>
        
        <div className="flex items-center">
          <div className="text-sm text-gray-500 mr-4">
            {isListening ? 'Ouvindo...' : isSpeaking ? 'Falando...' : 'Aguardando...'}
          </div>
          
          {/* Botão de seleção de idioma */}
          <button
            onClick={toggleLanguageSelector}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            title="Selecionar idioma"
          >
            <FaGlobe className="text-green-600 text-xl" />
          </button>
        </div>
      </header>
      
      {/* Seletor de idioma flutuante */}
      {showLanguageSelector && (
        <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200 w-64">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selecione o Idioma</h3>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {LANGUAGES.map(language => (
              <option key={language.code} value={language.code}>{language.name}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Área principal */}
      <main className="flex-1 p-4 overflow-hidden flex flex-col bg-transparent">
        {/* Visualização de ondas sonoras */}
        <div className="w-full h-36 bg-white bg-opacity-90 rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-200">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={144} 
            className="w-full h-full"
          />
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {/* Histórico de mensagens */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-transparent p-2">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg max-w-3xl ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto' 
                  : 'bg-gradient-to-r from-green-50 to-white border-l-4 border-green-400'
              }`}
            >
              <div className="font-medium mb-1 text-gray-700">
                {message.role === 'user' ? 'Você' : 'JumboIA'}
              </div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        
        {/* Input e controles */}
        <div className="flex flex-col">
          {/* Campo de input e botão de envio */}
          <div className="relative flex items-center mb-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem"
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => sendMessageToJumboIA(inputText)}
              className="absolute right-1 p-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-md transition-colors flex items-center justify-center w-12 h-12"
              title="Enviar mensagem"
            >
              <FaArrowRight className="text-xl" />
            </button>
          </div>
          
          {/* Controles de voz */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleListening}
              className={`p-5 rounded-full shadow-md flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
              title={isListening ? 'Parar de escutar' : 'Começar a escutar'}
            >
              {isListening ? (
                <FaMicrophoneSlash className="text-2xl" />
              ) : (
                <FaMicrophone className="text-2xl" />
              )}
            </button>
            
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-5 rounded-full shadow-md bg-gradient-to-r from-green-400 to-green-300 hover:from-green-500 hover:to-green-400 text-white transition-colors"
                title="Parar de falar"
              >
                <FaStop className="text-2xl" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveVoicePage; 