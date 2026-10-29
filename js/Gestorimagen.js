// Este archivo se extrajo de Admincrearproductos.js y ahora se llama Gestorimagen.js.
// Este se encarga de todo el funcionamiento de optimizar, cargar, previsualizar y eliminar la imagen del producto para guardarla en el almacenamiento.
// Lo que se corrigio creando este archivo fue aislar el procesamiento grafico en un modulo propio para que el formulario no quede saturado de codigo.

function Actualizarbotonesimagen(tieneImagen, elementos) {
    if (!elementos) return;
    const { Textobotonsubirimagen, Iconobotonsubir, Botoneliminarimagen, Botoneliminarimagenflotante } = elementos;
    if (Textobotonsubirimagen) Textobotonsubirimagen.textContent = tieneImagen ? 'Cambiar imagen' : 'Subir imagen';
    if (Iconobotonsubir) Iconobotonsubir.textContent = tieneImagen ? 'sync' : 'upload';
    if (Botoneliminarimagen) {
        Botoneliminarimagen.classList.toggle('d-none', !tieneImagen);
        Botoneliminarimagen.classList.toggle('d-inline-flex', tieneImagen);
    }
    if (Botoneliminarimagenflotante) Botoneliminarimagenflotante.classList.toggle('d-none', !tieneImagen);
}

function OptimizarImagenParaStorage(archivo, alTerminar) {
    const lector = new FileReader();
    lector.onload = function (eventoLector) {
        const img = new Image();
        img.onload = function () {
            const limiteMaximo = 800;
            let ancho = img.width;
            let alto = img.height;

            if (ancho > limiteMaximo || alto > limiteMaximo) {
                if (ancho > alto) {
                    alto = Math.round((alto * limiteMaximo) / ancho);
                    ancho = limiteMaximo;
                } else {
                    ancho = Math.round((ancho * limiteMaximo) / alto);
                    alto = limiteMaximo;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = ancho;
            canvas.height = alto;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, ancho, alto);

            const dataUrlOptimizada = canvas.toDataURL('image/jpeg', 0.82);
            alTerminar(dataUrlOptimizada);
        };
        img.onerror = function () {
            alTerminar(eventoLector.target.result);
        };
        img.src = eventoLector.target.result;
    };
    lector.readAsDataURL(archivo);
}

function Cargararchivodeimagen(Archivo, elementos, alExito, alError) {
    if (!Archivo) return;
    if (!Archivo.type.startsWith('image/')) {
        if (typeof alError === 'function') alError('Selecciona un archivo de imagen válido (JPG, PNG, WebP)');
        return;
    }
    if (Archivo.size > 5 * 1024 * 1024) {
        if (typeof alError === 'function') alError('La imagen supera el límite permitido de 5 megas');
        return;
    }

    OptimizarImagenParaStorage(Archivo, function (resultadoDataUrl) {
        if (elementos.Imagenprevia) elementos.Imagenprevia.src = resultadoDataUrl;
        if (elementos.Textonombrearchivo) elementos.Textonombrearchivo.textContent = Archivo.name;
        Actualizarbotonesimagen(true, elementos);
        if (typeof alExito === 'function') alExito(resultadoDataUrl);
    });
}

function Eliminarimagenseleccionada(elementos, alEliminar) {
    const imagenPorDefecto = '../img/logo.png';
    if (elementos.Imagenprevia) elementos.Imagenprevia.src = imagenPorDefecto;
    if (elementos.Textonombrearchivo) elementos.Textonombrearchivo.textContent = 'Haz clic o arrastra para seleccionar una imagen';
    if (elementos.Archivocargado) elementos.Archivocargado.value = '';
    Actualizarbotonesimagen(false, elementos);
    if (typeof alEliminar === 'function') alEliminar(imagenPorDefecto);
}

if (typeof window !== 'undefined') {
    Object.assign(window, {
        Actualizarbotonesimagen,
        OptimizarImagenParaStorage,
        Cargararchivodeimagen,
        Eliminarimagenseleccionada
    });
}

