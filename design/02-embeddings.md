# D2: Embeddings

**A pergunta:** qual modelo transforma o texto em vetor, e ele roda na nossa máquina ou num serviço?

## Por que importa aqui

- O texto é jurídico e em português do Brasil, com termos fixos ("recuperação de consumo", "cadastros de proteção ao crédito") e muita paráfrase.
- As decisões são confidenciais, e a Energisa pediu para confirmar as ferramentas usadas. Um serviço externo de embedding recebe o texto inteiro.
- A base tem centenas de registros. Tamanho de vetor e custo de armazenamento são irrelevantes nesse volume.

## Eixo 1: multilíngue geral ou especializado em português jurídico

| Família | Exemplos | Ganha | Perde |
|---|---|---|---|
| Multilíngue geral, treinado para busca | bge-m3, multilingual-e5 (small, base, large), gte-multilingual | Treinados para recuperação; bons em português; muito usados e testados | Não viram texto jurídico brasileiro em especial |
| Português geral | modelos da linha Serafim | Vocabulário e construções do português | Menos testados; comunidade menor |
| Português jurídico | variantes do BERTimbau ajustadas a texto jurídico | Vocabulário jurídico | Vários foram treinados com textos de Portugal ou para similaridade de frases, não para busca; qualidade varia muito |
| BERT em português sem ajuste para busca | BERTimbau puro | Nenhuma vantagem para busca | Não foi treinado para gerar vetores comparáveis; costuma perder para os de cima |

Leitura: "especializado no domínio" nem sempre vence. Um modelo geral treinado para busca costuma bater um modelo de domínio que não foi treinado para busca. Só a medição nos nossos casos decide.

## Eixo 2: serviço externo ou modelo na nossa máquina

| Critério | Serviço externo (API) | Modelo local |
|---|---|---|
| Confidencialidade | O texto sai da empresa; depende de aval | Nada sai da máquina |
| Qualidade | Em geral alta | Alta nos bons modelos abertos |
| Custo | Por uso; desprezível nesse volume | Zero por uso; exige baixar o modelo (centenas de MB a 2 GB) |
| Operação | Nenhuma | Instalar e carregar o modelo; CPU basta para centenas de textos |
| Reprodutibilidade | O provedor pode trocar o modelo | A versão fica fixa |
| Dependência | De rede e de contrato | Nenhuma |

Leitura: com este volume, a única vantagem real do serviço é não instalar nada. O argumento de confidencialidade pesa mais.

## Eixo 3: tamanho do vetor e custo de armazenamento

| Dimensões | Tamanho por vetor | 250 casos | 100 mil registros |
|---|---|---|---|
| 384 | 1,5 KB | 0,4 MB | 150 MB |
| 768 | 3 KB | 0,8 MB | 300 MB |
| 1.024 | 4 KB | 1 MB | 400 MB |
| 3.072 | 12 KB | 3 MB | 1,2 GB |

Leitura: no protótipo, a dimensão não pesa em nada. Só vira assunto na casa dos milhões de registros, e aí existem saídas: modelos que permitem encurtar o vetor e quantização.

## Eixo 4: limite de tamanho do texto

| Limite do modelo | Efeito |
|---|---|
| 512 tokens (família e5, vários BERT) | Corta o fim dos dispositivos mais longos. Os de 2.500 caracteres ficam no limite. |
| 8.192 tokens (bge-m3, gte-multilingual) | Nenhum dispositivo é cortado. |

Vale contar quantos dispositivos passam de 512 tokens antes de descartar a família e5. Se a unidade de busca for a determinação (D1), o limite deixa de importar.

## Um detalhe que vale conhecer

Alguns modelos geram mais de um tipo de representação. O bge-m3 devolve o vetor denso e também pesos por palavra (esparso), que fazem o papel da busca lexical. Isso permite busca híbrida com um modelo só, em vez de manter um BM25 separado. O trade-off está em D3.

Outro detalhe: a família e5 espera prefixos no texto ("query:" e "passage:"). Esquecer o prefixo derruba a qualidade sem dar erro.

## Candidatos a comparar

| Candidato | Por que entra |
|---|---|
| bge-m3 | Texto longo, denso e esparso no mesmo modelo, local |
| multilingual-e5-base ou large | Referência forte em português; testa o efeito do limite de 512 |
| multilingual-e5-small | Leve; mostra se um modelo pequeno já basta |
| Um modelo de português jurídico | Testa a tese do especializado |
| Um serviço externo | Só como teto de referência, e só com aval da Energisa ou em textos sintéticos |

## Como testar

- **Variável:** o modelo de embedding.
- **Fixo:** unidade de busca, busca só densa, k.
- **Medida, sem LLM:** fração das OBFs do gabarito presentes nos 5 casos recuperados, e posição do primeiro caso com o mesmo conjunto de OBFs.
- **Teste de sanidade:** pares de sentido contrário. "Suspenda o fornecimento" e "abstenha-se de suspender o fornecimento" não podem sair como quase idênticos. Montar uns 10 pares inventados e olhar a similaridade.
- **Custo:** tempo para gerar os vetores da base em CPU.

## Hipótese de partida

Os multilíngues treinados para busca ficam próximos entre si, e a diferença cai dentro do ruído. A escolha acaba decidida por texto longo e por rodar local, o que favorece o bge-m3.

## O que mudaria a decisão

- Um modelo jurídico em português ganhar por margem clara no teste de pares contrários.
- A Energisa só aceitar ferramentas do ecossistema Microsoft, o que levaria aos embeddings do Azure.
- A máquina de quem roda não aguentar o modelo grande, o que levaria ao e5-small.

## Resultado

_A preencher depois do experimento._
