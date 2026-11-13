// Este archivo se llama Admincategorias.js y controla la ventana "Categorías" del panel de productos.
// Permite a los administradores crear categorías (con un código de 2 letras) y subcategorías
// (con un código de 3 letras). Ambos códigos forman las 5 letras iniciales del SKU.
// Las categorías se guardan en localStorage usando Obtenercategorias y Guardarcategorias de Almacenamiento.js.

document.addEventListener("DOMContentLoaded", () => {

    const formCategoria = document.getElementById("formNuevaCategoria");
    const formSubcategoria = document.getElementById("formNuevaSubcategoria");
    const entradaNombreCategoria = document.getElementById("nombreNuevaCategoria");
    const entradaPrefijo = document.getElementById("prefijoNuevaCategoria");
    const selectorCategoriaPadre = document.getElementById("categoriaPadreSubcategoria");
    const entradaNombreSubcategoria = document.getElementById("nombreNuevaSubcategoria");
    const entradaCodigoSubcategoria = document.getElementById("codigoNuevaSubcategoria");
    const listaCategorias = document.getElementById("listaCategoriasAdmin");
    const alerta = document.getElementById("alertaCategorias");
    const modal = document.getElementById("modalCategorias");

    if (!formCategoria || !formSubcategoria || !listaCategorias) {
        return;
    }

    if (typeof window.Obtenercategorias !== "function" || typeof window.Guardarcategorias !== "function") {
        console.error("Admincategorias.js necesita Almacenamiento.js cargado antes.");
        return;
    }

    const Patronnombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 &\-]{2,30}$/;

    // ==========================================
    // UTILIDADES
    // ==========================================

    function escapar(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[c]);
    }

    function normalizarTexto(texto) {
        return String(texto ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .trim();
    }

    // Deja solo letras A-Z en mayúscula (quita tildes, espacios y números)
    function soloLetras(texto) {
        return String(texto ?? "")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toUpperCase()
            .replace(/[^A-Z]/g, "");
    }

    // Quita espacios repetidos y pone la primera letra en mayúscula
    function formatearNombre(texto) {
        const limpio = String(texto ?? "").trim().replace(/\s+/g, " ");
        return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }

    // Propone un código libre a partir del nombre (ejemplo: "Cejas" -> "CEJ")
    function sugerirCodigo(nombre, largo, usados) {
        const letras = soloLetras(nombre);
        const candidatos = [];

        if (letras.length >= largo) {
            candidatos.push(letras.slice(0, largo));

            // probar combinaciones que conserven la primera letra
            for (let i = 1; i < letras.length; i++) {
                if (largo === 2) {
                    candidatos.push(letras[0] + letras[i]);
                } else {
                    for (let j = i + 1; j < letras.length; j++) {
                        candidatos.push(letras[0] + letras[i] + letras[j]);
                    }
                }
            }
        }

        const libre = candidatos.find((c) => !usados.includes(c));
        if (libre) {
            return libre;
        }

        // si no alcanza, completar con letras del abecedario
        const base = (letras + "XXX").slice(0, largo - 1);
        for (let c = 65; c <= 90; c++) {
            const codigo = base + String.fromCharCode(c);
            if (!usados.includes(codigo)) {
                return codigo;
            }
        }
        return "";
    }

    function prefijosUsados(categorias) {
        return Object.values(categorias).map((c) => String(c.prefijo || "").toUpperCase());
    }

    function codigosUsados(categorias, nombreCategoria) {
        const datos = categorias[nombreCategoria];
        return datos ? Object.values(datos.subcategorias || {}).map((c) => String(c).toUpperCase()) : [];
    }

    // Cuenta cuántos productos usan una categoría o una subcategoría
    function contarProductos(categoria, subcategoria) {
        const productos = typeof window.Obtenerlistadoproductos === "function"
            ? window.Obtenerlistadoproductos()
            : [];

        return productos.filter((p) => {
            if (!p) return false;
            const mismaCategoria = normalizarTexto(p.categoria) === normalizarTexto(categoria);
            if (subcategoria === undefined) return mismaCategoria;
            return mismaCategoria && normalizarTexto(p.subcategoria) === normalizarTexto(subcategoria);
        }).length;
    }

    function mostrarAlerta(mensaje, tipo) {
        if (!alerta) return;
        alerta.textContent = mensaje;
        alerta.className = `alert py-2 small alert-${tipo === "error" ? "danger" : "success"}`;
        clearTimeout(mostrarAlerta.temporizador);
        mostrarAlerta.temporizador = setTimeout(() => alerta.classList.add("d-none"), 4000);
    }

    function marcarInvalido(entrada, invalido) {
        if (entrada) entrada.classList.toggle("is-invalid", invalido);
    }

    function guardarYRefrescar(categorias, mensaje) {
        if (!window.Guardarcategorias(categorias)) {
            mostrarAlerta("No se pudo guardar. Verifica el almacenamiento del navegador.", "error");
            return false;
        }
        renderizarTodo();
        mostrarAlerta(mensaje, "exito");
        document.dispatchEvent(new CustomEvent("aguacate:categorias-actualizadas"));
        return true;
    }

    // ==========================================
    // MOSTRAR CATEGORÍAS
    // ==========================================

    function renderizarSelectorPadre(categorias) {
        if (!selectorCategoriaPadre) return;
        const anterior = selectorCategoriaPadre.value;
        const nombres = Object.keys(categorias);

        selectorCategoriaPadre.innerHTML = nombres.length
            ? nombres.map((cat) =>
                `<option value="${escapar(cat)}">${escapar(cat)} (${escapar(categorias[cat].prefijo)})</option>`
            ).join("")
            : '<option value="">Primero crea una categoría</option>';

        if (nombres.includes(anterior)) {
            selectorCategoriaPadre.value = anterior;
        }
    }

    function renderizarLista(categorias) {
        const nombres = Object.keys(categorias);

        if (nombres.length === 0) {
            listaCategorias.innerHTML =
                '<p class="text-muted small mb-0">Aún no hay categorías creadas.</p>';
            return;
        }

        listaCategorias.innerHTML = nombres.map((cat) => {
            const datos = categorias[cat];
            const subcategorias = Object.entries(datos.subcategorias || {});
            const totalCategoria = contarProductos(cat);

            const chips = subcategorias.length
                ? subcategorias.map(([sub, codigo]) => {
                    const total = contarProductos(cat, sub);
                    return `
                        <span class="chip-subcategoria">
                            ${escapar(sub)}
                            <span class="codigo-categoria">${escapar(codigo)}</span>
                            <button
                                type="button"
                                class="boton-eliminar-chip"
                                data-accion="eliminar-subcategoria"
                                data-categoria="${escapar(cat)}"
                                data-subcategoria="${escapar(sub)}"
                                ${total > 0 ? "disabled" : ""}
                                title="${total > 0
                                    ? "No se puede eliminar: tiene productos asociados"
                                    : "Eliminar subcategoría"}"
                                aria-label="Eliminar subcategoría ${escapar(sub)}"
                            ><i class="bi bi-x"></i></button>
                        </span>
                    `;
                }).join("")
                : '<span class="text-muted small">Sin subcategorías todavía.</span>';

            return `
                <div class="tarjeta-categoria">
                    <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                        <div class="fw-bold" style="color: #310055">
                            ${escapar(cat)}
                            <span class="codigo-categoria">${escapar(datos.prefijo)}</span>
                            <span class="text-muted small fw-normal">
                                · ${totalCategoria} producto${totalCategoria === 1 ? "" : "s"}
                            </span>
                        </div>
                        <button
                            type="button"
                            class="btn btn-link btn-sm text-danger p-0"
                            data-accion="eliminar-categoria"
                            data-categoria="${escapar(cat)}"
                            ${totalCategoria > 0 ? "disabled" : ""}
                            title="${totalCategoria > 0
                                ? "No se puede eliminar: tiene productos asociados"
                                : "Eliminar categoría"}"
                        >
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2">${chips}</div>
                </div>
            `;
        }).join("");
    }

    function renderizarTodo() {
        const categorias = window.Obtenercategorias();
        renderizarSelectorPadre(categorias);
        renderizarLista(categorias);
    }

    // ==========================================
    // SUGERENCIA AUTOMÁTICA DE CÓDIGOS
    // ==========================================

    // Mientras el administrador no escriba el código a mano, se sugiere uno a partir del nombre
    function sugerirPrefijo() {
        if (entradaPrefijo.dataset.editado === "true") return;
        const categorias = window.Obtenercategorias();
        entradaPrefijo.value = entradaNombreCategoria.value.trim()
            ? sugerirCodigo(entradaNombreCategoria.value, 2, prefijosUsados(categorias))
            : "";
    }

    function sugerirCodigoSubcategoria() {
        if (entradaCodigoSubcategoria.dataset.editado === "true") return;
        const categorias = window.Obtenercategorias();
        entradaCodigoSubcategoria.value = entradaNombreSubcategoria.value.trim()
            ? sugerirCodigo(
                entradaNombreSubcategoria.value,
                3,
                codigosUsados(categorias, selectorCategoriaPadre.value)
            )
            : "";
    }

    entradaNombreCategoria.addEventListener("input", () => {
        marcarInvalido(entradaNombreCategoria, false);
        sugerirPrefijo();
    });

    entradaPrefijo.addEventListener("input", () => {
        entradaPrefijo.value = soloLetras(entradaPrefijo.value).slice(0, 2);
        entradaPrefijo.dataset.editado = entradaPrefijo.value ? "true" : "false";
        marcarInvalido(entradaPrefijo, false);
    });

    entradaNombreSubcategoria.addEventListener("input", () => {
        marcarInvalido(entradaNombreSubcategoria, false);
        sugerirCodigoSubcategoria();
    });

    entradaCodigoSubcategoria.addEventListener("input", () => {
        entradaCodigoSubcategoria.value = soloLetras(entradaCodigoSubcategoria.value).slice(0, 3);
        entradaCodigoSubcategoria.dataset.editado = entradaCodigoSubcategoria.value ? "true" : "false";
        marcarInvalido(entradaCodigoSubcategoria, false);
    });

    selectorCategoriaPadre.addEventListener("change", sugerirCodigoSubcategoria);

    // ==========================================
    // CREAR CATEGORÍA
    // ==========================================

    formCategoria.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const categorias = window.Obtenercategorias();
        const nombre = formatearNombre(entradaNombreCategoria.value);
        const prefijo = soloLetras(entradaPrefijo.value);

        if (!Patronnombre.test(nombre)) {
            marcarInvalido(entradaNombreCategoria, true);
            return mostrarAlerta("El nombre debe tener entre 2 y 30 caracteres (letras, números, espacios, & o -).", "error");
        }

        const repetida = Object.keys(categorias).some(
            (cat) => normalizarTexto(cat) === normalizarTexto(nombre)
        );
        if (repetida) {
            marcarInvalido(entradaNombreCategoria, true);
            return mostrarAlerta(`La categoría "${nombre}" ya existe.`, "error");
        }

        if (!/^[A-Z]{2}$/.test(prefijo)) {
            marcarInvalido(entradaPrefijo, true);
            return mostrarAlerta("El código de la categoría debe tener exactamente 2 letras.", "error");
        }

        if (prefijosUsados(categorias).includes(prefijo)) {
            marcarInvalido(entradaPrefijo, true);
            return mostrarAlerta(`El código "${prefijo}" ya lo usa otra categoría.`, "error");
        }

        categorias[nombre] = { prefijo, subcategorias: {} };

        if (guardarYRefrescar(categorias, `Categoría "${nombre}" creada. Ahora agrégale subcategorías.`)) {
            formCategoria.reset();
            entradaPrefijo.dataset.editado = "false";
            // dejar la nueva categoría lista para agregarle subcategorías
            selectorCategoriaPadre.value = nombre;
            entradaNombreSubcategoria.focus();
        }
    });

    // ==========================================
    // CREAR SUBCATEGORÍA
    // ==========================================

    formSubcategoria.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const categorias = window.Obtenercategorias();
        const categoria = selectorCategoriaPadre.value;
        const nombre = formatearNombre(entradaNombreSubcategoria.value);
        const codigo = soloLetras(entradaCodigoSubcategoria.value);

        if (!categoria || !categorias[categoria]) {
            marcarInvalido(selectorCategoriaPadre, true);
            return mostrarAlerta("Selecciona la categoría a la que pertenece la subcategoría.", "error");
        }
        marcarInvalido(selectorCategoriaPadre, false);

        if (!Patronnombre.test(nombre)) {
            marcarInvalido(entradaNombreSubcategoria, true);
            return mostrarAlerta("El nombre debe tener entre 2 y 30 caracteres (letras, números, espacios, & o -).", "error");
        }

        const subcategorias = categorias[categoria].subcategorias || {};

        const repetida = Object.keys(subcategorias).some(
            (sub) => normalizarTexto(sub) === normalizarTexto(nombre)
        );
        if (repetida) {
            marcarInvalido(entradaNombreSubcategoria, true);
            return mostrarAlerta(`"${nombre}" ya existe dentro de ${categoria}.`, "error");
        }

        if (!/^[A-Z]{3}$/.test(codigo)) {
            marcarInvalido(entradaCodigoSubcategoria, true);
            return mostrarAlerta("El código de la subcategoría debe tener exactamente 3 letras.", "error");
        }

        if (codigosUsados(categorias, categoria).includes(codigo)) {
            marcarInvalido(entradaCodigoSubcategoria, true);
            return mostrarAlerta(`El código "${codigo}" ya se usa en ${categoria}.`, "error");
        }

        subcategorias[nombre] = codigo;
        categorias[categoria].subcategorias = subcategorias;

        const prefijoSku = categorias[categoria].prefijo + codigo;
        if (guardarYRefrescar(categorias, `Subcategoría "${nombre}" creada en ${categoria}. Sus SKU empezarán por ${prefijoSku}.`)) {
            entradaNombreSubcategoria.value = "";
            entradaCodigoSubcategoria.value = "";
            entradaCodigoSubcategoria.dataset.editado = "false";
            entradaNombreSubcategoria.focus();
        }
    });

    // ==========================================
    // ELIMINAR (solo si no hay productos asociados)
    // ==========================================

    listaCategorias.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton || boton.disabled) return;

        const categorias = window.Obtenercategorias();
        const categoria = boton.dataset.categoria;
        if (!categorias[categoria]) return;

        if (boton.dataset.accion === "eliminar-categoria") {
            if (contarProductos(categoria) > 0) {
                return mostrarAlerta("No se puede eliminar: hay productos en esta categoría.", "error");
            }
            const totalSubs = Object.keys(categorias[categoria].subcategorias || {}).length;
            const aviso = totalSubs
                ? ` También se eliminarán sus ${totalSubs} subcategoría(s).`
                : "";
            if (!confirm(`¿Eliminar la categoría "${categoria}"?${aviso}`)) return;

            delete categorias[categoria];
            guardarYRefrescar(categorias, `Categoría "${categoria}" eliminada.`);
        }

        if (boton.dataset.accion === "eliminar-subcategoria") {
            const subcategoria = boton.dataset.subcategoria;
            if (contarProductos(categoria, subcategoria) > 0) {
                return mostrarAlerta("No se puede eliminar: hay productos en esta subcategoría.", "error");
            }
            if (!confirm(`¿Eliminar la subcategoría "${subcategoria}" de ${categoria}?`)) return;

            delete categorias[categoria].subcategorias[subcategoria];
            guardarYRefrescar(categorias, `Subcategoría "${subcategoria}" eliminada.`);
        }
    });

    // Refrescar los conteos cada vez que se abre la ventana
    if (modal) {
        modal.addEventListener("show.bs.modal", () => {
            if (alerta) alerta.classList.add("d-none");
            renderizarTodo();
        });
    }

    // El enlace "Categorías" de la barra lateral abre esta ventana con admin-productos.html#categorias
    function abrirSiCorresponde() {
        if (modal && window.location.hash === "#categorias" && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(modal).show();
        }
    }

    if (modal) {
        // quitar el #categorias al cerrar para que el enlace funcione de nuevo
        modal.addEventListener("hidden.bs.modal", () => {
            if (window.location.hash === "#categorias") {
                history.replaceState(null, "", window.location.pathname + window.location.search);
            }
        });
    }

    window.addEventListener("hashchange", abrirSiCorresponde);

    renderizarTodo();
    abrirSiCorresponde();
});
