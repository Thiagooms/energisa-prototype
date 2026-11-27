(function (B) {
  const { ETAPAS, DECISOES, CANDIDATOS } = B.dados;
  const { $, $$, esc, LIVRES, etapaDe, decisao, opcao, usam, medidas, ler, gravar } = B.util;
  const CHAVE = "mapa-candidatos-v1";

  let estado = { modo: "todos", meu: { base: "B", escolhas: { ...CANDIDATOS.B.escolhas } } };

  const carregar = () => {
    const salvo = ler(CHAVE);
    if (!salvo || !salvo.meu || !salvo.meu.escolhas || !CANDIDATOS[salvo.meu.base]) return;
    if (!LIVRES.every(d => opcao(d, salvo.meu.escolhas[d.id]))) return;
    estado.meu = salvo.meu;
    if (["todos", "A", "B", "C", "meu"].includes(salvo.modo)) estado.modo = salvo.modo;
  };

  const escolhasAtivas = () => estado.modo === "todos" ? null : estado.modo === "meu" ? estado.meu.escolhas : CANDIDATOS[estado.modo].escolhas;
  const pontos = n => '<span class="pontos" aria-hidden="true">' + [1, 2, 3].map(i => '<i class="' + (i <= n ? "cheio" : "") + '"></i>').join("") + "</span>";

  const montarModos = () => {
    const itens = [["todos", "", "Todos"], ["A", "A", CANDIDATOS.A.nome], ["B", "B", CANDIDATOS.B.nome], ["C", "C", CANDIDATOS.C.nome], ["meu", "", "Meu desenho"]];
    $("#modos").innerHTML = itens.map(([id, sigla, nome]) =>
      '<button type="button" data-modo="' + id + '" aria-pressed="false">' + (sigla ? '<span class="sigla">' + sigla + "</span>" : "") + esc(nome) + "</button>").join("");
    $("#modos").addEventListener("click", ev => {
      const b = ev.target.closest("button[data-modo]");
      if (!b) return;
      estado.modo = b.dataset.modo;
      atualizar();
    });
  };

  const montarMapa = () => {
    const mapa = $("#mapa");
    ETAPAS.forEach((e, i) => {
      const col = document.createElement("div");
      col.className = "col";
      col.dataset.cor = e.cor;
      col.dataset.indice = i;
      const secoes = DECISOES.filter(d => d.etapa === e.id).map(d =>
        '<section class="secao"><h3><small>' + d.id + "</small>" + esc(d.titulo) + '</h3><div class="cards">' +
        d.opcoes.map(o => {
          const marcas = d.fixa ? "<i>FIXO</i>" : usam(d, o).map(k => '<i data-cand="' + k + '">' + k + "</i>").join("");
          const pino = d.fixa ? "" : '<button type="button" class="pino" hidden aria-pressed="false" aria-label="Usar ' + esc(o.id) + ' no meu desenho"></button>';
          return '<div class="caixa" data-d="' + d.id + '" data-o="' + o.id + '"><button type="button" class="card"><span class="nome">' + esc(o.id) + '</span><span class="desc">' + esc(o.desc) + '</span></button><span class="marcas">' + marcas + "</span>" + pino + "</div>";
        }).join("") + "</div></section>").join("");
      col.innerHTML = '<div class="col-cab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + e.icone + "</svg><div><h2>" + esc(e.nome) + "</h2><span>Etapa " + (i + 1) + "</span></div></div>" + secoes;
      mapa.appendChild(col);
    });
    mapa.addEventListener("click", ev => {
      const caixa = ev.target.closest(".caixa");
      if (!caixa) return;
      if (ev.target.closest(".pino")) {
        estado.meu.escolhas[caixa.dataset.d] = caixa.dataset.o;
        atualizar();
        return;
      }
      abrir(caixa.dataset.d, caixa.dataset.o, caixa.querySelector(".card"));
    });
  };

  const cadeia = (escolhas, comBotoes, base) => '<ol class="cadeia">' + LIVRES.map(d => {
    const o = escolhas[d.id];
    const cor = etapaDe(d).cor;
    const mudou = base && base[d.id] !== o ? " mudou" : "";
    const miolo = "<small>" + d.id + "</small>" + esc(o);
    return "<li>" + (comBotoes
      ? '<button type="button" class="elo' + mudou + '" data-cor="' + cor + '" data-d="' + d.id + '" data-o="' + o + '">' + miolo + "</button>"
      : '<span class="elo" data-cor="' + cor + '">' + miolo + "</span>") + "</li>";
  }).join("") + "</ol>";

  const montarResumo = () => {
    const alvo = $("#resumo");
    if (estado.modo === "todos") {
      alvo.innerHTML = '<div class="linhas">' + Object.keys(CANDIDATOS).map(k => {
        const c = CANDIDATOS[k], m = medidas(c.escolhas);
        return '<button type="button" class="linha" data-modo="' + k + '" aria-label="Destacar o candidato ' + k + ", " + esc(c.nome) + '"><span class="quem"><span class="letra">' + k + "</span><strong>" + esc(c.nome) + "</strong></span>" + cadeia(c.escolhas, false) +
          '<span class="curtas"><span>LLM por caso <b>' + m.llm + "</b></span><span>peças <b>" + m.pecas + "</b></span><span>risco <b>" + m.risco + "</b></span></span></button>";
      }).join("") + "</div>";
      return;
    }
    const meu = estado.modo === "meu";
    const escolhas = escolhasAtivas();
    const c = meu ? null : CANDIDATOS[estado.modo];
    const m = medidas(escolhas);
    const baseEsc = meu ? CANDIDATOS[estado.meu.base].escolhas : null;
    const trocas = meu ? LIVRES.filter(d => baseEsc[d.id] !== escolhas[d.id]).length : 0;
    const lema = meu
      ? "Partiu do candidato " + estado.meu.base + (trocas ? " e trocou " + trocas + (trocas === 1 ? " opção" : " opções") + "." : ". Use o círculo no canto de um card para trocar uma opção.")
      : c.lema;
    alvo.innerHTML =
      '<div class="cab"><span class="letra">' + (meu ? "M" : estado.modo) + '</span><div class="texto"><strong>' + esc(meu ? "Meu desenho" : c.nome) + "</strong><span>" + esc(lema) + "</span></div>" +
      (meu ? '<div class="partir">partir de ' + Object.keys(CANDIDATOS).map(k => '<button type="button" data-base="' + k + '" aria-label="Recomeçar a partir do candidato ' + k + '">' + k + "</button>").join("") + "</div>" : "") + "</div>" +
      cadeia(escolhas, true, baseEsc) +
      '<dl class="medidas">' +
      "<div><dt>Chamadas de LLM por caso</dt><dd>" + m.llm + "</dd></div>" +
      "<div><dt>Peças para manter</dt><dd>" + m.pecas + pontos(m.pecasNivel) + "</dd></div>" +
      "<div><dt>Risco de erro em cadeia</dt><dd>" + m.risco + pontos(m.riscoNivel) + "</dd></div>" +
      "<div><dt>Refazer a base</dt><dd>" + m.refazer + "</dd></div></dl>" +
      (c ? '<p class="vence"><b>Vence se</b>' + esc(c.vence) + "</p>" : "");
  };

  const atualizar = () => {
    const escolhas = escolhasAtivas();
    const meu = estado.modo === "meu";
    $$("#modos button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.modo === estado.modo)));
    $$("#mapa .caixa").forEach(cx => {
      const d = decisao(cx.dataset.d);
      const ligada = d.fixa ? !!escolhas : !!escolhas && escolhas[d.id] === cx.dataset.o;
      cx.classList.toggle("ligada", ligada);
      cx.classList.toggle("apagada", !!escolhas && !ligada);
      const pino = cx.querySelector(".pino");
      if (pino) { pino.hidden = !meu; pino.setAttribute("aria-pressed", String(meu && ligada)); }
      $$(".marcas i[data-cand]", cx).forEach(i => i.classList.toggle("apagada", !!escolhas && !meu && i.dataset.cand !== estado.modo));
    });
    montarResumo();
    gravar(CHAVE, estado);
    requestAnimationFrame(desenharTrilha);
  };

  const curva = (p, raio) => {
    let d = "M" + p[0][0] + "," + p[0][1];
    for (let i = 1; i < p.length - 1; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1];
      const r = Math.min(raio, Math.hypot(x1 - x0, y1 - y0) / 2, Math.hypot(x2 - x1, y2 - y1) / 2);
      const ax = x1 - Math.sign(x1 - x0) * r, ay = y1 - Math.sign(y1 - y0) * r;
      const bx = x1 + Math.sign(x2 - x1) * r, by = y1 + Math.sign(y2 - y1) * r;
      d += " L" + ax + "," + ay + " Q" + x1 + "," + y1 + " " + bx + "," + by;
    }
    const u = p[p.length - 1];
    return d + " L" + u[0] + "," + u[1];
  };

  const desenharTrilha = () => {
    const svg = $("#trilha"), mapa = $("#mapa");
    const escolhas = escolhasAtivas();
    if (!escolhas || !mapa.offsetWidth) { svg.innerHTML = ""; return; }
    const base = mapa.getBoundingClientRect();
    const nos = LIVRES.map(d => {
      const cx = mapa.querySelector('.caixa[data-d="' + d.id + '"][data-o="' + escolhas[d.id] + '"]');
      const r = cx.querySelector(".card").getBoundingClientRect();
      return { col: Math.round(r.left), esq: r.left - base.left, dir: r.right - base.left, meio: r.top - base.top + r.height / 2 };
    });
    let html = '<defs><marker id="seta-trilha" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path class="ponta-trilha" d="M0,0 L8,4 L0,8 Z"/></marker></defs>';
    let entrouPelaDireita = false;
    for (let i = 0; i < nos.length - 1; i++) {
      const a = nos[i], b = nos[i + 1];
      const saida = a.meio + (entrouPelaDireita ? 9 : 0);
      let p;
      if (a.col === b.col) {
        const x = Math.max(a.dir, b.dir) + 10;
        const chegada = b.meio - 9;
        p = [[a.dir, saida], [x, saida], [x, chegada], [b.dir + 3, chegada]];
        entrouPelaDireita = true;
      } else {
        const x = a.dir + 26;
        p = [[a.dir, saida], [x, saida], [x, b.meio], [b.esq - 3, b.meio]];
        entrouPelaDireita = false;
      }
      html += '<path class="fio-trilha" marker-end="url(#seta-trilha)" d="' + curva(p, 7) + '"/>';
    }
    svg.innerHTML = html;
  };

  const abrir = (idDecisao, idOpcao, origem) => B.detalhe.abrir(idDecisao, idOpcao, {
    origem,
    usar: {
      rotulo: "Usar no meu desenho",
      feito: "Já está no meu desenho.",
      pode: (d, o) => estado.meu.escolhas[d.id] !== o.id,
      aplicar: (d, o) => {
        estado.meu.escolhas[d.id] = o.id;
        estado.modo = "meu";
        atualizar();
      }
    }
  });

  const iniciar = () => {
    carregar();
    montarModos();
    montarMapa();
    $("#resumo").addEventListener("click", ev => {
      const linha = ev.target.closest("[data-modo]");
      if (linha) { estado.modo = linha.dataset.modo; atualizar(); return; }
      const base = ev.target.closest("[data-base]");
      if (base) { estado.meu = { base: base.dataset.base, escolhas: { ...CANDIDATOS[base.dataset.base].escolhas } }; atualizar(); return; }
      const elo = ev.target.closest("button.elo");
      if (elo) abrir(elo.dataset.d, elo.dataset.o, elo);
    });
    atualizar();
    if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(desenharTrilha)).observe($("#mapa"));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(desenharTrilha));
  };

  B.mapa = { iniciar, aoMostrar: () => requestAnimationFrame(desenharTrilha) };
})(window.Board);
