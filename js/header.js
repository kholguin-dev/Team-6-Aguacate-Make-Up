// Gestión modular del encabezado y resolución de rutas dinámicas

// Determina la ruta relativa adecuada según si la página está en la raíz o en vistas
function obtenerRutaBaseHeader() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    if (rutaActual.includes("/vistas/")) {
        return "../";
    }
    return "";
}

// Identifica la sección activa mediante la URL para aplicar el estilo destacado
function obtenerPaginaActiva() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/").toLowerCase();
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
// Esta función puede llamarse desde catalogo.js para reflejar los productos agregados
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

    // Sincroniza la imagen del isotipo central
    const imagenLogo = contenedor.querySelector(".logo-custom-figma img, #imagenLogoHeader");
    if (imagenLogo) {
        imagenLogo.src = rutaBase + "img/Logo transparente · Header · %238339B6.png";
    }

    // Direcciona los enlaces de la barra de navegación hacia sus respectivas páginas
    const enlacesNavegacion = contenedor.querySelectorAll(".links-custom-figma a, .enlace-navegacion");
    enlacesNavegacion.forEach(function (enlace) {
        const ruta = enlace.getAttribute("data-ruta") || enlace.getAttribute("data-pagina");

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

        // Resalta visualmente el enlace de la página en la que se encuentra el usuario
        if (ruta === paginaActiva) {
            enlace.classList.add("active");
            enlace.setAttribute("aria-current", "page");
        } else {
            enlace.classList.remove("active");
            enlace.removeAttribute("aria-current");
        }
    });

    // Permite realizar búsquedas al presionar la tecla Enter en el campo de texto
    const inputBusqueda = contenedor.querySelector(".search-box-figma input");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                const termino = inputBusqueda.value.trim();
                if (termino.length > 0) {
                    window.location.href = rutaBase + "vistas/catalogo.html?buscar=" + encodeURIComponent(termino);
                }
            }
        });
    }

    // Conecta el botón de usuario con el inicio de sesión o muestra el saludo si la sesión está activa
    const enlaceCuenta = contenedor.querySelector("#enlaceCuenta");
    if (enlaceCuenta) {
        let usuarioActivo = null;
        try {
            const datoSesion = localStorage.getItem("usuarioActivo") ||
                               localStorage.getItem("usuarioActual") ||
                               localStorage.getItem("sesionActiva") ||
                               localStorage.getItem("usuarioSesion");
            if (datoSesion) {
                usuarioActivo = JSON.parse(datoSesion);
            }
        } catch (errorSesion) {
            console.warn("No se pudo leer la sesión activa del usuario:", errorSesion);
        }

        if (usuarioActivo && usuarioActivo.nombre) {
            enlaceCuenta.classList.add("cuenta-con-usuario");
            enlaceCuenta.setAttribute("aria-label", "Cuenta de " + usuarioActivo.nombre);
            enlaceCuenta.textContent = 'Hola "' + usuarioActivo.nombre + '"';
            enlaceCuenta.href = "#";
            enlaceCuenta.title = "Dar clic para cerrar sesión";
            enlaceCuenta.addEventListener("click", function (e) {
                e.preventDefault();
                const deseaCerrar = confirm('Hola "' + usuarioActivo.nombre + '", ¿deseas cerrar tu sesión?');
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

    // Maneja el clic en el carrito para abrir el panel lateral del carrito (Drawer)
    const enlaceCarrito = contenedor.querySelector("#enlaceCarrito");
    if (enlaceCarrito) {
        enlaceCarrito.addEventListener("click", function (e) {
            e.preventDefault();
            if (typeof window.openCart === "function") {
                window.openCart();
            } else {
                console.log("Apertura del carrito de compras");
            }
        });
    }

    // Consulta el almacenamiento local para recuperar la cantidad actual de productos
    try {
        const servicio = window.servicioCarrito || window.servicioscarrito;
        if (servicio && typeof servicio.obtenerConteo === "function") {
            actualizarContadorCarrito(servicio.obtenerConteo());
        } else {
            const datoPrimario = localStorage.getItem("aguacate_cart") || localStorage.getItem("carrito de compras") || localStorage.getItem("carrito") || "[]";
            const articulosGuardados = JSON.parse(datoPrimario);
            if (Array.isArray(articulosGuardados)) {
                const total = articulosGuardados.reduce((acc, it) => acc + (Number(it.cantidad || it.quantity) || 1), 0);
                actualizarContadorCarrito(total);
            }
        }
    } catch (error) {
        console.warn("No se pudo leer el carrito del almacenamiento local:", error);
    }
}

// Descarga e inserta el archivo HTML modular del encabezado en el contenedor principal
function cargarHeader() {
    const contenedor = document.getElementById("header") || document.querySelector("header");
    if (!contenedor) {
        return;
    }

    const rutaBase = obtenerRutaBaseHeader();
    fetch(rutaBase + "componentes/header.html")
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("No se pudo obtener la plantilla del encabezado");
            }
            return respuesta.text();
        })
        .then(function (html) {
            contenedor.innerHTML = html;
            ajustarRutasHeader(contenedor);
        })
        .catch(function (error) {
            console.error("Error durante la carga del encabezado:", error);
        });
}

// Ejecuta la inicialización cuando el documento completa su carga estructural
document.addEventListener("DOMContentLoaded", cargarHeader);
