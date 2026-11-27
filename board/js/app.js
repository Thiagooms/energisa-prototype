(function (B) {
  const { $ } = B.util;
  const VISTAS = ["livre", "mapa"];

  const daHash = () => {
    const pedida = location.hash.replace("#", "");
    return VISTAS.includes(pedida) ? pedida : "livre";
  };

  const mostrar = vista => {
    VISTAS.forEach(k => { $("#vista-" + k).hidden = k !== vista; });
    document.body.dataset.vista = vista;
    if (vista === "livre") B.livre.aoMostrar();
    else B.mapa.aoMostrar();
  };

  B.irPara = vista => {
    mostrar(vista);
    try { history.replaceState(null, "", "#" + vista); } catch (e) {}
  };

  B.mapa.iniciar();
  B.livre.iniciar();
  document.addEventListener("click", ev => {
    const a = ev.target.closest("a[data-vista]");
    if (!a) return;
    ev.preventDefault();
    B.irPara(a.dataset.vista);
  });
  window.addEventListener("hashchange", () => mostrar(daHash()));
  mostrar(daHash());
})(window.Board);
