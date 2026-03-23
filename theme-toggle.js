document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-toggle-icon');
    const body = document.body;
    const root = document.documentElement;

    if (!themeToggle || !themeIcon) return;

    const storedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = storedTheme || (prefersLight ? 'light' : 'dark');

    const applyTheme = (theme) => {
        const isLight = theme === 'light';

        body.classList.toggle('light-theme', isLight);

        root.classList.toggle('light', isLight);
        root.classList.toggle('dark', !isLight);
        root.style.colorScheme = isLight ? 'light' : 'dark';

        themeIcon.textContent = isLight ? 'dark_mode' : 'light_mode';
        themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const nextTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(nextTheme);
    });
});
