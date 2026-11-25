document.addEventListener("DOMContentLoaded", () => {

    /*obtener elementos del form */

    const formulario = document.getElementById("formulario-registro");
    const contrasena = document.getElementById("contrasena");
    const confirmarContrasena = document.getElementById("confirmar-contrasena");
    const mensajeRegistro = document.getElementById("mensaje-registro");
    const telefono = document.getElementById("telefono");
    const botonRegistrar = document.getElementById("boton-registrar");

    /*Limpia validación del teléfono*/
    if (telefono) {
        telefono.addEventListener("input", () => {
            telefono.setCustomValidity("");
        });
    }
    /*Validar que las contraseñas coincidan*/
    confirmarContrasena.addEventListener("input", () => {
        if (contrasena.value !== confirmarContrasena.value) {
            confirmarContrasena.setCustomValidity("Las contraseñas no coinciden.");
        } else {
            confirmarContrasena.setCustomValidity("");
        }
    });

    // Escuchar el envío del formulario

    formulario.addEventListener("submit", async (e) => {

        e.preventDefault();

        // Validar nuevamente las contraseñas
        if (contrasena.value !== confirmarContrasena.value) {
            confirmarContrasena.setCustomValidity(
                "Las contraseñas no coinciden."
            );
        } else {
            confirmarContrasena.setCustomValidity("");
        }

        // Validar todos los campos HTML

        if (!formulario.checkValidity()) {
            e.stopPropagation();
            formulario.classList.add("was-validated");
            return;
        }
        // Crear objeto con los datos del usuario: 

        const nuevoUsuario = {
            nombres: document.getElementById("nombre").value.trim(),
            apellidos: document.getElementById("apellidos").value.trim(),
            correo: document.getElementById("correo").value.trim().toLowerCase(),
            telefono: document.getElementById("telefono").value.trim(),
            contrasena: contrasena.value,
            aceptaTerminos: document.getElementById("aceptar-terminos").checked,
            recibeNovedades: document.getElementById("recibir-novedades").checked,
        };

        // Evitar múltiples envíos
        botonRegistrar.disabled = true;
        botonRegistrar.textContent = "Registrando...";

        // 7. Mostrar mensaje de espera
        mensajeRegistro.textContent = "";

        try {

            // 8. Enviar los datos al backend
            const respuesta = await fetch(
                "http://localhost:8080/api/usuarios",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(nuevoUsuario)
                }
            );

            // 9. Convertir la respuesta del backend a JSON
            const datosRespuesta = await respuesta.json();

            // 10. Comprobar si el backend respondió con error
            if (!respuesta.ok) {

                throw new Error(
                    datosRespuesta.message ||
                    datosRespuesta.mensaje ||
                    "No fue posible registrar el usuario."
                );

            }

            // 11. Mostrar mensaje de éxito
            const alerta = document.createElement("div");

            alerta.className =
                "alert alert-success d-flex align-items-center";

            alerta.setAttribute("role", "alert");

            const icono = document.createElement("i");

            icono.className = "bi bi-check-circle-fill me-2";

            const texto = document.createElement("div");

            texto.textContent =
                `¡Cuenta creada con éxito, ${nuevoUsuario.nombres}!`;

            alerta.appendChild(icono);
            alerta.appendChild(texto);

            mensajeRegistro.appendChild(alerta);

            // 12. Limpiar formulario
            formulario.reset();

            formulario.classList.remove("was-validated");

            confirmarContrasena.setCustomValidity("");

            // 13. Redirigir al login después de 2 segundos
            setTimeout(() => {

                window.location.href = "inicio sesion.html";

            }, 2000);

        } catch (error) {

            // 14. Mostrar mensaje de error
            const alerta = document.createElement("div");

            alerta.className =
                "alert alert-danger d-flex align-items-center";

            alerta.setAttribute("role", "alert");

            const icono = document.createElement("i");

            icono.className =
                "bi bi-exclamation-triangle-fill me-2";

            const texto = document.createElement("div");

            texto.textContent = error.message;

            alerta.appendChild(icono);
            alerta.appendChild(texto);

            mensajeRegistro.replaceChildren(alerta);

            // 15. Permitir nuevamente el envío
            botonRegistrar.disabled = false;

            botonRegistrar.textContent = "Crear mi cuenta";

            console.error("Error en el registro:", error);

        }
    });
});