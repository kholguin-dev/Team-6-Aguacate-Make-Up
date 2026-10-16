const teamCards = document.querySelectorAll(".team-card");

teamCards.forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
    });
});

/*Todo esto es del carrusel*/

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