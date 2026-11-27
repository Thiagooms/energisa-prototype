(function (B) {
  const { $, $$ } = B.util;
  let devolverFoco = null;

  const veu = () => $("#veu");
  const modal = () => $("#modal");

  const fechar = () => {
    veu().hidden = true;
    modal().onclick = null;
    if (devolverFoco && document.contains(devolverFoco)) devolverFoco.focus();
    devolverFoco = null;
  };

  const abrir = (html, opcoes) => {
    const op = opcoes || {};
    const m = modal();
    if (op.origem) devolverFoco = op.origem;
    m.dataset.cor = op.cor || "neutral";
    m.innerHTML = html;
    m.onclick = ev => {
      if (ev.target.closest(".fechar")) { fechar(); return; }
      if (op.aoClicar) op.aoClicar(ev, m);
    };
    veu().hidden = false;
    m.scrollTop = 0;
    const primeiro = $(op.foco || ".fechar", m);
    if (primeiro) primeiro.focus();
    return m;
  };

  const aberto = () => !veu().hidden;

  document.addEventListener("click", ev => {
    if (ev.target.id === "veu") fechar();
  });
  document.addEventListener("keydown", ev => {
    if (!aberto()) return;
    if (ev.key === "Escape") { ev.stopPropagation(); fechar(); return; }
    if (ev.key !== "Tab") return;
    const focaveis = $$("button, input, textarea, select, [href]", modal()).filter(el => !el.disabled && !el.hidden);
    if (!focaveis.length) return;
    const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
    if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
  }, true);

  B.dialogo = { abrir, fechar, aberto };
})(window.Board);
