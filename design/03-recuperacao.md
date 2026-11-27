# D3: Recuperação (densa, lexical, híbrida, reranker)

**A pergunta:** buscar por significado, por palavra ou pelas duas? E vale reordenar o resultado com um segundo modelo?

## Por que importa aqui

- A busca densa aproxima textos com o mesmo assunto, mesmo que mandem o contrário. "Suspenda o fornecimento" (OBF 688) e "abstenha-se de suspender" (OBF 687) falam da mesma coisa e pedem ações opostas.
- O texto tem termos que não admitem paráfrase: "recuperação de consumo", "TOI", "TUSD", "SPC", "Serasa". Um termo desses muda a OBF (617 ou 618, 619 ou 679).
- Juízes diferentes escrevem a mesma ordem de formas diferentes: "religue", "restabeleça o fornecimento", "proceda à reativação". A busca por palavra perde isso.

## Opções de busca

| Opção | Como funciona | Ganha | Perde |
|---|---|---|---|
| Só densa | Cosseno entre vetores | Pega paráfrase e sinônimo | Confunde ordens opostas sobre o mesmo assunto; dilui termos raros |
| Só lexical (BM25) | Pontua palavras em comum, com peso maior para as raras | Exata em termos técnicos; explicável ("casou por causa de TOI") | Perde paráfrase; sensível a como o texto é normalizado |
| Híbrida com RRF | Roda as duas e funde pela posição em cada lista | Junta as duas forças; não exige ajustar pesos | Duas buscas para manter; um resultado mediano nas duas listas pode passar um ótimo em uma só |
| Híbrida com soma ponderada | Normaliza as notas e soma com um peso | Permite privilegiar um lado | Um peso a mais para ajustar com poucos dados; notas de BM25 não têm teto |
| Esparso aprendido | Pesos por palavra gerados pelo modelo (o bge-m3 faz isso) | Híbrida com um modelo só | Menos explicável que o BM25; menos controle sobre a normalização |

### Por que o RRF

O cosseno vai de 0 a 1; o BM25 não tem teto e depende do tamanho do texto. Somar as duas notas direto não faz sentido. O RRF usa só a posição: cada resultado ganha `1 / (60 + posição)` em cada lista e os pontos somam. A constante 60 é o padrão e raramente precisa de ajuste, o que é bom com poucos dados.

## Quando a busca lexical é indispensável

| Situação | Exemplo no nosso material | Lexical é indispensável? |
|---|---|---|
| Termo técnico que decide a OBF | "recuperação de consumo", "TOI", "TUSD/TUST", "parcelamento" | Sim |
| Sigla e nome próprio | "SPC", "Serasa", "SCPC" | Sim |
| Negação que inverte a ordem | "abstenha-se de", "não", "sem" | Ajuda, se a normalização não apagar a negação |
| Número de lei ou artigo | raros no dispositivo; comuns na fundamentação | Pouco relevante hoje; essencial se a decisão completa for indexada |
| Paráfrase livre | "restabeleça" e "religue" | Não. Aqui a densa é que resolve. |

### Cuidados com o BM25 em português

| Escolha | Risco |
|---|---|
| Remover palavras vazias | A lista padrão remove "não", "sem" e "nem". Aqui elas invertem a ordem e precisam ficar. |
| Radicalização | Junta "religue" e "religação", o que ajuda. Pode juntar coisas diferentes também. |
| Remover acentos | Seguro e recomendável; os textos chegam com grafias variadas. |
| Mascarar valores e nomes | Necessário: sem isso, dois casos casam por ter o mesmo valor de multa. |

## Reranker (cross-encoder)

O reranker lê a consulta e cada candidato juntos e dá uma nota de relevância. É mais preciso que comparar vetores, e mais lento.

| Critério | Sem reranker | Com reranker |
|---|---|---|
| Qualidade da ordem | A da busca | Em geral melhor nos primeiros resultados |
| Latência | Milissegundos | Dezenas a centenas de milissegundos por candidato em CPU |
| Peças | Uma busca | Mais um modelo para carregar e versionar |
| Onde ajuda | | Bases grandes, em que os 20 primeiros têm muito ruído |
| Onde não ajuda | | Bases pequenas, em que os 5 primeiros já são quase tudo o que existe de parecido |

Um problema específico: os rerankers são treinados para "este texto responde a esta pergunta?". A nossa pergunta é outra: "este caso recebeu as mesmas OBFs?". Dois dispositivos podem ser muito parecidos e ter OBFs diferentes por causa de uma condição. O reranker não foi treinado para isso.

Leitura: com cerca de 175 casos, o reranker tem pouco para reordenar. Vale testar por ser barato de encaixar, com baixa expectativa. Passa a fazer sentido quando a base crescer para milhares de casos.

### Alternativa mais barata ao reranker

Usar metadados como filtro ou desempate antes do LLM: tipo de decisão (liminar, sentença, descumprimento) e, se D1 for por determinação, a ação canônica (RELIGAR, NAO_SUSPENDER). Um filtro por ação separa ordens opostas com mais segurança que qualquer modelo.

## Outras variáveis da recuperação

| Variável | Trade-off |
|---|---|
| Quantos precedentes levar ao LLM (k) | Poucos: falta evidência. Muitos: entra ruído, o prompt cresce e o LLM passa a copiar a maioria. |
| Limiar de similaridade | Sem limiar, sempre há "vizinho", mesmo que nada parecido exista. Com limiar, parte dos casos segue sem precedente. |
| Diversidade | Cinco precedentes quase idênticos valem por um. Remover quase duplicados dá mais informação ao LLM. |
| Mesmo processo | Na avaliação, é proibido. Em produção, a decisão anterior do mesmo processo é o melhor precedente que existe. |

## Como testar

- **Variável:** só densa, só BM25, híbrida com RRF, híbrida com reranker.
- **Fixo:** unidade de busca, modelo de embedding, k.
- **Medida, sem LLM:** fração das OBFs do gabarito presentes nos 5 recuperados.
- **Teste dirigido:** separar os casos em que a OBF depende de termo técnico (618, 679, 682) e os de ordem negativa (687). É neles que a híbrida precisa ganhar.
- **Teste de pares contrários:** os mesmos 10 pares inventados de D2, agora olhando a posição na lista.
- **Custo:** latência por consulta com e sem reranker.

## Hipótese de partida

A híbrida ganha da densa nos casos de termo técnico e empata no resto. O reranker não muda o resultado de forma mensurável neste volume.

## O que mudaria a decisão

- A densa sozinha já acertar os casos de termo técnico: o BM25 sai, e fica uma peça a menos.
- A base crescer para milhares de casos: o reranker volta à mesa.
- A decisão completa passar a ser indexada: números de lei e artigo tornam a lexical obrigatória.

## Resultado

_A preencher depois do experimento._
