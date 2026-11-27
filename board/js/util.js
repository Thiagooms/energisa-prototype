(function (B) {
  const D = B.dados;
  const LIVRES = D.DECISOES.filter(d => !d.fixa);

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const etapaDe = d => D.ETAPAS.find(e => e.id === d.etapa);
  const decisao = id => D.DECISOES.find(d => d.id === id);
  const opcao = (d, id) => d ? d.opcoes.find(o => o.id === id) : undefined;
  const usam = (d, o) => d.fixa ? Object.keys(D.CANDIDATOS) : Object.keys(D.CANDIDATOS).filter(k => D.CANDIDATOS[k].escolhas[d.id] === o.id);

  const medidas = escolhas => {
    const ops = LIVRES.map(d => opcao(d, escolhas[d.id]));
    const d1 = opcao(decisao("D1"), escolhas.D1);
    const d5 = opcao(decisao("D5"), escolhas.D5);
    let [min, max] = d5.llm;
    if (d1.pedeDecomposicao && !d5.decompoe) { min += 1; max += 1; }
    const pecas = ops.reduce((s, o) => s + (o.pecas || 0), 0);
    const risco = Math.max(...ops.map(o => o.risco || 0));
    return {
      llm: min === max ? String(min) : min + " a " + max,
      pecas: pecas <= 3 ? "poucas" : pecas <= 8 ? "médias" : "muitas",
      pecasNivel: pecas <= 3 ? 1 : pecas <= 8 ? 2 : 3,
      risco: ["baixo", "médio", "alto"][risco],
      riscoNivel: risco + 1,
      refazer: ops.some(o => o.refazComLLM) ? "exige LLM" : "segundos"
    };
  };

  const ler = chave => {
    try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; }
  };
  const gravar = (chave, valor) => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {}
  };

  B.util = { $, $$, esc, LIVRES, etapaDe, decisao, opcao, usam, medidas, ler, gravar };
})(window.Board);
