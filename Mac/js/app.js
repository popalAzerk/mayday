// Main Application Entry Point
// macData is global
// state, loadSettings, buildFlatMacList are global
// initElements, render are global
// handlers functions are global
// diagnosticsData is global

// Initialize Application
window.init = function () {
    try {
        // Reloger les boutons RGPD + thème (injectés par shared-app.js en
        // fixed bottom-right) DANS la pillule d'actions du header — sinon ils
        // chevauchent le panneau Planning.
        (function moveFooterToggles() {
            const ft = document.querySelector('.global-footer-toggle');
            const actions = document.querySelector('.header-actions');
            if (ft && actions) {
                const trig = actions.querySelector('.actions-trigger');
                const inner = actions.querySelector('.actions-inner');
                if (inner) inner.appendChild(ft); else if (trig) trig.after(ft); else actions.appendChild(ft);
            } else if (!ft) {
                // shared-app.js attend DOMContentLoaded: réessayer brièvement
                let tries = 0;
                const t = setInterval(() => {
                    const f = document.querySelector('.global-footer-toggle');
                    const ac = document.querySelector('.header-actions');
                    if (f && ac) { const inner = ac.querySelector('.actions-inner'); if (inner) inner.appendChild(f); else { const tr = ac.querySelector('.actions-trigger'); if (tr) tr.after(f); else ac.appendChild(f); } clearInterval(t); }
                    else if (++tries > 20) clearInterval(t);
                }, 100);
            }
        })();

        // Initialize DOM elements
        window.initElements();
    window.setAppMode(window.appMode);
    // Restaurer la sélection courante (mode Genius)
    if (window.appMode === 'genius') {
      try {
        const saved = JSON.parse(localStorage.getItem('mayday-current-repair') || 'null');
        if (saved && saved.modelData) {
          if (saved.validated === undefined) saved.validated = false;
          window.state.currentRepair = saved;
          if (typeof window.renderRepairInfo === 'function') window.renderRepairInfo();
        }
      } catch (e) { /* ignore */ }
    }

        // Load settings from localStorage
        window.loadSettings();

        // Build flat mac list for search
        window.buildFlatMacList(window.macData);

        // Setup event listeners
        window.setupSliderEvents();

        // Check for Auto-Sync Server
        window.checkServerStatus().then(online => {
            if (online) {
                // Determine source of truth logic could be complex. 
                // For now, simpler: Use Server data if local is empty or server has data?
                // Or just try to fetch server data to merge?
                // Let's keep it simple: Fetch server data on load.
                fetch(window.SERVER_URL)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data) && data.length > 0) {
                            console.log("Sync: Loaded schedule from server");
                            window.state.scheduledRepairs = data;
                            window.render(window.macData);
                        }
                    })
                    .catch(e => console.error("Sync Error:", e));
            }
        });

        // Initial render
        window.render(window.macData);

        console.log('Mac Admin Support initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
};

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.init);
} else {
    window.init();
}

// Init mode Admin/Genius via l'app (après initElements)
