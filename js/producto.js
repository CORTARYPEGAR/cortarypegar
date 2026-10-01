const WA = "56950375836";

const CART_KEY = "cortarPegarCartV1";

const FAVORITES_KEY = "cortarPegarFavoritesV1";


/* =========================================================
   CATÁLOGO MAESTRO
========================================================= */

const PRODUCTOS = window.CP_PRODUCTOS || {};


/* =========================================================
   PRODUCTO ACTUAL
========================================================= */

const PRODUCT_ID =
document.body.dataset.producto;


const producto =
PRODUCTOS[PRODUCT_ID];


const CATEGORIAS = window.CP_CATEGORIAS || {};
const paramsPagina = new URLSearchParams(window.location.search);
const desdeSolicitado = paramsPagina.get("desde");
const categoriaRegreso =
  desdeSolicitado === "todos" || CATEGORIAS[desdeSolicitado]
    ? (desdeSolicitado || producto?.categoria || "todos")
    : (producto?.categoria || "todos");
const categoriaRegresoMeta =
  categoriaRegreso === "todos"
    ? {titulo:"Todos los productos"}
    : (CATEGORIAS[categoriaRegreso] || {titulo:producto?.categoriaNombre || "Productos"});


const root =
document.getElementById(
  "producto"
);



/* =========================================================
   UTILIDADES
========================================================= */

function moneda(valor){

  return "$" +
  Number(valor)
  .toLocaleString(
    "es-CL"
  )
  +
  " CLP";

}


function monedaCorta(valor){

  return "$" +
  Number(valor)
  .toLocaleString(
    "es-CL"
  );

}


function fechaBonita(fecha){

  if(!fecha){

    return "-";

  }


  return fecha
  .split("-")
  .reverse()
  .join("/");

}


function escapar(texto){

  return String(texto)

  .replaceAll(
    "&",
    "&amp;"
  )

  .replaceAll(
    "<",
    "&lt;"
  )

  .replaceAll(
    ">",
    "&gt;"
  )

  .replaceAll(
    '"',
    "&quot;"
  )

  .replaceAll(
    "'",
    "&#039;"
  );

}


function crearId(){

  return (

    Date.now()
    .toString(36)

    +

    Math.random()
    .toString(36)
    .slice(
      2,
      8
    )

  );

}



/* =========================================================
   TEXTO DE DETALLES
========================================================= */

function textoDetallesItem(item){
  const detalles=item.details||{};
  const etiquetas={
    "diseño":"Diseño","texto":"Texto","tematica":"Temática","preferencia":"Preferencia",
    "figura":"Figura","tamano":"Tamaño","acabado":"Acabado","medida":"Medida","caras":"Caras",
    "material":"Material","marca":"Marca","detalles":"Detalles","unidades":"Cantidad","datos":"Datos"
  };
  const partes=Object.entries(detalles)
    .filter(([,v])=>v!==""&&v!=="-"&&v!=null)
    .map(([k,v])=>`${etiquetas[k]||k.charAt(0).toUpperCase()+k.slice(1)}: ${v}`);
  if(!partes.length&&item.design)partes.push(`Diseño: ${item.design}`);
  if(item.text&&item.text!=="-"&&!partes.some(x=>x.startsWith("Texto:")))partes.push(`Texto: ${item.text}`);
  return partes.length?partes.join(" · "):"Sin detalles adicionales";
}


/* =========================================================
   CAMPOS SEGÚN TIPO DE PRODUCTO
========================================================= */

function camposPersonalizacion(){


  /* =======================================================
     SENSORIALES
  ======================================================= */

  if(
    producto.tipo ===
    "sensorial"
  ){

    return `

    <div class="field">

      <label for="preferencia">

        Color o preferencia

      </label>

      <input
        id="preferencia"
        type="text"
        placeholder="Ej: rosado, celeste, tonos pastel...">

      <small>
        Puedes dejarlo vacío si no tienes una preferencia específica.
      </small>

    </div>

    `;

  }



  /* =======================================================
     STICKERS
  ======================================================= */

  if(
    producto.tipo ===
    "stickers"
  ){

    return `

    <div class="field">

      <label for="tematica">

        Temática o idea

      </label>

      <input
        id="tematica"
        type="text"
        placeholder="Ej: Hello Kitty, anime, flores, mascotas..."
        required>

    </div>


    <div class="field">

      <label for="detalles">

        Detalles del diseño

      </label>

      <input
        id="detalles"
        type="text"
        placeholder="Ej: nombres, frases, colores, personajes...">

      <small>
        Mientras más información nos entregues, más fácil será preparar la cotización.
      </small>

    </div>

    `;

  }



  /* =======================================================
     IMPRESIONES 3D
  ======================================================= */

  if(
    producto.tipo ===
    "impresion3d"
  ){

    return `

    <div class="field">

      <label for="figura">

        ¿Qué quieres imprimir?

      </label>

      <input
        id="figura"
        type="text"
        placeholder="Ej: personaje, llavero, figura decorativa..."
        required>

    </div>


    <div class="field">

      <label for="tamano">

        Tamaño aproximado

      </label>

      <input
        id="tamano"
        type="text"
        placeholder="Ej: 10 cm, 15 cm, tamaño pequeño...">

    </div>


    <div class="field">

      <label for="detalles">

        Detalles del encargo

      </label>

      <input
        id="detalles"
        type="text"
        placeholder="Ej: colores, personaje, referencia, uso...">

      <small>
        El valor final dependerá del modelo, tamaño y características de la impresión.
      </small>

    </div>

    `;

  }



  /* =======================================================
     SETS
  ======================================================= */

  if(
    producto.tipo ===
    "set"
  ){

    return `

    <div class="field">
      <label for="design">Diseño / temática</label>
      <input id="design" type="text" placeholder="Ej: flores, anime, profesión, colores..." required>
    </div>

    <div class="field">
      <label for="customText">Nombre, texto o detalles del set</label>
      <input id="customText" type="text" placeholder="Ej: nombre, colores o indicaciones especiales...">
      <small>Opcional. Los detalles finales se pueden confirmar por WhatsApp.</small>
    </div>

    `;

  }


  /* =======================================================
     TARJETAS DE PRESENTACIÓN
  ======================================================= */

  if(
    producto.tipo ===
    "tarjetas"
  ){

    return `

    <div class="field">
      <label for="marca">Nombre / marca</label>
      <input id="marca" type="text" placeholder="Ej: El Huasu Emporio" required>
    </div>

    <div class="field">
      <label for="datosTarjeta">Datos que quieres incluir</label>
      <input id="datosTarjeta" type="text" placeholder="Ej: Instagram, WhatsApp, correo, cargo..." required>
    </div>

    <div class="field">
      <label for="detalles">Detalles de diseño</label>
      <input id="detalles" type="text" placeholder="Ej: colores, estilo, logo, doble cara...">
    </div>

    `;

  }


  /* =======================================================
     PAPELERÍA
  ======================================================= */

  return `

  <div class="field">

    <label for="design">

      Diseño / temática

    </label>

    <select
      id="design"
      required>

      <option
        value=""
        disabled
        selected>

        Selecciona un diseño

      </option>

      <option value="Kawaii">
        Kawaii
      </option>

      <option value="Cerezas">
        Cerezas
      </option>

      <option value="Cuadros (gingham)">
        Cuadros (gingham)
      </option>

      <option value="Ositos">
        Ositos
      </option>

      <option value="Conejitos">
        Conejitos
      </option>

      <option value="Arcoíris">
        Arcoíris
      </option>

      <option value="Flores">
        Flores
      </option>

      <option value="Otro">
        Otro / Lo explico por WhatsApp
      </option>

    </select>

  </div>


  <div class="field">

    <label for="customText">

      Nombre o texto

    </label>

    <input
      id="customText"
      type="text"
      placeholder="Ej: Sofía, una frase, nombre del curso...">

    <small>
      Opcional.
    </small>

  </div>

  `;

}



/* =========================================================
   PRODUCTO NO ENCONTRADO
========================================================= */

if(
  !producto
){

  root.innerHTML = `

  <div class="app">

    <div class="error">

      <h1>
        Producto no encontrado
      </h1>

      <p>
        Esta página no tiene un producto válido asignado.
      </p>

      <a href="catalogo.html?categoria=todos">

        Volver al catálogo

      </a>

    </div>

  </div>

  `;

}



/* =========================================================
   RENDER PRINCIPAL
========================================================= */

else{


  document.title =

  `${producto.nombre} | Cortar & Pegar`;


  root.innerHTML = `


  <!-- CARRITO -->

  <div
    class="cart-overlay"
    id="cartOverlay">
  </div>


  <aside
    class="cart-drawer"
    id="cartDrawer">


    <div class="cart-head">


      <h2>
        Tu carrito
      </h2>


      <button
        class="cart-close"
        id="cartClose"
        type="button">

        ×

      </button>


    </div>


    <div
      class="cart-items"
      id="cartItems">
    </div>


    <div class="cart-footer">


      <div class="cart-total-line">


        <span>
          Subtotal
        </span>


        <span
          class="cart-total"
          id="cartSubtotal">

          $0

        </span>


      </div>


      <div
        class="cart-note"
        id="cartNote">
      </div>


      <button
        class="cart-checkout"
        id="cartCheckout"
        type="button">

        Finalizar carrito por WhatsApp

      </button>


      <button
        class="cart-continue"
        id="cartContinue"
        type="button">

        ← Seguir comprando

      </button>


    </div>


  </aside>



  <!-- PÁGINA -->

  <div class="app">


    <header class="top">


      <a
        class="back"
        href="catalogo.html?categoria=${categoriaRegreso}">

        ←

        <span>
          Volver
        </span>

      </a>


      <div class="logo">

        <img
          src="imagenes/logo.png"
          alt="Cortar & Pegar">

      </div>


      <div class="top-actions">


        <a
          class="icon-btn"
          href="index.html"
          aria-label="Inicio">

          <svg viewBox="0 0 24 24">

            <path
              d="M3 11.5 12 4l9 7.5"/>

            <path
              d="M5 10v10h14V10"/>

            <path
              d="M9 20v-6h6v6"/>

          </svg>

        </a>


        <a
          class="icon-btn"
          href="favoritos.html"
          aria-label="Favoritos">

          <svg viewBox="0 0 24 24">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>

          <span class="badge" id="favoriteBadge">0</span>

        </a>


        <button
          class="icon-btn"
          id="cartOpen"
          type="button"
          aria-label="Carrito">

          <svg viewBox="0 0 24 24">

            <path
              d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>

          </svg>


          <span
            class="badge"
            id="cartBadge">

            0

          </span>


        </button>


      </div>


    </header>



    <!-- BREADCRUMB -->

    <div class="breadcrumb">


      <a href="index.html">
        Inicio
      </a>


      <span>
        ›
      </span>


      <a
        href="catalogo.html?categoria=${categoriaRegreso}">

        ${categoriaRegresoMeta.titulo}

      </a>


      <span>
        ›
      </span>


      <strong>

        ${producto.nombre}

      </strong>


    </div>



    <!-- PRODUCTO -->

    <section class="product-layout">


      <!-- IMAGEN -->

      <div class="gallery">


        <div class="product-image">

          ${producto.imagen ? `
          <img
            class="product-photo"
            src="${producto.imagen}"
            alt="${producto.nombre}"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          ` : ""}

          <div class="placeholder" ${producto.imagen ? 'style="display:none"' : ''}>

            <span class="placeholder-emoji">
              ${producto.emoji}
            </span>

            <strong>
              ${producto.imagen ? 'Foto del producto' : 'Imagen del producto'}
            </strong>

            <small>
              ${producto.imagen ? 'La imagen se mostrará cuando esté disponible' : 'Foto próximamente'}
            </small>

          </div>

        </div>


        <p class="image-note">
          ${producto.imagen ? 'Imagen de referencia del producto.' : 'Foto del producto próximamente.'}
        </p>


      </div>



      <!-- INFORMACIÓN -->

      <div>


        <span class="category-pill">

          ${producto.icono}

          ${producto.categoriaNombre}

        </span>


        <h1 class="product-title">

          ${producto.nombre}

        </h1>


        <div class="product-price">

          ${
            producto.precio

            ?

            moneda(
              producto.precio
            )

            :

            "Consultar precio"
          }

        </div>


        <p class="product-description">

          ${producto.descripcion}

        </p>



        <!-- PERSONALIZACIÓN -->

        <div class="custom-box">


          <h2>

            Personaliza tu pedido

          </h2>


          <p>

            Completa los detalles antes de comprar o agregar al carrito.

          </p>


          <form id="productForm">


            ${camposPersonalizacion()}



            <!-- CANTIDAD -->

            <div class="field">


              <label>

                Cantidad

              </label>


              <div class="quantity">


                <button
                  id="qtyMinus"
                  type="button">

                  −

                </button>


                <input
                  id="qty"
                  type="number"
                  min="1"
                  max="99"
                  value="1">


                <button
                  id="qtyPlus"
                  type="button">

                  +

                </button>


              </div>


            </div>



            <!-- FECHA -->

            <div class="field">


              <label for="dateNeeded">

                Fecha que lo necesitas

              </label>


              <input
                id="dateNeeded"
                type="date"
                required>

              <small>
                Fecha mínima: 5 días hábiles desde hoy. La disponibilidad final se confirma por WhatsApp.
              </small>


            </div>



            <!-- RESUMEN -->

            <div class="order-summary">


              <div class="summary-line">


                <span>
                  Producto
                </span>


                <span>
                  ${producto.nombre}
                </span>


              </div>


              <div class="summary-line">


                <span>
                  Cantidad
                </span>


                <span id="summaryQty">

                  1

                </span>


              </div>


              <div class="summary-line total">


                <span>

                  ${
                    producto.precio
                    ?
                    "Total"
                    :
                    "Precio"
                  }

                </span>


                <span id="summaryTotal">

                  ${
                    producto.precio

                    ?

                    moneda(
                      producto.precio
                    )

                    :

                    "Por cotizar"
                  }

                </span>


              </div>


            </div>



            <!-- BOTONES -->

            <div class="actions">


              <button
                class="add-cart"
                id="addToCart"
                type="button">

                Agregar al carrito

              </button>


              <button
                class="buy-now"
                type="submit">

                ${
                  producto.precio
                  ?
                  "Comprar ahora"
                  :
                  "Solicitar por WhatsApp"
                }

              </button>


            </div>


          </form>


        </div>



        <!-- BENEFICIOS -->

        <div class="benefits">


          <div class="benefit">

            <span>
              ♡
            </span>

            Personalizado

          </div>


          <div class="benefit">

            <span>
              🚚
            </span>

            Envíos a todo Chile

          </div>


          <div class="benefit">

            <span>
              ✦
            </span>

            Hecho con dedicación

          </div>


        </div>


      </div>


    </section>



    <footer>

      Cortar & Pegar ·
      <a href="https://www.instagram.com/cortar_y.pegar/" target="_blank" rel="noopener noreferrer">@cortar_y.pegar</a>
      ·
      <a href="https://wa.me/56950375836" target="_blank" rel="noopener noreferrer">WhatsApp</a>

    </footer>


  </div>

  `;


  iniciarProducto();

}



/* =========================================================
   FUNCIONES
========================================================= */

function iniciarProducto(){


  const $ =
  id =>
  document.getElementById(
    id
  );




  function actualizarContadorFavoritos(){

    let favoritos = [];

    try{
      const datos = JSON.parse(localStorage.getItem(FAVORITES_KEY));
      favoritos = Array.isArray(datos) ? datos : [];
    }
    catch{
      favoritos = [];
    }

    const badge = $("favoriteBadge");

    if(badge){
      badge.textContent = favoritos.length > 99 ? "99+" : favoritos.length;
    }

  }

  /* =======================================================
     FECHA
  ======================================================= */

  const MIN_DIAS_HABILES = 5;

  function sumarDiasHabiles(fecha,dias){
    const resultado = new Date(fecha);
    let agregados = 0;
    while(agregados < dias){
      resultado.setDate(resultado.getDate()+1);
      const dia = resultado.getDay();
      if(dia !== 0 && dia !== 6) agregados++;
    }
    return resultado;
  }

  const fechaMinima = sumarDiasHabiles(new Date(),MIN_DIAS_HABILES);

  $("dateNeeded").min =
  `${fechaMinima.getFullYear()}-${String(fechaMinima.getMonth()+1).padStart(2,"0")}-${String(fechaMinima.getDate()).padStart(2,"0")}`;



  /* =======================================================
     CANTIDAD
  ======================================================= */

  function cantidadActual(){


    let cantidad =

    Number(
      $("qty").value
    );


    if(
      !cantidad
      ||
      cantidad < 1
    ){

      cantidad =
      1;

    }


    if(
      cantidad > 99
    ){

      cantidad =
      99;

    }


    cantidad =

    Math.round(
      cantidad
    );


    $("qty").value =
    cantidad;


    return cantidad;

  }



  function actualizarResumen(){


    const cantidad =
    cantidadActual();


    $("summaryQty")
    .textContent =
    cantidad;


    $("summaryTotal")
    .textContent =

    producto.precio

    ?

    moneda(

      producto.precio
      *
      cantidad

    )

    :

    "Por cotizar";

  }



  $("qtyMinus").onclick =
  () => {


    $("qty").value =

    Math.max(

      1,

      cantidadActual()
      -
      1

    );


    actualizarResumen();

  };



  $("qtyPlus").onclick =
  () => {


    $("qty").value =

    Math.min(

      99,

      cantidadActual()
      +
      1

    );


    actualizarResumen();

  };



  $("qty")
  .addEventListener(
    "input",
    actualizarResumen
  );



  /* =======================================================
     PERSONALIZACIÓN
  ======================================================= */

  function obtenerDetalles(){


    /* SENSORIAL */

    if(
      producto.tipo ===
      "sensorial"
    ){


      return {

        preferencia:

        $("preferencia")
        ?.value
        .trim()

        ||

        "-"

      };


    }



    /* STICKERS */

    if(
      producto.tipo ===
      "stickers"
    ){


      return {

        tematica:

        $("tematica")
        .value
        .trim(),


        detalles:

        $("detalles")
        .value
        .trim()

        ||

        "-"

      };


    }



    /* IMPRESIÓN 3D */

    if(
      producto.tipo ===
      "impresion3d"
    ){


      return {

        figura:

        $("figura")
        .value
        .trim(),


        tamano:

        $("tamano")
        .value
        .trim()

        ||

        "-",


        detalles:

        $("detalles")
        .value
        .trim()

        ||

        "-"

      };


    }



    /* SET */

    if(
      producto.tipo ===
      "set"
    ){

      return {
        diseño: $("design").value.trim(),
        texto: $("customText").value.trim() || "-"
      };

    }


    /* TARJETAS */

    if(
      producto.tipo ===
      "tarjetas"
    ){

      return {
        marca: $("marca").value.trim(),
        datos: $("datosTarjeta").value.trim(),
        detalles: $("detalles").value.trim() || "-"
      };

    }


    /* PAPELERÍA */

    return {

      diseño:

      $("design")
      .value,


      texto:

      $("customText")
      .value
      .trim()

      ||

      "-"

    };


  }



  /* =======================================================
     CREAR ITEM
  ======================================================= */

  function crearItem(){


    if(
      !$("productForm")
      .reportValidity()
    ){

      return null;

    }


    return {

      id:
      crearId(),

      productId:
      PRODUCT_ID,

      product:
      producto.nombre,

      price:
      producto.precio,

      qty:
      cantidadActual(),

      date:
      $("dateNeeded")
      .value,

      details:
      obtenerDetalles()

    };

  }



  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  function obtenerCarrito(){


    try{


      const datos =

      JSON.parse(

        localStorage
        .getItem(
          CART_KEY
        )

      );


      return Array.isArray(
        datos
      )

      ?

      datos

      :

      [];


    }
    catch{


      return [];


    }


  }



  function guardarCarrito(
    carrito
  ){


    localStorage
    .setItem(

      CART_KEY,

      JSON.stringify(
        carrito
      )

    );


    renderCarrito();

  }



  /* =======================================================
     ABRIR / CERRAR CARRITO
  ======================================================= */

  function abrirCarrito(){


    $("cartOverlay")
    .classList
    .add(
      "on"
    );


    $("cartDrawer")
    .classList
    .add(
      "on"
    );


    document
    .body
    .classList
    .add(
      "cart-open"
    );


    renderCarrito();

  }



  function cerrarCarrito(){


    $("cartOverlay")
    .classList
    .remove(
      "on"
    );


    $("cartDrawer")
    .classList
    .remove(
      "on"
    );


    document
    .body
    .classList
    .remove(
      "cart-open"
    );


  }



  $("cartOpen").onclick =
  abrirCarrito;


  $("cartClose").onclick =
  cerrarCarrito;


  $("cartOverlay").onclick =
  cerrarCarrito;


  $("cartContinue").onclick =
  cerrarCarrito;



  /* =======================================================
     AGREGAR AL CARRITO
  ======================================================= */

  $("addToCart").onclick =
  () => {


    const nuevo =
    crearItem();


    if(
      !nuevo
    ){

      return;

    }



    const carrito =
    obtenerCarrito();



    const mismo =

    carrito.find(
      item =>


      item.productId ===
      nuevo.productId


      &&


      JSON.stringify(
        item.details || {}
      )

      ===

      JSON.stringify(
        nuevo.details || {}
      )


      &&


      item.date ===
      nuevo.date


    );



    if(
      mismo
    ){


      mismo.qty =

      Math.min(

        99,

        (
          Number(
            mismo.qty
          )
          ||
          1
        )

        +

        nuevo.qty

      );


    }
    else{


      carrito.push(
        nuevo
      );


    }



    guardarCarrito(
      carrito
    );


    abrirCarrito();


  };



  /* =======================================================
     RENDER CARRITO
  ======================================================= */

  function etiquetaDetalle(k){
    const mapa={
      "diseño":"Diseño","texto":"Texto","tematica":"Temática","preferencia":"Preferencia",
      "figura":"Figura","tamano":"Tamaño","acabado":"Acabado","medida":"Medida",
      "caras":"Caras","material":"Material","marca":"Marca","detalles":"Detalles","unidades":"Cantidad"
    };
    return mapa[k] || k.charAt(0).toUpperCase()+k.slice(1);
  }

  function renderCarrito(){
    const carrito=obtenerCarrito();
    const cantidadTotal=carrito.reduce((total,item)=>total+(item.cartMode==="fixed-price"?1:(Number(item.qty)||1)),0);
    $("cartBadge").textContent=cantidadTotal>99?"99+":cantidadTotal;

    if(!carrito.length){
      $("cartItems").innerHTML=`<div class="cart-empty"><span>🛍️</span>Tu carrito está vacío</div>`;
      $("cartSubtotal").textContent="$0";
      $("cartNote").textContent="";
      $("cartCheckout").disabled=true;
      return;
    }

    $("cartCheckout").disabled=false;
    let subtotal=0;
    let hayCotizacion=false;

    $("cartItems").innerHTML=carrito.map(item=>{
      const cantidad=Number(item.qty)||1;
      const precio=Number(item.price)||0;
      const total=item.cartMode==="fixed-price"?precio:precio*cantidad;
      if(precio) subtotal+=total; else hayCotizacion=true;
      const controles=item.cartMode==="fixed-price"
        ? `<div class="cart-fixed">${escapar(item.fixedUnits?item.fixedUnits+" unidades":"Precio cerrado")}</div>`
        : `<div class="cart-qty"><button data-action="minus" type="button">−</button><span>${cantidad}</span><button data-action="plus" type="button">+</button></div>`;
      const fecha=item.date?`<br>Fecha: ${escapar(fechaBonita(item.date))}`:"";
      return `<article class="cart-item" data-id="${escapar(item.id)}"><div class="cart-item-top"><div class="cart-item-name">${escapar(item.product||"Producto")}</div><button class="cart-remove" data-action="remove" type="button">×</button></div><div class="cart-details">${escapar(textoDetallesItem(item))}${fecha}</div><div class="cart-bottom">${controles}<div class="cart-price">${precio?moneda(total):"Por cotizar"}</div></div></article>`;
    }).join("");

    $("cartSubtotal").textContent=moneda(subtotal);
    $("cartNote").textContent=hayCotizacion?"El subtotal no incluye productos por cotizar.":"";
  }

  /* =======================================================
     MODIFICAR CARRITO
  ======================================================= */

  $("cartItems").onclick=e=>{
    const boton=e.target.closest("[data-action]");
    if(!boton)return;
    const card=boton.closest("[data-id]");
    if(!card)return;
    const carrito=obtenerCarrito();
    const index=carrito.findIndex(item=>String(item.id)===card.dataset.id);
    if(index===-1)return;
    const accion=boton.dataset.action;
    if(accion==="remove")carrito.splice(index,1);
    else if(carrito[index].cartMode!=="fixed-price"){
      if(accion==="plus")carrito[index].qty=Math.min(99,(Number(carrito[index].qty)||1)+1);
      if(accion==="minus"){
        carrito[index].qty=(Number(carrito[index].qty)||1)-1;
        if(carrito[index].qty<=0)carrito.splice(index,1);
      }
    }
    guardarCarrito(carrito);
  };

  /* =======================================================
     COMPRAR AHORA
  ======================================================= */

  $("productForm")
  .onsubmit =
  e => {


    e.preventDefault();



    const item =
    crearItem();



    if(
      !item
    ){

      return;

    }



    const total =

    item.price

    ?

    moneda(

      item.price
      *
      item.qty

    )

    :

    "Por cotizar";



    const mensaje =

`Hola Cortar y Pegar! Quiero hacer un pedido:

• Producto: ${item.product}
• ${textoDetallesItem(item)}
• Cantidad: ${item.qty}
• Fecha: ${fechaBonita(item.date)}
• Total: ${total}`;



    window.open(

      `https://wa.me/${WA}?text=${encodeURIComponent(mensaje)}`,

      "_blank"

    );


  };



  /* =======================================================
     FINALIZAR CARRITO
  ======================================================= */

  $("cartCheckout").onclick=()=>{
    const carrito=obtenerCarrito();
    if(!carrito.length)return;
    let subtotal=0;
    let hayCotizacion=false;
    const lineas=carrito.map((item,index)=>{
      const cantidad=Number(item.qty)||1;
      const precio=Number(item.price)||0;
      const total=item.cartMode==="fixed-price"?precio:precio*cantidad;
      if(precio)subtotal+=total;else hayCotizacion=true;
      const cantidadTexto=item.cartMode==="fixed-price"?(item.fixedUnits+" unidades"):cantidad;
      const fecha=item.date?`\nFecha: ${fechaBonita(item.date)}`:"";
      return `${index+1}. ${item.product}\n${textoDetallesItem(item)}\nCantidad: ${cantidadTexto} · ${precio?monedaCorta(total):"Por cotizar"}${fecha}`;
    }).join("\n\n");
    const mensaje=`Hola Cortar y Pegar! Quiero hacer este pedido:\n\n${lineas}\n\nSubtotal: ${moneda(subtotal)}${hayCotizacion?"\nHay productos por cotizar.":""}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(mensaje)}`,"_blank");
  };

  /* =======================================================
     ESC
  ======================================================= */

  document
  .addEventListener(
    "keydown",
    e => {


      if(
        e.key ===
        "Escape"
      ){


        cerrarCarrito();


      }


    }
  );



  /* =======================================================
     INICIAR
  ======================================================= */

  actualizarResumen();

  actualizarContadorFavoritos();

  renderCarrito();


}