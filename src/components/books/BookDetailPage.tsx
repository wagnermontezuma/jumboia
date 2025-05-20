import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockMateriasData } from '../../data/mockBookData';
import { Materia, AnoEscolar, Topico, Atividade } from '../../types/books';
import { ArrowLeft, BookOpen, GraduationCap, Check, X } from 'lucide-react';

const BookDetailPage: React.FC = () => {
  const { materiaId } = useParams<{ materiaId: string }>();
  const [materia, setMateria] = useState<Materia | null>(null);
  const [selectedAno, setSelectedAno] = useState<AnoEscolar | null>(null);
  const [selectedTopico, setSelectedTopico] = useState<Topico | null>(null);
  const [modoAtividade, setModoAtividade] = useState(false);
  const [respostasUsuario, setRespostasUsuario] = useState<Record<string, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  useEffect(() => {
    // Buscar a matéria correspondente ao ID
    const materiaEncontrada = mockMateriasData.find(m => m.id === materiaId);
    if (materiaEncontrada) {
      setMateria(materiaEncontrada);
      // Se tiver anos escolares, selecionar o primeiro por padrão
      if (materiaEncontrada.anosEscolares.length > 0) {
        setSelectedAno(materiaEncontrada.anosEscolares[0]);
      }
    }
  }, [materiaId]);

  // Verificar se há uma resposta do usuário para a atividade específica
  const temResposta = (atividadeId: string): boolean => {
    return respostasUsuario[atividadeId] !== undefined;
  };

  // Verificar se a resposta está correta
  const respostaCorreta = (atividade: Atividade): boolean => {
    return respostasUsuario[atividade.id] === atividade.respostaCorreta;
  };

  // Selecionar resposta
  const selecionarResposta = (atividadeId: string, respostaIndex: number) => {
    if (!mostrarResultado) { // Só permite selecionar se não estiver mostrando resultados
      setRespostasUsuario(prev => ({
        ...prev,
        [atividadeId]: respostaIndex
      }));
    }
  };

  // Calcular pontuação
  const calcularPontuacao = (): { acertos: number, total: number } => {
    if (!selectedTopico) return { acertos: 0, total: 0 };
    
    const total = selectedTopico.atividades.length;
    const acertos = selectedTopico.atividades.filter(a => 
      respostasUsuario[a.id] === a.respostaCorreta
    ).length;
    
    return { acertos, total };
  };

  // Recomeçar atividades
  const recomecarAtividades = () => {
    setRespostasUsuario({});
    setMostrarResultado(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/livros" className="flex items-center text-jumbo-500 hover:text-jumbo-700 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Voltar aos Livros
      </Link>
      
      {materia ? (
        <>
          <div className={`p-6 rounded-lg shadow-md mb-8 ${materia.corTema || 'bg-jumbo-500'}`}>
            <h1 className="text-3xl font-bold text-white mb-2">{materia.nome}</h1>
            <p className="text-white text-opacity-90">
              {materia.anosEscolares.length} {materia.anosEscolares.length === 1 ? 'ano escolar disponível' : 'anos escolares disponíveis'}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Barra lateral com anos escolares */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <GraduationCap className="mr-2" />
                  Anos Escolares
                </h2>
                <ul className="space-y-2">
                  {materia.anosEscolares.map(ano => (
                    <li 
                      key={ano.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        selectedAno && selectedAno.id === ano.id 
                          ? `${materia.corTema || 'bg-jumbo-500'} text-white` 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedAno(ano);
                        setSelectedTopico(null);
                        setModoAtividade(false);
                        setRespostasUsuario({});
                        setMostrarResultado(false);
                      }}
                    >
                      {ano.nome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Conteúdo principal */}
            <div className="md:w-3/4">
              {selectedAno && !selectedTopico && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">{selectedAno.nome}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAno.topicos.map(topico => (
                      <div 
                        key={topico.id} 
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTopico(topico)}
                      >
                        <div className="flex items-start">
                          <BookOpen className={`mr-3 ${materia?.corTema?.replace('bg-', 'text-') || 'text-jumbo-500'}`} size={24} />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{topico.titulo}</h3>
                            <p className="text-sm text-gray-600">
                              {topico.atividades.length} {topico.atividades.length === 1 ? 'atividade' : 'atividades'} disponível
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTopico && !modoAtividade && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedTopico(null)} 
                      className="text-jumbo-500 hover:text-jumbo-700 flex items-center"
                    >
                      <ArrowLeft size={16} className="mr-1" />
                      Voltar
                    </button>
                    
                    <button 
                      onClick={() => setModoAtividade(true)}
                      className={`${materia?.corTema || 'bg-jumbo-500'} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity`}
                    >
                      Praticar Atividades
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">{selectedTopico.titulo}</h2>
                  
                  <div 
                    className="prose max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: selectedTopico.conteudoHTML }}
                  />
                  
                  {selectedTopico.imagensIlustrativasUrls.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Materiais de Apoio</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedTopico.imagensIlustrativasUrls.map((url, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <img 
                              src={url} 
                              alt={`Ilustração ${index + 1} para ${selectedTopico.titulo}`} 
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedTopico && modoAtividade && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <button 
                      onClick={() => {
                        setModoAtividade(false);
                        setRespostasUsuario({});
                        setMostrarResultado(false);
                      }} 
                      className="text-jumbo-500 hover:text-jumbo-700 flex items-center"
                    >
                      <ArrowLeft size={16} className="mr-1" />
                      Voltar ao Conteúdo
                    </button>
                    
                    {mostrarResultado && (
                      <button 
                        onClick={recomecarAtividades}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Tentar Novamente
                      </button>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Atividades: {selectedTopico.titulo}</h2>
                  
                  <p className="text-gray-600 mb-6">
                    {mostrarResultado 
                      ? `Você acertou ${calcularPontuacao().acertos} de ${calcularPontuacao().total} questões` 
                      : 'Selecione a resposta correta para cada pergunta'}
                  </p>
                  
                  <div className="space-y-8">
                    {selectedTopico.atividades.map((atividade, index) => (
                      <div key={atividade.id} className="border rounded-lg p-5">
                        <h3 className="text-lg font-semibold mb-3">
                          {index + 1}. {atividade.pergunta}
                        </h3>
                        
                        {atividade.imagemOpcionalUrl && (
                          <div className="mb-4">
                            <img 
                              src={atividade.imagemOpcionalUrl}
                              alt="Imagem da atividade"
                              className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {atividade.opcoes.map((opcao, optIndex) => (
                            <div 
                              key={optIndex}
                              onClick={() => selecionarResposta(atividade.id, optIndex)}
                              className={`
                                p-3 rounded-md cursor-pointer transition-colors flex items-center justify-between
                                ${!mostrarResultado && respostasUsuario[atividade.id] === optIndex ? `${materia?.corTema || 'bg-jumbo-500'} text-white` : 'border hover:bg-gray-50'}
                                ${mostrarResultado && optIndex === atividade.respostaCorreta ? 'bg-green-100 border-green-300' : ''}
                                ${mostrarResultado && respostasUsuario[atividade.id] === optIndex && optIndex !== atividade.respostaCorreta ? 'bg-red-100 border-red-300' : ''}
                              `}
                            >
                              <span>{opcao}</span>
                              
                              {mostrarResultado && optIndex === atividade.respostaCorreta && (
                                <Check className="text-green-600" size={20} />
                              )}
                              
                              {mostrarResultado && respostasUsuario[atividade.id] === optIndex && optIndex !== atividade.respostaCorreta && (
                                <X className="text-red-600" size={20} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!mostrarResultado && (
                    <button 
                      onClick={() => setMostrarResultado(true)}
                      className={`mt-6 ${materia?.corTema || 'bg-jumbo-500'} text-white px-6 py-3 rounded-md hover:opacity-90 transition-opacity w-full`}
                      disabled={selectedTopico.atividades.some(a => !temResposta(a.id))}
                    >
                      Verificar Respostas
                    </button>
                  )}
                  
                  {mostrarResultado && (
                    <div className={`mt-6 p-4 rounded-lg ${
                      calcularPontuacao().acertos === calcularPontuacao().total 
                        ? 'bg-green-100 border border-green-300' 
                        : calcularPontuacao().acertos >= calcularPontuacao().total / 2
                          ? 'bg-yellow-100 border border-yellow-300'
                          : 'bg-red-100 border border-red-300'
                    }`}>
                      <h3 className="font-bold text-lg mb-2">
                        {calcularPontuacao().acertos === calcularPontuacao().total 
                          ? '🎉 Parabéns! Você acertou todas as questões!' 
                          : calcularPontuacao().acertos >= calcularPontuacao().total / 2
                            ? '👍 Bom trabalho! Continue praticando.'
                            : '📚 Continue estudando! A prática leva à perfeição.'}
                      </h3>
                      <p>
                        Sua pontuação: <span className="font-bold">{calcularPontuacao().acertos}/{calcularPontuacao().total}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Matéria não encontrada</h2>
          <p className="text-gray-600 mb-6">
            A matéria que você está procurando não existe ou foi removida.
          </p>
          <Link 
            to="/livros" 
            className="px-4 py-2 bg-jumbo-500 text-white rounded-md hover:bg-jumbo-600 transition-colors"
          >
            Voltar para Livros
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage; 