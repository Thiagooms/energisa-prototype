# Board

Quadro livre para desenhar sistemas e fluxos de qualquer assunto: cards, formas, textos, notas adesivas, grupos e setas. Ocupa a tela inteira, com as ferramentas numa barra à esquerda.

O board não é específico do projeto Energisa. O que é do projeto fica num catálogo à parte, na Biblioteca, e na visão Mapa dos candidatos.

| Visão | Para quê |
|---|---|
| Board | Montar um desenho com as ferramentas da barra, ligar com setas e editar textos e cores |
| Mapa dos candidatos | Ver as opções de cada decisão do projeto Energisa e o caminho dos candidatos A, B e C. Abre pelo menu `⋯` do board |

## Como abrir

Abra `index.html` no navegador, com dois cliques. Não precisa de servidor nem de instalação.

Para testar no celular, sirva a pasta e abra pelo IP da máquina:

```powershell
python -m http.server 8765 --directory board
```

## A tela

| Onde | O que tem |
|---|---|
| Canto de cima, à esquerda | Nome do board, Modelos e o menu `⋯` (exportar, importar, encaixe na grade, atalhos, Mapa dos candidatos, esvaziar) |
| Barra à esquerda | Ferramentas, Biblioteca, Desfazer e Refazer |
| Canto de cima, à direita | Apresentar |
| Canto de baixo, à direita | Zoom, ver tudo e atalhos |

No celular a barra de ferramentas vai para a parte de baixo da tela e rola para o lado.

## Ferramentas

Cada ferramenta tem uma tecla. Depois de criar um bloco, a ferramenta volta para Selecionar. A Seta continua ativa até `V` ou `Esc`.

| Tecla | Ferramenta | Como usar |
|---|---|---|
| `V` | Selecionar | Clicar, arrastar, laçar vários |
| `H` | Mover a tela | Arrastar. Segurar `Espaço` faz o mesmo em qualquer ferramenta |
| `C` | Card | Clicar para colocar, ou arrastar para definir o tamanho. Tem título, descrição, etiqueta e ícone |
| `T` | Texto | Clicar onde o texto começa |
| `N` | Nota adesiva | Clicar para colar |
| `R` `O` `D` | Formas | Retângulo, elipse e decisão. O botão abre as outras: início ou fim, banco de dados, hexágono e nuvem |
| `L` | Seta | Arrastar de um bloco até outro |
| `G` | Grupo | Arrastar em volta dos blocos |
| `B` | Biblioteca | Abre os catálogos de componentes prontos |

## Biblioteca e modelos

A Biblioteca tem um catálogo por aba. A busca procura em todos de uma vez.

| Catálogo | O que tem |
|---|---|
| Componentes | Peças comuns de desenho de sistemas: usuário, API, serviço, fila, banco de dados, cache, modelo de linguagem e outras |
| Energisa | Consulta do projeto: os atores do fluxo e as opções das decisões D1 a D8, por etapa. Esses cards abrem os trade-offs |

Modelos troca o board por um desenho pronto: aplicação web em camadas, fila e workers, busca com IA, fluxograma e os candidatos A, B e C do projeto Energisa.

## Atalhos e gestos

O botão `?`, no canto de baixo, mostra a mesma lista dentro do board.

| Para | Faça |
|---|---|
| Mover a tela | Segure `Espaço` e arraste; ou botão do meio; ou a rolagem |
| Zoom | `Ctrl` + rolagem, `+` e `-`. `Ctrl+0` volta a 100%, `Shift+1` mostra tudo, `Shift+2` enquadra a seleção. No celular, pinça |
| Selecionar | Clique; `Shift` + clique soma; arraste no fundo para laçar vários; `Ctrl+A` seleciona tudo; `Esc` limpa |
| Criar bloco | Ferramenta da barra; dois cliques no fundo criam um card; `Tab` cria um bloco já ligado ao selecionado; botão direito |
| Editar texto | Dois cliques no bloco, `Enter` ou `F2`. `Enter` confirma, `Shift+Enter` quebra linha, `Tab` vai do título à descrição, `Esc` cancela |
| Mover bloco | Arraste, ou use as setas do teclado. `Shift` trava no eixo, `Ctrl` desliga o encaixe, `Alt` + arrastar duplica |
| Mudar tamanho | Selecione um item e arraste um dos quatro cantos |
| Ligar blocos | Ferramenta Seta, ou puxe um ponto da borda até outro bloco. Solto no vazio, cria um bloco novo já ligado |
| Religar seta | Arraste a seta, ou uma das pontas, e solte em outro bloco. Solta no vazio, ela volta ao lugar |
| Estilo da seta | Selecione a seta: rótulo, traçado (curva, reta, cotovelo), pontas, tracejada e inverter sentido |
| Copiar e colar | `Ctrl+C`, `Ctrl+V` (cola onde o mouse está), `Ctrl+X`, `Ctrl+D` |
| Agrupar e ordenar | `Ctrl+G` cria um grupo em volta da seleção; `]` traz para frente, `[` manda para trás |
| Alinhar | Selecione dois ou mais blocos: alinhar e distribuir aparecem nas propriedades. Ao arrastar, guias rosa mostram o alinhamento com os vizinhos |
| Desfazer | `Ctrl+Z` e `Ctrl+Shift+Z`. `Esc` cancela um arrasto em andamento |
| Apagar | `Delete`. Apagar um grupo mantém os blocos de dentro |
| Menu | Botão direito no bloco, na seta ou no fundo |
| Apresentar | Botão Apresentar: tela cheia, sem edição. Clicar num card de catálogo mostra os detalhes. `Esc` sai |

## Onde o desenho fica salvo

O desenho fica salvo no navegador de quem editou, por endereço: o que foi feito abrindo o arquivo direto não aparece em `localhost`, e vice-versa. Para levar a outra máquina:

1. Abra o menu `⋯`, clique em Exportar desenho e copie o texto.
2. Na outra máquina, abra o menu `⋯`, clique em Importar desenho e cole.

Para fixar um desenho como padrão do repositório (por exemplo, o do pitch), cole o texto exportado em `js/desenho-inicial.js`:

```js
window.Board = window.Board || {};
window.Board.desenhoInicial = { "versao": 2, "nome": "", "nos": [], "ligacoes": [] };
```

Quem abrir o board sem desenho salvo começa por ele, e ele passa a aparecer em Modelos como "Desenho do repositório". Sem desenho padrão, o board abre vazio.

## Estrutura

```text
index.html                        página e ordem de carga dos scripts
css/base.css                      cores, tipografia, botões e janela de detalhe
css/mapa.css                      visão Mapa dos candidatos
css/livre.css                     visão Board
js/dados.js                       dados do projeto Energisa: etapas, decisões, opções e candidatos
js/desenho-inicial.js             desenho padrão do repositório (vazio por enquanto)
js/util.js                        funções comuns e cálculo das medidas do mapa
js/dialogo.js                     janela modal
js/detalhe.js                     conteúdo da janela de trade-offs
js/mapa.js                        visão Mapa dos candidatos
js/livre/icones.js                ícones da barra e dos cards
js/livre/estado.js                desenho, histórico de desfazer, salvar, importar, exportar e registro de catálogos
js/livre/blocos.js                criação de cards, textos, grupos e formas; silhueta de cada forma
js/livre/catalogos/geral.js       catálogo Componentes e modelos gerais
js/livre/catalogos/energisa.js    catálogo Energisa, modelos dos candidatos e ligação com os trade-offs
js/livre/geometria.js             cálculo das setas: lados, pontos de chegada e traçados
js/livre/palco.js                 tela: desenho dos itens, seleção, zoom, copiar, alinhar, agrupar
js/livre/edicao.js                edição de texto direto no bloco
js/livre/gestos.js                mouse e toque: ferramentas, mover, laçar, redimensionar, ligar, religar, pinça
js/livre/menu.js                  menu do botão direito e do botão de opções
js/livre/teclado.js               atalhos de teclado
js/livre/ferramentas.js           barra de ferramentas à esquerda e painel de formas
js/livre/paleta.js                Biblioteca: abas de catálogo, busca e arrastar para o board
js/livre/inspetor.js              painel de propriedades
js/livre/livre.js                 nome do board, modelos, exportar, importar, ajuda e modo de apresentação
js/app.js                         troca entre as visões
empacotar.py                      junta tudo num arquivo só, em dist/board.html
```

## Catálogo novo

O núcleo do board não conhece nenhum projeto. Um catálogo é um arquivo em `js/livre/catalogos/` que chama `L.registrarCatalogo` com `id`, `nome`, `secoes` e `fabricar`, e entra na Biblioteca como uma aba. `L.registrarModelo` acrescenta um desenho pronto à janela Modelos. Os dois arquivos existentes servem de exemplo. Para o catálogo aparecer, inclua o arquivo em `index.html`, depois de `blocos.js`.

O texto dos cards do catálogo Energisa vem de `js/dados.js`, que resume os documentos de `design/`. Se uma decisão mudar lá, atualize aqui.

## Arquivo único

`python empacotar.py` gera `dist/board.html`, com CSS e JS embutidos. Serve para publicar o board como página única. A pasta `dist/` não entra no git.
