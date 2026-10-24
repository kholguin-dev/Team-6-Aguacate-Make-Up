// Configuracion y comunicacion con Google Apps Script
const Urlservidorappsscript = 'https://script.google.com/macros/s/AKfycbyoqXWgVTjBTynfOvye5DI5Fxv16_WRVR6rFw3nOsOQUhdSPl6eHAdMUO9KsSDX1Ce_EA/exec';

// Normaliza enlaces de Google Drive para evitar bloqueos de navegador (Cross-Origin Resource Policy)
function NormalizarUrlImagen(Url) {
    if (!Url || Url === '../img/logo.png') return '../img/logo.png';
    const Cadena = String(Url).trim();
    if (Cadena.startsWith('data:image')) return Cadena;
    const Coincidencia = Cadena.match(/[?&]id=([a-zA-Z0-9_-]+)/) || Cadena.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return Coincidencia ? 'https://lh3.googleusercontent.com/d/' + Coincidencia[1] : Cadena;
}

// Consulta la lista de todos los productos vigentes
async function Obtenerproductosservidor() {
    try {
        const Respuesta = await fetch(Urlservidorappsscript, { method: 'GET', redirect: 'follow' });
        const Resultado = await Respuesta.json();
        if (Resultado && Array.isArray(Resultado.data)) {
            Resultado.data.forEach(item => {
                if (item.imagenUrl) item.imagenUrl = NormalizarUrlImagen(item.imagenUrl);
            });
        }
        return Resultado;
    } catch (Error) {
        console.error('error al consultar los productos', Error);
        return { status: 'error', message: 'error al consultar los productos', data: [] };
    }
}

// Envia acciones sheets como crear, cambiar estado, actualizar stock o eliminar
async function Enviardatosservidor(Cuerpo) {
    try {
        const Respuesta = await fetch(Urlservidorappsscript, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(Cuerpo),
            redirect: 'follow'
        });
        const Resultado = await Respuesta.json();
        if (Resultado && Resultado.imagenUrl) {
            Resultado.imagenUrl = NormalizarUrlImagen(Resultado.imagenUrl);
        }
        return Resultado;
    } catch (Error) {
        console.error('error al enviar informacion', Error);
        return { status: 'error', message: 'error al enviar informacion' };
    }
}

// Disponibilidad global para los scripts
if (typeof window !== 'undefined') {
    Object.assign(window, {
        Urlservidorappsscript,
        NormalizarUrlImagen,
        Obtenerproductosservidor,
        Enviardatosservidor
    });
}
