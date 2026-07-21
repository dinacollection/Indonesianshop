/* 
  DhinaCOLLECTION - Wishlist Page Manager JS
*/

const WishlistManager = {
  renderWishlistPage() {
    const container = document.getElementById('wishlist-grid-container');
    if (!container) return;

    const savedIds = DhinaState.wishlist;

    if (savedIds.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:4rem 2rem; background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200);">
          <div style="font-size:3.5rem; margin-bottom:1rem;">❤️</div>
          <h3 style="font-family:var(--font-serif); font-size:1.5rem; margin-bottom:0.5rem; color:var(--slate-900);">Wishlist Anda Masih Kosong</h3>
          <p style="color:var(--slate-500); margin-bottom:1.5rem;">Simpan produk impian Anda untuk dibeli kapan saja dengan menekan ikon hati!</p>
          <a href="shop.html" class="btn-primary-gold">Jelajahi Produk Sekarang</a>
        </div>
      `;
      return;
    }

    const savedProducts = PRODUCTS_DATA.filter(p => savedIds.includes(p.id));

    container.innerHTML = savedProducts.map(p => `
      <div class="product-card">
        <button class="card-wishlist-btn active" data-id="${p.id}" onclick="DhinaState.toggleWishlist('${p.id}'); WishlistManager.renderWishlistPage();">
          ♥
        </button>
        <div class="card-media-wrapper" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer;">
          ${p.svgImage}
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-cat-brand">${p.brand} • ${p.category}</div>
          <h3 class="card-title" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer;">${p.name}</h3>
          <div class="card-rating-row">
            <span class="stars-gold">★ ${p.rating}</span>
            <span>(${p.reviewsCount} Ulasan)</span>
          </div>
          <div class="card-price-row">
            <span class="price-current">${formatRupiah(p.price)}</span>
            ${p.oldPrice > p.price ? `<span class="price-old">${formatRupiah(p.oldPrice)}</span>` : ''}
          </div>
          <button class="card-action-btn" onclick="DhinaState.addToCart('${p.id}', 1)">
            🛒 Masukkan Keranjang
          </button>
        </div>
      </div>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  WishlistManager.renderWishlistPage();
});
