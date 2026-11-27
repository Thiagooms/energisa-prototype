(function (B) {
  const D = B.dados;
  const { esc, etapaDe, decisao, opcao, usam } = B.util;

  const abrir = (idDecisao, idOpcao, opcoes) => {
    const op = opcoes || {};
    const d = decisao(idDecisao), o = opcao(d, idOpcao);
    if (!d || !o) return;
    const e = etapaDe(d);
    const quem = usam(d, o);
    const troca = op.usar && !d.fixa
      ? (op.usar.pode(d, o) ? '<button type="button" class="usar">' + esc(op.usar.rotulo) + "</button>" : "<span>" + esc(op.usar.feito) + "</span>")
      : "";
    const html =
      '<div class="m-topo"><div><h2 id="m-nome">' + esc(o.id) + "</h2><p>" + esc(o.desc) + '</p></div><button type="button" class="fechar" aria-label="Fechar">&times;</button></div>' +
      '<div class="pilulas"><span class="destaque">' + d.id + "</span><span>" + esc(d.titulo) + "</span><span>Etapa " + (D.ETAPAS.indexOf(e) + 1) + " · " + esc(e.nome) + "</span><span>" +
      (d.fixa ? "Vale para os três candidatos" : quem.length ? "Usado em " + quem.join(", ") : "Fora dos três candidatos") + "</span></div>" +
      '<div class="bloco"><span class="rotulo">Como funciona</span><p>' + esc(o.como) + "</p></div>" +
      '<div class="dupla"><div class="bloco"><span class="rotulo">Ganha</span><p class="faixa">' + esc(o.ganha) + '</p></div><div class="bloco"><span class="rotulo">Perde</span><p class="faixa">' + esc(o.perde) + "</p></div></div>" +
      '<div class="bloco"><span class="rotulo">No nosso caso</span><p>' + esc(o.caso) + "</p></div>" +
      '<div class="bloco"><span class="rotulo">' + (d.fixa ? "Regra de leitura" : "Como testar esta decisão") + "</span><p>" + esc(d.teste) + "</p></div>" +
      '<div class="bloco"><span class="rotulo">Outras opções de ' + d.id + '</span><div class="outras">' +
      d.opcoes.filter(x => x.id !== o.id).map(x => '<button type="button" class="outra" data-o="' + x.id + '"><span class="n">' + esc(x.id) + '</span><span class="d">' + esc(x.desc) + '</span><span class="q">' + (d.fixa ? "" : usam(d, x).join(" ")) + "</span></button>").join("") + "</div></div>" +
      '<div class="acoes">' + troca + '<span class="fonte">' + esc(d.doc) + "</span></div>";

    B.dialogo.abrir(html, {
      cor: e.cor,
      origem: op.origem,
      aoClicar: ev => {
        const outra = ev.target.closest(".outra");
        if (outra) { abrir(d.id, outra.dataset.o, { usar: op.usar }); return; }
        if (ev.target.closest(".usar")) {
          B.dialogo.fechar();
          op.usar.aplicar(d, o);
        }
      }
    });
  };

  B.detalhe = { abrir };
})(window.Board);
