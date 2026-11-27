# Plano 01 — Votação por vizinhos, sem LLM

**Status:** proposto · **Esforço estimado:** 1 dia · **Depende de:** plano 00

## Objetivo

Indicar OBFs repetindo o que os casos mais parecidos do conjunto de desenvolvimento receberam. Roda sem LLM, sem custo por chamada e sem depender do aval de confidencialidade. É o piso de comparação e a segunda opinião das arquiteturas com LLM.

## Hipótese

Esperamos cobertura e precisão altas nas OBFs frequentes (692, 208, 209, 687), F1 macro baixo e cobertura zero nas 5 OBFs sem exemplo. Dois resultados refutam: F1 micro abaixo da arquitetura de fumaça (a busca não acrescenta nada) ou F1 macro igual ao das arquiteturas com LLM (o LLM não se paga).

## Como funciona

1. `preparar` limpa e normaliza os dispositivos do desenvolvimento e monta o índice lexical (BM25) ou denso (embedding local).
2. `indicar` limpa a consulta, retira os casos de `excluir_processo` e compara com todos os outros, por força bruta.
3. A similaridade fica entre 0 e 1. Lexical: BM25 dividido pelo BM25 da consulta contra ela mesma. Densa: cosseno.
4. Ficam os k vizinhos acima da similaridade mínima. Sem nenhum, abstém.
5. Cada OBF recebe a soma dos pesos dos vizinhos que a têm, dividida pela soma de todos os pesos. Vizinhos "sem resposta" contam no denominador.
6. Entra a OBF com fração acima do limiar de voto. Sem nenhuma, abstém. O nível de confiança é a fração em percentual.
7. Justificativa por molde: "N dos k casos mais parecidos receberam esta OBF", mais o detalhamento do catálogo.
8. Trecho identificado: o dispositivo original é cortado em frases, guardando as posições. Vale a frase mais parecida com a descrição da OBF no catálogo. A citação sai do texto original, nunca do texto limpo.
9. `meta` guarda os vizinhos, as frações de todas as OBFs em `meta["votos"]` e a similaridade do primeiro vizinho em `meta["melhor_similaridade"]`. O plano 05 lê esses dois campos.

Limitação do trecho: o gabarito não diz qual determinação gerou cada OBF. O trecho é a frase mais parecida, não a prova. A métrica de trecho literal dará 100% por construção e não mede acerto.

Esta arquitetura nunca indica 688, 689, 683, 684 e 703. Não é confiável nas OBFs raras, porque 1 ou 2 exemplos não vencem a votação. Não lê condições.

## Componentes

Todos em `arquiteturas/a1_vizinhos/`.

| Arquivo | Responsabilidade |
|---|---|
| `arquitetura.py` | Classe `Vizinhos`, com `preparar`, `indicar` e os parâmetros. |
| `normalizacao.py` | Minúsculas, acentos, tokens, stopwords e radical em português. |
| `busca_lexical.py` | BM25 escrito à mão. |
| `busca_densa.py` | Embeddings locais, cache fora do git, cosseno. |
| `votacao.py` | Filtro de vizinhos, frações, limiares e abstenção. |
| `texto.py` | Molde da justificativa e escolha do trecho. |

As duas buscas têm a mesma interface.

## Dependências

- `numpy`: matriz de similaridade.
- `snowballstemmer`: radical em português, Python puro.
- `sentence-transformers` com `BAAI/bge-m3`: só na busca densa. Roda local e nenhum texto sai da máquina.

## Parâmetros a testar

| Parâmetro | Valores |
|---|---|
| Busca | lexical, densa |
| k | 3, 5, 10, 15 |
| Peso do vizinho | uniforme, similaridade, similaridade ao quadrado |
| Limiar de voto | 0,3, 0,4, 0,5, 0,6 |
| Similaridade mínima | percentis 5, 10 e 20 do 1º vizinho |
| Radical e stopwords | com, sem |
| Completar pares de OBFs | sim, não |

## Passos

- [ ] `normalizacao.py` e `busca_lexical.py`, testados com textos inventados.
- [ ] `votacao.py` e `texto.py`, com trecho por posição no original.
- [ ] `arquitetura.py` e primeira rodada com `python avaliar.py a1_vizinhos`.
- [ ] `busca_densa.py` com cache e segunda rodada.
- [ ] Grade de parâmetros no desenvolvimento, escolhida pelo F2 na variante por pares.
- [ ] Ler 20 erros e 20 trechos e preencher Resultados.

## Como comparar

- Contra a arquitetura de fumaça do plano 00: F1 micro, F2 e correções por caso.
- Contra os planos com LLM: F1 macro, cobertura por OBF nas intermediárias e raras, acerto exato e custo.
- Entre lexical e densa: as mesmas métricas, a latência e a calibração.

## Riscos

| Risco | Tratamento |
|---|---|
| Grade ajustada demais a 175 casos | Poucos valores; escolher região estável, não o pico. |
| `bge-m3` pesado para baixar ou rodar | Entregar a lexical primeiro; `multilingual-e5-small` de reserva. |
| Anotações do analista viram vizinhos | Usar a marcação da limpeza; medir com e sem elas. |
| Trecho errado parece certo | Declarar a limitação; conferir amostra à mão. |

## Pronto quando

- `python avaliar.py a1_vizinhos` roda com as duas buscas e grava os resultados.
- Todo trecho existe no dispositivo original.
- A comparação entre lexical e densa está em Resultados.

## Resultados

_A preencher._
