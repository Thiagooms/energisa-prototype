# D6: Confiança e abstenção

**A pergunta:** de onde sai o percentual de confiança de cada OBF, e quando a solução deve se abster e mandar o caso para análise humana?

## Por que importa aqui

- A Energisa quer o nível de confiança "para priorizar a revisão humana". Um percentual que não corresponde ao acerto real atrapalha mais do que ajuda: o analista para de olhar justamente onde deveria.
- O erro mais caro é a OBF esquecida. Uma confiança alta numa resposta incompleta é o pior cenário.
- O gabarito tem 7 casos em que a própria Energisa não indicou OBF. A abstenção faz parte do comportamento esperado.

## De onde pode sair a confiança

| Fonte | Como funciona | Ganha | Perde |
|---|---|---|---|
| Declarada pelo LLM | O modelo escreve "94%" | Custo zero | Costuma ser alta demais e pouco relacionada ao acerto |
| Fração de votos dos precedentes | Dos k casos parecidos, quantos têm a OBF | Objetiva, explicável, sem LLM | Baixa para OBF rara mesmo quando está certa |
| Similaridade do melhor precedente | Quão parecido é o caso mais próximo | Indica se o caso é "conhecido" | Diz pouco sobre cada OBF em particular |
| Concordância entre execuções | Roda o gerador 3 vezes; o que se repete é mais confiável | Sinal real de incerteza do modelo | Triplica o custo |
| Concordância entre arquiteturas | LLM e votação dos vizinhos concordam? | Dois métodos independentes | Só existe se os dois rodarem |
| Verificações que passaram | Trecho literal encontrado, regras respeitadas | Barato e objetivo | Passar na verificação não garante a OBF certa |
| Sinais combinados | Uma pontuação a partir de vários sinais acima | Mais robusta | Mais uma peça para ajustar com poucos dados |

## Calibração

Calibrar é fazer o número significar algo: entre as indicações marcadas com 90%, cerca de 9 em 10 devem estar certas.

| Abordagem | Como funciona | Encaixe com cerca de 175 casos |
|---|---|---|
| Não calibrar | Mostra o número bruto | Arriscado; o analista vai confiar num número sem base |
| Faixas (alta, média, baixa) | Mede o acerto de cada faixa no desenvolvimento e mostra o acerto observado | Viável: poucas faixas, muitos exemplos em cada uma |
| Curva contínua (regressão isotônica, Platt) | Ajusta uma função que converte a nota em probabilidade | Frágil: poucos dados para ajustar uma curva, sobretudo nas OBFs raras |
| Por OBF | Uma calibração para cada código | Inviável: 16 OBFs têm 9 exemplos ou menos |

Trade-off: a Energisa pede um percentual; o honesto com estes dados são três faixas. Uma saída é mostrar o percentual da faixa: "alta: 9 em cada 10 indicações deste tipo estavam certas no histórico".

A calibração usa só o conjunto de desenvolvimento, em dobras por processo. Ajustar as faixas olhando o teste invalida os indicadores finais.

## Abstenção

| Gatilho | O que detecta | Risco de usar |
|---|---|---|
| Texto não é um dispositivo | Anotação do analista, texto de 6 caracteres | Baixo |
| Nenhuma determinação dirigida à Energisa | Pedido negado, só providências do processo | Baixo |
| Nenhum precedente acima do limiar | Caso diferente de tudo na base | Médio: OBF rara cai aqui e o catálogo poderia resolver |
| Todas as indicações na faixa baixa | Incerteza geral | Médio |
| Geradores discordam | Execuções ou arquiteturas dão respostas diferentes | Médio; custa rodar mais de uma vez |
| Regra violada sem solução | 618 e 679 para o mesmo débito | Baixo |

### Abster-se do caso inteiro ou de parte dele

| Opção | Ganha | Perde |
|---|---|---|
| Caso inteiro para análise humana | Simples de explicar | Desperdiça o que a solução acertou |
| Indicar o que tem base e sinalizar o resto | O analista parte de algo; menos esforço | Tela mais complexa; risco de o analista não notar o sinal |

### O trade-off da abstenção

Cada caso em que a solução se abstém não vira erro e também não vira ganho de produtividade. Abster-se demais devolve o trabalho ao analista; abster-se de menos deixa passar erro. O limiar é uma escolha de negócio, e vale mostrar à Energisa a curva: taxa de abstenção de um lado, acerto nos casos respondidos do outro.

## Como apresentar ao analista

| Elemento | Motivo |
|---|---|
| Ordenar pela menor confiança primeiro | O olho vai para onde precisa |
| Mostrar por que a confiança é o que é | "4 de 5 casos parecidos têm esta OBF" convence mais que "87%" |
| Sinalizar OBF sem precedente | O analista sabe que veio só do catálogo |
| Sinalizar par sugerido por falta de detalhe | Evita que 208 e 209 pareçam duas certezas |

## Como testar

- **Calibração por faixa:** para cada fonte de confiança, o acerto observado por faixa. As faixas precisam sair em ordem.
- **Capacidade de ordenar:** se o analista revisar só a metade menos confiante, que fração dos erros ele pega? Compara as fontes sem depender do número exato.
- **Curva de abstenção:** variar o limiar e traçar taxa de abstenção contra acerto no restante.
- **Os 7 casos sem resposta:** a solução se abstém neles?
- **Custo:** chamadas de LLM por caso para cada fonte.

## Hipótese de partida

A confiança declarada pelo LLM ordena mal. A fração de votos dos precedentes ordena bem nas OBFs frequentes e mal nas raras. Uma combinação simples dos dois sinais, mostrada em três faixas, é o melhor que os dados permitem.

## O que mudaria a decisão

- A Energisa aceitar três níveis no lugar do percentual: simplifica tudo.
- A base crescer para milhares de casos: a calibração contínua e por OBF passa a ser viável.
- O custo de várias execuções ser aceito: a concordância entre execuções vira o sinal principal.

## Resultado

_A preencher depois do experimento._
