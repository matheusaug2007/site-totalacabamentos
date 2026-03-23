document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a estrutura da wishlist no localStorage
    // Estrutura: { folders: [{ id, name, items: [productObj] }] }
    if (!localStorage.getItem('totalAcabamentosWishlist')) {
        localStorage.setItem('totalAcabamentosWishlist', JSON.stringify({ folders: [{ id: 'default', name: 'Lista Geral', items: [] }] }));
    }

    const wishlistBtn = document.getElementById('show-wishlist-btn');
    const wishlistSection = document.getElementById('wishlist-section');
    const profileViewHeader = document.querySelector('#profile-view > div:first-child');
    const foldersContainer = document.getElementById('folders-container');
    const folderDetailsView = document.getElementById('folder-details-view');
    const folderItemsList = document.getElementById('folder-items-list');
    const currentFolderTitle = document.getElementById('current-folder-title');

    let currentFolderId = null;

    function getWishlist() {
        return JSON.parse(localStorage.getItem('totalAcabamentosWishlist'));
    }

    function saveWishlist(data) {
        localStorage.setItem('totalAcabamentosWishlist', JSON.stringify(data));
        renderFolders();
    }

    window.toggleWishlist = function(event, productId) {
        event.stopPropagation();
        const wishlist = getWishlist();
        const allProducts = window.allProducts || [];
        const product = allProducts.find(p => p.id === productId);

        if (!product) return;

        // Se o usuário já tiver pastas, abrimos um mini-modal ou simplesmente adicionamos à primeira pasta
        // Para simplificar e atender ao pedido de "criar pastas", vamos adicionar à pasta 'default' se não houver escolha
        // E dar um feedback visual.
        
        const defaultFolder = wishlist.folders[0];
        const existingIndex = defaultFolder.items.findIndex(item => item.id === productId);

        if (existingIndex > -1) {
            defaultFolder.items.splice(existingIndex, 1);
            showToast('Removido dos favoritos');
        } else {
            defaultFolder.items.push(product);
            showToast('Adicionado à Lista Geral');
        }

        saveWishlist(wishlist);
        updateWishlistIcons();
    };

    function updateWishlistIcons() {
        const wishlist = getWishlist();
        const allLikedIds = wishlist.folders.flatMap(f => f.items.map(i => i.id));
        
        document.querySelectorAll('.add-to-wishlist-btn').forEach(btn => {
            const productCard = btn.closest('[data-product-id]');
            if (productCard) {
                const id = productCard.getAttribute('data-product-id');
                const icon = btn.querySelector('.material-symbols-outlined');
                if (allLikedIds.includes(id)) {
                    icon.style.fontVariationSettings = "'FILL' 1";
                    btn.classList.add('text-brand-yellow');
                    btn.classList.remove('text-zinc-600');
                } else {
                    icon.style.fontVariationSettings = "'FILL' 0";
                    btn.classList.remove('text-brand-yellow');
                    btn.classList.add('text-zinc-600');
                }
            }
        });
    }

    window.renderFolders = function() {
        const wishlist = getWishlist();
        foldersContainer.innerHTML = '';

        wishlist.folders.forEach(folder => {
            const folderEl = document.createElement('div');
            folderEl.className = 'bg-zinc-800/50 border border-zinc-700 p-5 rounded-custom hover:border-brand-yellow transition-all cursor-pointer group';
            folderEl.onclick = () => openFolder(folder.id);
            folderEl.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-brand-yellow">
                        <span class="material-symbols-outlined text-2xl">${folder.id === 'default' ? 'star' : 'folder'}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-white uppercase tracking-tight">${folder.name}</h4>
                        <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">${folder.items.length} itens salvos</p>
                    </div>
                    <span class="material-symbols-outlined text-zinc-600 group-hover:text-white transition-colors">chevron_right</span>
                </div>
            `;
            foldersContainer.appendChild(folderEl);
        });
    }

    window.createNewFolder = function() {
        const name = prompt('Nome do ambiente (ex: Cozinha, Banheiro):');
        if (!name) return;

        const wishlist = getWishlist();
        const newFolder = {
            id: 'folder_' + Date.now(),
            name: name,
            items: []
        };
        wishlist.folders.push(newFolder);
        saveWishlist(wishlist);
    };

    function openFolder(folderId) {
        currentFolderId = folderId;
        const wishlist = getWishlist();
        const folder = wishlist.folders.find(f => f.id === folderId);
        
        currentFolderTitle.textContent = folder.name;
        renderFolderItems(folder);

        wishlistSection.classList.add('hidden');
        folderDetailsView.classList.remove('hidden');
    }

    window.backToFolders = function() {
        folderDetailsView.classList.add('hidden');
        wishlistSection.classList.remove('hidden');
    }

    function renderFolderItems(folder) {
        folderItemsList.innerHTML = '';
        if (folder.items.length === 0) {
            folderItemsList.innerHTML = '<p class="text-zinc-500 text-center py-10 text-xs uppercase font-bold tracking-widest">Nenhum item neste ambiente</p>';
            return;
        }

        folder.items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex items-center gap-4 bg-black border border-zinc-800 p-3 rounded-lg group';
            itemEl.innerHTML = `
                <div class="w-12 h-12 bg-zinc-900 rounded flex items-center justify-center text-brand-yellow text-xl">
                    <span class="material-symbols-outlined">${item.icon}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h5 class="text-xs font-bold text-white truncate">${item.name}</h5>
                    <p class="text-brand-yellow text-[10px] font-bold">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button onclick="window.moveToFolder(event, '${item.id}')" class="text-zinc-600 hover:text-white" title="Mover para outro ambiente">
                    <span class="material-symbols-outlined text-lg">move_item</span>
                </button>
                <button onclick="window.removeItemFromFolder(event, '${item.id}')" class="text-zinc-600 hover:text-red-500">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            `;
            folderItemsList.appendChild(itemEl);
        });
    }

    window.removeItemFromFolder = function(event, productId) {
        event.stopPropagation();
        const wishlist = getWishlist();
        const folder = wishlist.folders.find(f => f.id === currentFolderId);
        folder.items = folder.items.filter(i => i.id !== productId);
        saveWishlist(wishlist);
        renderFolderItems(folder);
        updateWishlistIcons();
    }

    window.deleteCurrentFolder = function() {
        if (currentFolderId === 'default') {
            alert('A Lista Geral não pode ser excluída.');
            return;
        }
        if (!confirm('Deseja excluir este ambiente e todos os itens salvos nele?')) return;

        const wishlist = getWishlist();
        wishlist.folders = wishlist.folders.filter(f => f.id !== currentFolderId);
        saveWishlist(wishlist);
        backToFolders();
    }

    window.moveToFolder = function(event, productId) {
        event.stopPropagation();
        const wishlist = getWishlist();
        const folders = wishlist.folders;
        
        let folderList = folders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
        const choice = prompt(`Mover para qual ambiente?\n${folderList}`);
        
        if (!choice) return;
        const idx = parseInt(choice) - 1;
        
        if (folders[idx]) {
            const sourceFolder = folders.find(f => f.id === currentFolderId);
            const targetFolder = folders[idx];
            
            const itemIndex = sourceFolder.items.findIndex(i => i.id === productId);
            const item = sourceFolder.items[itemIndex];
            
            if (targetFolder.items.find(i => i.id === productId)) {
                alert('Item já existe no ambiente de destino.');
                return;
            }

            targetFolder.items.push(item);
            sourceFolder.items.splice(itemIndex, 1);
            
            saveWishlist(wishlist);
            renderFolderItems(sourceFolder);
            showToast(`Movido para ${targetFolder.name}`);
        }
    }

    window.openWishlistFromMenu = function() {
        if (window.openLoginModal) {
            window.openLoginModal(true); // Abre o modal de perfil
            
            // Força a exibição da seção de wishlist caso ela tenha sido escondida
            if (wishlistSection) wishlistSection.classList.remove('hidden');
            if (folderDetailsView) folderDetailsView.classList.add('hidden');
            
            // Se houver abas no perfil, garante que estamos na "info" ou na aba correta
            if (window.switchProfileTab) window.switchProfileTab('info');
        }
    };

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-yellow text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl z-[300] animate-bounce';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // Inicialização
    renderFolders();
    
    // Observer para quando o catálogo renderizar itens
    const observer = new MutationObserver(() => updateWishlistIcons());
    const catalogRoot = document.getElementById('dynamic-catalog') || document.getElementById('catalog-content');
    if (catalogRoot) {
        observer.observe(catalogRoot, { childList: true, subtree: true });
    }
});
