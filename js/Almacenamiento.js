// Este archivo se llamaba LocalStorage.js y ahora se llama Almacenamiento.js.
// Este se encarga de todo el funcionamiento de la persistencia de productos en el almacenamiento local del navegador y la normalizacion de rutas de imagenes.
// Lo que se corrigio creando este archivo fue centralizar la lectura, escritura y actualizacion del inventario para que ninguna otra pantalla duplique codigo.


// Clave compartida para guardar y consultar productos en localStorage
const Clavealmacenamiento = 'admincrearproductos';
const Claveproductos = 'admincrearproductos';

// Normaliza enlaces de imágenes (Base64, rutas locales relativas o enlaces de Google Drive)
function NormalizarUrlImagen(Url) {
    const estaEnVistas = typeof window !== 'undefined' &&
        window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/vistas/");
    const prefijo = estaEnVistas ? "../img/" : "img/";
    const logoPorDefecto = prefijo + "logo.png";

    if (!Url) return logoPorDefecto;
    let Cadena = String(Url).trim();
    if (Cadena.startsWith('data:image')) return Cadena;

    // Normaliza nombres de carpetas con tildes o codificación URL hacia img-catalogo
    Cadena = Cadena.replace(/img-cat[%C3%A1|álogo]+/gi, 'img-catalogo');

    // Soporte para enlaces de Google Drive existentes en almacenamiento
    const Coincidencia = Cadena.match(/[?&]id=([a-zA-Z0-9_-]+)/) || Cadena.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (Coincidencia) {
        return 'https://lh3.googleusercontent.com/d/' + Coincidencia[1];
    }

    if (Cadena.startsWith('http://') || Cadena.startsWith('https://')) {
        return Cadena;
    }

    if (Cadena.endsWith('logo.png')) {
        return logoPorDefecto;
    }

    // Limpia prefijos relativos anteriores como ../img/ o ./img/ o /img/ o img/
    const limpia = Cadena.replace(/^(\.\.\/|\.\/|\/)?img\//i, '');
    return prefijo + limpia;
}

// Lee los productos guardados o retorna arreglo vacío
function Obtenerlistadoproductos() {
    try {
        const datos = localStorage.getItem(Clavealmacenamiento);
        const lista = datos ? JSON.parse(datos) : [];
        return Array.isArray(lista) ? lista : [];
    } catch (error) {
        console.error('No se pudo leer la lista de productos:', error);
        return [];
    }
}

// Guarda la lista actualizada de productos en localStorage
function Guardarlistadoproductos(Listadoproductos) {
    try {
        localStorage.setItem(Clavealmacenamiento, JSON.stringify(Listadoproductos || []));
        return true;
    } catch (error) {
        console.error('No se pudo guardar la lista de productos:', error);
        return false;
    }
}

// Alias para compatibilidad con admin-productos
const cargarProductos = Obtenerlistadoproductos;
const guardarProductos = Guardarlistadoproductos;

// Muestra la lista completa en consola en formato JSON
function Imprimirlistadojson() {
    console.log('Lista de productos JSON:\n', JSON.stringify(Obtenerlistadoproductos(), null, 2));
}

// ==========================================
// ACCIONES Y MUTACIONES DE INVENTARIO
// ==========================================

// Guarda o actualiza un producto en el almacenamiento local
function GuardarProductoEnStorage(producto) {
    if (!producto) return false;
    const listado = Obtenerlistadoproductos();
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

    return Guardarlistadoproductos(listado);
}

// Guarda un borrador de producto en el inventario local
function GuardarBorradorInventario(borrador) {
    if (!borrador) return { exito: false, mensaje: 'Sin datos de borrador' };
    GuardarProductoEnStorage(borrador);
    return { exito: true, producto: borrador };
}

// Crea o actualiza un producto en inventario operando 100% con LocalStorage
async function CrearOActualizarProductoInventario(producto, esEdicion) {
    if (!producto) return { exito: false, mensaje: 'Producto inválido' };

    // Persistencia inmediata en LocalStorage
    GuardarProductoEnStorage(producto);
    Imprimirlistadojson();

    return { exito: true, producto };
}

// Elimina un producto por ID o SKU directamente en LocalStorage
async function EliminarProductoInventario(idOSku) {
    if (!idOSku) return { exito: false, mensaje: 'Identificador no provisto' };
    const criterio = String(idOSku).trim().toUpperCase();
    const listado = Obtenerlistadoproductos();

    const productoEncontrado = listado.find(function (p) {
        const pid = String(p.id || '').trim().toUpperCase();
        const psku = String(p.sku || '').trim().toUpperCase();
        return pid === criterio || pid.replace('PROD-', '') === criterio.replace('PROD-', '') || psku === criterio;
    });

    if (!productoEncontrado) return { exito: false, mensaje: 'Producto no encontrado' };

    const listaFiltrada = listado.filter(function (p) {
        const pid = String(p.id || '').trim().toUpperCase();
        const psku = String(p.sku || '').trim().toUpperCase();
        return !(pid === criterio || pid.replace('PROD-', '') === criterio.replace('PROD-', '') || psku === criterio);
    });

    Guardarlistadoproductos(listaFiltrada);
    return { exito: true, productoEliminado: productoEncontrado };
}

// Cambia el estado de publicación de un producto en LocalStorage
async function CambiarEstadoInventario(sku, nuevoEstado) {
    if (!sku || !nuevoEstado) return false;
    const listado = Obtenerlistadoproductos();
    const item = listado.find(p => String(p.sku || '').trim().toUpperCase() === String(sku).trim().toUpperCase());
    if (item) {
        item.estado = nuevoEstado;
        Guardarlistadoproductos(listado);
    }
    return true;
}

// Actualiza la cantidad de stock de un producto en LocalStorage
async function ActualizarStockInventario(sku, nuevoStock) {
    if (!sku || nuevoStock === undefined) return false;
    const listado = Obtenerlistadoproductos();
    const item = listado.find(p => String(p.sku || '').trim().toUpperCase() === String(sku).trim().toUpperCase());
    if (item) {
        item.stock = Number(nuevoStock);
        Guardarlistadoproductos(listado);
    }
    return true;
}

// Disponibilidad global para todos los scripts
if (typeof window !== 'undefined') {
    Object.assign(window, {
        Clavealmacenamiento,
        Claveproductos,
        NormalizarUrlImagen,
        Obtenerlistadoproductos,
        Guardarlistadoproductos,
        cargarProductos,
        guardarProductos,
        Imprimirlistadojson,
        GuardarProductoEnStorage,
        GuardarBorradorInventario,
        CrearOActualizarProductoInventario,
        EliminarProductoInventario,
        CambiarEstadoInventario,
        ActualizarStockInventario
    });
}
