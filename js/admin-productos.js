
document.addEventListener("DOMContentLoaded", () => {

    // Buscamos los elementos del panel
    const tabla = document.querySelector(".dashboard-container tbody");
    const BotonCrearProducto = document.querySelector(".btn-brand");
    const campoBusqueda = document.querySelector(
        '.dashboard-container input[type="text"]'
    );
    const selectorEstado = document.querySelector("#filtro-estado");

    const botonesCategoria = document.querySelectorAll(".nav-category-btn");
    const indicadores = document.querySelectorAll(
        ".dashboard-container > section .badge"
    );
    const pie = document.querySelector(".dashboard-container > footer");

    if (!tabla || !campoBusqueda || !selectorEstado) {
        console.error("Faltan elementos del panel de productos.");
        return;
    }

    // Ruta de la pagina para crear o registrar un producto
    const Urlcrearproducto = "Admincrearproductos.html";

    // Clave para guardar y consultar en localstorage
    const Claveproductos = "admincrearproductos";
    const Productosporpagina = 8;

    let categoriaActual = "Todas";
    let estadoActual = "";
    let paginaActual = 1;

    // Acceso a almacenamiento local usando la capa centralizada
    const cargarProductos = () => (typeof window.Obtenerlistadoproductos === 'function' ? window.Obtenerlistadoproductos() : JSON.parse(localStorage.getItem(Claveproductos) || '[]'));
    let productos = cargarProductos();

    const guardarProductos = () => {
        if (typeof window.Guardarlistadoproductos === 'function') return window.Guardarlistadoproductos(productos);
        try {
            localStorage.setItem(Claveproductos, JSON.stringify(productos));
            return true;
        } catch (e) {
            console.error("No se pudieron guardar los productos:", e);
            return false;
        }
    };


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

    // Formato de precio en pesos colombianos sin decimales
    function formatoPrecio(precio) {
        return "$ " + Number(precio || 0).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
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
                producto.sku,
                producto.referencia,
                producto.categoria,
                producto.subcategoria,
                producto.descripcion
            ].some(valor =>
                String(valor ?? "").toLowerCase().includes(texto)
            );

            // Comparamos la categoría seleccionada sin enredos de mayúsculas o si trae subcategoría
            const filtroCat = (categoriaActual || "").trim().toLowerCase();
            const prodCat = (producto.categoria || "").trim().toLowerCase();
            const prodSubcat = (producto.subcategoria || "").trim().toLowerCase();

            const coincideCategoria =
                filtroCat === "todas" ||
                filtroCat === "todos" ||
                filtroCat === "" ||
                prodCat === filtroCat ||
                prodCat.startsWith(filtroCat) ||
                prodCat.includes(filtroCat) ||
                prodSubcat.includes(filtroCat);

            const coincideEstado =
                !estadoActual ||
                producto.estado === estadoActual;

            return coincideTexto && coincideCategoria && coincideEstado;
        });

        const totalPaginas = Math.max(
            1,
            Math.ceil(filtrados.length / Productosporpagina)
        );

        paginaActual = Math.min(paginaActual, totalPaginas);

        const inicio = (paginaActual - 1) * Productosporpagina;
        const visibles = filtrados.slice(
            inicio,
            inicio + Productosporpagina
        );

        // Mostramos los productos en la tabla
        tabla.innerHTML = visibles.map(producto => `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${typeof NormalizarUrlImagen === 'function' ? NormalizarUrlImagen(producto.imagen) : (producto.imagen || '../img/logo.png')}" alt="${escapar(producto.nombre)}" class="rounded" style="width: 36px; height: 36px; object-fit: cover; flex-shrink: 0; border: 1px solid #EFE4F8;" onerror="this.src='../img/logo.png'">
                        <div>
                            <div class="fw-bold">${escapar(producto.nombre)}</div>
                            <div class="text-muted" style="font-size: 0.75rem;">
                                ${escapar(producto.sku || producto.referencia || "SKU-" + producto.id)}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    ${escapar(producto.categoria || "")}${producto.subcategoria && producto.subcategoria !== "Sin subcategoría"
                ? " · " + escapar(producto.subcategoria)
                : ""
            }
                </td>
                <td>${formatoPrecio(producto.precio)}</td>
                <td>${Number(producto.stock)}</td>
                <td>
                    <span class="badge ${producto.estado === "Publicado"
                ? "badge-published"
                : "bg-secondary"
            }">${escapar(producto.estado)}</span>
                    ${Number(producto.stock) <= 10
                ? '<span class="badge badge-stock-low">Stock bajo</span>'
                : ""}
                </td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-link btn-sm text-brand"
                            data-accion="ver" data-id="${producto.id}" data-sku="${escapar(producto.sku || '')}">
                        Ver
                    </button>
                    <button class="btn btn-link btn-sm text-brand"
                            data-accion="editar" data-id="${producto.id}" data-sku="${escapar(producto.sku || '')}">
                        Editar
                    </button>
                    <button class="btn btn-link btn-sm text-danger"
                            data-accion="eliminar" data-id="${producto.id}" data-sku="${escapar(producto.sku || '')}">
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
                        inicio + Productosporpagina,
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
                        <li class="page-item ${paginaActual === totalPaginas ? "disabled" : ""
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

    // Redirige al formulario de crear producto
    if (BotonCrearProducto) {
        BotonCrearProducto.addEventListener("click", () => {
            window.location.href = Urlcrearproducto;
        });
    }

    // Buscamos mientras escribimos
    campoBusqueda.addEventListener("input", () => {
        paginaActual = 1;
        renderizarProductos();
    });

    // Filtramos por estado (al cambiar selección o al hacer clic en Filtrar)
    function aplicarFiltroEstado() {
        const valor = selectorEstado.value;

        estadoActual = valor === "1"
            ? "Publicado"
            : valor === "2"
                ? "Borrador"
                : "";

        paginaActual = 1;
        renderizarProductos();
    }

    selectorEstado.addEventListener("change", aplicarFiltroEstado);


    // Filtramos por categoría
    botonesCategoria.forEach(boton => {
        boton.addEventListener("click", () => {
            const categoriaSeleccionada = boton.textContent.trim();

            categoriaActual = categoriaSeleccionada === "Todas"
                ? "Todos"
                : categoriaSeleccionada;

            botonesCategoria.forEach(b => b.classList.remove("active"));
            boton.classList.add("active");

            paginaActual = 1;
            renderizarProductos();
        });
    });

    // Atendemos las acciones de cada producto
    tabla.addEventListener("click", async evento => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const id = String(boton.dataset.id || "").trim();
        const sku = String(boton.dataset.sku || "").trim().toUpperCase();
        const producto = productos.find(p => {
            const pid = String(p.id || "").trim();
            const psku = String(p.sku || "").trim().toUpperCase();
            return (id && (pid === id || pid.replace("PROD-", "") === id.replace("PROD-", ""))) ||
                (sku && psku === sku) ||
                (id && psku === id.toUpperCase());
        });

        if (!producto) return;


        // mostrar la información del producto

        if (boton.dataset.accion === "ver") {
            const modal = document.querySelector("#modalVerProducto");
            const detalle = document.querySelector("#detalleProducto");

            if (!modal || !detalle) {
                alert("No se encontró la ventana del producto.");
                return;
            }

            detalle.innerHTML = `
                <div class="text-center mb-3">
                    <img
                        src="${typeof NormalizarUrlImagen === "function"
                    ? NormalizarUrlImagen(producto.imagen)
                    : (producto.imagen || "../img/logo.png")}"
                        alt="${escapar(producto.nombre)}"
                        class="img-fluid rounded"
                        style="max-height: 180px; object-fit: contain;"
                        onerror="this.src='../img/logo.png'"
                    >
                </div>

                <h5>${escapar(producto.nombre)}</h5>

                <p><strong>Referencia:</strong>
                    ${escapar(producto.sku || producto.referencia || "Sin referencia")}
                </p>

                <p><strong>Categoría:</strong>
                    ${escapar(producto.categoria || "Sin categoría")}
                </p>

                <p><strong>Descripción:</strong>
                    ${escapar(producto.descripcion || "Sin descripción")}
                </p>

                <p><strong>Precio:</strong>
                    ${formatoPrecio(producto.precio)}
                </p>

                <p><strong>Stock:</strong>
                    ${Number(producto.stock) || 0} unidades
                </p>

                <p><strong>Estado:</strong>
                    ${escapar(producto.estado || "Sin estado")}
                </p>
            `;

            bootstrap.Modal.getOrCreateInstance(modal).show();
            return;
        }

        // Abrimos la página del formulario con los datos a editar o continuar borrador
        if (boton.dataset.accion === "editar") {
            window.location.href = Urlcrearproducto + "?id=" + encodeURIComponent(producto.id) + "&sku=" + encodeURIComponent(producto.sku || "");
        }

        // Confirmamos antes de eliminar
        if (boton.dataset.accion === "eliminar") {
            if (!confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
                return;
            }

            if (typeof EliminarProductoInventario === 'function') {
                await EliminarProductoInventario(producto.id || producto.sku);
                productos = cargarProductos();
                renderizarProductos();
            } else {
                const productosAnteriores = productos;
                productos = productos.filter(p => String(p.id) !== id);
                if (guardarProductos()) {
                    renderizarProductos();
                } else {
                    productos = productosAnteriores;
                }
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

    // Mostramos la tabla al entrar con los datos de LocalStorage
    renderizarProductos();
});
