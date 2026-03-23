document.addEventListener('DOMContentLoaded', () => {
    const allProducts = Array.isArray(window.allProducts) ? window.allProducts : [];
    if (allProducts.length === 0) return;

    const normalizeString = (str) => {
        return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    const upsertCartItem = (product, qty) => {
        if (!product || !qty || qty < 1) return;

        if (!window.cart) {
            window.cart = JSON.parse(localStorage.getItem('totalAcabamentosCart')) || [];
        }

        const existing = window.cart.find(item => String(item.id) === String(product.id));
        if (existing) {
            existing.quantity += qty;
        } else {
            window.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                icon: product.icon || 'inventory_2',
                quantity: qty
            });
        }

        localStorage.setItem('totalAcabamentosCart', JSON.stringify(window.cart));
        if (window.updateCartCount) window.updateCartCount();
        if (window.renderCart) window.renderCart();
    };

    const detailsModalHTML = `
        <div id="product-details-modal" class="fixed inset-0 bg-black/80 z-[170] hidden opacity-0 transition-opacity duration-300 p-2 sm:p-4">
            <div id="product-details-panel" class="bg-zinc-950 w-full max-w-4xl max-h-[88vh] overflow-y-auto custom-scrollbar mx-auto mt-2 sm:mt-6 rounded-custom border border-zinc-800 shadow-2xl transform scale-95 transition-transform duration-300">
                <div class="p-3 sm:p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-20">
                    <h3 class="text-lg sm:text-xl font-black uppercase tracking-tight text-white">Detalhes do Produto</h3>
                    <button type="button" onclick="window.closeProductDetails()" class="text-zinc-400 hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>
                <div id="product-details-content" class="p-3 sm:p-4"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', detailsModalHTML);

    const detailsModal = document.getElementById('product-details-modal');
    const detailsPanel = document.getElementById('product-details-panel');
    const detailsContent = document.getElementById('product-details-content');

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');


    const renderProductDetails = (product, selectedPhoto, qty) => {
        const photos = Array.isArray(product.photos) && product.photos.length ? product.photos : [];
        const mainPhoto = photos[selectedPhoto] || photos[0] || '';
        const unitLabel = product.unit || '';
        detailsContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="lg:sticky lg:top-[72px] self-start">
                    <div class="bg-black border border-zinc-800 rounded-custom overflow-hidden">
                        <img src="${mainPhoto}" alt="${product.name}" class="w-full h-[185px] sm:h-[240px] lg:h-[300px] object-cover" loading="eager" decoding="async" fetchpriority="high" />
                    </div>
                    <div class="grid grid-cols-3 gap-2 mt-2.5">
                        ${photos.map((photo, i) => `
                            <button type="button" onclick="window.selectProductPhoto(${i})" class="border ${i === selectedPhoto ? 'border-brand-yellow' : 'border-zinc-800'} rounded-custom overflow-hidden bg-black">
                                <img src="${photo}" alt="Miniatura ${i + 1}" class="w-full h-14 sm:h-16 object-cover opacity-90 hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="space-y-3 pb-20 sm:pb-0">
                    <p class="text-[10px] uppercase tracking-wider text-zinc-500">Marca: <span class="text-zinc-300">${product.brand || 'Total Acabamentos'}</span></p>
                    <h4 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">${product.name}</h4>
                    <p class="text-zinc-400 text-sm sm:text-base leading-relaxed">${product.description || ''}</p>

                    <div class="text-brand-yellow text-2xl sm:text-3xl font-black">R$ ${Number(product.price).toFixed(2).replace('.', ',')}${unitLabel}</div>

                    <details class="bg-black/40 border border-zinc-800 rounded-custom p-3" open>
                        <summary class="text-xs uppercase tracking-wider font-bold text-zinc-500 cursor-pointer select-none">Especificacoes</summary>
                        <ul class="space-y-1.5 mt-3">
                            ${(product.specs || []).map(spec => `<li class="text-sm text-zinc-300">- ${spec}</li>`).join('')}
                        </ul>
                    </details>

                    <div class="product-detail-actions-sticky lg:static">
                        <div class="flex items-center gap-3">
                            <span class="text-xs uppercase font-bold tracking-wider text-zinc-500">Quantidade</span>
                            <div class="flex items-center bg-black border border-zinc-700 rounded-custom">
                                <button type="button" onclick="window.updateProductDetailQty(-1)" class="h-10 w-10 text-zinc-400 hover:text-white transition-colors">-</button>
                                <span id="product-detail-qty" class="h-10 w-10 flex items-center justify-center text-white font-bold">${qty}</span>
                                <button type="button" onclick="window.updateProductDetailQty(1)" class="h-10 w-10 text-zinc-400 hover:text-white transition-colors">+</button>
                            </div>
                        </div>
                        <button id="product-detail-add-to-cart-btn" type="button" onclick="window.addProductDetailToCart()" class="w-full bg-brand-yellow text-black py-3 rounded-custom font-bold uppercase tracking-wider hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 mt-3">
                            <span class="material-symbols-outlined">add_shopping_cart</span>
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    let currentProduct = null;
    let currentPhoto = 0;
    let currentQty = 1;

    window.openProductDetails = function (productId) {
        const product = window.getProductById ? window.getProductById(productId) : allProducts.find(p => String(p.id) === String(productId));
        if (!product) return;

        currentProduct = product;
        currentPhoto = 0;
        currentQty = 1;
        renderProductDetails(currentProduct, currentPhoto, currentQty);

        detailsModal.classList.remove('hidden');
        void detailsModal.offsetWidth;
        detailsModal.classList.remove('opacity-0');
        detailsPanel.classList.remove('scale-95');
        document.body.style.overflow = 'hidden';
    };

    window.closeProductDetails = function () {
        detailsModal.classList.add('opacity-0');
        detailsPanel.classList.add('scale-95');
        setTimeout(() => detailsModal.classList.add('hidden'), 300);
        document.body.style.overflow = '';
    };

    window.selectProductPhoto = function (index) {
        if (!currentProduct) return;
        currentPhoto = index;
        renderProductDetails(currentProduct, currentPhoto, currentQty);
    };

    window.updateProductDetailQty = function (delta) {
        currentQty = Math.max(1, currentQty + delta);
        const qtyEl = document.getElementById('product-detail-qty');
        if (qtyEl) qtyEl.textContent = String(currentQty);
    };

    window.addProductDetailToCart = function () {
        if (!currentProduct) return;
        const addButton = document.getElementById('product-detail-add-to-cart-btn');
        if (addButton && addButton.disabled) return;

        if (addButton) {
            addButton.disabled = true;
            addButton.classList.add('opacity-80', 'cursor-wait');
        }

        if (addButton && window.animateToCart) {
            window.animateToCart(addButton);
        }
        upsertCartItem(currentProduct, currentQty);

        if (addButton) {
            const label = addButton.lastChild;
            const originalText = label && label.nodeType === Node.TEXT_NODE ? label.textContent : null;
            if (originalText !== null) {
                label.textContent = ' Adicionado';
            }
            setTimeout(() => {
                addButton.disabled = false;
                addButton.classList.remove('opacity-80', 'cursor-wait');
                if (originalText !== null) {
                    label.textContent = originalText;
                }
            }, 850);
        }
    };


    detailsModal.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'product-details-modal') {
            window.closeProductDetails();
        }
    });

    const productsSection = document.getElementById('produtos');
    if (!productsSection) return;

    const brandsSectionHTML = `
        <section id="marcas" class="py-16 md:py-24 bg-zinc-950 border-t border-zinc-900 overflow-hidden" data-purpose="brands-section">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between gap-4 mb-8 md:mb-10">
                    <h2 id="brands-title" class="text-2xl md:text-3xl font-bold uppercase tracking-tighter border-l-4 border-brand-yellow pl-3 md:pl-4">Produtos por Marca</h2>
                    <button id="brands-back-btn" class="hidden text-brand-yellow hover:text-white text-sm uppercase font-bold tracking-wider cursor-pointer border-b-2 border-transparent hover:border-brand-yellow pb-1 transition-all flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">arrow_back</span> Voltar às Marcas
                    </button>
                </div>
                <div id="brands-catalog"></div>
            </div>
        </section>
    `;

    productsSection.insertAdjacentHTML('afterend', brandsSectionHTML);

    const brandsCatalog = document.getElementById('brands-catalog');
    const brandsTitle = document.getElementById('brands-title');
    const brandsBackBtn = document.getElementById('brands-back-btn');

    const groups = allProducts.reduce((acc, p) => {
        const brand = p.brand || 'Total Acabamentos';
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(p);
        return acc;
    }, {});

    const sortedBrands = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const rotateBrands = (arr, offset) => {
        if (!arr.length) return [];
        const safeOffset = ((offset % arr.length) + arr.length) % arr.length;
        return [...arr.slice(safeOffset), ...arr.slice(0, safeOffset)];
    };

    const getBrandIcon = (brandName) => {
        const items = groups[brandName] || [];
        return items[0] && items[0].icon ? items[0].icon : 'inventory_2';
    };

    const getBrandChip = (brandName, accentClass) => {
        const count = (groups[brandName] || []).length;
        const icon = getBrandIcon(brandName);
        const escapedBrand = brandName.replace(/'/g, "\\'");

        return `
            <button type="button" onclick="window.showBrandProducts('${escapedBrand}')" class="group min-w-[230px] md:min-w-[280px] bg-black/90 border border-zinc-800 rounded-custom px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand-yellow hover:shadow-[0_10px_28px_rgba(255,217,0,0.16)]">
                <div class="flex items-center gap-3">
                    <div class="h-11 w-11 rounded-full ${accentClass} flex items-center justify-center border border-black/30 shadow-inner shrink-0">
                        <span class="material-symbols-outlined text-black text-xl">${icon}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="text-white font-black uppercase text-xs md:text-sm truncate">${brandName}</p>
                        <p class="text-zinc-400 text-[12px] font-semibold uppercase tracking-wide mt-0.5">${count} produtos</p>
                    </div>
                    <span class="material-symbols-outlined text-zinc-600 group-hover:text-brand-yellow transition-colors">arrow_outward</span>
                </div>
            </button>
        `;
    };

    const getMarqueeRow = (brands, animationClass, duration, accentClass) => {
        const chips = brands.map(brand => getBrandChip(brand, accentClass)).join('');
        return `
            <div class="brands-marquee-row">
                <div class="brands-marquee-track ${animationClass}" style="--brands-duration:${duration}s;">
                    ${chips}
                    ${chips}
                </div>
            </div>
        `;
    };

    const renderBrands = () => {
        brandsTitle.textContent = 'Produtos por Marca';
        brandsBackBtn.classList.add('hidden');

        const row1 = sortedBrands;
        const row2 = rotateBrands([...sortedBrands].reverse(), 1);
        const row3 = rotateBrands(sortedBrands, 2);

        brandsCatalog.innerHTML = `
            <div class="space-y-2 animate-[fadeIn_0.35s_ease-out]">
                ${getMarqueeRow(row1, 'brands-marquee-left', 34, 'bg-brand-yellow')}
                ${getMarqueeRow(row2, 'brands-marquee-right', 40, 'bg-yellow-400')}
                ${getMarqueeRow(row3, 'brands-marquee-left', 46, 'bg-yellow-300')}
            </div>
        `;
    };

    window.showBrandProducts = function (brandName) {
        const items = groups[brandName] || [];
        brandsTitle.textContent = `Marca: ${brandName}`;
        brandsBackBtn.classList.remove('hidden');

        let html = '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-[fadeIn_0.3s_ease-out]">';
        items.forEach(product => {
            html += `
                <div class="bg-black rounded-custom overflow-hidden border border-zinc-800 hover:border-brand-yellow transition-colors flex flex-col h-full" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">
                    <div class="aspect-[4/3] md:aspect-square bg-zinc-900 flex items-center justify-center p-3 sm:p-4">
                        <span class="material-symbols-outlined text-4xl sm:text-5xl text-brand-yellow opacity-90">${product.icon}</span>
                    </div>
                    <div class="p-3 sm:p-4 flex flex-col gap-2 h-full">
                        <p class="text-[10px] uppercase tracking-wider text-zinc-500">${product.brand}</p>
                        <h4 class="text-white text-xs font-bold leading-tight min-h-[2.5rem]">${product.name}</h4>
                        <div class="text-brand-yellow font-bold text-sm">R$ ${Number(product.price).toFixed(2).replace('.', ',')}${product.unit || ''}</div>
                        <button type="button" onclick="window.openProductDetails('${product.id}')" class="w-full border border-zinc-700 text-zinc-300 py-2 rounded-custom font-bold text-[10px] uppercase tracking-wider hover:border-brand-yellow hover:text-white transition-colors mt-auto">Ver Detalhes</button>
                        <button class="add-to-cart-btn-dynamic w-full bg-brand-yellow text-black py-2 rounded-custom font-bold text-[10px] uppercase tracking-wider hover:bg-yellow-500 transition-colors">Comprar</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        brandsCatalog.innerHTML = html;

        const section = document.getElementById('marcas');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    brandsBackBtn.addEventListener('click', renderBrands);
    renderBrands();
});
