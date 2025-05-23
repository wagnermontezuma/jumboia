import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLoader, FiClock, FiBook, FiCheckCircle, FiX, FiArrowLeft } from 'react-icons/fi';

// URL fixa do backend
const API_URL = 'http://localhost:3001';

// Lista de matérias disponíveis
const MATERIAS = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Física',
  'Química',
  'Biologia',
  'Literatura',
  'Inglês'
];

interface SimuladoFormData {
  materia: string;
  assuntos: string[];
  assuntoInput: string;
}

export const SimuladoPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SimuladoFormData>({
    materia: '',
    assuntos: [],
    assuntoInput: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manipular mudança na matéria selecionada
  const handleMateriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      materia: e.target.value
    });
  };

  // Manipular mudança no campo de assunto
  const handleAssuntoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      assuntoInput: e.target.value
    });
  };

  // Adicionar um assunto à lista
  const handleAddAssunto = () => {
    if (!formData.assuntoInput.trim()) {
      setError('Digite um assunto válido');
      return;
    }

    if (formData.assuntos.length >= 4) {
      setError('Você já selecionou o número máximo de 4 assuntos');
      return;
    }

    if (formData.assuntos.includes(formData.assuntoInput.trim())) {
      setError('Este assunto já foi adicionado');
      return;
    }

    setFormData({
      ...formData,
      assuntos: [...formData.assuntos, formData.assuntoInput.trim()],
      assuntoInput: ''
    });
    setError(null);
  };

  // Remover um assunto da lista
  const handleRemoveAssunto = (assunto: string) => {
    setFormData({
      ...formData,
      assuntos: formData.assuntos.filter(a => a !== assunto)
    });
  };

  // Validar formulário
  const isFormValid = () => {
    return formData.materia !== '' && formData.assuntos.length === 4;
  };

  // Criar simulado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Selecione uma matéria e 4 assuntos para criar o simulado');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess('Pesquisando assuntos e preparando simulado...');
    
    try {
      // Passo 1: Fazer pesquisa sobre os assuntos
      const temaCompleto = `${formData.materia}: ${formData.assuntos.join(', ')}`;
      
      const pesquisaResponse = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: `Faça uma pesquisa educacional resumida sobre: ${temaCompleto}. Foque nos principais conceitos.`
        }),
      });
      
      if (!pesquisaResponse.ok) {
        throw new Error('Erro ao pesquisar os assuntos');
      }
      
      await pesquisaResponse.json();
      
      setSuccess('Gerando simulado com questões ilustradas...');
      
      // Passo 2: Gerar o simulado com imagens e questões de múltipla escolha
      const response = await fetch(`${API_URL}/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: temaCompleto,
          questionCount: 15, // Total de 15 questões
          timeLimit: 15, // minutos
          includeImages: true, // Solicitar imagens
          imageCount: 5, // Apenas 5 questões terão imagens
          questionType: 'multiple_choice' // Garantir que são de múltipla escolha
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao conectar com o servidor' }));
        throw new Error(errorData.error || 'Erro ao gerar simulado');
      }
      
      const data = await response.json().catch(() => {
        throw new Error('Resposta inválida do servidor');  
      });
      
      if (!data || !data.quizId) {
        throw new Error('Resposta incompleta do servidor');
      }
      
      setSuccess('Simulado criado com sucesso! Você será redirecionado em instantes...');
      
      // Redirecionar para a página do simulado após 2 segundos
      setTimeout(() => {
        navigate(`/quizzes/${data.quizId}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Erro ao gerar simulado:', err);
      setError(err.message || 'Erro ao conectar com o servidor');
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 simulado-page">
      {/* Botão de voltar */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-jumbo hover:text-jumbo-dark mb-4 transition-colors"
      >
        <FiArrowLeft className="mr-2" size={20} />
        Voltar ao Início
      </button>
      
      <h1 className="text-2xl font-bold text-center mb-6 text-jumbo">Criar Simulado</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center text-jumbo mb-4">
          <FiBook className="mr-2 h-5 w-5" />
          <h2 className="text-xl font-semibold">Novo Simulado Personalizado</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-1">
              Matéria <span className="text-red-500">*</span>
            </label>
            <select
              id="materia"
              value={formData.materia}
              onChange={handleMateriaChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jumbo"
              disabled={isLoading}
            >
              <option value="">Selecione uma matéria</option>
              {MATERIAS.map(materia => (
                <option key={materia} value={materia}>{materia}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="assuntos" className="block text-sm font-medium text-gray-700 mb-1">
              Assuntos <span className="text-red-500">*</span> 
              <span className="text-gray-500 text-xs ml-2">
                (Selecione exatamente 4 assuntos)
              </span>
            </label>
            
            <div className="flex">
              <input
                type="text"
                id="assuntos"
                value={formData.assuntoInput}
                onChange={handleAssuntoInputChange}
                placeholder="Digite um assunto e adicione"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-jumbo"
                disabled={isLoading || formData.assuntos.length >= 4}
              />
              <button
                type="button"
                onClick={handleAddAssunto}
                disabled={isLoading || !formData.assuntoInput.trim() || formData.assuntos.length >= 4}
                className="px-4 py-2 bg-jumbo text-white rounded-r-md hover:bg-jumbo/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
            
            <div className="mt-2">
              {formData.assuntos.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  Nenhum assunto selecionado. Adicione 4 assuntos.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2 mt-2">
                  {formData.assuntos.map(assunto => (
                    <li 
                      key={assunto} 
                      className="bg-jumbo/10 text-jumbo px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{assunto}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssunto(assunto)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        disabled={isLoading}
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Informações do Simulado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <FiCheckCircle className="text-jumbo mr-2" />
                <span className="text-gray-600">15 questões (5 ilustradas)</span>
              </div>
              <div className="flex items-center">
                <FiClock className="text-jumbo mr-2" />
                <span className="text-gray-600">15 minutos</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Nota média: 6,0</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Cada questão vale 0,67 pontos</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full px-4 py-2 bg-jumbo text-white font-medium rounded-md hover:bg-jumbo/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                Criando Simulado...
              </span>
            ) : (
              'Criar Simulado'
            )}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Como Funciona o Simulado?</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Selecione uma matéria e 4 assuntos específicos para o simulado.</li>
          <li>A IA fará uma pesquisa sobre os assuntos e gerará um contexto educacional.</li>
          <li>Com base nos conceitos pesquisados, serão criadas 15 questões de múltipla escolha.</li>
          <li>5 dessas questões terão imagens relacionadas ao conteúdo para facilitar a compreensão.</li>
          <li>Você terá 15 minutos para completar todo o simulado.</li>
          <li>Cada questão vale 0,67 pontos, totalizando 10 pontos.</li>
          <li>A nota média para aprovação é 6,0.</li>
          <li>Ao finalizar, você receberá feedback detalhado sobre seu desempenho.</li>
        </ol>
      </div>
    </div>
  );
}; 