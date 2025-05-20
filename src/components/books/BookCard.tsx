import React from 'react';
import { Link } from 'react-router-dom';
import { Materia } from '../../types/books';

interface BookCardProps {
  materia: Materia;
}

const BookCard: React.FC<BookCardProps> = ({ materia }) => {
  const themeColor = materia.corTema || 'bg-gray-500';

  return (
    <Link to={`/livros/${materia.id}`} className="block group">
      <div className={`rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${themeColor}`}>
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${materia.imagemCapaUrl || '/images/placeholder_book_cover.png'})` }}
        >
          {/* Overlay sutil para melhorar a legibilidade do texto, se necessário no futuro */}
          {/* <div className="absolute inset-0 bg-black opacity-20"></div> */}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-white mb-2 truncate group-hover:text-yellow-300">{materia.nome}</h3>
          <p className="text-sm text-gray-200 mb-1">
            {materia.anosEscolares.length} ano(s) escolar(es) disponível(is).
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
              Ver conteúdo
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard; 