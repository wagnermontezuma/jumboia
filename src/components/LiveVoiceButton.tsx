import React from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface LiveVoiceButtonProps {
  className?: string;
}

const LiveVoiceButton: React.FC<LiveVoiceButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/voice');
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 bg-jumbo hover:bg-jumbo/90 text-white rounded-md transition-all duration-200 shadow-md hover:shadow-lg ${className || ''}`}
      title="Conversar por voz com JumboIA"
    >
      <FaMicrophone className="text-white" />
      <span>Live</span>
    </button>
  );
};

export default LiveVoiceButton; 