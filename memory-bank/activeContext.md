# Contexto Ativo - JumboIA

## Foco de Trabalho Atual
O projeto JumboIA foi clonado com sucesso e está sendo adaptado para desenvolvimento em ambiente Windows. Implementamos uma abordagem modular para as configurações do sistema, facilitando a manutenção e o desenvolvimento em diferentes ambientes. Recentemente foi adicionada uma nova funcionalidade de Calendário de Agenda para permitir que os usuários registrem compromissos e recebam lembretes. Foi elaborado um plano de ação detalhado para as próximas fases do projeto. Foram realizadas correções importantes de configuração, incluindo a mudança da porta do backend de 3000 para 3001 para evitar conflitos, correções nas configurações CORS e atualização do modelo DeepSeek para a versão atual disponível. A funcionalidade de geração de imagens foi corrigida para usar os parâmetros corretos da API OpenAI. A mais recente adição foi a implementação da funcionalidade Live para exibição e interação com dados em tempo real, permitindo aos usuários visualizar informações de mercado, clima e notícias atualizadas automaticamente via WebSockets.

## Mudanças Recentes
- Inicialização do banco de memória com documentação estruturada
- Clone do repositório base com a aplicação funcional
- Adaptação do ambiente de desenvolvimento para Windows
- Modificação de scripts no package.json para compatibilidade com Windows
- Atualização do servidor para melhor detecção e funcionamento em Windows
- Implementação de melhor tratamento de caminhos de arquivos
- Criação de sistema modular de configuração
- Adaptação dos serviços para usar configurações centralizadas
- Adição de nova funcionalidade de Calendário de Agenda com sistema de lembretes
- Elaboração de plano de ação estruturado com tarefas detalhadas para as próximas fases
- Mudança da porta do backend de 3000 para 3001 devido a conflitos de porta
- Atualização de todas as referências de URL no frontend para apontar para a porta 3001
- Correção da configuração CORS para aceitar requisições da porta 5173
- Atualização das referências ao modelo DeepSeek para a versão atual "deepseek-r1-distill-llama-70b:free"
- Atualização da configuração de geração de imagens para usar o modelo DALL-E 2 com os parâmetros corretos
- Implementação de servidor WebSocket para comunicação em tempo real
- Criação de sistema de canais para streaming de diferentes tipos de dados (mercado, clima, notícias)
- Desenvolvimento de interface para visualização de dados em tempo real
- Implementação de componente de gráfico para visualização da evolução de preços no mercado financeiro
- Criação de simulações de dados dinâmicos para demonstração do sistema Live

## Decisões Ativas
- Manter a estrutura atual do código enquanto documentamos e entendemos o sistema
- Usar arquivos de configuração modulares em vez de variáveis de ambiente diretas
- Adaptar scripts e configurações para compatibilidade com Windows
- Utilizar path.join() para manipulação de caminhos de forma consistente
- Implementar detecção de sistema operacional para logs específicos
- Centralizar configurações em módulos específicos para frontend e backend
- Adotar a porta 3001 para o backend para evitar conflitos com outras aplicações
- Manter as configurações CORS atualizadas para as portas corretas usadas pelo Vite
- Usar a versão 2 da API DALL-E para geração de imagens para garantir compatibilidade
- Implementar comunicação em tempo real usando Socket.IO
- Atualizar dados automaticamente para uma experiência de usuário mais dinâmica
- Utilizar simulação de dados para demonstrar o conceito da funcionalidade Live
- Utilizar o Canvas API para renderização de gráficos interativos

## Próximos Passos
1. **Testes do Sistema Completo**: Verificar se todas as funcionalidades estão operando corretamente após as correções e adições
2. **Integração Frontend-Backend**: Garantir a comunicação adequada entre todos os componentes
3. **Teste de Performance da Funcionalidade Live**: Analisar o desempenho e consumo de recursos da comunicação em tempo real
4. **Testes Funcionais**: Verificar todas as funcionalidades existentes após as correções
5. **Melhorias de Desempenho**: Otimizar o carregamento e processamento de dados
6. **Expansão de Funcionalidades**: Implementar novas características conforme plano de tarefas
7. **Expansão das Fontes de Dados Live**: Adicionar novas fontes de dados em tempo real
8. **Preparação para Lançamento**: Realizar testes abrangentes e otimizações finais

## Considerações
- Verificar se o sistema modular de configuração funciona corretamente nos testes
- Confirmar que as integrações entre frontend e backend estão funcionando
- Avaliar a experiência do usuário atual e identificar pontos de melhoria
- Garantir que os caminhos de arquivo sejam compatíveis com Windows
- Verificar conflitos de porta no Windows com outros serviços
- Avaliar se o firewall do Windows permite conexões nas portas necessárias
- Monitorar o desempenho e resposta do novo modelo DeepSeek
- Verificar a qualidade das imagens geradas pela API DALL-E 2
- Monitorar o consumo de recursos do sistema WebSocket
- Verificar se a atualização de dados em tempo real é eficiente e não sobrecarrega o cliente
- Avaliar possíveis melhorias na visualização de dados e gráficos

## Perguntas Abertas
- O sistema de configuração modular será suficiente ou precisará de ajustes?
- Existem melhorias que podem ser feitas na interface do usuário?
- Como está implementada a funcionalidade de humanização de texto?
- Existe algum mecanismo de histórico de conversas entre sessões?
- Como o sistema lida com erros de conexão ou resposta da API?
- Os novos scripts de Windows estão funcionando conforme esperado?
- O novo modelo DeepSeek oferece resultados satisfatórios em comparação com o anterior?
- As imagens geradas pelo DALL-E 2 atendem às expectativas de qualidade?
- A atualização em tempo real via WebSockets é eficiente e estável?
- O sistema de canais para diferentes tipos de dados é escalável?
- Como podemos expandir as fontes de dados da funcionalidade Live?
- Os gráficos de visualização de dados são adequados para seus propósitos?

## Limitações Atuais
- Dependência de serviços externos (OpenRouter API e OpenAI)
- Necessidade de chave de API válida para funcionar
- Possíveis restrições de uso baseadas nos limites da API
- Potenciais questões de compatibilidade com ambiente Windows
- Possíveis problemas com firewall do Windows bloqueando portas
- Possível complexidade de configuração para novos desenvolvedores
- Compatibilidade e disponibilidade de modelos DeepSeek no OpenRouter
- Limitações na API de geração de imagens da OpenAI
- Dados simulados na funcionalidade Live são apenas para demonstração
- Performance do WebSocket pode variar dependendo da conexão e recursos do cliente 

## Conclusão Simplificada

O JumboIA é um assistente de IA para ambiente Windows que integra diversas funcionalidades:

1. **Chat com IA**: Usando o modelo DeepSeek via OpenRouter, oferece respostas contextuais e humanização de texto.

2. **Geração de Imagens**: Cria imagens baseadas em descrições usando a API DALL-E 2 da OpenAI.

3. **Calendário de Agenda**: Permite criar compromissos com datas e horas, salvos localmente e com sistema de lembretes.

4. **Live Data**: Nova funcionalidade implementada para exibição de dados em tempo real (mercado, clima e notícias) usando WebSockets.

O projeto tem arquitetura cliente-servidor com frontend em React/TypeScript/Vite e backend em Node.js/Express. As principais melhorias recentes incluem a adaptação para Windows, correções de configuração (portas, CORS, referências de API) e a implementação da visualização de dados em tempo real com gráficos dinâmicos.

Próximos passos: testar todas as funcionalidades, otimizar o desempenho e expandir as fontes de dados em tempo real. A aplicação está funcionando nas portas 5173 (frontend) e 3001 (backend), utilizando scripts PowerShell personalizados para facilitar a inicialização e limpeza de processos.

## Foco Atual

### Funcionalidade de Conversação por Voz (Live Voice)
Estamos implementando uma nova funcionalidade que permite aos usuários ter uma conversa por voz com o JumboIA:

1. **Reconhecimento de Fala**: Captura a voz do usuário e converte para texto usando a API Web Speech
2. **Visualização de Ondas Sonoras**: Exibe uma representação visual da voz durante a interação
3. **Síntese de Voz**: Transforma as respostas de texto do JumboIA em voz natural
4. **Interface Intuitiva**: Botões simples para iniciar/parar o reconhecimento e a síntese de voz

Esta funcionalidade complementa a experiência do chat por texto, adicionando uma maneira mais natural e acessível de interagir com o assistente, especialmente útil para pessoas com dificuldades de digitação ou deficiências visuais.

### Benefícios da Interação por Voz
- Permite uso sem as mãos (hands-free)
- Torna a interação mais natural e conversacional
- Aumenta a acessibilidade para diferentes usuários
- Cria uma experiência mais imersiva com a IA 