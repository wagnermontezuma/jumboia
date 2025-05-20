import React from 'react';
import { mockMateriasData } from '../../data/mockBookData';
import BookCard from './BookCard';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BooksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="flex items-center text-jumbo-500 hover:text-jumbo-700 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Voltar ao Início
      </Link>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Livros Didáticos Interativos</h1>
      
      {mockMateriasData.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">Nenhum livro disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {mockMateriasData.map((materia) => (
            <BookCard key={materia.id} materia={materia} />
          ))}
        </div>
      )}
      
      {/* Seção Adicional: Como Funciona ou Dicas */}
      <div className="mt-16 p-6 bg-gray-100 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Como Explorar os Livros</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Clique em uma matéria para ver os anos escolares disponíveis.</li>
          <li>Escolha um ano escolar para visualizar os tópicos de estudo.</li>
          <li>Cada tópico oferece conteúdo explicativo, exemplos e atividades.</li>
          <li>Teste seus conhecimentos com as atividades de múltipla escolha!</li>
        </ul>
      </div>
    </div>
  );
};

export default BooksPage; 