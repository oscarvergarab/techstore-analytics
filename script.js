// TechStore Analytics Premium - versión corregida: indicadores locales + GA4 view_item - 2026-08-17
const CONFIG = window.TECHSTORE_CONFIG || {};
const GA_ID = String(CONFIG.GA_MEASUREMENT_ID || '').trim();

const products = [
  {id:'TS-LAP-01',name:'Laptop Pro X15',category:'Computadores',price:2899900,oldPrice:3299900,rating:4.9,badge:'Premium',image:'assets/laptop-premium.png',description:'Portátil premium con acabado metálico y alto rendimiento para productividad, analítica y trabajo profesional.',specs:['Pantalla 15,6” de alta resolución','16 GB RAM','SSD 512 GB','Cuerpo metálico ultradelgado']},
  {id:'TS-MON-01',name:'Monitor Vision 24',category:'Computadores',price:679900,oldPrice:749900,rating:4.8,badge:'Workspace',image:'assets/monitor-premium.png',description:'Monitor elegante para trabajo de oficina, visualización y análisis con estética moderna.',specs:['24 pulgadas','Full HD','Soporte minimalista','Diseño de bisel delgado']},
  {id:'TS-PHO-01',name:'Smartphone Nova 5G',category:'Móviles',price:1499900,oldPrice:1699900,rating:4.8,badge:'Nuevo',image:'assets/smartphone-premium.png',description:'Smartphone de diseño limpio con gran pantalla, conectividad avanzada y estilo sofisticado.',specs:['Pantalla AMOLED','128 GB','5G','Diseño delgado premium']},
  {id:'TS-WAT-01',name:'Smartwatch Prestige',category:'Móviles',price:399900,oldPrice:459900,rating:4.7,badge:'Lifestyle',image:'assets/smartwatch-premium.png',description:'Reloj inteligente con look premium, ideal para bienestar, notificaciones y estilo diario.',specs:['Esfera de alta definición','Monitoreo diario','Diseño elegante','Correa premium']},
  {id:'TS-AUD-01',name:'Audífonos AirBeat Pro',category:'Audio',price:289900,oldPrice:349900,rating:4.7,badge:'Top ventas',image:'assets/headphones-premium.png',description:'Audífonos over-ear con estética sobria, confort y sonido envolvente para uso prolongado.',specs:['Cancelación de ruido','Conectividad inalámbrica','Batería extendida','Almohadillas confort']},
  {id:'TS-SPK-01',name:'Speaker SoundGo Mini',category:'Audio',price:219900,oldPrice:249900,rating:4.6,badge:'Portable',image:'assets/speaker-premium.png',description:'Altavoz compacto y elegante para espacios modernos y movilidad diaria.',specs:['Bluetooth','Diseño portátil','Sonido claro','Correa integrada']},
  {id:'TS-KEY-01',name:'Teclado Mecánico K87',category:'Accesorios',price:249900,oldPrice:289900,rating:4.8,badge:'Setup',image:'assets/keyboard-premium.png',description:'Teclado compacto de inspiración mecánica para un escritorio premium y eficiente.',specs:['Formato compacto','Respuesta precisa','Perfil elegante','Ideal para setup']},
  {id:'TS-MOU-01',name:'Mouse Ergo Flow',category:'Accesorios',price:129900,oldPrice:159900,rating:4.7,badge:'Ergonomic',image:'assets/mouse-premium.png',description:'Mouse ergonómico con diseño profesional para jornadas largas de trabajo.',specs:['Ergonomía avanzada','Acabado texturizado','Conectividad inalámbrica','Control preciso']},
  {id:'TS-PWR-01',name:'Power Bank 20K',category:'Accesorios',price:169900,oldPrice:199900,rating:4.5,badge:'Power',image:'assets/powerbank-premium.png',description:'Batería externa de alta capacidad para mantener tu ecosistema tecnológico siempre activo.',specs:['20.000 mAh','USB-C','Carga rápida','Perfil delgado']}
];

const CART_KEY = 'techstore_cart_premium';
const LOCAL_ANALYTICS_KEY = 'techstore_local_analytics_v3';
const VISITOR_KEY = 'techstore_demo_visitor_v3';
const SESSION_KEY = 'techstore_demo_session_v3';

function loadCart(){
  try{
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }catch(error){
    console.warn('[TechStore] El carrito guardado estaba dañado y fue reiniciado.', error);
    try{ localStorage.removeItem(CART_KEY); }catch(_error){}
    return {};
  }
}

let cart = loadCart();
let activeCategory = 'Todos';
let currentSearch = '';
let toastTimer = null;

function formatCOP(value){
  return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(value)||0);
}
function formatNumber(value){ return new Intl.NumberFormat('es-CO').format(Number(value)||0); }
function ecommerceItem(product, quantity=1){
  return {item_id:product.id,item_name:product.name,item_category:product.category,price:product.price,quantity};
}
function defaultLocalAnalytics(){
  return {users:0,sessions:0,pageViews:0,purchases:0,revenue:0,events:0,productViews:0,addsToCart:0,checkouts:0,transactions:[],lastEvent:null};
}
function loadLocalAnalytics(){
  try{
    return {...defaultLocalAnalytics(), ...JSON.parse(localStorage.getItem(LOCAL_ANALYTICS_KEY) || '{}')};
  }catch(e){ return defaultLocalAnalytics(); }
}
function saveLocalAnalytics(data){
  try{
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(data));
  }catch(error){
    console.error('[TechStore] No fue posible guardar los indicadores locales.', error);
  }
  renderLocalAnalytics(data);
}
function initializeLocalAnalytics(){
  const data = loadLocalAnalytics();
  try{
    if(!localStorage.getItem(VISITOR_KEY)){
      localStorage.setItem(VISITOR_KEY, `visitor-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
      data.users += 1;
    }
    if(!sessionStorage.getItem(SESSION_KEY)){
      sessionStorage.setItem(SESSION_KEY, `session-${Date.now()}`);
      data.sessions += 1;
    }
  }catch(error){
    // El tablero sigue funcionando en memoria aunque el navegador limite el almacenamiento.
    console.warn('[TechStore] Almacenamiento del navegador limitado.', error);
    data.users = Math.max(1, Number(data.users) || 0);
    data.sessions = Math.max(1, Number(data.sessions) || 0);
  }
  data.pageViews += 1;
  data.events += 1;
  data.lastEvent = {name:'page_view',time:new Date().toISOString()};
  saveLocalAnalytics(data);
}
function recordLocalEvent(name, params={}){
  const data = loadLocalAnalytics();
  data.events += 1;
  if(name === 'view_item') data.productViews += 1;
  if(name === 'add_to_cart') data.addsToCart += 1;
  if(name === 'begin_checkout') data.checkouts += 1;
  if(name === 'purchase'){
    data.purchases += 1;
    data.revenue += Number(params.value) || 0;
    data.transactions.unshift({
      id: params.transaction_id || `TSP-${Date.now()}`,
      time: new Date().toISOString(),
      value: Number(params.value)||0,
      items: Array.isArray(params.items) ? params.items.map(i=>({name:i.item_name,quantity:i.quantity,price:i.price})) : []
    });
    data.transactions = data.transactions.slice(0,20);
  }
  data.lastEvent = {name,time:new Date().toISOString()};
  saveLocalAnalytics(data);
}
function renderLocalAnalytics(data=loadLocalAnalytics()){
  const conversion = data.sessions ? (data.purchases / data.sessions) * 100 : 0;
  const setText = (id,value)=>{ const el=document.getElementById(id); if(el) el.textContent=value; };
  setText('kpiUsers', formatNumber(data.users));
  setText('kpiSessions', formatNumber(data.sessions));
  setText('kpiConversion', `${conversion.toFixed(1).replace('.',',')}%`);
  setText('kpiPurchases', formatNumber(data.purchases));
  setText('kpiRevenue', formatCOP(data.revenue));
  setText('kpiEvents', formatNumber(data.events));
  const last = document.getElementById('lastEventLabel');
  if(last && data.lastEvent){
    const t = new Date(data.lastEvent.time).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    last.textContent = `Último evento: ${data.lastEvent.name} · ${t}`;
  }
  const list = document.getElementById('transactionsList');
  if(list){
    if(!data.transactions.length){
      list.innerHTML = '<div class="empty-transaction">Aún no se han registrado compras.</div>';
    }else{
      list.innerHTML = data.transactions.map(tx=>{
        const date = new Date(tx.time).toLocaleString('es-CO',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
        const units = (tx.items||[]).reduce((s,i)=>s+(Number(i.quantity)||0),0);
        return `<div class="transaction-row"><div><strong>${tx.id}</strong><span>${date} · ${units} unidad(es)</span></div><div class="transaction-total">${formatCOP(tx.value)}</div></div>`;
      }).join('');
    }
  }
}
function resetLocalAnalytics(){
  try{
    localStorage.removeItem(LOCAL_ANALYTICS_KEY);
    localStorage.removeItem(VISITOR_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }catch(error){
    console.warn('[TechStore] No fue posible limpiar completamente el almacenamiento.', error);
  }
  initializeLocalAnalytics();
  showToast('Datos de demostración reiniciados.');
}

function initAnalytics(){
  const status = document.getElementById('gaStatus');
  if(!/^G-[A-Z0-9]+$/i.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX'){
    if(status) status.textContent = 'GA4: pendiente de configuración';
    return;
  }
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);
  if(status) status.textContent = `GA4 activo: ${GA_ID}`;
}
function trackEvent(name, params={}){
  recordLocalEvent(name, params);

  // Envía el evento explícitamente a la propiedad GA4 configurada.
  // Esto evita ambigüedades si en el navegador existe más de una etiqueta de Google.
  const gaParams = GA_ID ? {...params, send_to: GA_ID} : params;
  if(typeof window.gtag === 'function') {
    window.gtag('event', name, gaParams);
  }

  console.info(`[GA4 ${GA_ID || 'sin-id'}]`, name, gaParams);
}
function showToast(message){
  const el = document.getElementById('shopToast');
  if(!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'),2200);
}
function filteredProducts(){
  return products.filter(p=>{
    const categoryOk = activeCategory === 'Todos' || p.category === activeCategory;
    const q = currentSearch.toLowerCase().trim();
    const searchOk = !q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q);
    return categoryOk && searchOk;
  });
}
function trackListView(items){
  trackEvent('view_item_list',{item_list_id:'catalogo_principal',item_list_name:'Catálogo principal',items:items.map(p=>ecommerceItem(p))});
}
function renderProducts(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const list = filteredProducts();
  if(!list.length){
    grid.innerHTML = `<div class="no-products"><h3>No encontramos productos</h3><p>Prueba con otra búsqueda o categoría.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        <span class="product-badge">${p.badge}</span>
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-body">
        <div class="product-meta"><span>${p.category}</span><span class="rating">★ ${p.rating}</span></div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="price-row">
          <div><span class="price">${formatCOP(p.price)}</span>${p.oldPrice ? `<span class="old-price">${formatCOP(p.oldPrice)}</span>`:''}</div>
        </div>
        <div class="product-actions">
          <button type="button" class="add-btn" data-add="${p.id}">Agregar al carrito</button>
          <button type="button" data-view="${p.id}">Ver</button>
        </div>
      </div>
    </article>`).join('');

  // Vinculación directa del botón "Ver". Se conserva además el listener
  // delegado del documento como respaldo. stopPropagation evita un doble envío.
  grid.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const productId = btn.dataset.view;
      if(productId) showProduct(productId);
    });
  });

  trackListView(list);
}
function saveCart(){
  try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  catch(error){ console.warn('[TechStore] No fue posible guardar el carrito.', error); }
  renderCart();
}
function cartEntries(){
  return Object.entries(cart).filter(([_,qty])=>qty>0).map(([id,qty])=>({product:products.find(p=>p.id===id),qty})).filter(x=>x.product);
}
function cartValue(){ return cartEntries().reduce((sum,x)=>sum+x.product.price*x.qty,0); }
function animateCartCount(){
  const badge = document.getElementById('cartCount');
  if(!badge) return;
  badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
}
function addToCart(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  cart[id] = (cart[id] || 0) + 1;
  trackEvent('add_to_cart',{currency:'COP',value:p.price,items:[ecommerceItem(p,1)]});
  saveCart(); animateCartCount();
  showToast(`${p.name} agregado al carrito.`);
  openCart();
}
function updateQty(id, delta){
  const p = products.find(x=>x.id===id);
  const newQty = Math.max(0,(cart[id]||0)+delta);
  if(delta>0 && p) trackEvent('add_to_cart',{currency:'COP',value:p.price,items:[ecommerceItem(p,1)]});
  if(delta<0 && p) trackEvent('remove_from_cart',{currency:'COP',value:p.price,items:[ecommerceItem(p,1)]});
  if(newQty===0) delete cart[id]; else cart[id]=newQty;
  saveCart(); animateCartCount();
}
function removeItem(id){
  const p=products.find(x=>x.id===id), qty=cart[id]||0;
  if(p&&qty) trackEvent('remove_from_cart',{currency:'COP',value:p.price*qty,items:[ecommerceItem(p,qty)]});
  delete cart[id]; saveCart(); animateCartCount();
}
function renderCart(){
  const entries=cartEntries();
  const count=entries.reduce((s,x)=>s+x.qty,0);
  const badge=document.getElementById('cartCount');
  if(badge) badge.textContent=count;

  const itemsEl=document.getElementById('cartItems');
  if(itemsEl){
    itemsEl.innerHTML=entries.map(({product:p,qty})=>`
      <div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><small>${formatCOP(p.price)}</small><div class="qty-control"><button type="button" data-qty="${p.id}" data-delta="-1">−</button><span>${qty}</span><button type="button" data-qty="${p.id}" data-delta="1">+</button></div><button type="button" class="remove-btn" data-remove="${p.id}">Eliminar</button></div><strong>${formatCOP(p.price*qty)}</strong></div>`).join('');
  }

  const emptyEl=document.getElementById('cartEmpty');
  const footerEl=document.getElementById('cartFooter');
  const subtotalEl=document.getElementById('cartSubtotal');
  if(emptyEl) emptyEl.style.display=entries.length?'none':'grid';
  if(footerEl) footerEl.style.display=entries.length?'block':'none';
  if(subtotalEl) subtotalEl.textContent=formatCOP(cartValue());
}

function openCart(){
  const drawer=document.getElementById('cartDrawer');
  const overlay=document.getElementById('overlay');
  if(drawer){
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
  }
  if(overlay) overlay.classList.add('show');
  const entries=cartEntries();
  if(entries.length) trackEvent('view_cart',{currency:'COP',value:cartValue(),items:entries.map(x=>ecommerceItem(x.product,x.qty))});
}
function closeCart(){
  const drawer=document.getElementById('cartDrawer');
  const overlay=document.getElementById('overlay');
  if(drawer){
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
  }
  if(overlay) overlay.classList.remove('show');
}

function showProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) {
    console.warn('[GA4] Producto no encontrado para view_item:', id);
    return;
  }

  console.info('[GA4] Abriendo detalle de producto:', p.id, p.name);

  // Registra que el usuario seleccionó un producto del catálogo
  trackEvent('select_item', {
    item_list_id: 'catalogo_principal',
    item_list_name: 'Catálogo principal',
    items: [ecommerceItem(p)]
  });

  // Registra la visualización del detalle del producto en GA4
  trackEvent('view_item', {
    currency: 'COP',
    value: p.price,
    items: [ecommerceItem(p, 1)]
  });

  // Construye y muestra la ventana de detalle del producto
  const productModalContent = document.getElementById('productModalContent');
  const productModal = document.getElementById('productModal');
  if(!productModalContent || !productModal) {
    console.warn('[TechStore] No se encontró el modal de producto.');
    return;
  }

  productModalContent.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-image">
        <img src="${p.image}" alt="${p.name}">
      </div>

      <div>
        <span class="eyebrow" style="color:#728ffb">
          ${p.category}
        </span>

        <h2>${p.name}</h2>

        <div class="rating">
          ★★★★★ &nbsp; ${p.rating}/5
        </div>

        <p>${p.description}</p>

        <ul>
          ${p.specs.map(s => `<li>${s}</li>`).join('')}
        </ul>

        <div class="price">
          ${formatCOP(p.price)}
        </div>

        <button
          class="btn btn-primary full"
          data-add-modal="${p.id}">
          Agregar al carrito
        </button>
      </div>
    </div>
  `;

  productModal.showModal();
}
function beginCheckout(){
  const entries=cartEntries();
  if(!entries.length) return;
  closeCart();
  trackEvent('begin_checkout',{currency:'COP',value:cartValue(),items:entries.map(x=>ecommerceItem(x.product,x.qty))});
  const summary=document.getElementById('checkoutSummary');
  const modal=document.getElementById('checkoutModal');
  if(summary){
    summary.innerHTML=`${entries.map(({product:p,qty})=>`<div class="checkout-summary-row"><span>${qty} × ${p.name}</span><strong>${formatCOP(p.price*qty)}</strong></div>`).join('')}<hr><div class="checkout-summary-row"><span>Total</span><strong>${formatCOP(cartValue())}</strong></div>`;
  }
  if(modal?.showModal) modal.showModal();
}

function completePurchase(){
  const entries=cartEntries();
  if(!entries.length) return;
  const value=cartValue();
  const transactionId=`TSP-${Date.now()}`;
  const params={transaction_id:transactionId,affiliation:'TechStore Analytics Premium',currency:'COP',value,shipping:0,tax:0,items:entries.map(x=>ecommerceItem(x.product,x.qty))};
  trackEvent('purchase',params);
  cart={};
  saveCart();
  animateCartCount();

  const checkoutModal=document.getElementById('checkoutModal');
  const successMessage=document.getElementById('successMessage');
  const successModal=document.getElementById('successModal');
  if(checkoutModal?.close) checkoutModal.close();
  if(successMessage) successMessage.textContent=`Transacción de prueba ${transactionId}. Total simulado: ${formatCOP(value)}.`;
  if(successModal?.showModal) successModal.showModal();
  showToast('Compra simulada registrada correctamente.');
  setTimeout(()=>document.getElementById('analitica-local')?.scrollIntoView({behavior:'smooth',block:'start'}),450);
}

function bindStaticEvents(){
  document.addEventListener('click',(e)=>{
    const add=e.target.closest('[data-add]'); if(add)addToCart(add.dataset.add);
    const addModal=e.target.closest('[data-add-modal]'); if(addModal){document.getElementById('productModal')?.close();addToCart(addModal.dataset.addModal);}
    // El botón Ver ya tiene un listener directo creado en renderProducts().
    // Este respaldo solo actúa si el clic no fue detenido por ese listener.
    const view=e.target.closest('[data-view]'); if(view)showProduct(view.dataset.view);
    const qty=e.target.closest('[data-qty]'); if(qty)updateQty(qty.dataset.qty,Number(qty.dataset.delta));
    const remove=e.target.closest('[data-remove]'); if(remove)removeItem(remove.dataset.remove);
    const close=e.target.closest('[data-close-modal]'); if(close)document.getElementById(close.dataset.closeModal)?.close();
    const track=e.target.closest('[data-track]'); if(track)trackEvent('select_content',{content_type:'cta',item_id:track.dataset.track});
  });

  const on=(id,event,handler)=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener(event,handler);
    else console.warn(`[TechStore] Elemento opcional no encontrado: #${id}`);
  };

  on('cartBtn','click',openCart);
  on('closeCartBtn','click',closeCart);
  on('overlay','click',closeCart);
  on('checkoutBtn','click',beginCheckout);
  on('resetDemoAnalytics','click',()=>{ if(confirm('¿Deseas reiniciar los indicadores locales de demostración?')) resetLocalAnalytics(); });
  on('searchInput','input',(e)=>{currentSearch=e.target.value;renderProducts();});
  on('searchInput','change',(e)=>{const term=e.target.value.trim();if(term)trackEvent('search',{search_term:term});});
  on('filters','click',(e)=>{const btn=e.target.closest('[data-category]');if(!btn)return;activeCategory=btn.dataset.category;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===btn));trackEvent('select_content',{content_type:'product_category',item_id:activeCategory});renderProducts();});
  on('checkoutForm','submit',(e)=>{e.preventDefault();completePurchase();});
  on('contactForm','submit',(e)=>{e.preventDefault();const feedback=document.getElementById('contactFeedback');if(feedback)feedback.textContent='Mensaje de demostración registrado correctamente.';trackEvent('generate_lead',{lead_source:'contact_form_demo'});e.target.reset();});
  on('mobileMenuBtn','click',()=>{const nav=document.getElementById('navLinks');if(!nav)return;const open=nav.classList.toggle('open');document.getElementById('mobileMenuBtn')?.setAttribute('aria-expanded',String(open));});
  document.querySelectorAll('#navLinks a').forEach(a=>a.addEventListener('click',()=>document.getElementById('navLinks')?.classList.remove('open')));
}

function initApp(){
  try{
    // Se inicializan primero los cuadros locales. Así, un elemento opcional ausente
    // no puede impedir que Usuarios, Sesiones, Eventos, Compras e Ingresos funcionen.
    initializeLocalAnalytics();
    initAnalytics();
    renderProducts();
    renderCart();
    renderLocalAnalytics();
    bindStaticEvents();
    window.TechStoreDebug = {
      version: '2026-08-18-v4',
      getIndicators: () => loadLocalAnalytics(),
      resetIndicators: () => resetLocalAnalytics(),
      recordTestPurchase: () => recordLocalEvent('purchase', {
        transaction_id: `TEST-${Date.now()}`,
        value: 100000,
        items: [{item_name:'Compra de prueba',quantity:1,price:100000}]
      })
    };
    console.info('[TechStore] Aplicación inicializada correctamente.');
  }catch(error){
    console.error('[TechStore] Error al inicializar la aplicación:', error);
    const status = document.getElementById('lastEventLabel') || document.getElementById('gaStatus');
    if(status) status.textContent = `Error de inicialización: ${error.message}`;
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initApp, {once:true});
}else{
  initApp();
}
