document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-registro");
    const contrasena = document.getElementById("contrasena");
    const confirmarContrasena = document.getElementById("confirmar-contrasena");
    const mensajeRegistro = document.getElementById("mensaje-registro");
    const telefono = document.getElementById("telefono");

    if (telefono) {
        telefono.addEventListener("input", () => {
            telefono.setCustomValidity("");
        });
    }

    confirmarContrasena.addEventListener("input", () => {
        if (contrasena.value !== confirmarContrasena.value) {
            confirmarContrasena.setCustomValidity("Las contraseñas no coinciden.");
        } else {
            confirmarContrasena.setCustomValidity(""); 
        }
    });


    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        if (contrasena.value !== confirmarContrasena.value) {
            confirmarContrasena.setCustomValidity("Las contraseñas no coinciden.");
        } else {
            confirmarContrasena.setCustomValidity("");
        }


        if (!formulario.checkValidity()) {
            e.stopPropagation();
            formulario.classList.add("was-validated"); 
            return;
        }

        const nuevoUsuario = {
            id: Date.now(),
            nombre: document.getElementById("nombre").value.trim(),
            apellidos: document.getElementById("apellidos").value.trim(),
            correo: document.getElementById("correo").value.trim().toLowerCase(),
            telefono: document.getElementById("telefono").value.trim(),
            contrasena: contrasena.value, 
            aceptaTerminos: document.getElementById("aceptar-terminos").checked,
            recibeNovedades: document.getElementById("recibir-novedades").checked,
            fechaRegistro: new Date().toISOString()
        };


        try {
            GuardarUsuarioEnStorage(nuevoUsuario);
            

            mensajeRegistro.innerHTML = `
                <div class="alert alert-success d-flex align-items-center" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    <div>¡Cuenta creada con éxito, ${nuevoUsuario.nombre}! Redirigiendo...</div>
                </div>`;
            
            formulario.reset();
            formulario.classList.remove("was-validated");

            setTimeout(() => {
                window.location.href = "inicio sesion.html";
            }, 2000);

        } catch (error) {
            if (telefono && error.message.includes("número")) {
                telefono.setCustomValidity("Este número ya está registrado");
                telefono.reportValidity();
            }

            mensajeRegistro.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>${error.message}</div>
                </div>`;
        }
    });
    
});

