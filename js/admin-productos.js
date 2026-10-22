
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

    let categoriaActual = "Todas";
    let estadoActual = "";
    let paginaActual = 1;

    // Datos iniciales de demostración si el almacenamiento está vacío
    const PRODUCTOS_POR_DEFECTO = [
        {
            id: 1,
            nombre: "Sérum Calmante de Aguacate",
            sku: "SK-001",
            categoria: "Skincare",
            subcategoria: "Cara",
            descripcion: "Sérum calmante e hidratante con extracto de aguacate.",
            precio: 24.90,
            stock: 86,
            estado: "Publicado"
        },
        {
            id: 2,
            nombre: "Labial Velvet Matte - Berry",
            sku: "MQ-002",
            categoria: "Maquillaje",
            subcategoria: "Labios",
            descripcion: "Labial mate con fórmula aterciopelada y larga duración.",
            precio: 16.90,
            stock: 54,
            estado: "Publicado"
        },
        {
            id: 3,
            nombre: "Gloss Hidratante Aguacate",
            sku: "MQ-003",
            categoria: "Maquillaje",
            subcategoria: "Labios",
            descripcion: "Brillo nutritivo enriquecido con aceites naturales.",
            precio: 14.50,
            stock: 42,
            estado: "Publicado"
        },
        {
            id: 4,
            nombre: "Base Líquida Acabado Natural",
            sku: "MQ-004",
            categoria: "Maquillaje",
            subcategoria: "Cara",
            descripcion: "Base ultraligera con cobertura modulable y FPS 20.",
            precio: 21.90,
            stock: 8,
            estado: "Publicado"
        },
        {
            id: 5,
            nombre: "Crema Contorno de Ojos",
            sku: "SK-005",
            categoria: "Skincare",
            subcategoria: "Ojos",
            descripcion: "Crema iluminadora y anti-fatiga para el contorno ocular.",
            precio: 28.00,
            stock: 35,
            estado: "Publicado"
        },
        {
            id: 6,
            nombre: "Set de Brochas Profesionales x8",
            sku: "AC-006",
            categoria: "Accesorios",
            subcategoria: "Sin subcategoría",
            descripcion: "Set de brochas profesionales con cerdas ultrasuaves.",
            precio: 35.00,
            stock: 6,
            estado: "Publicado"
        },
        {
            id: 7,
            nombre: "Mascarilla Purificante Arcilla Verde",
            sku: "SK-007",
            categoria: "Skincare",
            subcategoria: "Cara",
            descripcion: "Limpieza profunda y reducción de poros visible.",
            precio: 18.50,
            stock: 24,
            estado: "Borrador"
        },
        {
            id: 8,
            nombre: "Esponja Beauty Blender Ergonómica",
            sku: "AC-008",
            categoria: "Accesorios",
            subcategoria: "Sin subcategoría",
            descripcion: "Esponja libre de látex para difuminado impecable.",
            precio: 9.90,
            stock: 3,
            estado: "Borrador"
        }
    ];

    // Cargamos los productos guardados o sembramos los iniciales
    function cargarProductos() {
        try {
            const datos = localStorage.getItem(CLAVE_PRODUCTOS);
            if (datos) {
                const lista = JSON.parse(datos);
                if (Array.isArray(lista) && lista.length > 0) {
                    return lista;
                }
            }
            localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(PRODUCTOS_POR_DEFECTO));
            return PRODUCTOS_POR_DEFECTO;
        } catch (error) {
            console.error("No se pudieron cargar los productos:", error);
            return PRODUCTOS_POR_DEFECTO;
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
        }) + " $";
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
                        ${escapar(producto.sku || producto.referencia || "SKU-" + producto.id)}
                    </div>
                </td>
                <td>
                    ${escapar(producto.categoria || "")}${
                        producto.subcategoria && producto.subcategoria !== "Sin subcategoría"
                            ? " · " + escapar(producto.subcategoria)
                            : ""
                    }
                </td>
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

    if (botonFiltrar) {
        botonFiltrar.addEventListener("click", aplicarFiltroEstado);
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

        // La acción "ver" no realiza ninguna acción
        if (boton.dataset.accion === "ver") {
            evento.preventDefault();
            return;
        }

        // Abrimos la página del formulario para editar
        if (boton.dataset.accion === "editar") {
           window.location.href = "Admincrearproductos.html";
        }

        // Confirmamos antes de eliminar
        if (boton.dataset.accion === "eliminar") {
            if (!confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
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
