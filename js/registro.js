
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-registro");
    const contrasena = document.getElementById("contrasena");
    const confirmarContrasena = document.getElementById("confirmar-contrasena");
    const mensajeRegistro = document.getElementById("mensaje-registro");

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
            guardarEnLocalStorage(nuevoUsuario);
            

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
            mensajeRegistro.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>${error.message}</div>
                </div>`;
        }
    });

    // Función para manejar el LocalStorage
    function guardarEnLocalStorage(usuario) {
        let usuariosDB = JSON.parse(localStorage.getItem("usuariosAguacate")) || [];

        const usuarioExiste = usuariosDB.some(u => u.correo === usuario.correo);
        
        if (usuarioExiste) {
            throw new Error("Este correo electrónico ya está registrado.");
        }
        usuariosDB.push(usuario);
        localStorage.setItem("usuariosAguacate", JSON.stringify(usuariosDB));
    }
});