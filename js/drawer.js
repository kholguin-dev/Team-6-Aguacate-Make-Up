// Este archivo conserva su nombre drawer.js y funciona como el controlador visual del carrito lateral desplegable.
// Este se encarga de todo el funcionamiento de abrir el panel del carrito, animar el fondo difuminado, actualizar cantidades y calcular totales.
// Lo que se corrigio en este archivo fue vincular los eventos visuales con el servicio central del carrito para sincronizar la experiencia del usuario.

function obtenerRutaBaseDrawer() {
    const rutaActual = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    if (rutaActual.includes("/vistas/")) {
        return "../";
    }
    return "";
}

// Inyecta el HTML de drawer.html si aún no existe en el documento
function asegurarDrawerInyectado(callback) {
    if (document.getElementById('cart-drawer')) {
        if (typeof callback === 'function') callback();
        return;
    }

    const rutaBase = obtenerRutaBaseDrawer();
    fetch(rutaBase + 'componentes/drawer.html')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar componentes/drawer.html');
            return response.text();
        })
        .then(htmlText => {
            if (!document.getElementById('cart-drawer')) {
                document.body.insertAdjacentHTML('beforeend', htmlText);
            }
            configurarEventosDrawer();
            renderCartDrawer();
            if (typeof callback === 'function') callback();
        })
        .catch(error => {
            console.error('Error al inyectar el drawer del carrito:', error);
        });
}

// Renderiza dinámicamente los productos dentro del Drawer
function renderCartDrawer() {
    const cartDrawer = document.getElementById('cart-drawer');
    if (!cartDrawer) return;

    const bodyDrawer = cartDrawer.querySelector('.cart-drawer-body');
    const precioTotalEl = document.getElementById('cart-total-price');
    const checkoutBtn = cartDrawer.querySelector('.btn-checkout');

    if (!bodyDrawer) return;

    const servicio = window.servicioCarrito || window.servicioscarrito;
    const articulos = servicio && typeof servicio.cargarCarrito === 'function'
        ? servicio.cargarCarrito()
        : [];

    if (!articulos || articulos.length === 0) {
        bodyDrawer.innerHTML = '<p class="cart-empty-msg">Tu carrito está vacío.</p>';
        if (precioTotalEl) precioTotalEl.textContent = '$ 0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let itemsHtml = '<ul class="cart-items-list">';
    articulos.forEach(item => {
        const idItem = item.id || item.sku;
        const nombreItem = item.nombre || item.title || 'Producto';
        const precioUnitario = Number(item.precio || item.price || 0);
        const precioFormateado = servicio ? servicio.formatearPrecio(precioUnitario) : ('$ ' + precioUnitario.toLocaleString('es-CO'));
        const cantidadItem = Number(item.cantidad || item.quantity || 1);
        const imagenUrl = typeof window.NormalizarUrlImagen === 'function'
            ? window.NormalizarUrlImagen(item.imagen)
            : (item.imagen || (obtenerRutaBaseDrawer() + 'img/logo.png'));

        itemsHtml += `
            <li class="cart-item" data-id="${idItem}">
                <img src="${imagenUrl}" alt="${nombreItem}" class="cart-item-img" onerror="this.src='${obtenerRutaBaseDrawer()}img/logo.png'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title" title="${nombreItem}">${nombreItem}</h4>
                    <p class="cart-item-price">${precioFormateado}</p>
                    <div class="cart-item-actions">
                        <div class="cart-qty-control">
                            <button type="button" class="cart-qty-btn btn-qty-disminuir" data-id="${idItem}" aria-label="Disminuir cantidad">-</button>
                            <span class="cart-qty-value">${cantidadItem}</span>
                            <button type="button" class="cart-qty-btn btn-qty-aumentar" data-id="${idItem}" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button type="button" class="cart-item-remove" data-id="${idItem}" title="Eliminar del carrito" aria-label="Eliminar producto">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </div>
            </li>
        `;
    });
    itemsHtml += '</ul>';

    bodyDrawer.innerHTML = itemsHtml;

    if (precioTotalEl && servicio) {
        precioTotalEl.textContent = servicio.formatearPrecio(servicio.obtenerTotal());
    }
}

// Configura los eventos internos del panel lateral
function configurarEventosDrawer() {
    const cartDrawer = document.getElementById('cart-drawer');
    if (!cartDrawer || cartDrawer.dataset.eventosConfigurados) return;
    cartDrawer.dataset.eventosConfigurados = 'true';

    const bodyDrawer = cartDrawer.querySelector('.cart-drawer-body');
    const checkoutBtn = cartDrawer.querySelector('.btn-checkout');

    if (bodyDrawer) {
        bodyDrawer.addEventListener('click', (e) => {
            const btnAumentar = e.target.closest('.btn-qty-aumentar');
            const btnDisminuir = e.target.closest('.btn-qty-disminuir');
            const btnEliminar = e.target.closest('.cart-item-remove');

            const servicio = window.servicioCarrito || window.servicioscarrito;
            if (!servicio) return;

            if (btnAumentar) {
                const id = btnAumentar.getAttribute('data-id');
                const item = servicio.cargarCarrito().find(p => String(p.id) === String(id) || String(p.sku) === String(id));
                const actual = item ? Number(item.cantidad || item.quantity || 1) : 1;
                servicio.actualizarCantidad(id, actual + 1);
                renderCartDrawer();
            } else if (btnDisminuir) {
                const id = btnDisminuir.getAttribute('data-id');
                const item = servicio.cargarCarrito().find(p => String(p.id) === String(id) || String(p.sku) === String(id));
                const actual = item ? Number(item.cantidad || item.quantity || 1) : 1;
                servicio.actualizarCantidad(id, actual - 1);
                renderCartDrawer();
            } else if (btnEliminar) {
                const id = btnEliminar.getAttribute('data-id');
                servicio.eliminarProducto(id);
                renderCartDrawer();
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const servicio = window.servicioCarrito || window.servicioscarrito;
            const articulos = servicio ? servicio.cargarCarrito() : [];
            if (articulos.length === 0) return;

            const total = servicio ? servicio.formatearPrecio(servicio.obtenerTotal()) : '';
            alert(`¡Gracias por tu compra!\nTotal del pedido: ${total}\nPronto nos pondremos en contacto contigo para coordinar el envío.`);
            if (servicio) servicio.vaciarCarrito();
            window.closeCart();
        });
    }
}

// Métodos globales accesibles desde cualquier script
window.openCart = () => {
    asegurarDrawerInyectado(() => {
        const cartDrawer = document.getElementById('cart-drawer');
        const cartOverlay = document.getElementById('cart-overlay');

        if (cartDrawer && cartOverlay) {
            renderCartDrawer();
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    });
};

window.closeCart = () => {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.renderCartDrawer = renderCartDrawer;

// Escuchar actualizaciones del carrito de compras para re-renderizar
window.addEventListener('aguacate:cart-updated', renderCartDrawer);
window.addEventListener('trendy:cart-updated', renderCartDrawer);

// Cargar e inyectar el HTML de drawer.html al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    asegurarDrawerInyectado();
});

// Delegación global de clics para la apertura y cierre del carrito
document.addEventListener('click', (e) => {
    const cartBtn = e.target.closest('#enlaceCarrito, .cart-btn-figma, [data-open-cart]');
    const closeBtn = e.target.closest('#close-cart-btn');
    const overlay = e.target.closest('#cart-overlay');

    if (cartBtn) {
        e.preventDefault();
        window.openCart();
    }

    if (closeBtn || overlay) {
        window.closeCart();
    }
});

// Cierre mediante tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeCart();
    }
});


// Cierre mediante tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeCart();
    }
});