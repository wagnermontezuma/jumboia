import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { FaChartLine, FaCloudSun, FaNewspaper, FaSync, FaArrowUp, FaArrowDown, FaChartBar } from 'react-icons/fa';

// Variáveis para URL da API e conexão WebSocket
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Interfaces para os tipos de dados
interface LiveSource {
  id: string;
  name: string;
  lastUpdate: number;
}

interface LiveData {
  lastUpdate: number;
  data: any;
}

interface StockData {
  ticker: string;
  price: number;
  change: number;
}

interface WeatherData {
  temperatura: number;
  umidade: number;
  previsao: string;
}

interface NewsItem {
  id: number;
  titulo: string;
  timestamp: number;
}

// Componente de gráfico para visualização de dados
const LiveChart: React.FC<{ data: StockData[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stockHistory, setStockHistory] = useState<{ [key: string]: number[] }>({});
  
  // Inicializar o histórico de dados para cada ticker se não existir
  useEffect(() => {
    const newHistory: { [key: string]: number[] } = { ...stockHistory };
    
    data.forEach(stock => {
      if (!newHistory[stock.ticker]) {
        newHistory[stock.ticker] = Array(20).fill(stock.price);
      } else {
        // Adicionar novo preço e manter apenas os últimos 20 pontos
        newHistory[stock.ticker] = [...newHistory[stock.ticker].slice(-19), stock.price];
      }
    });
    
    setStockHistory(newHistory);
  }, [data]);
  
  // Renderizar o gráfico quando o histórico mudar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Definir as cores para cada ticker
    const colors = {
      'PETR4': '#3B82F6', // Azul
      'VALE3': '#10B981', // Verde
      'ITUB4': '#F59E0B'  // Amarelo
    };
    
    // Encontrar valores mínimo e máximo para escala
    let min = Infinity;
    let max = -Infinity;
    
    Object.values(stockHistory).forEach(prices => {
      prices.forEach(price => {
        min = Math.min(min, price);
        max = Math.max(max, price);
      });
    });
    
    // Adicionar margem de 5% para visualização
    const range = max - min;
    min = min - range * 0.05;
    max = max + range * 0.05;
    
    // Desenhar eixos
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Eixo X
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 20, canvas.height - 30);
    ctx.stroke();
    
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, canvas.height - 30);
    ctx.stroke();
    
    // Desenhar marcações no eixo Y
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = 20 + (canvas.height - 50) * (1 - i / steps);
      const value = min + (max - min) * (i / steps);
      
      ctx.beginPath();
      ctx.moveTo(37, y);
      ctx.lineTo(43, y);
      ctx.stroke();
      
      ctx.fillText(value.toFixed(2), 35, y + 4);
    }
    
    // Desenhar linhas para cada ticker
    Object.entries(stockHistory).forEach(([ticker, prices]) => {
      if (prices.length < 2) return;
      
      ctx.strokeStyle = colors[ticker as keyof typeof colors] || '#6B7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const xStep = (canvas.width - 60) / (prices.length - 1);
      
      prices.forEach((price, index) => {
        // Normalizar o valor entre 0 e 1 com base no min e max
        const normalizedValue = (price - min) / (max - min);
        const x = 40 + index * xStep;
        const y = 20 + (canvas.height - 50) * (1 - normalizedValue);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    });
    
    // Desenhar legendas
    const legendY = canvas.height - 15;
    let legendX = 60;
    
    Object.entries(colors).forEach(([ticker, color]) => {
      ctx.fillStyle = color;
      
      // Quadrado da cor
      ctx.fillRect(legendX, legendY - 8, 10, 10);
      
      // Texto do ticker
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ticker, legendX + 15, legendY);
      
      legendX += 70;
    });
    
  }, [stockHistory]);
  
  return (
    <div className="mt-4 bg-white/50 p-2 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Evolução dos Preços</h3>
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={300} 
        className="w-full h-auto"
      ></canvas>
    </div>
  );
};

// Componente principal para a página Live
const LiveDataPage: React.FC = () => {
  const [sources, setSources] = useState<LiveSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  
  // Efeito para carregar fontes de dados disponíveis
  useEffect(() => {
    const loadSources = async () => {
      try {
        const response = await fetch(`${API_URL}/api/live/sources`);
        if (!response.ok) {
          throw new Error('Falha ao carregar fontes de dados');
        }
        
        const data = await response.json();
        setSources(data.sources);
        
        // Selecionar a primeira fonte por padrão
        if (data.sources.length > 0 && !selectedSource) {
          setSelectedSource(data.sources[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar fontes de dados: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };
    
    loadSources();
  }, []);
  
  // Efeito para configurar e gerenciar conexão Socket.IO
  useEffect(() => {
    // Inicializar Socket.IO apenas uma vez
    if (!socketRef.current) {
      socketRef.current = io(API_URL);
      
      socketRef.current.on('connect', () => {
        console.log('Conectado ao servidor de dados em tempo real');
        setConnected(true);
        setError(null);
      });
      
      socketRef.current.on('connect_error', (err) => {
        console.error('Erro de conexão Socket.IO:', err);
        setConnected(false);
        setError(`Erro de conexão com o servidor: ${err.message}`);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Desconectado do servidor');
        setConnected(false);
      });
    }
    
    // Cleanup ao desmontar o componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  // Efeito para se inscrever em atualizações quando a fonte é selecionada
  useEffect(() => {
    if (!selectedSource || !socketRef.current || !connected) return;
    
    // Carregar dados iniciais
    const loadInitialData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/live/${selectedSource}`);
        if (!response.ok) {
          throw new Error(`Falha ao carregar dados de ${selectedSource}`);
        }
        
        const responseData = await response.json();
        if (responseData.success && responseData.data) {
          setLiveData(responseData.data);
        }
      } catch (err) {
        setError('Erro ao carregar dados iniciais: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    
    // Desinscrever de todos os canais
    if (socketRef.current) {
      sources.forEach(source => {
        socketRef.current?.emit('leaveChannel', source.id);
      });
      
      // Inscrever no canal selecionado
      socketRef.current.emit('joinLiveChannel', selectedSource);
      
      // Manipular atualizações ao vivo
      const handleLiveUpdate = (update: { type: string, data: LiveData }) => {
        if (update.type === selectedSource) {
          setLiveData(update.data);
        }
      };
      
      // Remover ouvinte anterior e adicionar novo
      socketRef.current.off('liveUpdate');
      socketRef.current.on('liveUpdate', handleLiveUpdate);
      
      // Solicitar dados atuais
      socketRef.current.emit('requestLiveData', { source: selectedSource });
    }
    
    loadInitialData();
  }, [selectedSource, connected, sources]);
  
  // Renderizar conteúdo com base na fonte selecionada
  const renderSourceContent = () => {
    if (!liveData) return <div className="p-4 text-center">Nenhum dado disponível</div>;
    
    switch (selectedSource) {
      case 'mercado':
        return renderStockData();
      case 'clima':
        return renderWeatherData();
      case 'noticias':
        return renderNewsData();
      default:
        return <div className="p-4">Selecione uma fonte de dados</div>;
    }
  };
  
  // Renderizador para dados de mercado
  const renderStockData = () => {
    if (!liveData || !liveData.data) return null;
    
    const stocks = liveData.data as StockData[];
    
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ticker</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Preço</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stocks.map((stock) => (
                <tr key={stock.ticker} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{stock.ticker}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    R$ {stock.price.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    {stock.change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {Math.abs(stock.change).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Adicionar o gráfico para visualização dos dados */}
        <LiveChart data={stocks} />
      </div>
    );
  };
  
  // Renderizador para dados de clima
  const renderWeatherData = () => {
    if (!liveData || !liveData.data) return null;
    
    const weather = liveData.data as WeatherData;
    
    return (
      <div className="p-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Condições Atuais</h3>
            <p className="text-lg mt-2">{weather.previsao}</p>
          </div>
          <div className="text-5xl">
            <FaCloudSun />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/20 p-4 rounded-lg">
            <h4 className="text-sm font-semibold uppercase">Temperatura</h4>
            <p className="text-3xl font-bold mt-1">{weather.temperatura}°C</p>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <h4 className="text-sm font-semibold uppercase">Umidade</h4>
            <p className="text-3xl font-bold mt-1">{weather.umidade}%</p>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-white/70">
          Última atualização: {new Date(liveData.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    );
  };
  
  // Renderizador para dados de notícias
  const renderNewsData = () => {
    if (!liveData || !liveData.data) return null;
    
    const news = liveData.data as NewsItem[];
    
    return (
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">{item.titulo}</h3>
              <span className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {formatTimeAgo(item.timestamp)}
            </p>
          </div>
        ))}
      </div>
    );
  };
  
  // Função auxiliar para formatar tempo relativo
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'há menos de um minuto';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    
    const days = Math.floor(hours / 24);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  };
  
  // Renderização do componente principal
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dados em Tempo Real</h1>
        <p className="text-gray-600">
          Visualize e interaja com informações atualizadas em tempo real.
          {connected ? (
            <span className="ml-2 text-green-600 inline-flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-600 mr-1 animate-pulse"></span>
              Conectado
            </span>
          ) : (
            <span className="ml-2 text-red-600 inline-flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-600 mr-1"></span>
              Desconectado
            </span>
          )}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <div className="col-span-1 md:col-span-4 flex justify-center items-center h-20">
            <FaSync className="animate-spin text-blue-500 mr-2" />
            <span>Carregando fontes de dados...</span>
          </div>
        ) : (
          sources.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                selectedSource === source.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
              }`}
            >
              {source.id === 'mercado' && <FaChartLine className="text-2xl mb-2" />}
              {source.id === 'clima' && <FaCloudSun className="text-2xl mb-2" />}
              {source.id === 'noticias' && <FaNewspaper className="text-2xl mb-2" />}
              <span className="font-medium">{source.name}</span>
            </button>
          ))
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedSource && sources.find(s => s.id === selectedSource)?.name}
          </h2>
          {liveData && (
            <div className="text-sm text-gray-500">
              Atualizado em: {new Date(liveData.lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSync className="animate-spin text-blue-500 mr-2" />
              <span>Carregando dados...</span>
            </div>
          ) : (
            renderSourceContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDataPage; 