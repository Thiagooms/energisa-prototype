# D5: Geração

**A pergunta:** como o LLM usa o catálogo e os precedentes para indicar as OBFs, em quantas chamadas, e qual LLM?

## Por que importa aqui

- É onde a resposta nasce. A melhor busca do mundo não compensa um prompt que ignora uma condição.
- Das 26 OBFs, 5 não têm exemplo e 8 têm 1 ou 2. Para elas, só a descrição do catálogo ajuda.
- A saída tem formato fixo: código, justificativa, confiança e trecho literal. O LLM precisa obedecer ao formato e não inventar citação.

## Eixo 1: de onde vem o conhecimento

| Fonte | O que ensina | Limite |
|---|---|---|
| Catálogo no prompt | Quando cada OBF se aplica, inclusive as sem exemplo | Não ensina os costumes do gabarito (208 e 209 sempre juntas, 692 quase sempre com religação) |
| Regras de negócio no prompt | Combinações obrigatórias e proibidas | O LLM pode esquecer; por código é mais seguro |
| Precedentes recuperados | Como os especialistas da Energisa rotularam casos parecidos | Só cobre o que já apareceu; puxa a resposta para a maioria |
| Votação dos vizinhos como dica | Um resumo numérico: "4 de 5 precedentes têm a 687" | Pode induzir o LLM a copiar sem ler |

O catálogo tem 26 itens curtos e cabe inteiro no prompt. Não há motivo para recuperar parte dele por busca: isso arriscaria deixar de fora justamente a OBF rara.

## Eixo 2: quantas chamadas

| Desenho | Como funciona | Ganha | Perde |
|---|---|---|---|
| Uma chamada | O LLM lê o dispositivo, lista as determinações e indica as OBFs na mesma resposta | Simples, barato, rápido; um prompt para versionar | Raciocínio e resposta misturados; mais difícil achar onde errou |
| Duas chamadas: decompor e indicar | A primeira extrai as determinações; a segunda indica as OBFs de cada uma | Cada etapa é testável; a decomposição serve à busca por determinação (D1) | Dobro de custo e latência; erro da primeira se propaga |
| Uma chamada por determinação | Cada determinação é classificada sozinha | Foco total em cada ordem | Perde as regras que valem para o conjunto (618 e 679; religar com 687 e 692); muitas chamadas |
| Gerar e revisar | Uma segunda chamada pergunta só: ficou alguma determinação sem OBF? | Ataca o erro mais caro, a omissão | Pode inflar a resposta e derrubar a precisão |
| Várias execuções e voto | Roda 3 vezes e fica com o que se repete | Dá um sinal de confiança (D6) | Triplica o custo |

## Eixo 3: o que fica com o LLM e o que fica com o código

| Tarefa | LLM | Código |
|---|---|---|
| Entender a ordem e a condição | Sim | Não |
| Descrição da OBF | Pode errar a grafia | Copia do catálogo |
| Trecho literal | Às vezes parafraseia | Confere se existe no texto |
| Pares 208/209, 617/618, 619/679 | Esquece às vezes | Aplica sempre igual |
| 618 e 679 não coexistem | Esquece às vezes | Detecta e sinaliza |
| Nível de confiança | Mal calibrado | Calcula por sinais (D6) |

Trade-off: regra no código é previsível e auditável, mas rígida. Se a Energisa confirmar que "decisão objetiva pede só um código do par", a regra por código precisa de exceção, e a exceção depende de leitura, que é trabalho do LLM.

## Eixo 4: qual LLM

| Opção | Ganha | Perde |
|---|---|---|
| Modelo grande via API | Melhor leitura de condições e de texto jurídico; saída estruturada confiável; zero infraestrutura | O texto sai da empresa; custo por chamada; depende de aval |
| Modelo pequeno via API | Mais barato e rápido | Erra mais nas condições e nas OBFs raras |
| Modelo aberto local | Nada sai da máquina; custo zero por chamada | Exige máquina com GPU ou paciência; saída estruturada menos confiável; qualidade menor nos modelos que cabem num notebook |
| Modelo na nuvem que a Energisa já contrata | Resolve a confidencialidade pelo contrato existente | Depende de eles liberarem acesso |

A pergunta a fazer à Energisa: existe um provedor que vocês já usam e aprovaram? Se sim, é o caminho de menor atrito.

## Eixo 5: como apresentar os precedentes

| Variável | Trade-off |
|---|---|
| Texto inteiro do precedente ou só o trecho que casou | Inteiro dá contexto e gasta prompt; trecho é enxuto e pode esconder a condição |
| Com as OBFs do precedente ou com a justificativa também | Só as OBFs é o que o gabarito dá; a justificativa teria de ser inventada |
| Ordem | Modelos dão mais peso ao que vem por último; o mais parecido no fim costuma ajudar |
| Precedentes divergentes | Mostrar dois casos parecidos com OBFs diferentes ensina a fronteira, e pode confundir |
| Exemplos de abstenção | Incluir casos "sem resposta" ensina quando não indicar |

## Riscos próprios da geração

| Risco | Sinal | Mitigação |
|---|---|---|
| Copiar o vizinho | Resposta idêntica à do precedente mais parecido, mesmo quando ele está errado | Instrução explícita; exigir trecho do dispositivo novo; medir a taxa de cópia |
| Trecho inventado | A citação não existe no texto | Verificação por código e nova tentativa |
| Excesso de OBFs | Indica tudo o que parece possível | Medir precisão; exigir trecho por OBF |
| Omissão | Ignora uma determinação no meio do texto | Listar as determinações antes de indicar; revisor de omissões |
| Ler prazo e multa como ordem | "Sob pena de multa" vira OBF | Instrução sobre o que não é determinação |

## Como testar

- **Catálogo sozinho contra catálogo com precedentes:** mostra quanto os precedentes acrescentam.
- **Uma chamada contra duas:** mesmo LLM, mesmos precedentes. Olhar cobertura e custo.
- **Com e sem revisor de omissões:** cobertura sobe? Precisão cai quanto?
- **Regras no prompt contra regras no código:** contar quantas vezes cada regra é violada.
- **Dois LLMs com o mesmo prompt:** um grande e um pequeno ou local. Mostra quanto da qualidade vem do modelo.
- **OBFs sem exemplo:** dispositivos sintéticos escritos pela equipe, fora das métricas oficiais.

## Hipótese de partida

Uma chamada, com catálogo e regras no prompt, 5 precedentes, listagem das determinações antes das OBFs, e verificações por código depois. O revisor de omissões entra só se a cobertura medida pedir.

## O que mudaria a decisão

- Sem aval para API, o desenho precisa funcionar com modelo local, e aí decompor em etapas menores tende a ajudar um modelo fraco.
- Se a taxa de cópia do vizinho for alta, vale trocar os precedentes por um resumo da votação.
- Se a omissão for o erro dominante, o revisor ou as duas chamadas passam a valer o custo.

## Resultado

_A preencher depois do experimento._
