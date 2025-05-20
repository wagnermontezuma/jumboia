import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';

interface LiveButtonProps {
  className?: string;
}

const LiveButton: React.FC<LiveButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/live');
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${className}`}
      title="Dados em tempo real"
    >
      <FaChartBar className="text-white" />
      <span>Live</span>
    </button>
  );
};

export default LiveButton; 