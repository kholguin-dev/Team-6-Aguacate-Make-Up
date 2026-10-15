/* Carga dinamica y resolucion de rutas para Header */

function obtenerRutaBase() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/");
    if (rutaActual.includes("/vistas/")) {
        return "../";
    }
    return "";
}

function obtenerPaginaActiva() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/");
    if (rutaActual.includes("about-us")) {
        return "nosotros";
    }
    if (rutaActual.includes("catalogo")) {
        return "catalogo";
    }
    if (rutaActual.includes("contacto")) {
        return "contacto";
    }
    return "inicio";
}

function ajustarRutasHeader(contenedor) {
    const rutaBase = obtenerRutaBase();
    const paginaActiva = obtenerPaginaActiva();

    const imagenLogo = contenedor.querySelector("#imagenLogoHeader");
    if (imagenLogo) {
        imagenLogo.src = rutaBase + "src/image/logo.png";
    }

    const enlaceLogo = contenedor.querySelector("#enlaceLogoHeader");
    if (enlaceLogo) {
        enlaceLogo.href = rutaBase + "index.html";
    }

    const enlacesNavegacion = contenedor.querySelectorAll(".enlace-navegacion");
    enlacesNavegacion.forEach(function (enlace) {
        const pagina = enlace.getAttribute("data-pagina");

        if (pagina === "inicio") {
            enlace.href = rutaBase + "index.html";
        } else if (pagina === "nosotros") {
            enlace.href = rutaBase + "vistas/about-us.html";
        } else if (pagina === "catalogo") {
            enlace.href = rutaBase + "vistas/catalogo.html";
        } else if (pagina === "contacto") {
            enlace.href = rutaBase + "vistas/contacto.html";
        }

        if (pagina === paginaActiva) {
            enlace.classList.add("active");
            enlace.setAttribute("aria-current", "page");
        } else {
            enlace.classList.remove("active");
            enlace.removeAttribute("aria-current");
        }
    });
}

function cargarHeader() {
    const contenedor = document.getElementById("encabezado del sitio") || document.querySelector("header");
    if (!contenedor) {
        return;
    }

    const rutaBase = obtenerRutaBase();
    fetch(rutaBase + "componentes/header.html")
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("Respuesta no valida");
            }
            return respuesta.text();
        })
        .then(function (html) {
            contenedor.innerHTML = html;
            ajustarRutasHeader(contenedor);
        })
        .catch(function (error) {
            console.error("Error al cargar Header", error);
        });
}

document.addEventListener("DOMContentLoaded", cargarHeader);
