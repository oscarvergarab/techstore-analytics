
const CONFIG = window.TECHSTORE_CONFIG || {};
const GA_ID = (CONFIG.GA_MEASUREMENT_ID || '').trim();

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

let cart = JSON.parse(localStorage.getItem('techstore_cart_premium') || '{}');
let activeCategory = 'Todos';
let currentSearch = '';

function formatCOP(value){
  return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
}
function ecommerceItem(product, quantity=1){
  return {item_id:product.id,item_name:product.name,item_category:product.category,price:product.price,quantity};
}
function initAnalytics(){
  const status = document.getElementById('gaStatus');
  if(!/^G-[A-Z0-9]+$/i.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX'){
    status.textContent = 'GA4: pendiente de configuración';
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
  status.textContent = `GA4 activo: ${GA_ID}`;
}
function trackEvent(name, params={}){
  if(typeof window.gtag === 'function') window.gtag('event', name, params);
  console.info('[GA4]', name, params);
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
          <div>
            <span class="price">${formatCOP(p.price)}</span>
            ${p.oldPrice ? `<span class="old-price">${formatCOP(p.oldPrice)}</span>`:''}
          </div>
        </div>
        <div class="product-actions">
          <button class="add-btn" data-add="${p.id}">Agregar</button>
          <button data-view="${p.id}">Ver</button>
        </div>
      </div>
    </article>
  `).join('');
  trackListView(list);
}
function saveCart(){
  localStorage.setItem('techstore_cart_premium', JSON.stringify(cart));
  renderCart();
}
function cartEntries(){
  return Object.entries(cart).filter(([_,qty])=>qty>0).map(([id,qty])=>({product:products.find(p=>p.id===id),qty})).filter(x=>x.product);
}
function cartValue(){ return cartEntries().reduce((sum,x)=>sum + x.product.price*x.qty, 0); }
function addToCart(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  cart[id] = (cart[id] || 0) + 1;
  trackEvent('add_to_cart',{currency:'COP',value:p.price,items:[ecommerceItem(p,1)]});
  saveCart(); openCart();
}
function updateQty(id, delta){
  const p = products.find(x=>x.id===id);
  const newQty = Math.max(0, (cart[id]||0) + delta);
  if(delta > 0 && p) trackEvent('add_to_cart',{currency:'COP',value:p.price,items:[ecommerceItem(p,1)]});
  if(delta < 0 && p) trackEvent('remove_from_cart',{currency:'COP',value:p.price,items:[ecommerceItem(p,1)]});
  if(newQty === 0) delete cart[id]; else cart[id] = newQty;
  saveCart();
}
function removeItem(id){
  const p = products.find(x=>x.id===id); const qty = cart[id]||0;
  if(p && qty) trackEvent('remove_from_cart',{currency:'COP',value:p.price*qty,items:[ecommerceItem(p,qty)]});
  delete cart[id]; saveCart();
}
function renderCart(){
  const entries = cartEntries();
  document.getElementById('cartCount').textContent = entries.reduce((s,x)=>s+x.qty,0);
  document.getElementById('cartItems').innerHTML = entries.map(({product:p,qty})=>`
    <div class="cart-item">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <strong>${p.name}</strong>
        <small>${formatCOP(p.price)}</small>
        <div class="qty-control">
          <button data-qty="${p.id}" data-delta="-1">−</button>
          <span>${qty}</span>
          <button data-qty="${p.id}" data-delta="1">+</button>
        </div>
        <button class="remove-btn" data-remove="${p.id}">Eliminar</button>
      </div>
      <strong>${formatCOP(p.price*qty)}</strong>
    </div>`).join('');
  document.getElementById('cartEmpty').style.display = entries.length ? 'none' : 'grid';
  document.getElementById('cartFooter').style.display = entries.length ? 'block' : 'none';
  document.getElementById('cartSubtotal').textContent = formatCOP(cartValue());
}
function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden','false');
  document.getElementById('overlay').classList.add('show');
  const entries = cartEntries();
  if(entries.length) trackEvent('view_cart',{currency:'COP',value:cartValue(),items:entries.map(x=>ecommerceItem(x.product,x.qty))});
}
function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden','true');
  document.getElementById('overlay').classList.remove('show');
}
function showProduct(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  trackEvent('select_item',{item_list_id:'catalogo_principal',item_list_name:'Catálogo principal',items:[ecommerceItem(p)]});
  trackEvent('view_item',{currency:'COP',value:p.price,items:[ecommerceItem(p)]});
  document.getElementById('productModalContent').innerHTML = `
    <div class="product-detail">
      <div class="product-detail-image"><img src="${p.image}" alt="${p.name}"></div>
      <div>
        <span class="eyebrow" style="color:#728ffb">${p.category}</span>
        <h2>${p.name}</h2>
        <div class="rating">★★★★★ &nbsp; ${p.rating}/5</div>
        <p>${p.description}</p>
        <ul>${p.specs.map(s=>`<li>${s}</li>`).join('')}</ul>
        <div class="price">${formatCOP(p.price)}</div>
        <button class="btn btn-primary full" data-add-modal="${p.id}">Agregar al carrito</button>
      </div>
    </div>`;
  document.getElementById('productModal').showModal();
}
function beginCheckout(){
  const entries = cartEntries(); if(!entries.length) return;
  closeCart();
  trackEvent('begin_checkout',{currency:'COP',value:cartValue(),items:entries.map(x=>ecommerceItem(x.product,x.qty))});
  document.getElementById('checkoutSummary').innerHTML = `${entries.map(({product:p,qty})=>`<div class="checkout-summary-row"><span>${qty} × ${p.name}</span><strong>${formatCOP(p.price*qty)}</strong></div>`).join('')}<hr><div class="checkout-summary-row"><span>Total</span><strong>${formatCOP(cartValue())}</strong></div>`;
  document.getElementById('checkoutModal').showModal();
}
function completePurchase(){
  const entries = cartEntries(); if(!entries.length) return;
  const value = cartValue(); const transactionId = `TSP-${Date.now()}`;
  trackEvent('purchase',{transaction_id:transactionId,affiliation:'TechStore Analytics Premium',currency:'COP',value,shipping:0,tax:0,items:entries.map(x=>ecommerceItem(x.product,x.qty))});
  cart = {}; saveCart();
  document.getElementById('checkoutModal').close();
  document.getElementById('successMessage').textContent = `Transacción de prueba ${transactionId}. Total simulado: ${formatCOP(value)}.`;
  document.getElementById('successModal').showModal();
}

document.addEventListener('click', (e)=>{
  const add = e.target.closest('[data-add]'); if(add) addToCart(add.dataset.add);
  const addModal = e.target.closest('[data-add-modal]');
  if(addModal){ document.getElementById('productModal').close(); addToCart(addModal.dataset.addModal); }
  const view = e.target.closest('[data-view]'); if(view) showProduct(view.dataset.view);
  const qty = e.target.closest('[data-qty]'); if(qty) updateQty(qty.dataset.qty, Number(qty.dataset.delta));
  const remove = e.target.closest('[data-remove]'); if(remove) removeItem(remove.dataset.remove);
  const close = e.target.closest('[data-close-modal]'); if(close) document.getElementById(close.dataset.closeModal).close();
  const track = e.target.closest('[data-track]'); if(track) trackEvent('select_content',{content_type:'cta',item_id:track.dataset.track});
});

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', beginCheckout);
document.getElementById('searchInput').addEventListener('input', (e)=>{ currentSearch = e.target.value; renderProducts(); });
document.getElementById('searchInput').addEventListener('change', (e)=>{ const term = e.target.value.trim(); if(term) trackEvent('search',{search_term:term}); });
document.getElementById('filters').addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-category]'); if(!btn) return;
  activeCategory = btn.dataset.category;
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active', b===btn));
  trackEvent('select_content',{content_type:'product_category',item_id:activeCategory});
  renderProducts();
});
document.getElementById('checkoutForm').addEventListener('submit', (e)=>{ e.preventDefault(); completePurchase(); });
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  document.getElementById('contactFeedback').textContent = 'Mensaje de demostración registrado correctamente.';
  trackEvent('generate_lead',{lead_source:'contact_form_demo'});
  e.target.reset();
});
document.getElementById('mobileMenuBtn').addEventListener('click', ()=>{
  const nav = document.getElementById('navLinks');
  const open = nav.classList.toggle('open');
  document.getElementById('mobileMenuBtn').setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('#navLinks a').forEach(a=>a.addEventListener('click', ()=>document.getElementById('navLinks').classList.remove('open')));

initAnalytics(); renderProducts(); renderCart();
