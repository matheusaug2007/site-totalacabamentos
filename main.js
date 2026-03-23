/**
 * Main Entry Point - Total Acabamentos
 * Orquestração de módulos e inicialização global.
 */

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Total Acabamentos v3.0 - Modular Engine Active');
    
    // Inicializar sub-sistemas
    initGlobalEvents();
});

/**
 * Eventos que não dependem de módulos específicos
 */
function initGlobalEvents() {
    // Esc para fechar qualquer modal aberto
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay.is-visible');
            if (openModal) {
                const panel = openModal.querySelector('.modal-panel');
                // Usa o objeto UI global definido em ui-utils.js
                if (window.UI) {
                    window.UI.modal.close(openModal.id, panel ? panel.id : null);
                }
            }
        }
    });

    // Ripple global removido por decisão de UX.
}

/**
 * Cria um efeito de onda (ripple) luxuoso em cliques
 */
function createRipple(event) {
    return;
}
