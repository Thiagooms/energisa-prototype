(function (B) {
  const { ler, gravar } = B.util;
  const CHAVE = "board-livre-v1";
  const CORES = ["amber", "violet", "blue", "green", "rose", "neutral"];
  const TIPOS = ["card", "grupo", "nota", "forma"];
  const PONTAS = ["fim", "ambas", "nenhuma"];
  const TRACADOS = ["curva", "reta", "cotovelo"];
  const L = B.livre = { CORES };

  let estado = { nome: "", nos: [], ligacoes: [] };
  let ultimo = "";
  const passado = [];
  const futuro = [];
  const ouvintes = [];

  L.vista = { x: 40, y: 30, z: 1 };
  L.temVistaSalva = false;
  L.catalogos = [];
  L.modelos = [];
  L.FORMAS = [];

  const texto = v => typeof v === "string" ? v : "";
  const numero = (v, padrao) => Number.isFinite(Number(v)) ? Number(v) : padrao;
  const idValido = v => typeof v === "string" && /^[\w-]+$/.test(v);

  L.novoId = () => "n" + Math.random().toString(36).slice(2, 10);
  L.formaPadrao = "curva";
  L.novaLigacao = (de, para, extra) => Object.assign({ id: L.novoId(), de, para, rotulo: "", tracejada: false, pontas: "fim", forma: L.formaPadrao }, extra);

  L.registrarCatalogo = c => L.catalogos.push(c);
  L.catalogo = id => L.catalogos.find(c => c.id === id);
  L.registrarModelo = m => L.modelos.push(m);

  const catalogoDe = no => no && no.ref ? L.catalogo(no.ref.c) : null;
  L.temDetalhe = no => { const c = catalogoDe(no); return !!c && !!c.abrirDetalhe; };
  L.rotuloDetalhe = no => { const c = catalogoDe(no); return c && c.rotuloDetalhe ? c.rotuloDetalhe : "Ver detalhes"; };
  L.abrirDetalhe = (no, opcoes) => { const c = catalogoDe(no); if (c && c.abrirDetalhe) c.abrirDetalhe(no, opcoes || {}); };

  const refValida = r => {
    if (!r || typeof r !== "object") return null;
    const c = L.catalogo(typeof r.c === "string" ? r.c : "energisa");
    return c && c.normalizarRef ? c.normalizarRef(r) : null;
  };

  L.normalizar = bruto => {
    if (!bruto || !Array.isArray(bruto.nos)) return null;
    const formas = L.FORMAS.map(f => f.id);
    const nos = bruto.nos.filter(n => n && TIPOS.includes(n.tipo) && idValido(n.id)).map(n => {
      const forma = n.tipo === "forma";
      return {
        id: n.id,
        tipo: n.tipo,
        x: numero(n.x, 0),
        y: numero(n.y, 0),
        w: Math.max(forma ? 60 : 120, numero(n.w, n.tipo === "grupo" ? 260 : forma ? 160 : 190)),
        h: Math.max(forma ? 40 : 80, numero(n.h, forma ? 80 : 200)),
        titulo: texto(n.titulo),
        desc: texto(n.desc),
        alt: Math.max(0, numero(n.alt, 0)),
        etiqueta: texto(n.etiqueta),
        cor: CORES.includes(n.cor) ? n.cor : "neutral",
        icone: B.temIcone(n.icone) ? n.icone : "",
        forma: forma ? (formas.includes(n.forma) ? n.forma : "retangulo") : "",
        ref: refValida(n.ref)
      };
    });
    const ids = new Set(nos.map(n => n.id));
    const ligacoes = (Array.isArray(bruto.ligacoes) ? bruto.ligacoes : [])
      .filter(l => l && idValido(l.id) && ids.has(l.de) && ids.has(l.para) && l.de !== l.para)
      .map(l => ({
        id: l.id,
        de: l.de,
        para: l.para,
        rotulo: texto(l.rotulo),
        tracejada: !!l.tracejada,
        pontas: PONTAS.includes(l.pontas) ? l.pontas : "fim",
        forma: TRACADOS.includes(l.forma) ? l.forma : "curva"
      }));
    return { nome: texto(bruto.nome).slice(0, 60), nos, ligacoes };
  };

  const serializar = () => JSON.stringify(estado);
  const persistir = () => gravar(CHAVE, { desenho: estado, vista: L.vista });
  const avisar = () => ouvintes.forEach(f => f());

  L.obter = () => estado;
  L.aoMudar = f => ouvintes.push(f);
  L.no = id => estado.nos.find(n => n.id === id);
  L.ligacao = id => estado.ligacoes.find(l => l.id === id);

  L.confirmar = () => {
    const s = serializar();
    if (s === ultimo) return;
    passado.push(ultimo);
    if (passado.length > 100) passado.shift();
    futuro.length = 0;
    ultimo = s;
    persistir();
    avisar();
  };

  L.substituir = novo => {
    estado = novo;
    L.confirmar();
  };

  L.definirNome = nome => {
    estado.nome = texto(nome).trim().slice(0, 60);
    L.confirmar();
  };

  L.desfazer = () => {
    if (!passado.length) return false;
    futuro.push(ultimo);
    ultimo = passado.pop();
    estado = JSON.parse(ultimo);
    persistir();
    avisar();
    return true;
  };

  L.refazer = () => {
    if (!futuro.length) return false;
    passado.push(ultimo);
    ultimo = futuro.pop();
    estado = JSON.parse(ultimo);
    persistir();
    avisar();
    return true;
  };

  L.podeDesfazer = () => passado.length > 0;
  L.podeRefazer = () => futuro.length > 0;
  L.salvarVista = () => persistir();

  L.exportar = () => JSON.stringify({ versao: 2, nome: estado.nome, nos: estado.nos, ligacoes: estado.ligacoes }, null, 2);

  L.importar = txt => {
    let bruto;
    try { bruto = JSON.parse(txt); } catch (e) { return false; }
    const novo = L.normalizar(bruto);
    if (!novo) return false;
    L.substituir(novo);
    return true;
  };

  L.carregarInicial = () => {
    const salvo = ler(CHAVE);
    const doSalvo = salvo ? L.normalizar(salvo.desenho) : null;
    if (doSalvo) {
      estado = doSalvo;
      const v = salvo.vista;
      if (v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)) {
        L.vista = { x: v.x, y: v.y, z: Math.min(2, Math.max(0.2, v.z)) };
        L.temVistaSalva = true;
      }
    } else {
      estado = L.normalizar(B.desenhoInicial) || L.vazio();
    }
    ultimo = serializar();
  };
})(window.Board);
