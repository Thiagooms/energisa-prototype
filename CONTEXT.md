# Projeto Energisa · Equipe I — Contexto do protótipo

_Este repositório é um laboratório. Aqui a equipe testa arquiteturas, implementações e modelos diferentes para o mesmo problema, mede todas com a mesma régua e só depois leva a vencedora para o repositório do projeto._

_Vocabulário de negócio: [GLOSSARIO.md](GLOSSARIO.md). Regras de trabalho: [AGENTS.md](AGENTS.md). Decisões de desenho e trade-offs: [design/](design/00-visao-geral.md)._

## O problema

A Energisa recebe decisões judiciais e precisa transformar cada uma em Obrigações de Fazer (OBFs), ações padronizadas com código próprio. Hoje um analista cola o dispositivo da decisão num formulário e um caça-palavras sugere as OBFs. O desafio é trocar só essa etapa por uma solução de IA.

Pergunta do desafio: como usar IA para aumentar a assertividade e reduzir o esforço operacional na identificação das OBFs?

O que está em jogo: os prazos são curtos (muitas vezes 1 dia) e uma OBF não identificada gera multa diária.

## Entrada e saída

**Entrada:** o texto do dispositivo de uma decisão judicial (mediana de 520 caracteres, de 6 a 2.520).

**Saída**, uma entrada por OBF indicada:

| Campo | Conteúdo |
|---|---|
| OBF | código e descrição conforme o catálogo |
| Justificativa | fundamentação objetiva, uma por OBF |
| Nível de confiança | percentual, usado para priorizar a revisão do analista |
| Trecho identificado | citação literal do dispositivo de onde a OBF saiu |

Quando não há base para indicar, a solução se abstém e manda o caso para análise humana.

## Os dados

Planilha `dados/enovaia-500-casos.xlsx` (fora do git, confidencial):

| Aba | Conteúdo |
|---|---|
| Solicitações | 500 dispositivos, sem resposta |
| Amostra com gabarito | 250 casos rotulados, todos contidos nas 500; 222 processos distintos |
| OBFs | catálogo com 26 códigos em 8 famílias |
| Modelo de resposta | formato da saída |
| Possibilidades extras | duas automações opcionais |

Fatos medidos no gabarito:

- **Tipos de decisão:** 189 liminares, 58 sentenças de mérito, 3 de descumprimento.
- **OBFs frequentes:** 692 (176 casos), 208 e 209 (149 cada, sempre juntas), 687 (140).
- **OBFs intermediárias:** 617 e 618 (21), 695 (18), 679 e 690 (16), 619 (15).
- **OBFs raras:** 694 (9), 682 e 681 (5), e oito códigos com 1 ou 2 casos.
- **OBFs sem nenhum exemplo:** 688, 689, 683, 684 e 703.

Problemas conhecidos do gabarito (contagens da análise anterior da equipe, a reconferir):

- cerca de 26 casos trazem uma anotação do analista no lugar do dispositivo;
- cerca de 15 textos têm o código da OBF escrito, o que entrega a resposta;
- 7 casos são "sem resposta, análise humana";
- os casos 10 e 24 têm o mesmo texto e OBFs diferentes.

## Regras de negócio

- 618 e 679 não coexistem para o mesmo débito.
- Havendo possibilidade de recálculo, priorizar a 679.
- Ao religar, avaliar 208/209 junto com 687 e 692.
- Pares 208/209, 617/618 e 619/679: sugerir os dois quando a decisão não esclarece o detalhe; se for objetiva, indicar só um.

## Decisões já tomadas

| Decisão | Motivo |
|---|---|
| Não treinar modelo; usar RAG | Base pequena: cerca de 175 casos de desenvolvimento, 16 das 26 OBFs com 9 exemplos ou menos. Validado com o mentor e com o professor. |
| Divisão 70/30 por processo | Cerca de 175 casos de desenvolvimento e 75 de teste. Casos do mesmo processo ficam sempre do mesmo lado. |
| Teste usado uma única vez | Os indicadores da banca precisam ser medidos no teste, e ele só vale se nunca orientou ajuste. |
| Entrada é o texto do dispositivo | É como o processo atual da Energisa funciona. Upload e extração de PDF ficam fora do protótipo. |
| Sem LangChain | O fluxo cabe em poucas centenas de linhas de Python; o framework só acrescentaria uma camada para depurar. |
| Catálogo e regras como conhecimento | Única forma de cobrir as OBFs raras e as sem exemplo. Recomendação da própria Energisa. |

## Em aberto

- **Qual LLM usar.** API externa depende do aval da Energisa (confidencialidade); modelo local custa mais configuração. O código precisa permitir trocar o modelo sem mexer nas arquiteturas.
- **Regra dos pares.** A apresentação diz "se objetiva, indique só um"; no gabarito, 208 e 209 aparecem juntas em 149 de 149 casos.
- **679 pareada com 617 ou 619.** O catálogo se contradiz; provável erro de digitação.
- **Casos 10 e 24.** Mesmo texto, rótulos diferentes.

## Como a solução é avaliada

Critérios do regulamento: inovação e originalidade (30%), viabilidade técnica (25%), alinhamento com projetos de impacto (25%), qualidade do pitch (20%).

Perguntas da banca: chegou à mesma classificação dos especialistas? É executável sem investimento excessivo? Vai além de palavras-chave? O analista entende por que a OBF foi sugerida? Suporta mais volume? É simples para o analista?

Entregáveis: documento executivo, protótipo, demonstração do fluxo completo e indicadores medidos nos casos de teste.

## Prazo

Entrega em 30 de novembro de 2026.
