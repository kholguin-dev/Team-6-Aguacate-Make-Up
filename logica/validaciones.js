function validarTextoNoVacio(texto) {
    if (!texto) {
        return false;
    }
    const limpio = texto.trim();
    return limpio.length > 0;
}

function validarCorreo(correo) {
    if (!correo) {
        return false;
    }
    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronCorreo.test(correo.trim());
}

function validarCelular(celular) {
    if (!celular) {
        return false;
    }
    const soloNumeros = celular.trim();
    const patronCelular = /^[0-9]{10}$/;
    return patronCelular.test(soloNumeros);
}

function validarFormularioContacto(nombre, correo, celular, mensaje) {
    const listaErrores = [];

    if (!validarTextoNoVacio(nombre)) {
        listaErrores.push("Por favor escribe tu nombre completo");
    }

    if (!validarCorreo(correo)) {
        listaErrores.push("Por favor escribe un correo electronico valido");
    }

    if (!validarCelular(celular)) {
        listaErrores.push("El numero de celular debe contener diez digitos");
    }

    if (!validarTextoNoVacio(mensaje)) {
        listaErrores.push("Por favor escribe el mensaje que nos deseas enviar");
    }

    return {
        esValido: listaErrores.length === 0,
        errores: listaErrores
    };
}
