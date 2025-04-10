import React, { useState } from 'react';

const VoiceChat: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      fetchResponse(speechToText);
    };
  }

  const handleListen = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    } else {
      console.error('Speech Recognition not supported in this browser.');
    }
  };

  const fetchResponse = async (text: string) => {
    try {
      const res = await fetch('/api/voice-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResponse(data.response);
      speakResponse(data.response);
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  const speakResponse = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    synth.speak(utterance);
  };

  return (
    <div className="p-4">
      <button onClick={handleListen} className="bg-blue-500 text-white p-2 rounded">
        {isListening ? 'Parar' : 'Falar'}
      </button>
      <p>Transcrição: {transcript}</p>
      <p>Resposta: {response}</p>
    </div>
  );
};

export default VoiceChat; 