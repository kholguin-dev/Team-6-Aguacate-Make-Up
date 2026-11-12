
// Este archivo conserva su nombre catalogo.js y funciona como el controlador del catalogo de productos.
// Se encarga de mostrar los productos en la tienda, aplicar los filtros de busqueda y categoria y enviar productos al carrito.
// Tambien conecta la busqueda del encabezado con los productos del catalogo.

document.addEventListener("DOMContentLoaded", () => {
    const Claveproductos = "admincrearproductos";
    const contenedorProductos =
        document.querySelector("[data-product-grid]");
    const mensajeVacio =
        document.querySelector("[data-catalog-empty]");
    const contadorResultados =
        document.querySelector("[data-catalog-results]");
    const listaCategorias =
        document.querySelector("[data-category-list]");
    const casillaTodasCategorias =
        document.querySelector("#category-all");
    const entradaPrecioMinimo =
        document.querySelector("#price-min");
    const entradaPrecioMaximo =
        document.querySelector("#price-max");
    const filtroStock =
        document.querySelector("#filter-stock");
    const filtroOfertas =
        document.querySelector("#filter-offers");
    const formularioFiltros =
        document.querySelector("[data-catalog-filters]");
    const selectorOrden =
        document.querySelector("#sort-products");

    // recuperar el termino de busqueda desde la url
    let terminoBusqueda =
        new URLSearchParams(window.location.search).get("buscar") || "";

    // inicializar los productos de ejemplo
    if (typeof window.InicializarProductosSemilla === "function") {
        window.InicializarProductosSemilla();
    }

    // recuperar los productos guardados
    function obtenerProductosGuardados() {
        try {
            const datos = localStorage.getItem(Claveproductos);
            const productos = datos ? JSON.parse(datos) : [];

            return Array.isArray(productos) ? productos : [];
        }
        catch (error) {
            console.error("Error al recuperar los productos:", error);
            return [];
        }
    }

    const productosGuardados = obtenerProductosGuardados();

    console.log("productos recuperados:", productosGuardados);
    console.log("cantidad de productos:", productosGuardados.length);

    // filtrar los productos publicados
    function obtenerProductosPublicados(listaProductos) {
        return listaProductos.filter((producto) => {
            return !producto.estado ||
                String(producto.estado).toLowerCase() === "publicado";
        });
    }

    const productosPublicados =
        obtenerProductosPublicados(productosGuardados);

    // formatear los precios
    function formatearMoneda(valor) {
        if (window.servicioCarrito &&
            typeof window.servicioCarrito.formatearPrecio === "function") {
            return window.servicioCarrito.formatearPrecio(valor);
        }

        return "$ " + Number(valor || 0).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // obtener el precio y nombre de los productos
    function obtenerPrecio(producto) {
        const precioHabitual = Number(producto.precio) || 0;
        const precioPromocional = Number(
            producto.preciopromocional !== undefined
                ? producto.preciopromocional
                : producto.precioPromocional
        ) || 0;

        return precioPromocional > 0 &&
            precioPromocional < precioHabitual
            ? precioPromocional
            : precioHabitual;
    }

    function obtenerNombre(producto) {
        return producto.nombre || "Producto sin nombre";
    }

    // normalizar el texto para comparar sin distinguir tildes o mayusculas
    function normalizarTexto(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // mostrar los productos
    function mostrarProductos(listaProductos) {
        if (!contenedorProductos) {
            return;
        }

        contenedorProductos.innerHTML = "";

        listaProductos.forEach((producto) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-producto";

            // contenedor y marco de imagen
            const contenedorImagen = document.createElement("div");
            contenedorImagen.className = "contenedor-imagen-producto";

            const precioHabitual = Number(producto.precio) || 0;
            const precioPromocional = Number(
                producto.preciopromocional !== undefined
                    ? producto.preciopromocional
                    : producto.precioPromocional
            ) || 0;

            const tieneDescuento =
                precioPromocional > 0 &&
                precioPromocional < precioHabitual;

            if (tieneDescuento) {
                const insigniaOferta = document.createElement("span");
                insigniaOferta.className = "insignia-producto oferta";

                const porcentaje = Math.round(
                    (1 - (precioPromocional / precioHabitual)) * 100
                );

                insigniaOferta.textContent =
                    porcentaje > 0 ? `-${porcentaje}%` : "Oferta";

                contenedorImagen.appendChild(insigniaOferta);

            } else if (producto.novedades) {
                const insigniaNuevo = document.createElement("span");
                insigniaNuevo.className = "insignia-producto nuevo";
                insigniaNuevo.textContent = "Nuevo";

                contenedorImagen.appendChild(insigniaNuevo);
            }

            const imagen = document.createElement("img");
            const urlImagen =
                typeof window.NormalizarUrlImagen === "function"
                    ? window.NormalizarUrlImagen(producto.imagen)
                    : (producto.imagen || "../img/logo.png");

            imagen.src = urlImagen;
            imagen.alt =
                producto.textoAlternativo ||
                producto.textoalternativo ||
                producto.nombre ||
                "Producto de maquillaje";
            imagen.className = "imagen-producto";
            imagen.loading = "lazy";

            imagen.addEventListener("error", () => {
                imagen.src =
                    typeof window.NormalizarUrlImagen === "function"
                        ? window.NormalizarUrlImagen("../img/logo.png")
                        : "../img/logo.png";
            }, { once: true });

            contenedorImagen.appendChild(imagen);

            // cuerpo de informacion
            const cuerpoTarjeta = document.createElement("div");
            cuerpoTarjeta.className = "cuerpo-tarjeta-producto";

            const categoriaSub = document.createElement("span");
            categoriaSub.className = "categoria-producto";

            const textoCat = producto.categoria || "Maquillaje";
            const textoSub = producto.subcategoria
                ? ` · ${producto.subcategoria}`
                : "";

            categoriaSub.textContent =
                (textoCat + textoSub).toUpperCase();

            const nombre = document.createElement("h3");
            nombre.className = "titulo-producto";
            nombre.textContent = obtenerNombre(producto);
            nombre.title = obtenerNombre(producto);

            // pie con precio y boton de agregar
            const pieTarjeta = document.createElement("div");
            pieTarjeta.className = "pie-tarjeta-producto";

            const contenedorPrecio = document.createElement("div");
            contenedorPrecio.className = "contenedor-precio-producto";

            const precioPrincipal = document.createElement("span");
            precioPrincipal.className = "precio-actual";

            if (tieneDescuento) {
                precioPrincipal.textContent =
                    formatearMoneda(precioPromocional);

                const precioAnterior = document.createElement("span");
                precioAnterior.className = "precio-anterior";
                precioAnterior.textContent =
                    formatearMoneda(precioHabitual);

                contenedorPrecio.append(
                    precioPrincipal,
                    precioAnterior
                );

            } else {
                precioPrincipal.textContent =
                    formatearMoneda(precioHabitual);

                contenedorPrecio.appendChild(precioPrincipal);
            }

            const botonCarrito = document.createElement("button");
            botonCarrito.className = "boton-agregar-producto";
            botonCarrito.type = "button";
            botonCarrito.title = "Agregar este producto al carrito";

            const sinStock = Number(producto.stock) <= 0;

            if (sinStock) {
                botonCarrito.disabled = true;
                botonCarrito.classList.add("agotado");
                botonCarrito.innerHTML = "<span>Agotado</span>";
            } else {
                botonCarrito.innerHTML =
                    '<i class="bi bi-cart-plus" aria-hidden="true"></i> <span>Agregar</span>';
            }

            botonCarrito.addEventListener("click", () => {
                const servicio =
                    window.servicioCarrito || window.servicioscarrito;

                if (!servicio) {
                    console.error("No se encontró el servicio del carrito");
                    return;
                }

                if (sinStock) {
                    alert("Este producto no tiene existencias disponibles.");
                    return;
                }

                try {
                    servicio.agregarProducto(producto, 1);

                    if (typeof window.openCart === "function") {
                        window.openCart();
                    }
                }
                catch (error) {
                    console.error("Error al agregar al carrito:", error);
                }
            });

            pieTarjeta.append(contenedorPrecio, botonCarrito);
            cuerpoTarjeta.append(categoriaSub, nombre, pieTarjeta);
            tarjeta.append(contenedorImagen, cuerpoTarjeta);
            contenedorProductos.appendChild(tarjeta);
        });

        if (contadorResultados) {
            contadorResultados.textContent =
                `Mostrando ${listaProductos.length} productos`;
        }

        if (mensajeVacio) {
            mensajeVacio.classList.toggle(
                "d-none",
                listaProductos.length > 0
            );
        }
    }

    // mostrar las categorias disponibles
    function mostrarCategorias() {
        if (!listaCategorias) {
            return;
        }

        listaCategorias.innerHTML = "";

        const categorias = [
            ...new Set(
                productosPublicados
                    .map((producto) => producto.categoria)
                    .filter(Boolean)
            )
        ];

        categorias.forEach((categoria, indice) => {
            const contenedor = document.createElement("div");
            contenedor.className = "form-check";

            const casilla = document.createElement("input");
            casilla.type = "checkbox";
            casilla.className = "form-check-input";
            casilla.name = "categorias";
            casilla.value = categoria;
            casilla.id = `categoria-${indice}`;

            const etiqueta = document.createElement("label");
            etiqueta.className = "form-check-label";
            etiqueta.htmlFor = casilla.id;
            etiqueta.textContent = categoria;

            contenedor.append(casilla, etiqueta);
            listaCategorias.appendChild(contenedor);
        });
    }

    // aplicar los filtros del catalogo
    function aplicarFiltros() {
        let productosFiltrados = [...productosPublicados];

        // filtrar por texto de busqueda
        if (terminoBusqueda !== "") {
            const termino = normalizarTexto(terminoBusqueda);

            productosFiltrados = productosFiltrados.filter((producto) => {
                const informacionProducto = [
                    producto.nombre,
                    producto.categoria,
                    producto.subcategoria,
                    producto.marca,
                    producto.sku,
                    producto.descripcion
                ]
                    .filter(Boolean)
                    .join(" ");

                return normalizarTexto(informacionProducto).includes(termino);
            });
        }

        // filtrar por categoria
        const categoriasSeleccionadas = [
            ...document.querySelectorAll(
                '[data-category-list] input[name="categorias"]:checked'
            )
        ].map((casilla) => casilla.value);

        if (
            casillaTodasCategorias &&
            !casillaTodasCategorias.checked &&
            categoriasSeleccionadas.length > 0
        ) {
            productosFiltrados = productosFiltrados.filter((producto) => {
                return categoriasSeleccionadas.includes(
                    producto.categoria
                );
            });
        }

        // filtrar por precio
        const precioMinimo =
            entradaPrecioMinimo && entradaPrecioMinimo.value !== ""
                ? Number(entradaPrecioMinimo.value)
                : null;

        const precioMaximo =
            entradaPrecioMaximo && entradaPrecioMaximo.value !== ""
                ? Number(entradaPrecioMaximo.value)
                : null;

        productosFiltrados = productosFiltrados.filter((producto) => {
            const precio = obtenerPrecio(producto);

            if (precioMinimo !== null && precio < precioMinimo) {
                return false;
            }

            if (precioMaximo !== null && precio > precioMaximo) {
                return false;
            }

            return true;
        });

        // filtrar por disponibilidad
        if (filtroStock && filtroStock.checked) {
            productosFiltrados = productosFiltrados.filter((producto) => {
                return Number(producto.stock) > 0;
            });
        }

        // filtrar por ofertas
        if (filtroOfertas && filtroOfertas.checked) {
            productosFiltrados = productosFiltrados.filter((producto) => {
                const precioHabitual = Number(producto.precio) || 0;
                const precioPromocional = Number(
                    producto.preciopromocional !== undefined
                        ? producto.preciopromocional
                        : producto.precioPromocional
                ) || 0;

                return precioPromocional > 0 &&
                    precioPromocional < precioHabitual;
            });
        }

        // ordenar los productos
        const orden = selectorOrden
            ? selectorOrden.value
            : "recommended";

        switch (orden) {
            case "price-asc":
                productosFiltrados.sort((a, b) => {
                    return obtenerPrecio(a) - obtenerPrecio(b);
                });
                break;

            case "price-desc":
                productosFiltrados.sort((a, b) => {
                    return obtenerPrecio(b) - obtenerPrecio(a);
                });
                break;

            case "name-asc":
                productosFiltrados.sort((a, b) => {
                    return obtenerNombre(a).localeCompare(
                        obtenerNombre(b),
                        "es"
                    );
                });
                break;

            case "name-desc":
                productosFiltrados.sort((a, b) => {
                    return obtenerNombre(b).localeCompare(
                        obtenerNombre(a),
                        "es"
                    );
                });
                break;

            default:
                productosFiltrados.sort((a, b) => {
                    return Number(Boolean(b.destacado)) -
                        Number(Boolean(a.destacado));
                });
        }

        mostrarProductos(productosFiltrados);
    }

    // conectar los filtros
    if (formularioFiltros) {
        formularioFiltros.addEventListener("submit", (evento) => {
            evento.preventDefault();
            aplicarFiltros();
        });

        formularioFiltros.addEventListener("reset", () => {
            setTimeout(() => {
                if (casillaTodasCategorias) {
                    casillaTodasCategorias.checked = true;
                }

                aplicarFiltros();
            }, 0);
        });
    }

    if (listaCategorias) {
        listaCategorias.addEventListener("change", () => {
            if (casillaTodasCategorias) {
                casillaTodasCategorias.checked = false;
            }

            aplicarFiltros();
        });
    }

    if (casillaTodasCategorias) {
        casillaTodasCategorias.addEventListener("change", () => {
            if (casillaTodasCategorias.checked && listaCategorias) {
                listaCategorias
                    .querySelectorAll('input[name="categorias"]')
                    .forEach((casilla) => {
                        casilla.checked = false;
                    });
            }

            aplicarFiltros();
        });
    }

    if (filtroStock) {
        filtroStock.addEventListener("change", aplicarFiltros);
    }

    if (filtroOfertas) {
        filtroOfertas.addEventListener("change", aplicarFiltros);
    }

    if (selectorOrden) {
        selectorOrden.addEventListener("change", aplicarFiltros);
    }

    // recibir la busqueda en tiempo real desde el header
    document.addEventListener("filtrarCatalogo", (evento) => {
        terminoBusqueda = evento.detail || "";
        aplicarFiltros();
    });

    // iniciar el catalogo
    mostrarCategorias();
    aplicarFiltros();

});
