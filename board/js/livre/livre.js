(function (B) {
  const L = B.livre;
  const { $, esc } = B.util;
  const P = L.palco;
  const AJUDA = [
    ["Ferramentas", [["V"], ["H"], ["C"], ["T"], ["N"], ["R"], ["O"], ["D"], ["L"], ["G"], ["B"]], "Selecionar, Mover a tela, Card, Texto, Nota adesiva, Retângulo, Elipse, Decisão, Seta, Grupo e Biblioteca. Depois de criar um bloco, a ferramenta volta para Selecionar. Esc também volta."],
    ["Mover a tela", [["Espaço", "arrastar"], ["botão do meio"], ["rolagem"]], "Segure Espaço e arraste, em qualquer ferramenta. A ferramenta Mover a tela (H) faz o mesmo sem segurar tecla."],
    ["Zoom", [["Ctrl", "rolagem"], ["+"], ["-"]], "Ctrl+0 volta a 100%. Shift+1 mostra tudo. Shift+2 enquadra a seleção. No celular, pinça com dois dedos."],
    ["Selecionar", [["clique"], ["Shift", "clique"], ["Ctrl", "A"]], "Arraste no fundo para laçar vários blocos. Esc limpa a seleção."],
    ["Criar bloco", [["2 cliques no fundo"], ["Tab"]], "Com uma ferramenta de criar, clique para colocar ou arraste para definir o tamanho. Tab cria um bloco já ligado ao selecionado."],
    ["Editar texto", [["2 cliques"], ["Enter"], ["F2"]], "Enter confirma, Shift+Enter quebra linha, Tab passa do título para a descrição, Esc cancela."],
    ["Mover bloco", [["arrastar"], ["setas"]], "Shift trava no eixo. Ctrl desliga o encaixe. Alt + arrastar duplica. Shift + setas anda mais."],
    ["Mudar tamanho", [["cantos"]], "Selecione um item e arraste um dos quatro cantos."],
    ["Ligar blocos", [["L"], ["pontos da borda"]], "Com a Seta, arraste de um bloco a outro. Em Selecionar, puxe um ponto da borda. Solto no vazio, cria um bloco novo já ligado."],
    ["Religar seta", [["arrastar a seta"]], "Arraste a seta, ou uma das pontas, e solte em outro bloco. Dois cliques editam o rótulo."],
    ["Copiar e colar", [["Ctrl", "C"], ["Ctrl", "V"], ["Ctrl", "X"], ["Ctrl", "D"]], "Cola onde o mouse está. Ctrl+D duplica ao lado."],
    ["Agrupar e ordenar", [["Ctrl", "G"], ["]"], ["["]], "Ctrl+G cria um grupo em volta da seleção. ] traz para frente, [ manda para trás."],
    ["Desfazer", [["Ctrl", "Z"], ["Ctrl", "Shift", "Z"]], "Esc cancela um arrasto em andamento."],
    ["Apagar", [["Delete"]], "Apagar um grupo mantém os blocos de dentro."],
    ["Menu", [["botão direito"]], "Mostra as ações disponíveis para o bloco, a seta ou o fundo."]
  ];

  let raiz, paleta;
  let jaMostrou = false;
  let vistaAntes = null;
  let entrouTelaCheia = false;
  let relogioAviso = null;
  let ajustePendente = false;

  const estreito = () => window.matchMedia("(max-width: 760px)").matches;
  const apresentando = () => raiz.classList.contains("apresentando");

  L.avisar = (texto, duracao) => {
    const el = $("#l-aviso");
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(relogioAviso);
    relogioAviso = setTimeout(() => { el.hidden = true; }, duracao || 2800);
  };

  L.paletaAberta = () => !paleta.hidden;

  L.definirPaleta = aberta => {
    paleta.hidden = !aberta;
    L.ferramentas.marcarBiblioteca(aberta);
    if (aberta) {
      L.ferramentas.fecharFormas();
      if (!estreito()) L.paleta.focarBusca();
    }
  };

  L.fecharPaletaSeEstreito = () => {
    if (!estreito() || paleta.hidden) return false;
    L.definirPaleta(false);
    return true;
  };

  const atualizarEstado = () => {
    const e = L.obter();
    $("#l-vazio").hidden = e.nos.length > 0;
    const nome = $("#l-nome");
    if (document.activeElement !== nome) nome.value = e.nome;
  };

  const carregar = (novo, texto) => {
    if (!novo) return;
    const tinha = L.obter().nos.length > 0;
    L.substituir(novo);
    P.selecionar([]);
    requestAnimationFrame(P.enquadrarLegivel);
    L.avisar(texto + (tinha ? " Desfazer traz o anterior de volta." : ""), 3600);
  };

  const modelos = origem => {
    const grupos = [];
    L.modelos.forEach(m => { if (!grupos.includes(m.grupo)) grupos.push(m.grupo); });
    const cartao = (id, nome, desc) => '<button type="button" class="outra modelo" data-modelo="' + id + '"><span class="n">' + esc(nome) + '</span><span class="d">' + esc(desc) + "</span></button>";
    let h = '<div class="m-topo"><div><h2 id="m-nome">Modelos</h2><p>Um modelo substitui o desenho atual. Desfazer traz o anterior de volta.</p></div><button type="button" class="fechar" aria-label="Fechar">&times;</button></div>' +
      '<div class="bloco"><span class="rotulo">Começar do zero</span><div class="outras">' + cartao("vazio", "Board vazio", "Sem nenhum bloco.") +
      (L.normalizar(B.desenhoInicial) ? cartao("repo", "Desenho do repositório", "O que está guardado em js/desenho-inicial.js.") : "") + "</div></div>";
    grupos.forEach(g => {
      h += '<div class="bloco"><span class="rotulo">' + esc(g) + '</span><div class="outras">' + L.modelos.filter(m => m.grupo === g).map(m => cartao(m.id, m.nome, m.desc)).join("") + "</div></div>";
    });
    B.dialogo.abrir(h, {
      origem,
      aoClicar: ev => {
        const b = ev.target.closest("[data-modelo]");
        if (!b) return;
        const id = b.dataset.modelo;
        B.dialogo.fechar();
        if (id === "vazio") carregar(L.vazio(), "Board esvaziado.");
        else if (id === "repo") carregar(L.normalizar(B.desenhoInicial), "Desenho do repositório carregado.");
        else {
          const m = L.modelos.find(v => v.id === id);
          if (m) carregar(m.criar(), "Modelo carregado: " + m.nome + ".");
        }
      }
    });
  };

  const exportar = origem => {
    B.dialogo.abrir(
      '<div class="m-topo"><div><h2 id="m-nome">Exportar desenho</h2><p>Copie o texto e guarde num arquivo. Colado em js/desenho-inicial.js, ele passa a abrir por padrão para quem ainda não tem desenho salvo.</p></div><button type="button" class="fechar" aria-label="Fechar">&times;</button></div>' +
      '<textarea class="campo" id="d-json" readonly aria-label="Desenho em JSON">' + esc(L.exportar()) + "</textarea>" +
      '<div class="acoes"><button type="button" class="usar" data-acao="copiar">Copiar</button><span id="d-estado" role="status"></span></div>',
      {
        origem,
        aoClicar: (ev, m) => {
          if (!ev.target.closest('[data-acao="copiar"]')) return;
          const campo = $("#d-json", m), estado = $("#d-estado", m);
          const manual = () => { campo.focus(); campo.select(); estado.textContent = "Texto selecionado. Use Ctrl+C para copiar."; };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(campo.value).then(() => { estado.textContent = "Copiado."; }, manual);
          } else {
            manual();
          }
        }
      }
    );
  };

  const importar = origem => {
    const m = B.dialogo.abrir(
      '<div class="m-topo"><div><h2 id="m-nome">Importar desenho</h2><p>Cole o texto exportado ou escolha o arquivo. O desenho atual é substituído, e Desfazer traz ele de volta.</p></div><button type="button" class="fechar" aria-label="Fechar">&times;</button></div>' +
      '<textarea class="campo" id="d-json" placeholder="Cole aqui o JSON exportado" aria-label="JSON do desenho"></textarea>' +
      '<div class="acoes"><button type="button" class="usar" data-acao="carregar">Carregar no board</button>' +
      '<label class="arquivo" for="d-arquivo">ou escolha um arquivo <input type="file" id="d-arquivo" accept=".json,application/json"></label><span id="d-estado" role="status"></span></div>',
      {
        origem,
        foco: "#d-json",
        aoClicar: (ev, modal) => {
          if (!ev.target.closest('[data-acao="carregar"]')) return;
          if (L.importar($("#d-json", modal).value)) {
            B.dialogo.fechar();
            P.selecionar([]);
            requestAnimationFrame(P.enquadrarLegivel);
            L.avisar("Desenho carregado.");
          } else {
            $("#d-estado", modal).textContent = "Não consegui ler esse texto. Confira se é o JSON exportado por este board.";
          }
        }
      }
    );
    $("#d-arquivo", m).addEventListener("change", ev => {
      const arquivo = ev.target.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => { $("#d-json", m).value = String(leitor.result); };
      leitor.readAsText(arquivo);
    });
  };

  const ajuda = origem => {
    B.dialogo.abrir(
      '<div class="m-topo"><div><h2 id="m-nome">Atalhos e gestos</h2><p>Os mesmos de ferramentas como Miro, Figma e Photoshop.</p></div><button type="button" class="fechar" aria-label="Fechar">&times;</button></div>' +
      '<dl class="ajuda">' + AJUDA.map(([o, teclas, como]) => "<dt>" + esc(o) + "</dt><dd>" +
        '<span class="teclas">' + teclas.map(combo => "<span>" + combo.map(k => "<kbd>" + esc(k) + "</kbd>").join("+") + "</span>").join("") + "</span>" +
        esc(como) + "</dd>").join("") + "</dl>",
      { origem }
    );
  };

  const opcoes = botao => {
    if (L.menu.recemFechado()) return;
    const r = botao.getBoundingClientRect();
    const it = (rotulo, acao, extra) => Object.assign({ rotulo, atalho: "", acao }, extra);
    L.menu.abrirEm([
      it("Modelos", () => modelos(botao)),
      it("Exportar desenho", () => exportar(botao)),
      it("Importar desenho", () => importar(botao)),
      "sep",
      it("Encaixar na grade", () => { P.definirGrade(!P.comGrade()); L.avisar(P.comGrade() ? "Encaixe na grade ligado." : "Encaixe na grade desligado.", 1800); }, { marcado: P.comGrade() }),
      it("Atalhos e gestos", () => ajuda(botao), { atalho: "?" }),
      "sep",
      it("Mapa dos candidatos (Energisa)", () => B.irPara("mapa")),
      "sep",
      it("Esvaziar o board", () => carregar(L.vazio(), "Board esvaziado."), { perigo: true, desativado: !L.obter().nos.length })
    ], r.left, r.bottom + 6);
  };

  const apresentar = ligar => {
    if (ligar === apresentando()) return;
    if (ligar) {
      vistaAntes = { ...L.vista };
      L.edicao.concluir();
      L.menu.fechar();
      L.ferramentas.fecharFormas();
      L.gestos.definirFerramenta("selecionar");
      P.selecionar([]);
      P.travar(true);
      raiz.classList.add("apresentando");
      $("#l-sair").hidden = false;
      entrouTelaCheia = false;
      const pedido = document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : null;
      if (pedido && pedido.then) pedido.then(() => { entrouTelaCheia = true; }, () => {});
      setTimeout(P.ajustar, 60);
      L.avisar(L.obter().nos.some(L.temDetalhe) ? "Clique num card de catálogo para ver os detalhes. Esc sai." : "Arraste para mover a tela. Esc sai da apresentação.", 4500);
    } else {
      raiz.classList.remove("apresentando");
      $("#l-sair").hidden = true;
      P.travar(false);
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (vistaAntes) { L.vista = vistaAntes; vistaAntes = null; }
      setTimeout(() => { P.aplicarVista(); L.salvarVista(); }, 60);
    }
  };

  const tentarAjuste = () => {
    if (!ajustePendente || $("#moldura").clientWidth < 50) return;
    ajustePendente = false;
    P.render();
    P.enquadrarLegivel();
  };

  L.iniciar = () => {
    raiz = $("#vista-livre");
    paleta = $("#paleta");
    L.carregarInicial();
    P.iniciar();
    L.gestos.iniciar();
    L.menu.iniciar();
    L.teclado.iniciar();
    L.ferramentas.iniciar();
    L.paleta.iniciar();
    L.inspetor.iniciar();
    L.abrirAjuda = () => ajuda($("#z-ajuda"));
    L.aoMudar(() => { P.render(); atualizarEstado(); });
    P.aoVista(v => { $("#z-zoom").textContent = Math.round(v.z * 100) + "%"; });
    $("#l-opcoes").innerHTML = B.icone("opcoes");
    $("#z-ajustar").innerHTML = B.icone("ajustar");
    atualizarEstado();

    $("#l-modelos").addEventListener("click", ev => modelos(ev.currentTarget));
    $("#l-opcoes").addEventListener("click", ev => opcoes(ev.currentTarget));
    $("#l-apresentar").addEventListener("click", () => apresentar(true));
    $("#z-menos").addEventListener("click", () => P.zoom(1 / 1.2));
    $("#z-mais").addEventListener("click", () => P.zoom(1.2));
    $("#z-zoom").addEventListener("click", P.zoom100);
    $("#z-ajustar").addEventListener("click", P.ajustar);
    $("#z-ajuda").addEventListener("click", ev => ajuda(ev.currentTarget));

    const nome = $("#l-nome");
    nome.addEventListener("change", () => L.definirNome(nome.value));
    nome.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === "Escape") {
        if (ev.key === "Escape") nome.value = L.obter().nome;
        ev.preventDefault();
        ev.stopPropagation();
        $("#moldura").focus({ preventScroll: true });
      }
    });

    $("#l-vazio").addEventListener("click", ev => {
      const b = ev.target.closest("[data-vazio]");
      if (!b) return;
      if (b.dataset.vazio === "modelos") modelos(b);
      else L.definirPaleta(true);
    });
    $("#l-sair").addEventListener("click", () => apresentar(false));
    document.addEventListener("keydown", ev => {
      if (ev.key === "Escape" && apresentando() && !B.dialogo.aberto()) apresentar(false);
    });
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && entrouTelaCheia) apresentar(false);
    });
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (apresentando()) P.ajustar();
        else tentarAjuste();
      }).observe($("#moldura"));
    }
  };

  L.aoMostrar = () => {
    requestAnimationFrame(() => {
      P.render();
      if (!jaMostrou && !L.temVistaSalva) { ajustePendente = true; tentarAjuste(); }
      else P.aplicarVista();
      jaMostrou = true;
    });
  };
})(window.Board);
