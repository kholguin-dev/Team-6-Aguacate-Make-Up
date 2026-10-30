// Este archivo conserva su nombre Admincrearproductos.js y ahora funciona como el controlador principal de la vista.
// Este se encarga de todo el funcionamiento de escuchar los eventos del formulario, cargar los datos para editar y gestionar el guardado y borradores.
// Lo que se corrigio creando este archivo fue retirar la logica pesada de validacion, imagenes y almacenamiento duplicado para dejar un controlador limpio.

document.addEventListener('DOMContentLoaded', function () {

    // Referencias a los campos del formulario
    const Formularioproducto = document.getElementById('formularioProducto');
    const Entradanombre = document.getElementById('nombreProducto');
    const Entradamarca = document.getElementById('marcaProducto');
    const Entradacategoria = document.getElementById('categoriaProducto');
    const Entradasubcategoria = document.getElementById('subcategoriaProducto');
    const Entradasku = document.getElementById('skuProducto');
    const Botongenerarsku = document.getElementById('botonGenerarSku');
    const Ayudasku = document.getElementById('ayudaSku');
    const Exitosku = document.getElementById('exitoSku');
    const Entradadescripcion = document.getElementById('descripcionProducto');
    const Entradapreciohabitual = document.getElementById('precioHabitual');
    const Entradapreciopromocional = document.getElementById('precioPromocional');
    const Entradastock = document.getElementById('stockProducto');
    const Entradatamano = document.getElementById('tamanoProducto');
    const Entradadisponibilidad = document.getElementById('disponibilidadProducto');
    const Entradabeneficios = document.getElementById('beneficiosProducto');
    const Entradamodouso = document.getElementById('modoUsoProducto');
    const Entradaingredientes = document.getElementById('ingredientesProducto');
    const Entradatextoalternativo = document.getElementById('textoAlternativo');
    const Casilladestacado = document.getElementById('casillaDestacado');
    const Casillanovedades = document.getElementById('casillaNovedades');

    // Referencias para la imagen del producto
    const Cajaprevisualizacion = document.getElementById('cajaPrevisualizacion');
    const Imagenprevia = document.getElementById('imagenPrevia');
    const Archivocargado = document.getElementById('archivoImagen');
    const Botonsubirimagen = document.getElementById('botonSubirImagen');
    const Textobotonsubirimagen = document.getElementById('textoBotonSubirImagen');
    const Iconobotonsubir = document.getElementById('iconoBotonSubir');
    const Botoneliminarimagen = document.getElementById('botonEliminarImagen');
    const Botoneliminarimagenflotante = document.getElementById('botonEliminarImagenFlotante');
    const Textonombrearchivo = document.getElementById('nombreArchivoMuestra');

    // Botones de acción y notificación
    const Botonguardar = document.getElementById('botonGuardar');
    const Botonguardarborrador = document.getElementById('botonGuardarBorrador');
    const Botoncancelar = document.getElementById('botonCancelar');
    const Alertanotificacion = document.getElementById('alertaNotificacion');

    // Capa de carga y confirmación
    const CapaCargando = document.getElementById('capaCargando');
    const TituloCargando = document.getElementById('tituloCargando');
    const DescripcionCargando = document.getElementById('descripcionCargando');
    const IconoAnimacionCarga = document.getElementById('iconoAnimacionCarga');
    const ContenedorIndicadorCarga = document.getElementById('contenedorIndicadorCarga');

    // Agrupación de elementos para módulos auxiliares
    const Elementosimagen = {
        Textobotonsubirimagen,
        Iconobotonsubir,
        Botoneliminarimagen,
        Botoneliminarimagenflotante,
        Imagenprevia,
        Textonombrearchivo,
        Archivocargado
    };

    const Camposformulario = {
        nombre: Entradanombre,
        marca: Entradamarca,
        categoria: Entradacategoria,
        subcategoria: Entradasubcategoria,
        sku: Entradasku,
        exitosku: Exitosku,
        descripcion: Entradadescripcion,
        preciohabitual: Entradapreciohabitual,
        preciopromocional: Entradapreciopromocional,
        stock: Entradastock,
        tamano: Entradatamano,
        disponibilidad: Entradadisponibilidad,
        beneficios: Entradabeneficios,
        modouso: Entradamodouso,
        ingredientes: Entradaingredientes,
        textoalternativo: Entradatextoalternativo,
        destacado: Casilladestacado,
        novedades: Casillanovedades
    };

    // Estado del formulario
    let Imagenenbase = '../img/logo.png';
    let Idproductoeditar = null;
    let SkuOriginalEditar = '';
    let EstadoOriginalEditar = 'Publicado';
    let InstantaneaOriginalEditar = null;

    // Notificaciones y capas de carga
    function Mostrarnotificacion(Mensaje) {
        if (!Alertanotificacion) return;
        Alertanotificacion.textContent = Mensaje;
        Alertanotificacion.classList.add('visible');
        setTimeout(() => Alertanotificacion.classList.remove('visible'), 3000);
    }

    function AlternarBotonesAccion(bloqueado) {
        if (Botonguardar) Botonguardar.disabled = bloqueado;
        if (Botonguardarborrador) Botonguardarborrador.disabled = bloqueado;
    }

    function MostrarAnimacionCarga(Titulo, Descripcion) {
        if (!CapaCargando) return;
        AlternarBotonesAccion(true);
        if (TituloCargando) TituloCargando.textContent = Titulo || 'Guardando información...';
        if (DescripcionCargando) DescripcionCargando.textContent = Descripcion || 'Guardando el producto en el inventario.';
        if (ContenedorIndicadorCarga) ContenedorIndicadorCarga.innerHTML = '<div class="spinner-aguacate" id="iconoAnimacionCarga"></div>';
        CapaCargando.classList.remove('d-none');
    }

    function MostrarConfirmacionCarga(Titulo, Descripcion) {
        if (!CapaCargando) return;
        if (TituloCargando) TituloCargando.textContent = Titulo || 'Guardado exitoso';
        if (DescripcionCargando) DescripcionCargando.textContent = Descripcion || 'El producto ya está disponible en la lista.';
        if (ContenedorIndicadorCarga) ContenedorIndicadorCarga.innerHTML = '<span class="material-symbols-outlined icono-confirmacion-exito">check_circle</span>';
        CapaCargando.classList.remove('d-none');
    }

    function OcultarAnimacionCarga() {
        if (!CapaCargando) return;
        CapaCargando.classList.add('d-none');
        AlternarBotonesAccion(false);
    }

    // Detección de cambios y textos de botones
    function ActualizarTextoBotonGuardar() {
        if (!Botonguardar) return;
        const texto = Botonguardar.querySelector('.texto-boton');
        if (Idproductoeditar) {
            if (texto) texto.textContent = 'Actualizar producto';
            Botonguardar.title = 'Hacer clic para guardar las modificaciones';
        } else {
            if (texto) texto.textContent = 'Publicar producto';
            Botonguardar.title = 'Hacer clic para crear el producto';
        }
    }

    function ObtenerInstantaneaFormulario() {
        return {
            nombre: (Entradanombre?.value || '').trim(),
            marca: (Entradamarca?.value || '').trim(),
            categoria: (Entradacategoria?.value || '').trim(),
            subcategoria: (Entradasubcategoria?.value || '').trim(),
            sku: (Entradasku?.value || '').trim().toUpperCase(),
            descripcion: (Entradadescripcion?.value || '').trim(),
            precio: String(parseFloat(Entradapreciohabitual?.value || '0')),
            preciopromocional: Entradapreciopromocional?.value ? String(parseFloat(Entradapreciopromocional.value)) : '',
            stock: String(parseInt(Entradastock?.value || '0', 10)),
            tamano: (Entradatamano?.value || '').trim(),
            disponibilidad: (Entradadisponibilidad?.value || '').trim(),
            beneficios: (Entradabeneficios?.value || '').trim(),
            modouso: (Entradamodouso?.value || '').trim(),
            ingredientes: (Entradaingredientes?.value || '').trim(),
            textoalternativo: (Entradatextoalternativo?.value || '').trim(),
            destacado: Boolean(Casilladestacado?.checked),
            novedades: Boolean(Casillanovedades?.checked),
            imagen: Imagenenbase
        };
    }

    function HayCambiosRespectoAlRegistroOriginal() {
        if (!InstantaneaOriginalEditar) return true;
        const actual = ObtenerInstantaneaFormulario();
        return Object.keys(InstantaneaOriginalEditar).some(clave => actual[clave] !== InstantaneaOriginalEditar[clave]);
    }

    function ActualizarEstadoBotonActualizar() {
        if (!Botonguardar) return;
        ActualizarTextoBotonGuardar();

        if (Idproductoeditar && EstadoOriginalEditar === 'Publicado') {
            const hayDiferencias = HayCambiosRespectoAlRegistroOriginal();
            Botonguardar.disabled = !hayDiferencias;
            Botonguardar.title = hayDiferencias ? 'Hacer clic para actualizar el registro' : 'No hay cambios respecto al registro en la base de datos';
            Botonguardar.classList.toggle('boton-deshabilitado', !hayDiferencias);
        } else {
            Botonguardar.disabled = false;
            Botonguardar.removeAttribute('title');
            Botonguardar.classList.remove('boton-deshabilitado');
        }
    }

    if (Formularioproducto) {
        Formularioproducto.addEventListener('input', ActualizarEstadoBotonActualizar);
        Formularioproducto.addEventListener('change', ActualizarEstadoBotonActualizar);
    }

    // Configuración del módulo de imágenes
    if (Botonsubirimagen && Archivocargado) {
        Botonsubirimagen.addEventListener('click', () => { Archivocargado.value = ''; Archivocargado.click(); });
    }
    if (Archivocargado) {
        Archivocargado.addEventListener('change', (e) => {
            const archivo = e.target.files && e.target.files[0];
            Cargararchivodeimagen(archivo, Elementosimagen, (dataUrl) => {
                Imagenenbase = dataUrl;
                ActualizarEstadoBotonActualizar();
                Mostrarnotificacion('Imagen cargada con éxito');
            }, (msg) => Mostrarnotificacion(msg));
        });
    }

    const accionEliminarImagen = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        Eliminarimagenseleccionada(Elementosimagen, (defecto) => {
            Imagenenbase = defecto;
            ActualizarEstadoBotonActualizar();
            Mostrarnotificacion('Imagen eliminada correctamente');
        });
    };
    if (Botoneliminarimagen) Botoneliminarimagen.addEventListener('click', accionEliminarImagen);
    if (Botoneliminarimagenflotante) Botoneliminarimagenflotante.addEventListener('click', accionEliminarImagen);

    if (Cajaprevisualizacion && Archivocargado) {
        Cajaprevisualizacion.addEventListener('click', (e) => {
            if (e.target.closest('#botonEliminarImagen') || e.target.closest('#botonEliminarImagenFlotante')) return;
            Archivocargado.value = '';
            Archivocargado.click();
        });
        Cajaprevisualizacion.addEventListener('dragover', (e) => { e.preventDefault(); Cajaprevisualizacion.classList.add('arrastrando'); });
        Cajaprevisualizacion.addEventListener('dragleave', (e) => { e.preventDefault(); Cajaprevisualizacion.classList.remove('arrastrando'); });
        Cajaprevisualizacion.addEventListener('drop', (e) => {
            e.preventDefault();
            Cajaprevisualizacion.classList.remove('arrastrando');
            const archivo = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (archivo) {
                Cargararchivodeimagen(archivo, Elementosimagen, (dataUrl) => {
                    Imagenenbase = dataUrl;
                    ActualizarEstadoBotonActualizar();
                    Mostrarnotificacion('Imagen cargada con éxito');
                }, (msg) => Mostrarnotificacion(msg));
            }
        });
    }

    // Configuración del módulo de SKU y subcategorías
    function GenerarYAsignarSkuAuto() {
        if (!Entradasku) return;
        const nuevoSku = ObtenerSiguienteSku(Entradacategoria, Entradasubcategoria);
        if (!nuevoSku) return Mostrarnotificacion('Primero selecciona una categoría y subcategoría');
        Entradasku.value = nuevoSku;
        Validarskuentiempreal(Entradasku, Exitosku, Idproductoeditar, SkuOriginalEditar);
        ActualizarEstadoBotonActualizar();
    }

    function Aplicarprefijoalsku() {
        if (!Entradasku) return;
        const prefijo = Obtenerprefijobase(Entradacategoria, Entradasubcategoria);
        Entradasku.value = prefijo;
        Limpiarerror(Entradasku, document.getElementById('errorSku'));
        if (Exitosku) Exitosku.style.display = 'none';
        if (prefijo) Entradasku.focus();
        ActualizarEstadoBotonActualizar();
    }

    if (Entradasku) {
        Entradasku.addEventListener('input', function () {
            this.value = Filtrarsku(this.value);
            Validarskuentiempreal(Entradasku, Exitosku, Idproductoeditar, SkuOriginalEditar);
        });
        Entradasku.addEventListener('blur', () => Validarskuentiempreal(Entradasku, Exitosku, Idproductoeditar, SkuOriginalEditar));
    }

    if (Entradacategoria) {
        Entradacategoria.addEventListener('change', () => {
            Actualizarsubcategorias(Entradacategoria, Entradasubcategoria);
            Aplicarprefijoalsku();
        });
    }
    if (Entradasubcategoria) Entradasubcategoria.addEventListener('change', Aplicarprefijoalsku);
    if (Botongenerarsku) Botongenerarsku.addEventListener('click', () => { GenerarYAsignarSkuAuto(); Entradasku && Entradasku.focus(); });

    // Configuración de casillas numéricas
    [Entradapreciohabitual, Entradapreciopromocional, Entradastock].forEach(Configurarcasillanumerica);

    // Carga de producto existente en modo edición
    async function Cargardatosproductoexistente() {
        const parametros = new URLSearchParams(window.location.search);
        const idBuscado = parametros.get('id');
        const skuBuscado = parametros.get('sku');

        if (!idBuscado && !skuBuscado) {
            Actualizarsubcategorias(Entradacategoria, Entradasubcategoria);
            if (Entradasku) Entradasku.value = '';
            ActualizarTextoBotonGuardar();
            ActualizarEstadoBotonActualizar();
            return;
        }

        const listado = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];
        const coincide = (item) => {
            const itemId = String(item.id || '').trim();
            const itemSku = String(item.sku || '').trim().toUpperCase();
            return (idBuscado && (itemId === idBuscado || itemId.replace('PROD-', '') === idBuscado.replace('PROD-', ''))) ||
                   (skuBuscado && itemSku === skuBuscado) ||
                   (idBuscado && itemSku === idBuscado.toUpperCase());
        };

        const encontrado = listado.find(coincide);
        if (!encontrado) {
            Actualizarsubcategorias(Entradacategoria, Entradasubcategoria);
            if (Entradasku) Entradasku.value = '';
            ActualizarTextoBotonGuardar();
            ActualizarEstadoBotonActualizar();
            return;
        }

        Idproductoeditar = encontrado.id;
        SkuOriginalEditar = (encontrado.sku || encontrado.referencia || '').toString().trim().toUpperCase();
        EstadoOriginalEditar = encontrado.estado || 'Publicado';

        const camposMapeo = {
            nombre: Entradanombre,
            marca: Entradamarca,
            categoria: Entradacategoria,
            subcategoria: Entradasubcategoria,
            descripcion: Entradadescripcion,
            precio: Entradapreciohabitual,
            stock: Entradastock,
            tamano: Entradatamano,
            disponibilidad: Entradadisponibilidad,
            beneficios: Entradabeneficios,
            modouso: Entradamodouso,
            ingredientes: Entradaingredientes,
            textoAlternativo: Entradatextoalternativo
        };

        Object.keys(camposMapeo).forEach(prop => {
            if (camposMapeo[prop] && encontrado[prop] !== undefined) camposMapeo[prop].value = encontrado[prop];
        });

        if (Entradacategoria && encontrado.categoria) {
            Entradacategoria.value = encontrado.categoria;
            Actualizarsubcategorias(Entradacategoria, Entradasubcategoria);
            if (Entradasubcategoria && encontrado.subcategoria) Entradasubcategoria.value = encontrado.subcategoria;
        }

        if (Entradapreciopromocional) {
            const promo = encontrado.preciopromocional !== undefined ? encontrado.preciopromocional : encontrado.precioPromocional;
            Entradapreciopromocional.value = (promo !== null && promo !== undefined && promo !== '') ? promo : '';
        }

        if (Entradasku) Entradasku.value = SkuOriginalEditar;
        if (Casilladestacado) Casilladestacado.checked = Boolean(encontrado.destacado);
        if (Casillanovedades) Casillanovedades.checked = Boolean(encontrado.novedades);

        const imgRaw = encontrado.imagen || encontrado.thumbnail || '';
        Imagenenbase = typeof NormalizarUrlImagen === 'function' ? NormalizarUrlImagen(imgRaw) : (imgRaw || '../img/logo.png');

        if (Imagenprevia) {
            Imagenprevia.src = Imagenenbase;
            Actualizarbotonesimagen(Boolean(Imagenenbase && !Imagenenbase.includes('logo.png')), Elementosimagen);
            Imagenprevia.onerror = function () {
                this.src = '../img/logo.png';
                Actualizarbotonesimagen(false, Elementosimagen);
            };
        }

        InstantaneaOriginalEditar = ObtenerInstantaneaFormulario();
        ActualizarTextoBotonGuardar();
        ActualizarEstadoBotonActualizar();
    }

    Cargardatosproductoexistente();

    // Construcción de la entidad producto
    function ConstruirProductoFormulario(esBorradorManual) {
        const skuIngresado = Entradasku.value.trim().toUpperCase();
        const skuGenerado = skuIngresado || ObtenerSiguienteSku(Entradacategoria, Entradasubcategoria) || ('BORR' + String(Date.now()).slice(-5));
        const idFinal = Idproductoeditar || ('PROD-' + String(Date.now()).slice(-6));
        const estadoFinal = esBorradorManual ? 'Borrador' : (EstadoOriginalEditar === 'Borrador' ? 'Publicado' : EstadoOriginalEditar);

        return {
            id: idFinal,
            sku: skuGenerado,
            nombre: Entradanombre.value.trim() || 'Borrador sin título',
            marca: Entradamarca.value.trim() || 'Aguacate Make Up',
            categoria: Entradacategoria.value || 'Maquillaje',
            subcategoria: Entradasubcategoria.value || 'General',
            descripcion: Entradadescripcion.value.trim() || '',
            precio: parseFloat(Entradapreciohabitual.value) || 0,
            preciopromocional: Entradapreciopromocional.value ? parseFloat(Entradapreciopromocional.value) : null,
            stock: parseInt(Entradastock.value, 10) || 0,
            tamano: Entradatamano.value.trim() || '',
            disponibilidad: Entradadisponibilidad.value || 'En stock',
            beneficios: Entradabeneficios.value.trim() || '',
            modouso: Entradamodouso.value.trim() || '',
            ingredientes: Entradaingredientes.value.trim() || '',
            textoAlternativo: Entradatextoalternativo.value.trim() || Entradanombre.value.trim() || 'Imagen de producto',
            imagen: Imagenenbase,
            destacado: Casilladestacado.checked,
            novedades: Casillanovedades.checked,
            estado: estadoFinal,
            fechaCreacion: new Date().toISOString()
        };
    }

    function Formulariotienetexto() {
        return Boolean(
            Entradanombre.value.trim() ||
            Entradadescripcion.value.trim() ||
            Entradapreciohabitual.value.trim() ||
            Entradastock.value.trim() ||
            Entradasku.value.trim() ||
            (Imagenenbase && !Imagenenbase.includes('logo.png'))
        );
    }

    // Evento de envío para crear o actualizar
    Formularioproducto.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!Validardatos(Camposformulario, Idproductoeditar, SkuOriginalEditar)) {
            Mostrarnotificacion('Por favor completa todos los campos requeridos correctamente');
            return;
        }

        const producto = ConstruirProductoFormulario(false);
        const accionTexto = Idproductoeditar ? 'Actualizando producto...' : 'Publicando producto...';
        MostrarAnimacionCarga(accionTexto, 'Guardando los cambios en el inventario local.');

        try {
            await CrearOActualizarProductoInventario(producto, Boolean(Idproductoeditar));
            MostrarConfirmacionCarga('¡Producto guardado!', 'La información se actualizó correctamente en la base de datos.');
            setTimeout(() => {
                window.location.href = 'admin-productos.html';
            }, 1400);
        } catch (error) {
            console.error('Error al guardar:', error);
            OcultarAnimacionCarga();
            Mostrarnotificacion(error instanceof Error ? error.message : 'Hubo un error al guardar el producto');
        }
    });

    // Guardado de borradores
    function Guardarborrador(esManual) {
        if (!Formulariotienetexto()) {
            if (esManual) Mostrarnotificacion('El formulario está vacío, no hay nada que guardar');
            return;
        }
        const borrador = ConstruirProductoFormulario(true);
        GuardarBorradorInventario(borrador);
        if (esManual) Mostrarnotificacion('Borrador guardado exitosamente en el navegador');
    }

    if (Botonguardarborrador) Botonguardarborrador.addEventListener('click', () => Guardarborrador(true));

    // Cancelar y volver al listado
    if (Botoncancelar) {
        Botoncancelar.addEventListener('click', () => {
            if (Formulariotienetexto() && HayCambiosRespectoAlRegistroOriginal()) {
                if (confirm('Tienes modificaciones sin guardar. ¿Deseas descartarlas y volver al listado?')) {
                    window.location.href = 'admin-productos.html';
                }
            } else {
                window.location.href = 'admin-productos.html';
            }
        });
    }
});
