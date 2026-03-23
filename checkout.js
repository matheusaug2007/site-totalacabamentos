/**
 * checkout.js - Lógica isolada para Finalização de Compra e Histórico
 * Total Acabamentos
 */

if (!window.cart) {
    window.cart = JSON.parse(localStorage.getItem('totalAcabamentosCart')) || [];
}

window.openCheckoutModal = function () {
    const modal = document.getElementById('checkout-modal');
    const panel = document.getElementById('checkout-panel');
    if (modal && panel) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        panel.classList.remove('scale-95');
        document.body.style.overflow = 'hidden';
    }
};

window.closeCheckoutModal = function () {
    const modal = document.getElementById('checkout-modal');
    const panel = document.getElementById('checkout-panel');
    if (modal && panel) {
        modal.classList.add('opacity-0');
        modal.setAttribute('aria-hidden', 'true');
        panel.classList.add('scale-95');
        document.body.style.overflow = '';
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
};

window.handleCheckout = function () {
    if (!Array.isArray(window.cart)) window.cart = [];
    if (window.cart.length === 0) {
        if (window.openEmptyCartModal) window.openEmptyCartModal();
        else alert('Seu carrinho está vazio!');
        return;
    }

    const container = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');

    if (!container) return;

    let html = '';
    let total = 0;

    window.cart.forEach(item => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        const itemTotal = price * qty;
        total += itemTotal;

        html += `
            <div class="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-md">
                <div class="w-12 h-12 bg-black rounded flex items-center justify-center text-brand-yellow shrink-0">
                    <span class="material-symbols-outlined text-2xl">${item.icon || 'category'}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-white text-xs truncate leading-tight">${item.name}</h4>
                    <div class="text-zinc-500 text-[10px] uppercase font-bold mt-1">Qtd: ${qty}</div>
                </div>
                <div class="text-brand-yellow font-bold text-sm shrink-0 whitespace-nowrap">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    const formatted = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (subtotalEl) subtotalEl.textContent = formatted;
    if (totalEl) totalEl.textContent = formatted;

    if (window.closeCart) window.closeCart();
    window.openCheckoutModal();
};

window.confirmPurchase = function () {
    // 1. Criar objeto do pedido para o histórico
    const orderId = 'TOT-' + Math.floor(Math.random() * 9000 + 1000);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');

    let total = 0;
    window.cart.forEach(i => total += (i.price * i.quantity));

    const newOrder = {
        id: orderId,
        date: formattedDate,
        total: total,
        status: 'Processando',
        itemsCount: window.cart.length
    };

    // 2. Salvar no localStorage (Histórico)
    const history = JSON.parse(localStorage.getItem('totalOrdersHistory')) || [];
    history.unshift(newOrder); // Novo primeiro
    localStorage.setItem('totalOrdersHistory', JSON.stringify(history));

    // 3. Atualizar UI do Perfil se estiver aberta
    if (window.updateOrdersUI) window.updateOrdersUI();

    if (window.showToast) {
        window.showToast('Pedido ' + orderId + ' confirmado! 🎉', 'success', 5000);
    }

    // 4. Limpar Carrinho
    window.cart = [];
    localStorage.removeItem('totalAcabamentosCart');
    if (window.renderCart) window.renderCart();
    if (window.updateCartCount) window.updateCartCount();

    window.closeCheckoutModal();
};

// Fechar ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('checkout-modal');
    if (modal && e.target === modal) window.closeCheckoutModal();
});
