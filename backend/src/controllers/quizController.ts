import { Request, Response } from 'express';
import * as quizService from '../services/quizService';

/**
 * Handler para gerar um novo quiz
 */
export async function generateQuiz(req: Request, res: Response) {
  try {
    const { 
      topic, 
      questionCount = 5, 
      timeLimit = 15,
      includeImages = false,
      imageCount = questionCount, // Por padrão, todas as questões teriam imagens se includeImages for true
      questionType = 'multiple_choice'
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'O tópico é obrigatório' });
    }

    // Validações adicionais
    if (questionCount < 1 || questionCount > 20) {
      return res.status(400).json({ error: 'O número de questões deve estar entre 1 e 20' });
    }
    
    // Validar imageCount
    const validImageCount = Math.min(imageCount, questionCount);
    
    console.log(`Gerando quiz: ${topic} - ${questionCount} questões, ${includeImages ? validImageCount : 0} com imagens, tipo: ${questionType}`);
    
    const quiz = await quizService.generateQuiz(
      topic, 
      questionCount, 
      timeLimit,
      includeImages,
      questionType,
      validImageCount
    );
    
    res.json(quiz);
  } catch (error) {
    console.error('Erro ao gerar quiz:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro interno ao gerar quiz' 
    });
  }
}

/**
 * Handler para obter um quiz existente
 */
export async function getQuiz(req: Request, res: Response) {
  try {
    const quizId = parseInt(req.params.quizId);
    
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const quiz = await quizService.getQuiz(quizId);
    res.json(quiz);
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    
    if (error instanceof Error && error.message === 'Quiz não encontrado') {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }
    
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro interno ao buscar quiz' 
    });
  }
}

/**
 * Handler para submeter respostas para um quiz
 */
export async function submitQuiz(req: Request, res: Response) {
  try {
    const quizId = parseInt(req.params.quizId);
    const { answers } = req.body;
    
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Respostas são obrigatórias' });
    }
    
    const result = await quizService.submitQuiz(quizId, answers);
    res.json(result);
  } catch (error) {
    console.error('Erro ao submeter quiz:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Quiz não encontrado') {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      
      if (error.message === 'Limite de tentativas excedido para este quiz') {
        return res.status(400).json({ error: 'Limite de tentativas excedido' });
      }
    }
    
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro interno ao submeter quiz' 
    });
  }
} 