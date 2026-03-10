// Funcionalidade de Busca e Interação - Total Acabamentos
document.addEventListener('DOMContentLoaded', function () {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Buscar"]');

    if (searchInputs.length === 0) return;

    let searchTimeout;

    searchInputs.forEach(searchInput => {
        searchInput.addEventListener('input', function (e) {
            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.trim();

                // Sincronizar os outros inputs
                searchInputs.forEach(input => {
                    if (input !== searchInput) input.value = searchTerm;
                });

                if (window.searchCatalog) {
                    window.searchCatalog(searchTerm);
                    const catalogSection = document.getElementById('produtos');
                    if (searchTerm && catalogSection) {
                        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 300);
        });

        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = e.target.value.trim();

                searchInputs.forEach(input => {
                    if (input !== searchInput) input.value = searchTerm;
                });

                if (window.searchCatalog) {
                    window.searchCatalog(searchTerm);
                    const catalogSection = document.getElementById('produtos');
                    if (searchTerm && catalogSection) {
                        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });

        const searchButton = searchInput.parentElement.querySelector('button');
        if (searchButton) {
            searchButton.style.cursor = 'pointer';
            searchButton.addEventListener('click', function (e) {
                e.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (window.searchCatalog) {
                    window.searchCatalog(searchTerm);
                    const catalogSection = document.getElementById('produtos');
                    if (searchTerm && catalogSection) {
                        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }
    });

    // Configura o botão do menu móvel (caso clique fora feche o menu)
    document.addEventListener('click', function (e) {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.querySelector('.md\\\\:hidden button.text-brand-yellow');

        if (mobileMenu && !mobileMenu.classList.contains('hidden') && mobileMenuBtn) {
            // Se não clicou no menu móvel ou no botão
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        }
    });

    // Injetar estilo básico de animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        html { scroll-behavior: smooth; }
    `;
    document.head.appendChild(style);
});
