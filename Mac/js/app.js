// Main Application Entry Point
// macData is global
// state, loadSettings, buildFlatMacList are global
// initElements, render are global
// handlers functions are global
// diagnosticsData is global

// Initialize Application
window.init = function () {
    try {
        // Initialize DOM elements
        window.initElements();

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
