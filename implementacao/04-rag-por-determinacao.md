# Plano 04 — RAG híbrido por determinação

**Status:** proposto · **Esforço estimado:** 2 dias, em três fatias · **Depende de:** plano 00; plano 03 medido

## Objetivo

Indicar OBFs buscando precedentes para cada determinação, e não para o dispositivo inteiro.

## Hipótese

Um embedding do dispositivo inteiro dilui as determinações. Buscar por determinação deve subir cobertura e acerto exato, sobretudo com três ou mais determinações. O BM25 deve barrar precedentes de sentido contrário ("suspenda" contra "abstenha-se de suspender").

Refuta: ganho sobre o plano 03 dentro do ruído, ou conferência humana com erro em mais de 3 dos 20 casos.

## Como funciona

1. `preparar` limpa e decompõe cada caso de desenvolvimento. Cada determinação tem ação (verbo canônico com polaridade: `RELIGAR`, `NAO_SUSPENDER`), texto literal, condições e bloco de origem. O que não é ordem à Energisa fica de fora.
2. A base guarda o caso (pai, com OBFs) e a determinação (filho, sem OBF, porque o gabarito rotula o caso inteiro). Cache da decomposição por versão do prompt.
3. `indicar` limpa e decompõe o dispositivo novo com o mesmo código. Sem determinação, abstenção.
4. Por determinação: busca densa (cosseno, top 20) e lexical (BM25, top 20) nos filhos, sem os casos de `excluir_processo`. Fusão por RRF, constante 60.
5. Sobe do filho ao caso pai, sem repetir caso, guardando o trecho que casou.
6. Cosseno abaixo do limiar: sem precedente e com teto de confiança.
7. Votação: fração dos precedentes com cada OBF, por determinação.
8. O LLM final recebe catálogo, regras de negócio, determinações e pacotes de precedentes, e devolve a `Resposta`. O código confere cada trecho no dispositivo original.

## Componentes

Todos em `arquiteturas/a4_rag_determinacao/`.

| Arquivo | Responsabilidade |
|---|---|
| `arquitetura.py` | Contrato; fatias ligadas por configuração; determinações e precedentes em `meta`. |
| `decomposicao.py` | Prompt versionado, lista fechada de ações, validação do texto literal, cache. |
| `busca.py` | Índice pai e filho em numpy, filtro por processo, densa, BM25 próprio, RRF, limiar, votação. |
| `geracao.py` | Prompt final e conversão para `Resposta`. |

## Dependências

- `numpy`, `sentence-transformers` (`bge-m3` local, em `base/embeddings.py`, comum ao plano 03) e `snowballstemmer`.
- `base/llm.py` nas duas chamadas. Cache em `dados/cache/a4/`, fora do git.

## Parâmetros a testar

| Parâmetro | Valores |
|---|---|
| Texto do embedding | literal; normalizado ("ação: X; condições: Y"); os dois |
| Precedentes por determinação | 3; 5; 8 |
| Limiar de cosseno | sem; 0,5; 0,6; 0,7 |

## Passos

Fatia 1, decomposição e busca densa (26 e 27/11):

- [ ] Prompt de decomposição v1 e decomposição do desenvolvimento, com cache.
- [ ] Conferir 20 casos; se preciso, corrigir o prompt e subir a versão.
- [ ] Busca densa, subida ao pai e LLM final.
- [ ] Medir contra o plano 03. Parar se ficar abaixo e os erros não forem precedentes de sentido contrário.

Fatia 2, BM25 e RRF (28/11, manhã):

- [ ] BM25 (minúsculas, sem acento, sem palavras vazias, radicalização) e RRF; medir; comparar as variantes de texto.

Fatia 3, limiar e votação (28/11, tarde):

- [ ] Limiar pela distribuição do cosseno no desenvolvimento; votação; teto de confiança; medir.
- [ ] Decidir: vai para a entrega ou fica como estudo.

## Como comparar

Contra o plano 03, com o mesmo modelo e a mesma versão da base. Olhar cobertura geral, acerto exato, F2, precisão, trecho literal, calibração e custo. Repetir por número de determinações (1, 2, 3 ou mais).

Custo, com franqueza: duas chamadas de LLM por consulta contra uma, decomposição da base inteira, mais peças para depurar, e um erro de decomposição contamina a base.

Vale a pena se ganhar do plano 03 em cobertura ou acerto exato por 5 pontos ou mais, com intervalo de 95% por reamostragem pareada por processo que exclua zero. Com cerca de 175 casos, uma proporção oscila até 7 pontos. Com três ou mais determinações há poucos casos: vale como indício.

## Riscos

| Risco | Tratamento |
|---|---|
| Erro de decomposição contamina a base | Conferência, cache por versão, texto literal validado. |
| OBFs do pai não são da determinação casada | O prompt final avisa; a votação mostra o que é raro. |
| Palavras vazias apagam a negação | Lista própria que mantém "não", "sem" e "nem". |

## Pronto quando

- `python avaliar.py a4_rag_determinacao` roda no desenvolvimento em cada fatia.
- Os Resultados trazem a conferência, a comparação com o plano 03 e a decisão.

## Resultados

_A preencher._
