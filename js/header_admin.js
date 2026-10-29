document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("header-admin-container") || document.getElementById("header-container");

    if (!contenedor) {
        return;
    }

    try {
        const respuesta = await fetch("../componentes/header_admin.html");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar header_admin.html");
        }

        contenedor.innerHTML = await respuesta.text();

        // Ajustar dinámicamente las migas de pan según la página actual
        const migasEl = contenedor.querySelector(".ruta-migas");
        if (migasEl) {
            const rutaActual = window.location.pathname.toLowerCase();
            if (rutaActual.includes("admincrearproductos")) {
                migasEl.textContent = "Administración / Gestión productos / Crear productos";
            } else if (rutaActual.includes("admin-productos")) {
                migasEl.textContent = "Administración / Gestión productos / Lista de productos";
            }
        }
    } catch (error) {
        console.error("Error al cargar el header administrativo:", error);
    }
});
