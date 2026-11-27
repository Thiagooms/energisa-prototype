# D8: Como testar cada decisão

**A pergunta:** como comparar duas opções de desenho com cerca de 175 casos, sem se enganar e sem gastar o conjunto de teste?

## Por que importa aqui

- Todas as outras decisões terminam em "medir". Se a medição for fraca, as decisões saem do acaso.
- Com poucos casos, a diferença entre duas opções muitas vezes é menor que a oscilação natural do número.
- Cada vez que olhamos um resultado e ajustamos algo, o conjunto usado deixa de ser neutro. O conjunto de teste só serve se nunca passar por isso.

## O tamanho do ruído

Com cerca de 175 casos e um acerto por volta de 80%, o intervalo de 95% é de cerca de 6 pontos para cada lado. Consequências:

| Diferença observada entre duas opções | Leitura |
|---|---|
| Até 3 pontos | Empate. Escolher pela mais simples. |
| De 3 a 6 pontos | Indício. Olhar caso a caso antes de decidir. |
| Acima de 6 pontos | Diferença provável. |

Para as OBFs raras, não há estatística possível: com 2 casos, o número é 0%, 50% ou 100%. Ali vale ler os casos, não a métrica.

## Formas de medir no conjunto de desenvolvimento

| Forma | Como funciona | Ganha | Perde |
|---|---|---|---|
| Deixar um processo de fora | Para cada caso, a base é todo o desenvolvimento menos os casos do mesmo processo | Usa todos os casos; a base fica quase do tamanho real | Roda a solução uma vez por caso |
| Dobras por processo | Divide os processos em 5 grupos; cada grupo é avaliado com os outros 4 na base | Mais rápido; dá uma medida de variação entre dobras | A base tem 20% a menos; subestima um pouco a qualidade |
| Separar uma validação fixa | Tira mais uma fatia do desenvolvimento | Simples | Com tão poucos casos, encolhe a base e a medição ao mesmo tempo |

Para arquiteturas de busca, deixar um processo de fora é natural e barato: a base não precisa ser refeita, basta ignorar os casos do processo na consulta.

## Dois níveis de medição

| Nível | O que mede | Custo | Para quais decisões |
|---|---|---|---|
| Só a busca | Dos casos recuperados, que fração das OBFs do gabarito eles contêm | Segundos, sem LLM | D1, D2, D3 |
| Ponta a ponta | A resposta final contra o gabarito | Uma ou mais chamadas de LLM por caso | D5, D6, e a confirmação das anteriores |

Trade-off: a medida da busca é rápida e barata, e permite testar dezenas de combinações. Ela é só um indicador: uma busca melhor nem sempre vira resposta melhor, porque o LLM pode compensar ou estragar. A regra é filtrar com a medida da busca e confirmar as finalistas de ponta a ponta.

## Métricas e o que cada uma responde

| Métrica | Pergunta | Cuidado |
|---|---|---|
| Cobertura | Das OBFs do gabarito, quantas a solução achou? | É a que mais pesa: omissão gera multa |
| Precisão | Das OBFs indicadas, quantas estavam certas? | Indicar tudo dá cobertura de 100% e precisão péssima |
| F2 | Resumo que pesa a cobertura em dobro | Bom para escolher entre opções |
| Acerto exato do caso | O conjunto saiu idêntico? | Dura; é a pergunta literal da banca |
| Correções por caso | Quantas OBFs o analista adiciona ou remove? | Traduz em esforço |
| F1 macro | Média com peso igual por OBF | Instável: dominada por OBFs com 1 ou 2 casos |
| Variante por pares | As mesmas, contando 208/209, 617/618 e 619/679 como um item | Sem ela, 208 e 209 inflam o resultado |
| Trecho literal | A citação existe no texto? | Se o código corrige o trecho, medir antes da correção |

## Como conduzir um experimento

| Regra | Motivo |
|---|---|
| Mudar uma peça por vez | Senão não dá para saber o que causou a diferença |
| Fixar o resto e registrar | Modelo, prompt, versão da base, parâmetros e semente |
| Comparar no mesmo conjunto de casos | A comparação pareada, caso a caso, enxerga diferenças que a média esconde |
| Escrever a hipótese antes de rodar | Evita achar explicação para qualquer resultado |
| Olhar os casos, não só o número | 20 erros lidos ensinam mais que uma casa decimal |
| Limitar o número de tentativas | Testar 50 combinações em 175 casos garante que uma ganhe por sorte |

## Comparação pareada

Em vez de comparar duas médias, contar caso a caso: em quantos a opção A acerta e a B erra, e o contrário. Se A ganha em 12 e perde em 10, é empate, mesmo que as médias difiram. Para um intervalo, reamostrar os processos (não os casos) e recalcular a diferença.

## Uso do conjunto de teste

| Regra | Motivo |
|---|---|
| Rodar uma única vez, no final | É o número que vai para a banca |
| Só o desenho escolhido, com tudo congelado | Rodar três desenhos e reportar o melhor já é ajuste no teste |
| Reportar com intervalo | Com cerca de 75 casos, o intervalo é de cerca de 9 pontos para cada lado |
| Reportar junto o resultado do desenvolvimento | Dá à banca duas medidas; se forem muito diferentes, algo se ajustou demais |

## Ordem sugerida dos experimentos

A ordem segue o impacto esperado e a dependência entre decisões:

1. **Contagens sem modelo nenhum:** quantos dispositivos têm marcadores, quantos passam de 512 tokens, quantos casos ruidosos há. Resolve dúvidas de D1 e D2 em minutos.
2. **D2 e D3 pela medida da busca:** modelos de embedding e tipos de busca, com caso inteiro. Segundos por combinação.
3. **D1 pela medida da busca:** caso inteiro contra determinação. Exige decompor a base uma vez.
4. **D5 de ponta a ponta:** catálogo sozinho, depois com precedentes, depois com revisor.
5. **D6:** com as respostas de D5 guardadas, comparar as fontes de confiança sem novas chamadas.
6. **D4 e D7:** testes de operação, sem efeito no acerto.

## Custos a registrar em todo experimento

| Custo | Por que a banca se importa |
|---|---|
| Chamadas de LLM e tokens por caso | Viabilidade: "executável sem investimento excessivo?" |
| Latência por caso | Experiência do analista e prazo de 1 dia |
| Tempo para montar a base | Custo de cada mudança de desenho |
| Peças novas para manter | Escalabilidade e operação |

## Hipótese de partida

Deixar um processo de fora no desenvolvimento, medida da busca para filtrar, ponta a ponta para confirmar, F2 por pares como critério de escolha, e empate resolvido pela opção mais simples.

## Resultado

_Os resultados de cada experimento ficam no documento da decisão correspondente._
