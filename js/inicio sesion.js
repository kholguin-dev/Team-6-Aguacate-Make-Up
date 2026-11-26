
document.addEventListener("DOMContentLoaded", () => {

    // 1. Obtener elementos del formulario
    const formulario = document.getElementById("formulario-inicio-sesion");
    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");
    const mensaje = document.getElementById("mensaje-inicio-sesion");

    // Verificar que existan los elementos del formulario
    if (!formulario || !correo || !contrasena || !mensaje) {
        console.error("No se encontraron los campos del formulario de inicio de sesión.");
        return;
    }

    // Obtener el botón después de verificar que existe el formulario
    const botonIngresar = formulario.querySelector("button[type='submit']");

    // Verificar que exista el botón
    if (!botonIngresar) {
        console.error("No se encontró el botón de inicio de sesión.");
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
    formulario.addEventListener("submit", async (evento) => {

        // Evitar el comportamiento predeterminado del formulario
        evento.preventDefault();

        // Limpiar mensajes anteriores
        mensaje.replaceChildren();

        // Validar los campos obligatorios
        if (!formulario.checkValidity()) {
            evento.stopPropagation();
            formulario.classList.add("was-validated");
            return;
        }

        formulario.classList.add("was-validated");

        // Obtener credenciales
        const credenciales = {
            correo: correo.value.trim().toLowerCase(),
            contrasena: contrasena.value
        };

        // Evitar envíos múltiples
        botonIngresar.disabled = true;
        botonIngresar.textContent = "Ingresando...";

        try {

            // Solicitud AUTENTICACIÓN al back
            const respuesta = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(credenciales)
                }
            );

            // Leer respuesta del Back

            // Leer la respuesta del backend como texto
            const textoRespuesta = await respuesta.text();

            // Inicializamos un objeto vacío
            let datosRespuesta = {};

            // Verificamos que la respuesta tenga contenido
            if (textoRespuesta) {
                try {
                    // Convertimos el texto a JSON
                    datosRespuesta = JSON.parse(textoRespuesta);
                } catch (error) {
                    // Si el backend devuelve algo que no es JSON
                    console.error("Respuesta no válida del backend:", textoRespuesta);
                }
            }

            // Validar respuesta HTTP
            if (!respuesta.ok) {

                // Manejo específico según el código HTTP
                switch (respuesta.status) {

                    // Credenciales incorrectas o usuario no encontrado
                    case 401:
                        throw new Error(
                            "Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente."
                        );

                    // Usuario sin permisos o acceso restringido
                    case 403:
                        throw new Error(
                            "No tienes permiso para iniciar sesión.Verifica tus datos e inténtalo nuevamente.  "
                        );

                    // Solicitud inválida
                    case 400:
                        throw new Error(
                            "Los datos ingresados no son válidos. Verifica tu correo y contraseña."
                        );

                    // Endpoint no encontrado
                    case 404:
                        throw new Error(
                            "No se encontró el servicio de inicio de sesión. Inténtalo más tarde."
                        );

                    // Error interno del servidor
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        throw new Error(
                            "El servidor presenta problemas en este momento. Inténtalo nuevamente más tarde."
                        );

                    // Otros errores HTTP
                    default:
                        throw new Error(
                            "No fue posible iniciar sesión. Verifica tus datos e inténtalo nuevamente."
                        );
                }
            }

            // Verificar que existe el token
            if (!datosRespuesta.token) {
                console.error(
                    "El backend respondió exitosamente, pero no devolvió un token."
                );

                throw new Error(
                    "No fue posible completar el inicio de sesión. Inténtalo nuevamente."
                );
            }

            // Guardar el TOKEN
            localStorage.setItem(
                "tokenJWT",
                datosRespuesta.token
            );

            // Guardar Datos de usuario
            const usuarioActivo = {
                idUsuario: datosRespuesta.idUsuario,
                nombre: datosRespuesta.nombres,
                nombres: datosRespuesta.nombres,
                correo: datosRespuesta.correo,
                rol: datosRespuesta.rol
            };

            localStorage.setItem(
                "usuarioActivo",
                JSON.stringify(usuarioActivo)
            );

            // Mostrar mensaje de inicio de sesión exitoso
            mostrarMensaje(
                "success",
                `¡Bienvenido/a, ${datosRespuesta.nombres}! Inicio de sesión exitoso.`
            );

            // Redirigir
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);

        } catch (error) {

            // Manejo de errores

            console.error(
                "Error durante el inicio de sesión:",
                error
            );

            // Identificar errores de conexión
            if (error instanceof TypeError && error.message.includes("fetch")) {

                mostrarMensaje(
                    "danger",
                    "No fue posible conectarse con el servidor. Verifica tu conexión e inténtalo nuevamente."
                );

            } else {

                // Mostrar mensaje amigable al usuario
                mostrarMensaje(
                    "danger",
                    error.message ||
                    "No fue posible iniciar sesión. Inténtalo nuevamente."
                );
            }

            // Permitir que el usuario vuelva a intentarlo
            botonIngresar.disabled = false;
            botonIngresar.textContent = "Ingresar";
        }

    });

    // Limpiar validaciones al escribir
    [correo, contrasena].forEach((campo) => {
        campo.addEventListener("input", () => {
            campo.setCustomValidity("");
        });
    });

});













