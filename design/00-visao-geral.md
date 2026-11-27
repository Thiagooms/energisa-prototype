# Desenho do sistema: visão geral

_Este documento mostra os caminhos que podemos explorar e o que cada um custa. Não é plano de implementação. Cada decisão tem um documento próprio com as opções, os trade-offs e o experimento que a resolve._

## O fluxo e onde cada decisão entra

```text
dispositivo
   │
   ▼
[limpeza]
   │
   ▼
[D1 unidade de busca] ──► [D2 embedding] ──► [D3 recuperação] ◄── [D4 armazenamento]
                                                   │
                                                   ▼
                              catálogo e regras ─► [D5 geração] ─► [D6 confiança e abstenção]
                                                                          │
                                                                          ▼
                                                                      analista
                                                                          │
                                                                          ▼
                                                              [D7 correções voltam à base]

[D8 avaliação] mede cada troca de peça
```

## As decisões

| Decisão | A pergunta | Documento |
|---|---|---|
| D1 | O que vira um registro na base: o caso inteiro, um pedaço ou cada determinação? | [01-unidade-de-busca.md](01-unidade-de-busca.md) |
| D2 | Qual modelo transforma texto em vetor, e onde ele roda? | [02-embeddings.md](02-embeddings.md) |
| D3 | Busca por significado, por palavra ou as duas? Vale reordenar depois? | [03-recuperacao.md](03-recuperacao.md) |
| D4 | Onde os vetores moram? | [04-armazenamento.md](04-armazenamento.md) |
| D5 | Como o LLM usa catálogo e precedentes, e qual LLM? | [05-geracao.md](05-geracao.md) |
| D6 | De onde sai o nível de confiança e quando a solução se abstém? | [06-confianca-e-abstencao.md](06-confianca-e-abstencao.md) |
| D7 | Como dados novos e correções entram sem sujar a base? | [07-entrada-de-dados-novos.md](07-entrada-de-dados-novos.md) |
| D8 | Como comparar duas opções com tão poucos casos? | [08-como-testar.md](08-como-testar.md) |

## O que o nosso caso tem de diferente

Os exemplos clássicos de RAG jurídico falam de leis e contratos longos. O nosso material é outro, e isso muda o peso de cada decisão:

| Característica | Valor | Consequência |
|---|---|---|
| Tamanho do texto | mediana de 520 caracteres, máximo de 2.520 | Quase todo dispositivo cabe inteiro num embedding. Cortar por tamanho perde o sentido. |
| Tamanho da base | cerca de 175 casos de desenvolvimento | Busca por força bruta leva milissegundos. O banco vetorial não muda a qualidade. |
| Tarefa | indicar várias OBFs de uma lista fechada de 26 | É classificação com vários rótulos apoiada em exemplos, não pergunta e resposta sobre documento. |
| Rótulo | por caso, não por determinação | Limita o quanto dá para aproveitar a busca por pedaço. |
| Desbalanceamento | 4 OBFs em mais de 140 casos, 16 com 9 ou menos, 5 sem nenhum | Os precedentes ajudam nas frequentes; nas raras, só o catálogo ajuda. |
| Custo do erro | OBF esquecida gera multa diária | Cobertura pesa mais que precisão. |

## Onde esperamos o maior efeito

Ordem de impacto esperado na qualidade, da maior para a menor. É hipótese, e o D8 diz como conferir.

1. **D5 geração:** catálogo e regras no prompt, e a qualidade do LLM.
2. **D1 unidade de busca:** caso inteiro ou determinação.
3. **D3 recuperação:** híbrida ou só densa.
4. **D6 confiança:** não muda o acerto, muda o quanto o analista pode confiar.
5. **D2 embedding:** entre bons modelos multilíngues, a diferença tende a ser pequena nesse volume.
6. **D4 armazenamento:** nenhum efeito na qualidade com centenas de registros; pesa em operação e em argumento de escala.

A ordem sugere onde gastar os poucos dias: testar bem D5, D1 e D3, e decidir D2 e D4 por custo e simplicidade.

## Três desenhos candidatos

Cada desenho é uma combinação de escolhas. Servem para comparar caminhos inteiros, não só peças.

| | Desenho A: mínimo | Desenho B: equilibrado | Desenho C: completo |
|---|---|---|---|
| D1 unidade de busca | caso inteiro | caso inteiro | determinação, devolvendo o caso (pai e filho) |
| D2 embedding | multilíngue local | multilíngue local | multilíngue local |
| D3 recuperação | só densa | densa e BM25 com RRF | híbrida e reranker |
| D4 armazenamento | matriz em memória | Postgres com pgvector | Postgres com pgvector ou Qdrant |
| D5 geração | 1 chamada: catálogo e precedentes | 1 chamada, com verificações por código depois | 2 a 4 chamadas: decompor, indicar, revisar omissões |
| D6 confiança | declarada pelo LLM | composta por sinais | composta e calibrada por faixas |
| D7 dados novos | acrescentar à matriz | tabela versionada com aprovação | tabela versionada, aprovação e reprocessamento |

### Trade-offs entre os desenhos

| Critério | A: mínimo | B: equilibrado | C: completo |
|---|---|---|---|
| Peças para manter | poucas | médias | muitas |
| Chamadas de LLM por caso | 1 | 1 | 2 a 4 |
| Latência e custo | menores | menores | 2 a 4 vezes maiores |
| Explicação para o analista | precedentes parecidos | precedentes e regras aplicadas | determinação a determinação |
| Risco de erro em cadeia | baixo | baixo | alto: um erro na decomposição contamina base e consulta |
| Dispositivos com várias determinações | mistura tudo num vetor | mistura tudo num vetor | trata cada uma |
| Argumento de inovação na banca | fraco | médio | forte |
| Argumento de viabilidade na banca | forte | forte | médio |
| O que precisa ser verdade para vencer | os precedentes por caso já bastam | a busca lexical e as regras corrigem os erros do A | a decomposição acerta e o ganho supera o ruído da medição |

### Como ler essa tabela

- O desenho C é o mais convincente no papel e o mais arriscado no prazo. Ele só se justifica com número medido contra o A e o B.
- O desenho B é o A com duas adições baratas (BM25 e verificações por código) e um banco de verdade.
- A banca dá 30% a inovação e 25% a viabilidade. Um desenho B bem medido, com o C apresentado como evolução, cobre os dois.

## Como usar estes documentos

1. Ler o documento da decisão.
2. Rodar o experimento que ele descreve, mudando só aquela peça.
3. Registrar o resultado na seção "Resultado" do próprio documento.
4. Só então fechar a decisão em [CONTEXT.md](../CONTEXT.md).

## Limite destes documentos

As características de ferramentas e modelos (limites de tokens, recursos de cada banco, licenças) vêm do conhecimento geral sobre elas e mudam de versão para versão. Antes de fechar uma escolha, confira a documentação atual da ferramenta escolhida.
