(function (B) {
  const NORMAL = { n: [0, -1], e: [1, 0], s: [0, 1], o: [-1, 0] };

  const centro = c => ({ x: c.x + c.w / 2, y: c.y + c.h / 2 });

  const lado = (c, alvo) => {
    const m = centro(c);
    const dx = alvo.x - m.x, dy = alvo.y - m.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? "e" : "o") : (dy >= 0 ? "s" : "n");
  };

  const ponto = (c, qual, folga, desvio) => {
    const [nx, ny] = NORMAL[qual];
    const m = centro(c);
    const d = desvio || 0;
    return { x: m.x + nx * (c.w / 2 + folga) + Math.abs(ny) * d, y: m.y + ny * (c.h / 2 + folga) + Math.abs(nx) * d, nx, ny };
  };

  const solto = (x, y, fixo) => ({ x, y, nx: -fixo.nx, ny: -fixo.ny });

  const arredondar = (p, raio) => {
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

  const cotovelo = (p1, p2) => {
    const h1 = p1.nx !== 0, h2 = p2.nx !== 0;
    let pts;
    if (h1 && h2) {
      const x = p1.nx !== p2.nx ? (p1.x + p2.x) / 2 : (p1.nx > 0 ? Math.max(p1.x, p2.x) + 30 : Math.min(p1.x, p2.x) - 30);
      pts = [[p1.x, p1.y], [x, p1.y], [x, p2.y], [p2.x, p2.y]];
    } else if (!h1 && !h2) {
      const y = p1.ny !== p2.ny ? (p1.y + p2.y) / 2 : (p1.ny > 0 ? Math.max(p1.y, p2.y) + 30 : Math.min(p1.y, p2.y) - 30);
      pts = [[p1.x, p1.y], [p1.x, y], [p2.x, y], [p2.x, p2.y]];
    } else if (h1) {
      pts = [[p1.x, p1.y], [p2.x, p1.y], [p2.x, p2.y]];
    } else {
      pts = [[p1.x, p1.y], [p1.x, p2.y], [p2.x, p2.y]];
    }
    const meio = pts.length === 4 ? [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2] : pts[1];
    return { d: arredondar(pts, 10), mx: meio[0], my: meio[1] };
  };

  const caminho = (p1, p2, forma) => {
    if (forma === "reta") {
      return { d: "M" + p1.x + "," + p1.y + " L" + p2.x + "," + p2.y, mx: (p1.x + p2.x) / 2, my: (p1.y + p2.y) / 2 };
    }
    if (forma === "cotovelo") return cotovelo(p1, p2);
    const k = Math.max(30, Math.min(140, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.45));
    const c1 = { x: p1.x + p1.nx * k, y: p1.y + p1.ny * k };
    const c2 = { x: p2.x + p2.nx * k, y: p2.y + p2.ny * k };
    return {
      d: "M" + p1.x + "," + p1.y + " C" + c1.x + "," + c1.y + " " + c2.x + "," + c2.y + " " + p2.x + "," + p2.y,
      mx: (p1.x + 3 * c1.x + 3 * c2.x + p2.x) / 8,
      my: (p1.y + 3 * c1.y + 3 * c2.y + p2.y) / 8
    };
  };

  const montar = (ligacoes, caixaDe) => {
    const itens = [];
    const porLado = {};
    ligacoes.forEach(l => {
      const ca = caixaDe(l.de), cb = caixaDe(l.para);
      if (!ca || !cb) return;
      const it = { l, ca, cb, la: lado(ca, centro(cb)), lb: lado(cb, centro(ca)), da: 0, db: 0 };
      itens.push(it);
      (porLado[l.de + it.la] = porLado[l.de + it.la] || []).push({ it, ponta: "a", ref: centro(cb) });
      (porLado[l.para + it.lb] = porLado[l.para + it.lb] || []).push({ it, ponta: "b", ref: centro(ca) });
    });
    Object.keys(porLado).forEach(chave => {
      const grupo = porLado[chave];
      if (grupo.length < 2) return;
      const lateral = chave.endsWith("e") || chave.endsWith("o");
      grupo.sort((p, q) => lateral ? p.ref.y - q.ref.y : p.ref.x - q.ref.x);
      grupo.forEach((p, i) => {
        const c = p.ponta === "a" ? p.it.ca : p.it.cb;
        const desvio = c.pontual ? 0 : ((i + 1) / (grupo.length + 1) - 0.5) * (lateral ? c.h : c.w) * 0.7;
        if (p.ponta === "a") p.it.da = desvio; else p.it.db = desvio;
      });
    });
    return itens.map(it => {
      const p1 = ponto(it.ca, it.la, it.l.pontas === "ambas" ? 4 : 0, it.da);
      const p2 = ponto(it.cb, it.lb, it.l.pontas === "nenhuma" ? 0 : 4, it.db);
      return Object.assign({ l: it.l, p1, p2 }, caminho(p1, p2, it.l.forma));
    });
  };

  B.geometria = { centro, lado, ponto, solto, caminho, montar };
})(window.Board);
