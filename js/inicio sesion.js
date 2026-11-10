
// Guardar la sesión y redirigir al usuario
function registrarSesionYRedirigir(usuario) {
    localStorage.setItem("usuarioActivo", JSON.stringify({
        nombre: usuario.nombre || "Usuario"
    }));

    // Redirigir a la página principal
    window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-inicio-sesion");
    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");
    const mensaje = document.getElementById("mensaje-inicio-sesion");

    // Verificar que existan los elementos del formulario
    if (!formulario || !correo || !contrasena || !mensaje) {
        console.error("No se encontraron los campos del formulario de inicio de sesión.");
        return;
    }

    // Mostrar mensajes en el formulario
    function mostrarMensaje(tipo, texto) {
        const alerta = document.createElement("div");
        alerta.className = `alert alert-${tipo}`;
        alerta.textContent = texto;
        mensaje.replaceChildren(alerta);
    }

    // Procesar el inicio de sesión
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        mensaje.replaceChildren();

        // Validar los campos obligatorios
        if (!formulario.checkValidity()) {
            evento.stopPropagation();
            formulario.classList.add("was-validated");
            return;
        }

        formulario.classList.add("was-validated");

        // Consultar los usuarios registrados en Almacenamiento.js
        let usuariosRegistrados;

        try {
            usuariosRegistrados = window.Obtenerlistadousuarios();

            if (!Array.isArray(usuariosRegistrados)) {
                throw new Error("La lista de usuarios no es válida.");
            }
        } catch (error) {
            console.error("Error al consultar los usuarios:", error);
            mostrarMensaje(
                "danger",
                "No fue posible consultar las cuentas registradas. Inténtalo nuevamente."
            );
            return;
        }

        // Obtener el correo ingresado
        const correoIngresado = correo.value.trim().toLowerCase();

        // Buscar exclusivamente por correo electrónico y contraseña
        const usuarioEncontrado = usuariosRegistrados.find((cuenta) => {
            return cuenta &&
                typeof cuenta.correo === "string" &&
                cuenta.correo.trim().toLowerCase() === correoIngresado &&
                typeof cuenta.contrasena === "string" &&
                cuenta.contrasena === contrasena.value;
        });

        // Rechazar el acceso si las credenciales no coinciden
        if (!usuarioEncontrado) {
            mostrarMensaje(
                "danger",
                "El correo electrónico o la contraseña son incorrectos. Verifica tus datos e inténtalo nuevamente."
            );
            return;
        }

        // Confirmar autenticación exitosa
        mostrarMensaje(
            "success",
            `¡Bienvenido/a, ${usuarioEncontrado.nombre || "Usuario"}! Inicio de sesión exitoso.`
        );

        // Guardar sesión y redirigir
        window.setTimeout(() => {
            registrarSesionYRedirigir(usuarioEncontrado);
        }, 1000);
    });

    // Limpiar mensajes cuando se modifican los campos
    [correo, contrasena].forEach((campo) => {
        campo.addEventListener("input", () => {
            campo.setCustomValidity("");
        });
    });
});