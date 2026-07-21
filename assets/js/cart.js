/* 
  DhinaCOLLECTION - Cart & Checkout Manager JS
*/

const CartManager = {
  getCart() {
    return DhinaState.cart;
  },

  updateQuantity(productId, delta) {
    const item = DhinaState.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    DhinaState.saveCart();
    this.renderCartPage();
  },

  removeItem(productId) {
    DhinaState.cart = DhinaState.cart.filter(i => i.id !== productId);
    DhinaState.saveCart();
    showToast("Produk berhasil dihapus dari keranjang.", "info");
    this.renderCartPage();
  },

  clearCart() {
    DhinaState.cart = [];
    DhinaState.saveCart();
    this.renderCartPage();
  },

  applyVoucher(code) {
    const validVouchers = {
      'DHINA2026': { discountPercent: 20, description: 'Diskon 20% Promo Spesial 2026' },
      'ONGKIRFREE': { freeShipping: true, discountAmount: 25000, description: 'Bebas Ongkir Seluruh Indonesia' },
      'MEMBERGOLDA': { discountPercent: 15, description: 'Diskon VIP Member Gold' }
    };

    const cleanCode = code.trim().toUpperCase();
    if (validVouchers[cleanCode]) {
      DhinaState.appliedVoucher = { code: cleanCode, ...validVouchers[cleanCode] };
      localStorage.setItem('dhina_voucher', JSON.stringify(DhinaState.appliedVoucher));
      showToast(`Voucher "${cleanCode}" berhasil dipasang!`, "success");
      this.renderCartPage();
    } else {
      showToast("Kode voucher tidak valid atau telah kadaluarsa.", "error");
    }
  },

  calculateTotals() {
    const subtotal = DhinaState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shipping = subtotal > 0 ? 20000 : 0;
    let discount = 0;

    if (DhinaState.appliedVoucher) {
      const v = DhinaState.appliedVoucher;
      if (v.discountPercent) {
        discount = subtotal * (v.discountPercent / 100);
      }
      if (v.freeShipping) {
        shipping = 0;
      }
      if (v.discountAmount) {
        discount += v.discountAmount;
      }
    }

    const total = Math.max(0, subtotal + shipping - discount);

    return { subtotal, shipping, discount, total };
  },

  renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!container) return;

    const cart = DhinaState.cart;

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:4rem 2rem; background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200);">
          <div style="font-size:3.5rem; margin-bottom:1rem;">🛍️</div>
          <h3 style="font-family:var(--font-serif); font-size:1.5rem; margin-bottom:0.5rem; color:var(--slate-900);">Keranjang Belanja Anda Kosong</h3>
          <p style="color:var(--slate-500); margin-bottom:1.5rem;">Jelajahi koleksi busana, frozen food, & kecantikan lokal unggulan kami!</p>
          <a href="shop.html" class="btn-primary-gold">Mulai Belanja Sekarang</a>
        </div>
      `;
      if (summaryContainer) summaryContainer.style.display = 'none';
      return;
    }

    if (summaryContainer) summaryContainer.style.display = 'block';

    container.innerHTML = cart.map(item => `
      <div class="cart-item-row" style="display:flex; gap:1.25rem; background:var(--white); padding:1.25rem; border-radius:var(--radius-lg); border:1px solid var(--slate-200); margin-bottom:1rem; align-items:center;">
        <div style="width:90px; height:90px; border-radius:var(--radius-md); overflow:hidden; background:var(--slate-100); flex-shrink:0;">
          ${item.svgImage}
        </div>
        <div style="flex:1;">
          <div style="font-size:0.75rem; font-weight:800; color:var(--emerald-700); text-transform:uppercase;">${item.brand} • ${item.category}</div>
          <h4 style="font-size:1rem; font-weight:700; color:var(--slate-900); margin:0.25rem 0;">${item.name}</h4>
          <div style="font-size:1.1rem; font-weight:800; color:var(--emerald-800);">${formatRupiah(item.price)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; background:var(--slate-100); padding:0.25rem 0.6rem; border-radius:var(--radius-full);">
          <button onclick="CartManager.updateQuantity('${item.id}', -1)" style="font-weight:800; padding:0.25rem 0.5rem; font-size:1rem;">-</button>
          <span style="font-weight:800; padding:0 0.5rem; min-width:24px; text-align:center;">${item.quantity}</span>
          <button onclick="CartManager.updateQuantity('${item.id}', 1)" style="font-weight:800; padding:0.25rem 0.5rem; font-size:1rem;">+</button>
        </div>
        <div style="text-align:right; min-width:120px;">
          <div style="font-size:1.1rem; font-weight:800; color:var(--slate-900);">${formatRupiah(item.price * item.quantity)}</div>
          <button onclick="CartManager.removeItem('${item.id}')" style="color:#DC2626; font-size:0.8rem; font-weight:700; margin-top:0.3rem;">Hapus</button>
        </div>
      </div>
    `).join('');

    this.renderSummary();
  },

  renderSummary() {
    const { subtotal, shipping, discount, total } = this.calculateTotals();
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
      <div style="background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-xl); padding:1.75rem; position:sticky; top:100px;">
        <h3 style="font-family:var(--font-serif); font-size:1.25rem; font-weight:800; color:var(--slate-900); margin-bottom:1.25rem;">Ringkasan Pesanan</h3>
        
        <div style="display:flex; flex-direction:column; gap:0.85rem; font-size:0.95rem; margin-bottom:1.25rem; border-bottom:1px solid var(--slate-200); padding-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; color:var(--slate-600);">
            <span>Subtotal Produk</span>
            <span style="font-weight:700; color:var(--slate-900);">${formatRupiah(subtotal)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--slate-600);">
            <span>Estimasi Ongkos Kirim</span>
            <span style="font-weight:700; color:var(--slate-900);">${shipping === 0 ? '<span style="color:var(--emerald-600)">GRATIS</span>' : formatRupiah(shipping)}</span>
          </div>
          ${discount > 0 ? `
            <div style="display:flex; justify-content:space-between; color:var(--emerald-700); font-weight:700;">
              <span>Voucher Hemat (${DhinaState.appliedVoucher.code})</span>
              <span>-${formatRupiah(discount)}</span>
            </div>
          ` : ''}
        </div>

        <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem;">
          <input type="text" id="voucher-input" placeholder="Kode Voucher (ex: DHINA2026)" value="${DhinaState.appliedVoucher ? DhinaState.appliedVoucher.code : ''}" style="flex:1; padding:0.65rem 1rem; border:1px solid var(--slate-200); border-radius:var(--radius-md); font-size:0.85rem; outline:none;">
          <button onclick="CartManager.applyVoucher(document.getElementById('voucher-input').value)" style="background:var(--emerald-700); color:var(--white); font-weight:700; padding:0.65rem 1.25rem; border-radius:var(--radius-md); font-size:0.85rem;">Gunakan</button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:1.5rem; font-size:1.1rem;">
          <span style="font-weight:800; color:var(--slate-900);">Total Pembayaran</span>
          <span style="font-size:1.5rem; font-weight:800; color:var(--emerald-800);">${formatRupiah(total)}</span>
        </div>

        <a href="checkout.html" class="btn-primary-gold" style="width:100%; text-align:center; justify-content:center;">
          Lanjut ke Pembayaran Checkout ➔
        </a>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CartManager.renderCartPage();
});
