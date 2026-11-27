# D4: Armazenamento vetorial

**A pergunta:** onde os vetores e os casos moram, no protótipo e em produção?

## Por que importa aqui

- No protótipo, quase não importa: com centenas de registros, comparar a consulta com todos leva milissegundos e dá o resultado exato. Nenhum banco melhora a qualidade.
- Em produção, importa por outros motivos: os casos, as correções do analista, as versões da base e o histórico de revisão precisam de um lugar confiável, com backup.
- Na banca, importa como argumento: "suporta o aumento do volume?" e "é executável sem investimento excessivo?".

## Quanto volume esperar

A planilha tem 500 solicitações. Mesmo que a Energisa receba dezenas de milhares de decisões por ano e cada uma vire três determinações, a base fica na casa das centenas de milhares de vetores depois de alguns anos. Isso é pequeno para qualquer opção abaixo, inclusive o Postgres.

## Opções

| Opção | O que é | Escala | Filtro por metadados | Busca híbrida nativa | Backup e operação | Custo operacional |
|---|---|---|---|---|---|---|
| Matriz em memória (numpy) e arquivo | Vetores num arquivo, busca por força bruta | Até dezenas de milhares, sem esforço | Feito no código | Não; BM25 no código | Copiar arquivos | Nenhum |
| Biblioteca de índice (FAISS) | Índice aproximado em memória | Milhões | Fraco; precisa de tabela ao lado | Não | Por conta do time | Baixo, mas é só o índice |
| Chroma | Banco vetorial simples, embutido ou servidor | Bom até centenas de milhares | Sim, simples | Limitada, varia por versão | Simples embutido; menos maduro como servidor | Baixo |
| SQLite com extensão vetorial ou LanceDB | Banco embutido num arquivo | Centenas de milhares | Sim, SQL ou equivalente | Parcial | Copiar o arquivo | Nenhum |
| Postgres com pgvector | Extensão vetorial num banco relacional | Milhões, com índice HNSW | Sim, SQL completo com junções | Combina vetor com busca textual do Postgres; não é BM25 de fábrica | Maduro: backup, réplica, permissões | Baixo se já há Postgres |
| Qdrant | Banco vetorial dedicado | Milhões a bilhões | Forte, filtrando durante a busca | Sim, vetores densos e esparsos com fusão | Bom; mais um serviço para manter | Médio |
| Weaviate | Banco vetorial dedicado | Milhões a bilhões | Sim | Sim, BM25 e vetor de fábrica | Bom; mais um serviço | Médio |
| Milvus | Banco vetorial distribuído | Bilhões | Sim | Sim, nas versões recentes | Pesado: vários componentes | Alto |
| OpenSearch ou Elasticsearch | Motor de busca textual com vetores | Milhões a bilhões | Forte | Sim; a melhor busca lexical do grupo | Maduro, mas pesado | Alto |
| Azure AI Search | Serviço gerenciado da Microsoft | Milhões | Sim | Sim, com reordenação semântica | Gerenciado | Por uso; exige nuvem Azure |

## O Chroma serve em produção?

| A favor | Contra |
|---|---|
| Sobe em minutos, sem servidor | Os casos, as correções e as versões precisam de um banco relacional de qualquer jeito; com Chroma são dois sistemas para manter em sincronia |
| API simples; muito material de exemplo | Busca híbrida e filtros são mais limitados que nos concorrentes |
| Bom para experimentar | Menos histórico de operação em produção: backup, alta disponibilidade, controle de acesso |

Leitura: o Chroma é bom para aprender e prototipar. Para este projeto ele não resolve nada que uma matriz em memória já não resolva no protótipo, e em produção perde para um banco que guarde tudo junto.

## Trade-offs que decidem

| Trade-off | Explicação |
|---|---|
| Um sistema ou dois | Banco vetorial dedicado obriga a manter os vetores sincronizados com o banco dos casos. No Postgres com pgvector, o caso, as OBFs, a versão e o vetor ficam na mesma linha e na mesma transação. |
| Busca exata ou aproximada | Índices aproximados (HNSW) trocam um pouco de precisão por velocidade. Abaixo de dezenas de milhares de registros, a busca exata é rápida e não erra. |
| Híbrida de fábrica ou no código | Qdrant, Weaviate e OpenSearch fazem a fusão sozinhos. No pgvector, a fusão RRF vira uma consulta SQL ou fica na aplicação. No nosso volume, fazer no código é simples. |
| Filtro antes ou depois | Excluir o mesmo processo, filtrar por tipo de decisão ou por versão da base. Bancos que filtram durante a busca não perdem resultados; filtrar depois pode devolver menos que k. |
| Gerenciado ou próprio | Serviço gerenciado tira a operação e põe o dado na nuvem de terceiros, o que volta à questão do aval de confidencialidade. |
| Ecossistema da Energisa | O processo atual usa Power Automate, e integração Microsoft é diferencial citado. O Azure AI Search conversa bem com isso, mas prende a solução à nuvem Azure. |

## Leitura para o nosso caso

| Fase | Opção | Motivo |
|---|---|---|
| Experimentos | Matriz em memória e arquivos | Resultado exato, zero instalação, troca de modelo em segundos |
| Protótipo da entrega | Postgres com pgvector, ou SQLite se o prazo apertar | Um lugar só para casos, correções, versões e vetores |
| Produção na Energisa | A decidir com a TI deles: pgvector se já houver Postgres; Azure AI Search se a regra for ecossistema Microsoft | A escolha depende mais da infraestrutura deles que de qualidade de busca |

Para deixar a troca barata, a aplicação fala com uma interface pequena (`gravar`, `buscar`, `filtrar`), e não com o banco direto.

## Como testar

A qualidade não muda com o banco, então o teste aqui é de operação, não de acerto:

- **Equivalência:** a busca no banco devolve os mesmos k da força bruta? Se não, o índice aproximado está mal configurado.
- **Latência:** tempo por consulta com 200, 20 mil e 200 mil registros sintéticos. Mostra na banca que a solução escala.
- **Filtro:** excluir um processo ainda devolve k resultados?
- **Reversão:** carregar uma versão ruim da base e voltar à anterior. Quanto tempo leva?

## Hipótese de partida

Matriz em memória nos experimentos e Postgres com pgvector no protótipo. Nenhum banco dedicado se paga neste volume.

## O que mudaria a decisão

- A TI da Energisa exigir um serviço específico.
- O volume real passar de milhões de registros.
- A busca híbrida no Postgres se mostrar trabalhosa demais, o que favoreceria o Qdrant.

## Resultado

_A preencher depois do experimento._
