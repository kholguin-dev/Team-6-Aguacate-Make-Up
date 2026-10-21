
document.addEventListener("DOMContentLoaded", () => {

    // Buscamos los elementos del panel
    const tabla = document.querySelector(".dashboard-container tbody");
    const botonCrear = document.querySelector(".btn-brand");
    const campoBusqueda = document.querySelector(
        '.dashboard-container input[type="text"]'
    );
    const selectorEstado = document.querySelector(
        ".dashboard-container select"
    );
    const botonFiltrar = [...document.querySelectorAll("button")].find(
        boton => boton.textContent.includes("Filtrar")
    );
    const botonesCategoria = document.querySelectorAll(".nav-category-btn");
    const indicadores = document.querySelectorAll(
        ".dashboard-container > section .badge"
    );
    const pie = document.querySelector(".dashboard-container > footer");

    if (!tabla || !campoBusqueda || !selectorEstado) {
        console.error("Faltan elementos del panel de productos.");
        return;
    }

    // CAMBIAR esta ruta cuando tengamos la página de creación
    const URL_CREAR_PRODUCTO = "Admincrearproductos.html";

    // Esta clave debe ser igual en las dos páginas
    const CLAVE_PRODUCTOS = "admincrearproductos";
    const PRODUCTOS_POR_PAGINA = 8;

    let categoriaActual = "Todos";
    let estadoActual = "";
    let paginaActual = 1;

    // Cargamos los productos guardados,  
    function cargarProductos() {
        try {
            const datos = localStorage.getItem(CLAVE_PRODUCTOS);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error("No se pudieron cargar los productos:", error);
            return [];
        }
    }

    let productos = cargarProductos();

    // Guardamos los cambios localStorage 
    function guardarProductos() {
        try {
            localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
            return true;
        } catch (error) {
            console.error("No se pudieron guardar los productos:", error);
            alert("No se pudieron guardar los cambios.");
            return false;
        }
    }

    // Evitamos interpretar los textos como código HTML
    function escapar(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caracter]);
    }

    // Mostramos el precio con dos decimales
    function formatoPrecio(precio) {
        return Number(precio).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " €";
    }

    // Actualizamos los contadores del panel
    function actualizarIndicadores() {
        if (indicadores.length < 4) return;

        indicadores[0].textContent = `${productos.length} productos`;
        indicadores[1].textContent =
            `${productos.filter(p => p.estado === "Publicado").length} publicados`;
        indicadores[2].textContent =
            `${productos.filter(p => p.estado === "Borrador").length} borradores`;
        indicadores[3].textContent =
            `${productos.filter(p => Number(p.stock) <= 10).length} con stock bajo`;
    }

    // Aplicamos la búsqueda y los filtros
    function renderizarProductos() {
        const texto = campoBusqueda.value.trim().toLowerCase();

        const filtrados = productos.filter(producto => {
            const coincideTexto = [
                producto.nombre,
                producto.referencia,
                producto.descripcion
            ].some(valor =>
                String(valor ?? "").toLowerCase().includes(texto)
            );

            const coincideCategoria =
                categoriaActual === "Todos" ||
                producto.categoria === categoriaActual;

            const coincideEstado =
                !estadoActual || producto.estado === estadoActual;

            return coincideTexto && coincideCategoria && coincideEstado;
        });

        const totalPaginas = Math.max(
            1,
            Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA)
        );

        paginaActual = Math.min(paginaActual, totalPaginas);

        const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
        const visibles = filtrados.slice(
            inicio,
            inicio + PRODUCTOS_POR_PAGINA
        );

        // Mostramos los productos en la tabla
        tabla.innerHTML = visibles.map(producto => `
            <tr>
                <td>
                    <div class="fw-bold">${escapar(producto.nombre)}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">
                        ${escapar(producto.referencia)}
                    </div>
                </td>
                <td>${escapar(producto.categoria)}</td>
                <td>${formatoPrecio(producto.precio)}</td>
                <td>${Number(producto.stock)}</td>
                <td>
                    <span class="badge ${
                        producto.estado === "Publicado"
                            ? "badge-published"
                            : "bg-secondary"
                    }">${escapar(producto.estado)}</span>
                    ${Number(producto.stock) <= 10
                        ? '<span class="badge badge-stock-low">Stock bajo</span>'
                        : ""}
                </td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-link btn-sm text-brand"
                            data-accion="ver" data-id="${producto.id}">
                        Ver
                    </button>
                    <button class="btn btn-link btn-sm text-brand"
                            data-accion="editar" data-id="${producto.id}">
                        Editar
                    </button>
                    <button class="btn btn-link btn-sm text-danger"
                            data-accion="eliminar" data-id="${producto.id}">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("");

        // Mostramos un mensaje si no hay resultados
        if (visibles.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No hay productos para mostrar.
                    </td>
                </tr>
            `;
        }

        actualizarIndicadores();

        // Actualizamos la información y los botones de paginación
        if (pie) {
            pie.innerHTML = `
                <span class="text-muted small">
                    ${filtrados.length
                        ? `Mostrando ${inicio + 1}–${Math.min(
                            inicio + PRODUCTOS_POR_PAGINA,
                            filtrados.length
                        )} de ${filtrados.length} productos`
                        : "No hay productos para mostrar"}
                </span>
                <nav aria-label="Paginación">
                    <ul class="pagination pagination-sm m-0 gap-1">
                        <li class="page-item ${paginaActual === 1 ? "disabled" : ""}">
                            <button class="page-link rounded"
                                    data-pagina="${paginaActual - 1}"
                                    ${paginaActual === 1 ? "disabled" : ""}>
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">
                                ${paginaActual} de ${totalPaginas}
                            </span>
                        </li>
                        <li class="page-item ${
                            paginaActual === totalPaginas ? "disabled" : ""
                        }">
                            <button class="page-link rounded"
                                    data-pagina="${paginaActual + 1}"
                                    ${paginaActual === totalPaginas ? "disabled" : ""}>
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            `;
        }
    }

    // Abrimos la página que está creando mi compañero
    if (botonCrear) {
        botonCrear.addEventListener("click", () => {
            window.location.href = URL_CREAR_PRODUCTO;
        });
    }

    // Buscamos mientras escribimos
    campoBusqueda.addEventListener("input", () => {
        paginaActual = 1;
        renderizarProductos();
    });

    // Filtramos por estado
    if (botonFiltrar) {
        botonFiltrar.addEventListener("click", () => {
            const valor = selectorEstado.value;

            estadoActual = valor === "1"
                ? "Publicado"
                : valor === "2"
                    ? "Borrador"
                    : "";

            paginaActual = 1;
            renderizarProductos();
        });
    }

    // Filtramos por categoría
    botonesCategoria.forEach(boton => {
        boton.addEventListener("click", () => {
            categoriaActual = boton.textContent.trim();

            botonesCategoria.forEach(b => b.classList.remove("active"));
            boton.classList.add("active");

            paginaActual = 1;
            renderizarProductos();
        });
    });

    // Atendemos las acciones de cada producto
    tabla.addEventListener("click", evento => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const id = Number(boton.dataset.id);
        const producto = productos.find(p => Number(p.id) === id);

        if (!producto) return;

        // Mostramos la información del producto
        if (boton.dataset.accion === "ver") {
            alert(
                `Producto: ${producto.nombre}\n` +
                `Referencia: ${producto.referencia}\n` +
                `Descripción: ${producto.descripcion || "Sin descripción"}\n` +
                `Categoría: ${producto.categoria}\n` +
                `Precio: ${formatoPrecio(producto.precio)}\n` +
                `Stock: ${producto.stock}\n` +
                `Estado: ${producto.estado}`
            );
        }

        // Dejamos la conexión de edición pendiente
        if (boton.dataset.accion === "editar") {
            alert("Aquí conectaremos el formulario de edición.");
        }

        // Confirmamos antes de eliminar
        if (boton.dataset.accion === "eliminar") {
            if (!confirm(`¿Deseas eliminar "${producto.nombre}"?`)) {
                return;
            }

            const productosAnteriores = productos;
            productos = productos.filter(p => Number(p.id) !== id);

            if (guardarProductos()) {
                renderizarProductos();
            } else {
                productos = productosAnteriores;
            }
        }
    });

    // Cambiamos de página
    if (pie) {
        pie.addEventListener("click", evento => {
            const boton = evento.target.closest("button[data-pagina]");
            if (!boton || boton.disabled) return;

            paginaActual = Number(boton.dataset.pagina);
            renderizarProductos();
        });
    }

    // Mostramos la tabla al entrar
    renderizarProductos();
});
