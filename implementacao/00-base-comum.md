# Plano 00 — Base comum

**Status:** proposto · **Esforço estimado:** meio dia · **Depende de:** nada

## Objetivo

Construir uma vez o que todas as arquiteturas usam: leitura dos dados, divisão 70/30, catálogo, contrato de resposta, acesso ao LLM e avaliador. Com isso, cada arquitetura só escreve a própria lógica e todas são medidas da mesma forma.

## Componentes

| Arquivo | Responsabilidade |
|---|---|
| `base/dados.py` | Lê a planilha e devolve casos (`id`, `processo`, `tipo_decisao`, `dispositivo`, `obfs`). Só entrega o conjunto de teste quando chamado pelo avaliador final. |
| `base/divisao.py` | Gera `dados/divisao.json` com os IDs de desenvolvimento e de teste, agrupando por processo, com semente fixa. Roda uma vez. |
| `base/catalogo.py` | As 26 OBFs (código, descrição, detalhamento, família), os pares e as regras de negócio como dados. |
| `base/limpeza.py` | Limpeza única do dispositivo: mascara códigos de OBF, nomes, números de processo e valores. Usada na base e na consulta. |
| `base/contrato.py` | Tipos `Indicacao` e `Resposta`, e validação da saída. |
| `base/llm.py` | Uma função `gerar(mensagens, esquema)` com o provedor, o modelo e a temperatura vindos de configuração. |
| `base/avaliacao.py` | Roda uma arquitetura sobre o desenvolvimento e calcula as métricas. |
| `base/registro.py` | Resolve uma arquitetura pelo nome, para o avaliador e para o plano 05, que envolve outra arquitetura sem importar a pasta dela. |
| `avaliar.py` | Linha de comando: `python avaliar.py <arquitetura> [--final]`. |

Módulos que nascem nos planos seguintes e também moram em `base/`, por servirem a mais de uma arquitetura:

| Arquivo | Nasce no | Responsabilidade |
|---|---|---|
| `base/prompt_catalogo.py` | plano 02 | Bloco de catálogo e regras renderizado para o prompt. |
| `base/embeddings.py` | plano 03 | `embutir(textos)`, com modelo local vindo de configuração. |
| `base/verificacoes.py` | plano 05, fatia 1 | Código, descrição, trecho literal e regras de negócio como verificações. |

## Contrato que toda arquitetura implementa

```python
class Arquitetura:
    nome: str

    def preparar(self, casos_dev: list[Caso]) -> None: ...

    def indicar(self, dispositivo: str, excluir_processo: str | None = None) -> Resposta: ...
```

- `preparar` roda uma vez e monta o que for caro (índices, embeddings).
- `indicar` recebe o texto de um dispositivo. Quando `excluir_processo` vem preenchido, os casos daquele processo não podem ser usados como precedente.

```python
@dataclass
class Indicacao:
    codigo: str
    descricao: str
    justificativa: str
    confianca: int
    trecho: str

@dataclass
class Resposta:
    indicacoes: list[Indicacao]
    abstencao: bool
    motivo_abstencao: str | None
    meta: dict
```

`meta` guarda modelo, latência, tokens e o que a arquitetura quiser registrar (precedentes usados, determinações extraídas).

Os parâmetros de cada arquitetura (k, limiares, tipo de busca) ficam na própria classe, com valores padrão, e podem ser trocados na linha de comando: `python avaliar.py a1_vizinhos --param busca=densa --param k=5`. O avaliador grava os parâmetros usados junto com o resultado.

O texto que a arquitetura busca é o limpo; o trecho devolvido sai sempre do dispositivo original.

## Divisão dos dados

1. Agrupar os 250 casos por processo (222 grupos).
2. Sortear os grupos com semente fixa até o teste somar cerca de 75 casos.
3. Conferir que nenhum processo aparece nos dois lados.
4. Conferir que cada OBF com 3 casos ou mais tem pelo menos um caso no desenvolvimento.
5. Gravar `dados/divisao.json` e não editar mais.

A divisão antiga do projeto principal (124/126) não é reaproveitada aqui: este repositório nasce com divisão nova, e nenhum caso foi visto por código deste repositório antes dela.

## Avaliação

Para cada caso de desenvolvimento, o avaliador chama `indicar(dispositivo, excluir_processo=processo_do_caso)` e compara com o gabarito.

| Métrica | Como se calcula |
|---|---|
| Cobertura por OBF e geral | OBFs do gabarito que a arquitetura indicou |
| Precisão por OBF e geral | OBFs indicadas que estão no gabarito |
| F1 micro, F1 macro e F2 | a partir de cobertura e precisão |
| Acerto exato do caso | conjunto indicado idêntico ao do gabarito |
| Correções por caso | OBFs a adicionar mais OBFs a remover |
| Variante por pares | as mesmas métricas contando 208/209, 617/618 e 619/679 como um item |
| Trecho literal | percentual de trechos que existem no dispositivo |
| Abstenção | taxa de abstenção e acerto nos casos respondidos |
| Calibração | acerto por faixa de confiança |
| Custo | latência média, tokens e chamadas por caso |

A saída vai para `resultados/<arquitetura>/<data>-<modelo>.json`, com as métricas e a resposta de cada caso, para análise de erro.

O modo `--final` roda no conjunto de teste, com a base formada por todo o desenvolvimento, e pede confirmação antes de executar.

## Passos

- [ ] Criar o ambiente Python e o `requirements.txt` com o leitor de planilha.
- [ ] `base/dados.py`: ler as abas "Amostra com gabarito" e "OBFs"; extrair os códigos da coluna de OBF esperada.
- [ ] `base/divisao.py`: gerar e gravar a divisão; imprimir a contagem por OBF de cada lado.
- [ ] `base/catalogo.py`: catálogo, famílias, pares e regras.
- [ ] `base/limpeza.py`: regras de limpeza e contagem de casos afetados por regra.
- [ ] `base/contrato.py`: tipos e validação.
- [ ] `base/llm.py`: função única, com provedor configurável.
- [ ] `base/avaliacao.py` e `avaliar.py`: métricas e gravação dos resultados.
- [ ] Arquitetura de fumaça que sempre indica 208, 209, 687 e 692, para validar o avaliador de ponta a ponta.

## Riscos

| Risco | Tratamento |
|---|---|
| Vazamento do teste | `dados.py` só entrega o teste ao modo `--final`; a base de busca recusa IDs de teste. |
| Gabarito com ruído | A limpeza marca os casos problemáticos; o avaliador reporta métricas com e sem eles. |
| LLM ainda não escolhido | `llm.py` isola o provedor; o plano 01 roda sem LLM. |
| OBF rara cair toda no teste | Conferência no passo 4 da divisão. |

## Pronto quando

- `python avaliar.py fumaca` roda sobre o desenvolvimento e grava um resultado com todas as métricas.
- A divisão está gravada e a conferência de processos passa.
- Nenhum módulo fora do avaliador final consegue ler um caso de teste.

## Resultados

_A preencher._
