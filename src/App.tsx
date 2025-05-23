import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SplashScreen } from './components/SplashScreen';
import { Routes } from './routes';

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
    <div className="flex flex-col h-screen bg-white">
      {/* Conteúdo principal */}
      <main className="flex-grow overflow-hidden">
        <Routes />
      </main>
    </div>
  );
}

export default App; 