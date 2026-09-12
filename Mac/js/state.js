// Application State Management
// DEFAULT_SETTINGS is now global from config.js

// Application State
window.state = {
    path: [],
    currentRepair: null,
    scheduledRepairs: [],
    sizeFilter: null,
    searchQuery: '',
    flatMacList: []
};

// Settings
window.settings = { ...window.DEFAULT_SETTINGS };

// Local Storage Functions
window.loadSettings = function () {
    const saved = localStorage.getItem('genius-scheduler-settings');
    if (saved) {
        try {
            window.settings = { ...window.DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Failed to load saved settings", e);
        }
    }

    // Load Saved Schedule if exists
    const savedSchedule = localStorage.getItem('genius-scheduler-repairs');
    if (savedSchedule) {
        try {
            window.state.scheduledRepairs = JSON.parse(savedSchedule);
        } catch (e) {
            console.error("Failed to load saved schedule", e);
            window.state.scheduledRepairs = [];
        }
    }

    return window.settings;
};

// Helper Functions
window.getModelData = function (macData, catKey, subcatKey, modelKey) {
    const category = macData[catKey];
    if (!category) return null;

    if (subcatKey && category.subcategories) {
        const subcategory = category.subcategories[subcatKey];
        return subcategory?.models?.[modelKey];
    } else {
        return category?.models?.[modelKey];
    }
};

// Build flat list for searching
window.buildFlatMacList = function (macData) {
    const flatList = [];

    for (const catKey in macData) {
        const cat = macData[catKey];
        if (cat.subcategories) {
            for (const subcatKey in cat.subcategories) {
                const subcat = cat.subcategories[subcatKey];
                if (subcat.models) {
                    for (const modelKey in subcat.models) {
                        const model = subcat.models[modelKey];
                        flatList.push({
                            categoryKey: catKey,
                            subcategoryKey: subcatKey,
                            modelKey: modelKey,
                            name: model.name,
                            year: model.year,
                            chip: model.chip,
                            size: model.size,
                            image: model.image
                        });
                    }
                }
            }
        } else if (cat.models) {
            for (const modelKey in cat.models) {
                const model = cat.models[modelKey];
                flatList.push({
                    categoryKey: catKey,
                    subcategoryKey: null,
                    modelKey: modelKey,
                    name: model.name,
                    year: model.year,
                    chip: model.chip,
                    size: model.size,
                    image: model.image
                });
            }
        }
    }

    window.state.flatMacList = flatList;
    return flatList;
};


// === DATA SYNC & PERSISTENCE ===

window.SERVER_URL = '/api/data'; // Relative URL assumes serving from the same host
window.isServerAvailable = false;

// Check server connection
window.checkServerStatus = async function () {
    // If running from file://, we are in Standalone Mode. 
    // Relative paths like /api/data will fail (file:///api/data).
    // We disable auto-sync in this mode to prevent errors.
    if (window.location.protocol === 'file:') {
        console.log("Mode: Standalone (file://). Auto-sync disabled.");
        window.isServerAvailable = false;
        return false;
    }

    try {
        const response = await fetch(window.SERVER_URL, { method: 'HEAD' });
        window.isServerAvailable = response.ok;
        console.log("Server Status:", window.isServerAvailable ? "Online" : "Offline");
        return window.isServerAvailable;
    } catch (e) {
        window.isServerAvailable = false;
        console.log("Server Status: Offline (Mode Standalone)");
        return false;
    }
};

// Toast Notification Feature
window.showToast = function(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg || !message) return;
    
    toastMsg.textContent = message;
    toast.classList.add('show');
    
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
};

// Save Data (Local + Server)
window.saveScheduleToStorage = async function () {
    const data = window.state.scheduledRepairs;

    // 1. Always save to LocalStorage (Backup/Offline)
    localStorage.setItem('genius-scheduler-repairs', JSON.stringify(data));

    // 1b. Historique: snapshot quotidien (7 derniers jours)
    try {
        const today = new Date().toISOString().split('T')[0];
        const hist = JSON.parse(localStorage.getItem('mayday-schedule-history') || '{}');
        if (data.length > 0) {
            hist[today] = {
                date: today,
                count: data.length,
                totalMin: data.reduce((s, r) => s + (r.totalTime || 0), 0),
                ripCount: data.filter(r => r.status === 'rip').length,
                models: data.map(r => `${r.modelName} — ${r.partsNames || ''} (${r.totalTime}m)`).slice(0, 30)
            };
            // Garder les 7 derniers jours
            const days = Object.keys(hist).sort();
            while (days.length > 7) delete hist[days.shift()];
            localStorage.setItem('mayday-schedule-history', JSON.stringify(hist));
        }
    } catch (e) { /* ignore */ }

    // 2. Try to save to Server
    if (window.isServerAvailable) {
        try {
            await fetch(window.SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            window.showToast("Sauvegardé (Serveur + Local)");
        } catch (e) {
            console.error("Sync Failed:", e);
            window.showToast("Sauvegardé (Local uniquement - Connexion perdue)");
            window.isServerAvailable = false;
        }
    } else {
        // window.showToast("Sauvegardé (Local)"); // Don't spam toasts in standalone mode
    }
};

window.clearScheduleStorage = function () {
    localStorage.removeItem('genius-scheduler-repairs');
    // We don't clear server data automatically to prevent accidental data loss for other users
};

window.saveSettings = function () {
    localStorage.setItem('genius-scheduler-settings', JSON.stringify(window.settings));
};

window.resetSettings = function () {
    window.settings = { ...window.DEFAULT_SETTINGS };
    window.saveSettings();
};

window.updateSetting = function (key, value) {
    window.settings[key] = value;
};


// === EXPORT / IMPORT ===

window.exportData = function () {
    const data = {
        settings: window.settings,
        repairs: window.state.scheduledRepairs
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mac_admin_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast("Données exportées !");
};

window.triggerImport = function () {
    document.getElementById('import-file-input').click();
};

window.importData = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.settings) {
                window.settings = { ...window.DEFAULT_SETTINGS, ...data.settings };
                window.saveSettings();
            }
            if (data.repairs) {
                window.state.scheduledRepairs = data.repairs;
                window.saveScheduleToStorage(); // Will try to sync to server too if online
            }

            // Re-render
            window.render(window.macData);

            // Update UI sliders manually since they are not fully reactive in current render
            document.getElementById('genius-slider').value = window.settings.geniusCount;
            document.getElementById('genius-count-label').textContent = window.settings.geniusCount;
            document.getElementById('work-hours-slider').value = window.settings.workHours;
            document.getElementById('work-hours-label').textContent = window.settings.workHours;
            document.getElementById('multiplier-slider').value = window.settings.timeMultiplier;
            document.getElementById('multiplier-label').textContent = window.settings.timeMultiplier.toFixed(1) + 'x';
            document.getElementById('rip-slider').value = window.settings.ripCount;
            document.getElementById('rip-count-label').textContent = window.settings.ripCount;

            window.showToast("Données importées avec succès !");
            window.closeModal('dashboard-modal');
        } catch (err) {
            alert("Erreur lors de l'import : Fichier invalide.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
};


// === Mode Admin / Genius ===
window.appMode = localStorage.getItem('mayday-mac-mode') || 'admin';
window.setAppMode = function (mode) {
  window.appMode = mode;
  localStorage.setItem('mayday-mac-mode', mode);
  document.body.classList.toggle('mode-genius', mode === 'genius');
  document.getElementById('mode-admin')?.classList.toggle('active', mode === 'admin');
  document.getElementById('mode-genius')?.classList.toggle('active', mode === 'genius');
  if (typeof window.renderRepairInfo === 'function') window.renderRepairInfo();
  if (typeof window.renderScheduledRepairs === 'function') window.renderScheduledRepairs();
};
