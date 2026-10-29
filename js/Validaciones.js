// Este archivo se extrajo de Admincrearproductos.js y ahora se llama Validaciones.js.
// Este se encarga de todo el funcionamiento de validar los campos del formulario, las subcategorias segun la categoria elegida y generar los codigos SKU automaticamente.
// Lo que se corrigio creando este archivo fue separar las reglas de validacion para que el formulario principal no quede tan cargado y sea facil de entender y mantener.

// Diccionario de categorías y subcategorías para códigos SKU
const Nomenclaturacategorias = {
    Maquillaje: {
        prefijo: 'MQ',
        subcategorias: {
            Labios: 'LAB',
            Ojos: 'OJO',
            Rostro: 'ROS'
        }
    },
    Skincare: {
        prefijo: 'SK',
        subcategorias: {
            Limpiadores: 'LIM',
            Hidratantes: 'HID',
            Tonicos: 'TON',
            Serums: 'SER'
        }
    },
    Accesorios: {
        prefijo: 'AC',
        subcategorias: {
            Brochas: 'BRO',
            Esponjas: 'ESP',
            Cosmetiqueras: 'COS'
        }
    }
};

function Actualizarsubcategorias(Entradacategoria, Entradasubcategoria) {
    if (!Entradacategoria || !Entradasubcategoria) return;
    const cat = Entradacategoria.value;
    const datos = Nomenclaturacategorias[cat];
    Entradasubcategoria.innerHTML = '<option value="">Selecciona una subcategoría</option>';
    if (datos) {
        Object.keys(datos.subcategorias).forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            Entradasubcategoria.appendChild(opt);
        });
    }
}

function Obtenerprefijobase(Entradacategoria, Entradasubcategoria) {
    const cat = Entradacategoria ? Entradacategoria.value : '';
    const sub = Entradasubcategoria ? Entradasubcategoria.value : '';
    const datos = Nomenclaturacategorias[cat];
    if (!datos) return '';
    return (datos.prefijo || '') + (datos.subcategorias[sub] || '');
}

function ObtenerSiguienteSku(Entradacategoria, Entradasubcategoria) {
    const prefijo = Obtenerprefijobase(Entradacategoria, Entradasubcategoria);
    if (!prefijo) return '';
    let maxNumero = 0;
    const productos = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];
    productos.forEach(item => {
        const codigo = (item.sku || item.referencia || '').toString().trim().toUpperCase();
        if (codigo.startsWith(prefijo)) {
            const num = parseInt(codigo.slice(prefijo.length), 10);
            if (!isNaN(num) && num > maxNumero) maxNumero = num;
        }
    });
    return prefijo + String(maxNumero + 1).padStart(3, '0');
}

function Filtrarsku(textoCrudo) {
    const texto = (textoCrudo || '').toUpperCase();
    let res = '';
    for (const char of texto) {
        if (res.length < 5 && /[A-Z]/.test(char)) res += char;
        else if (res.length >= 5 && res.length < 12 && /[0-9]/.test(char)) res += char;
    }
    return res;
}

function Limpiarerror(campo, elemError) {
    if (campo) campo.classList.remove('entrada-invalida');
    if (elemError) elemError.classList.remove('visible');
}

function Marcarerror(campo, elemError, mensaje) {
    if (campo) campo.classList.add('entrada-invalida');
    if (elemError) {
        if (mensaje) elemError.textContent = mensaje;
        elemError.classList.add('visible');
    }
}

function Configurarcasillanumerica(Entrada) {
    if (!Entrada) return;
    Entrada.addEventListener('input', function () { this.value = this.value.replace(/[^0-9]/g, ''); });
    Entrada.addEventListener('wheel', (e) => e.preventDefault());
    Entrada.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); });
}

function Validarskuentiempreal(Entradasku, Exitosku, Idproductoeditar, SkuOriginalEditar) {
    if (!Entradasku) return true;
    const errorSku = document.getElementById('errorSku');
    const valor = Entradasku.value.trim().toUpperCase();
    if (Exitosku) Exitosku.style.display = 'none';

    if (!valor) return Marcarerror(Entradasku, errorSku, 'El código de referencia es obligatorio'), false;
    if (valor.length < 5 || !/^[A-Z]{5}/.test(valor)) return Marcarerror(Entradasku, errorSku, 'El código debe iniciar con exactamente 5 letras mayúsculas'), false;
    if (valor.length < 8) return Marcarerror(Entradasku, errorSku, `Completa al menos ${8 - valor.length} número(s) más para alcanzar el mínimo de 8 caracteres`), false;
    if (!/^[A-Z]{5}[0-9]{3,7}$/.test(valor)) return Marcarerror(Entradasku, errorSku, 'Estructura inválida: 5 letras seguidas de 3 a 7 números'), false;

    const productos = typeof Obtenerlistadoproductos === 'function' ? Obtenerlistadoproductos() : [];
    const duplicado = productos.some(item => {
        const itemSku = String(item.sku || '').trim().toUpperCase();
        const itemId = String(item.id || '').trim();
        if (Idproductoeditar && (itemId === String(Idproductoeditar) || itemId.replace('PROD-', '') === String(Idproductoeditar).replace('PROD-', ''))) return false;
        if (SkuOriginalEditar && itemSku === SkuOriginalEditar) return false;
        return itemSku === valor;
    });

    if (duplicado) return Marcarerror(Entradasku, errorSku, 'Este código de referencia ya fue registrado antes'), false;

    Limpiarerror(Entradasku, errorSku);
    if (Exitosku) { Exitosku.textContent = 'Código disponible para usar'; Exitosku.style.display = 'block'; }
    return true;
}

function Validardatos(campos, Idproductoeditar, SkuOriginalEditar) {
    let valido = true;
    const v = (invalido, campo, elemError, mensaje) => {
        if (invalido) { Marcarerror(campo, elemError, mensaje); valido = false; }
        else Limpiarerror(campo, elemError);
    };

    v(!campos.nombre.value.trim(), campos.nombre, document.getElementById('errorNombre'), 'Por favor ingresa el nombre del producto');
    if (!Validarskuentiempreal(campos.sku, campos.exitosku, Idproductoeditar, SkuOriginalEditar)) valido = false;
    v(!campos.descripcion.value.trim(), campos.descripcion, document.getElementById('errorDescripcion'), 'Por favor escribe una descripción corta');

    const precio = parseFloat(campos.preciohabitual.value);
    v(isNaN(precio) || precio <= 0, campos.preciohabitual, document.getElementById('errorPrecio'), 'El precio debe ser un número en pesos mayor a cero');

    const stock = parseInt(campos.stock.value, 10);
    v(isNaN(stock) || stock < 0, campos.stock, document.getElementById('errorStock'), 'El stock debe ser un número entero mayor o igual a cero');

    if (!campos.categoria.value) { campos.categoria.classList.add('entrada-invalida'); valido = false; }
    else campos.categoria.classList.remove('entrada-invalida');

    if (!campos.textoalternativo.value.trim()) campos.textoalternativo.value = campos.nombre.value.trim() || 'Imagen del producto';
    campos.textoalternativo.classList.remove('entrada-invalida');

    return valido;
}

if (typeof window !== 'undefined') {
    Object.assign(window, {
        Nomenclaturacategorias,
        Actualizarsubcategorias,
        Obtenerprefijobase,
        ObtenerSiguienteSku,
        Filtrarsku,
        Limpiarerror,
        Marcarerror,
        Configurarcasillanumerica,
        Validarskuentiempreal,
        Validardatos
    });
}

