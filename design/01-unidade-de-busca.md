# D1: Unidade de busca (chunking)

**A pergunta:** o que vira um registro na base de busca: o caso inteiro, um pedaço de tamanho fixo ou cada determinação?

## Por que importa aqui

- Um dispositivo costuma ter várias determinações. Um vetor do texto inteiro é a média de todas, e um caso com "religar e não negativar" pode ficar longe de um caso que só manda religar.
- O gabarito rotula o caso, não a determinação. Se a busca for por pedaço, o pedaço encontrado não diz sozinho qual OBF ele gerou.
- Os textos são curtos: mediana de 520 caracteres, máximo de 2.520. O problema clássico do chunking, que é caber no limite do modelo, quase não existe aqui.

## Opções

| Opção | Como funciona | Ganha | Perde | Encaixe no nosso caso |
|---|---|---|---|---|
| Tamanho fixo | Corta a cada N caracteres, com ou sem sobreposição | Trivial de fazer | Parte a determinação no meio e separa a ordem da condição ("desde que...") | Ruim. O texto já cabe inteiro; cortar só estraga. |
| Recursivo | Corta por parágrafo, depois frase, até caber em N | Respeita a pontuação | Ainda decide por tamanho, não por sentido | Ruim pelo mesmo motivo. Útil só se chegar a decisão completa em PDF. |
| Estrutural | Corta nos marcadores do texto: (i), (ii), "a)", ponto e vírgula | Barato, sem LLM, um pedaço por ordem numerada | Falha em dispositivos em prosa corrida, sem marcadores | Parcial. Vale medir quantos dispositivos têm marcadores. |
| Semântico | Corta onde a similaridade entre frases vizinhas cai | Acha fronteiras sem depender de marcadores | Instável em texto curto; mais um limiar para ajustar | Fraco. Com 3 ou 4 frases por texto, há pouco sinal. |
| Por determinação, com LLM | Um LLM extrai cada determinação com ação, texto literal e condições | A unidade é a do negócio; funciona em prosa; alimenta a explicação ao analista | Uma chamada de LLM por caso; erro de extração contamina a base | Forte, com custo e risco. |
| Pai e filho | Busca no pedaço pequeno (determinação) e devolve o caso inteiro com as OBFs | Precisão da busca por pedaço, rótulo fiel ao gabarito | Duas tabelas ligadas; o caso devolvido traz OBFs de outras determinações | É a forma correta de usar busca por pedaço com rótulo por caso. |
| Enriquecimento de contexto | Antes de gerar o vetor, acrescenta ao pedaço um resumo do todo ("liminar; 3 determinações; esta é a de religação") | O pedaço não perde o contexto do caso | Uma chamada de LLM por pedaço na indexação; ganho incerto em texto curto | Opcional. Só faz sentido junto com pedaço pequeno. |
| Caso inteiro | Um vetor por dispositivo | Zero peças extras; rótulo e registro coincidem | Mistura as determinações num vetor só | É a linha de base. |

## Qual faz sentido para cada tipo de documento

| Documento | Unidade indicada | Motivo |
|---|---|---|
| Dispositivo colado (o que temos hoje) | Caso inteiro como base; pai e filho por determinação como desafio | Texto curto; a dúvida é só a mistura de determinações. |
| Decisão completa em PDF (se vier em produção) | Estrutural para isolar o dispositivo, depois o mesmo tratamento acima | Relatório e fundamentação são longos e não geram OBF. Indexá-los só traz ruído. |
| Catálogo de OBFs | Uma OBF por registro, sem cortar | São 26 itens curtos e independentes. Cabem inteiros no prompt; nem precisam de busca. |
| Regras de negócio | Sem busca: vão sempre no prompt | São 4 regras. Recuperar por similaridade arrisca deixar uma de fora. |

## Trade-off central

Busca por determinação promete precisão, mas o rótulo é por caso. Há três formas de lidar com isso:

| Forma | O que faz | Custo |
|---|---|---|
| Pai e filho | O filho não tem OBF; devolve o caso pai | Nenhum rótulo novo; alguma imprecisão |
| Rotular por determinação | Alguém atribui cada OBF à determinação que a gerou | Cerca de 175 casos anotados à mão; não cabe no prazo |
| Atribuição automática | Um LLM propõe o vínculo e uma pessoa confere uma amostra | Rápido, mas cria rótulo que a Energisa não validou |

## Como testar

- **Variável:** unidade de busca: caso inteiro, estrutural por marcadores, determinação com pai e filho.
- **Fixo:** mesmo embedding, mesma busca densa, mesmo prompt de geração, mesmo LLM.
- **Medida direta da busca, sem LLM:** para cada caso de desenvolvimento, que fração das OBFs do gabarito aparece nos 5 casos recuperados. Mede a recuperação isolada e roda em segundos.
- **Medida final:** cobertura e acerto exato do caso, separados por número de determinações (1, 2, 3 ou mais).
- **Contagem prévia, barata:** quantos dispositivos têm marcadores (i), (ii) e quantos são prosa. Decide se o corte estrutural é viável.

## Hipótese de partida

Caso inteiro resolve a maioria, porque as 4 OBFs frequentes aparecem juntas em grande parte dos casos. A busca por determinação deve ganhar só nos dispositivos com três ou mais determinações de famílias diferentes.

## O que mudaria a decisão

- Se a medida direta da busca for parecida entre caso inteiro e determinação, não há motivo para pagar a decomposição.
- Se a entrada em produção for o PDF da decisão, o corte estrutural para isolar o dispositivo passa a ser obrigatório.
- Se a Energisa fornecer rótulo por determinação, a busca por pedaço fica muito mais forte.

## Resultado

_A preencher depois do experimento._
