document.addEventListener("DOMContentLoaded", function () {
    const contenedorTarjetas = document.querySelectorAll(".team-card");
    if (contenedorTarjetas) {
        contenedorTarjetas.forEach(function (tarjeta) {
            tarjeta.addEventListener("click", function () {
                tarjeta.classList.toggle("flipped");
            });
        });
    }

    const formularioContacto = document.getElementById("formularioContacto");
    const contenedorAlerta = document.getElementById("contenedorAlerta");

    if (formularioContacto) {
        formularioContacto.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const campoNombre = document.getElementById("campoNombre");
            const campoCorreo = document.getElementById("campoCorreo");
            const campoCelular = document.getElementById("campoCelular");
            const campoMensaje = document.getElementById("campoMensaje");

            const valorNombre = campoNombre ? campoNombre.value : "";
            const valorCorreo = campoCorreo ? campoCorreo.value : "";
            const valorCelular = campoCelular ? campoCelular.value : "";
            const valorMensaje = campoMensaje ? campoMensaje.value : "";

            const resultado = validarFormularioContacto(valorNombre, valorCorreo, valorCelular, valorMensaje);

            if (!resultado.esValido) {
                const mensajeError = resultado.errores.join(". ");
                mostrarAlerta(contenedorAlerta, mensajeError, "danger");
                return;
            }

            const datosContacto = {
                nombre: valorNombre,
                correo: valorCorreo,
                celular: valorCelular,
                mensaje: valorMensaje,
                fechaRegistro: new Date().toISOString()
            };

            const enlaceCorreo = "mailto:contacto@aguacatemakeup.com?subject=" +
                encodeURIComponent("Contacto de " + valorNombre) +
                "&body=" +
                encodeURIComponent("Nombre: " + valorNombre + "\nCorreo: " + valorCorreo + "\nCelular: " + valorCelular + "\nMensaje: " + valorMensaje);

            window.location.href = enlaceCorreo;

            mostrarAlerta(contenedorAlerta, "Mensaje validado correctamente. Se ha abierto tu cliente de correo para enviar la información.", "success");
            limpiarCamposFormulario(formularioContacto);
        });
    }
});
