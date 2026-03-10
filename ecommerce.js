// ecommerce.js - Sistema de Carrinho de Compras
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('totalAcabamentosCart')) || [];

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
                    <button id="checkout-btn" class="w-full cursor-pointer bg-brand-yellow text-black py-4 rounded-custom font-bold text-lg uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-[0_0_20px_rgba(255,217,0,0.2)] hover:shadow-[0_0_25px_rgba(255,217,0,0.4)] flex justify-center items-center gap-3 group">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
                        Finalizar Compra
                    </button>
                    <button id="clear-cart-btn" class="w-full cursor-pointer bg-transparent border border-zinc-700 text-zinc-400 mt-4 py-3 rounded-custom font-bold text-xs uppercase tracking-widest hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition-all">
                        Esvaziar Carrinho
                    </button>
                </div>
            </div>
        </div>
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', cartModalHTML);

    // Referências dos elementos
    const cartCountElements = document.querySelectorAll('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartPanel = document.getElementById('cart-panel');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    // Funções de abrir e fechar o carrinho
    function openCart() {
        cartModal.classList.remove('hidden');
        // Force reflow
        void cartModal.offsetWidth;
        cartModal.classList.remove('opacity-0');
        cartPanel.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden'; // Evita scroll na página de fundo
        renderCart();
    }

    function closeCart() {
        cartModal.classList.add('opacity-0');
        cartPanel.classList.add('translate-x-full');
        document.body.style.overflow = '';
        setTimeout(() => {
            cartModal.classList.add('hidden');
        }, 300);
    }

    // Eventos
    closeCartBtn.addEventListener('click', closeCart);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCart();
    });

    // Botões que abrem o carrinho (header)
    const cartOpeners = document.querySelectorAll('.open-cart-btn');
    cartOpeners.forEach(btn => btn.addEventListener('click', openCart));

    // Atualiza o contador na bolinha do carrinho
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElements.forEach(el => {
            el.textContent = count;
            if (count > 0) {
                el.classList.add('scale-125', 'bg-yellow-400');
                setTimeout(() => el.classList.remove('scale-125', 'bg-yellow-400'), 200);
            }
        });
        localStorage.setItem('totalAcabamentosCart', JSON.stringify(cart));
    }

    // Renderiza a lista de produtos no modal do carrinho
    window.renderCart = function () {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-zinc-500 pt-20">
                    <span class="material-symbols-outlined text-7xl mb-6 opacity-30">production_quantity_limits</span>
                    <p class="text-xl font-medium text-white mb-2">Carrinho Vazio</p>
                    <p class="text-sm text-center px-6">Você ainda não adicionou nenhum item ao seu carrinho.</p>
                    <button onclick="document.getElementById('close-cart').click();" class="mt-8 text-brand-yellow font-bold uppercase text-sm border-b border-brand-yellow pb-1 hover:opacity-80 transition-opacity cursor-pointer">
                        Voltar aos Produtos
                    </button>
                </div>
            `;
            cartTotalElement.textContent = 'R$ 0,00';
            updateCartCount();
            return;
        }

        let html = '';
        let total = 0;

        // Renderiza cada item
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-custom border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <div class="w-20 h-20 bg-black rounded flex items-center justify-center text-brand-yellow shrink-0 border border-zinc-800 shadow-inner">
                        <span class="material-symbols-outlined text-4xl opacity-80">${item.icon}</span>
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 class="font-bold text-white text-[15px] truncate leading-tight">${item.name}</h4>
                        <div class="text-brand-yellow font-bold mt-1 text-sm">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                        
                        <div class="flex items-center gap-4 mt-3">
                            <div class="flex items-center bg-black rounded-sm border border-zinc-700 h-8">
                                <button class="text-zinc-400 hover:text-white hover:bg-zinc-800 w-8 h-full flex items-center justify-center transition-colors cursor-pointer rounded-l-sm" onclick="updateQty(${index}, -1)">-</button>
                                <span class="text-xs font-bold w-8 text-center text-white Select-none">${item.quantity}</span>
                                <button class="text-zinc-400 hover:text-white hover:bg-zinc-800 w-8 h-full flex items-center justify-center transition-colors cursor-pointer rounded-r-sm" onclick="updateQty(${index}, 1)">+</button>
                            </div>
                            <button class="text-zinc-500 hover:text-red-500 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-1" onclick="removeItem(${index})">
                                <span class="material-symbols-outlined text-[16px]">delete</span>
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        updateCartCount();
    }

    // Funções globais para os botões inline do carrinho
    window.updateQty = function (index, change) {
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            renderCart();
        }
    }

    window.removeItem = function (index) {
        cart.splice(index, 1);
        renderCart();
    }

    clearCartBtn.addEventListener('click', () => {
        cart = [];
        renderCart();
    });

    // Finalizar compra (abrir modal)
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            if (window.openEmptyCartModal) {
                window.openEmptyCartModal();
            } else {
                alert('Você ainda não adicionou nenhum item ao seu carrinho.');
            }
            return;
        }

        const checkoutItemsContainer = document.getElementById('checkout-items');
        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        const checkoutTotal = document.getElementById('checkout-total');

        if (checkoutItemsContainer) {
            let html = '';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                html += `
                    <div class="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-md">
                        <div class="w-12 h-12 bg-black rounded flex items-center justify-center text-brand-yellow shrink-0">
                            <span class="material-symbols-outlined text-2xl">${item.icon}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-white text-xs truncate leading-tight">${item.name}</h4>
                            <div class="text-zinc-500 text-[10px] uppercase font-bold mt-1">Qtd: ${item.quantity}</div>
                        </div>
                        <div class="text-brand-yellow font-bold text-sm shrink-0 whitespace-nowrap">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
                    </div>
                `;
            });

            checkoutItemsContainer.innerHTML = html;

            const totalFormatted = `R$ ${total.toFixed(2).replace('.', ',')}`;
            if (checkoutSubtotal) checkoutSubtotal.textContent = totalFormatted;
            if (checkoutTotal) checkoutTotal.textContent = totalFormatted;

            if (window.openCheckoutModal) {
                window.openCheckoutModal();
            }
        }
    });

    // Adiciona produto ao carrinho usando delegação de eventos (funciona em produtos gerados dinamicamente)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-to-cart-btn-dynamic') || e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        e.preventDefault();

        const productCard = btn.closest('[data-product-id]');
        if (!productCard) return;

        const id = productCard.getAttribute('data-product-id');
        const name = productCard.getAttribute('data-product-name');
        const price = parseFloat(productCard.getAttribute('data-product-price'));
        const icon = productCard.querySelector('.material-symbols-outlined').textContent;

        // Animação visual do botão ao clicar
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">sync</span> Aguarde...';
        btn.classList.remove('bg-brand-yellow', 'text-black', 'hover:bg-yellow-500');
        btn.classList.add('bg-green-500', 'text-white');

        setTimeout(() => {
            btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Adicionado!';

            // Abre o carrinho
            openCart();

            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.add('bg-brand-yellow', 'text-black', 'hover:bg-yellow-500');
                btn.classList.remove('bg-green-500', 'text-white');
            }, 1000);
        }, 300);

        const existingItem = cart.find(item => item.id == id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, icon, quantity: 1 });
        }

        updateCartCount();
        if (!cartModal.classList.contains('hidden')) renderCart();
    });

    // Run inicial para carregar dados salvos no localStorage
    updateCartCount();
});
