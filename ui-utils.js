/**
 * UI Utils - Centralização de utilitários de interface
 * Focado em modularização e reaproveitamento de código.
 */

const UI = {
    /**
     * Formata valores para moeda brasileira
     */
    formatPrice(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    },

    /**
     * Sistema de modal genérico com animações consistentes
     */
    modal: {
        open(modalId, panelId) {
            const modal = document.getElementById(modalId);
            const panel = panelId ? document.getElementById(panelId) : null;
            if (!modal) return;

            modal.classList.remove('hidden');
            if (modal.classList.contains('flex-col')) modal.classList.add('flex');
            
            document.body.style.overflow = 'hidden';
            void modal.offsetWidth; // Força reflow
            
            modal.classList.add('is-visible');
            if (panel) panel.classList.add('is-active');
            modal.setAttribute('aria-hidden', 'false');

            if (modalId === 'search-modal') {
                const input = modal.querySelector('input');
                if (input) setTimeout(() => input.focus(), 150);
            }
        },
        
        close(modalId, panelId) {
            const modal = document.getElementById(modalId);
            const panel = panelId ? document.getElementById(panelId) : null;
            if (!modal) return;

            modal.classList.remove('is-visible');
            if (panel) panel.classList.remove('is-active');
            modal.setAttribute('aria-hidden', 'true');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                if (document.querySelectorAll('.modal-overlay.is-visible').length === 0) {
                    document.body.style.overflow = '';
                }
            }, 300);
        }
    },

    toast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type} anim-toast-in`;
        const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
        toast.innerHTML = `<span class="material-symbols-outlined">${icons[type] || 'info'}</span><span class="toast-text">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.replace('anim-toast-in', 'anim-toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3500);
    }
};

// Expõe globalmente IMEDIATAMENTE
window.UI = UI;

// Atalhos Globais Prontos para Uso Imediato (Evita race conditions no HTML)
window.openSearchModal = () => UI.modal.open('search-modal', 'search-modal-panel');
window.closeSearchModal = () => UI.modal.close('search-modal', 'search-modal-panel');

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    if (!menu || !overlay) return;
    
    const isHidden = menu.classList.contains('translate-x-full');
    if (isHidden) {
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.add('opacity-100');
        menu.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.remove('opacity-100');
        menu.classList.add('translate-x-full');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        document.body.style.overflow = '';
    }
};
