# Energisa · Protótipo de arquiteturas

Laboratório da Equipe I para o Desafio PB Júnior × Energisa. Aqui exploramos os caminhos possíveis para ler o dispositivo de uma decisão judicial e indicar as OBFs, comparando os trade-offs de cada decisão de desenho antes de levar a escolha ao repositório do projeto.

## Por onde começar

| Documento | Para quê |
|---|---|
| [CONTEXT.md](CONTEXT.md) | Problema, dados, decisões tomadas e pontos em aberto |
| [GLOSSARIO.md](GLOSSARIO.md) | Vocabulário de negócio |
| [AGENTS.md](AGENTS.md) | Regras de trabalho para pessoas e agentes |
| [design/00-visao-geral.md](design/00-visao-geral.md) | Mapa das decisões e três desenhos candidatos |

## Decisões de desenho

Cada documento traz as opções, os trade-offs, a leitura para o nosso caso e o experimento que resolve a dúvida.

| Decisão | A pergunta |
|---|---|
| [D1 Unidade de busca](design/01-unidade-de-busca.md) | Caso inteiro, pedaço ou determinação? Chunking fixo, recursivo, estrutural, semântico, pai e filho, enriquecimento de contexto |
| [D2 Embeddings](design/02-embeddings.md) | Multilíngue ou português jurídico, serviço ou local, dimensão e custo |
| [D3 Recuperação](design/03-recuperacao.md) | Densa, BM25, híbrida com RRF, reranker |
| [D4 Armazenamento](design/04-armazenamento.md) | Memória, Chroma, pgvector, Qdrant, Weaviate, Milvus, OpenSearch, Azure AI Search |
| [D5 Geração](design/05-geracao.md) | Catálogo e precedentes no prompt, número de chamadas, LLM e o que fica com o código |
| [D6 Confiança e abstenção](design/06-confianca-e-abstencao.md) | De onde sai o percentual, calibração e quando mandar para análise humana |
| [D7 Entrada de dados novos](design/07-entrada-de-dados-novos.md) | Correções do analista, controles de entrada e versionamento |
| [D8 Como testar](design/08-como-testar.md) | Ruído da medição, métricas, comparação pareada e uso do conjunto de teste |

## Board

A pasta [board/](board/README.md) tem o painel interativo usado para discutir e apresentar o desenho. Abra `board/index.html` no navegador.

| Visão | Para quê |
|---|---|
| Board | Quadro livre, de uso geral: cards, formas, textos, grupos e setas. O catálogo do projeto fica na Biblioteca |
| Mapa dos candidatos | Ver as opções de cada decisão e o caminho dos candidatos A, B e C. Abre pelo menu `⋯` do board |

## Implementação

A pasta [implementacao/](implementacao/) guarda planos de implementação escritos antes desta fase. Estão parados: só voltam à mesa depois que as decisões de desenho forem fechadas, e precisarão ser revistos à luz delas.

## Dados

A planilha fica em `dados/`, fora do git. As decisões são confidenciais.
