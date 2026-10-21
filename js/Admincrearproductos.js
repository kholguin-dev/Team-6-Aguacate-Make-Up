document.addEventListener('DOMContentLoaded', function () {
    
    // Obtiene los elementos del formulario para leer los datos que escribe el usuario
    const Formularioproducto = document.getElementById('formularioProducto');
    const Entradanombre = document.getElementById('nombreProducto');
    const Entradasku = document.getElementById('skuProducto');
    const Entradamarca = document.getElementById('marcaProducto');
    const Entradacategoria = document.getElementById('categoriaProducto');
    const Entradasubcategoria = document.getElementById('subcategoriaProducto');
    const Entradadescripcion = document.getElementById('descripcionProducto');
    const Entradapreciohabitual = document.getElementById('precioHabitual');
    const Entradapreciopromocional = document.getElementById('precioPromocional');
    const Entradastock = document.getElementById('stockProducto');
    const Entradatamano = document.getElementById('tamanoProducto');
    const Entradadisponibilidad = document.getElementById('disponibilidadProducto');
    const Entradabeneficios = document.getElementById('beneficiosProducto');
    const Entradamodouso = document.getElementById('modoUsoProducto');
    const Entradaingredientes = document.getElementById('ingredientesProducto');
    const Entradaprecauciones = document.getElementById('precaucionesProducto');
    const Entradatextoalternativo = document.getElementById('textoAlternativo');
    const Entradaestadopublicacion = document.getElementById('estadoPublicacion');
    const Casilladestacado = document.getElementById('casillaDestacado');
    const Casillanovedades = document.getElementById('casillaNovedades');

    // Controles para seleccionar la foto del producto y mostrar la vista previa
    const Botonsubirimagen = document.getElementById('botonSubirImagen');
    const Archivocargado = document.getElementById('archivoImagen');
    const Imagenprevia = document.getElementById('imagenPrevia');
    const Textonombrearchivo = document.getElementById('nombreArchivoMuestra');

    // Botones para volver y notificacion visual
    const Botonvolver = document.getElementById('botonVolver');
    const Botoncancelar = document.getElementById('botonCancelar');
    const Notificacionflotante = document.getElementById('alertaNotificacion');

    // Imagen inicial mientras el usuario carga su propia foto
    let Imagenenbase = '../img/logo.png';

    // Clave que se usa para guardar los registros en localstorage
    const Clavealmacenamiento = 'admincrearproductos';

    // Lee los productos que ya estan guardados o crea un arreglo vacio si es la primera vez
    function Obtenerlistadoproductos() {
        const Datosguardados = localStorage.getItem(Clavealmacenamiento);
        if (Datosguardados) {
            try {
                return JSON.parse(Datosguardados);
            } catch (error) {
                console.error('No se pudo leer la lista de productos guardada en localstorage', error);
                return [];
            }
        }
        return [];
    }

    // Guarda la lista actualizada de productos en localstorage
    function Guardarlistadoproductos(Listadoproductos) {
        localStorage.setItem(Clavealmacenamiento, JSON.stringify(Listadoproductos));
    }

    // Muestra la lista completa en la consola del navegador en formato json
    function Imprimirlistadojson() {
        const Listadoproductos = Obtenerlistadoproductos();
        console.log('Lista de productos en formato json:');
        console.log(JSON.stringify(Listadoproductos, null, 2));
    }

    // Imprime los datos que existan apenas carga la pagina
    Imprimirlistadojson();

    // Abre el selector de archivos cuando el usuario da clic en el boton de subir imagen
    if (Botonsubirimagen && Archivocargado) {
        Botonsubirimagen.addEventListener('click', function () {
            Archivocargado.click();
        });

        // Lee la imagen seleccionada y la convierte a texto para mostrarla de una vez
        Archivocargado.addEventListener('change', function (evento) {
            const Archivo = evento.target.files[0];
            if (Archivo) {
                if (Archivo.size > 5 * 1024 * 1024) {
                    Mostrarnotificacion('La imagen supera el limite permitido de 5 megas');
                    return;
                }

                const Lectorarchivos = new FileReader();
                Lectorarchivos.onload = function (resultado) {
                    Imagenenbase = resultado.target.result;
                    if (Imagenprevia) {
                        Imagenprevia.src = Imagenenbase;
                    }
                    if (Textonombrearchivo) {
                        Textonombrearchivo.textContent = Archivo.name;
                    }
                };
                Lectorarchivos.readAsDataURL(Archivo);
            }
        });
    }

    // Muestra un mensaje visual para avisar que se guardo el producto o si falta algun dato
    function Mostrarnotificacion(Mensaje) {
        if (!Notificacionflotante) return;
        Notificacionflotante.textContent = Mensaje;
        Notificacionflotante.classList.add('activa');
        setTimeout(function () {
            Notificacionflotante.classList.remove('activa');
        }, 3500);
    }

    // Quita el borde rojo del campo cuando ya esta corregido
    function Limpiarerror(Campo, Elementoerror) {
        if (Campo) Campo.classList.remove('entrada-invalida');
        if (Elementoerror) Elementoerror.classList.remove('visible');
    }

    // Marca el campo en rojo y muestra el mensaje de aviso
    function Marcarerror(Campo, Elementoerror, Mensaje) {
        if (Campo) Campo.classList.add('entrada-invalida');
        if (Elementoerror) {
            if (Mensaje) Elementoerror.textContent = Mensaje;
            Elementoerror.classList.add('visible');
        }
    }

    // Revisa que los datos obligatorios esten completos antes de guardar
    function Validardatos() {
        let Formulariovalido = true;
        const Listadoproductos = Obtenerlistadoproductos();

        // El nombre no puede quedar vacio
        const ErrorNombre = document.getElementById('errorNombre');
        if (!Entradanombre.value.trim()) {
            Marcarerror(Entradanombre, ErrorNombre, 'Por favor ingresa el nombre del producto');
            Formulariovalido = false;
        } else {
            Limpiarerror(Entradanombre, ErrorNombre);
        }

        // El codigo no puede faltar ni estar repetido en la lista
        const ErrorSku = document.getElementById('errorSku');
        const ValorSku = Entradasku.value.trim().toUpperCase();
        if (!ValorSku) {
            Marcarerror(Entradasku, ErrorSku, 'El codigo de referencia es obligatorio');
            Formulariovalido = false;
        } else {
            const SkuExiste = Listadoproductos.some(function (Item) {
                return Item.sku && Item.sku.toUpperCase() === ValorSku;
            });
            if (SkuExiste) {
                Marcarerror(Entradasku, ErrorSku, 'Este codigo de referencia ya fue registrado antes');
                Formulariovalido = false;
            } else {
                Limpiarerror(Entradasku, ErrorSku);
            }
        }

        // La descripcion es necesaria para que el cliente sepa que es
        const ErrorDescripcion = document.getElementById('errorDescripcion');
        if (!Entradadescripcion.value.trim()) {
            Marcarerror(Entradadescripcion, ErrorDescripcion, 'Por favor escribe una descripcion corta');
            Formulariovalido = false;
        } else {
            Limpiarerror(Entradadescripcion, ErrorDescripcion);
        }

        // El precio en pesos debe ser mayor a cero
        const ErrorPrecio = document.getElementById('errorPrecio');
        const ValorPrecio = parseFloat(Entradapreciohabitual.value);
        if (isNaN(ValorPrecio) || ValorPrecio <= 0) {
            Marcarerror(Entradapreciohabitual, ErrorPrecio, 'El precio debe ser un numero en pesos mayor a cero');
            Formulariovalido = false;
        } else {
            Limpiarerror(Entradapreciohabitual, ErrorPrecio);
        }

        // El stock tiene que ser un numero entero desde cero en adelante
        const ErrorStock = document.getElementById('errorStock');
        const ValorStock = parseInt(Entradastock.value, 10);
        if (isNaN(ValorStock) || ValorStock < 0) {
            Marcarerror(Entradastock, ErrorStock, 'El stock debe ser un numero entero mayor o igual a cero');
            Formulariovalido = false;
        } else {
            Limpiarerror(Entradastock, ErrorStock);
        }

        // Seleccion de categoria
        if (!Entradacategoria.value) {
            Entradacategoria.classList.add('entrada-invalida');
            Formulariovalido = false;
        } else {
            Entradacategoria.classList.remove('entrada-invalida');
        }

        // Texto descriptivo de la imagen para que sea accesible
        if (!Entradatextoalternativo.value.trim()) {
            Entradatextoalternativo.classList.add('entrada-invalida');
            Formulariovalido = false;
        } else {
            Entradatextoalternativo.classList.remove('entrada-invalida');
        }

        return Formulariovalido;
    }

    // Procesa el formulario cuando el usuario da clic en crear registro
    if (Formularioproducto) {
        Formularioproducto.addEventListener('submit', function (evento) {
            evento.preventDefault();

            if (!Validardatos()) {
                Mostrarnotificacion('Por favor revisa los campos en rojo');
                return;
            }

            // Arma el objeto con todos los datos que se escribieron
            const Nuevoproducto = {
                id: Date.now(),
                nombre: Entradanombre.value.trim(),
                sku: Entradasku.value.trim().toUpperCase(),
                marca: Entradamarca.value.trim(),
                categoria: Entradacategoria.value,
                subcategoria: Entradasubcategoria.value,
                descripcion: Entradadescripcion.value.trim(),
                precio: parseFloat(Entradapreciohabitual.value),
                preciopromocional: Entradapreciopromocional.value ? parseFloat(Entradapreciopromocional.value) : null,
                stock: parseInt(Entradastock.value, 10),
                tamano: Entradatamano.value.trim(),
                disponibilidad: Entradadisponibilidad.value,
                beneficios: Entradabeneficios.value.trim(),
                modouso: Entradamodouso.value.trim(),
                ingredientes: Entradaingredientes.value.trim(),
                precauciones: Entradaprecauciones.value.trim(),
                imagen: Imagenenbase,
                textoalternativo: Entradatextoalternativo.value.trim(),
                estado: Entradaestadopublicacion.value,
                destacado: Casilladestacado.checked,
                novedades: Casillanovedades.checked,
                fechacreacion: new Date().toISOString()
            };

            // Agrega el producto a la lista y lo deja guardado en localstorage
            const Listadoactual = Obtenerlistadoproductos();
            Listadoactual.push(Nuevoproducto);
            Guardarlistadoproductos(Listadoactual);

            // Imprime la lista en consola para verificar el json resultante
            Imprimirlistadojson();

            // Notifica que el producto se guardo y limpia los campos del formulario
            Mostrarnotificacion('Producto creado con exito y guardado en localstorage');
            Formularioproducto.reset();

            // Restablece la imagen y la marca a su estado inicial
            Imagenenbase = '../img/logo.png';
            if (Imagenprevia) Imagenprevia.src = Imagenenbase;
            if (Textonombrearchivo) Textonombrearchivo.textContent = 'Selecciona una imagen';
            if (Entradamarca) Entradamarca.value = 'Aguacate Make Up';
        });
    }

    // Solicita confirmacion antes de limpiar el formulario al pulsar cancelar
    if (Botoncancelar) {
        Botoncancelar.addEventListener('click', function () {
            if (confirm('Quieres cancelar y limpiar los campos del formulario?')) {
                Formularioproducto.reset();
                Imagenenbase = '../img/logo.png';
                if (Imagenprevia) Imagenprevia.src = Imagenenbase;
                if (Textonombrearchivo) Textonombrearchivo.textContent = 'Selecciona una imagen';
                if (Entradamarca) Entradamarca.value = 'Aguacate Make Up';
            }
        });
    }

    // Regresa a la tienda principal al pulsar volver
    if (Botonvolver) {
        Botonvolver.addEventListener('click', function () {
            window.location.href = '../index.html';
        });
    }
});
