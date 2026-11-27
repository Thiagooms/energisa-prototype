(function (B) {
  const L = B.livre;
  const { $, esc } = B.util;
  const NOMES = { card: "Card", grupo: "Grupo", nota: "Texto", forma: "Forma" };
  const ROTULOS_COR = { amber: "Âmbar", violet: "Violeta", blue: "Azul", green: "Verde", rose: "Rosa", neutral: "Neutro" };
  const FORMAS = [["curva", "Curva"], ["reta", "Reta"], ["cotovelo", "Em cotovelo"]];
  const PONTAS = [["fim", "Uma ponta"], ["ambas", "Duas pontas"], ["nenhuma", "Sem ponta"]];
  const ALINHAR = [["esquerda", "Esquerda"], ["centro", "Centro"], ["direita", "Direita"], ["topo", "Topo"], ["meio", "Meio"], ["base", "Base"]];

  let painel;
  let expandido = false;

  const estreito = () => window.matchMedia("(max-width: 760px)").matches;
  const cores = atual => '<span class="rot">Cor</span><div class="cores" role="group" aria-label="Cor">' +
    L.CORES.map(c => '<button type="button" data-cor="' + c + '" aria-pressed="' + (c === atual) + '" aria-label="' + ROTULOS_COR[c] + '" title="' + ROTULOS_COR[c] + '"></button>').join("") + "</div>";
  const cabecalho = titulo => '<div class="i-cab"><strong>' + esc(titulo) + '</strong><button type="button" class="fechar" data-acao="fechar" aria-label="Fechar propriedades">&times;</button></div>';
  const botao = (acao, texto, extra) => '<button type="button" class="bt' + (extra && extra.perigo ? " perigo" : "") + '" data-acao="' + acao + '"' + (extra && extra.valor ? ' data-valor="' + extra.valor + '"' : "") + (extra && extra.dica ? ' title="' + extra.dica + '"' : "") + ">" + texto + "</button>";
  const escolha = (id, campo, rotulo, opcoes, atual) => '<label for="' + id + '">' + rotulo + '</label><select id="' + id + '" data-campo="' + campo + '">' +
    opcoes.map(([v, r]) => '<option value="' + v + '"' + (v === atual ? " selected" : "") + ">" + r + "</option>").join("") + "</select>";

  const alvos = () => {
    const s = L.palco.selecao();
    return { fio: s.fio ? L.ligacao(s.fio) : null, nos: s.nos.map(L.no).filter(Boolean) };
  };

  const nomeDe = a => {
    if (a.fio) return "Seta" + (a.fio.rotulo ? ": " + a.fio.rotulo : "");
    if (a.nos.length > 1) return a.nos.length + " itens selecionados";
    const n = a.nos[0];
    const texto = n.tipo === "nota" ? n.desc : n.titulo;
    return NOMES[n.tipo] + (texto ? ": " + texto : "");
  };

  const posicionar = () => {
    painel.classList.remove("esquerda", "topo");
    if (painel.hidden) return;
    const area = $("#area").getBoundingClientRect();
    const r = L.palco.retanguloSelecao();
    if (!r) return;
    if (estreito()) {
      if ((r.top + r.bottom) / 2 > area.top + area.height / 2) painel.classList.add("topo");
    } else if ((r.left + r.right) / 2 > area.left + area.width / 2) {
      painel.classList.add("esquerda");
    }
  };

  const desenhar = () => {
    const a = alvos();
    const um = a.nos.length === 1 ? a.nos[0] : null;
    painel.classList.remove("compacto");
    if (!a.fio && !a.nos.length) {
      painel.innerHTML = "";
      painel.hidden = true;
      return;
    }
    if (estreito() && !expandido) {
      painel.classList.add("compacto");
      painel.innerHTML = cabecalho(nomeDe(a)) + '<div class="i-acoes">' +
        botao("editar", a.nos.length > 1 ? "Alinhar" : "Editar") +
        (um && L.temDetalhe(um) ? botao("detalhe", "Detalhes") : "") +
        (a.fio ? botao("inverter", "Inverter") : botao("duplicar", "Duplicar")) +
        botao("excluir", "Excluir", { perigo: true }) + "</div>";
    } else if (a.fio) {
      painel.innerHTML = cabecalho("Seta") +
        '<label for="i-rotulo">Rótulo</label><input type="text" id="i-rotulo" data-campo="rotulo" value="' + esc(a.fio.rotulo) + '" maxlength="40" placeholder="ex.: precedentes">' +
        escolha("i-forma", "forma", "Traçado", FORMAS, a.fio.forma) +
        escolha("i-pontas", "pontas", "Pontas", PONTAS, a.fio.pontas) +
        '<label class="linha-chave" for="i-tracejada"><input type="checkbox" id="i-tracejada" data-campo="tracejada"' + (a.fio.tracejada ? " checked" : "") + "> Tracejada</label>" +
        '<p class="i-dica">Arraste uma das pontas da seta para ligar a outro bloco.</p>' +
        '<div class="i-acoes">' + botao("inverter", "Inverter sentido") + botao("excluir", "Excluir", { perigo: true }) + "</div>";
    } else if (um) {
      let h = cabecalho(NOMES[um.tipo]);
      if (um.tipo === "card" || um.tipo === "grupo") h += '<label for="i-titulo">Título</label><input type="text" id="i-titulo" data-campo="titulo" value="' + esc(um.titulo) + '" maxlength="60">';
      if (um.tipo === "forma") h += '<label for="i-titulo">Texto</label><textarea id="i-titulo" data-campo="titulo" rows="2">' + esc(um.titulo) + "</textarea>";
      if (um.tipo === "card" || um.tipo === "nota") h += '<label for="i-desc">' + (um.tipo === "nota" ? "Texto" : "Descrição") + '</label><textarea id="i-desc" data-campo="desc" rows="3">' + esc(um.desc) + "</textarea>";
      if (um.tipo === "card") h += '<label for="i-etiqueta">Etiqueta</label><input type="text" id="i-etiqueta" data-campo="etiqueta" value="' + esc(um.etiqueta) + '" maxlength="12" placeholder="ex.: v2">' +
        escolha("i-icone", "icone", "Ícone", [["", "Sem ícone"]].concat(B.iconesDeBloco), um.icone);
      if (um.tipo === "forma") h += escolha("i-formato", "forma", "Formato", L.FORMAS.map(f => [f.id, f.nome]), um.forma);
      h += cores(um.cor);
      h += '<p class="i-dica">Arraste os cantos para mudar o tamanho. Dois cliques no bloco editam o texto.</p>';
      h += '<div class="i-acoes">' + (L.temDetalhe(um) ? botao("detalhe", L.rotuloDetalhe(um)) : "") + botao("duplicar", "Duplicar", { dica: "Ctrl+D" }) +
        botao("ordem", "Para frente", { valor: "frente", dica: "]" }) + botao("ordem", "Para trás", { valor: "tras", dica: "[" }) +
        botao("excluir", "Excluir", { perigo: true, dica: "Delete" }) + "</div>";
      painel.innerHTML = h;
    } else {
      painel.innerHTML = cabecalho(a.nos.length + " itens selecionados") +
        '<span class="rot">Alinhar</span><div class="i-grade">' + ALINHAR.map(([v, r]) => botao("alinhar", r, { valor: v })).join("") + "</div>" +
        '<span class="rot">Distribuir</span><div class="i-grade">' + botao("distribuir", "Na horizontal", { valor: "h" }) + botao("distribuir", "Na vertical", { valor: "v" }) + "</div>" +
        cores(null) +
        '<div class="i-acoes">' + botao("agrupar", "Agrupar", { dica: "Ctrl+G" }) + botao("duplicar", "Duplicar", { dica: "Ctrl+D" }) + botao("excluir", "Excluir", { perigo: true, dica: "Delete" }) + "</div>";
    }
    painel.hidden = false;
  };

  const aoDigitar = ev => {
    const campo = ev.target.dataset.campo;
    if (!campo) return;
    const a = alvos();
    if (a.fio) {
      a.fio[campo] = campo === "tracejada" ? ev.target.checked : ev.target.value;
      if (campo === "forma") L.formaPadrao = ev.target.value;
      L.palco.desenharFios();
    } else if (a.nos.length === 1) {
      a.nos[0][campo] = ev.target.value;
      L.palco.render();
    }
  };

  const abrirDetalhe = origem => {
    const a = alvos();
    if (a.nos.length !== 1) return;
    L.abrirDetalhe(a.nos[0], { origem, editavel: true, aoTrocar: () => { L.confirmar(); desenhar(); } });
  };

  const aoClicar = ev => {
    const cor = ev.target.closest(".cores button");
    const a = alvos();
    if (cor) {
      a.nos.forEach(n => { n.cor = cor.dataset.cor; });
      L.confirmar();
      desenhar();
      return;
    }
    const alvo = ev.target.closest("[data-acao]");
    if (!alvo) return;
    const acao = alvo.dataset.acao, valor = alvo.dataset.valor;
    if (acao === "fechar") L.palco.selecionar([]);
    else if (acao === "editar") { expandido = true; desenhar(); posicionar(); }
    else if (acao === "excluir") L.palco.excluirSelecao();
    else if (acao === "duplicar") L.palco.duplicar();
    else if (acao === "ordem") L.palco.ordem(valor);
    else if (acao === "alinhar") L.palco.alinhar(valor);
    else if (acao === "distribuir") L.palco.distribuir(valor);
    else if (acao === "agrupar") { const id = L.palco.agrupar(); if (id) L.edicao.iniciar(id, "titulo"); }
    else if (acao === "detalhe") abrirDetalhe(alvo);
    else if (acao === "inverter" && a.fio) {
      const de = a.fio.de;
      a.fio.de = a.fio.para;
      a.fio.para = de;
      L.confirmar();
    }
  };

  L.inspetor = {
    iniciar: () => {
      painel = $("#inspetor");
      painel.addEventListener("input", aoDigitar);
      painel.addEventListener("change", ev => {
        if (ev.target.dataset.campo) L.confirmar();
      });
      painel.addEventListener("click", aoClicar);
      L.palco.aoSelecionar(() => {
        expandido = false;
        desenhar();
        posicionar();
      });
      L.aoMudar(() => {
        if (painel.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
        desenhar();
        posicionar();
      });
    },
    abrirDetalhe,
    focar: () => {
      if (!expandido && estreito()) { expandido = true; desenhar(); posicionar(); }
      const campo = $("#i-rotulo", painel) || $("#i-titulo", painel) || $("#i-desc", painel);
      if (campo) { campo.focus(); if (campo.select) campo.select(); }
    }
  };
})(window.Board);
