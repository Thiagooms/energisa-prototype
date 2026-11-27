(function (B) {
  const D = B.dados;
  const L = B.livre;
  const { decisao, opcao, etapaDe } = B.util;
  const ID = "energisa";

  const cardDeOpcao = (idDecisao, idOpcao) => {
    const d = decisao(idDecisao), o = opcao(d, idOpcao);
    return L.card(o.id, o.desc, { etiqueta: d.id, cor: etapaDe(d).cor, ref: { c: ID, d: d.id, o: o.id } });
  };

  const cardDeAtor = id => {
    const a = D.ATORES.find(v => v.id === id);
    return L.card(a.id, a.desc, {});
  };

  const secoes = [{ titulo: "Fluxo", cor: "neutral", itens: D.ATORES.map(a => ({ chave: "ator|" + a.id, t: a.id, d: a.desc })) }]
    .concat(D.DECISOES.map(d => {
      const e = etapaDe(d);
      return {
        grupo: "Etapa " + (D.ETAPAS.indexOf(e) + 1) + " · " + e.nome,
        sigla: d.id,
        titulo: d.titulo,
        cor: e.cor,
        itens: d.opcoes.map(o => ({ chave: "opcao|" + d.id + "|" + o.id, t: o.id, d: o.desc }))
      };
    }));

  const trocar = (no, aoTrocar) => ({
    rotulo: "Trocar o card por esta opção",
    feito: "É a opção deste card.",
    pode: (d, o) => no.ref.o !== o.id,
    aplicar: (d, o) => {
      no.ref = { c: ID, d: d.id, o: o.id };
      no.titulo = o.id;
      no.desc = o.desc;
      if (aoTrocar) aoTrocar();
    }
  });

  L.registrarCatalogo({
    id: ID,
    nome: "Energisa",
    nota: "Catálogo de consulta do projeto Energisa: os atores do fluxo e as opções das decisões D1 a D8, por etapa. No board, selecione um desses cards e use Ver trade-offs.",
    secoes,
    rotuloDetalhe: "Ver trade-offs",
    fabricar: chave => {
      const [tipo, p1, p2] = chave.split("|");
      return tipo === "opcao" ? cardDeOpcao(p1, p2) : cardDeAtor(p1);
    },
    normalizarRef: r => {
      const d = decisao(r.d);
      return d && opcao(d, r.o) ? { c: ID, d: r.d, o: r.o } : null;
    },
    abrirDetalhe: (no, op) => B.detalhe.abrir(no.ref.d, no.ref.o, { origem: op.origem, usar: op.editavel ? trocar(no, op.aoTrocar) : undefined })
  });

  const candidato = k => {
    const c = D.CANDIDATOS[k];
    const X = [40, 310, 580, 850, 1120];
    const Y = [150, 260, 370];
    const r = L.rascunho("Candidato " + k + " · " + c.nome);
    const op = (id, coluna, linha) => r.por(cardDeOpcao(id, c.escolhas[id]), X[coluna], Y[linha]);

    r.por(L.grupo("Entrada", "neutral", X[0] - 30, 90, 250, 370));
    D.ETAPAS.forEach((e, i) => r.por(L.grupo(e.nome, e.cor, X[i + 1] - 30, 90, 250, 370)));
    r.por(L.nota("Candidato " + k + " · " + c.nome, 10, 36));

    const dispositivo = r.por(cardDeAtor("dispositivo"), X[0], Y[0]);
    const limpeza = r.por(cardDeAtor("limpeza"), X[0], Y[1]);
    const d1 = op("D1", 1, 0), d2 = op("D2", 1, 1);
    const d3 = op("D3", 2, 0), d4 = op("D4", 2, 2);
    const d5 = op("D5", 3, 0), d6 = op("D6", 3, 1);
    const catalogo = r.por(cardDeAtor("catalogo-e-regras"), X[3], 10);
    const analista = r.por(cardDeAtor("analista"), X[4], Y[0]);
    const d7 = op("D7", 4, 2);

    r.ligar(dispositivo, limpeza);
    r.ligar(limpeza, d1);
    r.ligar(d1, d2);
    r.ligar(d2, d3);
    r.ligar(d4, d3, "base");
    r.ligar(d3, d5, "precedentes");
    r.ligar(catalogo, d5);
    r.ligar(d5, d6);
    r.ligar(d6, analista, "resposta");
    r.ligar(analista, d7, "correção");
    r.ligar(d7, d4, "caso novo", { tracejada: true });
    return r.pronto();
  };

  Object.keys(D.CANDIDATOS).forEach(k => L.registrarModelo({
    id: "energisa-" + k,
    grupo: "Projeto Energisa",
    nome: "Candidato " + k + " · " + D.CANDIDATOS[k].nome,
    desc: D.CANDIDATOS[k].lema,
    criar: () => candidato(k)
  }));
})(window.Board);
