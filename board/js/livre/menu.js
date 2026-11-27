(function (B) {
  const L = B.livre;
  const P = L.palco;
  const { $, esc } = B.util;
  const M = L.menu = {};

  let el;
  let itensAtuais = [];
  let fechadoEm = 0;

  const item = (rotulo, atalho, acao, opcoes) => Object.assign({ rotulo, atalho, acao }, opcoes);

  const paraNos = (ponto, n) => {
    const um = n.length === 1 ? L.no(n[0]) : null;
    const itens = [];
    if (um) itens.push(item("Editar texto", "Enter", () => L.edicao.iniciar(um.id, "titulo")));
    if (um && L.temDetalhe(um)) itens.push(item(L.rotuloDetalhe(um), "", () => L.inspetor.abrirDetalhe()));
    if (um && um.tipo !== "grupo") itens.push(item("Criar bloco ligado", "Tab", () => {
      const id = P.criarLigado();
      if (id) L.edicao.iniciar(id, "titulo");
    }));
    itens.push(
      item("Duplicar", "Ctrl+D", () => P.duplicar()),
      item("Copiar", "Ctrl+C", () => P.copiar()),
      item("Recortar", "Ctrl+X", () => P.recortar())
    );
    if (n.length > 1 || (um && um.tipo !== "grupo")) itens.push(item("Agrupar", "Ctrl+G", () => {
      const id = P.agrupar();
      if (id) L.edicao.iniciar(id, "titulo");
    }));
    itens.push(
      "sep",
      item("Trazer para frente", "]", () => P.ordem("frente")),
      item("Enviar para trás", "[", () => P.ordem("tras")),
      "sep",
      item("Excluir", "Delete", () => P.excluirSelecao(), { perigo: true })
    );
    return itens;
  };

  const paraFio = id => [
    item("Editar rótulo", "Enter", () => L.inspetor.focar()),
    item("Inverter sentido", "", () => {
      const l = L.ligacao(id);
      if (!l) return;
      const de = l.de;
      l.de = l.para;
      l.para = de;
      L.confirmar();
    }),
    "sep",
    item("Excluir", "Delete", () => P.excluirSelecao(), { perigo: true })
  ];

  const paraFundo = ponto => [
    item("Novo card", "C", () => L.edicao.iniciar(P.inserirEm(L.cardEmBranco(0, 0), ponto), "titulo")),
    item("Novo texto", "T", () => L.edicao.iniciar(P.inserirEm(L.nota("", 0, 0), ponto), "desc")),
    item("Nova nota adesiva", "N", () => L.edicao.iniciar(P.inserirEm(L.forma("adesivo", 0, 0, { cor: "amber" }), ponto), "titulo")),
    item("Nova forma", "R", () => L.edicao.iniciar(P.inserirEm(L.forma(L.gestos.forma(), 0, 0), ponto), "titulo")),
    item("Novo grupo", "G", () => L.edicao.iniciar(P.inserirEm(L.grupo("", "neutral", 0, 0, 320, 220), ponto), "titulo")),
    "sep",
    item("Colar", "Ctrl+V", () => P.colar(ponto), { desativado: !P.temCopiado() }),
    item("Selecionar tudo", "Ctrl+A", () => P.selecionarTudo()),
    item("Ver tudo", "Shift+1", () => P.ajustar())
  ];

  M.fechar = () => {
    if (!el || el.hidden) return false;
    el.hidden = true;
    itensAtuais = [];
    fechadoEm = Date.now();
    return true;
  };
  M.recemFechado = () => Date.now() - fechadoEm < 250;

  const abrir = (itens, cx, cy) => {
    itensAtuais = itens;
    el.innerHTML = itens.map((it, i) => it === "sep"
      ? '<div class="menu-sep" role="separator"></div>'
      : '<button type="button" data-i="' + i + '"' + (it.desativado ? " disabled" : "") + (it.perigo ? ' class="perigo"' : "") + (it.marcado !== undefined ? ' role="menuitemcheckbox" aria-checked="' + !!it.marcado + '"' : ' role="menuitem"') + "><span>" + esc(it.rotulo) + "</span>" + (it.atalho ? "<kbd>" + esc(it.atalho) + "</kbd>" : "") + "</button>").join("");
    el.hidden = false;
    const area = $("#area").getBoundingClientRect();
    const x = Math.min(cx - area.left, area.width - el.offsetWidth - 8);
    const y = Math.min(cy - area.top, area.height - el.offsetHeight - 8);
    el.style.left = Math.max(8, x) + "px";
    el.style.top = Math.max(8, y) + "px";
    const primeiro = el.querySelector("button:not(:disabled)");
    if (primeiro) primeiro.focus({ preventScroll: true });
  };

  M.abrirEm = abrir;

  M.iniciar = () => {
    el = $("#l-menu");
    const moldura = $("#moldura");
    moldura.addEventListener("contextmenu", ev => {
      ev.preventDefault();
      if (P.travado() || L.gestos.ativo()) return;
      L.edicao.concluir();
      const no = ev.target.closest(".no");
      const fio = ev.target.closest(".fio");
      const ponto = P.mundo(ev);
      if (no) {
        const id = no.dataset.id;
        if (!P.selecao().nos.includes(id)) P.selecionar([id]);
        abrir(paraNos(ponto, P.selecao().nos), ev.clientX, ev.clientY);
      } else if (fio) {
        P.selecionar([], fio.dataset.fio);
        abrir(paraFio(fio.dataset.fio), ev.clientX, ev.clientY);
      } else {
        abrir(paraFundo(ponto), ev.clientX, ev.clientY);
      }
    });
    el.addEventListener("click", ev => {
      const b = ev.target.closest("button[data-i]");
      if (!b) return;
      const it = itensAtuais[Number(b.dataset.i)];
      M.fechar();
      moldura.focus({ preventScroll: true });
      if (it && it.acao) it.acao();
    });
    el.addEventListener("keydown", ev => {
      const botoes = [...el.querySelectorAll("button:not(:disabled)")];
      const i = botoes.indexOf(document.activeElement);
      if (ev.key === "Escape") { M.fechar(); moldura.focus({ preventScroll: true }); }
      else if (ev.key === "ArrowDown") botoes[(i + 1) % botoes.length].focus();
      else if (ev.key === "ArrowUp") botoes[(i - 1 + botoes.length) % botoes.length].focus();
      else return;
      ev.preventDefault();
      ev.stopPropagation();
    });
    el.addEventListener("contextmenu", ev => ev.preventDefault());
    document.addEventListener("pointerdown", ev => {
      if (!el.hidden && !el.contains(ev.target) && !moldura.contains(ev.target)) M.fechar();
    });
    window.addEventListener("blur", M.fechar);
  };
})(window.Board);
