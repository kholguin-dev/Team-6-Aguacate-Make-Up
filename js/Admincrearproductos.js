document.addEventListener('DOMContentLoaded', function () {
    // Referencias a los controles del formulario
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

    // Controles de imagen
    const Botonsubirimagen = document.getElementById('botonSubirImagen');
    const Textobotonsubirimagen = document.getElementById('textoBotonSubirImagen');
    const Iconobotonsubir = document.getElementById('iconoBotonSubir');
    const Botoneliminarimagen = document.getElementById('botonEliminarImagen');
    const Botoneliminarimagenflotante = document.getElementById('botonEliminarImagenFlotante');
    const Cajaprevisualizacion = document.getElementById('cajaPrevisualizacion');
    const Archivocargado = document.getElementById('archivoImagen');
    const Imagenprevia = document.getElementById('imagenPrevia');
    const Textonombrearchivo = document.getElementById('nombreArchivoMuestra');

    // Botones de acción y estado
    const Botonguardar = document.getElementById('botonGuardar');
    const Botonguardarborrador = document.getElementById('botonGuardarBorrador');
    const Botonvolver = document.getElementById('botonVolver');
    const Botoncancelar = document.getElementById('botonCancelar');
    const Notificacionflotante = document.getElementById('alertaNotificacion');
    const CapaCargando = document.getElementById('capaCargando');
    const ContenedorIndicadorCarga = document.getElementById('contenedorIndicadorCarga');
    const TituloCargando = document.getElementById('tituloCargando');
    const DescripcionCargando = document.getElementById('descripcionCargando');

    // Controles SKU
    const Botongenerarsku = document.getElementById('botonGenerarSku');
    const Insigniamodosku = document.getElementById('insigniaModoSku');
    const Ayudasku = document.getElementById('ayudaSku');
    const Exitosku = document.getElementById('exitoSku');

    // Variables de estado
    let Formularioguardado = false;
    let Idproductoeditar = null;
    let SkuOriginalEditar = '';
    let EstadoOriginalEditar = '';
    let InstantaneaOriginalEditar = null;
    let Imagenenbase = '../img/logo.png';
    let skuModoManual = false;

    // Configuración de categorías y nomenclatura de SKU (Lila Beauty)
    const Nomenclaturacategorias = {
        'Skincare': { prefijo: 'SK', subcategorias: { 'Sérums': 'SER', 'Limpiadores': 'LIM', 'Hidratantes': 'HID', 'Solares': 'SOL' } },
        'Maquillaje': { prefijo: 'MQ', subcategorias: { 'Cara': 'CAR', 'Ojos': 'OJO', 'Labios': 'LAB', 'Cejas': 'CEJ' } },
        'Accesorios': { prefijo: 'AC', subcategorias: { 'Brochas': 'BRO', 'Esponjas': 'ESP', 'Organización': 'ORG' } }
    };

    // Capa de almacenamiento
    const Clavealmacenamiento = 'admincrearproductos';
    const Obtenerlistadoproductos = () => (typeof window.Obtenerlistadoproductos === 'function' ? window.Obtenerlistadoproductos() : JSON.parse(localStorage.getItem(Clavealmacenamiento) || '[]'));
    const Guardarlistadoproductos = (lista) => (typeof window.Guardarlistadoproductos === 'function' ? window.Guardarlistadoproductos(lista) : localStorage.setItem(Clavealmacenamiento, JSON.stringify(lista)));
    const Imprimirlistadojson = () => console.log('Lista de productos JSON:\n', JSON.stringify(Obtenerlistadoproductos(), null, 2));
    Imprimirlistadojson();

    // ==========================================
    // NOTIFICACIONES Y ANIMACIÓN DE CARGA
    // ==========================================
    function Mostrarnotificacion(Mensaje) {
        if (!Notificacionflotante) return;
        Notificacionflotante.textContent = Mensaje;
        Notificacionflotante.classList.add('activa');
        setTimeout(() => Notificacionflotante.classList.remove('activa'), 3500);
    }

    function AlternarBotonesAccion(bloqueado) {
        [Botonguardar, Botonguardarborrador, Botonvolver, Botoncancelar].forEach(btn => {
            if (btn) btn.disabled = bloqueado;
        });
    }

    function MostrarAnimacionCarga(Titulo, Descripcion) {
        if (!CapaCargando) return;
        if (ContenedorIndicadorCarga) ContenedorIndicadorCarga.innerHTML = '<div class="spinner-aguacate"></div>';
        if (TituloCargando) TituloCargando.textContent = Titulo || 'Guardando información...';
        if (DescripcionCargando) DescripcionCargando.textContent = Descripcion || 'Guardando el producto en el almacenamiento local.';
        CapaCargando.classList.remove('d-none');
        setTimeout(() => CapaCargando.classList.add('activa'), 10);
        AlternarBotonesAccion(true);
    }

    function MostrarConfirmacionCarga(Titulo, Descripcion) {
        if (!CapaCargando) return;
        if (ContenedorIndicadorCarga) ContenedorIndicadorCarga.innerHTML = '<span class="material-symbols-outlined icono-exito-cargando">check_circle</span>';
        if (TituloCargando) TituloCargando.textContent = Titulo || '¡Confirmado!';
        if (DescripcionCargando) DescripcionCargando.textContent = Descripcion || 'Operación completada con éxito. Redirigiendo a gestión de productos...';
    }

    function OcultarAnimacionCarga() {
        if (!CapaCargando) return;
        CapaCargando.classList.remove('activa');
        setTimeout(() => CapaCargando.classList.add('d-none'), 250);
        AlternarBotonesAccion(false);
        ActualizarEstadoBotonActualizar();
    }

    // ==========================================
    // GESTIÓN Y CARGA DE IMÁGENES
    // ==========================================
    function Actualizarbotonesimagen(tieneImagen) {
        if (Textobotonsubirimagen) Textobotonsubirimagen.textContent = tieneImagen ? 'Cambiar imagen' : 'Subir imagen';
        if (Iconobotonsubir) Iconobotonsubir.textContent = tieneImagen ? 'sync' : 'upload';
        if (Botoneliminarimagen) {
            Botoneliminarimagen.classList.toggle('d-none', !tieneImagen);
            Botoneliminarimagen.classList.toggle('d-inline-flex', tieneImagen);
        }
        if (Botoneliminarimagenflotante) Botoneliminarimagenflotante.classList.toggle('d-none', !tieneImagen);
    }

    // Optimiza la imagen en memoria para evitar saturar el espacio de LocalStorage
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

                // Comprimir en formato JPEG ligero para LocalStorage
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

    function Cargararchivodeimagen(Archivo) {
        if (!Archivo) return;
        if (!Archivo.type.startsWith('image/')) return Mostrarnotificacion('Selecciona un archivo de imagen válido (JPG, PNG, WebP)');
        if (Archivo.size > 5 * 1024 * 1024) return Mostrarnotificacion('La imagen supera el límite permitido de 5 megas');

        OptimizarImagenParaStorage(Archivo, function (resultadoDataUrl) {
            Imagenenbase = resultadoDataUrl;
            if (Imagenprevia) Imagenprevia.src = Imagenenbase;
            if (Textonombrearchivo) Textonombrearchivo.textContent = Archivo.name;
            Actualizarbotonesimagen(true);
            ActualizarEstadoBotonActualizar();
            Mostrarnotificacion('Imagen cargada con éxito');
        });
    }

    function Eliminarimagenseleccionada(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        Imagenenbase = '../img/logo.png';
        if (Imagenprevia) Imagenprevia.src = Imagenenbase;
        if (Textonombrearchivo) Textonombrearchivo.textContent = 'Haz clic o arrastra para seleccionar una imagen';
        if (Archivocargado) Archivocargado.value = '';
        Actualizarbotonesimagen(false);
        ActualizarEstadoBotonActualizar();
        Mostrarnotificacion('Imagen eliminada correctamente');
    }

    if (Botonsubirimagen && Archivocargado) Botonsubirimagen.addEventListener('click', () => { Archivocargado.value = ''; Archivocargado.click(); });
    if (Archivocargado) Archivocargado.addEventListener('change', (e) => Cargararchivodeimagen(e.target.files && e.target.files[0]));
    if (Botoneliminarimagen) Botoneliminarimagen.addEventListener('click', Eliminarimagenseleccionada);
    if (Botoneliminarimagenflotante) Botoneliminarimagenflotante.addEventListener('click', Eliminarimagenseleccionada);

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
            if (archivo) Cargararchivodeimagen(archivo);
        });
    }

    // ==========================================
    // ESTADO DE EDICIÓN Y DETECCIÓN DE CAMBIOS
    // ==========================================
    function ActualizarTextoBotonGuardar() {
        if (!Botonguardar) return;
        const estadoActual = (Entradaestadopublicacion && Entradaestadopublicacion.value) ? Entradaestadopublicacion.value : EstadoOriginalEditar;
        const texto = (Idproductoeditar && estadoActual !== 'Borrador') ? 'Actualizar registro' : 'Crear registro';
        Botonguardar.innerHTML = `<span class="material-symbols-outlined fs-5">save</span><span>${texto}</span>`;
    }

    function ObtenerInstantaneaFormulario() {
        return {
            nombre: Entradanombre ? Entradanombre.value.trim() : '',
            sku: Entradasku ? Entradasku.value.trim().toUpperCase() : '',
            marca: Entradamarca ? Entradamarca.value.trim() : '',
            categoria: Entradacategoria ? Entradacategoria.value : '',
            subcategoria: Entradasubcategoria ? Entradasubcategoria.value : '',
            descripcion: Entradadescripcion ? Entradadescripcion.value.trim() : '',
            precioHabitual: Entradapreciohabitual ? Entradapreciohabitual.value.trim() : '',
            precioPromocional: Entradapreciopromocional ? Entradapreciopromocional.value.trim() : '',
            stock: Entradastock ? Entradastock.value.trim() : '',
            tamano: Entradatamano ? Entradatamano.value.trim() : '',
            disponibilidad: Entradadisponibilidad ? Entradadisponibilidad.value : '',
            beneficios: Entradabeneficios ? Entradabeneficios.value.trim() : '',
            modoUso: Entradamodouso ? Entradamodouso.value.trim() : '',
            ingredientes: Entradaingredientes ? Entradaingredientes.value.trim() : '',
            precauciones: Entradaprecauciones ? Entradaprecauciones.value.trim() : '',
            estado: Entradaestadopublicacion ? Entradaestadopublicacion.value : '',
            destacado: Boolean(Casilladestacado && Casilladestacado.checked),
            novedades: Boolean(Casillanovedades && Casillanovedades.checked),
            textoAlternativo: Entradatextoalternativo ? Entradatextoalternativo.value.trim() : '',
            imagen: Imagenenbase || ''
        };
    }

    function HayCambiosRespectoAlRegistroOriginal() {
        if (!InstantaneaOriginalEditar) return true;
        const Actual = ObtenerInstantaneaFormulario();
        return Object.keys(InstantaneaOriginalEditar).some(clave => Actual[clave] !== InstantaneaOriginalEditar[clave]);
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

    // ==========================================
    // SISTEMA DE SKU Y SUBCATEGORÍAS
    // ==========================================
    function Actualizarsubcategorias() {
        if (!Entradacategoria || !Entradasubcategoria) return;
        const cat = Entradacategoria.value;
        const datos = Nomenclaturacategorias[cat];
        Entradasubcategoria.innerHTML = '<option value="">Selecciona una subcategoría</option>';
        if (datos) {
            Object.keys(datos.subcategorias).forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                Entradasubcategoria.appendChild(opt);
            });
        }
    }

    function Obtenerprefijobase() {
        const cat = Entradacategoria ? Entradacategoria.value : '';
        const sub = Entradasubcategoria ? Entradasubcategoria.value : '';
        const datos = Nomenclaturacategorias[cat];
        if (!datos) return '';
        return (datos.prefijo || '') + (datos.subcategorias[sub] || '');
    }

    function ObtenerSiguienteSku() {
        const prefijo = Obtenerprefijobase();
        if (!prefijo) return '';
        let maxNumero = 0;
        Obtenerlistadoproductos().forEach(item => {
            const codigo = (item.sku || item.referencia || '').toString().trim().toUpperCase();
            if (codigo.startsWith(prefijo)) {
                const num = parseInt(codigo.slice(prefijo.length), 10);
                if (!isNaN(num) && num > maxNumero) maxNumero = num;
            }
        });
        return prefijo + String(maxNumero + 1).padStart(3, '0');
    }

    function ActualizarSkuUI(esManual) {
        skuModoManual = esManual;
        if (!Insigniamodosku) return;
        Insigniamodosku.textContent = esManual ? 'Manual' : 'Automático';
        Insigniamodosku.classList.toggle('modo-manual', esManual);
        Insigniamodosku.title = esManual ? 'Haz clic para autogenerar consecutivo' : 'Modo automático activo';
        if (Ayudasku) Ayudasku.textContent = esManual ? 'Escribe los números para completar el código (8 a 12 caracteres).' : 'Permitido de 8 a 12 caracteres: 5 letras seguidas de 3 a 7 números.';
    }

    function Validarskuentiempreal() {
        if (!Entradasku) return true;
        const errorSku = document.getElementById('errorSku');
        const valor = Entradasku.value.trim().toUpperCase();
        if (Exitosku) Exitosku.style.display = 'none';

        if (!valor) return Marcarerror(Entradasku, errorSku, 'El código de referencia es obligatorio'), false;
        if (valor.length < 5 || !/^[A-Z]{5}/.test(valor)) return Marcarerror(Entradasku, errorSku, 'El código debe iniciar con exactamente 5 letras mayúsculas'), false;
        if (valor.length < 8) return Marcarerror(Entradasku, errorSku, `Completa al menos ${8 - valor.length} número(s) más para alcanzar el mínimo de 8 caracteres`), false;
        if (!/^[A-Z]{5}[0-9]{3,7}$/.test(valor)) return Marcarerror(Entradasku, errorSku, 'Estructura inválida: 5 letras seguidas de 3 a 7 números'), false;

        const duplicado = Obtenerlistadoproductos().some(item => {
            const itemSku = String(item.sku || '').trim().toUpperCase();
            const itemId = String(item.id || '').trim();
            if (Idproductoeditar && (itemId === String(Idproductoeditar) || itemId.replace('PROD-', '') === String(Idproductoeditar).replace('PROD-', ''))) return false;
            if (SkuOriginalEditar && itemSku === SkuOriginalEditar) return false;
            return itemSku === valor;
        });

        if (duplicado) return Marcarerror(Entradasku, errorSku, 'Este código de referencia ya fue registrado antes'), false;

        Limpiarerror(Entradasku, errorSku);
        if (Exitosku) { Exitosku.textContent = 'Código disponible para usar'; Exitosku.style.display = 'block'; }
        return true;
    }

    function GenerarYAsignarSkuAuto() {
        if (!Entradasku) return;
        skuModoManual = false;
        const nuevoSku = ObtenerSiguienteSku();
        if (!nuevoSku) return Mostrarnotificacion('Primero selecciona una categoría y subcategoría');
        Entradasku.value = nuevoSku;
        ActualizarSkuUI(false);
        Validarskuentiempreal();
        ActualizarEstadoBotonActualizar();
    }

    function Aplicarprefijoalsku() {
        if (!Entradasku) return;
        const prefijo = Obtenerprefijobase();
        Entradasku.value = prefijo;
        Limpiarerror(Entradasku, document.getElementById('errorSku'));
        if (Exitosku) Exitosku.style.display = 'none';
        if (prefijo) Entradasku.focus();
        ActualizarEstadoBotonActualizar();
    }

    function Filtrarsku(textoCrudo) {
        const texto = (textoCrudo || '').toUpperCase();
        let res = '';
        for (const char of texto) {
            if (res.length < 5 && /[A-Z]/.test(char)) res += char;
            else if (res.length >= 5 && res.length < 12 && /[0-9]/.test(char)) res += char;
        }
        return res;
    }

    if (Entradasku) {
        Entradasku.addEventListener('input', function () {
            this.value = Filtrarsku(this.value);
            ActualizarSkuUI(true);
            Validarskuentiempreal();
        });
        Entradasku.addEventListener('blur', Validarskuentiempreal);
    }

    if (Entradacategoria) Entradacategoria.addEventListener('change', () => { Actualizarsubcategorias(); Aplicarprefijoalsku(); });
    if (Entradasubcategoria) Entradasubcategoria.addEventListener('change', Aplicarprefijoalsku);
    if (Botongenerarsku) Botongenerarsku.addEventListener('click', () => { GenerarYAsignarSkuAuto(); Entradasku && Entradasku.focus(); });
    if (Insigniamodosku) Insigniamodosku.addEventListener('click', () => { GenerarYAsignarSkuAuto(); Entradasku && Entradasku.focus(); });

    // ==========================================
    // CARGAR PRODUCTO EXISTENTE / BORRADOR
    // ==========================================
    async function Cargardatosproductoexistente() {
        const params = new URLSearchParams(window.location.search);
        const idBuscado = (params.get('id') || '').trim();
        const skuBuscado = (params.get('sku') || '').trim().toUpperCase();

        if (!idBuscado && !skuBuscado) {
            Actualizarsubcategorias();
            if (Entradasku) Entradasku.value = '';
            ActualizarTextoBotonGuardar();
            ActualizarEstadoBotonActualizar();
            return;
        }

        const listado = Obtenerlistadoproductos();
        const coincide = (item) => {
            const itemId = String(item.id || '').trim();
            const itemSku = String(item.sku || '').trim().toUpperCase();
            return (idBuscado && (itemId === idBuscado || itemId.replace('PROD-', '') === idBuscado.replace('PROD-', ''))) ||
                   (skuBuscado && itemSku === skuBuscado) ||
                   (idBuscado && itemSku === idBuscado.toUpperCase());
        };

        let encontrado = listado.find(coincide);



        if (!encontrado) {
            Actualizarsubcategorias();
            if (Entradasku) Entradasku.value = '';
            ActualizarTextoBotonGuardar();
            ActualizarEstadoBotonActualizar();
            return;
        }

        Idproductoeditar = encontrado.id;
        SkuOriginalEditar = (encontrado.sku || encontrado.referencia || '').toString().trim().toUpperCase();
        EstadoOriginalEditar = encontrado.estado || 'Publicado';

        // Mapeo automático de campos
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
            precauciones: Entradaprecauciones,
            textoalternativo: Entradatextoalternativo
        };

        if (Entradacategoria) {
            Entradacategoria.value = encontrado.categoria || '';
            Actualizarsubcategorias();
        }

        Object.entries(camposMapeo).forEach(([k, input]) => {
            if (input && encontrado[k] !== undefined && encontrado[k] !== null) input.value = encontrado[k];
        });

        if (Entradapreciopromocional) Entradapreciopromocional.value = encontrado.preciopromocional || encontrado.precioPromocional || '';
        if (Entradamodouso) Entradamodouso.value = encontrado.modouso || encontrado.modoUso || '';
        if (Entradatextoalternativo) Entradatextoalternativo.value = encontrado.textoalternativo || encontrado.textoAlternativo || '';
        if (Entradaestadopublicacion) Entradaestadopublicacion.value = EstadoOriginalEditar;
        if (Casilladestacado) Casilladestacado.checked = Boolean(encontrado.destacado);
        if (Casillanovedades) Casillanovedades.checked = encontrado.novedades !== undefined ? Boolean(encontrado.novedades) : true;

        if (Entradasku) {
            Entradasku.value = SkuOriginalEditar;
            Validarskuentiempreal();
        }

        // Cargar vista previa de imagen
        const urlFoto = encontrado.imagen || encontrado.imagenUrl;
        if (urlFoto && urlFoto !== '../img/logo.png') {
            Imagenenbase = typeof NormalizarUrlImagen === 'function' ? NormalizarUrlImagen(urlFoto) : urlFoto;
            if (Imagenprevia) {
                Imagenprevia.src = Imagenenbase;
                Imagenprevia.onerror = function () {
                    this.src = '../img/logo.png';
                };
            }
            if (Textonombrearchivo) Textonombrearchivo.textContent = 'Imagen guardada';
            Actualizarbotonesimagen(true);
        } else {
            Actualizarbotonesimagen(false);
        }

        const textoTitulo = encontrado.estado === 'Borrador' ? 'Editar borrador' : 'Editar producto';
        const tituloVista = document.querySelector('.titulo-vista');
        const rutaMigas = document.querySelector('.ruta-migas');
        const insigniaEstado = document.querySelector('.insignia-estado');
        if (tituloVista) tituloVista.textContent = textoTitulo;
        if (rutaMigas) rutaMigas.textContent = 'Administración / Gestión productos / ' + textoTitulo;
        if (insigniaEstado) insigniaEstado.textContent = 'EDICIÓN · ' + (encontrado.estado === 'Borrador' ? 'BORRADOR' : 'PUBLICADO');

        InstantaneaOriginalEditar = ObtenerInstantaneaFormulario();
        ActualizarTextoBotonGuardar();
        ActualizarEstadoBotonActualizar();
    }

    Cargardatosproductoexistente();

    // ==========================================
    // VALIDACIONES Y CONTROL NUMÉRICO
    // ==========================================
    function Configurarcasillanumerica(Entrada) {
        if (!Entrada) return;
        Entrada.addEventListener('input', function () { this.value = this.value.replace(/[^0-9]/g, ''); });
        Entrada.addEventListener('wheel', (e) => e.preventDefault());
        Entrada.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); });
    }
    [Entradapreciohabitual, Entradapreciopromocional, Entradastock].forEach(Configurarcasillanumerica);

    function Limpiarerror(campo, elemError) {
        if (campo) campo.classList.remove('entrada-invalida');
        if (elemError) elemError.classList.remove('visible');
    }

    function Marcarerror(campo, elemError, mensaje) {
        if (campo) campo.classList.add('entrada-invalida');
        if (elemError) {
            if (mensaje) elemError.textContent = mensaje;
            elemError.classList.add('visible');
        }
    }

    function Validardatos() {
        let valido = true;
        const v = (invalido, campo, elemError, mensaje) => {
            if (invalido) { Marcarerror(campo, elemError, mensaje); valido = false; }
            else Limpiarerror(campo, elemError);
        };

        v(!Entradanombre.value.trim(), Entradanombre, document.getElementById('errorNombre'), 'Por favor ingresa el nombre del producto');
        if (!Validarskuentiempreal()) valido = false;
        v(!Entradadescripcion.value.trim(), Entradadescripcion, document.getElementById('errorDescripcion'), 'Por favor escribe una descripción corta');

        const precio = parseFloat(Entradapreciohabitual.value);
        v(isNaN(precio) || precio <= 0, Entradapreciohabitual, document.getElementById('errorPrecio'), 'El precio debe ser un número en pesos mayor a cero');

        const stock = parseInt(Entradastock.value, 10);
        v(isNaN(stock) || stock < 0, Entradastock, document.getElementById('errorStock'), 'El stock debe ser un número entero mayor o igual a cero');

        if (!Entradacategoria.value) { Entradacategoria.classList.add('entrada-invalida'); valido = false; }
        else Entradacategoria.classList.remove('entrada-invalida');

        if (!Entradatextoalternativo.value.trim()) Entradatextoalternativo.value = Entradanombre.value.trim() || 'Imagen del producto';
        Entradatextoalternativo.classList.remove('entrada-invalida');

        return valido;
    }

    // ==========================================
    // ENVÍO DEL FORMULARIO Y BORRADORES
    // ==========================================
    function ConstruirProductoFormulario(esBorradorManual) {
        const skuIngresado = Entradasku ? Entradasku.value.trim().toUpperCase() : '';
        const skuGenerado = skuIngresado || ObtenerSiguienteSku() || ('BORR' + String(Date.now()).slice(-5));
        const estadoFinal = esBorradorManual ? 'Borrador' : ((Entradaestadopublicacion && Entradaestadopublicacion.value) ? Entradaestadopublicacion.value : (EstadoOriginalEditar || 'Publicado'));

        return {
            id: Idproductoeditar || Date.now(),
            nombre: (Entradanombre && Entradanombre.value.trim()) ? Entradanombre.value.trim() : (esBorradorManual ? 'Borrador sin título' : ''),
            sku: skuGenerado,
            referencia: skuGenerado,
            marca: (Entradamarca && Entradamarca.value.trim()) ? Entradamarca.value.trim() : 'Aguacate Make Up',
            categoria: (Entradacategoria && Entradacategoria.value) ? Entradacategoria.value : (esBorradorManual ? 'Sin categoría' : ''),
            subcategoria: (Entradasubcategoria && Entradasubcategoria.value) ? Entradasubcategoria.value : '',
            descripcion: (Entradadescripcion && Entradadescripcion.value.trim()) ? Entradadescripcion.value.trim() : (esBorradorManual ? 'Borrador en edición' : ''),
            precio: parseFloat(Entradapreciohabitual.value) || 0,
            preciopromocional: (Entradapreciopromocional && Entradapreciopromocional.value) ? parseFloat(Entradapreciopromocional.value) : null,
            stock: parseInt(Entradastock.value, 10) || 0,
            tamano: Entradatamano ? Entradatamano.value.trim() : '',
            disponibilidad: Entradadisponibilidad ? Entradadisponibilidad.value : 'En stock',
            beneficios: Entradabeneficios ? Entradabeneficios.value.trim() : '',
            modouso: Entradamodouso ? Entradamodouso.value.trim() : '',
            ingredientes: Entradaingredientes ? Entradaingredientes.value.trim() : '',
            precauciones: Entradaprecauciones ? Entradaprecauciones.value.trim() : '',
            imagen: Imagenenbase,
            textoalternativo: Entradatextoalternativo ? Entradatextoalternativo.value.trim() : '',
            estado: estadoFinal,
            destacado: Boolean(Casilladestacado && Casilladestacado.checked),
            novedades: Boolean(Casillanovedades && Casillanovedades.checked),
            fechacreacion: new Date().toISOString()
        };
    }

    function Formulariotienetexto() {
        return Boolean(
            (Entradanombre && Entradanombre.value.trim()) ||
            (Entradasku && Entradasku.value.trim()) ||
            (Entradacategoria && Entradacategoria.value) ||
            (Entradasubcategoria && Entradasubcategoria.value) ||
            (Entradadescripcion && Entradadescripcion.value.trim()) ||
            (Entradapreciohabitual && Entradapreciohabitual.value.trim()) ||
            (Entradastock && Entradastock.value.trim()) ||
            (Imagenenbase && Imagenenbase !== '../img/logo.png')
        );
    }

    if (Formularioproducto) {
        Formularioproducto.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!Validardatos()) {
                Mostrarnotificacion('Por favor revisa los campos en rojo');
                const primerInvalido = Formularioproducto.querySelector('.entrada-invalida');
                if (primerInvalido) {
                    primerInvalido.focus();
                    primerInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            MostrarAnimacionCarga(
                Idproductoeditar ? 'Actualizando registro...' : 'Guardando y publicando...',
                'Guardando la información en el almacenamiento local...'
            );

            const nuevoProducto = ConstruirProductoFormulario(false);
            if (typeof CrearOActualizarProductoInventario === 'function') {
                await CrearOActualizarProductoInventario(nuevoProducto, Boolean(Idproductoeditar));
            } else if (typeof GuardarProductoEnStorage === 'function') {
                GuardarProductoEnStorage(nuevoProducto);
            }

            MostrarConfirmacionCarga(
                '¡Confirmado!',
                Idproductoeditar
                    ? 'Registro actualizado con éxito. Redirigiendo a gestión de productos...'
                    : 'Producto creado y publicado con éxito. Redirigiendo a gestión de productos...'
            );
            Formularioguardado = true;
            setTimeout(() => { window.location.href = 'admin-productos.html'; }, 1200);
        });
    }

    function Guardarborrador(esManual) {
        if (Formularioguardado) return;
        if (!Formulariotienetexto()) {
            if (esManual) Mostrarnotificacion('Escribe al menos un dato antes de guardar como borrador');
            return;
        }

        const borrador = ConstruirProductoFormulario(esManual);
        if (typeof GuardarBorradorInventario === 'function') {
            GuardarBorradorInventario(borrador);
        } else if (typeof GuardarProductoEnStorage === 'function') {
            GuardarProductoEnStorage(borrador);
        }
        Formularioguardado = true;

        if (esManual) {
            MostrarAnimacionCarga('Guardando borrador...', 'Almacenando la información en el inventario local...');
            setTimeout(() => {
                MostrarConfirmacionCarga('¡Confirmado!', 'Borrador guardado con éxito. Redirigiendo a gestión de productos...');
                setTimeout(() => { window.location.href = 'admin-productos.html'; }, 1200);
            }, 500);
        }
    }

    if (Botonguardarborrador) Botonguardarborrador.addEventListener('click', () => Guardarborrador(true));
    window.addEventListener('beforeunload', () => Guardarborrador(false));
    window.addEventListener('pagehide', () => Guardarborrador(false));

    // Botones de redirección directa
    const RedirigirListado = () => { Formularioguardado = true; window.location.href = 'admin-productos.html'; };
    if (Botoncancelar) Botoncancelar.addEventListener('click', RedirigirListado);
    if (Botonvolver) Botonvolver.addEventListener('click', RedirigirListado);
});
