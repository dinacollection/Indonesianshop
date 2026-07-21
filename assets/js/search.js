/* 
  DhinaCOLLECTION - Catalog Filter & Search Engine JS
*/

const ShopEngine = {
  filteredProducts: [],
  currentPage: 1,
  itemsPerPage: 16,
  selectedCategory: 'ALL',
  selectedBrands: [],
  selectedMinPrice: 0,
  selectedMaxPrice: 2000000,
  selectedMinRating: 0,
  sortBy: 'POPULAR',

  init() {
    this.filteredProducts = [...PRODUCTS_DATA];
    this.setupListeners();
    this.applyFilters();
  },

  setupListeners() {
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    const priceRange = document.getElementById('shop-price-range');
    if (priceRange) {
      priceRange.addEventListener('input', (e) => {
        this.selectedMaxPrice = parseInt(e.target.value);
        const label = document.getElementById('shop-price-val');
        if (label) label.textContent = formatRupiah(this.selectedMaxPrice);
        this.applyFilters();
      });
    }
  },

  setCategory(catName) {
    this.selectedCategory = catName;
    
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === catName);
    });

    this.currentPage = 1;
    this.applyFilters();
  },

  toggleBrandFilter(brandName) {
    const idx = this.selectedBrands.indexOf(brandName);
    if (idx > -1) {
      this.selectedBrands.splice(idx, 1);
    } else {
      this.selectedBrands.push(brandName);
    }
    this.currentPage = 1;
    this.applyFilters();
  },

  applyFilters() {
    let list = [...PRODUCTS_DATA];

    const searchInput = document.getElementById('shop-search-input');
    if (searchInput && searchInput.value.trim() !== '') {
      const q = searchInput.value.trim().toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory !== 'ALL') {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedBrands.length > 0) {
      list = list.filter(p => this.selectedBrands.includes(p.brand));
    }

    list = list.filter(p => p.price <= this.selectedMaxPrice);

    if (this.sortBy === 'PRICE_LOW') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'PRICE_HIGH') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'RATING') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'NEWEST') {
      list.sort((a, b) => b.numeric_id - a.numeric_id);
    } else {
      list.sort((a, b) => b.soldCount - a.soldCount);
    }

    this.filteredProducts = list;
    this.renderProductsGrid();
    this.renderPagination();
  },

  renderProductsGrid() {
    const grid = document.getElementById('shop-products-grid');
    const countTag = document.getElementById('shop-results-count');
    if (!grid) return;

    if (countTag) {
      countTag.textContent = `Menampilkan ${this.filteredProducts.length} produk pilihan`;
    }

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem 2rem; background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200);">
          <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
          <h3 style="font-family:var(--font-serif); font-size:1.5rem; color:var(--slate-900);">Produk Tidak Ditemukan</h3>
          <p style="color:var(--slate-500); margin-top:0.5rem;">Coba atur ulang filter atau kata kunci pencarian Anda.</p>
          <button onclick="ShopEngine.resetFilters()" class="btn-primary-gold" style="margin-top:1.5rem;">Reset Filter</button>
        </div>
      `;
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginated = this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);

    grid.innerHTML = paginated.map(p => {
      const isWish = DhinaState.wishlist.includes(p.id);
      return `
        <div class="product-card">
          <button class="card-wishlist-btn ${isWish ? 'active' : ''}" data-id="${p.id}" onclick="DhinaState.toggleWishlist('${p.id}')">
            ♥
          </button>
          <div class="card-media-wrapper" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer;">
            <img src="${p.imagePath || 'assets/images/hero-bg.jpg'}" alt="${p.name}">
            ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          </div>
          <div class="card-body">
            <div class="card-cat-brand">${p.brand} • ${p.category}</div>
            <h3 class="card-title" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer;">${p.name}</h3>
            <div class="card-rating-row">
              <span class="stars-gold">★ ${p.rating}</span>
              <span>(${p.reviewsCount} Ulasan • ${p.soldCount} Terjual)</span>
            </div>
            <div class="card-price-row">
              <span class="price-current">${formatRupiah(p.price)}</span>
              ${p.oldPrice > p.price ? `<span class="price-old">${formatRupiah(p.oldPrice)}</span>` : ''}
              ${p.discount > 0 ? `<span class="discount-tag">-${p.discount}%</span>` : ''}
            </div>
            <button class="card-action-btn" onclick="DhinaState.addToCart('${p.id}', 1)">
              🛒 Masukkan Keranjang
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderPagination() {
    const pagContainer = document.getElementById('shop-pagination');
    if (!pagContainer) return;

    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (totalPages <= 1) {
      pagContainer.innerHTML = '';
      return;
    }

    let btns = '';
    for (let i = 1; i <= totalPages; i++) {
      btns += `
        <button onclick="ShopEngine.goToPage(${i})" style="padding:0.5rem 0.9rem; font-weight:800; border-radius:var(--radius-md); border:1px solid ${i === this.currentPage ? '#044e3b' : 'var(--slate-200)'}; background:${i === this.currentPage ? '#044e3b' : 'var(--white)'}; color:${i === this.currentPage ? 'var(--white)' : 'var(--slate-800)'};">
          ${i}
        </button>
      `;
    }

    pagContainer.innerHTML = `
      <div style="display:flex; justify-content:center; gap:0.5rem; margin-top:2.5rem; align-items:center;">
        ${btns}
      </div>
    `;
  },

  goToPage(pageNum) {
    this.currentPage = pageNum;
    this.renderProductsGrid();
    this.renderPagination();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  },

  resetFilters() {
    this.selectedCategory = 'ALL';
    this.selectedBrands = [];
    this.selectedMaxPrice = 2000000;
    this.sortBy = 'POPULAR';
    
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.brand-checkbox').forEach(cb => cb.checked = false);

    this.applyFilters();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('shop-products-grid')) {
    ShopEngine.init();
  }
});
