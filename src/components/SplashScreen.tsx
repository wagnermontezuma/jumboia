import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    console.log("SplashScreen: useEffect iniciado");
    
    // Inicia o fade out após 2 segundos
    const fadeTimer = setTimeout(() => {
      console.log("SplashScreen: Iniciando fade out");
      setFadeOut(true);
    }, 2000);
    
    // Remove o splash após 3.5 segundos - tempo aumentado para garantir carregamento completo
    const finishTimer = setTimeout(() => {
      console.log("SplashScreen: Chamando onFinish");
      onFinish();
    }, 3500);

    return () => {
      console.log("SplashScreen: Limpando timers");
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  console.log("SplashScreen: Renderizando, fadeOut =", fadeOut);

  return (
    <div
      className={`fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        <p className="text-4xl font-bold text-green-600">JumboIA</p>
        <p className="text-lg text-blue-500 mt-2">by <span className="uppercase">Gotta</span></p>
      </div>
    </div>
  );
}; 