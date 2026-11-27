# Plano 03 — RAG por caso

**Status:** proposto · **Esforço estimado:** 1 dia · **Depende de:** plano 00 e plano 02

## Objetivo

Dar ao LLM do plano 02 os casos mais parecidos do conjunto de desenvolvimento como precedentes. É o candidato principal à entrega.

## Hipótese

Precedentes aumentam o acerto exato e reduzem as correções por caso, sem perder as OBFs raras, que o catálogo cobre. Refutam: ganho menor que 3 pontos de acerto exato sobre o plano 02, queda de F1 macro, ou resultado igual ao do plano 01, sinal de cópia do vizinho.

## Como funciona

1. `preparar` limpa cada caso com `base/limpeza.py`, que mascara os códigos de OBF.
2. Anotação do analista sai da base de busca. "Sem resposta (análise humana)" fica, como exemplo de abstenção.
3. Cada dispositivo limpo vira um embedding normalizado, em matriz numpy.
4. `indicar` limpa e embute o dispositivo novo com as mesmas funções.
5. Calcula o cosseno, remove os casos de `excluir_processo` e pega os k maiores.
6. Descarta os abaixo do limiar. Sem nenhum, o prompt segue só com catálogo e regras.
7. Monta o prompt: catálogo, regras, precedentes (dispositivo limpo e OBFs do especialista) e dispositivo novo. O mais parecido fica por último.
8. O prompt diz que precedente é evidência, não resposta, e que cada OBF exige trecho literal do dispositivo novo.
9. Uma chamada a `base/llm.gerar`, com saída estruturada.
10. Sem precedente, a confiança fica limitada a um teto.
11. `meta` registra ID, similaridade e OBFs de cada precedente, além de k, limiar, `sem_precedente` e `identica_ao_vizinho`.

Limitação: dispositivo com várias determinações vira um vetor só, misturado. O plano 04 trata disso.

## Componentes

| Arquivo | Responsabilidade |
|---|---|
| `arquiteturas/a3_rag_caso/arquitetura.py` | `preparar`, `indicar`, parâmetros, teto de confiança e `meta`. |
| `arquiteturas/a3_rag_caso/base_precedentes.py` | Filtro dos casos ruidosos, matriz, busca por cosseno e `acrescentar_caso`. |
| `arquiteturas/a3_rag_caso/prompt.py` | Mensagens: bloco comum, precedentes ordenados, dispositivo novo. |
| `arquiteturas/a3_rag_caso/analise_copia.py` | Mede respostas idênticas ao vizinho mais próximo. |
| `base/prompt_catalogo.py` | Bloco de catálogo e regras, comum aos planos 02 a 04. |
| `base/embeddings.py` | `embutir(textos)`, com modelo vindo de configuração. |

`acrescentar_caso(caso)` recebe as correções do analista: limpa, embute e acrescenta uma linha à matriz, sem retreino. Recusa ID e processo de teste, ID repetido e anotação do analista.

## Dependências

- `numpy` e `sentence-transformers`. Justificativa: embedding local, nenhum dispositivo sai da máquina.
- Modelo `BAAI/bge-m3`, cerca de 2 GB, roda em CPU.
- LLM via `base/llm.py`, temperatura zero.

## Parâmetros a testar

| Parâmetro | Valores |
|---|---|
| k | 3, 5 (padrão), 8 |
| Limiar de similaridade | sem limiar; percentis 10, 25 (padrão) e 50 da similaridade do vizinho mais próximo |
| Ordem dos exemplos | mais parecido por último (padrão); mais parecido primeiro |
| Teto de confiança sem precedente | 50, 60 (padrão), 70 |
| Modelo de embedding | bge-m3 (padrão); multilingual-e5-base |

## Passos

- [ ] Subir o bloco de catálogo e regras para `base/`, junto com o plano 02.
- [ ] `base/embeddings.py` e `base_precedentes.py`, com exclusão de processo.
- [ ] Medir a similaridade do vizinho mais próximo e fixar os limiares.
- [ ] `prompt.py`: instrução de evidência, formato dos precedentes, exemplo de abstenção.
- [ ] `arquitetura.py`: `indicar`, teto de confiança e `meta`.
- [ ] `acrescentar_caso` e teste das recusas.
- [ ] Rodada padrão: `python avaliar.py a3_rag_caso`.
- [ ] Variar um parâmetro por vez, no máximo 8 rodadas.
- [ ] Rodar `analise_copia.py` em cada resultado.

## Como comparar

- Contra o plano 02, mesmo prompt sem precedentes: acerto exato, correções por caso, F1 micro, F1 macro e cobertura das OBFs raras.
- Contra o plano 01: F1 igual indica que o LLM só repete o voto dos vizinhos.
- Cópia: respostas idênticas às OBFs do vizinho mais próximo, separadas em vizinho certo e errado. O segundo número preocupa.
- Calibração: respostas sem precedente devem ter confiança e acerto menores.
- Trecho literal, tokens e latência.

## Riscos

| Risco | Tratamento |
|---|---|
| LLM copia o vizinho | Instrução explícita, trecho literal obrigatório, taxa de cópia medida. |
| Precedente ruim puxa OBF errada | Limiar; abaixo dele, nenhum exemplo. |
| Trecho citado contém máscara | Pedir trecho sem marcas e conferir contra o dispositivo original. |
| Casos 10 e 24 divergentes | Entram os dois; `meta` marca a divergência. |
| Vazamento pelas correções | `acrescentar_caso` recusa ID e processo de teste. |

## Pronto quando

- `python avaliar.py a3_rag_caso` grava um resultado com todas as métricas.
- Toda resposta traz em `meta` os precedentes e a similaridade.
- A taxa de cópia está medida e a configuração padrão, escolhida.
- `acrescentar_caso` recusa ID de teste, e o caso aceito aparece na busca seguinte.

## Resultados

_A preencher._
