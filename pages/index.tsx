import React from 'react';
import VoiceChat from '../components/VoiceChat';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Conversa por Voz</h1>
      <VoiceChat />
    </div>
  );
}; 