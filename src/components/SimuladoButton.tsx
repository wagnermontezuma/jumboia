import { FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface SimuladoButtonProps {
  active?: boolean;
}

export const SimuladoButton = ({ active = false }: SimuladoButtonProps) => {
  return (
    <Link 
      to="/simulado"
      className={`
        flex items-center justify-center p-2.5 rounded-lg
        ${active ? 'bg-jumbo text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} 
        shadow-sm transition-all duration-200
      `}
      title="Criar Simulado"
    >
      <FiFileText className="w-6 h-6" />
    </Link>
  );
}; 