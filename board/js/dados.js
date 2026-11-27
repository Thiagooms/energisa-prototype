window.Board = window.Board || {};
(function (B) {
const ETAPAS = [
  { id: "indexar", nome: "Indexar", cor: "amber", icone: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>' },
  { id: "recuperar", nome: "Recuperar", cor: "violet", icone: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>' },
  { id: "responder", nome: "Responder", cor: "blue", icone: '<path d="M4 5h16v11H9l-5 4V5z"/>' },
  { id: "aprender", nome: "Aprender", cor: "green", icone: '<path d="M20 4v5h-5"/><path d="M4 12a8 8 0 0114-5l2 2"/><path d="M4 20v-5h5"/><path d="M20 12a8 8 0 01-14 5l-2-2"/>' }
];

const DECISOES = [
  {
    id: "D1", etapa: "indexar", titulo: "O que vira registro na base",
    doc: "design/01-unidade-de-busca.md",
    teste: "Mesma busca e mesmo prompt, trocando só a unidade. Medir que fração das OBFs do gabarito aparece nos 5 casos recuperados, separando por número de determinações.",
    opcoes: [
      { id: "caso-inteiro", desc: "um vetor por dispositivo", como: "Cada dispositivo vira um registro e um vetor. O registro e o rótulo do gabarito coincidem.", ganha: "Nenhuma peça extra. Refaz a base em segundos.", perde: "Mistura todas as determinações do dispositivo num vetor só.", caso: "Linha de base. O texto cabe inteiro: a mediana é de 520 caracteres.", pecas: 0, risco: 0 },
      { id: "corte-por-tamanho", desc: "fixo ou recursivo, a cada N caracteres", como: "Corta o texto a cada N caracteres, com ou sem respeitar parágrafos e frases.", ganha: "Trivial de fazer.", perde: "Parte a determinação no meio e separa a ordem da condição (\"desde que...\").", caso: "Ruim aqui. Só faria sentido se a decisão completa em PDF fosse indexada.", pecas: 0, risco: 1 },
      { id: "estrutural", desc: "corta nos marcadores (i), (ii), a)", como: "Usa a numeração do próprio dispositivo para separar as ordens.", ganha: "Barato e sem LLM. Um pedaço por ordem numerada.", perde: "Falha nos dispositivos em prosa corrida, sem marcadores.", caso: "Parcial. Antes de apostar, contar quantos dispositivos têm marcadores.", pecas: 1, risco: 0 },
      { id: "pai-e-filho", desc: "busca na determinação, devolve o caso", como: "Um LLM extrai cada determinação (filho). A busca compara filhos e devolve o caso inteiro (pai), que guarda as OBFs.", ganha: "Precisão de busca por pedaço com o rótulo fiel ao gabarito. Alimenta a explicação ao analista.", perde: "Uma chamada de LLM para decompor. Um erro de extração contamina a base e a consulta.", caso: "Forte, com custo e risco. O gabarito rotula o caso, não a determinação.", pecas: 2, risco: 2, pedeDecomposicao: true, refazComLLM: true },
      { id: "contexto-no-pedaco", desc: "resumo do caso junto de cada pedaço", como: "Antes de gerar o vetor, acrescenta ao pedaço uma frase com o contexto do caso.", ganha: "O pedaço não perde de vista o caso a que pertence.", perde: "Uma chamada de LLM por pedaço na indexação. Ganho incerto em texto curto.", caso: "Opcional. Só faz sentido junto com pedaço pequeno.", pecas: 2, risco: 1, refazComLLM: true }
    ]
  },
  {
    id: "D2", etapa: "indexar", titulo: "Como o texto vira vetor",
    doc: "design/02-embeddings.md",
    teste: "Trocar só o modelo. Medir a recuperação sem LLM e a similaridade de 10 pares inventados de sentido contrário (\"suspenda\" e \"abstenha-se de suspender\").",
    opcoes: [
      { id: "multilingue-local", desc: "bge-m3 ou e5, na nossa máquina", como: "Modelo aberto treinado para busca, rodando em CPU. O bge-m3 aceita texto longo e gera também pesos por palavra.", ganha: "Nada sai da máquina. Versão fixa. Custo zero por uso.", perde: "Baixar e carregar o modelo, de centenas de MB a 2 GB.", caso: "Aposta de partida dos três candidatos.", pecas: 1, risco: 0 },
      { id: "portugues-juridico", desc: "BERTimbau ajustado a texto jurídico", como: "Modelo em português com vocabulário jurídico.", ganha: "Conhece o vocabulário do domínio.", perde: "Vários não foram treinados para busca, ou usam textos de Portugal. A qualidade varia muito.", caso: "Vale um teste para conferir a tese do especializado.", pecas: 1, risco: 0 },
      { id: "modelo-leve", desc: "e5-small, 384 dimensões", como: "Modelo multilíngue pequeno.", ganha: "Roda em qualquer notebook.", perde: "Limite de 512 tokens corta os dispositivos mais longos. Qualidade um pouco menor.", caso: "Reserva, se a máquina não aguentar o modelo grande.", pecas: 1, risco: 0 },
      { id: "servico-externo", desc: "embedding por API", como: "O texto é enviado a um provedor, que devolve o vetor.", ganha: "Nada para instalar. Qualidade em geral alta.", perde: "O texto sai da empresa. O provedor pode trocar o modelo.", caso: "Só com aval da Energisa.", pecas: 0, risco: 0 }
    ]
  },
  {
    id: "D3", etapa: "recuperar", titulo: "Como buscar os precedentes",
    doc: "design/03-recuperacao.md",
    teste: "Comparar densa, BM25, híbrida e híbrida com reranker. Olhar os casos de termo técnico (618, 679, 682) e de ordem negativa (687).",
    opcoes: [
      { id: "so-densa", desc: "cosseno entre vetores", como: "Compara o vetor da consulta com os da base.", ganha: "Pega paráfrase e sinônimo: \"religue\" e \"restabeleça\".", perde: "Aproxima ordens opostas sobre o mesmo assunto. Dilui termos raros.", caso: "Ponto de partida mais simples.", pecas: 0, risco: 0 },
      { id: "so-bm25", desc: "palavras em comum, peso nas raras", como: "Pontua os casos pelas palavras que dividem com a consulta.", ganha: "Exata em termo técnico (TOI, TUSD, Serasa). Explicável.", perde: "Perde paráfrase. Depende de como o texto é normalizado.", caso: "Cuidado: a lista padrão de palavras vazias apaga \"não\" e \"sem\".", pecas: 1, risco: 0 },
      { id: "hibrida-rrf", desc: "densa e BM25 fundidas por posição", como: "Roda as duas buscas e soma 1 / (60 + posição) de cada lista.", ganha: "Junta as duas forças sem ajustar pesos.", perde: "Duas buscas para manter.", caso: "Deve ganhar nos casos em que um termo técnico decide a OBF.", pecas: 1, risco: 0 },
      { id: "hibrida-reranker", desc: "híbrida e reordenação por cross-encoder", como: "Um segundo modelo lê consulta e candidato juntos e reordena.", ganha: "Ordem melhor nos primeiros resultados em bases grandes.", perde: "Mais um modelo e mais latência. Foi treinado para relevância, não para \"mesmas OBFs\".", caso: "Com cerca de 175 casos há pouco a reordenar.", pecas: 2, risco: 0 }
    ]
  },
  {
    id: "D4", etapa: "recuperar", titulo: "Onde os vetores moram",
    doc: "design/04-armazenamento.md",
    teste: "A qualidade não muda com o banco. Testar equivalência com a força bruta, latência com volume sintético e reversão de uma versão ruim.",
    opcoes: [
      { id: "matriz-em-memoria", desc: "numpy e arquivo, força bruta", como: "Os vetores ficam numa matriz e a busca compara com todos.", ganha: "Resultado exato. Zero instalação.", perde: "Sem transação, sem controle de acesso, sem histórico.", caso: "Suficiente para experimentar: a busca leva milissegundos.", pecas: 0, risco: 0 },
      { id: "chroma", desc: "banco vetorial simples", como: "Banco vetorial embutido ou em servidor.", ganha: "Sobe em minutos. Muito material de exemplo.", perde: "Vira um segundo sistema ao lado do banco dos casos. Busca híbrida limitada.", caso: "Não resolve nada que a matriz já não resolva no protótipo.", pecas: 1, risco: 0 },
      { id: "pgvector", desc: "vetor dentro do Postgres", como: "Extensão vetorial num banco relacional.", ganha: "Caso, OBFs, versão e vetor na mesma linha. Backup e permissões maduros.", perde: "BM25 não vem de fábrica: a fusão fica em SQL ou na aplicação.", caso: "Um lugar só para casos, correções e versões.", pecas: 1, risco: 0 },
      { id: "banco-dedicado", desc: "Qdrant, Weaviate, Milvus", como: "Serviço especializado em busca vetorial.", ganha: "Busca híbrida e filtro de fábrica. Escala a bilhões.", perde: "Mais um serviço para manter e sincronizar com o banco dos casos.", caso: "Resolve uma escala que não temos.", pecas: 2, risco: 0 },
      { id: "azure-ai-search", desc: "serviço gerenciado da Microsoft", como: "Busca híbrida gerenciada na nuvem Azure.", ganha: "Conversa com o Power Automate que a Energisa já usa.", perde: "Prende a solução à nuvem Azure e põe o dado em terceiros.", caso: "Entra se a TI da Energisa exigir ecossistema Microsoft.", pecas: 1, risco: 0 }
    ]
  },
  {
    id: "D5", etapa: "responder", titulo: "Como o LLM indica as OBFs",
    doc: "design/05-geracao.md",
    teste: "Catálogo sozinho contra catálogo com precedentes; uma chamada contra várias; com e sem revisor. Contar regras violadas e a taxa de cópia do vizinho.",
    opcoes: [
      { id: "uma-chamada", desc: "catálogo, regras e precedentes num prompt", como: "O LLM lista as determinações e indica as OBFs na mesma resposta.", ganha: "Simples, barato e rápido. Um prompt para versionar.", perde: "As regras de negócio ficam só no prompt, e o LLM às vezes esquece.", caso: "O catálogo de 26 OBFs cabe inteiro no prompt.", pecas: 1, risco: 0, llm: [1, 1] },
      { id: "chamada-verificada", desc: "uma chamada e conferência por código", como: "Depois da resposta, o código confere trecho literal, pares e regras de negócio.", ganha: "Regras aplicadas sempre igual. Toda alteração fica registrada.", perde: "Regra por código é rígida: \"decisão objetiva pede só um do par\" exige exceção.", caso: "Adição barata, sem LLM, que vale para qualquer candidato.", pecas: 2, risco: 0, llm: [1, 1] },
      { id: "decompor-e-indicar", desc: "duas chamadas em sequência", como: "A primeira chamada extrai as determinações; a segunda indica as OBFs.", ganha: "Cada etapa pode ser testada sozinha.", perde: "Dobro de custo e latência. O erro da primeira se propaga.", caso: "Combina com a busca por determinação.", pecas: 2, risco: 1, llm: [2, 2], decompoe: true },
      { id: "decompor-indicar-revisar", desc: "com revisor de omissões", como: "Decompõe, indica e uma chamada final pergunta: ficou alguma determinação sem OBF?", ganha: "Ataca a omissão, o erro mais caro, que gera multa diária.", perde: "De 2 a 4 vezes o custo. O revisor pode inflar a resposta e derrubar a precisão.", caso: "Só entra se a cobertura medida pedir.", pecas: 3, risco: 1, llm: [2, 4], decompoe: true }
    ]
  },
  {
    id: "D6", etapa: "responder", titulo: "De onde sai a confiança",
    doc: "design/06-confianca-e-abstencao.md",
    teste: "Medir o acerto por faixa de confiança e quantos erros o analista pega se revisar só a metade menos confiante.",
    opcoes: [
      { id: "declarada-pelo-llm", desc: "o modelo escreve o percentual", como: "O LLM informa a confiança junto com a OBF.", ganha: "Custo zero.", perde: "Costuma ser alta demais e pouco ligada ao acerto real.", caso: "Serve de ponto de comparação.", pecas: 0, risco: 0 },
      { id: "votos-dos-precedentes", desc: "fração dos casos parecidos com a OBF", como: "Dos k precedentes, quantos receberam aquela OBF.", ganha: "Objetiva, explicável e sem LLM.", perde: "Fica baixa para OBF rara mesmo quando ela está certa.", caso: "Boa nas 4 OBFs frequentes, fraca nas 16 raras.", pecas: 1, risco: 0 },
      { id: "sinais-compostos", desc: "votos, similaridade e verificações", como: "Uma pontuação a partir de vários sinais independentes.", ganha: "Mais robusta que qualquer sinal sozinho.", perde: "Mais uma peça para ajustar com poucos dados.", caso: "Mostrar o motivo convence mais que o número.", pecas: 1, risco: 0 },
      { id: "faixas-calibradas", desc: "três faixas com acerto medido", como: "Cada faixa exibe o acerto observado no conjunto de desenvolvimento.", ganha: "O número passa a significar algo: 9 em 10 estavam certas.", perde: "Calibrar com cerca de 175 casos é frágil, e por OBF é inviável.", caso: "A Energisa pede percentual; o honesto com estes dados são três faixas.", pecas: 2, risco: 0 }
    ]
  },
  {
    id: "D7", etapa: "aprender", titulo: "Como dado novo entra na base",
    doc: "design/07-entrada-de-dados-novos.md",
    teste: "Simular aprendizado em lotes, injetar 10 casos com rótulo errado e reverter uma versão ruim.",
    opcoes: [
      { id: "entrada-direta", desc: "a correção vira caso na hora", como: "Toda correção do analista é acrescentada à base.", ganha: "Aprendizado imediato, sem retreino.", perde: "Um erro de digitação vira precedente. Ninguém confere.", caso: "Funciona com controles automáticos: duplicata, conflito e catálogo.", pecas: 0, risco: 1 },
      { id: "versoes-com-aprovacao", desc: "tabela versionada, alguém aprova", como: "A correção fica pendente até ser aprovada e entra numa versão nova.", ganha: "Qualidade controlada. Reversão em um passo.", perde: "Exige uma pessoa para aprovar. A base cresce mais devagar.", caso: "Depende de a Energisa ter quem aprove.", pecas: 1, risco: 0 },
      { id: "aprovacao-e-reprocesso", desc: "aprova e refaz a base derivada", como: "Além de aprovar, decompõe e vetoriza de novo sempre que o desenho muda.", ganha: "A base fica sempre coerente com a versão atual do desenho.", perde: "Refazer exige chamadas de LLM para a base toda.", caso: "Necessário quando a unidade de busca é a determinação.", pecas: 2, risco: 1, refazComLLM: true }
    ]
  },
  {
    id: "D8", etapa: "aprender", titulo: "A régua, igual nos três", fixa: true,
    doc: "design/08-como-testar.md",
    teste: "Diferença de até 3 pontos entre duas opções é empate; acima de 6, é provável. Empate se resolve pela opção mais simples.",
    opcoes: [
      { id: "processo-de-fora", desc: "avalia sem os casos do mesmo processo", como: "Para cada caso de desenvolvimento, a base é todo o resto, menos os casos do mesmo processo.", ganha: "Usa todos os casos e impede a solução de achar o próprio caso.", perde: "Roda a solução uma vez por caso.", caso: "São 222 processos em 250 casos; decisões do mesmo processo são quase iguais." },
      { id: "medida-da-busca", desc: "filtra opções em segundos, sem LLM", como: "Mede que fração das OBFs do gabarito aparece nos casos recuperados.", ganha: "Permite testar dezenas de combinações de D1, D2 e D3.", perde: "É só um indicador: busca melhor nem sempre vira resposta melhor.", caso: "Filtra as opções; as finalistas vão para a medição de ponta a ponta." },
      { id: "ponta-a-ponta", desc: "resposta final contra o gabarito", como: "Compara as OBFs indicadas com as do especialista.", ganha: "É o que a banca pergunta: chegou à mesma classificação?", perde: "Custa chamadas de LLM por caso.", caso: "O conjunto de teste roda uma única vez, com tudo congelado." }
    ]
  }
];

const CANDIDATOS = {
  A: { nome: "Mínimo", lema: "O menor sistema que funciona: precedentes por caso e uma chamada.", vence: "os precedentes por caso já bastam.",
       escolhas: { D1: "caso-inteiro", D2: "multilingue-local", D3: "so-densa", D4: "matriz-em-memoria", D5: "uma-chamada", D6: "declarada-pelo-llm", D7: "entrada-direta" } },
  B: { nome: "Equilibrado", lema: "O A com busca lexical, regras por código e um banco de verdade.", vence: "a busca lexical e as regras corrigem os erros do A.",
       escolhas: { D1: "caso-inteiro", D2: "multilingue-local", D3: "hibrida-rrf", D4: "pgvector", D5: "chamada-verificada", D6: "sinais-compostos", D7: "versoes-com-aprovacao" } },
  C: { nome: "Completo", lema: "Trata cada determinação, reordena os precedentes e revisa omissões.", vence: "a decomposição acerta e o ganho supera o ruído da medição, de cerca de 6 pontos.",
       escolhas: { D1: "pai-e-filho", D2: "multilingue-local", D3: "hibrida-reranker", D4: "pgvector", D5: "decompor-indicar-revisar", D6: "faixas-calibradas", D7: "aprovacao-e-reprocesso" } }
};

const ATORES = [
  { id: "dispositivo", desc: "texto que o analista cola" },
  { id: "limpeza", desc: "mascara nomes, valores e códigos" },
  { id: "catalogo-e-regras", desc: "26 OBFs, pares e regras de negócio" },
  { id: "gabarito", desc: "250 casos rotulados pela Energisa" },
  { id: "llm", desc: "modelo de linguagem" },
  { id: "resposta", desc: "OBF, justificativa, confiança e trecho" },
  { id: "analista", desc: "revisa e corrige as sugestões" },
  { id: "abstencao", desc: "caso segue para análise humana" },
  { id: "ordem-de-servico", desc: "área responsável executa a OBF" }
];

B.dados = { ETAPAS, DECISOES, CANDIDATOS, ATORES };
})(window.Board);
