# D7: Entrada de dados novos

**A pergunta:** depois da entrega, como casos novos e correções do analista entram na base sem estragar o que já foi tratado?

## Por que importa aqui

- "Aprender com correções humanas" é o primeiro diferencial que a Energisa listou.
- Num sistema de RAG, a base é o modelo: um caso ruim que entra passa a ser precedente de todos os casos parecidos que vierem depois.
- O gabarito atual já tem ruído (mesmo texto com rótulos diferentes, anotações no lugar do dispositivo). Dado novo sem controle repete o problema em escala.
- A vantagem sobre treinar um modelo aparece aqui: um caso validado melhora a solução na hora, sem retreino.

## De onde vêm os dados novos

| Origem | Qualidade esperada | Cuidado |
|---|---|---|
| Correção do analista dentro da solução | Alta: houve leitura humana | Um analista apressado pode aceitar a sugestão sem ler |
| Sugestão aceita sem alteração | Média: confirma o que a solução já sabia | Reforça os próprios erros se o aceite for automático |
| Carga em lote de decisões antigas | Variável: vem do caça-palavras e de práticas antigas | Pode trazer rótulos de critérios que já mudaram |
| Casos sintéticos escritos pela equipe | Controlada, mas artificial | Não devem se misturar com casos reais |

## Opções de entrada

| Opção | Como funciona | Ganha | Perde |
|---|---|---|---|
| Entrada direta | Toda correção vira caso na hora | Aprendizado imediato; zero esforço | Um erro de digitação vira precedente; ninguém confere |
| Fila de aprovação | A correção fica pendente até uma segunda pessoa aprovar | Qualidade controlada | Exige alguém para aprovar; a base demora a crescer |
| Entrada direta com peso menor | Entra na hora, marcada como "não revisada", e pesa menos na busca | Meio-termo | Mais uma regra para explicar e ajustar |
| Lote periódico | As correções acumulam e entram numa versão nova por semana | Dá para medir antes de ativar | A solução fica desatualizada entre lotes |
| Só divergências | Só entra o caso em que o analista mudou a sugestão | A base cresce onde a solução erra | Perde a confirmação dos acertos; a base fica enviesada para casos difíceis |

## Controles possíveis na entrada

| Controle | O que evita | Custo |
|---|---|---|
| Mesma limpeza dos casos originais | Vetores distantes por causa de formatação, não de conteúdo | Nenhum, se a função for única |
| Recusar texto que não é dispositivo | Anotações e textos vazios na base | Baixo |
| Detectar duplicata e quase duplicata | Dez cópias do mesmo caso dominando a votação | Baixo |
| Detectar conflito | Mesmo texto com OBFs diferentes das já gravadas | Baixo para detectar; alguém precisa decidir |
| Validar as OBFs contra o catálogo e as regras | Código inexistente, 618 e 679 juntas | Baixo |
| Registrar origem, autor e data | Não saber de onde veio um caso ruim | Nenhum |
| Recusar casos do conjunto de teste | Contaminar a medição | Nenhum |

## Versionamento

| Opção | Ganha | Perde |
|---|---|---|
| Base única, sempre atualizada | Simples | Não dá para desfazer uma carga ruim nem reproduzir um resultado antigo |
| Versões imutáveis (v1, v2...) | Reversão em um passo; cada resposta registra em que versão rodou | Mais armazenamento; alguém decide quando ativar a versão nova |
| Marcação por registro (ativo, inativo, data) | Desativar um caso sem apagar; reconstruir a base em qualquer data | Consultas um pouco mais complexas |

## O que obriga a reprocessar tudo

| Mudança | Efeito |
|---|---|
| Caso novo | Só gera o vetor dele |
| Regra de limpeza alterada | Reprocessa todos os textos e vetores |
| Modelo de embedding trocado | Regera todos os vetores; os antigos não são comparáveis |
| Prompt de decomposição alterado (se D1 for por determinação) | Decompõe a base inteira de novo |
| Catálogo alterado (OBF nova ou extinta) | Revisa os casos que usam o código afetado |

Trade-off: quanto mais etapas a base atravessa antes de ficar pronta (limpar, decompor, vetorizar), mais caro é mudar qualquer uma delas. O desenho por caso inteiro reprocessa em segundos; o desenho por determinação exige chamadas de LLM para a base toda.

## Riscos de longo prazo

| Risco | Explicação |
|---|---|
| Ciclo de autoconfirmação | A solução sugere, o analista aceita sem ler, o caso entra e reforça a sugestão. Com o tempo, a base reflete a solução, não os especialistas. |
| Deriva de critério | A Energisa muda a orientação sobre uma OBF e os casos antigos continuam votando pelo critério velho. |
| Maioria esmagando a minoria | As OBFs frequentes crescem mais rápido, e as raras ficam ainda mais raras em proporção. |
| Decisão do mesmo processo | Em produção, a decisão anterior do mesmo processo é ótimo precedente. Se ela estiver errada, o erro se repete no processo inteiro. |

## Perguntas para a Energisa

1. De onde vêm os dados novos: só das correções na solução, ou também de cargas de decisões antigas?
2. Quem valida uma correção antes de ela virar precedente?
3. Com que frequência: caso a caso ou em lote?
4. Quem opera a solução depois da entrega? Há equipe técnica?
5. Quando a orientação sobre uma OBF muda, como isso é comunicado hoje?

## Como testar

Aqui o teste é de comportamento, não de acerto:

- **Simulação de aprendizado:** começar com metade do desenvolvimento na base e acrescentar o resto em lotes. A cobertura sobe? Mostra na banca o efeito de "aprender com correções".
- **Injeção de ruído:** acrescentar de propósito 10 casos com rótulo errado. Quanto a qualidade cai? Os controles de entrada pegam?
- **Reversão:** ativar uma versão ruim e voltar. Funciona em um passo?
- **Conflito:** inserir um caso com o mesmo texto de outro e OBFs diferentes. O sistema avisa?

## Hipótese de partida

Entrada direta para correções feitas pelo analista, com os controles automáticos e registro de origem; versões imutáveis; aceite sem alteração não entra na base. Fila de aprovação só para carga em lote.

## O que mudaria a decisão

- A Energisa ter uma pessoa para aprovar: a fila passa a valer para tudo.
- O volume de correções ser alto: o lote periódico com medição antes de ativar fica mais seguro.
- A injeção de ruído mostrar que poucos casos errados derrubam a qualidade: aprovação obrigatória.

## Resultado

_A preencher depois do experimento e das respostas da Energisa._
