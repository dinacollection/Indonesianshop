/* 
  DhinaCOLLECTION - Live Chat AI Assistant JS
  Features: Knowledge Base, Auto Typing Simulation, Quick Chips, Dynamic Recommendations
*/

const ChatbotAI = {
  isOpen: false,
  knowledgeBase: {
    greetings: [
      "Halo! Selamat datang di DhinaCOLLECTION! ✨ Saya Asisten AI Toko Siap membantu Anda 24/7. Ada yang bisa saya bantu hari ini?",
      "Selamat datang di DhinaCOLLECTION — Curation Brand Lokal Terbaik! Mau cari rekomendasi produk, cek resi pengiriman, atau info promo spesial?"
    ],
    location: "Gudang & Kantor DhinaCOLLECTION berlokasi di **Jakarta Timur**: Jalan Taslim, Kecamatan Jatinegara, Kelurahan Bidara Cina, Kode Pos 13330. Kami siap melayani pengiriman ke seluruh wilayah Indonesia!",
    contact: "Admin Operasional WhatsApp: **089530524377** | TikTok Official: **@dnnisa6**. Jam operasional pengiriman Senin-Sabtu 08.00 - 17.00 WIB.",
    shipping: "Kami bekerja sama dengan ekspedisi terpercaya (JNE, J&T, SiCepat, GoSend Express). Pengiriman same-day & instant tersedia untuk area Jabodetabek. Nikmati voucher **ONGKIRFREE** untuk bebas ongkir!",
    vouchers: "Gunakan kode voucher aktif berikut saat checkout:\n• **DHINA2026** - Diskon 20% All Item\n• **ONGKIRFREE** - Gratis Ongkir Seluruh Indonesia\n• **MEMBERGOLDA** - Potongan Ekstra 15%",
    guarantee: "Semua produk di DhinaCOLLECTION 100% Original dari brand lokal terpercaya dengan garansi retur 14 hari bila cacat produksi."
  },

  init() {
    this.createWidgetUI();
  },

  createWidgetUI() {
    if (document.getElementById('dhina-chat-btn')) return;

    const SVG_CHAT_BOT = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="13" y2="13"></line></svg>`;

    // Chat Floating Button
    const btn = document.createElement('button');
    btn.id = 'dhina-chat-btn';
    btn.className = 'chat-widget-btn icon-glass-chat-btn';
    btn.title = 'Tanya AI Assistant DhinaCOLLECTION';
    btn.innerHTML = `${SVG_CHAT_BOT} <span class="chat-status-pulse"></span>`;
    btn.onclick = () => this.toggleChat();
    document.body.appendChild(btn);

    // Chat Dialog Window
    const modal = document.createElement('div');
    modal.id = 'dhina-chat-modal';
    modal.className = 'chat-modal';
    modal.innerHTML = `
      <div class="chat-header">
        <div class="chat-title-group">
          <div class="chat-status-dot"></div>
          <div>
            <div style="font-weight:700; font-size:0.95rem;">Dhina AI Assistant</div>
            <div style="font-size:0.75rem; opacity:0.8;">Online • Siap Membantu 24/7</div>
          </div>
        </div>
        <button onclick="ChatbotAI.toggleChat()" style="color:#fff; font-size:1.2rem; font-weight:700; cursor:pointer;">✕</button>
      </div>

      <div class="chat-body" id="chat-messages-box">
        <div class="chat-msg bot">
          ${this.knowledgeBase.greetings[0]}
          <div class="chat-chips">
            <button class="chip-btn" onclick="ChatbotAI.handleQuickChip('skincare')">✨ Skincare Populer</button>
            <button class="chip-btn" onclick="ChatbotAI.handleQuickChip('promo')">🎁 Kode Voucher</button>
            <button class="chip-btn" onclick="ChatbotAI.handleQuickChip('lokasi')">📍 Alamat Gudang</button>
            <button class="chip-btn" onclick="ChatbotAI.handleQuickChip('admin')">📱 Hubungi WA Admin</button>
          </div>
        </div>
      </div>

      <div class="chat-input-row">
        <input type="text" id="chat-user-input" class="chat-input" placeholder="Ketik pertanyaan Anda..." onkeypress="if(event.key==='Enter') ChatbotAI.sendMessage()">
        <button class="chat-send-btn" onclick="ChatbotAI.sendMessage()">➤</button>
      </div>
    `;

    document.body.appendChild(modal);
  },

  toggleChat() {
    this.isOpen = !this.isOpen;
    const modal = document.getElementById('dhina-chat-modal');
    if (modal) modal.classList.toggle('active', this.isOpen);
  },

  sendMessage() {
    const input = document.getElementById('chat-user-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    this.appendMessage('user', text);
    input.value = '';

    this.showTypingAndReply(text);
  },

  handleQuickChip(type) {
    let queryText = "";
    if (type === 'skincare') queryText = "Rekomendasi Skincare & Beauty";
    if (type === 'promo') queryText = "Info promo dan kode voucher aktif";
    if (type === 'lokasi') queryText = "Di mana lokasi toko/gudang DhinaCOLLECTION?";
    if (type === 'admin') queryText = "Minta nomor kontak WA Admin toko";

    this.appendMessage('user', queryText);
    this.showTypingAndReply(queryText);
  },

  appendMessage(sender, text) {
    const box = document.getElementById('chat-messages-box');
    if (!box) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text.replace(/\n/g, '<br/>');
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  },

  showTypingAndReply(userInput) {
    const box = document.getElementById('chat-messages-box');
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-msg bot';
    typingMsg.id = 'typing-indicator';
    typingMsg.innerHTML = `<span style="font-style:italic; opacity:0.7;">Sedang mengetik...</span>`;
    box.appendChild(typingMsg);
    box.scrollTop = box.scrollHeight;

    setTimeout(() => {
      typingMsg.remove();
      const reply = this.generateResponse(userInput);
      this.appendMessage('bot', reply);
    }, 800);
  },

  generateResponse(input) {
    const q = input.toLowerCase();

    if (q.includes('lokasi') || q.includes('alamat') || q.includes('pos') || q.includes('gudang') || q.includes('jatinegara')) {
      return this.knowledgeBase.location;
    }

    if (q.includes('admin') || q.includes('wa') || q.includes('whatsapp') || q.includes('telepon') || q.includes('contact') || q.includes('089530524377')) {
      return this.knowledgeBase.contact;
    }

    if (q.includes('promo') || q.includes('voucher') || q.includes('diskon') || q.includes('kode')) {
      return this.knowledgeBase.vouchers;
    }

    if (q.includes('ongkir') || q.includes('ekspedisi') || q.includes('kirim') || q.includes('kurir') || q.includes('gosend')) {
      return this.knowledgeBase.shipping;
    }

    if (q.includes('skincare') || q.includes('serum') || q.includes('beauty') || q.includes('kosmetik')) {
      const topBeauty = PRODUCTS_DATA.filter(p => p.category.includes('Skincare') || p.category.includes('Makeup')).slice(0, 3);
      let res = "Berikut 3 rekomendasi produk Skincare & Kecantikan favorit pelanggan di DhinaCOLLECTION:\n";
      topBeauty.forEach(b => {
        res += `\n• **${b.name}** (${b.brand}) - ${formatRupiah(b.price)}`;
      });
      res += "\n\nSilakan cek selengkapnya di menu Katalog Shop kami!";
      return res;
    }

    if (q.includes('rekomendasi') || q.includes('terlaris') || q.includes('best seller')) {
      const bests = PRODUCTS_DATA.filter(p => p.rating >= 4.9).slice(0, 3);
      let res = "Ini dia produk-produk Best Seller dengan rating 5.0 di toko kami:\n";
      bests.forEach(b => {
        res += `\n🌟 **${b.name}** - ${formatRupiah(b.price)}`;
      });
      return res;
    }

    if (q.includes('lacak') || q.includes('resi') || q.includes('order') || q.includes('pesanan')) {
      return "Untuk memantau status pesanan, silakan buka menu **Tracking Order** pada bagian atas website dan masukkan Nomor Resi/ID Pesanan Anda (contoh: DC-20260721-889).";
    }

    return "Terima kasih telah bertanya! Untuk informasi lebih rinci atau bantuan transaksi langsung, Anda dapat menghubungi **Admin WhatsApp di 089530524377** atau menelusuri menu Katalog Shop kami. Ada hal lain yang bisa dibantu?";
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ChatbotAI.init();
});
