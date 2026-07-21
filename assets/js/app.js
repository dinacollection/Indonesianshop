/* 
  DhinaCOLLECTION - Main JavaScript Application Core
  Handles LocalStorage State (Cart, Wishlist), Navigation UI, Toasts, Header & Footer Renders
*/

// App Global State
const DhinaState = {
  cart: JSON.parse(localStorage.getItem('dhina_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('dhina_wishlist')) || [],
  appliedVoucher: JSON.parse(localStorage.getItem('dhina_voucher')) || null,
  
  saveCart() {
    localStorage.setItem('dhina_cart', JSON.stringify(this.cart));
    this.updateCounters();
  },
  
  saveWishlist() {
    localStorage.setItem('dhina_wishlist', JSON.stringify(this.wishlist));
    this.updateCounters();
  },

  updateCounters() {
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = this.wishlist.length;

    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = cartCount;
      el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = wishlistCount;
      el.style.display = wishlistCount > 0 ? 'flex' : 'none';
    });
  },

  addToCart(productId, quantity = 1, options = {}) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        category: product.category,
        brand: product.brand,
        quantity: quantity,
        svgImage: product.svgImage,
        options: options
      });
    }

    this.saveCart();
    showToast(`" ${product.name} " telah ditambahkan ke Keranjang Belanja!`, "success");
  },

  toggleWishlist(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const index = this.wishlist.indexOf(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      showToast(`Produk dihapus dari Wishlist.`, "info");
    } else {
      this.wishlist.push(productId);
      showToast(`" ${product.name} " disimpan ke Wishlist Favorit!`, "success");
    }

    this.saveWishlist();
    
    // Trigger re-render of wishlist buttons if any
    document.querySelectorAll(`.card-wishlist-btn[data-id="${productId}"]`).forEach(btn => {
      btn.classList.toggle('active', this.wishlist.includes(productId));
    });
  }
};

// Toast Notification System
function showToast(message, type = "success") {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-size:1.2rem;">✨</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Currency Formatter Helper
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Global Document Initializer
document.addEventListener('DOMContentLoaded', () => {
  DhinaState.updateCounters();
  initAutocompleteSearch();
  initHeaderFooterDynamic();
});

// Autocomplete Live Search Engine
function initAutocompleteSearch() {
  const searchInputs = document.querySelectorAll('.search-input');
  
  searchInputs.forEach(input => {
    const parent = input.closest('.nav-search-box');
    if (!parent) return;

    let autoBox = parent.querySelector('.search-autocomplete');
    if (!autoBox) {
      autoBox = document.createElement('div');
      autoBox.className = 'search-autocomplete';
      parent.appendChild(autoBox);
    }

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        autoBox.classList.remove('active');
        autoBox.innerHTML = '';
        return;
      }

      const matches = PRODUCTS_DATA.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      ).slice(0, 6);

      if (matches.length === 0) {
        autoBox.innerHTML = `<div class="auto-item" style="color:var(--slate-500);">Tidak ada produk sesuai "${query}"</div>`;
      } else {
        autoBox.innerHTML = matches.map(m => `
          <div class="auto-item" onclick="window.location.href='product.html?id=${m.id}'">
            <div class="auto-item-thumb">${m.svgImage}</div>
            <div class="auto-item-info">
              <div class="auto-item-title">${m.name}</div>
              <div class="auto-item-price">${formatRupiah(m.price)}</div>
            </div>
            <span style="font-size:0.75rem; color:var(--emerald-700); font-weight:700;">${m.brand}</span>
          </div>
        `).join('');
      }

      autoBox.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!parent.contains(e.target)) {
        autoBox.classList.remove('active');
      }
    });
  });
}

// Dynamic Header & Footer Filler for Pages
function initHeaderFooterDynamic() {
  // Setup active links on navigation
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.cat-chip, .footer-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}
