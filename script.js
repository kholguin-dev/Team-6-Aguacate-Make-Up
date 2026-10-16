

const teamCards = document.querySelectorAll(".team-card");

teamCards.forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
    });
});

(() => {
const seccion = document.getElementById('seccion-universo');
  if (!seccion) return;

  const pista = seccion.querySelector('#universo-pista');
  const carrusel = seccion.querySelector('.universo-carrusel');
  const boton = seccion.querySelector('#universo-siguiente');
  let indice = 0, temporizador;

  function mover() {
    const tarjetas = pista.children;
    if (!tarjetas.length) return;

    const gap = parseFloat(getComputedStyle(pista).gap) || 0;
    const paso = tarjetas[0].getBoundingClientRect().width + gap;
    const visibles = Math.max(1, Math.round((carrusel.clientWidth + gap) / paso));
    const maximo = Math.max(0, tarjetas.length - visibles);

    indice = indice > maximo ? 0 : indice;
    pista.style.transform = `translateX(-${indice * paso}px)`;
  }

  function avanzar() {
    const gap = parseFloat(getComputedStyle(pista).gap) || 0;
    const paso = pista.children[0].getBoundingClientRect().width + gap;
    const visibles = Math.max(1, Math.round((carrusel.clientWidth + gap) / paso));
    const maximo = Math.max(0, pista.children.length - visibles);

    indice = indice >= maximo ? 0 : indice + 1;
    mover();
  }

  function iniciar() {
    clearInterval(temporizador);
    temporizador = setInterval(avanzar, 3000);
  }

  boton.addEventListener('click', () => {
    avanzar();
    iniciar();
  });

  carrusel.addEventListener('mouseenter', () => clearInterval(temporizador));
  carrusel.addEventListener('mouseleave', iniciar);
  window.addEventListener('resize', mover);

  mover();
  iniciar();
})();