(function (B) {
  const L = B.livre;
  const { $ } = B.util;
  const E = L.edicao = {};

  let atual = null;

  const campoDe = (n, parte) => n.tipo === "nota" ? "desc" : n.tipo !== "card" ? "titulo" : parte === "desc" ? "desc" : "titulo";

  const descartarVazia = id => {
    const n = L.no(id);
    if (!n || n.tipo !== "nota" || n.desc) return;
    const e = L.obter();
    e.nos = e.nos.filter(v => v.id !== id);
    e.ligacoes = e.ligacoes.filter(l => l.de !== id && l.para !== id);
  };

  const selecionarTudo = el => {
    const faixa = document.createRange();
    faixa.selectNodeContents(el);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(faixa);
  };

  const aoTeclar = ev => {
    ev.stopPropagation();
    if (ev.key === "Escape") {
      ev.preventDefault();
      E.cancelar();
      $("#moldura").focus({ preventScroll: true });
    } else if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      E.concluir();
      $("#moldura").focus({ preventScroll: true });
    } else if (ev.key === "Tab") {
      ev.preventDefault();
      const a = atual;
      const n = L.no(a.id);
      E.concluir();
      if (n && n.tipo === "card") E.iniciar(a.id, a.campo === "titulo" ? "desc" : "titulo");
      else $("#moldura").focus({ preventScroll: true });
    }
  };

  const soltar = () => {
    const a = atual;
    atual = null;
    a.el.removeEventListener("keydown", aoTeclar);
    a.el.removeEventListener("blur", E.concluir);
    a.el.removeAttribute("contenteditable");
    return a;
  };

  E.ativa = () => !!atual;
  E.contem = alvo => !!atual && atual.el.contains(alvo);

  E.iniciar = (id, parte) => {
    if (L.palco.travado()) return;
    E.concluir();
    const n = L.no(id);
    const no = n ? L.palco.elNo(id) : null;
    if (!no) return;
    const campo = campoDe(n, parte);
    let el = no.querySelector(campo === "titulo" ? ".t" : ".d");
    if (!el) {
      el = document.createElement("span");
      el.className = "d";
      no.insertBefore(el, no.querySelector(".alca"));
    }
    el.textContent = n[campo];
    el.setAttribute("contenteditable", "plaintext-only");
    if (el.contentEditable !== "plaintext-only") el.setAttribute("contenteditable", "true");
    el.dataset.vazio = n.tipo === "forma" ? "Texto" : campo === "titulo" ? "Título" : n.tipo === "nota" ? "Escreva aqui" : "Descrição";
    no.classList.add("editando");
    atual = { id, campo, el };
    el.addEventListener("keydown", aoTeclar);
    el.addEventListener("blur", E.concluir);
    el.focus({ preventScroll: true });
    selecionarTudo(el);
  };

  E.concluir = () => {
    if (!atual) return;
    const a = soltar();
    const n = L.no(a.id);
    if (n) n[a.campo] = a.el.innerText.replace(/ /g, " ").replace(/\n{3,}/g, "\n\n").trim();
    descartarVazia(a.id);
    L.confirmar();
    L.palco.render();
  };

  E.cancelar = () => {
    if (!atual) return;
    const a = soltar();
    descartarVazia(a.id);
    L.confirmar();
    L.palco.render();
  };
})(window.Board);
