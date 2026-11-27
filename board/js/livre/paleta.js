(function (B) {
  const L = B.livre;
  const { $, $$, esc } = B.util;

  let painel;
  let aba = null;
  let arrasto = null;
  let suprimirClique = false;

  const item = (cat, cor, it) => '<button type="button" class="p-item" data-cor="' + (it.cor || cor) + '" data-cat="' + cat + '" data-chave="' + esc(it.chave) + '">' +
    B.icone(it.icone) + '<span class="p-texto"><span class="t">' + esc(it.t) + '</span><span class="d">' + esc(it.d) + "</span></span></button>";

  const secao = (cat, s) => (s.grupo ? '<p class="p-etapa" data-grupo="' + esc(s.grupo) + '">' + esc(s.grupo) + "</p>" : "") +
    '<div class="p-secao" data-cor="' + s.cor + '"><h3>' + (s.sigla ? "<small>" + esc(s.sigla) + "</small>" : "") + esc(s.titulo) + "</h3>" +
    s.itens.map(it => item(cat, s.cor, it)).join("") + "</div>";

  const semRepetir = html => {
    const vistos = new Set();
    return html.replace(/<p class="p-etapa" data-grupo="([^"]*)">[^<]*<\/p>/g, (trecho, grupo) => {
      if (vistos.has(grupo)) return "";
      vistos.add(grupo);
      return trecho;
    });
  };

  const montar = () => {
    const toque = window.matchMedia("(pointer: coarse)").matches;
    painel.innerHTML =
      '<div class="p-cab"><strong>Biblioteca</strong><button type="button" class="fechar" data-fechar-paleta aria-label="Fechar a biblioteca">&times;</button></div>' +
      '<input type="search" class="p-busca" id="p-busca" placeholder="Buscar componente" aria-label="Buscar componente" autocomplete="off">' +
      '<div class="p-abas" role="tablist" aria-label="Catálogos">' +
      L.catalogos.map(c => '<button type="button" role="tab" data-aba="' + c.id + '" aria-selected="false">' + esc(c.nome) + "</button>").join("") + "</div>" +
      '<div class="p-lista">' +
      L.catalogos.map(c => '<div class="p-cat" data-cat="' + c.id + '"><p class="p-nome">' + esc(c.nome) + "</p>" +
        (c.nota ? '<p class="p-como">' + esc(c.nota) + "</p>" : "") +
        semRepetir(c.secoes.map(s => secao(c.id, s)).join("")) + "</div>").join("") +
      '<p class="p-vazio" id="p-vazio" hidden>Nenhum componente com esse texto.</p></div>' +
      '<p class="p-rodape">' + (toque ? "Toque para colocar no board." : "Arraste para o board ou clique para colocar no centro.") + "</p>";
  };

  const aplicar = () => {
    const termo = $("#p-busca", painel).value.trim().toLowerCase();
    let visiveis = 0;
    painel.classList.toggle("buscando", !!termo);
    $$(".p-abas button", painel).forEach(b => b.setAttribute("aria-selected", String(!termo && b.dataset.aba === aba)));
    $$(".p-cat", painel).forEach(cat => {
      let algum = false;
      $$(".p-secao", cat).forEach(s => {
        let naSecao = false;
        $$(".p-item", s).forEach(b => {
          const casa = !termo || b.textContent.toLowerCase().includes(termo);
          b.hidden = !casa;
          if (casa) naSecao = true;
        });
        s.hidden = !naSecao;
        if (naSecao) algum = true;
      });
      $$(".p-etapa", cat).forEach(p => { p.hidden = !!termo; });
      cat.hidden = termo ? !algum : cat.dataset.cat !== aba;
      if (!cat.hidden) visiveis += $$(".p-item:not([hidden])", cat).length;
    });
    $("#p-vazio", painel).hidden = visiveis > 0;
  };

  const fabricar = el => {
    const c = L.catalogo(el.dataset.cat);
    return c ? c.fabricar(el.dataset.chave) : L.cardEmBranco(0, 0);
  };

  const soltar = ev => {
    if (!arrasto || ev.pointerId !== arrasto.ponteiro) return;
    const a = arrasto;
    arrasto = null;
    if (!a.fantasma) return;
    a.fantasma.remove();
    suprimirClique = true;
    if (ev.type === "pointerup" && L.palco.dentro(ev.clientX, ev.clientY)) {
      L.palco.adicionarNaTela(fabricar(a.el), ev.clientX, ev.clientY);
      L.fecharPaletaSeEstreito();
    }
  };

  L.paleta = {
    abrirAba: id => {
      if (!L.catalogo(id)) return;
      aba = id;
      $("#p-busca", painel).value = "";
      aplicar();
    },
    focarBusca: () => $("#p-busca", painel).focus({ preventScroll: true }),
    iniciar: () => {
      painel = $("#paleta");
      aba = L.catalogos.length ? L.catalogos[0].id : null;
      montar();
      aplicar();
      painel.addEventListener("input", ev => {
        if (ev.target.id === "p-busca") aplicar();
      });
      painel.addEventListener("keydown", ev => {
        if (ev.key !== "Escape") return;
        ev.stopPropagation();
        L.definirPaleta(false);
        $("#moldura").focus({ preventScroll: true });
      });
      painel.addEventListener("pointerdown", ev => {
        const el = ev.target.closest(".p-item");
        suprimirClique = false;
        if (!el || ev.button) return;
        arrasto = { el, x: ev.clientX, y: ev.clientY, fantasma: null, ponteiro: ev.pointerId };
      });
      window.addEventListener("pointermove", ev => {
        if (!arrasto || ev.pointerId !== arrasto.ponteiro) return;
        if (!arrasto.fantasma) {
          if (ev.pointerType === "touch" || Math.hypot(ev.clientX - arrasto.x, ev.clientY - arrasto.y) < 6) return;
          arrasto.fantasma = arrasto.el.cloneNode(true);
          arrasto.fantasma.classList.add("fantasma");
          document.body.appendChild(arrasto.fantasma);
        }
        arrasto.fantasma.style.left = ev.clientX + "px";
        arrasto.fantasma.style.top = ev.clientY + "px";
      });
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", soltar);
      painel.addEventListener("click", ev => {
        if (ev.target.closest("[data-fechar-paleta]")) { L.definirPaleta(false); return; }
        const guia = ev.target.closest("[data-aba]");
        if (guia) { L.paleta.abrirAba(guia.dataset.aba); return; }
        const el = ev.target.closest(".p-item");
        if (!el) return;
        if (suprimirClique) { suprimirClique = false; return; }
        L.palco.adicionarNoCentro(fabricar(el));
        if (L.fecharPaletaSeEstreito()) L.avisar("Colocado no board.");
      });
    }
  };
})(window.Board);
