// Comunicación entre el panel administrativo y back Spring Boot.

const ADMIN_API_URL = "http://localhost:8080/api";

const AdminProductosAPI = {

    // CREAR PRODUCTO

    async crearProducto(producto) {
        // Recuperamos el JWT de la sesión
        const token = localStorage.getItem("tokenJWT");
        // Verificar si existe sesión
        if (!token) {
            throw new Error(
                "No existe una sesión activa. Inicia sesión nuevamente."
            );
        }
        // Realizar petición HTTP POST
        const respuesta = await fetch(
            `${ADMIN_API_URL}/productos`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(producto)
            }
        );
        // Leer respuesta del backend
        const datos = await respuesta.json().catch(() => null);
        // Manejar errores HTTP
        if (!respuesta.ok) {
            if (respuesta.status === 401) {
                throw new Error(
                    "Tu sesión expiró. Inicia sesión nuevamente."
                );
            }
            if (respuesta.status === 403) {
                throw new Error(
                    "No tienes permisos para crear productos."
                );
            }
            const mensajeBackend =
                datos?.message ||
                datos?.mensaje ||
                datos?.error;

            throw new Error(
                mensajeBackend ||
                `Error HTTP ${respuesta.status} al crear producto.`
            );
        }
        // Devolver el producto creado por el backend
        return datos;
    }
};

// Hacer disponible el servicio globalmente
window.AdminProductosAPI = AdminProductosAPI;