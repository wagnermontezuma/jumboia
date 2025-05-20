import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ChatPage from './components/ChatPage';
import { SplashScreen } from './components/SplashScreen';

function App() {
  const { t } = useTranslation();
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
  
  // Esconde o splash screen após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashScreenVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Renderiza splash screen se necessário
  if (isSplashScreenVisible) {
    return <SplashScreen onFinish={() => setIsSplashScreenVisible(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#e0f0e0]">
      {/* Cabeçalho */}
      <header className="bg-[#e0f0e0] py-2 border-b border-green-200">
        <div className="container mx-auto flex items-center justify-center">
          <h1 className="text-2xl font-light text-green-600">
            JumboIA <span className="text-sm font-light text-green-500">by GOTTA</span>
          </h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow overflow-hidden">
        <ChatPage />
      </main>
    </div>
  );
}

export default App; 