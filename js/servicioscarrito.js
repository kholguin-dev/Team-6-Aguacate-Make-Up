// Este archivo conserva su nombre servicioscarrito.js y funciona como la capa de logica del carrito de compras.
// Este se encarga de todo el funcionamiento de agregar productos, modificar cantidades, persistir el carrito y formatear precios en pesos colombianos.
// Lo que se corrigio en este archivo fue asegurar la compatibilidad con las claves de almacenamiento y la normalizacion de productos para evitar duplicidades.


const servicioCarrito = {
    // Nombres de las claves para guardar los datos en el navegador
    clavePrimaria: 'aguacate_cart',
    claveSecundaria: 'carrito de compras',

    // Acomodamos los datos del producto para que siempre tengan los mismos campos
    normalizarProducto: function (producto) {
        if (!producto) return null;

        // Sacamos el id y el sku, o usamos la fecha actual si no vienen
        const idTexto = String(producto.id || producto.sku || producto.identificador || Date.now()).trim();
        const skuTexto = String(producto.sku || producto.referencia || idTexto).trim().toUpperCase();
        const nombreFinal = String(producto.nombre || producto.title || 'Producto Aguacate Make Up').trim();

        // Si tiene descuento usamos el precio en promoción, si no dejamos el precio normal
        const precioPromo = Number(producto.preciopromocional !== undefined ? producto.preciopromocional : producto.precioPromocional);
        const precioBase = Number(producto.precio !== undefined ? producto.precio : (producto.price !== undefined ? producto.price : 0));
        const precioFinal = (!isNaN(precioPromo) && precioPromo > 0) ? precioPromo : (isNaN(precioBase) ? 0 : precioBase);

        // Si no trae imagen le ponemos el logo por defecto
        const imagenFinal = String(producto.imagen || producto.thumbnail || (Array.isArray(producto.images) ? producto.images[0] : '') || '../img/logo.png').trim();
        const cantidadNumero = Math.max(1, parseInt(producto.cantidad || producto.quantity || 1, 10) || 1);
        const stockDisponible = producto.stock !== undefined ? parseInt(producto.stock, 10) : null;

        return {
            id: idTexto,
            identificador: idTexto,
            sku: skuTexto,
            nombre: nombreFinal,
            title: nombreFinal,
            precio: precioFinal,
            price: precioFinal,
            precioOriginal: precioBase > precioFinal ? precioBase : null,
            imagen: imagenFinal,
            thumbnail: imagenFinal,
            cantidad: cantidadNumero,
            quantity: cantidadNumero,
            stock: stockDisponible,
            categoria: producto.categoria || producto.category || '',
            marca: producto.marca || 'Aguacate Make Up'
        };
    },

    // Traemos los productos guardados en el LocalStorage
    cargarCarrito: function () {
        try {
            // Intentamos leer la primera clave
            const datoPrimario = localStorage.getItem(servicioCarrito.clavePrimaria);
            if (datoPrimario) {
                const parseado = JSON.parse(datoPrimario);
                if (Array.isArray(parseado)) {
                    return parseado.map(servicioCarrito.normalizarProducto).filter(Boolean);
                }
            }

            // Si no está, revisamos la segunda clave por si acaso
            const datoSecundario = localStorage.getItem(servicioCarrito.claveSecundaria);
            if (datoSecundario) {
                const parseadoSecundario = JSON.parse(datoSecundario);
                if (Array.isArray(parseadoSecundario)) {
                    return parseadoSecundario.map(servicioCarrito.normalizarProducto).filter(Boolean);
                }
            }

            // Si no hay nada guardado devolvemos la lista vacía
            return [];
        } catch (error) {
            console.error('Error al leer el carrito de LocalStorage:', error);
            return [];
        }
    },

    // Guardamos la lista en el LocalStorage y avisamos a la página
    guardarCarrito: function (articulos) {
        try {
            const articulosValidos = (Array.isArray(articulos) ? articulos : [])
                .map(servicioCarrito.normalizarProducto)
                .filter(Boolean);

            const cadenaJson = JSON.stringify(articulosValidos);
            localStorage.setItem(servicioCarrito.clavePrimaria, cadenaJson);
            localStorage.setItem(servicioCarrito.claveSecundaria, cadenaJson);

            // Actualizamos el contador del header
            servicioCarrito.notificarCambio();
            return true;
        } catch (error) {
            console.error('Error al guardar el carrito en LocalStorage:', error);
            return false;
        }
    },

    // Avisa a los demás componentes y al header que el carrito cambió
    notificarCambio: function () {
        const totalConteo = servicioCarrito.obtenerConteo();
        const totalMonto = servicioCarrito.obtenerTotal();

        // Lanzamos eventos para que otras partes de la página se enteren
        window.dispatchEvent(new CustomEvent('aguacate:cart-updated', {
            detail: { count: totalConteo, total: totalMonto }
        }));

        window.dispatchEvent(new CustomEvent('trendy:cart-updated', {
            detail: { count: totalConteo, total: totalMonto }
        }));

        // Si existe la función del header, le pasamos el nuevo número
        if (typeof window.actualizarContadorCarrito === 'function') {
            window.actualizarContadorCarrito(totalConteo);
        } else {
            const elementoBadge = document.getElementById('contadorCarrito') || document.getElementById('header-cart-count');
            if (elementoBadge) {
                elementoBadge.textContent = totalConteo;
            }
        }
    },

    // Añade un producto al carrito o le suma 1 a la cantidad si ya estaba
    agregarProducto: function (producto, cantidadAAgregar) {
        if (!producto) return [];

        const incremento = Math.max(1, parseInt(cantidadAAgregar || 1, 10) || 1);
        const normalizado = servicioCarrito.normalizarProducto(producto);
        const articulos = servicioCarrito.cargarCarrito();

        // Buscamos si el producto ya existe en la lista
        const indice = articulos.findIndex(function (item) {
            return String(item.id) === String(normalizado.id) ||
                (normalizado.sku && String(item.sku).toUpperCase() === String(normalizado.sku).toUpperCase());
        });

        if (indice >= 0) {
            // Si ya está, solo sumamos la cantidad
            const cantidadExistente = Number(articulos[indice].cantidad || articulos[indice].quantity) || 1;
            let nuevaCantidad = cantidadExistente + incremento;

            // No dejamos pasar del stock si está definido
            if (articulos[indice].stock !== null && articulos[indice].stock !== undefined && nuevaCantidad > articulos[indice].stock) {
                nuevaCantidad = articulos[indice].stock;
                console.warn('Cantidad ajustada al stock máximo disponible:', articulos[indice].stock);
            }

            articulos[indice].cantidad = nuevaCantidad;
            articulos[indice].quantity = nuevaCantidad;
        } else {
            // Si no está, lo agregamos como nuevo
            normalizado.cantidad = incremento;
            normalizado.quantity = incremento;
            articulos.push(normalizado);
        }

        servicioCarrito.guardarCarrito(articulos);
        return articulos;
    },

    // Quita un producto buscando por su id o sku
    eliminarProducto: function (identificador) {
        if (!identificador && identificador !== 0) return servicioCarrito.cargarCarrito();

        const idTexto = String(identificador).trim().toUpperCase();
        const articulos = servicioCarrito.cargarCarrito();

        // Filtramos para dejar todos menos el que queremos borrar
        const filtrados = articulos.filter(function (item) {
            const pid = String(item.id || '').trim().toUpperCase();
            const psku = String(item.sku || '').trim().toUpperCase();
            return !(pid === idTexto || psku === idTexto);
        });

        servicioCarrito.guardarCarrito(filtrados);
        return filtrados;
    },

    // Cambia la cantidad de un producto; si queda en 0 o menos, lo borra
    actualizarCantidad: function (identificador, nuevaCantidad) {
        const cantidadNumerica = parseInt(nuevaCantidad, 10);
        if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
            return servicioCarrito.eliminarProducto(identificador);
        }

        const idTexto = String(identificador).trim().toUpperCase();
        const articulos = servicioCarrito.cargarCarrito();

        articulos.forEach(function (item) {
            const pid = String(item.id || '').trim().toUpperCase();
            const psku = String(item.sku || '').trim().toUpperCase();
            if (pid === idTexto || psku === idTexto) {
                let finalCantidad = cantidadNumerica;
                if (item.stock !== null && item.stock !== undefined && finalCantidad > item.stock) {
                    finalCantidad = item.stock;
                }
                item.cantidad = finalCantidad;
                item.quantity = finalCantidad;
            }
        });

        servicioCarrito.guardarCarrito(articulos);
        return articulos;
    },

    // Borra todo lo que haya en el carrito
    vaciarCarrito: function () {
        servicioCarrito.guardarCarrito([]);
        return [];
    },

    // Suma el precio por la cantidad de cada producto para sacar el total
    obtenerTotal: function () {
        const articulos = servicioCarrito.cargarCarrito();
        return articulos.reduce(function (acumulado, item) {
            const precioActual = Number(item.precio !== undefined ? item.precio : item.price) || 0;
            const cantidadActual = Number(item.cantidad !== undefined ? item.cantidad : item.quantity) || 1;
            return acumulado + (precioActual * cantidadActual);
        }, 0);
    },

    // Cuenta cuántos artículos en total lleva la persona
    obtenerConteo: function () {
        const articulos = servicioCarrito.cargarCarrito();
        return articulos.reduce(function (acumulado, item) {
            return acumulado + (Number(item.cantidad || item.quantity) || 1);
        }, 0);
    },

    // Convierte números a formato de pesos colombianos
    formatearPrecio: function (monto) {
        return '$ ' + Number(monto || 0).toLocaleString('es-CO');
    },

    // Arma un resumen con los totales y si el carrito está vacío o no
    obtenerResumen: function () {
        const articulos = servicioCarrito.cargarCarrito();
        const total = servicioCarrito.obtenerTotal();
        const conteo = servicioCarrito.obtenerConteo();

        return {
            items: articulos,
            conteo: conteo,
            total: total,
            subtotal: total,
            totalFormateado: servicioCarrito.formatearPrecio(total),
            subtotalFormateado: servicioCarrito.formatearPrecio(total),
            estaVacio: articulos.length === 0
        };
    }
};

// Dejamos nombres alternativos para que funcione con cualquier estilo de código
servicioCarrito['clave almacenamiento'] = servicioCarrito.clavePrimaria;
servicioCarrito['cargar carrito'] = servicioCarrito.cargarCarrito;
servicioCarrito['guardar carrito'] = servicioCarrito.guardarCarrito;
servicioCarrito['agregar producto'] = servicioCarrito.agregarProducto;
servicioCarrito['eliminar producto'] = servicioCarrito.eliminarProducto;
servicioCarrito['actualizar cantidad'] = servicioCarrito.actualizarCantidad;
servicioCarrito['vaciar carrito'] = servicioCarrito.vaciarCarrito;
servicioCarrito['obtener total'] = servicioCarrito.obtenerTotal;
servicioCarrito['obtener conteo'] = servicioCarrito.obtenerConteo;
servicioCarrito['formatear precio'] = servicioCarrito.formatearPrecio;
servicioCarrito['obtener resumen'] = servicioCarrito.obtenerResumen;

// Lo dejamos disponible en window para usarlo desde cualquier script
if (typeof window !== 'undefined') {
    window.servicioscarrito = servicioCarrito;
    window.servicioCarrito = servicioCarrito;
    window.cartService = servicioCarrito;
    window['servicio carrito'] = servicioCarrito;

    // Al cargar la página actualizamos de una vez el contador del header
    document.addEventListener('DOMContentLoaded', function () {
        servicioCarrito.notificarCambio();
    });
}
