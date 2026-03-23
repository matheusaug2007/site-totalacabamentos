/**
 * UI Core - Lógica central de interface e estados do usuário
 * Total Acabamentos
 */

let isInitialLogin = true;
let isUserAuthenticated = false;

const USERS_KEY = 'totalAcabamentosUsers';
const AUTH_KEY = 'totalAcabamentosAuth';

function getUsers() {
	const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
	if (!Array.isArray(parsed)) return [];
	return parsed;
}

function saveUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function ensureSeedUser() {
	const users = getUsers();
	if (users.length > 0) return;

	users.push({
		name: 'Cliente Total',
		email: 'cliente@totalacabamentos.com.br',
		phone: '(44) 99999-9999',
		address: 'Mandaguari - PR',
		password: '123456'
	});
	saveUsers(users);
}

function setAuthSession(user, remember) {
	const payload = {
		email: user.email,
		name: user.name || 'Cliente'
	};

	if (remember) {
		localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
		sessionStorage.removeItem(AUTH_KEY);
	} else {
		sessionStorage.removeItem(AUTH_KEY);
		localStorage.removeItem(AUTH_KEY);
	}
}

function getAuthSession() {
	const fromLocal = localStorage.getItem(AUTH_KEY);
	const raw = fromLocal;
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function clearAuthSession() {
	sessionStorage.removeItem(AUTH_KEY);
	localStorage.removeItem(AUTH_KEY);
}

function revealMainContent() {
	const gate = document.getElementById('initial-login-gate');
	const mainContent = document.getElementById('main-content');
	const pageBody = document.getElementById('page-body');

	if (gate) {
		gate.style.transition = 'opacity 0.4s ease';
		gate.style.opacity = '0';
		gate.style.pointerEvents = 'none';
		setTimeout(() => gate.classList.add('hidden'), 450);
	}

	if (mainContent) {
		mainContent.classList.remove('opacity-0', 'blur-lg', 'h-screen', 'overflow-hidden', 'pointer-events-none');
		mainContent.classList.add('opacity-100', 'blur-none');
	}

	if (pageBody) pageBody.classList.remove('overflow-hidden');
}

function getTimeGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) return 'Bom dia';
	if (hour < 18) return 'Boa tarde';
	return 'Boa noite';
}

function getFirstName(name) {
	const fullName = String(name || '').trim();
	if (!fullName) return 'Cliente';
	return fullName.split(/\s+/)[0];
}

function removeWelcomeSplash() {
	const splash = document.getElementById('welcome-splash');
	if (!splash) return;

	splash.style.opacity = '0';
	setTimeout(() => splash.remove(), 350);
}

function showWelcomeSplash(userName) {
	removeWelcomeSplash();

	const splash = document.createElement('div');
	splash.id = 'welcome-splash';
	splash.className = 'fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300';
	splash.setAttribute('aria-hidden', 'true');

	const firstName = getFirstName(userName);
	const greeting = getTimeGreeting();

	splash.innerHTML = `
		<div class="splash-bg-circle-1"></div>
		<div class="splash-bg-circle-2"></div>
		<div class="relative z-10 flex flex-col items-center text-center px-6">
			<img src="imagens/logo.png" alt="Total Acabamentos" class="splash-logo h-20 w-auto object-contain" loading="eager" decoding="async" />
			<p class="splash-greeting">${greeting},</p>
			<p class="splash-name"><span>${firstName}</span></p>
			<p class="splash-sub">Bem-vindo a Total Acabamentos</p>
			<div class="splash-bar-wrap"><div class="splash-bar"></div></div>
		</div>
	`;

	document.body.appendChild(splash);
	setTimeout(removeWelcomeSplash, 2200);
}

function showInitialGate() {
	const gate = document.getElementById('initial-login-gate');
	const mainContent = document.getElementById('main-content');
	const pageBody = document.getElementById('page-body');

	if (gate) {
		gate.classList.remove('hidden');
		gate.style.opacity = '1';
		gate.style.pointerEvents = 'auto';
	}

	if (mainContent) {
		mainContent.classList.remove('opacity-100', 'blur-none');
		mainContent.classList.add('opacity-0', 'blur-lg', 'h-screen', 'overflow-hidden', 'pointer-events-none');
	}

	if (pageBody) pageBody.classList.add('overflow-hidden');
}

function normalizeEmail(email) {
	return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function openModal(modalId, panelId) {
	if (window.UI && window.UI.modal) {
		window.UI.modal.open(modalId, panelId);
	}
}

function closeModal(modalId, panelId) {
	if (window.UI && window.UI.modal) {
		window.UI.modal.close(modalId, panelId);
	}
}

// ─── Toast Notifications ───────────────────────────────────────────────
window.showToast = function (message, type = 'info') {
	if (window.UI && window.UI.toast) {
		window.UI.toast(message, type);
	} else {
		console.log(`[Toast Fallback] ${type}: ${message}`);
		alert(message);
	}
};

// ─── Guest Access ──────────────────────────────────────────
window.continueAsGuest = function () {
	revealMainContent();
	isUserAuthenticated = false;
	isInitialLogin = false;
};

// ─── Login / Cadastro / Recuperação ───────────────────────
window.handleForgotPassword = function () {
	openModal('forgot-modal', 'forgot-panel');
};

window.handleSignUp = function () {
	openModal('signup-modal', 'signup-panel');
};

window.togglePasswordVisibility = function () {
	const input = document.getElementById('initial-login-password');
	const icon = document.getElementById('password-toggle-icon');
	if (!input) return;

	const nextType = input.type === 'password' ? 'text' : 'password';
	input.type = nextType;
	if (icon) icon.textContent = nextType === 'password' ? 'visibility_off' : 'visibility';
};

window.doLogin = function () {
	ensureSeedUser();

	const emailInput = document.getElementById('initial-login-email');
	const passwordInput = document.getElementById('initial-login-password');
	const remember = document.getElementById('initial-remember-me')?.checked;

	const email = normalizeEmail(emailInput?.value);
	const password = String(passwordInput?.value || '');

	if (!isValidEmail(email)) {
		window.showToast('Informe um e-mail válido.', 'warning');
		return;
	}

	if (password.length < 6) {
		window.showToast('A senha deve ter no mínimo 6 caracteres.', 'warning');
		return;
	}

	const users = getUsers();
	const user = users.find(u => normalizeEmail(u.email) === email && String(u.password || '') === password);

	if (!user) {
		window.showToast('E-mail ou senha incorretos.', 'error');
		return;
	}

	setAuthSession(user, Boolean(remember));
	isUserAuthenticated = true;
	isInitialLogin = false;
	revealMainContent();
	showWelcomeSplash(user.name);
	window.showToast('Login realizado com sucesso.', 'success');
};

window.submitSignUp = function () {
	ensureSeedUser();

	const name = String(document.getElementById('signup-name')?.value || '').trim();
	const phone = String(document.getElementById('signup-phone')?.value || '').trim();
	const email = normalizeEmail(document.getElementById('signup-email')?.value);
	const password = String(document.getElementById('signup-password')?.value || '');
	const address = String(document.getElementById('signup-address')?.value || '').trim();

	if (!name || !phone || !address) {
		window.showToast('Preencha todos os campos obrigatórios.', 'warning');
		return;
	}

	if (!isValidEmail(email)) {
		window.showToast('E-mail inválido.', 'warning');
		return;
	}

	if (password.length < 6) {
		window.showToast('A senha deve ter no mínimo 6 caracteres.', 'warning');
		return;
	}

	const users = getUsers();
	const exists = users.some(u => normalizeEmail(u.email) === email);
	if (exists) {
		window.showToast('Este e-mail já está cadastrado.', 'warning');
		return;
	}

	users.push({ name, phone, email, password, address });
	saveUsers(users);
	closeModal('signup-modal', 'signup-panel');
	window.showToast('Conta criada com sucesso. Faça login para continuar.', 'success');
};

window.sendRecoveryCode = function () {
	const email = normalizeEmail(document.getElementById('forgot-email')?.value);
	if (!isValidEmail(email)) {
		window.showToast('Informe um e-mail válido.', 'warning');
		return;
	}

	const users = getUsers();
	const user = users.find(u => normalizeEmail(u.email) === email);
	if (!user) {
		window.showToast('E-mail não encontrado.', 'error');
		return;
	}

	const code = String(Math.floor(100000 + Math.random() * 900000));
	window.__forgotEmail = email;
	window.__forgotCode = code;

	const emailPreview = document.getElementById('forgot-email-preview');
	const debugCode = document.getElementById('forgot-debug-code');
	const stepEmail = document.getElementById('forgot-step-email');
	const stepReset = document.getElementById('forgot-step-reset');

	if (emailPreview) emailPreview.textContent = email;
	if (debugCode) debugCode.textContent = code;
	if (stepEmail) stepEmail.classList.add('hidden');
	if (stepReset) stepReset.classList.remove('hidden');
};

window.backToForgotEmailStep = function () {
	const stepEmail = document.getElementById('forgot-step-email');
	const stepReset = document.getElementById('forgot-step-reset');
	if (stepReset) stepReset.classList.add('hidden');
	if (stepEmail) stepEmail.classList.remove('hidden');
};

window.resetPasswordWithCode = function () {
	const typedCode = String(document.getElementById('forgot-code')?.value || '').trim();
	const newPassword = String(document.getElementById('forgot-new-password')?.value || '');
	const confirmPassword = String(document.getElementById('forgot-confirm-password')?.value || '');

	if (!window.__forgotCode || !window.__forgotEmail) {
		window.showToast('Solicite um novo código.', 'warning');
		return;
	}

	if (typedCode !== String(window.__forgotCode)) {
		window.showToast('Código inválido.', 'error');
		return;
	}

	if (newPassword.length < 6) {
		window.showToast('A nova senha deve ter no mínimo 6 caracteres.', 'warning');
		return;
	}

	if (newPassword !== confirmPassword) {
		window.showToast('As senhas não coincidem.', 'warning');
		return;
	}

	const users = getUsers();
	const idx = users.findIndex(u => normalizeEmail(u.email) === normalizeEmail(window.__forgotEmail));
	if (idx < 0) {
		window.showToast('Conta não encontrada.', 'error');
		return;
	}

	users[idx].password = newPassword;
	saveUsers(users);
	window.__forgotCode = null;
	window.__forgotEmail = null;

	closeModal('forgot-modal', 'forgot-panel');
	window.showToast('Senha redefinida com sucesso.', 'success');
};

window.openInitialLoginGate = function () {
	showInitialGate();
	isInitialLogin = true;
};

window.openLoginModal = function (showGuestWhenAnon = false) {
	const guest = document.getElementById('profile-guest-view');
	const profile = document.getElementById('profile-view');

	if (guest && profile) {
		const shouldShowGuest = showGuestWhenAnon && !isUserAuthenticated;
		guest.classList.toggle('hidden', !shouldShowGuest);
		profile.classList.toggle('hidden', shouldShowGuest);
	}

	openModal('login-modal', 'login-panel');
};

window.closeLoginModal = function () {
	closeModal('login-modal', 'login-panel');
};

window.switchProfileTab = function (tab) {
	const tabs = ['info', 'orders', 'favs', 'loyalty'];
	tabs.forEach(name => {
		const section = document.getElementById(`section-${name}`);
		const btn = document.getElementById(`tab-btn-${name}`);
		const active = name === tab;

		if (section) section.classList.toggle('hidden', !active);
		if (btn) {
			btn.classList.toggle('bg-brand-yellow', active);
			btn.classList.toggle('text-black', active);
			btn.classList.toggle('bg-zinc-900', !active);
			btn.classList.toggle('text-zinc-300', !active);
		}
	});
};

window.openEmptyCartModal = function () {
	const modal = document.getElementById('empty-cart-modal');
	const panel = document.getElementById('empty-cart-panel');
	if (!modal || !panel) return;

	modal.classList.remove('hidden');
	modal.setAttribute('aria-hidden', 'false');
	void modal.offsetWidth;
	modal.classList.remove('opacity-0');
	panel.classList.remove('scale-95');
	document.body.style.overflow = 'hidden';
};

window.closeEmptyCartModal = function () {
	const modal = document.getElementById('empty-cart-modal');
	const panel = document.getElementById('empty-cart-panel');
	if (!modal || !panel) return;

	modal.classList.add('opacity-0');
	modal.setAttribute('aria-hidden', 'true');
	panel.classList.add('scale-95');

	setTimeout(() => {
		modal.classList.add('hidden');
		if (document.querySelectorAll('.modal-overlay.is-visible').length === 0) {
			document.body.style.overflow = '';
		}
	}, 300);
};

function setMobileMenuVisualState(isOpen) {
	const infoBar = document.getElementById('info-bar');
	const header = document.querySelector('[data-purpose="site-header"]');
	const chatFab = document.getElementById('chat-fab');
	const supportWidget = document.getElementById('support-widget');
	const pageBody = document.getElementById('page-body') || document.body;

	if (infoBar) infoBar.classList.toggle('info-bar-menu-open', isOpen);
	if (header) header.classList.toggle('site-header-menu-open', isOpen);
	if (chatFab) chatFab.classList.toggle('hidden', isOpen);
	if (supportWidget) supportWidget.classList.toggle('hidden', isOpen);
	if (pageBody) pageBody.classList.toggle('mobile-menu-open', isOpen);
}

// --- Lógica do Menu Mobile ---
window.toggleMobileMenu = function () {
	const menu = document.getElementById('mobile-menu');
	const overlay = document.getElementById('mobile-menu-overlay');
	const toggle = document.getElementById('mobile-menu-toggle');

	if (!menu || !overlay) return;

	const isHidden = menu.classList.contains('translate-x-full');

	if (isHidden) {
		overlay.classList.remove('hidden');
		void overlay.offsetWidth;
		overlay.classList.add('opacity-100');
		menu.classList.remove('translate-x-full');
		menu.setAttribute('aria-hidden', 'false');
		if (toggle) toggle.setAttribute('aria-expanded', 'true');
		document.body.style.overflow = 'hidden';
		setMobileMenuVisualState(true);
	} else {
		overlay.classList.remove('opacity-100');
		menu.classList.add('translate-x-full');
		menu.setAttribute('aria-hidden', 'true');
		if (toggle) toggle.setAttribute('aria-expanded', 'false');
		setTimeout(() => overlay.classList.add('hidden'), 300);
		document.body.style.overflow = '';
		setMobileMenuVisualState(false);
	}
};

// --- Lógica da Busca no Header ---
window.toggleHeaderSearch = function (forceClose = false) {
	const wrap = document.getElementById('header-search-wrap');
	if (!wrap) return;

	const isOpen = !wrap.classList.contains('max-h-0');
	if (forceClose || isOpen) {
		wrap.classList.add('max-h-0', 'border-transparent');
		wrap.classList.remove('max-h-[120px]', 'border-zinc-800');
		return;
	}

	wrap.classList.remove('max-h-0', 'border-transparent');
	wrap.classList.add('max-h-[120px]', 'border-zinc-800');
	const input = document.getElementById('header-search-input');
	if (input) setTimeout(() => input.focus(), 150);
};

// --- Inicialização e Eventos Globais ---
document.addEventListener('DOMContentLoaded', () => {
	ensureSeedUser();

	// Sempre inicia no gate para evitar auto-entrada após F5.
	isUserAuthenticated = false;
	isInitialLogin = true;
	showInitialGate();

	// Esc para fechar qualquer modal aberto
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			const openModalEl = document.querySelector('.modal-overlay.is-visible');
			if (openModalEl && window.UI) {
				const panel = openModalEl.querySelector('.modal-panel');
				window.UI.modal.close(openModalEl.id, panel ? panel.id : null);
			}
		}
	});

	// Fechar modal de carrinho vazio ao clicar fora
	const emptyCartModal = document.getElementById('empty-cart-modal');
	if (emptyCartModal) {
		emptyCartModal.addEventListener('click', (e) => {
			if (e.target === emptyCartModal) window.closeEmptyCartModal();
		});
	}

	// Garante que o menu comece fechado
	const menu = document.getElementById('mobile-menu');
	const overlay = document.getElementById('mobile-menu-overlay');
	if (menu && overlay) {
		menu.classList.add('translate-x-full');
		overlay.classList.add('hidden');
	}
	setMobileMenuVisualState(false);

	// Observer para animações de scroll
	const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
	const scrollObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('anim-visible');
				scrollObserver.unobserve(entry.target);
			}
		});
	}, observerOptions);
	document.querySelectorAll('.anim-fadein, .anim-scalein').forEach(el => scrollObserver.observe(el));
});

/**
 * Cria um efeito de onda (ripple) luxuoso em cliques
 */
function createRipple(event) {
	return;
}

