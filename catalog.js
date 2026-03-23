document.addEventListener('DOMContentLoaded', () => {
    const catalogContainer = document.getElementById('dynamic-catalog');
    const mobileFiltersBar = document.getElementById('catalog-mobile-filters');
    const mobileFilterCategory = document.getElementById('mobile-filter-category');
    const mobileFilterSort = document.getElementById('mobile-filter-sort');
    if (!catalogContainer) return;

    let currentCatalogProducts = [];
    let currentCatalogMode = 'categories';

    const setCatalogBusy = (isBusy) => {
        catalogContainer.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    };

    const extractBrandFromName = (name) => {
        const parts = String(name || '').split('-');
        if (parts.length < 2) return 'Total Acabamentos';
        return parts[parts.length - 1].trim();
    };

    const buildProductPhotos = (id) => {
        const safeId = encodeURIComponent(String(id || 'produto'));
        return [
            `https://picsum.photos/seed/total-${safeId}-1/640/480`,
            `https://picsum.photos/seed/total-${safeId}-2/640/480`,
            `https://picsum.photos/seed/total-${safeId}-3/640/480`
        ];
    };

    const enrichProduct = (product) => {
        const brand = product.brand || extractBrandFromName(product.name);
        return {
            ...product,
            brand,
            description: product.description || `${product.name} com qualidade ${brand}, ideal para obra e acabamento.`,
            specs: product.specs || [
                `Marca: ${brand}`,
                `Categoria: ${product.category || 'geral'}`,
                `Garantia: 12 meses`
            ],
            photos: Array.isArray(product.photos) && product.photos.length > 0 ? product.photos : buildProductPhotos(product.id)
        };
    };

    const getAvailabilityBadge = (product) => {
        const status = normalizeString(product.availability || product.stockStatus || 'disponivel');

        if (status.includes('encomenda')) {
            return { label: 'Sob encomenda', tone: 'preorder' };
        }

        if (status.includes('baixo')) {
            return { label: 'Estoque baixo', tone: 'low' };
        }

        return { label: 'Entrega rapida', tone: 'available' };
    };

    const formatPrice = (value) => window.UI ? window.UI.formatPrice(value) : `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;

    const escapeAttr = (value) => String(value || '').replace(/"/g, '&quot;');

    const renderCommercialShowcase = () => {
        const spotlight = document.getElementById('showcase-spotlight');
        const tagEl = document.getElementById('showcase-spotlight-tag');
        const brandEl = document.getElementById('showcase-spotlight-brand');
        const nameEl = document.getElementById('showcase-spotlight-name');
        const descriptionEl = document.getElementById('showcase-spotlight-description');
        const priceEl = document.getElementById('showcase-spotlight-price');
        const oldPriceEl = document.getElementById('showcase-spotlight-old-price');
        const detailsBtn = document.getElementById('showcase-spotlight-details');
        const miniStripEl = document.getElementById('showcase-mini-strip');
        const photoFrameEl = document.getElementById('showcase-spotlight-photo-frame');
        const photoEl = document.getElementById('showcase-spotlight-photo');
        const iconWrapEl = document.getElementById('showcase-spotlight-icon-wrap');

        const modeButtons = {
            best: document.getElementById('showcase-mode-best'),
            promo: document.getElementById('showcase-mode-promo'),
            new: document.getElementById('showcase-mode-new')
        };

        if (!spotlight || !tagEl || !brandEl || !nameEl || !descriptionEl || !priceEl || !oldPriceEl || !detailsBtn || !miniStripEl || !photoFrameEl || !photoEl || !iconWrapEl || !modeButtons.best || !modeButtons.promo || !modeButtons.new) {
            return;
        }

        const progressBar = document.getElementById('showcase-progress-bar');
        const iconEl = document.getElementById('showcase-spotlight-icon');

        const products = [...window.allProducts];
        if (!products.length) return;

        const hasLocalPhoto = (product) => Array.isArray(product.photos)
            && product.photos.some(photo => String(photo || '').startsWith('imagens/'));

        const featuredPhotoProductId = products.find(product => hasLocalPhoto(product))?.id || null;

        const bestSellers = [...products]
            .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
            .slice(0, 4)
            .map((product) => ({
                ...product,
                showcaseTag: 'Mais vendido',
                showcaseTagClass: 'showcase-tag-hot'
            }));

        const promotions = [...products]
            .filter(p => Number(p.price || 0) >= 30)
            .slice(0, 4)
            .map((product, index) => {
                const discountRate = 0.1 + (index % 3) * 0.03;
                return {
                    ...product,
                    oldPrice: Number(product.price || 0) * (1 + discountRate),
                    showcaseTag: `${Math.round(discountRate * 100)}% OFF`,
                    showcaseTagClass: 'showcase-tag-off'
                };
            });

        const newest = [...products]
            .reverse()
            .slice(0, 4)
            .map((product) => ({
                ...product,
                showcaseTag: 'Novo',
                showcaseTagClass: 'showcase-tag-new'
            }));

        if (featuredPhotoProductId) {
            const featuredPhotoProduct = products.find(product => String(product.id) === String(featuredPhotoProductId));
            if (featuredPhotoProduct) {
                const promotedPhotoProduct = {
                    ...featuredPhotoProduct,
                    showcaseTag: 'Ambiente real',
                    showcaseTagClass: 'showcase-tag-new'
                };

                showcaseModesPrepend(newest, promotedPhotoProduct);
            }
        }

        const showcaseModes = {
            best: bestSellers,
            promo: promotions,
            new: newest
        };

        let activeMode = featuredPhotoProductId ? 'new' : 'best';
        let activeIndex = 0;
        let showcaseInterval = null;
        const INTERVAL_TIME = 6000;

        function showcaseModesPrepend(modeProducts, product) {
            const deduped = modeProducts.filter(item => String(item.id) !== String(product.id));
            modeProducts.splice(0, modeProducts.length, product, ...deduped.slice(0, 3));
        }

        const startProgressBar = () => {
            if (!progressBar) return;
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            void progressBar.offsetWidth;
            progressBar.style.transition = `width ${INTERVAL_TIME}ms linear`;
            progressBar.style.width = '100%';
        };

        const getModeLabel = (mode) => {
            if (mode === 'promo') return 'Oferta da semana';
            if (mode === 'new') return 'Lançamento';
            return 'Destaque da semana';
        };

        const getShortDescription = (product) => {
            const raw = String(product.description || '').trim();
            if (!raw) return 'Seleção recomendada para obra e acabamento com entrega rápida.';
            return raw.length > 120 ? `${raw.slice(0, 117)}...` : raw;
        };

        const setModeVisualState = () => {
            Object.entries(modeButtons).forEach(([mode, btn]) => {
                const isActive = mode === activeMode;
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        };

        const renderMiniStrip = (modeProducts) => {
            const current = modeProducts[activeIndex];
            const nextItems = modeProducts.filter((item) => String(item.id) !== String(current.id)).slice(0, 3);

            miniStripEl.innerHTML = nextItems.map((item, idx) => `
                <button type="button" class="showcase-mini-item" onclick="window.openProductDetails('${escapeAttr(item.id)}')">
                    <span class="showcase-mini-rank">${String(idx + 1).padStart(2, '0')}</span>
                    <div class="showcase-mini-icon-box">
                        <span class="material-symbols-outlined text-sm">${item.icon || 'inventory_2'}</span>
                    </div>
                    <div class="showcase-mini-info">
                        <span class="showcase-mini-name">${item.name}</span>
                        <span class="showcase-mini-price">R$ ${formatPrice(item.price)}</span>
                    </div>
                </button>
            `).join('');
        };

        const renderSpotlight = () => {
            const modeProducts = showcaseModes[activeMode] || [];
            if (!modeProducts.length) return;

            const product = modeProducts[activeIndex % modeProducts.length];
            const localPhoto = Array.isArray(product.photos)
                ? product.photos.find(photo => String(photo || '').startsWith('imagens/')) || product.photos[0]
                : '';

            spotlight.setAttribute('data-product-id', String(product.id));
            spotlight.setAttribute('data-product-name', String(product.name));
            spotlight.setAttribute('data-product-price', String(product.price));
            spotlight.setAttribute('data-product-brand', String(product.brand || 'Total Acabamentos'));

            tagEl.textContent = product.showcaseTag || getModeLabel(activeMode);
            brandEl.textContent = product.brand || 'Total Acabamentos';
            nameEl.textContent = product.name;
            descriptionEl.textContent = getShortDescription(product);
            priceEl.textContent = `R$ ${formatPrice(product.price)}${product.unit || ''}`;

            if (iconEl) iconEl.textContent = product.icon || 'inventory_2';

            if (localPhoto) {
                spotlight.classList.add('has-photo');
                photoFrameEl.classList.remove('hidden');
                photoEl.src = localPhoto;
                photoEl.alt = product.name;
                iconWrapEl.setAttribute('aria-hidden', 'true');
            } else {
                spotlight.classList.remove('has-photo');
                photoFrameEl.classList.add('hidden');
                photoEl.src = '';
                photoEl.alt = '';
                iconWrapEl.removeAttribute('aria-hidden');
            }

            if (product.oldPrice) {
                oldPriceEl.textContent = `R$ ${formatPrice(product.oldPrice)}${product.unit || ''}`;
                oldPriceEl.classList.remove('hidden');
            } else {
                oldPriceEl.classList.add('hidden');
            }

            detailsBtn.onclick = () => {
                if (window.openProductDetails) window.openProductDetails(product.id);
            };

            spotlight.classList.remove('showcase-spotlight-animate');
            void spotlight.offsetWidth;
            spotlight.classList.add('showcase-spotlight-animate');

            renderMiniStrip(modeProducts);
            setModeVisualState();
            startProgressBar();
        };

        const resetShowcaseTimer = () => {
            if (showcaseInterval) clearInterval(showcaseInterval);
            showcaseInterval = setInterval(() => {
                const modeProducts = showcaseModes[activeMode] || [];
                if (modeProducts.length < 2) return;
                activeIndex = (activeIndex + 1) % modeProducts.length;
                renderSpotlight();
            }, INTERVAL_TIME);
        };

        Object.entries(modeButtons).forEach(([mode, btn]) => {
            btn.addEventListener('click', () => {
                if (activeMode === mode) return;
                activeMode = mode;
                activeIndex = 0;
                renderSpotlight();
                resetShowcaseTimer();
            });
        });

        renderSpotlight();
        resetShowcaseTimer();
    };

    const dataArr = {
        'mangueira': {
            title: 'Mangueira',
            icon: 'line_curve',
            products: [
                { id: '1', name: 'Mangueira Flexível 15m - Tramontina', price: 89.90, icon: 'line_curve', category: 'mangueira' },
                { id: '1_2', name: 'Mangueira Corrugada 30m - Tigre', price: 120.50, icon: 'line_curve', category: 'mangueira' },
                { id: '1_3', name: 'Mangueira de Nível 10m', price: 35.00, icon: 'line_curve', category: 'mangueira' }
            ]
        },
        'torneira': {
            title: 'Torneira',
            icon: 'faucet',
            products: [
                { id: '2', name: 'Torneira Cromada Inox - Deca', price: 129.50, icon: 'faucet', category: 'torneira' },
                { id: '2_2', name: 'Torneira Gourmet Flexível Preta - Docol', price: 259.90, icon: 'faucet', category: 'torneira' },
                { id: '2_3', name: 'Misturador Monocomando - Lorenzetti', price: 310.00, icon: 'faucet', category: 'torneira' }
            ]
        },
        'cimento': {
            title: 'Cimento',
            icon: 'texture',
            products: [
                { id: '3', name: 'Cimento Portland 50kg - Votorantim', price: 34.90, icon: 'texture', category: 'cimento' },
                { id: '3_2', name: 'Cimento CP II 50kg - CSN', price: 32.90, icon: 'texture', category: 'cimento' },
                { id: '3_3', name: 'Cimento Branco 1kg', price: 8.50, icon: 'texture', category: 'cimento' }
            ]
        },
        'lajota': {
            title: 'Lajota',
            icon: 'view_module',
            products: [
                { id: '4', name: 'Lajota Cerâmica 6 Furos', price: 2.50, unit: '/un', icon: 'view_module', category: 'lajota' },
                { id: '4_2', name: 'Lajota Cerâmica 8 Furos', price: 3.20, unit: '/un', icon: 'view_module', category: 'lajota' },
                { id: '4_3', name: 'Lajota de Isopor EPS', price: 4.50, unit: '/un', icon: 'view_module', category: 'lajota' }
            ]
        },
        'porta': {
            title: 'Porta',
            icon: 'sensor_door',
            products: [
                { id: '5', name: 'Porta de Madeira Reforçada 80x210', price: 349.00, icon: 'sensor_door', category: 'porta', photos: ['imagens/produtos/Porta/porta-madeira-teste.png'] },
                { id: '5_2', name: 'Porta Sanfonada PVC Branca', price: 149.90, icon: 'sensor_door', category: 'porta' },
                { id: '5_3', name: 'Porta de Alumínio com Vidro', price: 589.00, icon: 'sensor_door', category: 'porta' }
            ]
        },
        'piso': {
            title: 'Piso',
            icon: 'layers',
            products: [
                { id: '6', name: 'Piso Porcelanato 60x60 - Portobello', price: 59.90, unit: '/m²', icon: 'layers', category: 'piso' },
                { id: '6_2', name: 'Revestimento Retificado Acetinado 30x60', price: 45.90, unit: '/m²', icon: 'layers', category: 'piso' },
                { id: '6_3', name: 'Piso Cerâmico Amadeirado', price: 39.90, unit: '/m²', icon: 'layers', category: 'piso' },
                { id: '6_4', name: 'Argamassa AC-III 20kg - Quartzolit', price: 29.90, icon: 'texture', category: 'piso' }
            ]
        },
        'vaso': {
            title: 'Vaso',
            icon: 'wc',
            products: [
                { id: '7', name: 'Vaso Sanitário com Caixa Acoplada - Deca', price: 289.90, icon: 'wc', category: 'vaso' },
                { id: '7_2', name: 'Vaso Sanitário Convencional - Celite', price: 159.00, icon: 'wc', category: 'vaso' },
                { id: '7_3', name: 'Assento Sanitário Almofadado', price: 45.00, icon: 'wc', category: 'vaso' }
            ]
        },
        'pia': {
            title: 'Pia',
            icon: 'countertops',
            products: [
                { id: '8', name: 'Pia de Granito Sintético 120cm', price: 399.00, icon: 'countertops', category: 'pia' },
                { id: '8_2', name: 'Pia Inox Dupla 150cm - Tramontina', price: 599.00, icon: 'countertops', category: 'pia' },
                { id: '8_3', name: 'Cuba de Cerâmica de Apoio Branca', price: 189.90, icon: 'countertops', category: 'pia' },
                { id: '8_4', name: 'Pia de Mármore Sintético 150cm', price: 449.00, icon: 'countertops', category: 'pia' }
            ]
        }
    };

    // Expor todos os produtos para o buscador preditivo e detalhes
    window.allProducts = Object.values(dataArr).flatMap(cat => cat.products.map(enrichProduct));
    window.productsById = Object.fromEntries(window.allProducts.map(p => [String(p.id), p]));
    window.getProductById = (id) => window.productsById[String(id)] || null;

    const toggleMobileFilters = (show) => {
        if (!mobileFiltersBar) return;
        mobileFiltersBar.classList.toggle('hidden', !show);
    };

    const getMobileFilteredProducts = (products) => {
        if (!Array.isArray(products)) return [];

        const selectedCategory = mobileFilterCategory ? mobileFilterCategory.value : 'all';
        const selectedSort = mobileFilterSort ? mobileFilterSort.value : 'relevance';

        let filtered = [...products];

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => String(p.category || '').toLowerCase() === selectedCategory);
        }

        if (selectedSort === 'price-asc') {
            filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        } else if (selectedSort === 'price-desc') {
            filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        } else if (selectedSort === 'name-asc') {
            filtered.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));
        }

        return filtered;
    };

    const renderProductsGrid = (products) => {
        if (!products.length) {
            catalogContainer.innerHTML = `
                <div class="text-center py-16 px-4 animate-[fadeIn_0.3s_ease-out]">
                    <div class="max-w-md mx-auto">
                        <span class="material-symbols-outlined text-6xl text-zinc-600 mb-4 block">filter_alt_off</span>
                        <h3 class="text-2xl font-bold text-white mb-2">Nenhum produto com esse filtro</h3>
                        <p class="text-zinc-400">Tente mudar categoria ou ordenação para ver mais opções.</p>
                    </div>
                </div>
            `;
            return;
        }

        let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 shrink-0 animate-[fadeIn_0.3s_ease-out]">';
        products.forEach(product => {
            html += generateProductCardHTML(product);
        });
        html += '</div>';
        catalogContainer.innerHTML = html;
    };

    window.applyCatalogMobileFilters = function () {
        if (currentCatalogMode === 'categories') return;
        const filtered = getMobileFilteredProducts(currentCatalogProducts);
        renderProductsGrid(filtered);
    };

    window.resetCatalogMobileFilters = function () {
        if (mobileFilterCategory) mobileFilterCategory.value = 'all';
        if (mobileFilterSort) mobileFilterSort.value = 'relevance';
        if (currentCatalogMode !== 'categories') {
            renderProductsGrid(currentCatalogProducts);
        }
    };

    window.renderCategories = function () {
        setCatalogBusy(true);
                                let html = '<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 shrink-0">';
        for (const [key, category] of Object.entries(dataArr)) {
            html += `
                                <div class="bg-zinc-900 rounded-custom overflow-hidden group border border-zinc-800 hover:border-brand-yellow transition-colors flex flex-col items-center justify-between shadow-lg cursor-pointer h-full" onclick="window.showCategory('${key}')">
                                                                        <div class="aspect-square bg-black flex items-center justify-center w-full py-3 sm:py-5 relative overflow-hidden">
                    <span class="material-symbols-outlined text-4xl sm:text-6xl text-brand-yellow opacity-60 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">${category.icon}</span>
                  </div>
                                                                        <div class="p-2.5 sm:p-4 text-center w-full flex-1 flex flex-col justify-center bg-zinc-950">
                                        <h4 class="font-bold uppercase text-[11px] sm:text-[15px] group-hover:text-brand-yellow transition-colors tracking-tight">${category.title}</h4>
                                                                                <p class="text-[10px] sm:text-[12px] text-zinc-400 mt-1 font-bold uppercase tracking-widest">${category.products.length} Opções</p>
                  </div>
                </div>
            `;
        }
        html += '</div>';
        catalogContainer.innerHTML = html;
        setCatalogBusy(false);
        currentCatalogMode = 'categories';
        currentCatalogProducts = [];
        toggleMobileFilters(false);
        if (mobileFilterCategory) mobileFilterCategory.value = 'all';
        if (mobileFilterSort) mobileFilterSort.value = 'relevance';
        document.getElementById('catalog-title').textContent = 'Explore Nossos Departamentos';
        document.getElementById('catalog-back-btn').classList.add('hidden');
    }

    window.showCategory = function (catKey) {
        const category = dataArr[catKey];
        if (!category) return;

        setCatalogBusy(true);

        document.getElementById('catalog-title').textContent = `Modelos e Marcas em ${category.title}`;
        document.getElementById('catalog-back-btn').classList.remove('hidden');
        currentCatalogMode = 'category';
        currentCatalogProducts = category.products.map(enrichProduct);
        toggleMobileFilters(true);
        if (mobileFilterCategory) mobileFilterCategory.value = catKey;
        if (mobileFilterSort) mobileFilterSort.value = 'relevance';

        renderProductsGrid(currentCatalogProducts);
        setCatalogBusy(false);

        const catalogSection = document.getElementById('produtos');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    window.openCategoryAndFocusProduct = function (catKey, productId, openDetails = false) {
        if (!catKey || !productId) return;

        window.showCategory(catKey);

        setTimeout(() => {
            const selector = `[data-product-id="${productId}"]`;
            const targetCard = catalogContainer.querySelector(selector);
            if (!targetCard) return;

            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.classList.add('ring-2', 'ring-brand-yellow', 'ring-offset-2', 'ring-offset-black', 'scale-[1.02]');

            setTimeout(() => {
                targetCard.classList.remove('ring-2', 'ring-brand-yellow', 'ring-offset-2', 'ring-offset-black', 'scale-[1.02]');
            }, 2200);

            if (openDetails && window.openProductDetails) {
                window.openProductDetails(productId);
            }
        }, 220);
    }

    function generateProductCardHTML(product) {
        const badge = getAvailabilityBadge(product);
        const priceFormatted = formatPrice(product.price);
        
        return `
            <article class="bg-zinc-900 rounded-custom overflow-hidden group border border-zinc-800 hover:border-brand-yellow transition-colors flex flex-col items-center justify-between shadow-lg relative h-full" 
                data-product-id="${product.id}" 
                data-product-name="${product.name}" 
                data-product-price="${product.price}" 
                data-product-brand="${product.brand}">
                
                <button class="add-to-wishlist-btn absolute top-3 right-3 z-10 text-zinc-600 hover:text-brand-yellow transition-colors cursor-pointer p-1.5 rounded-full hover:bg-black/40" 
                    onclick="window.toggleWishlist(event, '${product.id}')"
                    aria-label="Adicionar ${product.name} aos favoritos">
                    <span class="material-symbols-outlined text-xl">favorite</span>
                </button>

                <div class="aspect-[4/3] md:aspect-square bg-black flex items-center justify-center w-full relative p-3 sm:p-4 overflow-hidden">
                    <span class="material-symbols-outlined text-4xl sm:text-5xl text-brand-yellow opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125">${product.icon}</span>
                </div>

                <div class="p-3 sm:p-4 text-center flex flex-col h-full w-full bg-zinc-950">
                    <h4 class="product-card-title font-bold uppercase text-[12px] sm:text-[14px] mb-1.5 line-clamp-2 text-white min-h-[2.6rem] flex items-center justify-center leading-tight">${product.name}</h4>
                    <p class="product-card-brand text-[10px] sm:text-[11px] uppercase font-medium tracking-widest text-zinc-500 mb-2">${product.brand}</p>
                    
                    <div class="mb-3 flex items-center justify-center">
                        <span class="product-availability-badge product-availability-${badge.tone}">${badge.label}</span>
                    </div>

                    <div class="product-card-price text-white font-black text-lg sm:text-xl mb-4">${priceFormatted}${product.unit || ''}</div>
                    
                    <div class="grid grid-cols-1 gap-2 mt-auto">
                        <button type="button" onclick="window.openProductDetails('${product.id}')" 
                            class="w-full border border-zinc-800 text-zinc-400 py-2.5 rounded-custom font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                            <span class="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform">visibility</span> Detalhes
                        </button>
                        <button class="add-to-cart-btn-dynamic w-full bg-brand-yellow text-black py-2.5 rounded-custom font-black text-[10px] sm:text-xs uppercase tracking-wider hover:bg-yellow-500 transition-all flex items-center justify-center gap-1 shadow-lg shadow-brand-yellow/10">
                            <span class="material-symbols-outlined text-sm sm:text-base">add_shopping_cart</span> Comprar
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    const normalizeString = (str) => {
        return str.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
    };

    window.searchCatalog = function (term) {
        if (!term) {
            renderCategories();
            return;
        }

        setCatalogBusy(true);

        const searchTerm = normalizeString(term);
        let foundProducts = window.allProducts.filter(p =>
            normalizeString(p.name).includes(searchTerm) ||
            normalizeString(p.category || '').includes(searchTerm)
        );

        if (foundProducts.length > 0) {
            foundProducts = [...new Map(foundProducts.map(item => [item.id, item])).values()];
            document.getElementById('catalog-title').textContent = `Resultados para "${term}"`;
            document.getElementById('catalog-back-btn').classList.remove('hidden');
            currentCatalogMode = 'search';
            currentCatalogProducts = foundProducts;
            toggleMobileFilters(true);
            if (mobileFilterCategory) mobileFilterCategory.value = 'all';
            if (mobileFilterSort) mobileFilterSort.value = 'relevance';
            renderProductsGrid(currentCatalogProducts);
            setCatalogBusy(false);
        } else {
            renderEmptySearch(term);
        }
    }

    function renderEmptySearch(term) {
        document.getElementById('catalog-title').textContent = `Nenhum resultado para "${term}"`;
        document.getElementById('catalog-back-btn').classList.remove('hidden');
        catalogContainer.innerHTML = `
            <div class="text-center py-16 px-4 animate-[fadeIn_0.3s_ease-out]">
                <div class="max-w-md mx-auto">
                    <span class="material-symbols-outlined text-6xl text-zinc-600 mb-4 block">search_off</span>
                    <h3 class="text-2xl font-bold text-white mb-2">Poxa, não encontramos nada</h3>
                    <p class="text-zinc-400">Tente buscar por "pia", "cimento", "torneira"...</p>
                </div>
            </div>
        `;
        currentCatalogMode = 'search';
        currentCatalogProducts = [];
        toggleMobileFilters(true);
        setCatalogBusy(false);
    }

    window.backToCategories = () => renderCategories();
    renderCommercialShowcase();
    renderCategories();
});
