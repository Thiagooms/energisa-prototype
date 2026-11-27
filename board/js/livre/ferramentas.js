(function (B) {
  const L = B.livre;
  const { $, esc } = B.util;
  const F = L.ferramentas = {};
  const ITENS = [
    { id: "selecionar", icone: "cursor", nome: "Selecionar", tecla: "V", dica: "" },
    { id: "mao", icone: "mao", nome: "Mover a tela", tecla: "H", dica: "Arraste para mover a tela. Segurar Espaço faz o mesmo em qualquer ferramenta." },
    "sep",
    { id: "card", icone: "card", nome: "Card", tecla: "C", dica: "Clique no board para colocar um card, ou arraste para definir o tamanho." },
    { id: "texto", icone: "texto", nome: "Texto", tecla: "T", dica: "Clique onde o texto começa." },
    { id: "adesivo", icone: "adesivo", nome: "Nota adesiva", tecla: "N", dica: "Clique para colar uma nota." },
    { id: "forma", icone: "formas", nome: "Formas", tecla: "R", dica: "" },
    { id: "ligacao", icone: "ligacao", nome: "Seta", tecla: "L", dica: "Arraste de um bloco até outro para ligar. Esc volta para Selecionar." },
    { id: "grupo", icone: "grupo", nome: "Grupo", tecla: "G", dica: "Arraste para desenhar um grupo em volta dos blocos." },
    "sep",
    { id: "biblioteca", icone: "biblioteca", nome: "Biblioteca", tecla: "B", acao: true },
    "folga",
    { id: "desfazer", icone: "desfazer", nome: "Desfazer", tecla: "Ctrl+Z", acao: true },
    { id: "refazer", icone: "refazer", nome: "Refazer", tecla: "Ctrl+Shift+Z", acao: true }
  ];

  let barra, formas, dica;

  const botao = it => '<button type="button" data-item="' + it.id + '" aria-label="' + esc(it.nome) + '" data-dica="' + esc(it.nome + " · " + it.tecla) + '"' +
    (it.acao ? "" : ' aria-pressed="false"') + (it.id === "forma" || it.id === "biblioteca" ? ' aria-expanded="false"' : "") + ">" + B.icone(it.icone) + "</button>";

  const amostra = f => '<svg class="ic-forma" viewBox="-2 -2 32 24" aria-hidden="true"><path d="' + L.silhueta(f.id, 28, 20) + '"/></svg>';

  const foco = () => $("#moldura").focus({ preventScroll: true });

  const textoDaDica = f => {
    if (f === "forma") return "Clique ou arraste para desenhar: " + L.formaDe(L.gestos.forma()).nome.toLowerCase() + ".";
    const it = ITENS.find(v => v.id === f);
    return it ? it.dica : "";
  };

  const marcar = f => {
    barra.querySelectorAll("[aria-pressed]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.item === f)));
    formas.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(f === "forma" && b.dataset.forma === L.gestos.forma())));
    const t = textoDaDica(f);
    dica.textContent = t;
    dica.hidden = !t;
  };

  const abrirFormas = () => {
    const b = barra.querySelector('[data-item="forma"]');
    const area = $("#area").getBoundingClientRect(), r = b.getBoundingClientRect();
    formas.hidden = false;
    b.setAttribute("aria-expanded", "true");
    if (window.matchMedia("(max-width: 760px)").matches) {
      formas.style.top = "";
      formas.style.left = "";
    } else {
      formas.style.left = r.right - area.left + 8 + "px";
      formas.style.top = Math.max(8, Math.min(r.top - area.top, area.height - formas.offsetHeight - 8)) + "px";
    }
  };

  F.fecharFormas = () => {
    if (!formas || formas.hidden) return false;
    formas.hidden = true;
    barra.querySelector('[data-item="forma"]').setAttribute("aria-expanded", "false");
    return true;
  };

  F.atualizarHistorico = () => {
    barra.querySelector('[data-item="desfazer"]').disabled = !L.podeDesfazer();
    barra.querySelector('[data-item="refazer"]').disabled = !L.podeRefazer();
  };

  F.marcarBiblioteca = aberta => barra.querySelector('[data-item="biblioteca"]').setAttribute("aria-expanded", String(aberta));

  F.iniciar = () => {
    barra = $("#f-barra");
    formas = $("#f-formas");
    dica = $("#l-dica");
    barra.innerHTML = ITENS.map(it => it === "sep" ? '<span class="f-sep" aria-hidden="true"></span>' : it === "folga" ? '<span class="f-folga" aria-hidden="true"></span>' : botao(it)).join("");
    formas.innerHTML = L.FORMAS.filter(f => f.id !== "adesivo").map(f =>'<button type="button" data-forma="' + f.id + '" aria-pressed="false" aria-label="' + esc(f.nome) + '" title="' + esc(f.nome + (f.tecla ? " (" + f.tecla + ")" : "")) + '">' + amostra(f) + "</button>").join("");

    barra.addEventListener("click", ev => {
      const b = ev.target.closest("button[data-item]");
      if (!b) return;
      const id = b.dataset.item;
      if (id === "forma") {
        if (formas.hidden) { abrirFormas(); L.gestos.definirFerramenta("forma"); }
        else F.fecharFormas();
        return;
      }
      F.fecharFormas();
      if (id === "biblioteca") { L.definirPaleta(!L.paletaAberta()); return; }
      if (id === "desfazer") { if (L.desfazer()) L.avisar("Desfeito.", 1400); }
      else if (id === "refazer") { if (L.refazer()) L.avisar("Refeito.", 1400); }
      else L.gestos.definirFerramenta(id);
      foco();
    });

    formas.addEventListener("click", ev => {
      const b = ev.target.closest("button[data-forma]");
      if (!b) return;
      L.gestos.definirForma(b.dataset.forma);
      L.gestos.definirFerramenta("forma");
      F.fecharFormas();
      foco();
    });

    document.addEventListener("pointerdown", ev => {
      if (formas.hidden || formas.contains(ev.target) || ev.target.closest('[data-item="forma"]')) return;
      F.fecharFormas();
    });

    L.gestos.aoTrocarFerramenta(marcar);
    L.aoMudar(F.atualizarHistorico);
    marcar(L.gestos.ferramenta());
    F.atualizarHistorico();
  };
})(window.Board);
