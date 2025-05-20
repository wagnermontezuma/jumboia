import { Materia } from '../types/books';

export const mockMateriasData: Materia[] = [
  {
    id: 'matematica',
    nome: 'Matemática',
    imagemCapaUrl: '/images/books/capa_matematica.png', // Placeholder
    corTema: 'bg-blue-500',
    anosEscolares: [
      {
        id: 'mat_1_fund',
        nome: '1º Ano Fundamental',
        topicos: [
          {
            id: 'mat_1_fund_numeros',
            titulo: 'Conhecendo os Números de 0 a 10',
            conteudoHTML: '<p>Nesta aula, vamos aprender a contar e reconhecer os números de zero a dez. Os números nos ajudam a saber quantos objetos temos!</p> <p><strong>Exemplos:</strong> Uma bola (1), duas maçãs (2), três lápis (3).</p>',
            imagensIlustrativasUrls: ['/images/books/mat_numeros_1.png', '/images/books/mat_numeros_2.png'], // Placeholders
            atividades: [
              {
                id: 'atv1_mat_1_fund_numeros',
                pergunta: 'Quantas estrelas você vê na imagem?',
                // Supondo que a imagem '/images/books/atividade_estrelas_3.png' mostre 3 estrelas
                imagemOpcionalUrl: '/images/books/atividade_estrelas_3.png',
                opcoes: ['1 estrela', '2 estrelas', '3 estrelas', '4 estrelas'],
                respostaCorreta: 2,
              },
              {
                id: 'atv2_mat_1_fund_numeros',
                pergunta: 'Qual número vem depois do 7?',
                opcoes: ['5', '6', '8', '9'],
                respostaCorreta: 2,
              },
            ],
          },
          {
            id: 'mat_1_fund_soma_simples',
            titulo: 'Primeiras Somas: Juntando Quantidades',
            conteudoHTML: '<p>Somar é juntar! Se você tem 2 carrinhos e ganha mais 1, quantos carrinhos você terá?</p> <p><strong>2 + 1 = 3</strong>. Você terá 3 carrinhos!</p>',
            imagensIlustrativasUrls: ['/images/books/mat_soma_1.png'], // Placeholder
            atividades: [
              {
                id: 'atv1_mat_1_fund_soma',
                pergunta: 'Maria tem 3 bonecas e ganha mais 2. Com quantas bonecas ela fica?',
                opcoes: ['3 bonecas', '4 bonecas', '5 bonecas', '6 bonecas'],
                respostaCorreta: 2,
              },
            ],
          },
        ],
      },
      // Adicionar mais anos escolares para Matemática aqui
      {
        id: 'mat_1_medio',
        nome: '1º Ano Ensino Médio',
        topicos: [
          {
            id: 'mat_1_medio_funcoes',
            titulo: 'Introdução às Funções',
            conteudoHTML: '<p>Uma função matemática é uma regra que relaciona cada elemento de um conjunto (domínio) a um único elemento de outro conjunto (contradomínio).</p><p>Por exemplo, a função <strong>f(x) = 2x</strong> dobra qualquer número x.</p><ul><li>f(1) = 2</li><li>f(3) = 6</li></ul>',
            imagensIlustrativasUrls: [],
            atividades: [
              {
                id: 'atv1_mat_1_medio_funcoes',
                pergunta: 'Se f(x) = x + 5, qual é o valor de f(3)?',
                opcoes: ['3', '5', '8', '15'],
                respostaCorreta: 2,
              }
            ]
          }
        ]
      }
    ],
  },
  {
    id: 'portugues',
    nome: 'Português',
    imagemCapaUrl: '/images/books/capa_portugues.png', // Placeholder
    corTema: 'bg-green-500',
    anosEscolares: [
      {
        id: 'port_1_fund',
        nome: '1º Ano Fundamental',
        topicos: [
          {
            id: 'port_1_fund_alfabeto',
            titulo: 'Conhecendo o Alfabeto',
            conteudoHTML: '<p>O alfabeto é o conjunto de letras que usamos para escrever as palavras. Vamos aprender todas elas!</p>',
            imagensIlustrativasUrls: ['/images/books/port_alfabeto_1.png'], // Placeholder
            atividades: [
              {
                id: 'atv1_port_1_fund_alfabeto',
                pergunta: 'Qual letra vem antes do B?',
                opcoes: ['A', 'C', 'D', 'Z'],
                respostaCorreta: 0,
              },
            ],
          },
        ],
      },
      {
        id: 'port_5_fund',
        nome: '5º Ano Fundamental',
        topicos: [
          {
            id: 'port_5_fund_narracao',
            titulo: 'Elementos da Narração',
            conteudoHTML: '<p>A narração é um tipo de texto que conta uma história, real ou imaginária. Toda narração tem:</p><ul><li><strong>Personagens:</strong> Quem participa da história</li><li><strong>Tempo:</strong> Quando a história acontece</li><li><strong>Espaço:</strong> Onde a história acontece</li><li><strong>Enredo:</strong> O que acontece na história</li><li><strong>Narrador:</strong> Quem conta a história</li></ul>',
            imagensIlustrativasUrls: ['/images/books/port_narracao.png'],
            atividades: [
              {
                id: 'atv1_port_5_fund_narracao',
                pergunta: 'Qual elemento da narração responde à pergunta "onde"?',
                opcoes: ['Personagens', 'Tempo', 'Espaço', 'Enredo'],
                respostaCorreta: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'historia',
    nome: 'História',
    imagemCapaUrl: '/images/books/capa_historia.png',
    corTema: 'bg-amber-600',
    anosEscolares: [
      {
        id: 'hist_5_fund',
        nome: '5º Ano Fundamental',
        topicos: [
          {
            id: 'hist_5_fund_brasil_colonia',
            titulo: 'Brasil Colônia',
            conteudoHTML: '<p>O Brasil foi colônia de Portugal por mais de 300 anos (1500-1822). Durante esse período, os portugueses exploraram as riquezas brasileiras, como o pau-brasil, o ouro e o açúcar.</p><p>Os indígenas que viviam aqui foram escravizados ou morreram por doenças trazidas pelos europeus. Africanos também foram trazidos à força para trabalhar como escravos.</p>',
            imagensIlustrativasUrls: ['/images/books/hist_brasil_colonia.png'],
            atividades: [
              {
                id: 'atv1_hist_5_fund_brasil_colonia',
                pergunta: 'Qual foi o primeiro produto explorado pelos portugueses no Brasil?',
                opcoes: ['Ouro', 'Café', 'Pau-brasil', 'Açúcar'],
                respostaCorreta: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'hist_8_fund',
        nome: '8º Ano Fundamental',
        topicos: [
          {
            id: 'hist_8_fund_independencia',
            titulo: 'Independência do Brasil',
            conteudoHTML: '<p>A independência do Brasil foi proclamada por Dom Pedro I em 7 de setembro de 1822, às margens do riacho Ipiranga, em São Paulo.</p><p>Antes disso, a família real portuguesa havia se mudado para o Brasil em 1808, fugindo das tropas de Napoleão Bonaparte. Em 1820, D. João VI voltou para Portugal, deixando seu filho Pedro como príncipe regente.</p><p>Quando Portugal tentou fazer o Brasil voltar à condição de colônia, D. Pedro decidiu romper os laços coloniais, declarando o Brasil como país independente.</p>',
            imagensIlustrativasUrls: ['/images/books/hist_independencia.png'],
            atividades: [
              {
                id: 'atv1_hist_8_fund_independencia',
                pergunta: 'Em que data foi proclamada a Independência do Brasil?',
                opcoes: ['15 de novembro de 1889', '7 de setembro de 1822', '21 de abril de 1792', '13 de maio de 1888'],
                respostaCorreta: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'geografia',
    nome: 'Geografia',
    imagemCapaUrl: '/images/books/capa_geografia.png',
    corTema: 'bg-yellow-600',
    anosEscolares: [
      {
        id: 'geo_3_fund',
        nome: '3º Ano Fundamental',
        topicos: [
          {
            id: 'geo_3_fund_paisagens',
            titulo: 'Paisagens Naturais e Modificadas',
            conteudoHTML: '<p>Existem dois tipos principais de paisagens:</p><ul><li><strong>Paisagens Naturais:</strong> São formadas apenas por elementos da natureza, como florestas, rios, montanhas, sem intervenção humana.</li><li><strong>Paisagens Modificadas:</strong> São paisagens que sofreram alterações pelo ser humano, como cidades, campos de cultivo, estradas.</li></ul>',
            imagensIlustrativasUrls: ['/images/books/geo_paisagens.png'],
            atividades: [
              {
                id: 'atv1_geo_3_fund_paisagens',
                pergunta: 'Uma floresta sem marcas de intervenção humana é um exemplo de:',
                opcoes: ['Paisagem modificada', 'Paisagem natural', 'Paisagem urbana', 'Paisagem rural'],
                respostaCorreta: 1,
              },
            ],
          },
        ],
      },
      {
        id: 'geo_7_fund',
        nome: '7º Ano Fundamental',
        topicos: [
          {
            id: 'geo_7_fund_regioes_brasil',
            titulo: 'Regiões do Brasil',
            conteudoHTML: '<p>O Brasil é dividido em cinco regiões geográficas:</p><ul><li><strong>Norte:</strong> Maior região em território, abriga a maior parte da Floresta Amazônica.</li><li><strong>Nordeste:</strong> Região que possui diferentes paisagens como o litoral, a zona da mata, o agreste e o sertão.</li><li><strong>Centro-Oeste:</strong> Região do Cerrado e do Pantanal, com economia forte na agropecuária.</li><li><strong>Sudeste:</strong> Região mais populosa e industrializada do país.</li><li><strong>Sul:</strong> Região com maior influência europeia e clima mais frio do Brasil.</li></ul>',
            imagensIlustrativasUrls: ['/images/books/geo_regioes_brasil.png'],
            atividades: [
              {
                id: 'atv1_geo_7_fund_regioes_brasil',
                pergunta: 'Qual é a região brasileira com maior território?',
                opcoes: ['Nordeste', 'Centro-Oeste', 'Norte', 'Sudeste'],
                respostaCorreta: 2,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ciencias',
    nome: 'Ciências',
    imagemCapaUrl: '/images/books/capa_ciencias.png',
    corTema: 'bg-purple-500',
    anosEscolares: [
      {
        id: 'cien_2_fund',
        nome: '2º Ano Fundamental',
        topicos: [
          {
            id: 'cien_2_fund_animais',
            titulo: 'Os Animais e seus Habitats',
            conteudoHTML: '<p>Os animais vivem em diferentes lugares chamados habitats. Cada habitat tem características que permitem os animais viverem lá.</p><p>Exemplos de habitats:</p><ul><li><strong>Floresta:</strong> Lugar com muitas árvores onde vivem macacos, onças, pássaros.</li><li><strong>Oceano:</strong> Lugar com água salgada onde vivem peixes, baleias, tubarões.</li><li><strong>Deserto:</strong> Lugar seco e quente onde vivem camelos, cobras, escorpiões.</li></ul>',
            imagensIlustrativasUrls: ['/images/books/cien_habitats.png'],
            atividades: [
              {
                id: 'atv1_cien_2_fund_animais',
                pergunta: 'Qual animal normalmente vive no deserto?',
                opcoes: ['Baleia', 'Macaco', 'Camelo', 'Pinguim'],
                respostaCorreta: 2,
              },
            ],
          },
        ],
      },
      {
        id: 'cien_9_fund',
        nome: '9º Ano Fundamental',
        topicos: [
          {
            id: 'cien_9_fund_quimica',
            titulo: 'Introdução à Química: Átomos e Moléculas',
            conteudoHTML: '<p>A matéria é formada por unidades muito pequenas chamadas átomos. Quando átomos se unem, formam moléculas.</p><p>Um átomo é composto por:</p><ul><li><strong>Prótons:</strong> Partículas com carga positiva localizadas no núcleo.</li><li><strong>Nêutrons:</strong> Partículas sem carga elétrica localizadas no núcleo.</li><li><strong>Elétrons:</strong> Partículas com carga negativa que se movem ao redor do núcleo.</li></ul><p>Exemplos de moléculas importantes:</p><ul><li><strong>H₂O:</strong> Água (2 átomos de hidrogênio + 1 átomo de oxigênio)</li><li><strong>O₂:</strong> Oxigênio que respiramos (2 átomos de oxigênio)</li><li><strong>CO₂:</strong> Gás carbônico (1 átomo de carbono + 2 átomos de oxigênio)</li></ul>',
            imagensIlustrativasUrls: ['/images/books/cien_atomos.png'],
            atividades: [
              {
                id: 'atv1_cien_9_fund_quimica',
                pergunta: 'Qual é a fórmula da molécula de água?',
                opcoes: ['H₂O₂', 'CO₂', 'O₂', 'H₂O'],
                respostaCorreta: 3,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fisica',
    nome: 'Física',
    imagemCapaUrl: '/images/books/capa_fisica.png',
    corTema: 'bg-red-500',
    anosEscolares: [
      {
        id: 'fis_1_medio',
        nome: '1º Ano Ensino Médio',
        topicos: [
          {
            id: 'fis_1_medio_cinematica',
            titulo: 'Cinemática: Movimento Retilíneo Uniforme',
            conteudoHTML: '<p>O <strong>Movimento Retilíneo Uniforme (MRU)</strong> é aquele em que um corpo se move em linha reta com velocidade constante.</p><p>A principal equação do MRU é:</p><p class="text-center text-xl font-bold">S = S₀ + v·t</p><p>Onde:</p><ul><li><strong>S</strong> = posição final</li><li><strong>S₀</strong> = posição inicial</li><li><strong>v</strong> = velocidade (constante)</li><li><strong>t</strong> = tempo</li></ul><p>No MRU, a distância percorrida é proporcional ao tempo gasto no percurso.</p>',
            imagensIlustrativasUrls: ['/images/books/fis_mru.png'],
            atividades: [
              {
                id: 'atv1_fis_1_medio_cinematica',
                pergunta: 'Um carro se move com velocidade constante de 72 km/h. Quantos quilômetros ele percorre em 2 horas?',
                opcoes: ['36 km', '144 km', '72 km', '108 km'],
                respostaCorreta: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ingles',
    nome: 'Inglês',
    imagemCapaUrl: '/images/books/capa_ingles.png',
    corTema: 'bg-indigo-500',
    anosEscolares: [
      {
        id: 'ing_6_fund',
        nome: '6º Ano Fundamental',
        topicos: [
          {
            id: 'ing_6_fund_greetings',
            titulo: 'Greetings and Introductions',
            conteudoHTML: '<p>Em inglês, usamos diferentes expressões para cumprimentar pessoas:</p><ul><li><strong>Hello / Hi</strong> - Olá</li><li><strong>Good morning</strong> - Bom dia</li><li><strong>Good afternoon</strong> - Boa tarde</li><li><strong>Good evening</strong> - Boa noite (ao chegar)</li><li><strong>Good night</strong> - Boa noite (ao se despedir)</li></ul><p>Para se apresentar, podemos dizer:</p><ul><li><strong>My name is ___.</strong> - Meu nome é ___.</li><li><strong>I am ___.</strong> - Eu sou ___.</li><li><strong>Nice to meet you.</strong> - Prazer em conhecê-lo(a).</li></ul>',
            imagensIlustrativasUrls: ['/images/books/ing_greetings.png'],
            atividades: [
              {
                id: 'atv1_ing_6_fund_greetings',
                pergunta: 'Qual expressão usamos para cumprimentar alguém pela manhã em inglês?',
                opcoes: ['Good night', 'Good afternoon', 'Good morning', 'Good evening'],
                respostaCorreta: 2,
              },
            ],
          },
        ],
      },
    ],
  }
  // Adicionar mais matérias aqui
]; 