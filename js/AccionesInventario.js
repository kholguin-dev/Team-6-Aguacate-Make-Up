// Capa de acciones y mutaciones de inventario (LocalStorage + sheets)

// Guarda o actualiza un producto en el almacenamiento local
function GuardarProductoEnStorage(producto) {
    if (!producto) return false;
    const listado = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];
    const idBuscado = String(producto.id || '').trim();
    const skuBuscado = String(producto.sku || '').trim().toUpperCase();

    const indice = listado.findIndex(function (p) {
        const pid = String(p.id || '').trim();
        const psku = String(p.sku || '').trim().toUpperCase();
        return (idBuscado && (pid === idBuscado || pid.replace('PROD-', '') === idBuscado.replace('PROD-', ''))) ||
            (skuBuscado && psku === skuBuscado);
    });

    if (indice >= 0) {
        listado[indice] = Object.assign({}, listado[indice], producto);
    } else {
        listado.push(producto);
    }

    if (typeof Guardarlistadoproductos === 'function') {
        Guardarlistadoproductos(listado);
    }
    return true;
}

// Guarda un borrador de producto en el inventario local
function GuardarBorradorInventario(borrador) {
    if (!borrador) return { exito: false, mensaje: 'Sin datos de borrador' };
    GuardarProductoEnStorage(borrador);
    return { exito: true, producto: borrador };
}

// Crea o actualiza un producto en inventario coordinando LocalStorage y servidor remoto
async function CrearOActualizarProductoInventario(producto, esEdicion) {
    if (!producto) return { exito: false, mensaje: 'Producto inválido' };

    // 1. Persistencia inmediata en LocalStorage
    GuardarProductoEnStorage(producto);

    if (typeof Imprimirlistadojson === 'function') {
        Imprimirlistadojson();
    }

    // 2. Sincronización con el servidor remoto (Google Sheets / Drive)
    if (typeof Enviardatosservidor === 'function') {
        try {
            const datosSincronizar = {
                sku: producto.sku,
                nombre: producto.nombre,
                marca: producto.marca,
                categoria: producto.categoria,
                subcategoria: producto.subcategoria,
                descripcion: producto.descripcion,
                precio: producto.precio,
                precioPromocional: producto.preciopromocional,
                stock: producto.stock,
                tamano: producto.tamano,
                disponibilidad: producto.disponibilidad,
                beneficios: producto.beneficios,
                modoUso: producto.modouso,
                ingredientes: producto.ingredientes,
                precauciones: producto.precauciones,
                imagenBase64: producto.imagen,
                imagenUrl: '',
                textoAlternativo: producto.textoalternativo,
                estado: producto.estado,
                destacado: producto.destacado,
                novedades: producto.novedades
            };

            const respuesta = await Enviardatosservidor({
                accion: esEdicion ? 'ACTUALIZAR' : 'CREAR',
                sku: producto.sku,
                producto: datosSincronizar
            });

            // Si Google Drive subió la imagen y devolvió enlace, actualizar copia local
            if (respuesta && respuesta.status === 'success' && respuesta.imagenUrl) {
                producto.imagen = respuesta.imagenUrl;
                GuardarProductoEnStorage(producto);
            }

            return { exito: true, producto, respuestaServidor: respuesta };
        } catch (error) {
            console.error('Error al sincronizar producto con el servidor:', error);
            return { exito: true, producto, advertenciaServidor: error };
        }
    }

    return { exito: true, producto };
}

// Elimina un producto por ID o SKU tanto localmente como en el servidor
async function EliminarProductoInventario(idOSku) {
    if (!idOSku) return { exito: false, mensaje: 'Identificador no provisto' };
    const criterio = String(idOSku).trim().toUpperCase();
    const listado = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];

    const productoEncontrado = listado.find(function (p) {
        const pid = String(p.id || '').trim().toUpperCase();
        const psku = String(p.sku || '').trim().toUpperCase();
        return pid === criterio || pid.replace('PROD-', '') === criterio.replace('PROD-', '') || psku === criterio;
    });

    if (!productoEncontrado) return { exito: false, mensaje: 'Producto no encontrado' };

    // Filtrar de la lista local
    const listaFiltrada = listado.filter(function (p) {
        const pid = String(p.id || '').trim().toUpperCase();
        const psku = String(p.sku || '').trim().toUpperCase();
        return !(pid === criterio || pid.replace('PROD-', '') === criterio.replace('PROD-', '') || psku === criterio);
    });

    if (typeof Guardarlistadoproductos === 'function') {
        Guardarlistadoproductos(listaFiltrada);
    }

    // Notificar eliminación lógica al servidor
    if (typeof Enviardatosservidor === 'function' && productoEncontrado.sku) {
        try {
            await Enviardatosservidor({
                accion: 'ELIMINAR',
                sku: productoEncontrado.sku
            });
        } catch (error) {
            console.warn('No se pudo notificar la eliminación al servidor:', error);
        }
    }

    return { exito: true, productoEliminado: productoEncontrado };
}

// Cambia el estado de publicación de un producto
async function CambiarEstadoInventario(sku, nuevoEstado) {
    if (!sku || !nuevoEstado) return false;
    const listado = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];
    const item = listado.find(p => String(p.sku || '').trim().toUpperCase() === String(sku).trim().toUpperCase());
    if (item) {
        item.estado = nuevoEstado;
        if (typeof Guardarlistadoproductos === 'function') Guardarlistadoproductos(listado);
    }

    if (typeof Enviardatosservidor === 'function') {
        try {
            await Enviardatosservidor({ accion: 'CAMBIAR_ESTADO', sku, nuevoEstado });
        } catch (error) {
            console.warn('Error al cambiar estado en servidor:', error);
        }
    }
    return true;
}

// Actualiza la cantidad de stock de un producto
async function ActualizarStockInventario(sku, nuevoStock) {
    if (!sku || nuevoStock === undefined) return false;
    const listado = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];
    const item = listado.find(p => String(p.sku || '').trim().toUpperCase() === String(sku).trim().toUpperCase());
    if (item) {
        item.stock = Number(nuevoStock);
        if (typeof Guardarlistadoproductos === 'function') Guardarlistadoproductos(listado);
    }

    if (typeof Enviardatosservidor === 'function') {
        try {
            await Enviardatosservidor({ accion: 'ACTUALIZAR_STOCK', sku, nuevoStock });
        } catch (error) {
            console.warn('Error al actualizar stock en servidor:', error);
        }
    }
    return true;
}

// Disponibilidad global para los scripts
if (typeof window !== 'undefined') {
    Object.assign(window, {
        GuardarProductoEnStorage,
        GuardarBorradorInventario,
        CrearOActualizarProductoInventario,
        EliminarProductoInventario,
        CambiarEstadoInventario,
        ActualizarStockInventario
    });
}
