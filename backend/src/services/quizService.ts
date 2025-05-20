import { PrismaClient } from '../generated/prisma';
import axios from 'axios';

const prisma = new PrismaClient();

interface QuizQuestion {
  text: string;
  choices: string[];
  correctChoice: string;
}

interface QuizAnswers {
  [questionId: string]: string;
}

/**
 * Gera e persiste um quiz usando IA com base em um tópico
 */
export async function generateQuiz(
  topic: string, 
  questionCount: number = 5, 
  timeLimit: number = 15,
  includeImages: boolean = false,
  questionType: string = 'multiple_choice',
  imageCount: number = questionCount // Por padrão, todas as questões teriam imagens
): Promise<{
  quizId: number;
  questions: Omit<QuizQuestion & { id: number }, 'correctChoice'>[];
}> {
  try {
    console.log('DEBUG Iniciando generateQuiz para tópico:', topic);
    console.log(`Configurações: ${questionCount} questões, ${includeImages ? 'com' : 'sem'} imagens, tipo: ${questionType}`);
    
    // Criar o prompt para a IA gerar questões de múltipla escolha
    let prompt = `Gere ${questionCount} perguntas de múltipla escolha sobre o tema: ${topic}.`;
    
    // Adicionar instrução sobre imagens, se solicitado
    if (includeImages) {
      prompt += `\nDescreva uma imagem relevante para cada pergunta que facilite a compreensão ou ilustre o conceito sendo testado.`;
    }
    
    prompt += `\nPara cada pergunta, forneça:
1. O texto da pergunta
2. 4 opções de resposta (A, B, C, D)
3. A letra da resposta correta (apenas A, B, C ou D)
${includeImages ? '4. Descrição detalhada de uma imagem que se relaciona com a pergunta' : ''}

Responda no seguinte formato JSON:
[
  {
    "question": "Texto da pergunta 1?",
    "options": ["A) Opção A", "B) Opção B", "C) Opção C", "D) Opção D"],
    "correctOption": "A"${includeImages ? ',\n    "imageDescription": "Descrição detalhada da imagem para a pergunta 1"' : ''}
  },
  ...
]`;

    // Chamar a API do OpenRouter (DeepSeek)
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'JumboIA Quiz Generator'
        }
      }
    );

    // Extrair o conteúdo da resposta
    const content = response.data.choices[0].message.content;
    console.log('DEBUG raw content IA:', content);
    let questionsData;
    
    try {
      // Tentar fazer parse do JSON retornado
      const parsedContent = JSON.parse(content);
      questionsData = parsedContent.questions || parsedContent;
    } catch (e) {
      // Se falhar, tentar extrair JSON da string
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        questionsData = JSON.parse(match[0]);
      } else {
        throw new Error('Não foi possível extrair o JSON da resposta');
      }
    }

    console.log('DEBUG parsed questionsData:', JSON.stringify(questionsData, null, 2));
    // Verificar se temos perguntas válidas
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error('A API não retornou perguntas no formato esperado');
    }

    // Armazenar rawQuestions e filtrar perguntas com opções
    const rawQuestions: any[] = questionsData;
    console.log('DEBUG rawQuestions count:', rawQuestions.length);
    const validQuestions = rawQuestions.filter((q, idx) => {
      const arr = Array.isArray(q.options)
        ? q.options
        : Array.isArray(q.choices)
        ? q.choices
        : Object.values(q).find(v => Array.isArray(v));
      const choicesArr = Array.isArray(arr) ? (arr as any[]) : [];
      if (choicesArr.length === 0) {
        console.warn(`Ignorando pergunta inválida [${idx}]: sem opções válidas`, q);
        return false;
      }
      return true;
    });
    if (validQuestions.length === 0) {
      throw new Error('Nenhuma pergunta válida gerada pela API');
    }
    console.log('DEBUG validQuestions count:', validQuestions.length, validQuestions);

    // Gerar imagens para as questões, se solicitado
    if (includeImages) {
      console.log(`Gerando imagens para ${imageCount} questões...`);
      // Verificar se o OpenAI client está disponível
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.warn('OPENAI_API_KEY não disponível. As imagens não serão geradas.');
      } else {
        // Importar OpenAI dinamicamente para evitar problemas de inicialização
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        // Limitar o número de questões com imagens
        const questionsWithImages = Math.min(imageCount, validQuestions.length);
        console.log(`Gerando imagens para as primeiras ${questionsWithImages} questões de ${validQuestions.length} totais`);
        
        // Gerar imagens apenas para o número especificado de questões
        for (let i = 0; i < questionsWithImages; i++) {
          const q = validQuestions[i];
          if (q.imageDescription) {
            try {
              console.log(`Gerando imagem para questão ${i+1}...`);
              const response = await openai.images.generate({
                prompt: q.imageDescription,
                model: "dall-e-2",
                n: 1,
                size: "1024x1024"
              });
              
              if (response.data && response.data.length > 0) {
                // Adicionar URL da imagem à questão
                validQuestions[i].imageUrl = response.data[0].url;
                console.log(`Imagem gerada com sucesso para questão ${i+1}`);
              } else {
                console.warn(`Sem dados de imagem para questão ${i+1}`);
              }
            } catch (err) {
              console.error(`Erro ao gerar imagem para questão ${i+1}:`, err);
              // Continuar mesmo se houver erro na geração da imagem
            }
          }
        }
      }
    }

    // Criar um novo quiz no banco de dados
    const quiz = await prisma.quiz.create({ data: { topic } });

    // Criar as perguntas associadas ao quiz
    const createdQuestions = await Promise.all(
      validQuestions.map(async (q: any, idx: number) => {
        const text = q.question || q.text || '';
        // Extrair opções (choices) como qualquer array de strings no objeto
        let choices: string[] = [];
        const arrCandidates = Object.entries(q).filter(
          ([,v]) => Array.isArray(v) && (v as any[]).every(el => typeof el === 'string')
        );
        if (q.options && Array.isArray(q.options)) {
          choices = q.options;
        } else if (q.choices && Array.isArray(q.choices)) {
          choices = q.choices;
        } else if (arrCandidates.length > 0) {
          choices = arrCandidates[0][1] as string[];
        }
        const correctChoice = q.correctOption || q.correctChoice || '';
        
        // Adicionar URL da imagem ao texto da questão, se disponível
        let questionText = text;
        if (q.imageUrl) {
          questionText = `${text}\n\n[IMAGE:${q.imageUrl}]`;
        }
        
        console.log(`DEBUG Criando pergunta [${idx + 1}]: text='${questionText}', choices=${JSON.stringify(choices)}, correct='${correctChoice}'`);

        return prisma.question.create({
          data: { quizId: quiz.id, text: questionText, choices, correctChoice },
        });
      })
    );

    // Retornar ID e perguntas sem respostas
    return { quizId: quiz.id, questions: createdQuestions.map(q => ({ id: q.id, text: q.text, choices: q.choices as string[] })) };
  } catch (error) {
    console.error('Erro ao gerar quiz:', error);
    throw new Error(`Falha ao gerar quiz: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Busca um quiz pelo ID (sem revelar as respostas corretas)
 */
export async function getQuiz(quizId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
    },
  });

  if (!quiz) {
    throw new Error('Quiz não encontrado');
  }

  // Remover as respostas corretas das perguntas
  return {
    id: quiz.id,
    topic: quiz.topic,
    createdAt: quiz.createdAt,
    questions: quiz.questions.map(q => ({
      id: q.id,
      text: q.text,
      choices: q.choices as string[],
    })),
  };
}

/**
 * Submete e avalia as respostas de um quiz
 */
export async function submitQuiz(
  quizId: number,
  answers: QuizAnswers
): Promise<{
  score: number;
  feedback: string;
  correctAnswers: Record<number, string>;
  totalQuestions: number;
}> {
  // Verificar se o quiz existe
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      attempts: true,
    },
  });

  if (!quiz) {
    throw new Error('Quiz não encontrado');
  }

  // Verificar limite de tentativas (3)
  if (quiz.attempts.length >= 3) {
    throw new Error('Limite de tentativas excedido para este quiz');
  }

  // Calcular a pontuação
  let correctCount = 0;
  const correctAnswers: Record<number, string> = {};
  
  quiz.questions.forEach(question => {
    correctAnswers[question.id] = question.correctChoice as string;
    
    if (answers[question.id] === question.correctChoice) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const score = (correctCount / totalQuestions) * 100;

  // Registrar a tentativa
  await prisma.attempt.create({
    data: {
      quizId,
      answers,
      score,
      submittedAt: new Date(),
    },
  });

  // Gerar feedback personalizado usando IA
  const feedback = await generateFeedback(
    quiz.topic,
    score,
    correctCount,
    totalQuestions
  );

  return {
    score,
    feedback,
    correctAnswers,
    totalQuestions,
  };
}

/**
 * Gera feedback personalizado usando IA
 */
async function generateFeedback(
  topic: string,
  score: number,
  correctCount: number,
  totalQuestions: number
): Promise<string> {
  try {
    const prompt = `Um estudante acabou de completar um quiz sobre ${topic}. 
Ele acertou ${correctCount} de ${totalQuestions} questões, obtendo uma pontuação de ${score.toFixed(1)}%.
Por favor, forneça um feedback construtivo e motivador para este estudante, baseado neste desempenho.
Destaque os pontos positivos, áreas para melhoria, e algumas dicas para que ele possa aprofundar seu conhecimento sobre ${topic}.
O feedback deve ser escrito em linguagem amigável e encorajadora, com no máximo 3 parágrafos.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'JumboIA Quiz Feedback'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar feedback:', error);
    
    // Feedback padrão em caso de erro
    if (score >= 80) {
      return `Excelente trabalho! Você acertou ${correctCount} de ${totalQuestions} questões sobre ${topic}. Continue assim!`;
    } else if (score >= 60) {
      return `Bom trabalho! Você acertou ${correctCount} de ${totalQuestions} questões sobre ${topic}. Continue estudando para melhorar ainda mais.`;
    } else {
      return `Você acertou ${correctCount} de ${totalQuestions} questões sobre ${topic}. Recomendamos revisar este tópico e tentar novamente depois!`;
    }
  }
} 