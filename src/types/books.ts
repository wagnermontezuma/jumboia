export interface Atividade {
  id: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number; // Índice da opção correta
  imagemOpcionalUrl?: string;
}

export interface Topico {
  id: string;
  titulo: string;
  conteudoHTML: string; // Conteúdo em HTML para permitir formatação rica
  imagensIlustrativasUrls: string[];
  atividades: Atividade[];
}

export interface AnoEscolar {
  id: string;
  nome: string; // Ex: "1º Ano Fundamental", "3º Ano Médio"
  topicos: Topico[];
}

export interface Materia {
  id: string;
  nome: string; // Ex: "Matemática", "Português"
  imagemCapaUrl: string;
  anosEscolares: AnoEscolar[];
  corTema?: string; // Cor para usar nos cards e detalhes da matéria
}

// No futuro, podemos expandir isso com mais detalhes 