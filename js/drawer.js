// Métodos globales accesibles desde cualquier script (por ejemplo, al añadir productos)
window.openCart = () => {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');

  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
  }
};

window.closeCart = () => {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');

  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
  }
};

// Cargar e inyectar el HTML de drawer.html al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  fetch('drawer.html')
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar drawer.html');
      return response.text();
    })
    .then(htmlText => {
      document.body.insertAdjacentHTML('beforeend', htmlText);
    })
    .catch(error => console.error('Error al inyectar el drawer:', error));
});

// Delegación global de clics para la apertura y cierre del carrito
document.addEventListener('click', (e) => {
  const cartBtn = e.target.closest('#enlaceCarrito');
  const closeBtn = e.target.closest('#close-cart-btn');
  const overlay = e.target.closest('#cart-overlay');

  if (cartBtn) {
    e.preventDefault(); // Evita el salto de página en el enlace
    window.openCart();
  }

  if (closeBtn || overlay) {
    window.closeCart();
  }
});