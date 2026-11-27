# Projeto Energisa · Equipe I — Glossário de negócio

_Linguagem do domínio do desafio: os termos que a Energisa, o Judiciário e a equipe usam para falar do problema. O contexto do protótipo fica em [CONTEXT.md](CONTEXT.md)._

_Fontes: apresentação "Desafio PB Júnior × Energisa — Reunião com as equipes" (outubro de 2026), planilha "enovaIA – 500 casos" e issues T1 a T11 do board do projeto._

_Mantido por `/ad-domain`. Um nome canônico por conceito; os sinônimos que causam confusão aparecem em "Evitar"._

## Linguagem

### Amostra com gabarito

**Definição:** aba da planilha com 250 casos já rotulados pelos especialistas da Energisa, a única fonte de respostas certas do desafio.

_Evitar_: "base de treino". Ela é dividida em conjunto de desenvolvimento e conjunto de teste, e só o primeiro pode ser usado para ajustar a solução.

### Analista

**Definição:** pessoa da Energisa que lê o dispositivo, indica as OBFs e, na solução proposta, revisa e corrige as sugestões do agente.

_Evitar_: "atendente" e "usuário". A planilha usa "atendente" nas possibilidades extras; no projeto, o nome canônico é analista.

### Anotação do analista

**Definição:** texto do gabarito que, em vez do dispositivo da decisão, traz um comentário interno do analista (cerca de 26 casos).

### Área responsável

**Definição:** setor da Energisa que executa a ordem de serviço gerada por uma OBF, como campo, faturamento ou cadastro.

### Caça-palavras

**Definição:** modelo atual da Energisa, que indica OBFs procurando palavras-chave no texto da decisão; é a única etapa do processo que o desafio substitui.

_Evitar_: "sistema atual" sem qualificar. O resto do processo (OS, cumprimento) continua igual.

### Carteira judicial

**Definição:** marcação interna que coloca a unidade consumidora sob proteção judicial, impedindo o corte por inadimplência e suspendendo cobranças enquanto a decisão vigorar.

A inclusão é a OBF 687 e a retirada é a OBF 689.

### Caso

**Definição:** uma solicitação cujas OBFs já foram validadas, seja pelo gabarito da Energisa, seja por uma correção aprovada de analista; é a unidade da base de conhecimento.

_Evitar_: "ticket", "ordem" e "registro". "Ticket" aparece no slide da etapa 4, mas não é um termo do domínio; "registro" é termo de banco de dados.

### Catálogo de OBFs

**Definição:** lista oficial das 26 OBFs, com código, descrição e detalhamento simplificado de quando usar cada uma (camada 2 dos dados).

### Classe processual

**Definição:** categoria do tipo de ação judicial, que faz parte dos metadados da base histórica junto com tribunal e UF.

### Condição

**Definição:** trecho de uma determinação que restringe ou altera o que deve ser feito, como "desde que o corte seja em razão de…" ou "até ulterior determinação".

A Energisa recomendou ler as condições com atenção, porque mudam a OBF correta.

### Conjunto de desenvolvimento

**Definição:** os cerca de 175 casos (70%) da amostra com gabarito que a equipe pode usar para testar, ajustar e alimentar a base de conhecimento.

### Conjunto de teste

**Definição:** os cerca de 75 casos (30%) da amostra com gabarito reservados para medir a solução uma única vez, no final; nunca entram na base nem orientam ajustes (camada 3 dos dados).

_Evitar_: "validação". A Energisa chama de "casos para teste", e "validação" aqui significa a revisão do analista.

### Cumprimento

**Definição:** execução da ordem de serviço pela área responsável e seu registro no sistema, encerrando a obrigação.

### Decisão judicial

**Definição:** o pronunciamento completo do juiz em um processo, que pode ser uma liminar, uma sentença de mérito ou uma decisão de descumprimento.

Uma decisão tem três partes: o relatório (resumo do caso, mais comum nas sentenças), a fundamentação (os motivos do juiz) e o dispositivo (o que ele decide). A planilha traz só o dispositivo. Ver a anatomia em [Relações](#relações).

_Evitar_: "ordem judicial" (usado nos slides da equipe) e "documento". "Ordem" sugere um único comando, mas uma decisão costuma ter várias determinações e também partes que não mandam fazer nada. "Documento" é o arquivo recebido na etapa 2, e não o ato do juiz.

### Descumprimento

**Definição:** não cumprimento de uma determinação no prazo, que gera multa diária e sanções; também é um tipo de decisão, que reitera uma ordem já descumprida (3 casos na amostra).

### Determinação

**Definição:** cada ordem dirigida à Energisa dentro do dispositivo, formada por uma ação sobre um objeto (religar o fornecimento, não incluir o nome em cadastro de crédito, não cobrar um débito); é a unidade que gera OBFs.

Como separar:
- Uma ação sobre um objeto é uma determinação. Dois verbos de ordem na mesma frase ("restabeleça o fornecimento e abstenha-se de negativar") são duas determinações.
- Condições, prazo e multa não são determinações próprias. Acompanham a determinação a que se referem.
- O que não é ordem à Energisa não é determinação: a concessão ou negação do pedido ("defiro a tutela"), providências do processo ("cite-se", "intime-se") e ordens a outras partes.

Uma determinação pode gerar uma ou mais OBFs. A religação, por exemplo, gera 208 e 209.

_Evitar_: "comando", "item" e "pedido". "Comando" aparece na apresentação da Energisa, mas o JSON da etapa 3 usa `DETERMINACOES`, e o nome precisa ser um só. "Pedido" é o que a parte autora solicita, não o que o juiz manda.

### Dispositivo

**Definição:** a parte conclusiva da decisão judicial, em que o juiz diz o que decidiu; é o único trecho da decisão que a planilha traz e que a solução lê.

O dispositivo contém as determinações, mas não só elas. Também traz a resposta ao pedido ("defiro a tutela de urgência"), o prazo, a multa por descumprimento e providências do processo ("cite-se", "intime-se"), que não geram OBF. Na planilha, a mediana é de 520 caracteres (de 6 a 2.520).

_Evitar_: "decisão" ou "texto da decisão" para se referir a esse trecho. A decisão é o pronunciamento inteiro, e o dispositivo é uma parte dela.

### Família de OBFs

**Definição:** agrupamento das 26 OBFs em 8 temas: fornecimento de energia, débitos e faturamento, tributos, restituição financeira, proteção judicial e cobrança, cadastro, infraestrutura e obras, inspeção e medição.

### Liminar

**Definição:** decisão provisória e urgente, tomada antes do julgamento final, como a antecipação de tutela; é o tipo mais comum na amostra (189 de 250).

_Evitar_: tratar "antecipação de tutela" e "tutela de urgência" como tipos diferentes. Na planilha todas aparecem como "Decisão Liminar".

### Multa diária

**Definição:** penalidade cobrada por dia de atraso no cumprimento de uma determinação; é o principal risco de uma OBF não identificada.

### Negativação

**Definição:** inclusão do nome do cliente em órgãos de proteção ao crédito (SPC, Serasa, SCPC) por causa de uma dívida.

A retirada por ordem judicial é a OBF 692.

### Nível de confiança

**Definição:** percentual que acompanha cada indicação de OBF na resposta e serve para priorizar a revisão do analista.

### OBF (Obrigação de Fazer)

**Definição:** ação padronizada, com código próprio (ex.: 687), que a Energisa precisa executar para cumprir uma determinação; inclui também ordens de não fazer, como abster-se de cortar.

_Evitar_: "rótulo", "tag" e "categoria" na conversa de negócio. "Rótulo" só cabe ao falar do gabarito como dado.

### Ordem de serviço (OS)

**Definição:** tarefa aberta no sistema jurídico interno para que a área responsável execute uma OBF.

### Pares de OBFs

**Definição:** OBFs que o catálogo manda sugerir juntas, porque o detalhe que separa uma da outra só é conhecido nos sistemas internos e não aparece na decisão: 208/209 (com ou sem medidor), 617/618 (débito comum ou recuperação de consumo) e 619/679 (refaturamento comum ou de recuperação de consumo).

### Parte autora e parte ré

**Definição:** quem move a ação (em geral o consumidor) e contra quem ela é movida (a Energisa).

_Evitar_: "cliente" ao falar do processo. Nem sempre a parte autora é cliente titular da unidade consumidora.

### Prazo

**Definição:** tempo que a decisão dá para o cumprimento, muitas vezes de 1 dia.

### Processo

**Definição:** a ação judicial, identificada pelo número do processo; um mesmo processo pode gerar várias decisões ao longo do tempo.

Os conjuntos de desenvolvimento e de teste foram divididos por processo, para que decisões quase iguais do mesmo processo não fiquem uma de cada lado.

### Recuperação de consumo

**Definição:** cobrança retroativa de energia consumida e não faturada, apurada a partir de um TOI; as OBFs 618 (cancelar) e 679 (refaturar) tratam desse débito.

### Refaturamento

**Definição:** recálculo de contas ou de um débito conforme critérios da decisão, gerando um novo valor que pode ser cobrado (OBFs 619 e 679).

_Evitar_: confundir com cancelamento (617 e 618), em que o valor deixa de poder ser cobrado.

### Regras de negócio

**Definição:** combinações obrigatórias e proibidas entre OBFs (camada 4 dos dados), como "618 e 679 não coexistem para o mesmo débito" e "ao religar, avalie 208/209 com 687 e 692".

### Religação

**Definição:** restabelecimento do fornecimento de energia de uma unidade consumidora por ordem judicial (OBFs 208 e 209).

_Evitar_: "ligação nova". Ligar um imóvel que nunca teve energia é a OBF 695.

### Resposta

**Definição:** saída que a Energisa espera para cada solicitação, com quatro partes por OBF: código e descrição, justificativa, nível de confiança e trecho identificado.

### Sem resposta (análise humana)

**Definição:** caso do gabarito em que a Energisa não indicou OBF e encaminhou para análise humana (7 casos); serve de exemplo de quando a solução deve se abster.

### Sentença de mérito

**Definição:** decisão que julga o pedido de forma definitiva naquela instância; é o segundo tipo mais comum na amostra (58 de 250).

### Solicitação

**Definição:** decisão judicial que chega à Energisa para ter suas OBFs identificadas; a planilha tem 500, na aba "Solicitações", sem resposta.

_Evitar_: "caso" para uma solicitação ainda não validada. O caso é a solicitação depois de ter as OBFs confirmadas.

### Suspensão do fornecimento

**Definição:** corte da energia de uma unidade consumidora; por ordem judicial é a OBF 688, e a ordem de não cortar é coberta pela 687.

### TOI (Termo de Ocorrência e Inspeção)

**Definição:** documento lavrado na inspeção que registra uma irregularidade na medição e dá origem à recuperação de consumo.

### Trecho identificado

**Definição:** citação literal do dispositivo de onde saiu cada OBF indicada, exigida na resposta para que o analista confira a indicação.

### Tributos (ICMS sobre TUSD/TUST)

**Definição:** discussões sobre a cobrança de ICMS sobre as tarifas de uso dos sistemas de distribuição (TUSD) e de transmissão (TUST), tratadas pelas OBFs 682, 683 e 684.

### Unidade consumidora (UC)

**Definição:** o ponto de entrega de energia de um cliente, com medidor e cadastro próprios; é sobre ela que recaem religação, corte, troca de medidor e carteira judicial.

## Relações

### Anatomia de uma decisão

Exemplo inventado, para mostrar onde cada termo se encaixa:

```text
Decisão judicial (tipo: liminar)
├── Relatório ...................... não vem na planilha
├── Fundamentação .................. não vem na planilha
└── Dispositivo .................... é o que a planilha traz
    ├── "Defiro a tutela de urgência"                    resposta ao pedido, não gera OBF
    ├── "e determino que a ré, no prazo de 24 horas,"    prazo
    ├── "restabeleça o fornecimento de energia da UC,    determinação 1: religar o fornecimento
    │    desde que o corte decorra do débito discutido"   └── condição da determinação 1
    ├── "e abstenha-se de incluir o nome da autora       determinação 2: não negativar
    │    nos cadastros de proteção ao crédito,"
    ├── "sob pena de multa diária de R$ 500,00."         multa, não gera OBF
    └── "Cite-se. Intime-se."                            providência do processo, não gera OBF
```

Resultado: um dispositivo com 6 trechos, dos quais só 2 são determinações. São essas duas que a etapa 3 extrai e que a etapa 5 transforma em OBFs.

### Relações entre os termos

- Um **processo** gera uma ou mais **decisões judiciais** ao longo do tempo.
- Uma **solicitação** traz uma **decisão judicial**, e dela o desafio usa só o **dispositivo**.
- Um **dispositivo** contém zero ou mais **determinações**. Zero acontece, por exemplo, quando o juiz nega o pedido e não ordena nada à Energisa.
- Cada **determinação** pode ter **condições** e um **prazo**.
- Uma **determinação** gera zero ou mais **OBFs**.
- Uma **OBF** pertence a uma única **família** e vira uma **ordem de serviço** para uma **área responsável**, que faz o **cumprimento**.
- Uma **solicitação** com OBFs validadas vira um **caso**. A **amostra com gabarito** tem 250 casos, divididos por **processo** em **conjunto de desenvolvimento** (cerca de 175) e **conjunto de teste** (cerca de 75).
- A **resposta** traz, para cada **OBF** indicada, uma justificativa, um **nível de confiança** e um **trecho identificado**.
- As **regras de negócio** e os **pares de OBFs** valem sobre o conjunto de OBFs de um caso, e não sobre uma determinação isolada.

## Ambiguidades sinalizadas

- **Rótulo por caso × por determinação.** O gabarito diz quais OBFs um caso recebeu, mas não qual determinação gerou cada uma. Impacta a granularidade da base (T1).
- **Pares de OBFs × "se objetiva, indique só 1".** A apresentação diz que, numa decisão objetiva, basta um código do par; o catálogo manda sugerir sempre os dois, e no gabarito 208 e 209 aparecem juntas em 149 de 149 casos. Pergunta enviada à Energisa (T10).
- **679 pareada com 617?** No catálogo, a 619 diz para sugerir junto com a 679, mas a 679 diz para sugerir junto com a 617. Provável erro de digitação, a confirmar com a Energisa (T10).
- **"Abster-se" × abstenção da solução.** "Abster-se de suspender" é uma determinação do juiz (vira a OBF 687). Abstenção da solução é quando o agente não indica OBF e manda para análise humana. Nos documentos, usar "determinação de não fazer" para o primeiro sentido e "abstenção" só para o segundo.
- **Quando "abster-se de suspender" gera também as OBFs de religação.** Não está claro no catálogo (T10).
- **Mesmo texto, rótulos diferentes.** Os casos 10 e 24 têm o mesmo dispositivo e OBFs diferentes no gabarito (T10).
- **Entrada em produção.** Não se sabe se o analista vai enviar o PDF da decisão ou colar o texto do dispositivo (T10).
