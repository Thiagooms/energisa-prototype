(function (B) {
  const L = B.livre;
  const P = L.palco;
  const G = B.geometria;
  const { $ } = B.util;
  const X = L.gestos = {};
  const COM_ROLAGEM = ["mover", "ligar", "religar", "laco", "redim", "criar"];
  const CRIAR = ["card", "texto", "adesivo", "forma", "grupo"];
  const FERRAMENTAS = ["selecionar", "mao", "ligacao"].concat(CRIAR);

  let moldura, nosEl, laco;
  let gesto = null;
  let espaco = false;
  let ferramenta = "selecionar";
  let forma = "retangulo";
  let ultimoEv = null;
  let quadro = 0;
  let alvo = null;
  let ultimoToque = { chave: null, t: 0 };
  const ponteiros = new Map();
  const ouvintesFerramenta = [];

  const noSob = ev => {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const no = el ? el.closest(".no") : null;
    return no && nosEl.contains(no) ? no : null;
  };

  const marcarAlvo = el => {
    if (el === alvo) return;
    if (alvo) alvo.classList.remove("alvo");
    if (el) el.classList.add("alvo");
    alvo = el;
  };

  const duplo = chave => {
    const agora = Date.now();
    const sim = ultimoToque.chave === chave && agora - ultimoToque.t < 400;
    ultimoToque = sim ? { chave: null, t: 0 } : { chave, t: agora };
    return sim;
  };

  const atualizarCursor = () => {
    moldura.classList.toggle("mao", espaco || ferramenta === "mao");
    moldura.classList.toggle("criando", !espaco && ferramenta !== "selecionar" && ferramenta !== "mao");
  };

  X.definirEspaco = v => {
    if (espaco === !!v) return;
    espaco = !!v;
    atualizarCursor();
  };
  X.ferramenta = () => ferramenta;
  X.aoTrocarFerramenta = f => ouvintesFerramenta.push(f);
  X.definirFerramenta = f => {
    ferramenta = FERRAMENTAS.includes(f) ? f : "selecionar";
    if (ferramenta !== "selecionar" && ferramenta !== "mao" && P.temSelecao()) P.selecionar([]);
    atualizarCursor();
    ouvintesFerramenta.forEach(o => o(ferramenta));
  };
  X.forma = () => forma;
  X.definirForma = f => { forma = L.formaDe(f).id; };
  X.ativo = () => !!gesto;

  const cardVazio = () => L.cardEmBranco(0, 0);

  const novoDaFerramenta = () => {
    if (ferramenta === "texto") return L.nota("", 0, 0);
    if (ferramenta === "adesivo") return L.forma("adesivo", 0, 0, { cor: "amber" });
    if (ferramenta === "forma") return L.forma(forma, 0, 0);
    if (ferramenta === "grupo") return L.grupo("", "neutral", 0, 0, 320, 220);
    return cardVazio();
  };

  const mostrarLaco = (x, y, w, h) => {
    const v = L.vista;
    laco.hidden = false;
    laco.style.left = x * v.z + v.x + "px";
    laco.style.top = y * v.z + v.y + "px";
    laco.style.width = w * v.z + "px";
    laco.style.height = h * v.z + "px";
  };

  const encerrar = () => {
    const g = gesto;
    gesto = null;
    ultimoEv = null;
    moldura.classList.remove("arrastando", "ligando");
    marcarAlvo(null);
    laco.hidden = true;
    P.desenharGuias([]);
    P.provisorio = null;
    P.fioOculto = null;
    if (g && g.ponteiro !== undefined) {
      try { if (moldura.hasPointerCapture(g.ponteiro)) moldura.releasePointerCapture(g.ponteiro); } catch (erro) {}
    }
  };

  const desfazerGesto = g => {
    if (g.tipo === "mover" && g.moveu) {
      g.itens.forEach(it => { it.n.x = it.x0; it.n.y = it.y0; P.posicionar(it.n); });
    } else if (g.tipo === "redim") {
      Object.assign(g.n, g.antes);
      P.posicionar(g.n);
    } else if (g.tipo === "laco") {
      P.definirSelecao(g.anteriores, null, false);
    }
    P.desenharFios();
  };

  X.cancelar = () => {
    if (!gesto || gesto.tipo === "pinca" || gesto.tipo === "espera") return false;
    const g = gesto;
    encerrar();
    desfazerGesto(g);
    return true;
  };

  const iniciarPinca = () => {
    if (gesto && gesto.tipo !== "pan") X.cancelar();
    encerrar();
    const [a, b] = [...ponteiros.values()];
    const r = moldura.getBoundingClientRect(), v = L.vista;
    const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
    gesto = { tipo: "pinca", d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), z0: v.z, wx: (mx - v.x) / v.z, wy: (my - v.y) / v.z };
    P.desenharFios();
  };

  const prepararMovimento = (g, idPrimario) => {
    const ids = P.comContidos(new Set(P.selecao().nos));
    const e = L.obter();
    g.itens = e.nos.filter(n => ids.has(n.id)).map(n => ({ n, x0: n.x, y0: n.y }));
    if (!g.itens.length) return false;
    g.prim = g.itens.find(it => it.n.id === idPrimario) || g.itens[0];
    g.id = g.prim.n.id;
    const c = P.caixa(g.prim.n);
    g.pw = c.w;
    g.ph = c.h;
    const grupo = g.prim.n.tipo === "grupo";
    g.fixos = e.nos.filter(n => !ids.has(n.id) && (n.tipo === "grupo") === grupo).map(P.caixa);
    return true;
  };

  const guiar = (g, ax, ay) => {
    const tol = 6 / L.vista.z;
    const dxs = [0, g.pw / 2, g.pw], dys = [0, g.ph / 2, g.ph];
    let gx = null, gy = null;
    g.fixos.forEach(c => {
      [c.x, c.x + c.w / 2, c.x + c.w].forEach(linha => dxs.forEach(o => {
        const d = linha - (ax + o);
        if (Math.abs(d) < tol && (!gx || Math.abs(d) < Math.abs(gx.d))) gx = { d, linha, c };
      }));
      [c.y, c.y + c.h / 2, c.y + c.h].forEach(linha => dys.forEach(o => {
        const d = linha - (ay + o);
        if (Math.abs(d) < tol && (!gy || Math.abs(d) < Math.abs(gy.d))) gy = { d, linha, c };
      }));
    });
    return { x: gx, y: gy };
  };

  const mover = (g, m, ev) => {
    let dx = m.x - g.x0, dy = m.y - g.y0;
    if (!g.moveu && Math.hypot(dx, dy) * L.vista.z < 4) return;
    g.moveu = true;
    const travaEixo = ev.shiftKey && !g.shift;
    if (travaEixo) { if (Math.abs(dx) >= Math.abs(dy)) dy = 0; else dx = 0; }
    const ax = g.prim.x0 + dx, ay = g.prim.y0 + dy;
    let sx, sy;
    const linhas = [];
    if (ev.ctrlKey) {
      sx = Math.round(ax);
      sy = Math.round(ay);
    } else {
      const guia = guiar(g, ax, ay);
      sx = guia.x ? ax + guia.x.d : P.encaixar(ax);
      sy = guia.y ? ay + guia.y.d : P.encaixar(ay);
      if (travaEixo && dy === 0) { sy = g.prim.y0; guia.y = null; }
      if (travaEixo && dx === 0) { sx = g.prim.x0; guia.x = null; }
      if (guia.x) linhas.push({ x1: guia.x.linha, x2: guia.x.linha, y1: Math.min(sy, guia.x.c.y) - 10, y2: Math.max(sy + g.ph, guia.x.c.y + guia.x.c.h) + 10 });
      if (guia.y) linhas.push({ y1: guia.y.linha, y2: guia.y.linha, x1: Math.min(sx, guia.y.c.x) - 10, x2: Math.max(sx + g.pw, guia.y.c.x + guia.y.c.w) + 10 });
    }
    const ddx = sx - g.prim.x0, ddy = sy - g.prim.y0;
    g.itens.forEach(it => {
      it.n.x = Math.round(it.x0 + ddx);
      it.n.y = Math.round(it.y0 + ddy);
      P.posicionar(it.n);
    });
    P.desenharGuias(linhas);
    P.desenharFios();
  };

  const redimensionar = (g, m) => {
    const n = g.n;
    const dx = m.x - g.x0, dy = m.y - g.y0;
    const leste = g.canto[1] === "e", norte = g.canto[0] === "n";
    const grupo = n.tipo === "grupo" || n.tipo === "forma";
    const w = Math.max(P.larguraMinima(n), P.encaixar(g.bw + (leste ? dx : -dx)));
    n.w = w;
    n.x = leste ? g.bx : g.bx + g.bw - w;
    if (Math.abs(dy) > 4) g.vertical = true;
    if (n.tipo !== "nota" && g.vertical) {
      const h = Math.max(P.alturaMinima(n), P.encaixar(g.bh + (norte ? -dy : dy)));
      if (grupo) {
        n.h = h;
        n.y = norte ? g.by + g.bh - h : g.by;
      } else {
        n.alt = h;
        P.posicionar(n);
        n.y = norte ? g.by + g.bh - P.elNo(n.id).offsetHeight : g.by;
      }
    }
    P.posicionar(n);
    P.desenharFios();
  };

  const lacar = (g, m, ev) => {
    if (!g.moveu && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 4) return;
    g.moveu = true;
    const x = Math.min(g.x0, m.x), y = Math.min(g.y0, m.y), w = Math.abs(m.x - g.x0), h = Math.abs(m.y - g.y0);
    mostrarLaco(x, y, w, h);
    const ids = new Set(g.anteriores);
    L.obter().nos.forEach(n => {
      const c = P.caixa(n);
      const dentro = n.tipo === "grupo"
        ? c.x >= x && c.y >= y && c.x + c.w <= x + w && c.y + c.h <= y + h
        : c.x < x + w && c.x + c.w > x && c.y < y + h && c.y + c.h > y;
      if (dentro) ids.add(n.id);
    });
    P.definirSelecao([...ids], null, true);
  };

  const tracar = (g, m, ev) => {
    if (!g.moveu && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 6) return;
    g.moveu = true;
    g.caixa = { x: Math.min(g.x0, m.x), y: Math.min(g.y0, m.y), w: Math.abs(m.x - g.x0), h: Math.abs(m.y - g.y0) };
    mostrarLaco(g.caixa.x, g.caixa.y, g.caixa.w, g.caixa.h);
  };

  const puxarLigacao = (g, m, ev) => {
    const origem = L.no(g.de);
    if (!origem) return;
    const c = P.caixa(origem);
    const p1 = G.ponto(c, G.lado(c, m), 0, 0);
    P.provisorio = G.caminho(p1, G.solto(m.x, m.y, p1), L.formaPadrao).d;
    if (Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) > 12) g.arrastou = true;
    const no = noSob(ev);
    marcarAlvo(no && no.dataset.id !== g.de && no.dataset.tipo !== "grupo" ? no : null);
    moldura.classList.add("ligando");
    P.desenharFios();
  };

  const puxarPonta = (g, m, ev) => {
    const l = L.ligacao(g.fio);
    if (!l) return;
    const idFixo = g.ponta === "de" ? l.para : l.de;
    const fixo = L.no(idFixo);
    if (!fixo) return;
    const c = P.caixa(fixo);
    if (g.ponta === "para") {
      const p1 = G.ponto(c, G.lado(c, m), 0, 0);
      P.provisorio = G.caminho(p1, G.solto(m.x, m.y, p1), l.forma).d;
    } else {
      const p2 = G.ponto(c, G.lado(c, m), 4, 0);
      P.provisorio = G.caminho(G.solto(m.x, m.y, p2), p2, l.forma).d;
    }
    P.fioOculto = g.fio;
    const no = noSob(ev);
    marcarAlvo(no && no.dataset.id !== idFixo && no.dataset.tipo !== "grupo" ? no : null);
    moldura.classList.add("ligando");
    P.desenharFios();
  };

  const processar = ev => {
    const g = gesto;
    if (!g) return;
    const m = P.mundo(ev);
    if (g.tipo === "pan") {
      L.vista.x = g.vx + ev.clientX - g.cx;
      L.vista.y = g.vy + ev.clientY - g.cy;
      P.aplicarVista();
    } else if (g.tipo === "fio") {
      if (Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) > 5) {
        g.tipo = "religar";
        g.ponta = P.pontaMaisProxima(g.fio, { x: g.x0, y: g.y0 });
        puxarPonta(g, m, ev);
      }
    } else if (g.tipo === "mover") mover(g, m, ev);
    else if (g.tipo === "redim") redimensionar(g, m);
    else if (g.tipo === "ligar") puxarLigacao(g, m, ev);
    else if (g.tipo === "religar") puxarPonta(g, m, ev);
    else if (g.tipo === "laco") lacar(g, m, ev);
    else if (g.tipo === "criar") tracar(g, m, ev);
  };

  const tique = () => {
    quadro = 0;
    if (!gesto || !COM_ROLAGEM.includes(gesto.tipo)) return;
    if (ultimoEv && !(gesto.tipo === "mover" && !gesto.moveu) && !(gesto.tipo === "laco" && !gesto.moveu)) {
      const r = moldura.getBoundingClientRect();
      const margem = 28;
      const vx = ultimoEv.clientX < r.left + margem ? 1 : ultimoEv.clientX > r.right - margem ? -1 : 0;
      const vy = ultimoEv.clientY < r.top + margem ? 1 : ultimoEv.clientY > r.bottom - margem ? -1 : 0;
      if (vx || vy) {
        L.vista.x += vx * 9;
        L.vista.y += vy * 9;
        P.aplicarVista();
        processar(ultimoEv);
      }
    }
    quadro = requestAnimationFrame(tique);
  };

  const aoDescer = ev => {
    if (ev.button === 2 || ev.target.closest(".sair, .vazio-acoes")) return;
    if (L.edicao.ativa()) {
      if (L.edicao.contem(ev.target)) return;
      L.edicao.concluir();
    }
    L.menu.fechar();
    if (ev.isPrimary) ponteiros.clear();
    ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ponteiros.size === 2) {
      if (!(gesto && gesto.tipo === "mover" && gesto.moveu)) iniciarPinca();
      ev.preventDefault();
      return;
    }
    if (ponteiros.size > 2) return;

    const elNo = ev.target.closest(".no");
    const id = elNo ? elNo.dataset.id : null;
    const m = P.mundo(ev);
    const base = { ponteiro: ev.pointerId, cx: ev.clientX, cy: ev.clientY, x0: m.x, y0: m.y };
    moldura.focus({ preventScroll: true });
    gesto = null;

    if (P.travado() || espaco || ferramenta === "mao" || ev.button === 1) {
      gesto = Object.assign(base, { tipo: "pan", vx: L.vista.x, vy: L.vista.y, id, mao: !P.travado() });
    } else if (CRIAR.includes(ferramenta)) {
      if (P.temSelecao()) P.selecionar([]);
      gesto = Object.assign(base, { tipo: "criar", moveu: false, caixa: null });
    } else if (ferramenta === "ligacao") {
      if (id && elNo.dataset.tipo !== "grupo") gesto = Object.assign(base, { tipo: "ligar", de: id, arrastou: false });
    } else if (ev.target.classList.contains("extremo")) {
      gesto = Object.assign(base, { tipo: "religar", fio: ev.target.dataset.fio, ponta: ev.target.dataset.ponta });
    } else if (id && ev.target.classList.contains("alca")) {
      gesto = Object.assign(base, { tipo: "ligar", de: id, arrastou: false });
    } else if (id && ev.target.classList.contains("redim")) {
      const n = L.no(id);
      P.selecionar([id]);
      const c = P.caixa(n);
      gesto = Object.assign(base, { tipo: "redim", n, canto: ev.target.dataset.canto, antes: { x: n.x, y: n.y, w: n.w, h: n.h, alt: n.alt }, bx: c.x, by: c.y, bw: c.w, bh: c.h, vertical: false });
    } else if (id) {
      const marcados = new Set(P.selecao().nos);
      if (ev.shiftKey) {
        if (marcados.has(id)) marcados.delete(id); else marcados.add(id);
        P.selecionar([...marcados]);
      } else if (!marcados.has(id) || P.selecao().fio) {
        P.selecionar(marcados.has(id) ? [...marcados] : [id]);
      }
      let primario = id;
      if (ev.altKey && P.selecao().nos.includes(id)) {
        const origem = L.no(id);
        P.duplicar(0);
        const copia = P.selecao().nos.map(L.no).find(n => n.x === origem.x && n.y === origem.y && n.tipo === origem.tipo && n.titulo === origem.titulo);
        primario = copia ? copia.id : P.selecao().nos[0];
      }
      const g = Object.assign(base, { tipo: "mover", shift: ev.shiftKey, moveu: false, parte: ev.target.closest(".d") ? "desc" : "titulo" });
      if (prepararMovimento(g, primario)) gesto = g;
    } else if (ev.target.closest(".fio")) {
      const fio = ev.target.closest(".fio").dataset.fio;
      P.selecionar([], fio);
      gesto = Object.assign(base, { tipo: "fio", fio });
    } else if (ev.pointerType === "touch") {
      if (P.temSelecao()) P.selecionar([]);
      gesto = Object.assign(base, { tipo: "pan", vx: L.vista.x, vy: L.vista.y, id: null, mao: false });
    } else {
      const anteriores = ev.shiftKey ? P.selecao().nos : [];
      if (!ev.shiftKey && P.temSelecao()) P.selecionar([]);
      gesto = Object.assign(base, { tipo: "laco", anteriores, moveu: false });
    }

    if (gesto) {
      try { moldura.setPointerCapture(ev.pointerId); } catch (erro) {}
      if (gesto.tipo === "pan") moldura.classList.add("arrastando");
      if (!quadro) quadro = requestAnimationFrame(tique);
    }
    ev.preventDefault();
  };

  const aoMover = ev => {
    if (ponteiros.has(ev.pointerId)) ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    P.ultimoPonteiro = P.mundo(ev);
    if (!gesto || gesto.tipo === "espera") return;
    if (gesto.tipo === "pinca") {
      const [a, b] = [...ponteiros.values()];
      if (!b) return;
      const r = moldura.getBoundingClientRect(), v = L.vista;
      v.z = P.limitarZoom(gesto.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gesto.d0);
      v.x = (a.x + b.x) / 2 - r.left - gesto.wx * v.z;
      v.y = (a.y + b.y) / 2 - r.top - gesto.wy * v.z;
      P.aplicarVista();
      return;
    }
    ultimoEv = { clientX: ev.clientX, clientY: ev.clientY, shiftKey: ev.shiftKey, ctrlKey: ev.ctrlKey || ev.metaKey };
    processar(ultimoEv);
  };

  const criarLigadoEm = (g, m) => {
    const novo = cardVazio();
    novo.x = P.encaixar(m.x - novo.w / 2);
    novo.y = P.encaixar(m.y - 30);
    const e = L.obter();
    e.nos.push(novo);
    e.ligacoes.push(L.novaLigacao(g.de, novo.id));
    P.definirSelecao([novo.id], null, true);
    L.confirmar();
    P.avisarSelecao();
    L.edicao.iniciar(novo.id, "titulo");
  };

  const aoSoltar = ev => {
    ponteiros.delete(ev.pointerId);
    if (!gesto) return;
    if (gesto.tipo === "pinca" || gesto.tipo === "espera") {
      gesto = ponteiros.size ? { tipo: "espera" } : null;
      L.salvarVista();
      return;
    }
    const g = gesto;
    const cancelado = ev.type === "pointercancel";
    const no = cancelado ? null : noSob(ev);
    encerrar();
    if (cancelado) { desfazerGesto(g); return; }
    const parado = Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 5;
    const m = P.mundo(ev);
    const e = L.obter();

    if (g.tipo === "pan") {
      L.salvarVista();
      if (!parado) return;
      if (P.travado()) {
        const n = g.id ? L.no(g.id) : null;
        if (n) L.abrirDetalhe(n, {});
      } else if (!g.mao && !g.id && duplo("vazio")) {
        L.edicao.iniciar(P.adicionarNaTela(cardVazio(), ev.clientX, ev.clientY), "titulo");
      }
    } else if (g.tipo === "laco") {
      if (g.moveu) P.avisarSelecao();
      else if (duplo("vazio")) L.edicao.iniciar(P.adicionarNaTela(cardVazio(), ev.clientX, ev.clientY), "titulo");
    } else if (g.tipo === "mover") {
      if (g.moveu) { L.confirmar(); return; }
      if (!g.shift && P.selecao().nos.length > 1) P.selecionar([g.id]);
      if (duplo("no:" + g.id)) L.edicao.iniciar(g.id, g.parte);
    } else if (g.tipo === "redim") {
      L.confirmar();
    } else if (g.tipo === "criar") {
      const novo = novoDaFerramenta();
      const c = g.caixa;
      const tracado = c && c.w * L.vista.z > 24 && c.h * L.vista.z > 16;
      const id = tracado ? P.inserirCaixa(novo, c)
        : novo.tipo === "nota" ? P.inserirCaixa(novo, { x: m.x - 8, y: m.y - 14 })
        : P.adicionarNaTela(novo, ev.clientX, ev.clientY);
      X.definirFerramenta("selecionar");
      L.edicao.iniciar(id, novo.tipo === "nota" ? "desc" : "titulo");
    } else if (g.tipo === "fio") {
      P.desenharFios();
      if (duplo("fio:" + g.fio)) L.inspetor.focar();
    } else if (g.tipo === "ligar") {
      const para = no && no.dataset.tipo !== "grupo" && no.dataset.id !== g.de ? no.dataset.id : null;
      if (para && !e.ligacoes.some(l => l.de === g.de && l.para === para)) {
        const nova = L.novaLigacao(g.de, para);
        e.ligacoes.push(nova);
        P.definirSelecao([], nova.id, true);
        L.confirmar();
        P.avisarSelecao();
      } else if (!no && g.arrastou && P.dentro(ev.clientX, ev.clientY)) {
        criarLigadoEm(g, m);
      } else {
        P.desenharFios();
      }
    } else if (g.tipo === "religar") {
      const l = L.ligacao(g.fio);
      const destino = no && no.dataset.tipo !== "grupo" ? no.dataset.id : null;
      if (l && destino) {
        const de = g.ponta === "de" ? destino : l.de, para = g.ponta === "para" ? destino : l.para;
        if (de !== para && !e.ligacoes.some(o => o !== l && o.de === de && o.para === para)) {
          l.de = de;
          l.para = para;
          L.confirmar();
        }
      }
      P.desenharFios();
    }
  };

  X.iniciar = () => {
    moldura = $("#moldura");
    nosEl = $("#nos");
    laco = $("#laco");
    moldura.addEventListener("pointerdown", aoDescer);
    moldura.addEventListener("pointermove", aoMover);
    moldura.addEventListener("pointerup", aoSoltar);
    moldura.addEventListener("pointercancel", aoSoltar);
    moldura.addEventListener("pointerleave", () => { if (!gesto) P.ultimoPonteiro = null; });
  };
})(window.Board);
