// ecommerce.js - Sistema de Carrinho de Compras com Animação de "Pulo"
document.addEventListener('DOMContentLoaded', () => {
    if (!window.cart) {
        window.cart = JSON.parse(localStorage.getItem('totalAcabamentosCart')) || [];
    }

    // Cria e insere o HTML do modal do carrinho
    const cartModalHTML = `
        <div id="cart-modal" class="fixed inset-0 bg-black/80 z-[100] hidden flex justify-end transition-opacity duration-300 opacity-0">
            <div class="bg-zinc-950 w-full max-w-md h-full flex flex-col border-l border-zinc-800 transform translate-x-full transition-transform duration-300 delay-75" id="cart-panel">
                <div class="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <h2 class="text-2xl font-bold uppercase text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-yellow">shopping_cart</span> Seu Carrinho
                    </h2>
                    <button id="close-cart" class="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-zinc-800">
                        <span class="material-symbols-outlined text-3xl block">close</span>
                    </button>
                </div>
                
                <div id="cart-items" class="flex-1 overflow-y-auto p-6 space-y-4 relative custom-scrollbar">
                    <!-- Items go here -->
                </div>
                
                <div class="p-6 border-t border-zinc-800 bg-black shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-zinc-400 uppercase font-bold text-sm tracking-wider">Total</span>
                        <span id="cart-total" class="text-3xl font-bold text-brand-yellow">R$ 0,00</span>
                    </div>
                    <button id="checkout-btn" onclick="window.handleCheckout()" class="w-full cursor-pointer bg-brand-yellow text-black py-4 rounded-custom font-bold text-lg uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-[0_0_20px_rgba(255,217,0,0.2)] hover:shadow-[0_0_25px_rgba(255,217,0,0.4)] flex justify-center items-center gap-3 group">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
                        Finalizar Compra
                    </button>
                    <button id="clear-cart-btn" class="w-full cursor-pointer bg-transparent border border-zinc-700 text-zinc-400 mt-4 py-3 rounded-custom font-bold text-xs uppercase tracking-widest hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition-all">
                        Esvaziar Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', cartModalHTML);

    // Referências dos elementos
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartPanel = document.getElementById('cart-panel');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    // Funções de abrir e fechar o carrinho
    function openCart() {
        cartModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            cartModal.classList.add('opacity-100');
            cartPanel.classList.remove('translate-x-full');
        });

        window.renderCart();
    }

    function closeCart() {
        cartModal.classList.remove('opacity-100');
        cartPanel.classList.add('translate-x-full');

        setTimeout(() => {
            cartModal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    // Eventos
    closeCartBtn.addEventListener('click', closeCart);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCart();
    });

    const cartOpeners = document.querySelectorAll('.open-cart-btn');
    cartOpeners.forEach(btn => btn.addEventListener('click', openCart));

    // Atualiza o contador na bolinha do carrinho
    function updateCartCount() {
        if (!window.cart) window.cart = [];
        const count = window.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElements.forEach(el => {
            el.textContent = count;
            if (count > 0) {
                el.classList.add('scale-125', 'bg-yellow-400');
                setTimeout(() => el.classList.remove('scale-125', 'bg-yellow-400'), 200);
            }
        });
        localStorage.setItem('totalAcabamentosCart', JSON.stringify(window.cart));
    }

    window.openCart = openCart;
    window.closeCart = closeCart;
    window.updateCartCount = updateCartCount;

    // Renderiza a lista de produtos no modal do carrinho
    window.renderCart = function () {
        if (!window.cart) window.cart = [];
        const formatPrice = (v) => window.UI ? window.UI.formatPrice(v) : `R$ ${v.toFixed(2).replace('.', ',')}`;

        if (window.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-zinc-500 pt-20">
                    <span class="material-symbols-outlined text-7xl mb-6 opacity-30">production_quantity_limits</span>
                    <p class="text-xl font-medium text-white mb-2">Carrinho Vazio</p>
                    <p class="text-sm text-center px-6">Você ainda não adicionou nenhum item ao seu carrinho.</p>
                </div>
            `;
            cartTotalElement.textContent = formatPrice(0);
            updateCartCount();
            return;
        }

        let html = '';
        let total = 0;

        window.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-custom border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <div class="w-16 h-16 bg-black rounded flex items-center justify-center text-brand-yellow shrink-0 border border-zinc-800 shadow-inner">
                        <span class="material-symbols-outlined text-3xl opacity-80">${item.icon}</span>
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 class="font-bold text-white text-sm truncate leading-tight">${item.name}</h4>
                        <div class="text-brand-yellow font-bold mt-1 text-xs">${formatPrice(item.price)}</div>
                        <div class="flex items-center gap-4 mt-2">
                            <div class="flex items-center bg-black rounded-sm border border-zinc-700 h-6">
                                <button class="text-zinc-400 hover:text-white w-6 flex items-center justify-center" onclick="updateQty(${index}, -1)">-</button>
                                <span class="text-[10px] font-bold w-6 text-center text-white">${item.quantity}</span>
                                <button class="text-zinc-400 hover:text-white w-6 flex items-center justify-center" onclick="updateQty(${index}, 1)">+</button>
                            </div>
                            <button class="text-zinc-500 hover:text-red-500 text-[10px] uppercase font-bold tracking-wider" onclick="removeItem(${index})">Remover</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotalElement.textContent = formatPrice(total);
        updateCartCount();
    }

    window.updateQty = function (index, change) {
        if (window.cart && window.cart[index]) {
            window.cart[index].quantity += change;
            if (window.cart[index].quantity <= 0) {
                window.cart.splice(index, 1);
            }
            renderCart();
        }
    }

    window.removeItem = function (index) {
        if (window.cart) window.cart.splice(index, 1);
        renderCart();
    }

    clearCartBtn.addEventListener('click', () => {
        window.cart = [];
        renderCart();
    });

    // --- Lógica da Animação do "Carrinho voador" ---
    window.animateToCart = function (startElement) {
        if (!startElement) return;
        const cartButton = document.querySelector('.open-cart-btn');
        if (!cartButton) return;

        const startRect = startElement.getBoundingClientRect();
        const endRect = cartButton.getBoundingClientRect();
        const startCenterX = startRect.left + (startRect.width / 2);
        const startCenterY = startRect.top + (startRect.height / 2);
        const endCenterX = endRect.left + (endRect.width / 2);
        const endCenterY = endRect.top + (endRect.height / 2);

        const flyingIcon = document.createElement('div');
        flyingIcon.className = 'flying-cart-icon';
        flyingIcon.innerHTML = `
            <div class="flying-cart-inner">
                <span class="material-symbols-outlined text-xl">shopping_cart</span>
            </div>
        `;

        flyingIcon.style.left = startCenterX - 20 + 'px';
        flyingIcon.style.top = startCenterY - 20 + 'px';

        document.body.appendChild(flyingIcon);

        const deltaX = endCenterX - startCenterX;
        const deltaY = endCenterY - startCenterY;

        const motion = flyingIcon.animate([
            { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
            { transform: `translate(${deltaX * 0.55}px, ${deltaY * 0.55 - 92}px) scale(0.86) rotate(-10deg)`, opacity: 0.96, offset: 0.58 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.22) rotate(20deg)`, opacity: 0.2, offset: 1 }
        ], {
            duration: 1100,
            easing: 'cubic-bezier(0.2, 0.85, 0.2, 1)',
            fill: 'forwards'
        });

        motion.onfinish = () => {
            const impact = document.createElement('div');
            impact.className = 'cart-impact-ring';
            impact.style.left = endCenterX - 14 + 'px';
            impact.style.top = endCenterY - 14 + 'px';
            document.body.appendChild(impact);

            cartButton.classList.add('cart-hit');
            setTimeout(() => cartButton.classList.remove('cart-hit'), 520);
            setTimeout(() => impact.remove(), 420);

            flyingIcon.remove();
        };
    }

    // Intercepta cliques para adicionar ao carrinho
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-to-cart-btn-dynamic') || e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        e.preventDefault();
        const productCard = btn.closest('[data-product-id]');
        if (!productCard) return;

        const id = productCard.getAttribute('data-product-id');
        const name = productCard.getAttribute('data-product-name');
        const price = parseFloat(productCard.getAttribute('data-product-price'));
        const iconElement = productCard.querySelector('.material-symbols-outlined');
        const icon = iconElement ? iconElement.textContent : 'shopping_cart';

        // Inicia a animação de pulo
        if (window.animateToCart) window.animateToCart(btn);

        if (!window.cart) window.cart = [];
        const existingItem = window.cart.find(item => item.id == id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.cart.push({ id, name, price, icon, quantity: 1 });
        }

        // Breve delay para a animação chegar antes de abrir/atualizar UI
        setTimeout(() => {
            updateCartCount();
            if (window.renderCart) window.renderCart();
            // Abre o carrinho para dar feedback
            window.openCart();
        }, 800);
    });

    updateCartCount();
});
