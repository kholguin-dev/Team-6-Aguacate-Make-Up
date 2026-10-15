function guardarEnAlmacenamiento(clave, valor) {
    const textoJson = JSON.stringify(valor);
    localStorage.setItem(clave, textoJson);
}

function obtenerDeAlmacenamiento(clave) {
    const datosRecuperados = localStorage.getItem(clave);
    if (datosRecuperados) {
        return JSON.parse(datosRecuperados);
    }
    return null;
}

function eliminarDeAlmacenamiento(clave) {
    localStorage.removeItem(clave);
}
