// Seccion necesaria para que se actualce en el Header, adjunto las lineas de validacion para implementar el Hola"Usuario"

function registrarSesionYRedirigir(usuario) {
    // 1. Guarda la sesión activa en el almacenamiento local para que el encabezado muestre el saludo con el nombre
    localStorage.setItem("usuarioActivo", JSON.stringify({
        nombre: usuario && usuario.nombre ? usuario.nombre : "Usuario"
    }));

    // 2. Redirige al catálogo de productos tras el inicio de sesión exitoso
    window.location.href = "catalogo.html";
}
