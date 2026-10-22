// Control y montaje dinámico de la barra lateral administrativa

// Averiguamos la ruta base para no perder los archivos según la carpeta
function obtenerRutaBaseAdminBarra() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    if (rutaActual.includes("/vistas/")) {
        return "../";
    }
    return "";
}

// Dejamos activos los botones según la pantalla que esté abierta
function ajustarEnlacesBarra(contenedor) {
    const rutaActual = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    const enlaces = contenedor.querySelectorAll(".enlace-lateral");

    enlaces.forEach(function (enlace) {
        enlace.classList.remove("activo");
        const seccion = enlace.getAttribute("data-seccion");

        // Si estamos en la lista o en crear producto, marcamos productos
        if (seccion === "productos" && (rutaActual.includes("admin-productos") || rutaActual.includes("admincrearproductos"))) {
            enlace.classList.add("activo");
        }
    });

    // Ver tienda no hace nada por el momento
    const enlaceTienda = contenedor.querySelector("#enlaceVerTienda");
    if (enlaceTienda) {
        enlaceTienda.addEventListener("click", function (evento) {
            evento.preventDefault();
        });
    }

    // Salir del panel y volver directo a la tienda
    const enlaceSalida = contenedor.querySelector("#enlaceCerrarSesion");
    if (enlaceSalida) {
        enlaceSalida.addEventListener("click", function (evento) {
            evento.preventDefault();
            const rutaBase = obtenerRutaBaseAdminBarra();
            window.location.href = rutaBase + "index.html";
        });
    }
}

// Descarga e inserta la plantilla de la barra lateral en la página
function cargarBarraLateralAdmin() {
    const contenedor = document.getElementById("adminBarraLateral") || document.getElementById("barraLateral");
    if (!contenedor) {
        return;
    }

    const rutaBase = obtenerRutaBaseAdminBarra();
    fetch(rutaBase + "componentes/Adminbarralateral.html")
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("No se pudo cargar la barra lateral administrativa");
            }
            return respuesta.text();
        })
        .then(function (html) {
            contenedor.innerHTML = html;
            ajustarEnlacesBarra(contenedor);
        })
        .catch(function (error) {
            console.error("Hubo un fallo cargando la barra lateral:", error);
        });
}

// Arranca apenas el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarBarraLateralAdmin);
