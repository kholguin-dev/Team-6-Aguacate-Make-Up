const teamCards = document.querySelectorAll(".team-card");

teamCards.forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
    });
});

/*Todo esto es del carrusel1 */

const imagenes = document.querySelectorAll(".imagen-carrusel");
const indicadores = document.querySelectorAll(".indicador");

const botonAnterior = document.getElementById("imagen-anterior");
const botonSiguiente = document.getElementById("imagen-siguiente");

let indiceActual = 0;

function mostrarImagen(indice) {
    imagenes[indiceActual].classList.remove("activa");
    indicadores[indiceActual].classList.remove("activa");
    indicadores[indiceActual].removeAttribute("aria-current");

    indiceActual = indice;

    imagenes[indiceActual].classList.add("activa");
    indicadores[indiceActual].classList.add("activa");
    indicadores[indiceActual].setAttribute("aria-current", "true");
}

if (imagenes.length > 0 && indicadores.length === imagenes.length &&
    botonAnterior && botonSiguiente) {

    botonSiguiente.addEventListener("click", () => {
        let siguiente = indiceActual + 1;

        if (siguiente >= imagenes.length) {
            siguiente = 0;
        }

        mostrarImagen(siguiente);
    });

    botonAnterior.addEventListener("click", () => {
        let anterior = indiceActual - 1;

        if (anterior < 0) {
            anterior = imagenes.length - 1;
        }

        mostrarImagen(anterior);
    });

    indicadores.forEach((indicador, indice) => {
        indicador.addEventListener("click", () => {
            mostrarImagen(indice);
        });
    });
}
/* aqui termina el carrusel*/

/* CARRUSEL 2 STEF */
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

