const WA = "56950375836";
const CART_KEY = "cortarPegarCartV1";
const FAVORITES_KEY = "cortarPegarFavoritesV1";
const PRODUCTOS = window.CP_PRODUCTOS || {};
const ID = document.body.dataset.negocio;
const producto = PRODUCTOS[ID];
const $ = id => document.getElementById(id);

const CATEGORIAS = window.CP_CATEGORIAS || {};
const paramsPagina = new URLSearchParams(window.location.search);
const desdeSolicitado = paramsPagina.get("desde");
const categoriaRegreso =
  desdeSolicitado === "todos" || CATEGORIAS[desdeSolicitado]
    ? (desdeSolicitado || producto?.categoria || "negocios")
    : (producto?.categoria || "negocios");
const categoriaRegresoMeta =
  categoriaRegreso === "todos"
    ? {titulo:"Todos los productos"}
    : (CATEGORIAS[categoriaRegreso] || {titulo:producto?.categoriaNombre || "Productos"});
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

function fechaISO(fecha){
  return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
}

function fechaBonita(fecha){
  return fecha ? fecha.split("-").reverse().join("/") : "-";
}

function moneda(v){
  return "$" + Number(v).toLocaleString("es-CL") + " CLP";
}

function escapar(texto){
  return String(texto ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function crearId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

/* =========================
   FAVORITOS
========================= */
function obtenerFavoritos(){
  try{
    const d = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(d) ? d : [];
  }catch{
    return [];
  }
}

function guardarFavoritos(d){
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(d)]));
  actualizarFavoritos();
}

function actualizarFavoritos(){
  const f = obtenerFavoritos();
  $("favoriteBadge").textContent = f.length > 99 ? "99+" : f.length;
  const on = f.includes(ID);
  $("favProduct").classList.toggle("on",on);
  $("favProduct").textContent = on ? "♥" : "♡";
  $("favProduct").setAttribute("aria-pressed", on ? "true" : "false");
}

function alternarFavorito(){
  let f = obtenerFavoritos();
  f = f.includes(ID) ? f.filter(x => x !== ID) : [...f,ID];
  guardarFavoritos(f);
}

/* =========================
   PRECIOS / OPCIONES
========================= */
function combos(fields){
  if(!fields.length) return [[]];
  return fields.reduce(
    (acc,f) => acc.flatMap(a => f.options.map(o => [...a,o])),
    [[]]
  );
}

function keyActual(){
  const vals = producto.negocio.fields.map(f => $(f.id).value);
  vals.push(String($("cantidad").value));
  return vals.join("|");
}

function precioActual(){
  return Number(producto.negocio.prices[keyActual()] || 0);
}

function filasTabla(){
  const n = producto.negocio;
  const rows = combos(n.fields);
  return rows.map(vals => {
    const label = vals.length ? vals.join(" · ") : (n.rowLabel || producto.nombre);
    const celdas = n.quantities.map(q => {
      const key = [...vals,String(q)].join("|");
      const p = n.prices[key];
      return `<td class="price-cell">${p ? moneda(p) : "—"}</td>`;
    }).join("");
    return `<tr><td>${escapar(label)}</td>${celdas}</tr>`;
  }).join("");
}

function tabla(){
  const n = producto.negocio;
  return `<div class="table-wrap"><table><thead><tr><th>Opción</th>${n.quantities.map(q=>`<th>${q} unid.</th>`).join("")}</tr></thead><tbody>${filasTabla()}</tbody></table></div>`;
}

function campos(){
  const n = producto.negocio;
  return n.fields.map(f => `
    <div class="field">
      <label for="${f.id}">${escapar(f.label)}</label>
      <select id="${f.id}" required>
        ${f.options.map(o=>`<option value="${escapar(o)}">${escapar(o)}</option>`).join("")}
      </select>
    </div>
  `).join("") + `
    <div class="field">
      <label for="cantidad">Cantidad</label>
      <select id="cantidad" required>
        ${n.quantities.map(q=>`<option value="${q}">${q} unidades</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="marca">Nombre / marca</label>
      <input id="marca" type="text" placeholder="Ej: nombre de tu emprendimiento">
    </div>
    <div class="field">
      <label for="fechaNegocio">Fecha que lo necesitas</label>
      <input id="fechaNegocio" type="date" required>
      <small>Fecha mínima: 5 días hábiles desde hoy. La disponibilidad final se confirma por WhatsApp.</small>
    </div>
    <div class="field full">
      <label for="detalles">Detalles del diseño</label>
      <textarea id="detalles" placeholder="Colores, texto, redes sociales, logo, estilo, indicaciones especiales..."></textarea>
      <small>Puedes enviar referencias o tu logo directamente por WhatsApp después.</small>
    </div>`;
}

function actualizarResumen(){
  const p = precioActual();
  $("summaryVariant").textContent = producto.negocio.fields.map(f=>$(f.id).value).join(" · ") || producto.negocio.rowLabel || "Estándar";
  $("summaryQty").textContent = $("cantidad").value + " unidades";
  $("summaryTotal").textContent = p ? moneda(p) : "Selecciona una opción";
}

function opcionesActuales(){
  const details = {};
  producto.negocio.fields.forEach(f => details[f.id] = $(f.id).value);
  const marca = $("marca").value.trim();
  const extra = $("detalles").value.trim();
  if(marca) details.marca = marca;
  if(extra) details.detalles = extra;
  return details;
}

function textoOpcionesWhatsApp(){
  const partes = producto.negocio.fields.map(f => `• ${f.label}: ${$(f.id).value}`);
  partes.push(`• Cantidad: ${$("cantidad").value} unidades`);
  partes.push(`• Marca: ${$("marca").value.trim() || "-"}`);
  partes.push(`• Fecha: ${fechaBonita($("fechaNegocio").value)}`);
  partes.push(`• Detalles: ${$("detalles").value.trim() || "-"}`);
  return partes.join("\n");
}

/* =========================
   CARRITO
========================= */
function obtenerCarrito(){
  try{
    const d = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(d) ? d : [];
  }catch{
    return [];
  }
}

function guardarCarrito(carrito){
  localStorage.setItem(CART_KEY,JSON.stringify(carrito));
  renderCarrito();
}

function etiquetaDetalle(k){
  const mapa = {
    "diseño":"Diseño",
    "texto":"Texto",
    "tematica":"Temática",
    "preferencia":"Preferencia",
    "figura":"Figura",
    "tamano":"Tamaño",
    "acabado":"Acabado",
    "medida":"Medida",
    "caras":"Caras",
    "material":"Material",
    "marca":"Marca",
    "detalles":"Detalles",
    "unidades":"Cantidad"
  };
  return mapa[k] || k.charAt(0).toUpperCase()+k.slice(1);
}

function textoDetallesItem(item){
  const d = item.details || {};
  const partes = Object.entries(d)
    .filter(([,v]) => v !== "" && v !== "-" && v != null)
    .map(([k,v]) => `${etiquetaDetalle(k)}: ${v}`);
  if(!partes.length && item.design) partes.push(`Diseño: ${item.design}`);
  if(!partes.length) return "Sin detalles adicionales";
  return partes.join(" · ");
}

function cantidadBadge(carrito){
  return carrito.reduce((t,item)=>t + (item.cartMode === "fixed-price" ? 1 : (Number(item.qty)||1)),0);
}

function renderCarrito(){
  const carrito = obtenerCarrito();
  $("cartBadge").textContent = cantidadBadge(carrito) > 99 ? "99+" : cantidadBadge(carrito);
  const box = $("cartItems");

  if(!carrito.length){
    box.innerHTML = `<div class="cart-empty">Tu carrito está vacío ♡</div>`;
    $("cartSubtotal").textContent = "$0";
    $("cartCheckout").disabled = true;
    return;
  }

  $("cartCheckout").disabled = false;
  let subtotal = 0;
  let cotizar = false;

  box.innerHTML = carrito.map(item => {
    const precio = Number(item.price)||0;
    const qty = Number(item.qty)||1;
    if(precio) subtotal += item.cartMode === "fixed-price" ? precio : precio*qty;
    else cotizar = true;

    const controlCantidad = item.cartMode === "fixed-price"
      ? `<div class="cart-fixed">${escapar(item.fixedUnits ? item.fixedUnits+" unidades" : "Precio cerrado")}</div>`
      : `<div class="cart-qty"><button type="button" data-action="minus">−</button><span>${qty}</span><button type="button" data-action="plus">+</button></div>`;

    const totalLinea = item.cartMode === "fixed-price" ? precio : precio*qty;

    return `<article class="cart-item" data-cart-id="${escapar(item.id)}">
      <div class="cart-item-top">
        <div class="cart-item-name">${escapar(item.product || "Producto")}</div>
        <button class="cart-remove" data-action="remove" type="button">×</button>
      </div>
      <div class="cart-details">${escapar(textoDetallesItem(item))}${item.date ? `<br>Fecha: ${escapar(fechaBonita(item.date))}` : ""}</div>
      <div class="cart-item-bottom">${controlCantidad}<div class="cart-price">${precio ? moneda(totalLinea) : "Por cotizar"}</div></div>
    </article>`;
  }).join("");

  $("cartSubtotal").textContent = moneda(subtotal);
  $("cartNote").textContent = cotizar ? "El subtotal no incluye productos por cotizar." : "";
}

function abrirCarrito(){
  $("cartOverlay").classList.add("on");
  $("cartDrawer").classList.add("on");
  document.body.classList.add("cart-open");
  renderCarrito();
}

function cerrarCarrito(){
  $("cartOverlay").classList.remove("on");
  $("cartDrawer").classList.remove("on");
  document.body.classList.remove("cart-open");
}

function crearItemNegocio(){
  if(!$("orderForm").reportValidity()) return null;
  const p = precioActual();
  if(!p) return null;
  return {
    id: crearId(),
    productId: ID,
    product: producto.nombre,
    price: p,
    qty: 1,
    cartMode: "fixed-price",
    fixedUnits: Number($("cantidad").value),
    date: $("fechaNegocio").value,
    details: opcionesActuales()
  };
}

function agregarAlCarrito(){
  const nuevo = crearItemNegocio();
  if(!nuevo){
    alert("Selecciona una combinación válida.");
    return;
  }
  const carrito = obtenerCarrito();
  const firma = JSON.stringify({productId:nuevo.productId,details:nuevo.details,price:nuevo.price,date:nuevo.date});
  const existe = carrito.some(item => JSON.stringify({productId:item.productId,details:item.details,price:item.price,date:item.date}) === firma);
  if(!existe) carrito.push(nuevo);
  guardarCarrito(carrito);
  abrirCarrito();
}

function checkoutCarrito(){
  const carrito = obtenerCarrito();
  if(!carrito.length) return;
  let subtotal = 0;
  let hayCotizacion = false;
  const lineas = carrito.map((item,index)=>{
    const precio = Number(item.price)||0;
    const qty = Number(item.qty)||1;
    const total = item.cartMode === "fixed-price" ? precio : precio*qty;
    if(precio) subtotal += total; else hayCotizacion = true;
    const cantidad = item.cartMode === "fixed-price" ? (item.fixedUnits+" unidades") : qty;
    return `${index+1}. ${item.product}\n${textoDetallesItem(item)}\nCantidad: ${cantidad} · ${precio ? moneda(total) : "Por cotizar"}${item.date ? `\nFecha: ${fechaBonita(item.date)}` : ""}`;
  }).join("\n\n");
  const msg = `Hola Cortar y Pegar! Quiero hacer este pedido:\n\n${lineas}\n\nSubtotal: ${moneda(subtotal)}${hayCotizacion ? "\nHay productos por cotizar." : ""}`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank");
}

/* =========================
   RENDER PÁGINA
========================= */
if(!producto || producto.tipo !== "negocio"){
  document.body.innerHTML = `<main class="not-found"><h1>Producto no encontrado</h1><a href="catalogo.html?categoria=todos">Volver al catálogo</a></main>`;
}else{
  document.title = producto.nombre + " | Cortar & Pegar";
  const visual = producto.imagen
    ? `<div class="visual"><span class="visual-fallback">${producto.emoji}</span><img class="business-photo" src="${producto.imagen}" alt="${escapar(producto.nombre)}" onerror="this.style.display='none'"><button class="fav" id="favProduct" type="button" aria-pressed="false">♡</button></div>`
    : `<div class="visual"><span class="visual-fallback">${producto.emoji}</span><button class="fav" id="favProduct" type="button" aria-pressed="false">♡</button></div>`;

  $("app").innerHTML = `
    <div class="cart-overlay" id="cartOverlay"></div>
    <aside class="cart-drawer" id="cartDrawer">
      <div class="cart-head"><h2>Tu carrito</h2><button class="cart-close" id="cartClose" type="button">×</button></div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-footer">
        <div class="cart-total-line"><span>Subtotal</span><strong id="cartSubtotal">$0</strong></div>
        <div class="cart-note" id="cartNote"></div>
        <button class="cart-checkout" id="cartCheckout" type="button">Finalizar carrito por WhatsApp</button>
        <button class="cart-continue" id="cartContinue" type="button">← Seguir comprando</button>
      </div>
    </aside>

    <header class="top">
      <a class="back" href="catalogo.html?categoria=${categoriaRegreso}">← <span>Volver</span></a>
      <div class="logo"><img src="imagenes/logo.png" alt="Cortar & Pegar"></div>
      <div class="actions">
        <a class="icon" href="favoritos.html" aria-label="Favoritos"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg><span class="badge" id="favoriteBadge">0</span></a>
        <button class="icon" id="cartOpen" type="button" aria-label="Carrito"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/></svg><span class="badge" id="cartBadge">0</span></button>
        <a class="icon" href="index.html" aria-label="Inicio"><svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5M5 10v10h14V10M9 20v-6h6v6"/></svg></a>
      </div>
    </header>

    <div class="breadcrumb"><a href="index.html">Inicio</a> · <a href="catalogo.html?categoria=${categoriaRegreso}">${categoriaRegresoMeta.titulo}</a> · ${producto.nombre}</div>

    <section class="hero">${visual}<div><span class="pill">${producto.icono} ${producto.categoriaNombre}</span><h1 class="title">${producto.nombre}</h1><div class="price-from">Desde ${moneda(producto.precioDesde)}</div><p class="desc">${producto.descripcion}</p></div></section>

    <section class="price-section"><h2>Precios</h2><p class="sub">Elige la combinación que necesitas. Los valores corresponden al total por la cantidad indicada.</p>${tabla()}</section>

    <section class="order-box"><h2>Arma tu pedido</h2><p class="sub">Selecciona tus opciones. Puedes guardarlo en el carrito o enviarlo directamente por WhatsApp.</p><form id="orderForm"><div class="form-grid">${campos()}</div><div class="summary"><div class="sum-row"><span>Opción</span><strong id="summaryVariant"></strong></div><div class="sum-row"><span>Cantidad</span><strong id="summaryQty"></strong></div><div class="sum-row total"><span>Total</span><span id="summaryTotal"></span></div></div><div class="order-actions"><button class="add-cart" id="addToCart" type="button">Agregar al carrito</button><button class="wa" type="submit">Comprar ahora por WhatsApp →</button></div><p class="note">Los detalles finales del diseño se confirman por WhatsApp antes de producir.</p></form></section>

    <footer>Cortar & Pegar · <a href="https://www.instagram.com/cortar_y.pegar/" target="_blank" rel="noopener noreferrer">@cortar_y.pegar</a> · <a href="https://wa.me/56950375836" target="_blank" rel="noopener noreferrer">WhatsApp</a></footer>`;

  $("favProduct").onclick = alternarFavorito;
  actualizarFavoritos();

  const fechaMinimaNegocio = sumarDiasHabiles(new Date(),MIN_DIAS_HABILES);
  $("fechaNegocio").min = fechaISO(fechaMinimaNegocio);

  [...producto.negocio.fields.map(f=>$(f.id)),$("cantidad")].forEach(el=>el.addEventListener("change",actualizarResumen));
  actualizarResumen();

  $("cartOpen").onclick = abrirCarrito;
  $("cartClose").onclick = cerrarCarrito;
  $("cartOverlay").onclick = cerrarCarrito;
  $("cartContinue").onclick = cerrarCarrito;
  $("cartCheckout").onclick = checkoutCarrito;
  $("addToCart").onclick = agregarAlCarrito;

  $("cartItems").onclick = e => {
    const boton = e.target.closest("[data-action]");
    if(!boton) return;
    const card = boton.closest("[data-cart-id]");
    if(!card) return;
    const carrito = obtenerCarrito();
    const index = carrito.findIndex(x=>String(x.id)===card.dataset.cartId);
    if(index===-1) return;
    if(boton.dataset.action === "remove") carrito.splice(index,1);
    else if(carrito[index].cartMode !== "fixed-price"){
      if(boton.dataset.action === "plus") carrito[index].qty = Math.min(99,(Number(carrito[index].qty)||1)+1);
      if(boton.dataset.action === "minus"){
        carrito[index].qty = (Number(carrito[index].qty)||1)-1;
        if(carrito[index].qty<=0) carrito.splice(index,1);
      }
    }
    guardarCarrito(carrito);
  };

  $("orderForm").onsubmit = e => {
    e.preventDefault();
    if(!$("orderForm").reportValidity()) return;
    const p = precioActual();
    if(!p){ alert("Selecciona una combinación válida."); return; }
    const msg = `Hola Cortar y Pegar! Quiero hacer un pedido:\n\n• Producto: ${producto.nombre}\n${textoOpcionesWhatsApp()}\n• Total: ${moneda(p)}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank");
  };

  renderCarrito();
  document.addEventListener("keydown",e=>{ if(e.key === "Escape") cerrarCarrito(); });
}
