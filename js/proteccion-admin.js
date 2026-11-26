// Protección para acceso a paginas administrativas:

// Verifica si el usuario tiene autorización para acceder
// a una página exclusiva de administración.
function protegerAccesoAdmin() {

    // 1. Recuperar token Autentication
    const token = localStorage.getItem("tokenJWT");

    // 2. Recuperar info de user
    const datoUsuario = localStorage.getItem("usuarioActivo");

    // 3. DEFINIR LA RUTA BASE DEL PROYECTO
    // Si estamos dentro de /vistas/, debemos retroceder un nivel.
    const rutaActual = window.location.pathname.toLowerCase();

    const rutaBase = rutaActual.includes("/vistas/")
        ? "../"
        : "";

    // 4. Verificar si existe una sesion
    if (!token || !datoUsuario) {

        alert("Debes iniciar sesión para acceder a esta sección.");

        // Redirigir al login
        window.location.href = rutaBase + "vistas/inicio sesion.html";

        return;
    }

    // 5. CONVERTIR LOS DATOS DEL USUARIO A UN OBJETO
    let usuario;

    try {

        usuario = JSON.parse(datoUsuario);

    } catch (error) {

        // Si los datos están corruptos, eliminamos la sesión
        localStorage.removeItem("tokenJWT");
        localStorage.removeItem("usuarioActivo");

        alert("La sesión no es válida. Inicia sesión nuevamente.");

        window.location.href = rutaBase + "vistas/inicio sesion.html";

        return;
    }
    // 6. Obtener y normalizar user
    const rolUsuario = String(usuario.rol || "")
        .trim()
        .toLowerCase();

    // 7. Validar si el user es admin

    if (rolUsuario !== "administrador") {

        alert("No tienes permisos para acceder a esta sección.");

        window.location.href = rutaBase + "index.html";

        return;
    }
    // 8. Si pasa todas las validaciones da acceso
    console.log("Acceso administrativo autorizado.");

}

protegerAccesoAdmin();