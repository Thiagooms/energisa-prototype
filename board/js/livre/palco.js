(function (B) {
  const L = B.livre;
  const G = B.geometria;
  const { $, esc } = B.util;
  const P = L.palco = {};
  const ZMIN = 0.2;
  const ZMAX = 2;
  const ALCAS = ["n", "e", "s", "o"].map(l => '<i class="alca" data-lado="' + l + '"></i>').join("");
  const CANTOS = ["no", "ne", "se", "so"].map(c => '<i class="redim" data-canto="' + c + '"></i>').join("");
  const marcador = (id, classe) => '<marker id="' + id + '" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="' + classe + '" d="M0,0 L8,4 L0,8 Z"/></marker>';
  const SETAS = "<defs>" + marcador("seta-fio", "ponta") + marcador("seta-fio-sel", "ponta-sel") + "</defs>";

  let moldura, palco, nosEl, fios, rotulos, guias;
  let sel = new Set();
  let selFio = null;
  let travado = false;
  let grade = true;
  let cascata = 0;
  let copiado = null;
  let colagens = 0;
  let tracados = [];
  const ouvintesSel = [];
  const ouvintesVista = [];

  P.provisorio = null;
  P.fioOculto = null;
  P.ultimoPonteiro = null;

  const limitarZoom = z => Math.min(ZMAX, Math.max(ZMIN, z));
  const avisarSel = () => ouvintesSel.forEach(f => f());

  P.encaixar = v => grade ? Math.round(v / 10) * 10 : Math.round(v);
  P.elNo = id => nosEl.querySelector('[data-id="' + id + '"]');
  P.mundo = ev => {
    const r = moldura.getBoundingClientRect(), v = L.vista;
    return { x: (ev.clientX - r.left - v.x) / v.z, y: (ev.clientY - r.top - v.y) / v.z };
  };
  P.caixa = n => {
    const el = P.elNo(n.id);
    return {
      x: n.x,
      y: n.y,
      w: el && el.offsetWidth ? el.offsetWidth : n.w,
      h: el && el.offsetHeight ? el.offsetHeight : (n.tipo === "grupo" || n.tipo === "forma" ? n.h : 60),
      pontual: n.tipo === "forma" && n.forma !== "retangulo" && n.forma !== "adesivo"
    };
  };
  P.travado = () => travado;
  P.travar = v => { travado = !!v; };
  P.definirGrade = v => { grade = !!v; };
  P.comGrade = () => grade;

  const estilo = n => "left:" + n.x + "px;top:" + n.y + "px;width:" + n.w + "px" +
    (n.tipo === "grupo" || n.tipo === "forma" ? ";height:" + n.h + "px" : n.tipo === "card" && n.alt ? ";min-height:" + n.alt + "px" : "");

  const htmlNo = n => {
    const marcado = sel.has(n.id);
    const unico = marcado && sel.size === 1 && !selFio;
    const abre = '<div class="no' + (marcado ? " sel" : "") + (unico ? " unico" : "") + '" data-id="' + n.id + '" data-tipo="' + n.tipo + '" data-cor="' + n.cor + '"' + (n.forma ? ' data-forma="' + n.forma + '"' : "") + (L.temDetalhe(n) ? ' data-ref="1"' : "") + ' style="' + estilo(n) + '">';
    if (n.tipo === "grupo") return abre + '<span class="t">' + esc(n.titulo || "Grupo") + "</span>" + CANTOS + "</div>";
    if (n.tipo === "nota") return abre + '<span class="d">' + esc(n.desc || "Texto") + "</span>" + ALCAS + CANTOS + "</div>";
    if (n.tipo === "forma") return abre + '<svg class="silhueta" aria-hidden="true"><path d="' + L.silhueta(n.forma, n.w, n.h) + '"/></svg><span class="t">' + esc(n.titulo) + "</span>" + ALCAS + CANTOS + "</div>";
    return abre + (n.etiqueta ? '<span class="et">' + esc(n.etiqueta) + "</span>" : "") +
      '<div class="cab">' + B.icone(n.icone) + '<strong class="t">' + esc(n.titulo || "Sem título") + "</strong></div>" +
      (n.desc ? '<span class="d">' + esc(n.desc) + "</span>" : "") + ALCAS + CANTOS + "</div>";
  };

  P.posicionar = n => {
    const el = P.elNo(n.id);
    if (!el) return;
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";
    el.style.width = n.w + "px";
    if (n.tipo === "grupo") el.style.height = n.h + "px";
    else if (n.tipo === "forma") {
      el.style.height = n.h + "px";
      const silhueta = el.querySelector(".silhueta path");
      if (silhueta) silhueta.setAttribute("d", L.silhueta(n.forma, n.w, n.h));
    }
    else if (n.tipo === "card") el.style.minHeight = n.alt ? n.alt + "px" : "";
  };

  P.aplicarVista = () => {
    const v = L.vista;
    palco.style.transform = "translate(" + v.x + "px," + v.y + "px) scale(" + v.z + ")";
    moldura.style.backgroundPosition = v.x + "px " + v.y + "px";
    moldura.style.backgroundSize = 20 * v.z + "px " + 20 * v.z + "px";
    ouvintesVista.forEach(f => f(v));
  };

  P.desenharFios = () => {
    tracados = G.montar(L.obter().ligacoes, id => {
      const n = L.no(id);
      return n ? P.caixa(n) : null;
    });
    let h = SETAS;
    let r = "";
    tracados.forEach(t => {
      const l = t.l;
      const s = l.id === selFio;
      const seta = "url(#seta-fio" + (s ? "-sel" : "") + ")";
      h += '<g class="fio' + (s ? " sel" : "") + (l.tracejada ? " tracejada" : "") + (l.id === P.fioOculto ? " oculto" : "") + '" data-fio="' + l.id + '"><path class="toque" d="' + t.d + '"/><path class="linha" d="' + t.d + '"' +
        (l.pontas !== "nenhuma" ? ' marker-end="' + seta + '"' : "") + (l.pontas === "ambas" ? ' marker-start="' + seta + '"' : "") + "/></g>";
      if (l.rotulo && l.id !== P.fioOculto) {
        const w = Math.round(l.rotulo.length * 7 + 16);
        r += '<g class="rotulo-fio' + (s ? " sel" : "") + '"><rect x="' + (t.mx - w / 2) + '" y="' + (t.my - 10) + '" width="' + w + '" height="20" rx="10"/><text x="' + t.mx + '" y="' + (t.my + 4) + '">' + esc(l.rotulo) + "</text></g>";
      }
      if (s && !travado && l.id !== P.fioOculto) {
        r += '<circle class="extremo" data-fio="' + l.id + '" data-ponta="de" cx="' + t.p1.x + '" cy="' + t.p1.y + '" r="6.5"/>' +
          '<circle class="extremo" data-fio="' + l.id + '" data-ponta="para" cx="' + t.p2.x + '" cy="' + t.p2.y + '" r="6.5"/>';
      }
    });
    if (P.provisorio) h += '<path class="linha provisoria" d="' + P.provisorio + '" marker-end="url(#seta-fio-sel)"/>';
    fios.innerHTML = h;
    rotulos.innerHTML = r;
  };

  P.desenharGuias = linhas => {
    guias.innerHTML = (linhas || []).map(l => '<line x1="' + l.x1 + '" y1="' + l.y1 + '" x2="' + l.x2 + '" y2="' + l.y2 + '"/>').join("");
  };

  P.pontaMaisProxima = (idFio, pt) => {
    const t = tracados.find(v => v.l.id === idFio);
    if (!t) return "para";
    return Math.hypot(pt.x - t.p1.x, pt.y - t.p1.y) < Math.hypot(pt.x - t.p2.x, pt.y - t.p2.y) ? "de" : "para";
  };

  P.render = () => {
    const e = L.obter();
    const ids = new Set(e.nos.map(n => n.id));
    let mudou = false;
    sel.forEach(id => { if (!ids.has(id)) { sel.delete(id); mudou = true; } });
    if (selFio && !e.ligacoes.some(l => l.id === selFio)) { selFio = null; mudou = true; }
    const ordem = e.nos.filter(n => n.tipo === "grupo").concat(e.nos.filter(n => n.tipo !== "grupo"));
    nosEl.innerHTML = ordem.map(htmlNo).join("");
    P.desenharFios();
    if (mudou) avisarSel();
  };

  P.marcarSel = silencioso => {
    const unico = sel.size === 1 && !selFio;
    nosEl.querySelectorAll(".no").forEach(el => {
      const marcado = sel.has(el.dataset.id);
      el.classList.toggle("sel", marcado);
      el.classList.toggle("unico", marcado && unico);
    });
    P.desenharFios();
    if (!silencioso) avisarSel();
  };

  P.selecao = () => ({ nos: [...sel], fio: selFio });
  P.temSelecao = () => sel.size > 0 || !!selFio;
  P.aoSelecionar = f => ouvintesSel.push(f);
  P.aoVista = f => ouvintesVista.push(f);
  P.definirSelecao = (ids, fio, silencioso) => {
    sel = new Set(ids || []);
    selFio = fio || null;
    P.marcarSel(silencioso);
  };
  P.selecionar = (ids, fio) => P.definirSelecao(ids, fio, false);
  P.avisarSelecao = avisarSel;

  P.retanguloSelecao = () => {
    const alvos = [...sel].map(P.elNo).filter(Boolean);
    if (!alvos.length && selFio) {
      const linha = fios.querySelector('[data-fio="' + selFio + '"] .linha');
      if (linha) alvos.push(linha);
    }
    if (!alvos.length) return null;
    const rs = alvos.map(el => el.getBoundingClientRect());
    return {
      left: Math.min(...rs.map(r => r.left)),
      top: Math.min(...rs.map(r => r.top)),
      right: Math.max(...rs.map(r => r.right)),
      bottom: Math.max(...rs.map(r => r.bottom))
    };
  };

  P.comContidos = idsBase => {
    const e = L.obter();
    const ids = new Set(idsBase);
    e.nos.filter(n => idsBase.has(n.id) && n.tipo === "grupo").forEach(g => {
      e.nos.forEach(n => {
        if (ids.has(n.id) || n.tipo === "grupo") return;
        const m = G.centro(P.caixa(n));
        if (m.x >= g.x && m.x <= g.x + g.w && m.y >= g.y && m.y <= g.y + g.h) ids.add(n.id);
      });
    });
    return ids;
  };

  const limites = nos => {
    const cs = nos.map(P.caixa);
    const x0 = Math.min(...cs.map(c => c.x)), y0 = Math.min(...cs.map(c => c.y));
    return { x: x0, y: y0, w: Math.max(...cs.map(c => c.x + c.w)) - x0, h: Math.max(...cs.map(c => c.y + c.h)) - y0 };
  };

  P.zoomEm = (cx, cy, z) => {
    const r = moldura.getBoundingClientRect(), v = L.vista;
    const novo = limitarZoom(z);
    const wx = (cx - r.left - v.x) / v.z, wy = (cy - r.top - v.y) / v.z;
    v.z = novo;
    v.x = cx - r.left - wx * novo;
    v.y = cy - r.top - wy * novo;
    P.aplicarVista();
    L.salvarVista();
  };
  P.limitarZoom = limitarZoom;

  P.zoom = fator => {
    const r = moldura.getBoundingClientRect();
    P.zoomEm(r.left + r.width / 2, r.top + r.height / 2, L.vista.z * fator);
  };
  P.zoom100 = () => {
    const r = moldura.getBoundingClientRect();
    P.zoomEm(r.left + r.width / 2, r.top + r.height / 2, 1);
  };

  const margens = () => {
    if (travado) return { l: 24, t: 24, r: 24, b: 24 };
    if (window.matchMedia("(max-width: 760px)").matches) return { l: 12, t: 64, r: 12, b: 76 };
    return { l: 84, t: 72, r: 24, b: 68 };
  };

  const enquadrar = (nos, piso, teto) => {
    const W = moldura.clientWidth, H = moldura.clientHeight;
    if (!W || !H) return;
    const m = margens();
    const aw = Math.max(80, W - m.l - m.r), ah = Math.max(80, H - m.t - m.b);
    if (!nos.length) {
      L.vista = { x: m.l + 40, y: m.t + 30, z: 1 };
    } else {
      const b = limites(nos);
      const cheio = Math.min(teto, limitarZoom(Math.min(aw / b.w, ah / b.h)));
      const z = piso && cheio < piso ? piso : cheio;
      L.vista = {
        x: m.l + (b.w * z <= aw ? (aw - b.w * z) / 2 : 0) - b.x * z,
        y: m.t + (b.h * z <= ah ? (ah - b.h * z) / 2 : 0) - b.y * z,
        z
      };
    }
    P.aplicarVista();
    L.salvarVista();
  };

  P.ajustar = () => enquadrar(L.obter().nos, 0, 1.25);
  P.enquadrarLegivel = () => enquadrar(L.obter().nos, 0.72, 1.25);
  P.zoomSelecao = () => {
    const nos = [...sel].map(L.no).filter(Boolean);
    if (nos.length) enquadrar(nos, 0, 1.5);
  };

  P.excluirSelecao = () => {
    const e = L.obter();
    if (selFio) {
      e.ligacoes = e.ligacoes.filter(l => l.id !== selFio);
    } else if (sel.size) {
      e.nos = e.nos.filter(n => !sel.has(n.id));
      e.ligacoes = e.ligacoes.filter(l => !sel.has(l.de) && !sel.has(l.para));
    } else {
      return false;
    }
    sel = new Set();
    selFio = null;
    L.confirmar();
    avisarSel();
    return true;
  };

  const recorte = ids => {
    const e = L.obter();
    return JSON.parse(JSON.stringify({
      nos: e.nos.filter(n => ids.has(n.id)),
      ligacoes: e.ligacoes.filter(l => ids.has(l.de) && ids.has(l.para))
    }));
  };

  const inserirRecorte = (parte, dx, dy) => {
    const e = L.obter();
    const troca = {};
    parte.nos.forEach(n => {
      const novo = L.novoId();
      troca[n.id] = novo;
      n.id = novo;
      n.x += dx;
      n.y += dy;
    });
    parte.ligacoes.forEach(l => {
      l.id = L.novoId();
      l.de = troca[l.de];
      l.para = troca[l.para];
    });
    e.nos.push(...parte.nos);
    e.ligacoes.push(...parte.ligacoes);
    sel = new Set(parte.nos.map(n => n.id));
    selFio = null;
    L.confirmar();
    avisarSel();
  };

  P.duplicar = desvio => {
    if (!sel.size) return false;
    const d = desvio === undefined ? 20 : desvio;
    inserirRecorte(recorte(P.comContidos(sel)), d, d);
    return true;
  };

  P.copiar = () => {
    if (!sel.size) return 0;
    copiado = recorte(P.comContidos(sel));
    colagens = 0;
    return copiado.nos.length;
  };

  P.recortar = () => {
    const n = P.copiar();
    if (n) P.excluirSelecao();
    return n;
  };

  P.temCopiado = () => !!copiado && copiado.nos.length > 0;

  P.colar = ponto => {
    if (!P.temCopiado()) return false;
    const parte = JSON.parse(JSON.stringify(copiado));
    let dx, dy;
    if (ponto) {
      const x0 = Math.min(...parte.nos.map(n => n.x)), y0 = Math.min(...parte.nos.map(n => n.y));
      const x1 = Math.max(...parte.nos.map(n => n.x + n.w));
      dx = P.encaixar(ponto.x - (x0 + x1) / 2);
      dy = P.encaixar(ponto.y - y0 - 20);
    } else {
      colagens += 1;
      dx = dy = colagens * 24;
    }
    inserirRecorte(parte, dx, dy);
    return true;
  };

  P.selecionarTudo = () => P.selecionar(L.obter().nos.map(n => n.id));

  P.ordem = sentido => {
    if (!sel.size) return;
    const e = L.obter();
    const marcados = e.nos.filter(n => sel.has(n.id)), outros = e.nos.filter(n => !sel.has(n.id));
    e.nos = sentido === "frente" ? outros.concat(marcados) : marcados.concat(outros);
    L.confirmar();
  };

  P.alinhar = modo => {
    const nos = [...sel].map(L.no).filter(Boolean);
    if (nos.length < 2) return;
    const itens = nos.map(n => ({ n, c: P.caixa(n) }));
    const b = limites(nos);
    itens.forEach(({ n, c }) => {
      if (modo === "esquerda") n.x = b.x;
      else if (modo === "direita") n.x = Math.round(b.x + b.w - c.w);
      else if (modo === "centro") n.x = Math.round(b.x + b.w / 2 - c.w / 2);
      else if (modo === "topo") n.y = b.y;
      else if (modo === "base") n.y = Math.round(b.y + b.h - c.h);
      else if (modo === "meio") n.y = Math.round(b.y + b.h / 2 - c.h / 2);
    });
    L.confirmar();
  };

  P.distribuir = eixo => {
    const nos = [...sel].map(L.no).filter(Boolean);
    if (nos.length < 3) return;
    const h = eixo === "h";
    const itens = nos.map(n => ({ n, c: P.caixa(n) })).sort((a, b) => h ? a.c.x - b.c.x : a.c.y - b.c.y);
    const tam = it => h ? it.c.w : it.c.h;
    const primeiro = itens[0], ultimo = itens[itens.length - 1];
    const inicio = h ? primeiro.c.x : primeiro.c.y;
    const fim = (h ? ultimo.c.x : ultimo.c.y) + tam(ultimo);
    const vao = (fim - inicio - itens.reduce((s, it) => s + tam(it), 0)) / (itens.length - 1);
    let cursor = inicio;
    itens.forEach(it => {
      if (h) it.n.x = Math.round(cursor); else it.n.y = Math.round(cursor);
      cursor += tam(it) + vao;
    });
    L.confirmar();
  };

  P.agrupar = () => {
    const nos = [...sel].map(L.no).filter(n => n && n.tipo !== "grupo");
    if (!nos.length) return null;
    const b = limites(nos);
    const g = L.grupo("Grupo", "neutral", b.x - 20, b.y - 50, b.w + 40, b.h + 70);
    L.obter().nos.push(g);
    sel = new Set([g.id]);
    selFio = null;
    L.confirmar();
    avisarSel();
    return g.id;
  };

  P.criarLigado = () => {
    if (sel.size !== 1) return null;
    const origem = L.no([...sel][0]);
    if (!origem || origem.tipo === "grupo") return null;
    const c = P.caixa(origem);
    const novo = origem.tipo === "forma"
      ? L.forma(origem.forma, c.x + c.w + 80, c.y, { cor: origem.cor, w: origem.w, h: origem.h })
      : L.cardEmBranco(c.x + c.w + 80, c.y);
    const e = L.obter();
    e.nos.push(novo);
    e.ligacoes.push(L.novaLigacao(origem.id, novo.id));
    sel = new Set([novo.id]);
    selFio = null;
    L.confirmar();
    avisarSel();
    return novo.id;
  };

  const guardar = no => {
    L.obter().nos.push(no);
    sel = new Set([no.id]);
    selFio = null;
    L.confirmar();
    avisarSel();
    return no.id;
  };

  const inserir = (no, x, y) => {
    no.x = P.encaixar(x - no.w / 2);
    no.y = P.encaixar(y - (no.tipo === "grupo" || no.tipo === "forma" ? no.h / 2 : 30));
    return guardar(no);
  };

  P.larguraMinima = n => n.tipo === "grupo" ? 140 : n.tipo === "forma" ? 60 : 120;
  P.alturaMinima = n => n.tipo === "grupo" ? 90 : 40;

  P.inserirCaixa = (no, c) => {
    no.x = P.encaixar(c.x);
    no.y = P.encaixar(c.y);
    if (c.w) no.w = Math.max(P.larguraMinima(no), P.encaixar(c.w));
    if (c.h && (no.tipo === "grupo" || no.tipo === "forma")) no.h = Math.max(P.alturaMinima(no), P.encaixar(c.h));
    else if (c.h && no.tipo === "card") no.alt = Math.max(40, P.encaixar(c.h));
    return guardar(no);
  };

  P.inserirEm = (no, pt) => inserir(no, pt.x, pt.y);
  P.dentro = (cx, cy) => {
    const el = document.elementFromPoint(cx, cy);
    return !!el && moldura.contains(el);
  };
  P.adicionarNaTela = (no, cx, cy) => {
    const m = P.mundo({ clientX: cx, clientY: cy });
    return inserir(no, m.x, m.y);
  };
  P.adicionarNoCentro = no => {
    const r = moldura.getBoundingClientRect();
    const desvio = (cascata++ % 6) * 24;
    const m = P.mundo({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    return inserir(no, m.x + desvio, m.y + desvio);
  };

  P.iniciar = () => {
    moldura = $("#moldura");
    palco = $("#palco");
    nosEl = $("#nos");
    fios = $("#fios");
    rotulos = $("#rotulos");
    guias = $("#guias");
    moldura.addEventListener("wheel", ev => {
      ev.preventDefault();
      if (L.menu) L.menu.fechar();
      if (ev.ctrlKey || ev.metaKey) {
        P.zoomEm(ev.clientX, ev.clientY, L.vista.z * Math.exp(-ev.deltaY * 0.002));
      } else {
        L.vista.x -= ev.shiftKey && !ev.deltaX ? ev.deltaY : ev.deltaX;
        L.vista.y -= ev.shiftKey && !ev.deltaX ? 0 : ev.deltaY;
        P.aplicarVista();
        L.salvarVista();
      }
    }, { passive: false });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => P.desenharFios());
    P.aplicarVista();
    P.render();
  };
})(window.Board);
