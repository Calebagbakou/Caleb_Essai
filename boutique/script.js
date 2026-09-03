// --- DONNÉES DU CATALOGUE ---
const products = [
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    category: "ia",
    icon: "🤖",
    description: "L'assistant IA de Google pour booster votre productivité au quotidien.",
    variants: [
      { id: "gemini-4m", name: "4 mois", price: 15000 },
      { id: "gemini-12m", name: "12 mois", price: 40000 },
      { id: "gemini-18m", name: "18 mois", price: 55000 }
    ]
  },
  {
    id: "capcut-pro",
    name: "CapCut Pro",
    category: "video",
    icon: "🎬",
    description: "Le logiciel de montage vidéo incontournable avec toutes les fonctionnalités premium débloquées.",
    variants: [
      { id: "capcut-12m", name: "1 an", price: 25000 }
    ]
  },
  {
    id: "canva-pro",
    name: "Canva Pro",
    category: "video",
    icon: "🎨",
    description: "Créez des designs professionnels facilement avec la suite complète Canva Pro.",
    variants: [
      { id: "canva-12m", name: "1 an", price: 12000 }
    ]
  }
];

// --- GESTION DU PANIER (LocalStorage) ---
let cart = JSON.parse(localStorage.getItem('cc_shop_cart')) || [];

function saveCart() {
  localStorage.setItem('cc_shop_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const counts = document.querySelectorAll('#cartCount');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  counts.forEach(el => el.textContent = totalItems);
}

function addToCart(productId, variantId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const variant = product.variants.find(v => v.id === variantId);
  if (!variant) return;

  const existingItem = cart.find(item => item.variantId === variantId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantName: variant.name,
      price: variant.price,
      icon: product.icon,
      quantity: 1
    });
  }
  saveCart();
  alert(`${product.name} (${variant.name}) ajouté au panier !`);
}

function removeFromCart(variantId) {
  cart = cart.filter(item => item.variantId !== variantId);
  saveCart();
  if(typeof renderCartPage === 'function') renderCartPage();
}

// --- AFFICHAGE : PAGE D'ACCUEIL (CATALOGUE) ---
function renderCatalog(category = 'all') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const filtered = category === 'all' ? products : products.filter(p => p.category === category);

  filtered.forEach(p => {
    const minPrice = Math.min(...p.variants.map(v => v.price));
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="p-image">${p.icon}</div>
      <div class="p-content">
        <span class="p-category">${p.category === 'ia' ? 'Intelligence Artificielle' : 'Vidéo & Design'}</span>
        <h3 class="p-title">${p.name}</h3>
        <p class="p-desc">${p.description}</p>
        <div class="p-footer">
          <div>
            <div class="p-price-label">À partir de</div>
            <div class="p-price">${minPrice.toLocaleString('fr-FR')} FCFA</div>
          </div>
          <a href="product.html?id=${p.id}" class="btn-outline">Voir détails</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Initialisation de la page d'accueil
if (document.getElementById('productsGrid')) {
  renderCatalog();

  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filters.forEach(f => f.classList.remove('active'));
      e.target.classList.add('active');
      renderCatalog(e.target.dataset.cat);
    });
  });
}

// --- AFFICHAGE : PAGE PRODUIT ---
function renderProductPage() {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const product = products.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = '<h2>Produit introuvable.</h2>';
    return;
  }

  let optionsHtml = '';
  product.variants.forEach((v, index) => {
    optionsHtml += `
      <div>
        <input type="radio" name="variant" id="${v.id}" value="${v.id}" class="option-input" ${index === 0 ? 'checked' : ''}>
        <label for="${v.id}" class="option-label">
          <span class="opt-name">${v.name}</span>
          <span class="opt-price">${v.price.toLocaleString('fr-FR')} FCFA</span>
        </label>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="pd-image">${product.icon}</div>
    <div class="pd-info">
      <h1>${product.name}</h1>
      <p class="pd-desc">${product.description}</p>

      <div class="pd-options">
        <h3>Choisissez votre formule :</h3>
        <div class="options-grid">
          ${optionsHtml}
        </div>
      </div>

      <button class="btn-primary" id="addToCartBtn">Ajouter au panier</button>
    </div>
  `;

  document.getElementById('addToCartBtn').addEventListener('click', () => {
    const selectedVariant = document.querySelector('input[name="variant"]:checked').value;
    addToCart(product.id, selectedVariant);
  });
}

// --- AFFICHAGE : PAGE PANIER ---
function renderCartPage() {
  const list = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '<div class="cart-empty"><p>Votre panier est vide.</p></div>';
    subtotalEl.textContent = '0 FCFA';
    totalEl.textContent = '0 FCFA';
    checkoutBtn.disabled = true;
    return;
  }

  let total = 0;
  let html = '';

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
      <div class="cart-item">
        <div class="ci-icon">${item.icon}</div>
        <div class="ci-details">
          <div class="ci-title">${item.name}</div>
          <div class="ci-variant">Formule : ${item.variantName}</div>
          <div class="ci-actions">
            <span class="ci-price">${itemTotal.toLocaleString('fr-FR')} FCFA</span>
            <span>(Qté: ${item.quantity})</span>
            <button class="ci-remove" onclick="removeFromCart('${item.variantId}')">Retirer</button>
          </div>
        </div>
      </div>
    `;
  });

  list.innerHTML = html;
  const totalFormatted = `${total.toLocaleString('fr-FR')} FCFA`;
  subtotalEl.textContent = totalFormatted;
  totalEl.textContent = totalFormatted;
  checkoutBtn.disabled = false;
}

// Gestion du checkout via WhatsApp
if (document.getElementById('checkoutForm')) {
  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if(cart.length === 0) return;

    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;

    let total = 0;
    let orderDetails = cart.map(item => {
      total += item.price * item.quantity;
      return `- ${item.name} (${item.variantName}) x${item.quantity} : ${item.price * item.quantity} FCFA`;
    }).join('%0A'); // %0A = saut de ligne pour URL WhatsApp

    const message = `Bonjour Caleb Creative, je souhaite passer commande sur la boutique :%0A%0A*Client* : ${name}%0A*Contact* : ${phone}%0A%0A*Ma Commande* :%0A${orderDetails}%0A%0A*Total à payer* : ${total} FCFA%0A%0AMerci de m'indiquer la marche à suivre pour le paiement.`;

    const whatsappUrl = `https://wa.me/2290148135395?text=${message}`;

    // Vider le panier
    cart = [];
    saveCart();

    // Rediriger vers WhatsApp
    window.location.href = whatsappUrl;
  });
}

// Initialisation globale
updateCartCount();