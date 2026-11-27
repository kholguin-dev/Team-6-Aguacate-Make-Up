// El catálogo utiliza este servicio para obtener los productos publicados - conexion conel back

const API_BASE_URL = "http://localhost:8080/api";

const ProductosAPI = {

    // Consultar productos publicados en el backend
    async obtenerProductosPublicados() {

        const respuesta = await fetch(
            `${API_BASE_URL}/productos/publicados`
        );

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status} al consultar productos`
            );
        }

        const datos = await respuesta.json();

        // El backend debe devolver una lista
        if (!Array.isArray(datos)) {
            throw new Error(
                "La respuesta de productos no tiene el formato esperado."
            );
        }

        // Convertimos el formato Java al formato que utiliza el frontend
        const productosNormalizados = datos.map(
            ProductosAPI.normalizarProducto
        );

        // Si la API no devuelve las imágenes dentro del producto,
        // consultamos el endpoint específico de imágenes.
        const productosConImagenes = await Promise.all(
            productosNormalizados.map(async (producto) => {

                if (producto.imagen) {
                    return producto;
                }

                try {
                    const imagenes = await ProductosAPI.obtenerImagenes(
                        producto.id
                    );

                    const imagenPrincipal = imagenes.find(
                        imagen => imagen.esPrincipal === true
                    ) || imagenes[0];

                    if (imagenPrincipal) {
                        producto.imagen = imagenPrincipal.url;
                        producto.textoAlternativo =
                            imagenPrincipal.textoAlternativo ||
                            producto.nombre;
                    }

                } catch (error) {
                    console.warn(
                        `No se pudieron cargar las imágenes del producto ${producto.id}`,
                        error
                    );
                }

                return producto;
            })
        );

        return productosConImagenes;
    },


    // Consultar las imágenes de un producto específico
    async obtenerImagenes(idProducto) {

        const respuesta = await fetch(
            `${API_BASE_URL}/productos/${idProducto}/imagenes`
        );

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status} al consultar imágenes`
            );
        }

        const datos = await respuesta.json();

        // La respuesta puede ser una lista o un objeto contenedor
        const listaImagenes = Array.isArray(datos)
            ? datos
            : (datos.imagenes || datos.imagenesProducto || []);

        return listaImagenes.map(imagen => ({
            id: imagen.idImagen ?? imagen.id,
            url: imagen.url,
            textoAlternativo:
                imagen.textoAlternativo ||
                imagen.textoalternativo ||
                "",
            esPrincipal:
                imagen.esPrincipal ??
                imagen.principal ??
                false,
            orden: imagen.orden ?? 1
        }));
    },


    // Adaptar la estructura de la Entity Java al formato frontend
    normalizarProducto(producto) {

        const subcategoria = producto.subcategoria || {};

        const categoria = subcategoria.categoria ||
            producto.categoria ||
            {};

        // Detectar imágenes si vienen incluidas en la respuesta
        const listaImagenes =
            producto.imagenesProducto ||
            producto.imagenes ||
            producto.imagenes_producto ||
            [];

        let imagenPrincipal = null;

        if (Array.isArray(listaImagenes)) {

            imagenPrincipal = listaImagenes.find(
                imagen => imagen.esPrincipal === true
            ) || listaImagenes[0] || null;
        }

        return {

            // Identificación
            id: producto.idProducto ?? producto.id,
            codigoProducto:
                producto.codigoProducto ??
                producto.codigo_producto ??
                "",

            sku: producto.sku || "",

            // Información comercial
            nombre: producto.nombre || "Producto sin nombre",
            marca: producto.marca || "Aguacate Make Up",
            descripcion: producto.descripcion || "",

            // Categoría
            categoria:
                typeof categoria === "string"
                    ? categoria
                    : categoria.nombre || "",

            subcategoria:
                typeof subcategoria === "string"
                    ? subcategoria
                    : subcategoria.nombre || "",

            // Precio
            precio:
                Number(
                    producto.precioBase ??
                    producto.precio ??
                    0
                ),

            precioPromocional:
                producto.precioPromocional !== null &&
                producto.precioPromocional !== undefined
                    ? Number(producto.precioPromocional)
                    : null,

            // Inventario
            stock: Number(producto.stock || 0),
            tamano: producto.tamano || "",

            // Estado
            estado: producto.estado || "",
            activo: producto.activo ?? true,
            destacado: Boolean(producto.destacado),
            novedades: Boolean(producto.novedades),

            // Imagen
            imagen:
                imagenPrincipal?.url ||
                producto.urlImagen ||
                producto.imagen ||
                "",

            textoAlternativo:
                imagenPrincipal?.textoAlternativo ||
                producto.textoAlternativo ||
                producto.textoalternativo ||
                producto.nombre ||
                "Producto de maquillaje"
        };
    }
};


// Hacemos disponible el servicio para otros archivos JavaScript
window.ProductosAPI = ProductosAPI;