(function (B) {
  const ICONES = {
    cursor: '<path d="M5 3l14 7-6.2 2.2L10.5 19z"/>',
    mao: '<path d="M8 12V5.5a1.5 1.5 0 013 0V11m0-6.5v-1a1.5 1.5 0 013 0V11m0-5.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1a6 6 0 01-4.9-2.5L4.3 14.6a1.5 1.5 0 012.3-1.9L8 14"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h7M7 14h10"/>',
    texto: '<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',
    adesivo: '<path d="M4 4h16v10l-6 6H4z"/><path d="M20 14h-6v6"/>',
    formas: '<rect x="3" y="3" width="10" height="10" rx="1.5"/><circle cx="15.5" cy="15.5" r="5.5"/>',
    ligacao: '<path d="M5 19L19 5"/><path d="M10 5h9v9"/>',
    grupo: '<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/>',
    biblioteca: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>',
    desfazer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    refazer: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
    opcoes: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>',
    ajustar: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    navegador: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    celular: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    api: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    balanceador: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v10M12 12H5v5M12 12h7v5"/>',
    rede: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    servidor: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    funcao: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    banco: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    cache: '<path d="M20 12a8 8 0 11-3-6.2"/><path d="M20 4v5h-5"/><path d="M12 8v4l2.5 1.5"/>',
    arquivos: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
    busca: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
    fila: '<rect x="3" y="8" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="8" rx="1"/><rect x="17" y="8" width="4" height="8" rx="1"/>',
    eventos: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h10M7 11l10-5M7 13l10 5"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    ia: '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    documento: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    grafico: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
    nuvem: '<path d="M7 18a4 4 0 01-.6-7.96A6 6 0 0118 9.5a4.2 4.2 0 01-.5 8.5z"/>'
  };

  const DE_BLOCO = [
    ["usuario", "Pessoa"], ["navegador", "Navegador"], ["celular", "Celular"], ["externo", "Sistema externo"],
    ["api", "API"], ["balanceador", "Balanceador"], ["rede", "Rede"], ["cadeado", "Cadeado"],
    ["servidor", "Servidor"], ["funcao", "Função"], ["engrenagem", "Engrenagem"], ["relogio", "Relógio"],
    ["banco", "Banco de dados"], ["cache", "Cache"], ["arquivos", "Arquivos"], ["busca", "Busca"],
    ["fila", "Fila"], ["eventos", "Eventos"], ["email", "Mensagem"], ["ia", "IA"],
    ["documento", "Documento"], ["grafico", "Gráfico"], ["nuvem", "Nuvem"]
  ];

  B.icone = (nome, classe) => ICONES[nome]
    ? '<svg class="ic' + (classe ? " " + classe : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONES[nome] + "</svg>"
    : "";
  B.temIcone = nome => typeof nome === "string" && Object.prototype.hasOwnProperty.call(ICONES, nome);
  B.iconesDeBloco = DE_BLOCO;
})(window.Board);
