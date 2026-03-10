document.addEventListener('DOMContentLoaded', () => {
    const catalogContainer = document.getElementById('dynamic-catalog');
    if (!catalogContainer) return;

    const dataArr = {
        'mangueira': {
            title: 'Mangueira',
            icon: 'line_curve',
            products: [
                { id: '1', name: 'Mangueira Flexível 15m - Tramontina', price: 89.90, icon: 'line_curve' },
                { id: '1_2', name: 'Mangueira Corrugada 30m - Tigre', price: 120.50, icon: 'line_curve' },
                { id: '1_3', name: 'Mangueira de Nível 10m', price: 35.00, icon: 'line_curve' }
            ]
        },
        'torneira': {
            title: 'Torneira',
            icon: 'faucet',
            products: [
                { id: '2', name: 'Torneira Cromada Inox - Deca', price: 129.50, icon: 'faucet' },
                { id: '2_2', name: 'Torneira Gourmet Flexível Preta - Docol', price: 259.90, icon: 'faucet' },
                { id: '2_3', name: 'Misturador Monocomando - Lorenzetti', price: 310.00, icon: 'faucet' }
            ]
        },
        'cimento': {
            title: 'Cimento',
            icon: 'texture',
            products: [
                { id: '3', name: 'Cimento Portland 50kg - Votorantim', price: 34.90, icon: 'texture' },
                { id: '3_2', name: 'Cimento CP II 50kg - CSN', price: 32.90, icon: 'texture' },
                { id: '3_3', name: 'Cimento Branco 1kg', price: 8.50, icon: 'texture' }
            ]
        },
        'lajota': {
            title: 'Lajota',
            icon: 'view_module',
            products: [
                { id: '4', name: 'Lajota Cerâmica 6 Furos', price: 2.50, unit: '/un', icon: 'view_module' },
                { id: '4_2', name: 'Lajota Cerâmica 8 Furos', price: 3.20, unit: '/un', icon: 'view_module' },
                { id: '4_3', name: 'Lajota de Isopor EPS', price: 4.50, unit: '/un', icon: 'view_module' }
            ]
        },
        'porta': {
            title: 'Porta',
            icon: 'sensor_door',
            products: [
                { id: '5', name: 'Porta de Madeira Reforçada 80x210', price: 349.00, icon: 'sensor_door' },
                { id: '5_2', name: 'Porta Sanfonada PVC Branca', price: 149.90, icon: 'sensor_door' },
                { id: '5_3', name: 'Porta de Alumínio com Vidro', price: 589.00, icon: 'sensor_door' }
            ]
        },
        'piso': {
            title: 'Piso',
            icon: 'layers',
            products: [
                { id: '6', name: 'Piso Porcelanato 60x60 - Portobello', price: 59.90, unit: '/m²', icon: 'layers' },
                { id: '6_2', name: 'Revestimento Retificado Acetinado 30x60', price: 45.90, unit: '/m²', icon: 'layers' },
                { id: '6_3', name: 'Piso Cerâmico Amadeirado', price: 39.90, unit: '/m²', icon: 'layers' },
                { id: '6_4', name: 'Argamassa AC-III 20kg - Quartzolit', price: 29.90, icon: 'texture' }
            ]
        },
        'vaso': {
            title: 'Vaso',
            icon: 'wc',
            products: [
                { id: '7', name: 'Vaso Sanitário com Caixa Acoplada - Deca', price: 289.90, icon: 'wc' },
                { id: '7_2', name: 'Vaso Sanitário Convencional - Celite', price: 159.00, icon: 'wc' },
                { id: '7_3', name: 'Assento Sanitário Almofadado', price: 45.00, icon: 'wc' }
            ]
        },
        'pia': {
            title: 'Pia',
            icon: 'countertops',
            products: [
                { id: '8', name: 'Pia de Granito Sintético 120cm', price: 399.00, icon: 'countertops' },
                { id: '8_2', name: 'Pia Inox Dupla 150cm - Tramontina', price: 599.00, icon: 'countertops' },
                { id: '8_3', name: 'Cuba de Cerâmica de Apoio Branca', price: 189.90, icon: 'countertops' },
                { id: '8_4', name: 'Pia de Mármore Sintético 150cm', price: 449.00, icon: 'countertops' }
            ]
        }
    };

    function renderCategories() {
        let html = '<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 shrink-0">';
        for (const [key, category] of Object.entries(dataArr)) {
            html += `
                <div class="bg-zinc-900 rounded-custom overflow-hidden group border border-zinc-800 hover:border-brand-yellow transition-colors flex flex-col items-center justify-between shadow-lg cursor-pointer" onclick="window.showCategory('${key}')">
                  <div class="aspect-video sm:aspect-square bg-black flex items-center justify-center w-full py-5 relative overflow-hidden">
                    <span class="material-symbols-outlined text-4xl sm:text-5xl text-brand-yellow opacity-60 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">${category.icon}</span>
                  </div>
                  <div class="p-3 py-4 text-center w-full flex-1 flex flex-col justify-center bg-zinc-950">
                    <h4 class="font-bold uppercase text-[11px] sm:text-[13px] group-hover:text-brand-yellow transition-colors">${category.title}</h4>
                    <p class="text-[10px] text-zinc-500 mt-1 font-medium">${category.products.length} Opções</p>
                  </div>
                </div>
            `;
        }
        html += '</div>';
        catalogContainer.innerHTML = html;
        document.getElementById('catalog-title').textContent = 'Explore Nossos Departamentos';
        document.getElementById('catalog-back-btn').classList.add('hidden');
    }

    window.showCategory = function (catKey) {
        const category = dataArr[catKey];
        if (!category) return;

        document.getElementById('catalog-title').textContent = `Modelos e Marcas em ${category.title}`;
        document.getElementById('catalog-back-btn').classList.remove('hidden');

        let html = '<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 shrink-0 animate-[fadeIn_0.3s_ease-out]">';
        category.products.forEach(product => {
            html += generateProductCardHTML(product);
        });
        html += '</div>';
        catalogContainer.innerHTML = html;

        const catalogSection = document.getElementById('produtos');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function generateProductCardHTML(product) {
        return `
            <div class="bg-zinc-900 rounded-custom overflow-hidden group border border-zinc-800 hover:border-brand-yellow transition-colors flex flex-col items-center justify-between shadow-lg" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">
                <div class="aspect-square bg-black flex items-center justify-center w-full relative p-4">
                  <span class="material-symbols-outlined text-4xl sm:text-5xl text-brand-yellow opacity-60 group-hover:opacity-100 transition-transform duration-300 group-hover:scale-110">${product.icon}</span>
                </div>
                <div class="p-4 text-center flex flex-col h-full w-full bg-zinc-950">
                  <h4 class="font-bold uppercase text-[11px] sm:text-xs mb-2 line-clamp-2 text-white h-8 sm:h-8 flex items-center justify-center">${product.name}</h4>
                  <div class="text-brand-yellow font-bold text-sm sm:text-base mb-3 opacity-100">R$ ${product.price.toFixed(2).replace('.', ',')}${product.unit || ''}</div>
                  <button class="add-to-cart-btn-dynamic mt-auto w-full bg-brand-yellow text-black py-2 rounded-custom font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1">
                      <span class="material-symbols-outlined text-xs sm:text-sm">add_shopping_cart</span> Comprar
                  </button>
                </div>
            </div>
        `;
    }

    // Normalização para ignorar acentos e transformar tudo em minúsculas
    const normalizeString = (str) => {
        return str.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
    };

    window.searchCatalog = function (term) {
        if (!term) {
            renderCategories();
            return;
        }

        const searchTerm = normalizeString(term);
        let foundProducts = [];

        for (const [key, category] of Object.entries(dataArr)) {
            const catName = normalizeString(category.title);

            category.products.forEach(product => {
                const prodName = normalizeString(product.name);
                // Dá match se tiver na categoria ou no nome
                if (catName.includes(searchTerm) || prodName.includes(searchTerm)) {
                    foundProducts.push(product);
                }
            });
        }

        if (foundProducts.length > 0) {
            // Remove duplicatas
            foundProducts = [...new Map(foundProducts.map(item => [item.id, item])).values()];

            document.getElementById('catalog-title').textContent = `Resultados para "${term}"`;
            document.getElementById('catalog-back-btn').classList.remove('hidden');

            let html = '<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 shrink-0 animate-[fadeIn_0.3s_ease-out]">';
            foundProducts.forEach(product => {
                html += generateProductCardHTML(product);
            });
            html += '</div>';
            catalogContainer.innerHTML = html;
        } else {
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
        }
    }

    window.backToCategories = () => {
        const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Buscar"]');
        searchInputs.forEach(input => input.value = '');
        renderCategories();
    };

    catalogContainer.innerHTML = '';

    // Default initializiation
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Buscar"]');
    if (searchInputs.length > 0 && searchInputs[0].value) {
        window.searchCatalog(searchInputs[0].value);
    } else {
        renderCategories();
    }
});
