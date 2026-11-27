(function (B) {
  const L = B.livre;
  const SECOES = [
    { titulo: "Pessoas e clientes", cor: "blue", itens: [
      ["usuario", "Usuário", "quem usa o sistema"],
      ["navegador", "Aplicação web", "interface no navegador"],
      ["celular", "App móvel", "interface no celular"],
      ["externo", "Sistema externo", "serviço de terceiros"]
    ] },
    { titulo: "Entrada e rede", cor: "violet", itens: [
      ["api", "API", "porta de entrada das requisições"],
      ["balanceador", "Balanceador de carga", "distribui as requisições"],
      ["rede", "CDN", "entrega conteúdo perto do usuário"],
      ["cadeado", "Autenticação", "confirma quem está pedindo"]
    ] },
    { titulo: "Processamento", cor: "amber", itens: [
      ["servidor", "Serviço", "regra de negócio"],
      ["funcao", "Função sob demanda", "código que roda a cada evento"],
      ["engrenagem", "Worker", "processa tarefas em segundo plano"],
      ["relogio", "Agendador", "dispara tarefas por horário"]
    ] },
    { titulo: "Dados", cor: "green", itens: [
      ["banco", "Banco de dados", "guarda os dados do sistema"],
      ["cache", "Cache", "resposta rápida para leituras repetidas"],
      ["arquivos", "Armazenamento de arquivos", "documentos, imagens e anexos"],
      ["busca", "Índice de busca", "busca por texto"]
    ] },
    { titulo: "Mensagens", cor: "rose", itens: [
      ["fila", "Fila", "entrega as tarefas uma a uma"],
      ["eventos", "Tópico de eventos", "publica para vários assinantes"],
      ["email", "Notificação", "e-mail, SMS ou aviso no app"]
    ] },
    { titulo: "Inteligência artificial", cor: "violet", itens: [
      ["ia", "Modelo de linguagem", "gera ou classifica texto"],
      ["busca", "Base vetorial", "busca por semelhança de sentido"],
      ["documento", "Base de conhecimento", "documentos de referência"]
    ] },
    { titulo: "Operação", cor: "neutral", itens: [
      ["grafico", "Monitoramento", "métricas, registros e alertas"],
      ["nuvem", "Provedor de nuvem", "onde o sistema roda"],
      ["documento", "Registro de auditoria", "quem fez o quê e quando"]
    ] }
  ];

  const porChave = {};
  const secoes = SECOES.map((s, i) => ({
    titulo: s.titulo,
    cor: s.cor,
    itens: s.itens.map(([icone, t, d], j) => {
      const chave = i + "-" + j;
      porChave[chave] = { icone, t, d, cor: s.cor };
      return { chave, t, d, icone };
    })
  }));

  const componente = (titulo, x, y) => {
    const chave = Object.keys(porChave).find(k => porChave[k].t === titulo);
    const c = porChave[chave];
    const n = L.card(c.t, c.d, { icone: c.icone, cor: c.cor });
    n.x = x;
    n.y = y;
    return n;
  };

  L.registrarCatalogo({
    id: "geral",
    nome: "Componentes",
    nota: "Peças comuns de desenho de sistemas. Depois de colocar no board, troque o texto, a cor e o ícone como quiser.",
    secoes,
    fabricar: chave => {
      const c = porChave[chave];
      return c ? L.card(c.t, c.d, { icone: c.icone, cor: c.cor }) : L.cardEmBranco(0, 0);
    }
  });

  const camadas = () => {
    const r = L.rascunho("Aplicação web em camadas");
    r.por(L.grupo("Cliente", "blue", 40, 90, 250, 300));
    r.por(L.grupo("Aplicação", "amber", 330, 90, 520, 300));
    r.por(L.grupo("Dados", "green", 890, 90, 250, 300));
    const usuario = r.por(componente("Usuário", 70, 150));
    const web = r.por(componente("Aplicação web", 70, 270));
    const api = r.por(componente("API", 360, 150));
    const auth = r.por(componente("Autenticação", 360, 270));
    const servico = r.por(componente("Serviço", 630, 150));
    const banco = r.por(componente("Banco de dados", 920, 150));
    const cache = r.por(componente("Cache", 920, 270));
    r.ligar(usuario, web);
    r.ligar(web, api, "HTTPS");
    r.ligar(api, auth, "token");
    r.ligar(api, servico);
    r.ligar(servico, banco, "lê e grava");
    r.ligar(servico, cache, "leituras", { tracejada: true });
    return r.pronto();
  };

  const filaEWorkers = () => {
    const r = L.rascunho("Fila e workers");
    const cliente = r.por(componente("Aplicação web", 40, 160));
    const api = r.por(componente("API", 310, 160));
    const fila = r.por(componente("Fila", 580, 160));
    const agendador = r.por(componente("Agendador", 580, 320));
    const worker = r.por(componente("Worker", 850, 160));
    const banco = r.por(componente("Banco de dados", 1120, 90));
    const aviso = r.por(componente("Notificação", 1120, 240));
    r.por(L.nota("A API responde na hora e o trabalho pesado segue pela fila.", 310, 80));
    r.ligar(cliente, api, "pedido");
    r.ligar(api, fila, "tarefa");
    r.ligar(agendador, fila, "tarefas periódicas", { tracejada: true });
    r.ligar(fila, worker);
    r.ligar(worker, banco, "resultado");
    r.ligar(worker, aviso, "avisa");
    return r.pronto();
  };

  const buscaComIa = () => {
    const r = L.rascunho("Busca com IA");
    r.por(L.grupo("Indexação", "amber", 40, 60, 800, 190));
    r.por(L.grupo("Consulta", "blue", 40, 290, 1060, 190));
    const docs = r.por(componente("Base de conhecimento", 70, 130));
    const preparo = r.por(L.card("Preparar e dividir", "limpa o texto e corta em trechos", { icone: "engrenagem", cor: "amber" }), 330, 130);
    const vetores = r.por(componente("Base vetorial", 590, 130));
    const pergunta = r.por(L.card("Pergunta", "o que o usuário quer saber", { icone: "usuario", cor: "blue" }), 70, 360);
    const busca = r.por(L.card("Recuperação", "acha os trechos mais próximos", { icone: "busca", cor: "violet" }), 330, 360);
    const modelo = r.por(componente("Modelo de linguagem", 590, 360));
    const resposta = r.por(L.card("Resposta", "texto com as fontes usadas", { icone: "documento", cor: "green" }), 850, 360);
    r.ligar(docs, preparo);
    r.ligar(preparo, vetores, "vetores");
    r.ligar(pergunta, busca);
    r.ligar(vetores, busca, "trechos");
    r.ligar(busca, modelo, "contexto");
    r.ligar(modelo, resposta);
    return r.pronto();
  };

  const fluxograma = () => {
    const r = L.rascunho("Fluxograma");
    const reto = { forma: "cotovelo" };
    const inicio = r.por(L.forma("pilula", 200, 40, { titulo: "Início", cor: "green" }));
    const passo = r.por(L.forma("retangulo", 200, 150, { titulo: "Primeiro passo" }));
    const decisao = r.por(L.forma("losango", 200, 290, { titulo: "Deu certo?", cor: "amber" }));
    const segue = r.por(L.forma("retangulo", 200, 470, { titulo: "Segue o fluxo" }));
    const excecao = r.por(L.forma("retangulo", 470, 305, { titulo: "Trata a exceção", cor: "rose" }));
    const fim = r.por(L.forma("pilula", 200, 610, { titulo: "Fim", cor: "green" }));
    r.ligar(inicio, passo, "", reto);
    r.ligar(passo, decisao, "", reto);
    r.ligar(decisao, segue, "sim", reto);
    r.ligar(decisao, excecao, "não", reto);
    r.ligar(segue, fim, "", reto);
    r.ligar(excecao, fim, "", reto);
    return r.pronto();
  };

  [
    { id: "camadas", nome: "Aplicação web em camadas", desc: "Cliente, aplicação e dados, com autenticação e cache.", criar: camadas },
    { id: "fila", nome: "Fila e workers", desc: "Trabalho pesado fora da requisição, com fila, worker e aviso.", criar: filaEWorkers },
    { id: "busca-ia", nome: "Busca com IA", desc: "Indexação de documentos e resposta com trechos recuperados.", criar: buscaComIa },
    { id: "fluxograma", nome: "Fluxograma", desc: "Início, passos, decisão e fim, com formas.", criar: fluxograma }
  ].forEach(m => L.registrarModelo(Object.assign({ grupo: "Gerais" }, m)));
})(window.Board);
