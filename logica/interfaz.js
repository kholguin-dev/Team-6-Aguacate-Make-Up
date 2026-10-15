function mostrarAlerta(contenedor, mensaje, tipo) {
    if (!contenedor) {
        return;
    }
    contenedor.innerHTML = "";
    const alerta = document.createElement("div");
    alerta.className = "alert alert-" + tipo + " alert-dismissible fade show";
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;
    contenedor.appendChild(alerta);
}

function limpiarAlerta(contenedor) {
    if (contenedor) {
        contenedor.innerHTML = "";
    }
}

function limpiarCamposFormulario(formulario) {
    if (formulario) {
        formulario.reset();
    }
}

function crearTarjetaProducto(producto) {
    const columna = document.createElement("div");
    columna.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    const tarjeta = document.createElement("div");
    tarjeta.className = "card h-100 shadow-sm border-0";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.className = "card-img-top";
    imagen.alt = producto.nombre;

    const cuerpo = document.createElement("div");
    cuerpo.className = "card-body d-flex flex-column";

    const categoria = document.createElement("small");
    categoria.className = "text-muted mb-1";
    categoria.textContent = producto.categoria;

    const titulo = document.createElement("h5");
    titulo.className = "card-title fs-6 fw-bold";
    titulo.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.className = "card-text small text-secondary flex-grow-1";
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement("p");
    precio.className = "fw-bold text-primary mb-0 mt-2";
    precio.textContent = "$" + producto.precio.toLocaleString("es-CO") + " pesos";

    cuerpo.appendChild(categoria);
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(descripcion);
    cuerpo.appendChild(precio);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(cuerpo);
    columna.appendChild(tarjeta);

    return columna;
}
