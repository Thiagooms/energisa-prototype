(function (B) {
  const L = B.livre;
  const P = L.palco;
  const { $ } = B.util;
  const SETAS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const FERRAMENTA = { v: "selecionar", h: "mao", c: "card", t: "texto", n: "adesivo", l: "ligacao", g: "grupo" };
  const FORMA = { r: "retangulo", o: "elipse", d: "losango" };

  let moldura;

  const editavel = el => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  const livreVisivel = () => !$("#vista-livre").hidden;
  const sobreOBoard = el => el === moldura || el === document.body || (!!el && el.tagName === "BUTTON" && !!el.closest("#area"));

  const editarSelecao = () => {
    const s = P.selecao();
    if (s.fio) L.inspetor.focar();
    else if (s.nos.length === 1) L.edicao.iniciar(s.nos[0], "titulo");
    else return false;
    return true;
  };

  const empurrar = (dx, dy) => {
    const ids = P.comContidos(new Set(P.selecao().nos));
    if (!ids.size) return false;
    L.obter().nos.forEach(n => {
      if (!ids.has(n.id)) return;
      n.x += dx;
      n.y += dy;
    });
    L.confirmar();
    return true;
  };

  const sairDaFerramenta = () => {
    if (L.gestos.ferramenta() === "selecionar") return false;
    L.gestos.definirFerramenta("selecionar");
    return true;
  };

  const aoTeclar = ev => {
    if (ev.target !== moldura || P.travado()) return;
    const mod = ev.ctrlKey || ev.metaKey;
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    let feito = true;

    if (k === "Escape") feito = L.gestos.cancelar() || L.menu.fechar() || L.ferramentas.fecharFormas() || sairDaFerramenta() || (P.temSelecao() ? (P.selecionar([]), true) : false);
    else if (k === "Delete" || k === "Backspace") P.excluirSelecao();
    else if (mod && k === "z") { if (ev.shiftKey) L.refazer(); else L.desfazer(); }
    else if (mod && k === "y") L.refazer();
    else if (mod && k === "d") P.duplicar();
    else if (mod && k === "c") { const n = P.copiar(); if (n) L.avisar(n === 1 ? "1 item copiado." : n + " itens copiados.", 1600); else feito = false; }
    else if (mod && k === "x") { if (!P.recortar()) feito = false; }
    else if (mod && k === "v") { if (!P.colar(P.ultimoPonteiro)) feito = false; }
    else if (mod && k === "a") P.selecionarTudo();
    else if (mod && k === "g") { const id = P.agrupar(); if (id) L.edicao.iniciar(id, "titulo"); }
    else if (mod && ev.code === "Digit0") P.zoom100();
    else if (mod) feito = false;
    else if (k === "Enter" || k === "F2") feito = editarSelecao();
    else if (k === "Tab") { const id = P.criarLigado(); if (id) L.edicao.iniciar(id, "titulo"); else feito = false; }
    else if (SETAS[k]) {
      const passo = (P.comGrade() ? 10 : 1) * (ev.shiftKey ? 5 : 1);
      feito = empurrar(SETAS[k][0] * passo, SETAS[k][1] * passo);
    }
    else if (k === "+" || k === "=") P.zoom(1.2);
    else if (k === "-" || k === "_") P.zoom(1 / 1.2);
    else if (ev.code === "Digit0") P.zoom100();
    else if (ev.code === "Digit1") P.ajustar();
    else if (ev.code === "Digit2") P.zoomSelecao();
    else if (FERRAMENTA[k]) L.gestos.definirFerramenta(FERRAMENTA[k]);
    else if (FORMA[k]) { L.gestos.definirForma(FORMA[k]); L.gestos.definirFerramenta("forma"); }
    else if (k === "b") L.definirPaleta(!L.paletaAberta());
    else if (k === "]") P.ordem("frente");
    else if (k === "[") P.ordem("tras");
    else if (k === "?") L.abrirAjuda();
    else feito = false;

    if (feito) ev.preventDefault();
  };

  L.teclado = {
    iniciar: () => {
      moldura = $("#moldura");
      moldura.addEventListener("keydown", aoTeclar);
      moldura.addEventListener("pointerenter", () => {
        if (!editavel(document.activeElement) && !B.dialogo.aberto() && !L.edicao.ativa()) moldura.focus({ preventScroll: true });
      });
      window.addEventListener("keydown", ev => {
        if (ev.code !== "Space" || !livreVisivel() || B.dialogo.aberto()) return;
        if (!sobreOBoard(ev.target)) return;
        L.gestos.definirEspaco(true);
        ev.preventDefault();
      });
      window.addEventListener("keyup", ev => {
        if (ev.code === "Space") L.gestos.definirEspaco(false);
      });
      window.addEventListener("blur", () => L.gestos.definirEspaco(false));
    }
  };
})(window.Board);
