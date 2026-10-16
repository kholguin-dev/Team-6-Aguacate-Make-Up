/* Carga dinamica y resolucion de rutas para footer */

function ajustarRutasFooter(contenedor) {
    const rutaBase = window.location.pathname.includes("/vistas/") ? "../" : "";
    const imagenLogo = contenedor.querySelector("#imagenLogoFooter");
    if (imagenLogo) {
        imagenLogo.src = rutaBase + "/img/logo.png";
    }
}

function cargarFooter() {
    const contenedor = document.getElementById("footer") || document.querySelector("footer");
    if (!contenedor) {
        return;
    }

    const rutaBase = window.location.pathname.includes("/vistas/") ? "../" : "";
    fetch(rutaBase + "componentes/footer.html")
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("Respuesta no valida");
            }
            return respuesta.text();
        })
        .then(function (html) {
            contenedor.innerHTML = html;
            ajustarRutasFooter(contenedor);
        })
        .catch(function (error) {
            console.error("Error al cargar footer", error);
        });
}

document.addEventListener("DOMContentLoaded", cargarFooter);
