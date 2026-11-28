
// Comunicación entre el panel administrativo y back Spring Boot.

const ADMIN_API_URL = "http://localhost:8080/api";
const AdminProductosAPI = {

    async solicitar(endpoint, opciones = {}) {

        // Recuperamos el JWT de la sesión
        const token = localStorage.getItem("tokenJWT");
        // Verificar si existe sesión
        if (!token) {
            throw new Error(
                "No existe una sesión activa. Inicia sesión nuevamente."
            );
        }
        // Configurar los headers de la petición
        const headers = {
            "Authorization": `Bearer ${token}`
        };
        // Si enviamos información en el body, indicamos que es JSON
        if (opciones.body !== undefined) {
            headers["Content-Type"] = "application/json";
        }
        // Realizar petición HTTP al backend
        const respuesta = await fetch(
            `${ADMIN_API_URL}${endpoint}`,
            {
                ...opciones,
                headers: {
                    ...headers,
                    ...opciones.headers
                }
            }
        );
        // Leer la respuesta del backend
        const datos = await respuesta.json().catch(() => null);
        // Manejar errores HTTP
        if (!respuesta.ok) {
            // Error: usuario no autenticado
            if (respuesta.status === 401) {
                throw new Error(
                    "Tu sesión expiró. Inicia sesión nuevamente."
                );
            }
            // Error: usuario sin permisos
            if (respuesta.status === 403) {
                throw new Error(
                    "No tienes permisos para realizar esta operación."
                );
            }
            // Recuperar mensaje enviado por el backend
            const mensajeBackend =
                datos?.message ||
                datos?.mensaje ||
                datos?.error;
            // Lanzar error HTTP
            throw new Error(
                mensajeBackend ||
                `Error HTTP ${respuesta.status} en la petición.`
            );
        }
        // Devolver respuesta del backend
        return datos;
    },

    // Crear Producto
    async crearProducto(producto) {

        // Realizar petición HTTP POST
        return await this.solicitar(
            "/productos",
            {
                method: "POST",
                body: JSON.stringify(producto)
            }
        );
    },
    //Consultar todos los productos
    async obtenerProductos() {

        // Realizar petición HTTP GET
        return await this.solicitar(
            "/productos",
            {
                method: "GET"
            }
        );
    },
    //Consultar prod por id
        async obtenerProductoPorId(id) {

        // Realizar petición HTTP GET
        return await this.solicitar(
            `/productos/${id}`,
            {
                method: "GET"
            }
        );
    },
    //Actualizar producto por id
        async actualizarProducto(id, producto) {

        // Realizar petición HTTP PUT
        return await this.solicitar(
            `/productos/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(producto)
            }
        );
    },
    //Eliminar producto
        async eliminarProducto(id) {
        // Realizar petición HTTP DELETE
        return await this.solicitar(
            `/productos/${id}`,
            {
                method: "DELETE"
            }
        );
    }

};

//Hacer disponible el servicio
window.AdminProductosAPI = AdminProductosAPI;