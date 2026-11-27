# Plano 02 — LLM com catálogo, sem exemplos

**Status:** proposto · **Esforço estimado:** 1 dia · **Depende de:** plano 00

## Objetivo

Medir até onde chega um LLM que conhece só o catálogo de OBFs e as regras de negócio, sem casos do gabarito. É o baseline recomendado pela Energisa e a única arquitetura que pode indicar as 5 OBFs sem exemplo.

## Hipótese

Esperamos cobertura alta nas OBFs frequentes, ganho sobre o plano 01 nas raras e precisão menor, porque o catálogo não ensina os costumes do gabarito. Refuta: F2 abaixo do plano 01 sem ganho nas raras, ou menos de 4 das 5 OBFs sem exemplo indicadas nos sintéticos.

## Como funciona

1. `preparar` ignora os casos. Monta o prompt de sistema com as instruções versionadas e o catálogo de `base/catalogo.py`, e calcula o hash.
2. `indicar` aplica a limpeza e envia o dispositivo como mensagem do usuário. Ignora `excluir_processo`, pois não há precedentes.
3. Uma chamada a `gerar(mensagens, esquema)`, com temperatura 0. O esquema pede, nesta ordem: `eh_dispositivo`, `motivo_abstencao`, `determinacoes` (texto e condição) e `indicacoes` (código restrito aos 26, justificativa, confiança, trecho).
4. O código valida esquema, código no catálogo, repetição e confiança de 0 a 100.
5. Cada trecho é procurado no dispositivo original, com espaços normalizados e máscaras da limpeza como curinga. A resposta leva o recorte do original.
6. Com erro de esquema ou trecho não literal, há nova tentativa com os erros listados. Persistindo, o trecho vira o recorte mais parecido (`difflib`), a confiança cai e `meta` registra a correção.
7. Há abstenção quando o texto não é um dispositivo, não traz determinação dirigida à Energisa ou a saída continua inválida.
8. A descrição vem do catálogo. `meta` guarda modelo, versão e hash do prompt, tentativas e confiança bruta.

## Componentes

Em `arquiteturas/a2_catalogo/`, salvo indicação.

| Arquivo | Responsabilidade |
|---|---|
| `arquitetura.py` | `preparar` e `indicar`; validação, nova tentativa e abstenção. |
| `prompt.py` | Renderiza o prompt e calcula o hash. |
| `prompts/v1.md` | Instruções. Versão rodada não se edita; mudança vira `v2.md`. |
| `esquema.py` | Esquema JSON e conversão para `Resposta`. |
| `trecho.py` | Verificação literal e recorte mais parecido. |
| `sinteticos.json` | Dispositivos sintéticos, com `sintetico: true` e OBF esperada. |
| `sinteticos.py` | Relatório à parte dos sintéticos. |
| `base/prompt_catalogo.py` | Bloco de catálogo e regras renderizado, reaproveitado pelos planos 03 e 04. |

Quando o plano 03 começar, `esquema.py` e `trecho.py` sobem para `base/`, porque passam a servir a mais de uma arquitetura.

## Dependências

Nenhuma nova: só biblioteca padrão (`json`, `re`, `hashlib`, `difflib`) e `base/llm.py`.

## Parâmetros a testar

| Parâmetro | Valores |
|---|---|
| Modelo | um via API; um local |
| Versão do prompt | v1 a v3 |
| Regra dos pares | sempre os dois; só um se a decisão for objetiva |
| Escala de confiança | percentual livre; três níveis |
| Campo `determinacoes` | com; sem |
| Trecho corrigido | manter com confiança reduzida; remover a indicação |

## Passos

- [ ] Escrever `prompts/v1.md`: determinações, o que não é determinação, condições, regras de negócio, pares e abstenção.
- [ ] `prompt.py`, `esquema.py`, `trecho.py` (testado com textos inventados) e `arquitetura.py`.
- [ ] Escrever 3 dispositivos sintéticos por OBF sem exemplo (688, 689, 683, 684, 703) e 5 negativos. Quem escreve não ajusta o prompt.
- [ ] Rodar `python avaliar.py a2_catalogo` com o modelo local.
- [ ] Rodar o modelo via API: nos sintéticos de imediato; no desenvolvimento só com aval da Energisa.
- [ ] Analisar erros do desenvolvimento e ajustar o prompt, sem copiar texto de caso.
- [ ] Registrar cada rodada em Resultados.

## Como comparar

Contra os planos 01 (sem LLM) e 03 (com casos). Olhar cobertura por OBF, com foco nas raras, F2, precisão, correções por caso, variante por pares, abstenção, calibração e custo. O trecho literal sai 100% por construção; vale o percentual literal na primeira tentativa, em `meta`. Comparar os dois modelos com o mesmo hash de prompt. Os sintéticos ficam fora das métricas oficiais, como indício.

## Riscos

| Risco | Tratamento |
|---|---|
| Confiança declarada mal calibrada | Preferir três níveis e conferir se o acerto cai entre níveis. Mostrar acerto medido por faixa, não probabilidade. |
| Modelo local sem saída estruturada nativa | Extrair o JSON do texto e validar sempre no código. |
| Texto confidencial em API externa | Limpeza antes do envio; desenvolvimento só com aval. |
| Prompt ajustado demais ao desenvolvimento | Máximo de três versões; instruções gerais, nunca exemplos. |
| Sintéticos que repetem o catálogo | Linguagem forense e negativos (ordem de não cortar é 687, não 688). |

## Pronto quando

- `python avaliar.py a2_catalogo` grava resultado com dois modelos, ou só o local, sem aval.
- Todo trecho devolvido existe no dispositivo.
- O relatório dos sintéticos cobre as 5 OBFs sem exemplo.
- Cada resultado traz versão e hash do prompt.

## Resultados

_A preencher._
