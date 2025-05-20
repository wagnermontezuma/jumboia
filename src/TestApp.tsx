import React, { useEffect } from 'react';

function TestApp() {
  console.log("TestApp: Renderizando versão simplificada e reduzida");
  
  useEffect(() => {
    console.log("TestApp: useEffect inicial");
  }, []);
  
  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-green-600 mb-4">JumboIA - Modo Teste</h1>
      <p className="text-gray-600 mb-4">
        Esta é uma versão simplificada do aplicativo para fins de diagnóstico.
      </p>
      <div className="bg-green-100 p-4 rounded mb-4">
        <p className="text-green-800">
          Se você está vendo esta tela, significa que o componente App principal 
          está com problemas. Use o console do navegador para verificar os erros.
        </p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
      >
        Atualizar Página
      </button>
    </div>
  );
}

export default TestApp; 