
// Gestión modular del encabezado y resolución de rutas dinámicas

// Determina la ruta relativa adecuada según si la página está en la raíz o en vistas
function obtenerRutaBaseHeader() {
    const rutaActual = window.location.pathname
        .replace(/\\/g, "/")
        .toLowerCase();

    if (rutaActual.includes("/vistas/")) {
        return "../";
    }

    return "";
}

// Identifica la sección activa mediante la URL para aplicar el estilo destacado
function obtenerPaginaActiva() {
    const rutaActual = window.location.pathname
        .replace(/\\/g, "/")
        .toLowerCase();

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

// Actualiza el número flotante sobre el icono del carrito de compras
function actualizarContadorCarrito(cantidad) {
    const contador = document.getElementById("contadorCarrito");

    if (contador) {
        contador.textContent = cantidad;
    }
}

// Expone la función de actualización globalmente
window.actualizarContadorCarrito = actualizarContadorCarrito;

// Configura los enlaces, imágenes y eventos interactivos del encabezado
function ajustarRutasHeader(contenedor) {
    const rutaBase = obtenerRutaBaseHeader();
    const paginaActiva = obtenerPaginaActiva();

    // SINCRONIZAR LA IMAGEN DEL LOGO
    const imagenLogo = contenedor.querySelector(
        ".logo-custom-figma img, #imagenLogoHeader"
    );

    if (imagenLogo) {
        imagenLogo.src = rutaBase +
            "img/Logo transparente · Header · %238339B6.png";
    }

    // CONFIGURAR LOS ENLACES DE NAVEGACIÓN
    const enlacesNavegacion = contenedor.querySelectorAll(
        ".links-custom-figma a, .enlace-navegacion"
    );

    enlacesNavegacion.forEach(function (enlace) {
        const ruta = enlace.getAttribute("data-ruta") ||
            enlace.getAttribute("data-pagina");

        if (ruta === "inicio") {
            enlace.href = rutaBase + "index.html";

        } else if (ruta === "catalogo") {
            enlace.href = rutaBase + "vistas/catalogo.html";

        } else if (ruta === "novedades" || ruta === "ofertas") {
            enlace.href = rutaBase + "index.html#novedades";

        } else if (ruta === "nosotros") {
            enlace.href = rutaBase + "vistas/about-us.html";

        } else if (ruta === "contacto") {
            enlace.href = rutaBase + "vistas/contacto.html";
        }

        // Resaltar visualmente la página activa
        if (ruta === paginaActiva) {
            enlace.classList.add("active");
            enlace.setAttribute("aria-current", "page");
        } else {
            enlace.classList.remove("active");
            enlace.removeAttribute("aria-current");
        }
    });

    // ==========================================
    // BUSCADOR DEL HEADER
    // ==========================================

    const inputBusqueda = contenedor.querySelector(
        "#inputBusquedaHeader"
    );

    if (inputBusqueda) {

        // Recuperar el término de búsqueda desde la URL
        const parametrosURL = new URLSearchParams(
            window.location.search
        );

        const busquedaInicial = parametrosURL.get("buscar");

        if (busquedaInicial) {
            inputBusqueda.value = busquedaInicial;
        }

        // Detectar cada cambio que realiza el cliente al escribir
        inputBusqueda.addEventListener("input", function () {

            const termino = inputBusqueda.value.trim();

            // Comprobar si estamos en la página del catálogo
            const estamosEnCatalogo = window.location.pathname
                .toLowerCase()
                .includes("catalogo.html");

            if (estamosEnCatalogo) {

                // Enviar el término de búsqueda al controlador del catálogo
                document.dispatchEvent(
                    new CustomEvent("filtrarCatalogo", {
                        detail: termino
                    })
                );

            }

        });

        // Buscar en el catálogo al presionar Enter desde otra página
        inputBusqueda.addEventListener("keydown", function (evento) {

            if (evento.key === "Enter") {

                evento.preventDefault();

                const termino = inputBusqueda.value.trim();

                const estamosEnCatalogo = window.location.pathname
                    .toLowerCase()
                    .includes("catalogo.html");

                // Si estamos en otra página, navegar al catálogo
                if (termino.length > 0 && !estamosEnCatalogo) {

                    window.location.href =
                        rutaBase +
                        "vistas/catalogo.html?buscar=" +
                        encodeURIComponent(termino);

                }

            }

        });

    }

    // ==========================================
    // ACCESO A LA CUENTA DEL USUARIO
    // ==========================================

    const enlaceCuenta = contenedor.querySelector("#enlaceCuenta");

    if (enlaceCuenta) {

        let usuarioActivo = null;

        try {
            const datoSesion =
                localStorage.getItem("usuarioActivo") ||
                localStorage.getItem("usuarioActual") ||
                localStorage.getItem("sesionActiva") ||
                localStorage.getItem("usuarioSesion");

            if (datoSesion) {
                usuarioActivo = JSON.parse(datoSesion);
            }

        } catch (errorSesion) {
            console.warn(
                "No se pudo leer la sesión activa del usuario:",
                errorSesion
            );
        }

        if (usuarioActivo && usuarioActivo.nombre) {

            enlaceCuenta.classList.add("cuenta-con-usuario");

            enlaceCuenta.setAttribute(
                "aria-label",
                "Cuenta de " + usuarioActivo.nombre
            );

            enlaceCuenta.textContent =
                'Hola "' + usuarioActivo.nombre + '"';

            enlaceCuenta.href = "#";
            enlaceCuenta.title = "Dar clic para cerrar sesión";

            enlaceCuenta.addEventListener("click", function (evento) {

                evento.preventDefault();

                const deseaCerrar = confirm(
                    'Hola "' + usuarioActivo.nombre +
                    '", ¿deseas cerrar tu sesión?'
                );

                if (deseaCerrar) {

                    localStorage.removeItem("usuarioActivo");
                    localStorage.removeItem("usuarioActual");
                    localStorage.removeItem("sesionActiva");
                    localStorage.removeItem("usuarioSesion");

                    window.location.reload();
                }

            });

        } else {

            enlaceCuenta.classList.remove("cuenta-con-usuario");
            enlaceCuenta.href = rutaBase + "vistas/inicio sesion.html";

        }

    }

    // ==========================================
    // CARRITO DE COMPRAS
    // ==========================================

    const enlaceCarrito = contenedor.querySelector("#enlaceCarrito");

    if (enlaceCarrito) {

        enlaceCarrito.addEventListener("click", function (evento) {

            evento.preventDefault();

            if (typeof window.openCart === "function") {

                window.openCart();

            } else {

                console.log("Apertura del carrito de compras");

            }

        });

    }

    // RECUPERAR LA CANTIDAD DE PRODUCTOS DEL CARRITO
    try {

        const servicio =
            window.servicioCarrito || window.servicioscarrito;

        if (
            servicio &&
            typeof servicio.obtenerConteo === "function"
        ) {

            actualizarContadorCarrito(
                servicio.obtenerConteo()
            );

        } else {

            const datoPrimario =
                localStorage.getItem("aguacate_cart") ||
                localStorage.getItem("carrito de compras") ||
                localStorage.getItem("carrito") ||
                "[]";

            const articulosGuardados = JSON.parse(datoPrimario);

            if (Array.isArray(articulosGuardados)) {

                const total = articulosGuardados.reduce(
                    (acc, it) => {
                        return acc +
                            (Number(it.cantidad || it.quantity) || 1);
                    },
                    0
                );

                actualizarContadorCarrito(total);

            }

        }

    } catch (error) {

        console.warn(
            "No se pudo leer el carrito del almacenamiento local:",
            error
        );

    }

}

// ==========================================
// CARGAR EL HEADER MODULAR
// ==========================================

function cargarHeader() {

    const contenedor =
        document.getElementById("header") ||
        document.querySelector("header");

    if (!contenedor) {
        return;
    }

    const rutaBase = obtenerRutaBaseHeader();

    fetch(rutaBase + "componentes/header.html")

        .then(function (respuesta) {

            if (!respuesta.ok) {
                throw new Error(
                    "No se pudo obtener la plantilla del encabezado"
                );
            }

            return respuesta.text();

        })

        .then(function (html) {

            contenedor.innerHTML = html;

            ajustarRutasHeader(contenedor);

        })

        .catch(function (error) {

            console.error(
                "Error durante la carga del encabezado:",
                error
            );

        });

}

// Ejecutar cuando el documento complete su carga estructural
document.addEventListener("DOMContentLoaded", cargarHeader);
