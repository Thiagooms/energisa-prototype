(function (B) {
  const L = B.livre;
  const FORMAS = [
    { id: "retangulo", nome: "Retângulo", w: 160, h: 80, tecla: "R" },
    { id: "pilula", nome: "Início ou fim", w: 160, h: 56 },
    { id: "elipse", nome: "Elipse", w: 150, h: 90, tecla: "O" },
    { id: "losango", nome: "Decisão", w: 160, h: 110, tecla: "D" },
    { id: "cilindro", nome: "Banco de dados", w: 130, h: 110 },
    { id: "hexagono", nome: "Hexágono", w: 170, h: 90 },
    { id: "nuvem", nome: "Nuvem", w: 180, h: 110 },
    { id: "adesivo", nome: "Nota adesiva", w: 150, h: 150 }
  ];
  const NUVEM = "M25,98 C6,98 -2,74 10,58 C3,30 27,14 39,28 C47,-2 80,0 81,34 C99,33 103,66 90,80 C88,94 80,98 74,98 Z";

  const a = v => Math.round(v * 10) / 10;
  const retangulo = (w, h, raio) => {
    const r = Math.min(raio, w / 2, h / 2);
    return "M" + r + ",0 H" + a(w - r) + " Q" + w + ",0 " + w + "," + r + " V" + a(h - r) + " Q" + w + "," + h + " " + a(w - r) + "," + h +
      " H" + r + " Q0," + h + " 0," + a(h - r) + " V" + r + " Q0,0 " + r + ",0 Z";
  };
  const escalar = (d, sx, sy) => {
    let i = 0;
    return d.replace(/-?\d+(\.\d+)?/g, v => a(Number(v) * (i++ % 2 ? sy : sx)));
  };

  L.FORMAS = FORMAS;
  L.formaDe = id => FORMAS.find(f => f.id === id) || FORMAS[0];

  L.silhueta = (forma, w, h) => {
    if (forma === "pilula") return retangulo(w, h, h / 2);
    if (forma === "elipse") return "M0," + a(h / 2) + " A" + a(w / 2) + "," + a(h / 2) + " 0 1 0 " + w + "," + a(h / 2) + " A" + a(w / 2) + "," + a(h / 2) + " 0 1 0 0," + a(h / 2) + " Z";
    if (forma === "losango") return "M" + a(w / 2) + ",0 L" + w + "," + a(h / 2) + " L" + a(w / 2) + "," + h + " L0," + a(h / 2) + " Z";
    if (forma === "cilindro") {
      const r = a(Math.min(16, h / 4));
      return "M0," + r + " A" + a(w / 2) + "," + r + " 0 0 1 " + w + "," + r + " V" + a(h - r) + " A" + a(w / 2) + "," + r + " 0 0 1 0," + a(h - r) + " Z M0," + r + " A" + a(w / 2) + "," + r + " 0 0 0 " + w + "," + r;
    }
    if (forma === "hexagono") {
      const s = a(Math.min(h / 2, w / 4));
      return "M" + s + ",0 L" + a(w - s) + ",0 L" + w + "," + a(h / 2) + " L" + a(w - s) + "," + h + " L" + s + "," + h + " L0," + a(h / 2) + " Z";
    }
    if (forma === "nuvem") return escalar(NUVEM, w / 100, h / 100);
    if (forma === "adesivo") return retangulo(w, h, 4);
    return retangulo(w, h, 9);
  };

  const base = (tipo, x, y, extra) => Object.assign({ id: L.novoId(), tipo, x, y, w: 190, h: 200, alt: 0, titulo: "", desc: "", etiqueta: "", cor: "neutral", icone: "", forma: "", ref: null }, extra);

  L.card = (titulo, desc, extra) => base("card", 0, 0, Object.assign({ titulo, desc }, extra));
  L.cardEmBranco = (x, y) => base("card", x, y, {});
  L.grupo = (titulo, cor, x, y, w, h) => base("grupo", x, y, { titulo, cor, w, h });
  L.nota = (texto, x, y) => base("nota", x, y, { desc: texto, w: 220 });
  L.forma = (forma, x, y, extra) => {
    const f = L.formaDe(forma);
    return base("forma", x, y, Object.assign({ forma: f.id, w: f.w, h: f.h }, extra));
  };
  L.vazio = () => ({ nome: "", nos: [], ligacoes: [] });

  L.rascunho = nome => {
    const nos = [];
    const ligacoes = [];
    return {
      por: (n, x, y) => {
        if (x !== undefined) { n.x = x; n.y = y; }
        nos.push(n);
        return n;
      },
      ligar: (de, para, rotulo, extra) => ligacoes.push(L.novaLigacao(de.id, para.id, Object.assign({ rotulo: rotulo || "", forma: "curva" }, extra))),
      pronto: () => ({ nome: nome || "", nos, ligacoes })
    };
  };
})(window.Board);
