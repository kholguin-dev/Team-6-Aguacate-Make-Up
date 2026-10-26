document.addEventListener("DOMContentLoaded",()=>{
    const CLAVE_PRODUCTOS = "admincrearproductos";
    const contenedorProductos = 
    document.querySelector("[data-product-grid]");
    const mensajeVacio=
    document.querySelector("[data-catalog-empty]");
    const contadorResultados =
    document.querySelector("[data-catalog-results]");


    function obtenerProductosGuardados(){
        try{
            const datos = localStorage.getItem(CLAVE_PRODUCTOS);
            const productos = datos ? JSON.parse(datos) : [];
            return Array.isArray(productos) ? productos : [];
        }
        catch (error){
            console.error(
                "Error al recuperar los productos:",
                error
            );
            return [];
        }
    }
const productosGuardados = obtenerProductosGuardados();
console.log("productos recuperados:", productosGuardados);
console.log(
    "cantidad de productos:",
    productosGuardados.length
);
});

