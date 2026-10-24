// Gestión modular del pie de página y sincronización de rutas relativas

// Determina la ruta relativa adecuada según el nivel de directorio actual
function obtenerRutaBaseFooter() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    if (rutaActual.includes("/vistas/")) {
        return "../";
    }
    return "";
}

// Actualiza los hipervínculos y rutas de imágenes para mantener la coherencia de navegación
function ajustarRutasFooter(contenedor) {
    const rutaBase = obtenerRutaBaseFooter();

    // Sincroniza la ruta del isotipo institucional
    const imagenLogo = contenedor.querySelector("#imagenLogoFooter");
    if (imagenLogo) {
        imagenLogo.src = rutaBase + "img/Logo transparente · Footer · %23310055.png";
    }

    // Vincula el título de marca con la página inicial
    const enlacesLogo = contenedor.querySelectorAll(".footer-marca-titulo-link");
    enlacesLogo.forEach(function (enlace) {
        enlace.href = rutaBase + "index.html";
    });

    // Configura cada enlace del pie de página hacia su correspondiente sección o vista
    const enlaces = contenedor.querySelectorAll("[data-ruta]");
    enlaces.forEach(function (enlace) {
        const destino = enlace.getAttribute("data-ruta");
        if (destino === "inicio") {
            enlace.href = rutaBase + "index.html";
        } else if (destino === "catalogo") {
            enlace.href = rutaBase + "vistas/catalogo.html";
        } else if (destino === "nosotros") {
            enlace.href = rutaBase + "vistas/about-us.html";
        } else if (destino === "contacto") {
            enlace.href = rutaBase + "vistas/contacto.html";
        } else if (destino === "novedades") {
            enlace.href = rutaBase + "index.html#novedades";
        }
    });
}

// Descarga e inserta dinámicamente la plantilla del pie de página
function cargarFooter() {
    const contenedor = document.getElementById("footer") || document.querySelector("footer");
    if (!contenedor) {
        return;
    }

    const rutaBase = obtenerRutaBaseFooter();
    fetch(rutaBase + "componentes/footer.html")
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("No se pudo obtener la plantilla del pie de página");
            }
            return respuesta.text();
        })
        .then(function (html) {
            contenedor.innerHTML = html;
            ajustarRutasFooter(contenedor);
        })
        .catch(function (error) {
            console.error("Error durante la carga del pie de página:", error);
        });
}

// Inicia el montaje del componente una vez que la estructura DOM se encuentra lista
document.addEventListener("DOMContentLoaded", cargarFooter);

