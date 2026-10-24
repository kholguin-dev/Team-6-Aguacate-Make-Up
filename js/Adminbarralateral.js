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

// Plantilla directa de respaldo para evitar que quede vacia cuando se abre localmente sin servidor
const Plantillabarralateral = `
<aside class="barra-lateral" id="barraLateral">
    <div class="bloque-marca">
        <span class="nombre-marca">Aguacate Make Up</span>
        <span class="subtitulo-marca">PANEL DE ADMINISTRACIÓN</span>
    </div>

    <!-- Opciones de navegación del panel -->
    <nav class="navegacion-lateral" aria-label="Navegación del panel">
        <a href="#" class="enlace-lateral" data-seccion="dashboard">
            <span class="material-symbols-outlined icono-nav">dashboard</span>
            <span>Dashboard</span>
        </a>
        <a href="admin-productos.html" class="enlace-lateral" data-seccion="productos" id="enlaceSidebarProductos">
            <span class="material-symbols-outlined icono-nav">inventory_2</span>
            <span>Productos</span>
        </a>
        <a href="#" class="enlace-lateral" data-seccion="categorias">
            <span class="material-symbols-outlined icono-nav">category</span>
            <span>Categorías</span>
        </a>
        <a href="#" class="enlace-lateral" data-seccion="usuarios">
            <span class="material-symbols-outlined icono-nav">group</span>
            <span>Usuarios</span>
        </a>
    </nav>

    <!-- Tarjeta informativa del rol actual -->
    <div class="tarjeta-rol">
        <span class="rol-titulo">Administrador</span>
        <span class="rol-descripcion">Crear, consultar, editar y eliminar registros.</span>
    </div>

    <!-- Enlaces de salida y vista previa -->
    <div class="acciones-sesion">
        <a href="#" class="enlace-tienda" id="enlaceVerTienda" onclick="event.preventDefault(); return false;">↗ Ver tienda</a>
        <a href="../index.html" class="enlace-salida" id="enlaceCerrarSesion">Cerrar sesión</a>
    </div>
</aside>
`;

// Descarga e inserta la plantilla de la barra lateral en la página con respaldo inmediato
function cargarBarraLateralAdmin() {
    const contenedor = document.getElementById("adminBarraLateral") || document.getElementById("barraLateral");
    if (!contenedor) {
        return;
    }

    function aplicarHtml(html) {
        contenedor.innerHTML = html;
        ajustarEnlacesBarra(contenedor);
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
            aplicarHtml(html);
        })
        .catch(function () {
            // Si fetch no esta disponible (por ejemplo abriendo via file://), usa la plantilla integrada
            aplicarHtml(Plantillabarralateral);
        });
}

// Arranca apenas el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarBarraLateralAdmin);
