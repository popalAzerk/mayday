// Event Handlers and Business Logic
// Using window properties for global state/functions to ensure standalone compatibility

// Navigation Functions
window.navigateTo = function (newPath) {
  window.state.path = newPath;
  window.render(window.macData);
};

window.goBack = function () {
  if (window.state.path.length > 0) {
    window.state.path.pop();
    while (window.state.path.length > 0 && window.state.path[window.state.path.length - 1] === null) {
      window.state.path.pop();
    }
    window.render(window.macData);
  }
};

// Selection Handlers
window.selectCategory = function (catKey) {
  window.navigateTo([catKey]);
};

window.selectSubcategory = function (catKey, subcatKey) {
  window.navigateTo([catKey, subcatKey]);
};

window.selectModel = function (catKey, subcatKey, modelKey) {
  const modelData = window.getModelData(window.macData, catKey, subcatKey, modelKey);
  if (!modelData) return;

  window.state.currentRepair = {
    modelData,
    selectedParts: {},
    catKey,
    subcatKey,
    modelKey
  };
  // Persistance (mode Genius): la sélection survit à la fermeture d'onglet
  try {
    localStorage.setItem('mayday-current-repair', JSON.stringify({
      modelData, selectedParts: {}, catKey, subcatKey, modelKey, validated: false
    }));
  } catch (e) { /* quota */ }

  window.navigateTo([catKey, subcatKey, modelKey]);
  window.elements.searchInput.blur();
};

window.selectModelFromSearch = function (catKey, subcatKey, modelKey) {
  window.selectModel(catKey, subcatKey, modelKey);
  window.state.searchQuery = '';
  window.elements.searchInput.value = '';
};

window.togglePartSelection = function (partKey) {
  if (!window.state.currentRepair) return;
  const { modelData, selectedParts } = window.state.currentRepair;
  const part = modelData.parts[partKey];

  if (selectedParts.hasOwnProperty(partKey)) {
    delete selectedParts[partKey];
  } else {
    selectedParts[partKey] = part;
  }
  if (window.state.currentRepair.validated) window.state.currentRepair.validated = false;
  window.render(window.macData);
  window.updatePartsValidateOverlay();
};

window.setSizeFilter = function (size) {
  window.state.sizeFilter = size;
  window.render(window.macData);
};

let _searchDebounceTimer = null;
window.handleSearch = function (query) {
  window.state.searchQuery = query.trim();
  clearTimeout(_searchDebounceTimer);
  _searchDebounceTimer = setTimeout(() => window.render(window.macData), 200);
};

window.resetCurrentSelection = function () {
  window.state.path = [];
  window.state.currentRepair = null;
  window.state.sizeFilter = null;
  window.state.searchQuery = '';
  window.elements.searchInput.value = '';
  localStorage.removeItem('mayday-current-repair');
  window.render(window.macData);
};

window.closeCurrentRepair = function () {
  window.state.currentRepair = null;
  localStorage.removeItem('mayday-current-repair');
  window.goBack();
};

// Overlay « Valider les pièces » (mode Genius): fige la sélection et affiche
// le panneau suivant (Intervention sélectionnée: temps + Pré-test/Post-test/Guide).
window.validateParts = function () {
  if (!window.state.currentRepair || Object.keys(window.state.currentRepair.selectedParts).length === 0) return;
  const el = window.elements.partsValidateOverlay;
  if (el) el.classList.remove('show');
  // Panneau suivant = Intervention sélectionnée (renderRepairInfo) + persistance
  window.state.currentRepair.validated = true;
  try {
    const cr = window.state.currentRepair;
    localStorage.setItem('mayday-current-repair', JSON.stringify(cr));
  } catch (e) { /* quota */ }
  window.render(window.macData);
  // Direction automatique vers le panneau suivant (Intervention sélectionnée):
  // défilement doux + pulse lumineux pour guider l'œil (desktop = panel visible
  // pulse; mobile = la vue glisse jusqu'au panneau).
  const panel = document.getElementById('repair-info-panel')?.closest('.bento-panel');
  if (panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel.classList.add('panel-flash');
    setTimeout(() => panel.classList.remove('panel-flash'), 1400);
  }
  window.showToast('Pièces validées');
};

// Helper to calculate dynamic diagnostics
window.calculateDynamicDiagnostics = function (modelData, selectedParts, catKey) {
  const partsArray = Object.values(selectedParts);
  if (partsArray.length === 0) return modelData.post_diagnostics || [];

  let systemConfigRequired = false;
  const uniqueSteps = new Set();

  partsArray.forEach(part => {
    const diagRules = window.getDiagnosticsForPart(part.name);
    if (diagRules.systemConfig) systemConfigRequired = true;
    diagRules.diags.forEach(step => uniqueSteps.add(step));
  });

  const finalDiags = [];
  finalDiags.push({ name: "MRI System Check", duration: 5 });
  if (systemConfigRequired) finalDiags.push({ name: "Configuration du système", duration: 15 });

  const modelBaseDiagName = modelData.post_diagnostics?.find(d => d.name.includes("ASD"))?.name || "Diagnostic post-réparation";

  uniqueSteps.forEach(stepName => {
    let displayName = stepName;
    let duration = 5;

    if (stepName === "Diagnostic post-réparation") {
      displayName = modelBaseDiagName;
      duration = modelBaseDiagName.includes("ASD") ? 120 : 5;
    } else if (stepName.includes("Audio")) {
      duration = 10;
    } else if (stepName.includes("Touch Bar")) {
      if (!modelData.hasTouchBar) return;
    }
    if (displayName === "Configuration du système") return;
    finalDiags.push({ name: displayName, duration: duration });
  });

  return finalDiags;
};

// Repair Time Calculation
window.calculateRepairTime = function () {
  if (!window.state.currentRepair || Object.keys(window.state.currentRepair.selectedParts).length === 0) {
    return { opening: 0, repair: 0, postDiag: 0, multiplier: window.settings.timeMultiplier, total: 0 };
  }

  const { modelData, selectedParts } = window.state.currentRepair;
  const partsArray = Object.values(selectedParts);
  const maxLevel = Math.max(0, ...partsArray.map(p => p.level));

  let repairDuration = 0;
  const highestLevelParts = partsArray.filter(p => p.level === maxLevel);

  if (highestLevelParts.length === 1) repairDuration = highestLevelParts[0].duration;
  else if (highestLevelParts.length > 1) {
    const longestDuration = Math.max(...highestLevelParts.map(p => p.duration));
    repairDuration = longestDuration + 15;
  }

  const opening = modelData.opening_time || 10;
  const dynamicDiags = window.calculateDynamicDiagnostics(modelData, selectedParts, window.state.currentRepair.catKey);
  const postDiagDuration = dynamicDiags.reduce((sum, diag) => sum + diag.duration, 0);

  const activeTimeBeforeMultiplier = opening + repairDuration;
  const totalBeforeMultiplier = opening + repairDuration + postDiagDuration;
  const effectiveMultiplier = 1 / window.settings.timeMultiplier;

  const total = Math.round(totalBeforeMultiplier * effectiveMultiplier);
  const activeTime = Math.round(activeTimeBeforeMultiplier * effectiveMultiplier);

  return { opening, repair: repairDuration, postDiag: postDiagDuration, multiplier: effectiveMultiplier, total, activeTime };
};

// Scheduled Repairs Management
window.addRepairToSchedule = function () {
  if (!window.state.currentRepair || Object.keys(window.state.currentRepair.selectedParts).length === 0) {
    alert("Veuillez sélectionner au moins une pièce à réparer.");
    return;
  }

  const timeBreakdown = window.calculateRepairTime();
  const repair = {
    modelName: window.state.currentRepair.modelData.name,
    partsNames: Object.values(window.state.currentRepair.selectedParts).map(p => p.name).join(', '),
    timeBreakdown,
    totalTime: timeBreakdown.total,
    productName: '',
    status: 'scheduled',
    timestamp: Date.now(),
    catKey: window.state.currentRepair.catKey,
    subcatKey: window.state.currentRepair.subcatKey,
    modelKey: window.state.currentRepair.modelKey
  };

  window.state.scheduledRepairs.push(repair);
  window.saveScheduleToStorage(); // Auto-save
  window.resetCurrentSelection(); // Reset search to clear view
};

window.removeRepair = function (index) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette réparation ?')) {
    window.state.scheduledRepairs.splice(index, 1);
    window.saveScheduleToStorage(); // Auto-save
    window.render(window.macData);
  }
};

window.markAsRIP = function (index) {
  window.state.scheduledRepairs[index].status = 'rip';
  window.state.scheduledRepairs[index].ripTime = 15;
  window.saveScheduleToStorage(); // Auto-save
  window.render(window.macData);
};

window.unmarkRIP = function (index) {
  window.state.scheduledRepairs[index].status = 'scheduled';
  window.state.scheduledRepairs[index].ripTime = 0;
  window.saveScheduleToStorage(); // Auto-save
  window.render(window.macData);
};

let _saveDebounceTimer = null;
window.updateProductName = function (index, input) {
  window.state.scheduledRepairs[index].productName = input.value;
  clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => window.saveScheduleToStorage(), 500);
  window.updateDashboardStats();
};

window.showRepairDetails = function () {
  if (!window.state.currentRepair || Object.keys(window.state.currentRepair.selectedParts).length === 0) return;

  const { modelData, selectedParts } = window.state.currentRepair;
  const timeBreakdown = window.calculateRepairTime();
  const selectedPartsArray = Object.values(selectedParts);
  const postDiagnostics = window.calculateDynamicDiagnostics(modelData, selectedParts, window.state.currentRepair.catKey);

  window.elements.detailsTitle.textContent = `Détails: ${modelData.name}`;

  window.elements.detailsBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="align-items:flex-start; text-align:left;">
        <h4 class="font-semibold" style="margin-bottom:8px;">Pièces sélectionnées:</h4>
        <ul style="margin:0; padding-left:16px;">
          ${selectedPartsArray.map(part => `<li>Niveau ${part.level} - ${part.name} (${part.duration} min)</li>`).join('')}
        </ul>
      </div>

      <div class="card" style="align-items:flex-start; text-align:left;">
        <h4 class="font-semibold" style="margin-bottom:8px;">Calcul du temps:</h4>
        <ul style="margin:0; padding-left:16px;">
          <li>Ouverture & Diag. Initial: <span class="font-mono">${timeBreakdown.opening} min</span></li>
          <li>Temps de réparation: <span class="font-mono">${timeBreakdown.repair} min</span></li>
          <li>Diagnostics Finaux: <span class="font-mono">${timeBreakdown.postDiag} min</span></li>
          <li class="font-semibold" style="margin-top:4px;">Total brut: <span class="font-mono">${timeBreakdown.opening + timeBreakdown.repair + timeBreakdown.postDiag} min</span></li>
          <li>Multiplicateur (×${timeBreakdown.multiplier.toFixed(1)}): <span class="font-mono font-bold text-blue">${timeBreakdown.total} min</span></li>
        </ul>
      </div>

      <div class="card" style="align-items:flex-start; text-align:left; background: rgba(0, 122, 255, 0.05); border-color: rgba(0, 122, 255, 0.2);">
        <h4 class="font-semibold text-blue" style="margin-bottom:8px;">Diagnostics Pré-Réparation:</h4>
        <ul style="margin:0; padding-left:16px;">
          <li>MRI System Check (5 min)</li>
          <li>Test Qualité Affichage (5 min)</li>
          <li>Test Audio (5 min)</li>
          <li>Test Clavier (5 min)</li>
          <li>Test Ports I/O (5 min)</li>
          ${modelData.chip && modelData.chip.toLowerCase().includes('m') && !modelData.chip.toLowerCase().includes('intel') ? '<li><strong>Full System Diagnostics (Apple Silicon)</strong></li>' : '<li><strong>ASD EFI and OS (Intel)</strong></li>'}
        </ul>
      </div>

      <div class="card" style="align-items:flex-start; text-align:left; background: rgba(52, 199, 89, 0.05); border-color: rgba(52, 199, 89, 0.2);">
        <h4 class="font-semibold" style="color: var(--apple-green); margin-bottom:8px;">Diagnostics Post-réparation (Dynamique):</h4>
        <ul style="margin:0; padding-left:16px;">
          ${postDiagnostics.map(diag => `<li>${diag.name} (${diag.duration} min)</li>`).join('')}
          ${postDiagnostics.length === 0 ? '<li>Aucun test spécifique requis</li>' : ''}
        </ul>
      </div>
    </div>
  `;
  window.openModal('repair-details-modal');
};

window.showScheduledRepairDetails = function (index) {
  const repair = window.state.scheduledRepairs[index];
  const modelData = window.getModelData(window.macData, repair.catKey, repair.subcatKey, repair.modelKey);

  const partNamesList = repair.partsNames.split(', ');
  const reconstructedParts = {};
  if (modelData && modelData.parts) {
    Object.entries(modelData.parts).forEach(([key, part]) => {
      if (partNamesList.includes(part.name)) reconstructedParts[key] = part;
    });
  }

  const postDiagnostics = modelData
    ? window.calculateDynamicDiagnostics(modelData, reconstructedParts, repair.catKey)
    : [];
  window.elements.detailsTitle.textContent = `Détails: ${repair.modelName}`;

  window.elements.detailsBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${repair.productName ? `
      <div class="card" style="align-items:flex-start; text-align:left; background:rgba(120,120,120,0.1);">
        <h4 class="font-semibold">Nom du Produit/Ticket:</h4>
        <p>${repair.productName}</p>
      </div>
      ` : ''}
      
      <div class="card" style="align-items:flex-start; text-align:left;">
        <h4 class="font-semibold" style="margin-bottom:8px;">Pièces sélectionnées:</h4>
        <p>${repair.partsNames}</p>
      </div>

      <div class="card" style="align-items:flex-start; text-align:left;">
        <h4 class="font-semibold" style="margin-bottom:8px;">Détails du temps:</h4>
        <ul style="margin:0; padding-left:16px;">
          <li>Ouverture & Diag. Initial: <span class="font-mono">${repair.timeBreakdown.opening} min</span></li>
          <li>Temps de réparation: <span class="font-mono">${repair.timeBreakdown.repair} min</span></li>
          <li>Diagnostics Finaux: <span class="font-mono">${repair.timeBreakdown.postDiag} min</span></li>
          <li class="font-semibold" style="margin-top:4px;">Total brut: <span class="font-mono">${repair.timeBreakdown.opening + repair.timeBreakdown.repair + repair.timeBreakdown.postDiag} min</span></li>
          <li>Multiplicateur (×${repair.timeBreakdown.multiplier.toFixed(1)}): <span class="font-mono font-bold text-blue">${repair.totalTime} min</span></li>
        </ul>
      </div>

      <div class="card" style="align-items:flex-start; text-align:left; background: rgba(0, 122, 255, 0.05); border-color: rgba(0, 122, 255, 0.2);">
        <h4 class="font-semibold text-blue" style="margin-bottom:8px;">Diagnostics Pré-Réparation:</h4>
        <ul style="margin:0; padding-left:16px;">
          <li>MRI System Check (5 min)</li>
          <li>Test Qualité Affichage (5 min)</li>
          <li>Test Audio (5 min)</li>
          <li>Test Clavier (5 min)</li>
          <li>Test Ports I/O (5 min)</li>
          ${modelData && modelData.chip && modelData.chip.toLowerCase().includes('m') && !modelData.chip.toLowerCase().includes('intel') ? '<li><strong>Full System Diagnostics (Apple Silicon)</strong></li>' : '<li><strong>ASD EFI and OS (Intel)</strong></li>'}
        </ul>
      </div>

      <div class="card" style="align-items:flex-start; text-align:left; background: rgba(52, 199, 89, 0.05); border-color: rgba(52, 199, 89, 0.2);">
        <h4 class="font-semibold" style="color: var(--apple-green); margin-bottom:8px;">Tests Post-Réparation Nécessaires:</h4>
        <ul style="margin:0; padding-left:16px;">
          ${postDiagnostics.map(diag => `<li>${diag.name} (${diag.duration} min)</li>`).join('')}
          ${postDiagnostics.length === 0 ? '<li>Aucun test spécifique requis</li>' : ''}
        </ul>
      </div>

      <div style="text-align:right;">
        <span style="display:inline-block; padding: 4px 12px; border-radius:12px; font-size:12px; font-weight:bold; ${repair.status === 'rip' ? 'background:var(--apple-blue); color:white;' : 'background:rgba(120,120,120,0.2); color:var(--text-main);'}">
          ${repair.status === 'rip' ? 'Réparation en cours (RIP)' : 'Planifiée'}
        </span>
      </div>
    </div>
  `;
  window.openModal('repair-details-modal');
};

// Dashboard Functions
window.updateDashboardStats = function () {
  const totalMinutesAvailable = Math.round(window.settings.workHours * 60 * window.settings.geniusCount * window.settings.timeMultiplier);
  const usedMinutes = window.state.scheduledRepairs.reduce((sum, repair) => {
    const repairLoad = repair.timeBreakdown && repair.timeBreakdown.activeTime !== undefined ? repair.timeBreakdown.activeTime : repair.totalTime;
    return repair.status === 'rip' ? sum : sum + repairLoad;
  }, 0);

  const ripTime = window.settings.ripCount * 15;
  const totalUsedMinutes = usedMinutes + ripTime;
  const remainingMinutes = Math.max(0, totalMinutesAvailable - totalUsedMinutes);
  const avgRepairTime = window.state.scheduledRepairs.length > 1 ? Math.round(usedMinutes / window.state.scheduledRepairs.length) : window.CONFIG.AVERAGE_REPAIR_MINS;

  const totalPossibleRepairs = Math.floor(totalMinutesAvailable / Math.max(1, avgRepairTime));
  const currentRepairsCount = window.state.scheduledRepairs.filter(r => r.status !== 'rip').length;
  let remainingPossibleRepairs = Math.max(0, totalPossibleRepairs - currentRepairsCount);
  if (remainingPossibleRepairs === 0 && remainingMinutes >= 60) remainingPossibleRepairs = 1;

  const usagePercent = totalMinutesAvailable > 0 ? Math.min(100, (totalUsedMinutes / totalMinutesAvailable) * 100) : 0;
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  if (window.elements.statsUsedMain) window.elements.statsUsedMain.textContent = formatTime(totalUsedMinutes);
  if (window.elements.statsMacCapacityMain) window.elements.statsMacCapacityMain.textContent = `~${remainingPossibleRepairs} Mac`;
  if (window.elements.capacityBarMain) window.elements.capacityBarMain.style.width = `${usagePercent}%`;
};

window.updateSliders = function () {
  window.elements.geniusSlider.value = window.settings.geniusCount;
  window.elements.geniusCountLabel.textContent = window.settings.geniusCount;
  window.elements.workHoursSlider.value = window.settings.workHours;
  window.elements.workHoursLabel.textContent = window.settings.workHours;
  window.elements.multiplierSlider.value = window.settings.timeMultiplier;
  window.elements.multiplierLabel.textContent = window.settings.timeMultiplier.toFixed(1);
  window.elements.ripSlider.value = window.settings.ripCount;
  window.elements.ripCountLabel.textContent = window.settings.ripCount;
};

// Modal Functions
window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if(modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
  }
  if (modalId === 'dashboard-modal') window.updateSliders();
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if(modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
  }
};

window.setupSliderEvents = function () {
  const saveAndUpdate = () => {
      window.updateDashboardStats();
      window.saveSettings(); // Auto-save on slider change
  };

  window.elements.geniusSlider.addEventListener('input', (e) => {
    window.updateSetting('geniusCount', parseInt(e.target.value));
    window.elements.geniusCountLabel.textContent = window.settings.geniusCount;
    saveAndUpdate();
  });

  window.elements.workHoursSlider.addEventListener('input', (e) => {
    window.updateSetting('workHours', parseInt(e.target.value));
    window.elements.workHoursLabel.textContent = window.settings.workHours;
    saveAndUpdate();
  });

  window.elements.multiplierSlider.addEventListener('input', (e) => {
    window.updateSetting('timeMultiplier', parseFloat(e.target.value));
    window.elements.multiplierLabel.textContent = window.settings.timeMultiplier.toFixed(1);
    saveAndUpdate();
    window.renderRepairInfo();
    window.renderScheduledRepairs();
  });

  window.elements.ripSlider.addEventListener('input', (e) => {
    window.updateSetting('ripCount', parseInt(e.target.value));
    window.elements.ripCountLabel.textContent = window.settings.ripCount;
    saveAndUpdate();
  });

  // Keep explicit button just in case
  window.elements.saveSettingsBtn.addEventListener('click', () => {
    window.saveSettings();
    window.saveSchedule(); // Manual Save Toast
    window.closeModal('dashboard-modal');
  });

  window.elements.resetSettingsBtn.addEventListener('click', () => {
    if (confirm('Réinitialiser tous les paramètres aux défauts ?')) {
      Object.assign(window.settings, window.DEFAULT_SETTINGS);
      window.saveSettings();
      window.updateSliders();
      window.updateDashboardStats();
    }
  });
};

// Persistence Handlers
window.saveSchedule = function () {
  window.saveScheduleToStorage();
  window.showToast("Sauvegardé !");
};

window.resetDay = function () {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la journée ? (Efface le planning)')) {
    window.state.scheduledRepairs = [];
    window.clearScheduleStorage();
    window.render(window.macData);
    window.closeModal('dashboard-modal');
  }
};

// Pillule d'actions à ouverture dynamique (Mac Admin)
window.toggleHeaderActions = function (btn) {
  const pill = document.getElementById('header-actions');
  if (!pill) return;
  const open = pill.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', open);
};
// Fermeture au clic extérieur + Échap
document.addEventListener('click', function (e) {
  const pill = document.getElementById('header-actions');
  if (pill && pill.classList.contains('open') && !pill.contains(e.target)) {
    pill.classList.remove('open');
    const t = pill.querySelector('.actions-trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const pill = document.getElementById('header-actions');
    if (pill && pill.classList.contains('open')) {
      pill.classList.remove('open');
      const t = pill.querySelector('.actions-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  }
});

// Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    const activeModal = document.querySelector('.modal-overlay.active, .modal-overlay[style*="display: flex"]');

    // Cmd+S / Ctrl+S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        window.saveSchedule();
    }
    
    // Cmd+F / Ctrl+F
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        if(!activeModal && window.elements.searchInput) {
            window.elements.searchInput.focus();
            window.elements.searchInput.select();
        }
    }
    
    // Cmd+D / Ctrl+D
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        if(document.getElementById('dashboard-modal').style.display === 'flex') {
            window.closeModal('dashboard-modal');
        } else {
            window.openModal('dashboard-modal');
        }
    }
    
    // Escape
    if (event.key === 'Escape') {
        if(activeModal) {
            window.closeModal(activeModal.id);
        } else if (window.state.currentRepair) {
            window.closeCurrentRepair();
        } else if (window.state.searchQuery) {
            window.resetCurrentSelection();
        }
    }
});


// === Mode Genius: Guides + Pré/Post tests ===
window.getGuideUrl = function () {
  const cr = window.state.currentRepair;
  if (!cr) return null;
  const key = `${cr.catKey}.subcategories.${cr.subcatKey}.models.${cr.modelKey}`;
  return window.MAC_GUIDES?.[key] || window.MAC_GUIDES?.[cr.modelKey] || null;
};

window.showPreTest = function () {
  const cr = window.state.currentRepair;
  if (!cr || Object.keys(cr.selectedParts).length === 0) return;
  const pre = window.diagnosticsData?.preDiagnostics || {};
  const items = Object.values(pre).map(d => `<li>${d.name} <span class="text-muted font-mono">(${d.duration} min)</span></li>`).join('');
  const parts = Object.values(cr.selectedParts).map(p => `<li>${p.name}</li>`).join('');
  window.elements.detailsTitle.textContent = `Pré-test: ${cr.modelData.name}`;
  window.elements.detailsBody.innerHTML = `
    <div class="card" style="align-items:flex-start; text-align:left;">
      <h4 class="font-semibold" style="margin-bottom:8px;">Réparation prévue:</h4>
      <ul style="margin:0; padding-left:16px;">${parts}</ul>
    </div>
    <div class="card" style="align-items:flex-start; text-align:left; background: rgba(0, 122, 255, 0.05); border-color: rgba(0, 122, 255, 0.2);">
      <h4 class="font-semibold text-blue" style="margin-bottom:8px;">Tests AVANT réparation:</h4>
      <ul style="margin:0; padding-left:16px;">${items}</ul>
    </div>
    ${window.getGuideUrl() ? `<div class="card"><a href="${window.getGuideUrl()}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;"><i class="fa-solid fa-book"></i> Guide officiel Apple</a></div>` : ''}
  `;
  window.openModal('repair-details-modal');
};

window.showPostTest = function () {
  const cr = window.state.currentRepair;
  if (!cr || Object.keys(cr.selectedParts).length === 0) return;
  const diags = window.calculateDynamicDiagnostics(cr.modelData, cr.selectedParts, cr.catKey);
  const items = diags.map(d => `<li>${d.name} <span class="text-muted font-mono">(${d.duration} min)</span></li>`).join('');
  window.elements.detailsTitle.textContent = `Post-test: ${cr.modelData.name}`;
  window.elements.detailsBody.innerHTML = `
    <div class="card" style="align-items:flex-start; text-align:left; background: rgba(52, 199, 89, 0.05); border-color: rgba(52, 199, 89, 0.2);">
      <h4 class="font-semibold" style="color: var(--apple-green); margin-bottom:8px;">Tests APRÈS réparation:</h4>
      <ul style="margin:0; padding-left:16px;">${items}</ul>
    </div>
    ${window.getGuideUrl() ? `<div class="card"><a href="${window.getGuideUrl()}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;"><i class="fa-solid fa-book"></i> Guide officiel Apple</a></div>` : ''}
  `;
  window.openModal('repair-details-modal');
};


// === Historique 7 jours (Mac Admin) ===
window.openHistoryModal = function () {
  const body = document.getElementById('history-body');
  let hist = {};
  try { hist = JSON.parse(localStorage.getItem('mayday-schedule-history') || '{}'); } catch (e) {}
  const days = Object.keys(hist).sort().reverse();
  if (!days.length) {
    body.innerHTML = '<p class="text-muted text-center" style="padding:24px;">Aucun historique pour le moment.<br>L\'historique se remplit à chaque sauvegarde du planning.</p>';
  } else {
    const fmt = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    body.innerHTML = days.map(d => {
      const e = hist[d];
      const hh = Math.floor(e.totalMin / 60), mm = e.totalMin % 60;
      const items = (e.models || []).map(m => `<li style="font-size:12px; color:var(--apple-text-muted, #8e8e93);">${m}</li>`).join('');
      return `<div style="padding:12px; background: rgba(120,120,128,0.08); border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:13px; text-transform:capitalize;">${fmt(d)}</strong>
          <span class="font-mono" style="font-size:12px;">${e.count} intervention${e.count > 1 ? 's' : ''} · ${hh}h${String(mm).padStart(2,'0')}</span>
        </div>
        <ul style="margin:8px 0 0; padding-left:18px;">${items}</ul>
      </div>`;
    }).join('');
  }
  window.openModal('history-modal');
};
