// Clave compartida para guardar y consultar productos en localStorage
const Clavealmacenamiento = 'admincrearproductos';
const Claveproductos = 'admincrearproductos';

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

// Disponibilidad global para los scripts
if (typeof window !== 'undefined') {
    Object.assign(window, {
        Clavealmacenamiento,
        Claveproductos,
        Obtenerlistadoproductos,
        Guardarlistadoproductos,
        cargarProductos,
        guardarProductos,
        Imprimirlistadojson
    });
}
