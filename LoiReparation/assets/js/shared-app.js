/**
 * Shared JS for all 3 apps:
 * - Handles Dark Mode state (localStorage)
 * - Injects global navigation floating bar if requested.
 */

document.addEventListener('DOMContentLoaded', () => {
    initGlobalNav();
    initTheme();
});

function initTheme() {
    const htmlEl = document.documentElement;
    const savedTheme = localStorage.getItem('apple-hub-theme') || 'light';
    
    // Set initial theme
    if (savedTheme === 'dark') {
        htmlEl.setAttribute('data-theme', 'dark');
    } else {
        htmlEl.removeAttribute('data-theme');
    }
    
    // Re-fetch now that initGlobalNav() has created it
    const themeToggle = document.getElementById('gemini-theme-toggle') || document.getElementById('theme-toggle');
    
    // Attach listener if toggle exists
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = htmlEl.getAttribute('data-theme') === 'dark';
            if (isDark) {
                htmlEl.removeAttribute('data-theme');
                localStorage.setItem('apple-hub-theme', 'light');
            } else {
                htmlEl.setAttribute('data-theme', 'dark');
                localStorage.setItem('apple-hub-theme', 'dark');
            }
        });
    }
}

function initGlobalNav() {
    // If body has .needs-global-nav class, inject the floating pill bar
    if (document.body.classList.contains('needs-global-nav')) {
        const currentPath = window.location.pathname;
        
        // Define paths explicitly as relative to absolute document root.
        // Because these are file:// paths, we map dynamically based on relative nesting.
        // Close/dashboard.html (depth 1) -> ../index.html
        // iPhone/index.html (depth 1) -> ../index.html
        // Mac/index.html (depth 1) -> ../index.html
        
        // Determine root path by counting slashes or simply using relative links:
        let relativeRoot = './';
        if (currentPath.includes('/guides/')) {
            relativeRoot = '../../';
        } else if (currentPath.includes('/Mac/') || currentPath.includes('/iPhone/') || currentPath.includes('/Close/') || currentPath.includes('/LoiReparation/')) {
            relativeRoot = '../';
        }
        
        const navHtml = `
            <nav class="global-floating-nav">
                <a href="${relativeRoot}index.html" class="nav-item ${currentPath.endsWith('/Mac_Admin_Support/index.html') && !currentPath.includes('/Mac/') ? 'active' : ''}" title="MAYDAY">
                    <svg class="svg-icon" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    MAYDAY
                </a>
                <a href="${relativeRoot}Mac/index.html" class="nav-item ${currentPath.includes('/Mac/') ? 'active' : ''}" title="Mac">
                    <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                    Mac
                </a>
                <a href="${relativeRoot}iPhone/index.html" class="nav-item ${currentPath.includes('/iPhone/') ? 'active' : ''}" title="iPhone">
                    <svg class="svg-icon" viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
                    iPhone
                </a>
<a href="${relativeRoot}LoiReparation/index.html" class="nav-item ${currentPath.includes('/LoiReparation/') || document.body.classList.contains('loi-page') ? 'active' : ''}" title="Loi Réparation">
                    <svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v13.5z"/></svg>
                    Loi
                </a>
                <a href="${relativeRoot}Close/dashboard.html" class="nav-item ${currentPath.includes('/Close/') ? 'active' : ''}" title="Close">
                    <svg class="svg-icon" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    Close
                </a>
            </nav>
        `;
        
        const footerHtml = `
            <div class="global-footer-toggle">
                <a href="${relativeRoot}privacy.html" class="rgpd-btn ${currentPath.includes('/privacy') ? 'active' : ''}" title="Confidentialité (RGPD)">
                    <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                </a>
                <div class="gemini-toggle" id="gemini-theme-toggle" role="button" tabindex="0" title="Toggle Theme">
                    <svg class="icon-sun" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/></svg>
                    <div class="toggle-thumb">
                        <svg viewBox="0 0 24 24" width="14" height="14" style="fill:currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/></svg>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', navHtml);
        document.body.insertAdjacentHTML('beforeend', footerHtml);
    }
}
