# Plano 05 — Pipeline com verificação

**Status:** proposto · **Esforço estimado:** 2,5 dias · **Depende de:** planos 00, 01 e 03 (ou 04, se vencer)

## Objetivo

Envolver uma arquitetura geradora e tratar a resposta antes de chegar ao analista. A OBF esquecida gera multa diária, então a camada prioriza cobertura, calibra o nível de confiança e registra toda alteração.

## Hipótese

Esperamos trecho literal perto de 100% com a fatia 1, cobertura geral 2 pontos maior com o revisor e acerto crescente por faixa de confiança. Refuta: precisão cair mais de 3 pontos, F2 não subir ou faixas fora de ordem. Aí fica só a fatia 1.

## Como funciona

1. A geradora, injetada por configuração, roda de 1 a 3 vezes, sempre com o `excluir_processo` recebido. As respostas são unidas e a concordância vira sinal.
2. Verificações determinísticas: código fora do catálogo sai; descrição vem do catálogo; trecho não literal é trocado pela janela mais parecida ou marcado como falho. Regras: pares completados; 618 e 679 no mesmo trecho com recálculo viram só 679; religação sem 687 ou 692 vira pendência. Toda alteração vai para `meta["verificacoes"]` com regra e motivo.
3. Revisor de omissões: uma chamada com dispositivo, OBFs indicadas, pendências e catálogo. Pergunta única: há determinação dirigida à Energisa sem OBF? Limites: trecho literal obrigatório, teto de adições, nunca remove, adição nunca entra na faixa alta.
4. Nível de confiança: pontuação com fração de votos do plano 01, concordância, similaridade do melhor precedente, verificações e origem. Cada faixa exibe o acerto observado no desenvolvimento, nunca no teste.
5. Abstenção: análise humana se geradora e revisor nada indicam, se tudo fica na faixa baixa ou se falta verbo de ordem. Indicações ordenadas da menor para a maior confiança.
6. Observações em `meta["observacoes"]`: condição, prazo de até 48 horas, multa, par sugerido por falta de detalhe.

Custo: 2 a 4 chamadas de LLM por caso (1 a 3 da geradora, 1 do revisor). Em paralelo, latência de cerca de duas chamadas em série.

## Componentes

| Arquivo | Responsabilidade |
|---|---|
| `base/verificacoes.py` | Sobe para `base/` e serve a todos: código, descrição, trecho e regras, com interruptor por regra. |
| `arquiteturas/a5_verificacao/arquitetura.py` | Implementa `Arquitetura`. Recebe geradora e segunda opinião pelo contrato, sem importar outra pasta. |
| `arquiteturas/a5_verificacao/revisor.py` | Prompt, esquema e limites. |
| `arquiteturas/a5_verificacao/confianca.py` | Sinais, faixas e calibração. |
| `arquiteturas/a5_verificacao/politica.py` | Abstenção, ordenação e observações. |

## Dependências

Nenhuma biblioteca nova (`difflib` e `re`). O plano 01 expõe `meta["votos"]` e `meta["melhor_similaridade"]`. O `avaliar.py` resolve arquiteturas por nome. Mais de uma execução exige temperatura acima de zero na configuração.

## Parâmetros a testar

| Parâmetro | Valores |
|---|---|
| Execuções da geradora | 1, 2, 3 |
| Completar pares | sempre, só 208/209, nunca |
| Religação sem 687 ou 692 | observação, pergunta ao revisor, adição |
| Teto de adições do revisor | 1, 2 |
| Faixas de confiança | 2, 3 |

## Passos

Fatia 1, verificações (sem LLM, meio dia):

- [ ] Escrever `base/verificacoes.py` e medir regra por regra sobre os planos 01 a 04.

Fatia 2, revisor (meio dia):

- [ ] Prompt, esquema e limites; adições passam pela fatia 1.

Fatia 3, observações (2 horas):

- [ ] Regras de condição, prazo e multa.

Fatia 4, confiança (1 dia):

- [ ] Coletar sinais e acertos; ajustar faixas em 5 dobras por processo, cada caso com a tabela da dobra que não o contém.

Fatia 5, abstenção e ordenação (2 horas):

- [ ] Gatilhos, ordenação e rascunho em `meta`.

Corte: fatias 1 a 3 até 27/11; 4 e 5 só com os planos 01 e 03 medidos.

## Como comparar

Contra a geradora sozinha, no mesmo modelo, uma fatia por vez. Olhar cobertura geral e por OBF, precisão geral, F2, correções por caso, trecho literal, calibração, abstenção e custo. A fatia fica se melhorar cobertura geral ou calibração, com queda de precisão geral de até 3 pontos percentuais e sem queda de F2. Observações: conferência manual de 20 casos de desenvolvimento.

## Riscos

| Risco | Tratamento |
|---|---|
| Revisor infla a resposta | Limites do passo 3 e critério dos 3 pontos. |
| Calibrar com cerca de 175 casos | Poucas faixas, dobras por processo e limitação declarada: faixas largas, OBF rara nunca na faixa alta. |
| Regra contraria o gabarito | Interruptor por regra e medição isolada. |
| Custo e latência | Paralelismo, respostas da geradora guardadas em `resultados/` e fatias desligáveis. |

## Pronto quando

- `python avaliar.py a5_verificacao` roda no desenvolvimento com cada fatia ligada ou desligada.
- Cada fatia tem decisão de ficar ou sair, com números.
- Toda alteração aparece em `meta` com motivo.

## Resultados

_A preencher._
