document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("header-admin-container");

    if (!contenedor) {
        console.error("No se encontró el contenedor del header administrativo.");
        return;
    }

    try {
        const respuesta = await fetch("../componentes/header_admin.html");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar header_admin.html");
        }

        contenedor.innerHTML = await respuesta.text();
    } catch (error) {
        console.error("Error al cargar el header administrativo:", error);
    }
});

