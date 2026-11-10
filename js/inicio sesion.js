// Seccion necesaria para que se actualce en el Header, adjunto las lineas de validacion para implementar el Hola"Usuario"

function registrarSesionYRedirigir(usuario) {
    // 1. Guarda la sesión activa en el almacenamiento local para que el encabezado muestre el saludo con el nombre
    localStorage.setItem("usuarioActivo", JSON.stringify({
        nombre: usuario && usuario.nombre ? usuario.nombre : "Usuario"
    }));

    // 2. Redirige al catálogo de productos tras el inicio de sesión exitoso
    window.location.href = "catalogo.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-inicio-sesion");
    const usuario = document.getElementById("usuario");
    const contrasena = document.getElementById("contrasena");
    const mensaje = document.getElementById("mensaje-inicio-sesion");

    if (!formulario || !usuario || !contrasena || !mensaje) {
        console.error("No se encontraron los campos del formulario de inicio de sesión.");
        return;
    }

    function mostrarMensaje(tipo, texto) {
        const alerta = document.createElement("div");
        alerta.className = `alert alert-${tipo}`;
        alerta.textContent = texto;
        mensaje.replaceChildren(alerta);
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        mensaje.replaceChildren();
        usuario.setCustomValidity(
            usuario.value.trim() ? "" : "Ingresa tu nombre de usuario o correo electrónico."
        );
        contrasena.setCustomValidity(
            contrasena.value.trim() ? "" : "Ingresa tu contraseña."
        );

        if (!formulario.checkValidity()) {
            evento.stopPropagation();
            formulario.classList.add("was-validated");
            return;
        }

        formulario.classList.add("was-validated");

        let usuariosRegistrados;
        try {
            const datosUsuarios = localStorage.getItem("registroUsuarios");
            usuariosRegistrados = datosUsuarios ? JSON.parse(datosUsuarios) : [];
            if (!Array.isArray(usuariosRegistrados)) {
                throw new Error("La lista guardada de usuarios no es válida.");
            }
        } catch (error) {
            console.error("No se pudieron leer los usuarios registrados:", error);
            mostrarMensaje("danger", "No fue posible consultar las cuentas registradas. Inténtalo de nuevo.");
            return;
        }

        const identificadorIngresado = usuario.value.trim().toLocaleLowerCase();
        const usuarioEncontrado = usuariosRegistrados.find((cuenta) => {
            if (!cuenta || typeof cuenta !== "object") {
                return false;
            }

            const identificadores = [
                cuenta.usuario,
                cuenta.nombreUsuario,
                cuenta.username,
                cuenta.nombre,
                cuenta.correo,
                cuenta.email
            ];
            const identificadorCoincide = identificadores.some((identificador) =>
                typeof identificador === "string" &&
                identificador.trim().toLocaleLowerCase() === identificadorIngresado
            );
            const contrasenaGuardada = cuenta.contrasena !== undefined
                ? cuenta.contrasena
                : cuenta.password;

            return identificadorCoincide &&
                typeof contrasenaGuardada === "string" &&
                contrasenaGuardada === contrasena.value;
        });

        if (!usuarioEncontrado) {
            mostrarMensaje("danger", "El nombre de usuario/correo o la contraseña no son válidos.");
            return;
        }

        mostrarMensaje("success", `¡Inicio de sesión exitoso, ${usuarioEncontrado.nombre || usuarioEncontrado.usuario || "Usuario"}!`);
        window.setTimeout(() => registrarSesionYRedirigir(usuarioEncontrado), 1000);
    });

    [usuario, contrasena].forEach((campo) => {
        campo.addEventListener("input", () => campo.setCustomValidity(""));
    });
});
