
document.addEventListener("DOMContentLoaded",()=>{
    const CLAVE_PRODUCTOS = "admincrearproductos";
    const contenedorProductos =
        document.querySelector("[data-product-grid]");
    const mensajeVacio =
        document.querySelector("[data-catalog-empty]");
    const contadorResultados =
        document.querySelector("[data-catalog-results]");
    const listaCategorias =
        document.querySelector("[data-category-list]");
    const casillaTodasCategorias =
        document.querySelector("#category-all");
    const entradaPrecioMinimo =
        document.querySelector("#price-min");
    const entradaPrecioMaximo =
        document.querySelector("#price-max");
    const filtroStock =
        document.querySelector("#filter-stock");

    const filtroOfertas =
        document.querySelector("#filter-offers");

    const formularioFiltros =
        document.querySelector("[data-catalog-filters]");

    const selectorOrden =
        document.querySelector("#sort-products");


    // recuperar los productos

    function obtenerProductosGuardados(){
        try{
            const datos = localStorage.getItem(CLAVE_PRODUCTOS);
            const productos = datos ? JSON.parse(datos) : [];

            return Array.isArray(productos) ? productos : [];
        }
        catch(error){
            console.error("Error al recuperar los productos:",error);
            return [];
        }
    }

    const productosGuardados = obtenerProductosGuardados();

    console.log("productos recuperados:",productosGuardados);
    console.log("cantidad de productos:",productosGuardados.length);


    // filtrar los productos publicados

    function obtenerProductosPublicados(listaProductos){
        return listaProductos.filter((producto)=>{
            return !producto.estado ||
                String(producto.estado).toLowerCase() === "publicado";
        });
    }

    const productosPublicados =
        obtenerProductosPublicados(productosGuardados);


    // mostrar los productos

  
    // mostrar los productos

    function mostrarProductos(listaProductos){
        if(!contenedorProductos){
            return;
        }

        contenedorProductos.innerHTML = "";

        listaProductos.forEach((producto)=>{
            const tarjeta = document.createElement("div");
            tarjeta.className = "card h-100";

            const imagen = document.createElement("img");
            imagen.src = producto.imagen || "../img/logo.png";
            imagen.alt = producto.textoalternativo || producto.nombre || "Producto";
            imagen.className = "card-img-top";

            imagen.addEventListener("error",()=>{
                imagen.src = "../img/logo.png";
            },{once:true});

            const contenido = document.createElement("div");
            contenido.className = "card-body";

            const nombre = document.createElement("h5");
            nombre.className = "card-title";
            nombre.textContent = producto.nombre || "Producto sin nombre";

            const categoria = document.createElement("p");
            categoria.textContent = producto.categoria || "Sin categoría";

            const descripcion = document.createElement("p");
            descripcion.textContent = producto.descripcion || "";

            const precio = document.createElement("p");
            precio.className = "fw-bold";

            const precioHabitual = Number(producto.precio) || 0;
            const precioPromocional =
                Number(producto.preciopromocional) || 0;

            if(
                precioPromocional > 0 &&
                precioPromocional < precioHabitual
            ){
                precio.textContent =
                    precioPromocional.toLocaleString("es-CO",{
                        style:"currency",
                        currency:"COP",
                        maximumFractionDigits:0
                    });
            }else{
                precio.textContent =
                    precioHabitual.toLocaleString("es-CO",{
                        style:"currency",
                        currency:"COP",
                        maximumFractionDigits:0
                    });
            }

            // boton del carrito

            const botonCarrito = document.createElement("button");
            botonCarrito.className = "btn btn-primary w-100";
            botonCarrito.type = "button";

            botonCarrito.innerHTML =
                '<i class="bi bi-cart-plus"></i> Agregar al carrito';

            if(Number(producto.stock) <= 0){
                botonCarrito.disabled = true;
                botonCarrito.textContent = "Sin existencias";
            }

            botonCarrito.addEventListener("click",()=>{
                if(!window.servicioCarrito){
                    alert("No se pudo conectar con el carrito. Intenta nuevamente.");
                    console.error("No se encontró el servicio del carrito");
                    return;
                }

                if(Number(producto.stock) <= 0){
                    alert("Este producto no tiene existencias disponibles.");
                    return;
                }

                try{
                    window.servicioCarrito.agregarProducto(producto,1);

                    alert(
                        producto.nombre +
                        " se agregó al carrito correctamente."
                    );
                }catch(error){
                    console.error("Error al agregar al carrito:",error);
                    alert("No se pudo agregar el producto. Intenta nuevamente.");
                }
            });


            contenido.append(
                nombre,
                categoria,
                descripcion,
                precio,
                botonCarrito
            );

            tarjeta.append(imagen,contenido);
            contenedorProductos.appendChild(tarjeta);
        });

        if(contadorResultados){
            contadorResultados.textContent =
                `Mostrando ${listaProductos.length} productos`;
        }

        if(mensajeVacio){
            mensajeVacio.classList.toggle(
                "d-none",
                listaProductos.length > 0
            );
        }
    }




    // mostrar las categorias

    function mostrarCategorias(){
        if(!listaCategorias){
            return;
        }

        listaCategorias.innerHTML = "";

        const categorias = [
            ...new Set(
                productosPublicados
                    .map((producto)=>producto.categoria)
                    .filter(Boolean)
            )
        ];

        categorias.forEach((categoria,indice)=>{
            const contenedor = document.createElement("div");
            contenedor.className = "form-check";

            const casilla = document.createElement("input");
            casilla.type = "checkbox";
            casilla.className = "form-check-input";
            casilla.name = "categorias";
            casilla.value = categoria;
            casilla.id = `categoria-${indice}`;

            const etiqueta = document.createElement("label");
            etiqueta.className = "form-check-label";
            etiqueta.htmlFor = casilla.id;
            etiqueta.textContent = categoria;

            contenedor.append(casilla,etiqueta);
            listaCategorias.appendChild(contenedor);
        });
    }


    // aplicar los filtros

    function aplicarFiltros(){
        let productosFiltrados = [...productosPublicados];

        const categoriasSeleccionadas = [
            ...document.querySelectorAll(
                '[data-category-list] input[name="categorias"]:checked'
            )
        ].map((casilla)=>casilla.value);

        if(
            casillaTodasCategorias &&
            !casillaTodasCategorias.checked &&
            categoriasSeleccionadas.length > 0
        ){
            productosFiltrados = productosFiltrados.filter((producto)=>{
                return categoriasSeleccionadas.includes(
                    producto.categoria
                );
            });
        }

        // filtrar por precio

        const precioMinimo =
            entradaPrecioMinimo && entradaPrecioMinimo.value !== ""
                ? Number(entradaPrecioMinimo.value)
                : null;

        const precioMaximo =
            entradaPrecioMaximo && entradaPrecioMaximo.value !== ""
                ? Number(entradaPrecioMaximo.value)
                : null;

        productosFiltrados = productosFiltrados.filter((producto)=>{
            const precioHabitual = Number(producto.precio) || 0;
            const precioPromocional =
                Number(producto.preciopromocional) || 0;

            const precio =
                precioPromocional > 0 &&
                precioPromocional < precioHabitual
                    ? precioPromocional
                    : precioHabitual;

            if(precioMinimo !== null && precio < precioMinimo){
                return false;
            }

            if(precioMaximo !== null && precio > precioMaximo){
                return false;
            }

            return true;
        });

        // filtrar por disponibilidad

        if(filtroStock && filtroStock.checked){
            productosFiltrados = productosFiltrados.filter((producto)=>{
                return Number(producto.stock) > 0;
            });
        }

        // filtrar por ofertas

        if(filtroOfertas && filtroOfertas.checked){
            productosFiltrados = productosFiltrados.filter((producto)=>{
                const precioHabitual = Number(producto.precio) || 0;
                const precioPromocional =
                    Number(producto.preciopromocional) || 0;

                return precioPromocional > 0 &&
                    precioPromocional < precioHabitual;
            });
        }

        // ordenar los productos

        const orden = selectorOrden
            ? selectorOrden.value
            : "recommended";

        switch(orden){
            case "price-asc":
                productosFiltrados.sort((a,b)=>{
                    return obtenerPrecio(a) - obtenerPrecio(b);
                });
                break;

            case "price-desc":
                productosFiltrados.sort((a,b)=>{
                    return obtenerPrecio(b) - obtenerPrecio(a);
                });
                break;

            case "name-asc":
                productosFiltrados.sort((a,b)=>{
                    return obtenerNombre(a).localeCompare(
                        obtenerNombre(b),
                        "es"
                    );
                });
                break;

            case "name-desc":
                productosFiltrados.sort((a,b)=>{
                    return obtenerNombre(b).localeCompare(
                        obtenerNombre(a),
                        "es"
                    );
                });
                break;

            default:
                productosFiltrados.sort((a,b)=>{
                    return Number(Boolean(b.destacado)) -
                        Number(Boolean(a.destacado));
                });
        }

        mostrarProductos(productosFiltrados);
    }


    // obtener el precio y nombre

    function obtenerPrecio(producto){
        const precioHabitual = Number(producto.precio) || 0;
        const precioPromocional =
            Number(producto.preciopromocional) || 0;

        return precioPromocional > 0 &&
            precioPromocional < precioHabitual
                ? precioPromocional
                : precioHabitual;
    }

    function obtenerNombre(producto){
        return producto.nombre || "Producto sin nombre";
    }


    // conectar los filtros

    if(formularioFiltros){
        formularioFiltros.addEventListener("submit",(evento)=>{
            evento.preventDefault();
            aplicarFiltros();
        });

        formularioFiltros.addEventListener("reset",()=>{
            setTimeout(()=>{
                if(casillaTodasCategorias){
                    casillaTodasCategorias.checked = true;
                }

                aplicarFiltros();
            },0);
        });
    }

    if(listaCategorias){
        listaCategorias.addEventListener("change",()=>{
            if(casillaTodasCategorias){
                casillaTodasCategorias.checked = false;
            }

            aplicarFiltros();
        });
    }

    if(casillaTodasCategorias){
        casillaTodasCategorias.addEventListener("change",()=>{
            if(casillaTodasCategorias.checked && listaCategorias){
                listaCategorias
                    .querySelectorAll('input[name="categorias"]')
                    .forEach((casilla)=>{
                        casilla.checked = false;
                    });
            }

            aplicarFiltros();
        });
    }

    if(filtroStock){
        filtroStock.addEventListener("change",aplicarFiltros);
    }

    if(filtroOfertas){
        filtroOfertas.addEventListener("change",aplicarFiltros);
    }

    if(selectorOrden){
        selectorOrden.addEventListener("change",aplicarFiltros);
    }


    // iniciar el catalogo

    mostrarCategorias();
    aplicarFiltros();

});

