/**
 * search.js - Funcionalidade de Busca Predictiva e Responsiva
 * Total Acabamentos
 */

// ─── SEARCH MODAL (novo, premium) ─────────────────────────────────────────
function syncSearchModalA11y(isOpen) {
    const toggle = document.getElementById('header-search-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

const normalizeSearchString = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getSearchModalState = () => {
    if (!window.searchModalState) {
        window.searchModalState = {
            term: '',
            category: 'all',
            brand: 'all',
            price: 'all'
        };
    }
    return window.searchModalState;
};

const getPriceRange = (priceFilter) => {
    if (priceFilter === '0-50') return { min: 0, max: 50 };
    if (priceFilter === '50-150') return { min: 50, max: 150 };
    if (priceFilter === '150-300') return { min: 150, max: 300 };
    if (priceFilter === '300+') return { min: 300, max: Infinity };
    return { min: 0, max: Infinity };
};

const populateSearchCategoryOptions = () => {
    const select = document.getElementById('search-filter-category');
    if (!select) return;

    const state = getSearchModalState();
    const products = window.allProducts || [];
    const categories = [...new Set(products.map(p => String(p.category || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const options = ['<option value="all">Categorias</option>'];
    categories.forEach(cat => {
        const label = cat.charAt(0).toUpperCase() + cat.slice(1);
        options.push(`<option value="${cat}">${label}</option>`);
    });

    select.innerHTML = options.join('');
    select.value = state.category || 'all';
};

const populateSearchBrandOptions = () => {
    const select = document.getElementById('search-filter-brand');
    if (!select) return;

    const state = getSearchModalState();
    const products = window.allProducts || [];
    const brands = [...new Set(products.map(p => String(p.brand || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const options = ['<option value="all">Marcas</option>'];
    brands.forEach(brand => {
        options.push(`<option value="${brand}">${brand}</option>`);
    });

    select.innerHTML = options.join('');
    select.value = state.brand || 'all';
};

const syncSearchFilterControls = () => {
    const state = getSearchModalState();
    const category = document.getElementById('search-filter-category');
    const brand = document.getElementById('search-filter-brand');
    const price = document.getElementById('search-filter-price');
    const input = document.getElementById('search-modal-input');

    if (category) category.value = state.category || 'all';
    if (brand) brand.value = state.brand || 'all';
    if (price) price.value = state.price || 'all';
    if (input && input.value !== (state.term || '')) input.value = state.term || '';
};

window.applySearchModalCategoryFilter = function (value) {
    const state = getSearchModalState();
    state.category = value || 'all';
    syncSearchFilterControls();
    window.searchModalFilter();
};

window.applySearchModalBrandFilter = function (value) {
    const state = getSearchModalState();
    state.brand = value || 'all';
    syncSearchFilterControls();
    window.searchModalFilter();
};

window.applySearchModalPriceFilter = function (value) {
    const state = getSearchModalState();
    state.price = value || 'all';
    syncSearchFilterControls();
    window.searchModalFilter();
};

window.clearSearchModalFilters = function () {
    const state = getSearchModalState();
    state.category = 'all';
    state.brand = 'all';
    state.price = 'all';
    syncSearchFilterControls();
    window.searchModalFilter(state.term || '');
};

window.openSearchModal = function () {
    if (window.UI && window.UI.modal) {
        window.UI.modal.open('search-modal', 'search-modal-panel');
        syncSearchModalA11y(true);

        populateSearchCategoryOptions();
        populateSearchBrandOptions();
        syncSearchFilterControls();

        const input = document.getElementById('search-modal-input');
        if (input) {
            setTimeout(() => input.focus(), 80);
        }
    }
};

window.closeSearchModal = function () {
    if (window.UI && window.UI.modal) {
        window.UI.modal.close('search-modal', 'search-modal-panel');
        syncSearchModalA11y(false);
        
        // Reset results after animation
        setTimeout(() => {
            const results = document.getElementById('search-modal-results');
            if (results) results.innerHTML = `
                <div class="p-8 text-center">
                  <span class="material-symbols-outlined text-zinc-700 mb-3 block" style="font-size:3rem;">inventory_2</span>
                  <p class="text-zinc-500 text-sm">Digite o nome de um produto ou categoria para buscar</p>
                  <p class="text-zinc-600 text-xs mt-1">Ex: "piso", "torneira", "revestimento"</p>
                </div>`;
        }, 350);
    }
};

window.searchModalFilter = function (term) {
    const state = getSearchModalState();
    if (typeof term === 'string') {
        state.term = term;
    }

    const rawTerm = String(state.term || '').trim();
    const results = document.getElementById('search-modal-results');
    if (!results) return;

    results.setAttribute('aria-busy', 'true');

    const hasFilters = state.category !== 'all' || state.brand !== 'all' || state.price !== 'all';

    if (!rawTerm && !hasFilters) {
        results.innerHTML = `
            <div class="p-8 text-center">
              <span class="material-symbols-outlined text-zinc-700 mb-3 block" style="font-size:3rem;">inventory_2</span>
              <p class="text-zinc-500 text-sm">Digite o nome de um produto ou categoria para buscar</p>
              <p class="text-zinc-600 text-xs mt-1">Ex: "piso", "torneira", "revestimento"</p>
            </div>`;
        results.setAttribute('aria-busy', 'false');
        return;
    }

    const n = normalizeSearchString(rawTerm);
    const products = window.allProducts || [];
    const priceRange = getPriceRange(state.price);

    const filtered = products.filter(p =>
        (!rawTerm || normalizeSearchString(p.name).includes(n) || normalizeSearchString(p.category || '').includes(n))
        && (state.category === 'all' || String(p.category || '').toLowerCase() === state.category)
        && (state.brand === 'all' || String(p.brand || '') === state.brand)
        && Number(p.price || 0) >= priceRange.min
        && Number(p.price || 0) <= priceRange.max
    ).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')).slice(0, 8);

    if (filtered.length === 0) {
        const contextText = rawTerm ? ` para "${rawTerm}"` : '';
        results.innerHTML = `
            <div class="p-10 text-center">
              <span class="material-symbols-outlined text-zinc-700 mb-3 block" style="font-size:3rem;">search_off</span>
              <p class="text-zinc-400 text-sm font-medium">Nenhum resultado${contextText}</p>
              <p class="text-zinc-600 text-xs mt-1">Tente mudar o termo ou ajustar os filtros</p>
            </div>`;
        results.setAttribute('aria-busy', 'false');
        return;
    }

    const formatPrice = (v) => window.UI ? window.UI.formatPrice(v) : `R$ ${v.toFixed(2).replace('.', ',')}`;

    const activeFilters = [];
    if (state.category !== 'all') activeFilters.push(`Categoria: ${state.category}`);
    if (state.brand !== 'all') activeFilters.push(`Marca: ${state.brand}`);
    if (state.price !== 'all') {
        const labels = {
            '0-50': 'Preco ate R$ 50',
            '50-150': 'Preco de R$ 50 a R$ 150',
            '150-300': 'Preco de R$ 150 a R$ 300',
            '300+': 'Preco acima de R$ 300'
        };
        activeFilters.push(labels[state.price] || 'Faixa de preco');
    }

    let html = `<div class="px-4 pt-3 pb-1 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">${filtered.length} produto(s) encontrado(s)</div>`;
    if (activeFilters.length) {
        html += `<div class="px-4 pb-2 text-[10px] text-zinc-500">Filtros: ${activeFilters.join(' | ')}</div>`;
    }
    filtered.forEach(p => {
        html += `
        <div class="flex items-center gap-4 px-4 py-3 hover:bg-zinc-900 transition-colors cursor-pointer group border-b border-zinc-900 last:border-0"
             onclick="if(window.openCategoryAndFocusProduct){window.openCategoryAndFocusProduct('${p.category || ''}','${p.id}',true);} window.closeSearchModal(); document.getElementById('produtos').scrollIntoView({behavior:'smooth'});">
          <div class="w-12 h-12 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-brand-yellow shrink-0 group-hover:border-brand-yellow/40 transition-colors">
            <span class="material-symbols-outlined text-2xl">${p.icon || 'inventory_2'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-semibold truncate group-hover:text-brand-yellow transition-colors">${p.name}</p>
            <p class="text-zinc-500 text-xs mt-0.5 truncate">${p.category || ''}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-brand-yellow font-black text-sm">${formatPrice(p.price)}</p>
            <span class="material-symbols-outlined text-zinc-600 group-hover:text-white text-sm transition-colors">arrow_outward</span>
          </div>
        </div>`;
    });

    html += `
    <div class="px-4 py-3 text-center bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer"
                 onclick="if(window.searchCatalog)window.searchCatalog('${rawTerm}'); window.closeSearchModal(); setTimeout(()=>document.getElementById('produtos').scrollIntoView({behavior:'smooth'}),350);">
            <span class="text-[11px] uppercase font-bold text-brand-yellow">Ver todos os resultados${rawTerm ? ` para "${rawTerm}"` : ''}</span>
    </div>`;

    results.innerHTML = html;
    results.setAttribute('aria-busy', 'false');
};

// ─── End Search Modal ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Buscar"]');
    if (searchInputs.length === 0) return;

    const setHeaderSearchExpanded = (expanded) => {
        const wrap = document.getElementById('header-search-wrap');
        if (!wrap || wrap.classList.contains('max-h-0')) return;

        wrap.classList.remove('max-h-[120px]', 'max-h-[520px]');
        wrap.classList.add(expanded ? 'max-h-[520px]' : 'max-h-[120px]');
    };

    const normalizeString = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    let searchTimeout;

    searchInputs.forEach(searchInput => {
        const resultsDiv = createSearchResultsContainer(searchInput);
        const isHeaderSearch = searchInput.id === 'header-search-input';

        searchInput.addEventListener('input', function (e) {
            clearTimeout(searchTimeout);
            const searchTerm = e.target.value.trim();

            if (!searchTerm) {
                resultsDiv.classList.add('hidden');
                if (isHeaderSearch) setHeaderSearchExpanded(false);
                return;
            }

            searchTimeout = setTimeout(() => {
                const normalizedTerm = normalizeString(searchTerm);
                const products = window.allProducts || [];
                const filtered = products.filter(p =>
                    normalizeString(p.name).includes(normalizedTerm) ||
                    normalizeString(p.category || '').includes(normalizedTerm)
                ).slice(0, 8);

                renderSearchResults(filtered, resultsDiv, searchTerm);
            }, 200);
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
                resultsDiv.classList.add('hidden');
                if (isHeaderSearch) setHeaderSearchExpanded(false);
            }
        });

        // Abrir ao focar se tiver texto
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                resultsDiv.classList.remove('hidden');
                if (isHeaderSearch) setHeaderSearchExpanded(true);
            }
        });
    });

    const createSearchResultsContainer = (input) => {
        if (input.id === 'header-search-input') {
            let headerResults = document.getElementById('header-search-results');
            if (!headerResults) {
                headerResults = document.createElement('div');
                headerResults.id = 'header-search-results';
                headerResults.className = 'search-results-dropdown hidden mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-custom shadow-2xl z-[150] max-h-[360px] overflow-y-auto custom-scrollbar animate-[fadeIn_0.2s_ease-out]';
                input.parentElement.insertAdjacentElement('afterend', headerResults);
            }
            return headerResults;
        }

        let resultsDiv = input.parentElement.querySelector('.search-results-dropdown');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.className = 'search-results-dropdown absolute top-full left-0 w-full bg-zinc-900 border border-zinc-800 rounded-b-custom shadow-2xl z-[150] hidden max-h-[400px] overflow-y-auto custom-scrollbar animate-[fadeIn_0.2s_ease-out]';
            input.parentElement.appendChild(resultsDiv);
        }
        return resultsDiv;
    };

    function renderSearchResults(products, container, term) {
        if (products.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-zinc-500 text-sm italic">
                    Nenhum produto encontrado para "${term}"
                </div>
            `;
        } else {
            const formatPrice = (v) => window.UI ? window.UI.formatPrice(v) : `R$ ${v.toFixed(2).replace('.', ',')}`;
            let html = '<div class="p-2 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-4 py-2">Produtos Sugeridos</div>';
            products.forEach(p => {
                html += `
                    <div class="flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors cursor-pointer group border-b border-zinc-800 last:border-0" onclick="window.openProductFromSearch('${p.id}', '${p.category || ''}')">
                        <div class="w-10 h-10 bg-black rounded flex items-center justify-center text-brand-yellow shrink-0">
                            <span class="material-symbols-outlined text-xl">${p.icon}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white text-xs font-bold truncate group-hover:text-brand-yellow">${p.name}</p>
                            <p class="text-brand-yellow text-[10px] font-bold">${formatPrice(p.price)}</p>
                        </div>
                        <span class="material-symbols-outlined text-zinc-600 group-hover:text-white text-sm">arrow_outward</span>
                    </div>
                `;
            });
            html += `
                <div class="p-3 text-center bg-zinc-950 hover:bg-black transition-colors cursor-pointer" onclick="window.searchCatalog('${term}'); document.getElementById('produtos').scrollIntoView({behavior:'smooth'});">
                    <span class="text-[10px] uppercase font-bold text-brand-yellow underline">Ver todos os resultados</span>
                </div>
            `;
            container.innerHTML = html;
        }
        container.classList.remove('hidden');

        if (container.id === 'header-search-results') {
            setHeaderSearchExpanded(true);
        }
    }

    window.goToProductFromSearch = function (term) {
        const rawTerm = String(term || '').trim();
        if (!rawTerm) {
            if (window.searchCatalog) window.searchCatalog('');
            return;
        }

        const normalizedTerm = normalizeString(rawTerm);
        const products = window.allProducts || [];

        const exactNameMatch = products.find(p => normalizeString(p.name) === normalizedTerm);
        const partialNameMatch = products.find(p => normalizeString(p.name).includes(normalizedTerm));
        const categoryMatch = products.find(p => normalizeString(p.category || '').includes(normalizedTerm));
        const firstMatch = exactNameMatch || partialNameMatch || categoryMatch;

        if (firstMatch && window.openCategoryAndFocusProduct) {
            window.openCategoryAndFocusProduct(firstMatch.category, firstMatch.id, true);

            document.querySelectorAll('.search-results-dropdown').forEach(d => d.classList.add('hidden'));
            setHeaderSearchExpanded(false);

            if (window.toggleHeaderSearch) {
                window.toggleHeaderSearch(true, false);
            }
            return;
        }

        if (window.searchCatalog) {
            window.searchCatalog(rawTerm);
            const catalogSection = document.getElementById('produtos');
            if (catalogSection) {
                catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    window.openProductFromSearch = function (productId, category) {
        if (window.openCategoryAndFocusProduct && category && productId) {
            window.openCategoryAndFocusProduct(category, productId, true);
        } else if (window.searchCatalog) {
            window.searchCatalog('');
            const catalogSection = document.getElementById('produtos');
            if (catalogSection) {
                catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        document.querySelectorAll('.search-results-dropdown').forEach(d => d.classList.add('hidden'));
        setHeaderSearchExpanded(false);

        if (window.toggleHeaderSearch) {
            window.toggleHeaderSearch(true, false);
        }
    };
});
