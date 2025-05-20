import axios from 'axios';
import { OPENROUTER_API_KEY } from '../config';

interface Message {
  role: string;
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      reasoning?: string;  // Campo opcional para suportar respostas com reasoning
    };
  }>;
}

// Adicionar mapeamento de códigos para instruções
const languageInstructionsByCode: Record<string, string> = {
  'pt-BR': 'Responda sempre em português do Brasil. Adapte seu estilo para soar natural neste idioma.',
  'pt-PT': 'Responda sempre em português de Portugal. Adapte seu estilo para soar natural neste idioma.',
  'en': 'Always respond in English. Adapt your style to sound natural in this language.',
  'es': 'Responde siempre en español. Adapta tu estilo para sonar natural en este idioma.',
  'fr': 'Répondez toujours en français. Adaptez votre style pour avoir un son naturel dans cette langue.',
  'de': 'Antworten Sie immer auf Deutsch. Passen Sie Ihren Stil an, um in dieser Sprache natürlich zu klingen.',
  'it': 'Rispondi sempre in italiano. Adatta il tuo stile per suonare naturale in questa lingua.',
  'ru': 'Всегда отвечайте на русском языке. Адаптируйте свой стиль, чтобы звучать естественно на этом языке.',
  'zh': '始终用中文（普通话）回答。使你的风格在这种语言中听起来自然。',
  'ar': 'أجب دائمًا باللغة العربية. اجعل أسلوبك طبيعيًا بهذه اللغة.',
  'ja': '常に日本語で答えてください。この言語で自然に聞こえるようにスタイルを調整してください。',
  'hi': 'हमेशा हिंदी में उत्तर दें। इस भाषा में स्वाभाविक लगने के लिए अपनी शैली को अनुकूलित करें।',
  // Adicione outros idiomas conforme necessário
};

/**
 * Função simples para detectar o idioma da mensagem
 * @param text - O texto a ser analisado
 * @returns Idioma detectado com instrução para o modelo
 */
function detectLanguage(text: string): string {
  // Lista de palavras comuns em diferentes idiomas para detecção básica
  const commonWords = {
    portuguese: ['é', 'são', 'como', 'para', 'porque', 'qual', 'quem', 'onde', 'quando', 'como', 'nós', 'ele', 'ela', 'você', 'vocês', 'seu', 'sua', 'muito', 'pouco', 'sim', 'não', 'obrigado', 'por favor'],
    english: ['is', 'are', 'how', 'what', 'why', 'who', 'where', 'when', 'we', 'he', 'she', 'you', 'your', 'much', 'little', 'yes', 'no', 'thank', 'please'],
    spanish: ['es', 'son', 'cómo', 'para', 'porque', 'quién', 'dónde', 'cuándo', 'nosotros', 'él', 'ella', 'tú', 'usted', 'ustedes', 'su', 'mucho', 'poco', 'sí', 'no', 'gracias', 'por favor'],
    french: ['est', 'sont', 'comment', 'pourquoi', 'qui', 'où', 'quand', 'nous', 'il', 'elle', 'vous', 'votre', 'beaucoup', 'peu', 'oui', 'non', 'merci', 's\'il vous plaît'],
    german: ['ist', 'sind', 'wie', 'warum', 'wer', 'wo', 'wann', 'wir', 'er', 'sie', 'du', 'ihr', 'dein', 'viel', 'wenig', 'ja', 'nein', 'danke', 'bitte'],
    italian: ['è', 'sono', 'come', 'perché', 'chi', 'dove', 'quando', 'noi', 'lui', 'lei', 'voi', 'tu', 'tuo', 'molto', 'poco', 'sì', 'no', 'grazie', 'per favore'],
    // Adicione outros idiomas conforme necessário
  };

  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split(/\s+/);
  
  // Conta ocorrências de palavras comuns em cada idioma
  const scores: Record<string, number> = {};
  
  for (const [language, wordList] of Object.entries(commonWords)) {
    scores[language] = 0;
    
    for (const word of words) {
      if (wordList.includes(word)) {
        scores[language]++;
      }
    }
  }
  
  // Encontra o idioma com maior pontuação
  let detectedLanguage = 'english'; // Padrão
  let maxScore = 0;
  
  for (const [language, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = language;
    }
  }
  
  // Retorna a instrução para o idioma detectado ou em inglês se não foi detectado
  return languageInstructionsByCode[detectedLanguage] || languageInstructionsByCode.en;
}

/**
 * Função principal para interagir com o modelo DeepSeek via OpenRouter
 * @param question - A pergunta do usuário
 * @param responseLanguage - Código do idioma selecionado (opcional)
 * @param history - Histórico de mensagens anterior (opcional)
 * @returns Promise com a resposta do modelo
 * @throws Error em caso de falha na comunicação ou resposta inválida
 */
export async function askDeepSeek(question: string, responseLanguage?: string, history?: Array<{ role: string; content: string }>): Promise<string> {
  try {
    // Verifica se a pergunta é sobre times (Liz, Julia Pimentel ou Antonela Braga)
    const lowerQuestion = question.toLowerCase();
    if (
      (lowerQuestion.includes('time') || lowerQuestion.includes('equipe') || lowerQuestion.includes('qual')) &&
      (
        (lowerQuestion.includes('liz') && lowerQuestion.includes('julia pimentel')) ||
        lowerQuestion.includes('antonela braga') ||
        (lowerQuestion.includes('antonela') && lowerQuestion.includes('liz'))
      )
    ) {
      console.log('Pergunta sobre times detectada, respondendo TEAMANTONELA');
      return "TEAMANTONELA";
    }
    
    console.log('Iniciando requisição para a OpenRouter...');
    
    // Log para debug da chave (ocultando parte dela)
    const apiKey = OPENROUTER_API_KEY;
    console.log('API Key presente:', apiKey ? `${apiKey.substring(0, 10)}...` : 'não encontrada');
    
    if (!apiKey) {
      throw new Error('API key não encontrada nas configurações');
    }

    // Se responseLanguage for informado, usar a instrução correspondente
    let languageInstruction = '';
    if (responseLanguage && languageInstructionsByCode[responseLanguage]) {
      languageInstruction = languageInstructionsByCode[responseLanguage];
    } else {
      // Detectar o idioma e obter as instruções específicas
      languageInstruction = detectLanguage(question);
    }
    console.log('Idioma para resposta:', responseLanguage, 'Instrução:', languageInstruction);

    // Montar o array de mensagens, incluindo o histórico se disponível
    const messages: Array<{ role: string; content: string }> = [];

    // Adicionar a mensagem de sistema primeiro
    messages.push({
      role: 'system',
      content: `Você é um assistente útil e amigável. ${languageInstruction}`
    });

    // Adicionar histórico, se houver
    if (history && history.length > 0) {
      history.forEach(msg => {
        // Garantir que o histórico não inclua mensagens de sistema duplicadas ou vazias
        if (msg.role !== 'system' && msg.content && msg.content.trim() !== '') {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Adicionar a mensagem atual do usuário
    messages.push({
      role: 'user',
      content: question
    });

    const data = {
      model: 'deepseek/deepseek-r1-distill-llama-70b:free',
      messages: messages, // Usar o array de mensagens montado
      temperature: 0.7,
      max_tokens: 500
    };

    console.log('Dados da requisição:', JSON.stringify(data, null, 2));

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'JumboIA Assistant'
        }
      }
    );

    console.log('Resposta recebida:', JSON.stringify(response.data, null, 2));

    // Verificar o content e, se estiver vazio, verificar o reasoning
    const messageObj = response.data?.choices?.[0]?.message;
    if (!messageObj) {
      console.error('Resposta sem mensagem:', response.data);
      throw new Error('Resposta inválida do modelo');
    }

    // Usar o campo content se disponível, senão tentar o campo reasoning
    const responseText = messageObj.content || messageObj.reasoning;
    
    if (!responseText) {
      console.error('Resposta sem conteúdo válido:', response.data);
      throw new Error('Resposta inválida do modelo');
    }

    return responseText;

  } catch (error: any) {
    console.error('Erro ao comunicar com OpenRouter:', error);

    if (error.response?.data?.error) {
      console.log('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
      const errorMessage = error.response.data.error.message;
      
      if (errorMessage.includes('credits') || errorMessage.includes('max_tokens')) {
        throw new Error('Limite de tokens excedido. Por favor, tente uma mensagem mais curta.');
      }
      
      if (errorMessage.includes('JWT') || errorMessage.includes('token-invalid')) {
        throw new Error('Erro de autenticação. Por favor, verifique a chave da API.');
      }

      if (errorMessage.includes('model')) {
        throw new Error('Modelo indisponível no momento. Por favor, tente novamente mais tarde.');
      }

      throw new Error(errorMessage);
    }

    throw new Error('Não foi possível obter uma resposta. Por favor, tente novamente mais tarde.');
  }
}

/**
 * Função para humanizar um texto usando o modelo DeepSeek
 * @param textToHumanize - O texto original a ser humanizado
 * @returns Promise com o texto humanizado
 * @throws Error em caso de falha na comunicação ou resposta inválida
 */
export async function humanizeTextWithDeepSeek(textToHumanize: string): Promise<string> {
  try {
    console.log('Iniciando requisição para HUMANIZAR texto via OpenRouter...');
    
    // Detectar o idioma do texto e obter as instruções específicas
    const languageInstruction = detectLanguage(textToHumanize);
    
    const systemPrompt = `Você é um assistente especialista em reescrever textos para soarem mais naturais e humanos. Seu objetivo é tornar a comunicação menos formal e mais calorosa, mantendo o significado original. Evite jargões excessivos e prefira uma linguagem coloquial e amigável. ${languageInstruction}`;
    
    const data = {
      model: 'deepseek/deepseek-r1-distill-llama-70b:free',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Por favor, humanize o seguinte texto:\n\n"${textToHumanize}"`
        }
      ],
      temperature: 0.75, // Um pouco mais de criatividade pode ser bom aqui
      max_tokens: Math.max(50, textToHumanize.length + 100) // Garante espaço suficiente
    };

    console.log('Dados da requisição (Humanize):', JSON.stringify(data, null, 2));

    const response = await axios.post<ChatResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3001', // URL atualizada para porta 3001
          'X-Title': 'JumboIA Humanizer' // Título específico
        }
      }
    );

    console.log('Resposta recebida (Humanize):', JSON.stringify(response.data, null, 2));

    // Verificar o content e, se estiver vazio, verificar o reasoning
    const messageObj = response.data?.choices?.[0]?.message;
    if (!messageObj) {
      console.error('Resposta sem mensagem (Humanize):', response.data);
      throw new Error('Resposta inválida do modelo ao humanizar');
    }

    // Usar o campo content se disponível, senão tentar o campo reasoning
    const humanizedText = messageObj.content || messageObj.reasoning;
    
    if (!humanizedText) {
      console.error('Resposta sem conteúdo válido (Humanize):', response.data);
      throw new Error('Resposta inválida do modelo ao humanizar');
    }

    // Limpeza básica (remover aspas extras que o modelo pode adicionar)
    return humanizedText.trim().replace(/^"|"$/g, '');

  } catch (error: any) {
    // Reutiliza o tratamento de erro, mas com contexto diferente
    console.error('Erro ao comunicar com OpenRouter (Humanize):', error);
    if (error.response?.data?.error) {
      console.log('Detalhes do erro (Humanize):', JSON.stringify(error.response.data, null, 2));
      const errorMessage = error.response.data.error.message || 'Erro desconhecido da API';
       // Adapta as mensagens de erro se necessário
      if (errorMessage.includes('credits') || errorMessage.includes('max_tokens')) {
        throw new Error('Erro ao humanizar: Limite de tokens excedido.');
      }
      if (errorMessage.includes('JWT') || errorMessage.includes('token-invalid') || errorMessage.includes('No auth credentials')) {
        throw new Error('Erro de autenticação ao humanizar. Verifique a chave.');
      }
       throw new Error(`Erro da API ao humanizar: ${errorMessage}`);
    }
    throw new Error('Não foi possível humanizar o texto. Tente novamente.');
  }
} 

// Exportação padrão para facilitar imports
export default {
  askDeepSeek,
  humanizeTextWithDeepSeek
}; 