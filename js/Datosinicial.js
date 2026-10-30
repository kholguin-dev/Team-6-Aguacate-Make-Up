// Este archivo se llamaba datos-semilla.js y ahora se llama Datosinicial.js.
// Este se encarga de todo el funcionamiento del listado inicial de productos de prueba para la tienda.
// Lo que se corrigio creando este archivo fue organizar los datos de prueba en un formato limpio sin guiones para seguir el estandar del proyecto.


const ProductosSemilla = [
  {
    id: "PROD-001",
    nombre: "Tónico de rosas y manzanilla",
    categoria: "Skincare",
    subcategoria: "Hidratantes",
    sku: "SKTON001",
    marca: "Aguacate Make Up",
    descripcion:
      "Tónico facial de rosas y manzanilla para refrescar y complementar la rutina de cuidado de la piel.",
    precio: 15000,
    precioPromocional: null,
    stock: 25,
    tamano: "120 ml",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod8.jpeg",
    textoAlternativo: "Tónico facial de rosas y manzanilla",
    estado: "Publicado",
    destacado: true,
    novedades: true,
  },
  {
    id: "PROD-002",
    nombre: "Aura Brillo Líquido",
    categoria: "Maquillaje",
    subcategoria: "Labios",
    sku: "MQLAB001",
    marca: "Aguacate Make Up",
    descripcion:
      "Producto líquido para labios con acabado brillante, ideal para complementar diferentes estilos de maquillaje.",
    precio: 10000,
    precioPromocional: null,
    stock: 30,
    tamano: "5 ml",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod2.jpeg",
    textoAlternativo: "Aura Brillo Líquido para labios",
    estado: "Publicado",
    destacado: false,
    novedades: false,
  },
  {
    id: "PROD-003",
    nombre: "Bob Esponja Desmaquillante Bifásico",
    categoria: "Skincare",
    subcategoria: "Limpiadores",
    sku: "SKDES001",
    marca: "Aguacate Make Up",
    descripcion:
      "Desmaquillante bifásico para ayudar a retirar maquillaje del rostro y productos resistentes al agua.",
    precio: 20000,
    precioPromocional: null,
    stock: 18,
    tamano: "100 ml",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod1.jpeg",
    textoAlternativo: "Desmaquillante bifásico de Bob Esponja",
    estado: "Publicado",
    destacado: true,
    novedades: false,
  },
  {
    id: "PROD-004",
    nombre: "Colo Party",
    categoria: "Maquillaje",
    subcategoria: "Ojos",
    sku: "MQDEL001",
    marca: "Aguacate Make Up",
    descripcion:
      "Delineador cosmético para definir y realzar la mirada con trazos precisos.",
    precio: 10000,
    precioPromocional: null,
    stock: 22,
    tamano: "1 unidad",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod4.jpeg",
    textoAlternativo: "Delineador Colo Party",
    estado: "Publicado",
    destacado: false,
    novedades: false,
  },
  {
    id: "PROD-005",
    nombre: "Magic Concealer Corrector",
    categoria: "Maquillaje",
    subcategoria: "Cara",
    sku: "MQBAS001",
    marca: "Aguacate Make Up",
    descripcion:
      "Corrector de maquillaje para ayudar a unificar visualmente el tono de la piel y disimular imperfecciones.",
    precio: 20000,
    precioPromocional: null,
    stock: 15,
    tamano: "6 ml",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod3.jpeg",
    textoAlternativo: "Magic Concealer Corrector de maquillaje",
    estado: "Publicado",
    destacado: true,
    novedades: false,
  },
  {
    id: "PROD-006",
    nombre: "El Extraño Mundo de Jack Polvo Compacto Doble",
    categoria: "Maquillaje",
    subcategoria: "Cara",
    sku: "MQPOL001",
    marca: "Aguacate Make Up",
    descripcion:
      "Polvo compacto doble con diseño inspirado en El Extraño Mundo de Jack.",
    precio: 25000,
    precioPromocional: null,
    stock: 10,
    tamano: "1 unidad",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod5.jpeg",
    textoAlternativo: "Polvo compacto doble de El Extraño Mundo de Jack",
    estado: "Publicado",
    destacado: true,
    novedades: false,
  },
  {
    id: "PROD-007",
    nombre: "El Extraño Mundo de Jack Polvo Compacto",
    categoria: "Maquillaje",
    subcategoria: "Cara",
    sku: "MQPOL002",
    marca: "Aguacate Make Up",
    descripcion:
      "Polvo compacto con diseño inspirado en El Extraño Mundo de Jack para complementar el maquillaje facial.",
    precio: 15000,
    precioPromocional: null,
    stock: 14,
    tamano: "1 unidad",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod10.jpeg",
    textoAlternativo: "Polvo compacto de El Extraño Mundo de Jack",
    estado: "Publicado",
    destacado: false,
    novedades: false,
  },
  {
    id: "PROD-008",
    nombre: "Disney Princesas Rubor en Polvo",
    categoria: "Maquillaje",
    subcategoria: "Cara",
    sku: "MQPOL003",
    marca: "Aguacate Make Up",
    descripcion:
      "Rubor en polvo con diseño inspirado en Disney Princesas para dar color a las mejillas.",
    precio: 10000,
    precioPromocional: null,
    stock: 28,
    tamano: "1 unidad",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod9.jpeg",
    textoAlternativo: "Rubor en polvo Disney Princesas",
    estado: "Publicado",
    destacado: false,
    novedades: false,
  },
  {
    id: "PROD-009",
    nombre: "Mia Blush Contorno",
    categoria: "Maquillaje",
    subcategoria: "Cara",
    sku: "MQPOL004",
    marca: "Aguacate Make Up",
    descripcion: "Producto en polvo para contornear y dar dimensión al rostro.",
    precio: 15000,
    precioPromocional: null,
    stock: 16,
    tamano: "1 unidad",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod6.jpeg",
    textoAlternativo: "Mia Blush Contorno en polvo",
    estado: "Publicado",
    destacado: false,
    novedades: false,
  },
  {
    id: "PROD-010",
    nombre: "Delineador Líquido de Ojos",
    categoria: "Maquillaje",
    subcategoria: "Ojos",
    sku: "MQDEL002",
    marca: "Aguacate Make Up",
    descripcion:
      "Delineador líquido para definir los ojos y crear trazos precisos.",
    precio: 10000,
    precioPromocional: null,
    stock: 20,
    tamano: "1 unidad",
    disponibilidad: "En stock",
    imagen: "../img/img-catalogo/Prod7.jpeg",
    textoAlternativo: "Delineador líquido de ojos",
    estado: "Publicado",
    destacado: false,
    novedades: false,
  },
];

window.ProductosSemilla = ProductosSemilla;

function InicializarProductosSemilla(forzarReemplazo = false) {
  if (typeof window.Obtenerlistadoproductos !== "function") return;
  const productosGuardados = window.Obtenerlistadoproductos();

  if (forzarReemplazo || !productosGuardados || productosGuardados.length === 0) {
    window.Guardarlistadoproductos(window.ProductosSemilla);
    return;
  }

  let huboCambios = false;

  // 1. Corrige rutas de imágenes con tilde y sincroniza el estado de novedades
  const listaActualizada = productosGuardados.map(function (prod) {
    if (!prod) return prod;
    let modificado = false;
    let copia = Object.assign({}, prod);

    if (copia.imagen && typeof copia.imagen === "string" && copia.imagen.includes("img-cat")) {
      const nuevaImagen = copia.imagen.replace(/img-cat[%C3%A1|álogo]+/gi, "img-catalogo");
      if (nuevaImagen !== copia.imagen) {
        copia.imagen = nuevaImagen;
        modificado = true;
      }
    }

    const coincidente = window.ProductosSemilla.find(function (s) {
      const pid = String(copia.id || "").trim().toUpperCase();
      const psku = String(copia.sku || "").trim().toUpperCase();
      const sid = String(s.id || "").trim().toUpperCase();
      const ssku = String(s.sku || "").trim().toUpperCase();
      return pid === sid || psku === ssku;
    });

    if (coincidente && copia.novedades !== coincidente.novedades) {
      copia.novedades = coincidente.novedades;
      modificado = true;
    }

    if (modificado) {
      huboCambios = true;
      return copia;
    }
    return prod;
  });

  // 2. Si faltan productos semilla clave, agregarlos para que todos los usuarios tengan los 10 productos
  window.ProductosSemilla.forEach(function (semilla) {
    const existe = listaActualizada.some(function (p) {
      if (!p) return false;
      const pid = String(p.id || "").trim().toUpperCase();
      const psku = String(p.sku || "").trim().toUpperCase();
      const sid = String(semilla.id || "").trim().toUpperCase();
      const ssku = String(semilla.sku || "").trim().toUpperCase();
      return pid === sid || psku === ssku;
    });

    if (!existe) {
      listaActualizada.push(semilla);
      huboCambios = true;
    }
  });

  if (huboCambios) {
    window.Guardarlistadoproductos(listaActualizada);
  }
}

window.InicializarProductosSemilla = InicializarProductosSemilla;
