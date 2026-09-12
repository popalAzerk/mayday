// Rendering Module - UI Rendering Functions
// state, settings, getModelData are global
// LEVEL_COLORS is global

const _esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

window.elements = {
  categoriesScreen: null, subcategoriesScreen: null, modelsScreen: null, partsScreen: null,
  categoriesGrid: null, subcategoriesGrid: null, modelsGrid: null,
  breadcrumbContainer: null, repairInfoPanel: null, searchInput: null,
  subcategoriesTitle: null, modelsTitle: null, sizeFilterContainer: null, backButtonContainer: null,
  geniusSlider: null, geniusCountLabel: null, workHoursSlider: null, workHoursLabel: null,
  multiplierSlider: null, multiplierLabel: null, ripSlider: null, ripCountLabel: null,
  saveSettingsBtn: null, resetSettingsBtn: null,
  statsUsedMain: null, statsMacCapacityMain: null, capacityBarMain: null,
  scheduledRepairsContainer: null, repairCount: null, emptyState: null,
  detailsTitle: null, detailsBody: null
};

window.initElements = function () {
  const q = (id) => document.getElementById(id);
  window.elements.categoriesScreen = q('categories-screen');
  window.elements.subcategoriesScreen = q('subcategories-screen');
  window.elements.modelsScreen = q('models-screen');
  window.elements.partsScreen = q('parts-screen');
  window.elements.categoriesGrid = q('categories-grid');
  window.elements.subcategoriesGrid = q('subcategories-grid');
  window.elements.modelsGrid = q('models-grid');
  window.elements.breadcrumbContainer = q('breadcrumb-container');
  window.elements.repairInfoPanel = q('repair-info-panel');
  window.elements.searchInput = q('search-input');
  window.elements.subcategoriesTitle = q('subcategories-title');
  window.elements.modelsTitle = q('models-title');
  window.elements.sizeFilterContainer = q('size-filter-buttons');
  window.elements.backButtonContainer = q('back-button-container');
  
  window.elements.geniusSlider = q('genius-slider');
  window.elements.geniusCountLabel = q('genius-count-label');
  window.elements.workHoursSlider = q('work-hours-slider');
  window.elements.workHoursLabel = q('work-hours-label');
  window.elements.multiplierSlider = q('multiplier-slider');
  window.elements.multiplierLabel = q('multiplier-label');
  window.elements.ripSlider = q('rip-slider');
  window.elements.ripCountLabel = q('rip-count-label');
  window.elements.saveSettingsBtn = q('save-settings-btn');
  window.elements.resetSettingsBtn = q('reset-settings-btn');

  window.elements.statsUsedMain = q('stats-used-minutes-main');
  window.elements.statsMacCapacityMain = q('stats-mac-capacity-main');
  window.elements.capacityBarMain = q('capacity-bar-main');
  window.elements.scheduledRepairsContainer = q('scheduled-repairs-container');
  window.elements.repairCount = q('repair-count');
  
  window.elements.detailsTitle = q('details-title');
  window.elements.detailsBody = q('details-body');
};

window.render = function (macData) {
  window.elements.categoriesScreen.classList.remove('active');
  window.elements.subcategoriesScreen.classList.remove('active');
  window.elements.modelsScreen.classList.remove('active');
  window.elements.partsScreen.classList.remove('active');

  window.renderBreadcrumb(macData);

  if (window.state.searchQuery) {
    window.elements.modelsScreen.classList.add('active');
    window.renderSearchResults(macData);
    if (typeof window.updateDashboardStats === 'function') window.updateDashboardStats();
    return;
  }

  if (window.elements.backButtonContainer) {
    if (window.state.path.length > 0) window.elements.backButtonContainer.classList.remove('hidden');
    else window.elements.backButtonContainer.classList.add('hidden');
  }

  const len = window.state.path.length;
  if (len === 0) { window.elements.categoriesScreen.classList.add('active'); window.renderCategories(macData); }
  else if (len === 1) { window.elements.subcategoriesScreen.classList.add('active'); window.renderSubcategories(macData, window.state.path[0]); }
  else if (len === 2) { window.elements.modelsScreen.classList.add('active'); window.renderModels(macData, window.state.path[0], window.state.path[1]); }
  else if (len === 3) { window.elements.partsScreen.classList.add('active'); window.renderParts(macData, window.state.path[0], window.state.path[1], window.state.path[2]); }

  window.renderRepairInfo();
  window.renderScheduledRepairs();
  if (typeof window.updateDashboardStats === 'function') window.updateDashboardStats();
};

window.renderCategories = function (macData) {
  window.elements.categoriesGrid.innerHTML = Object.entries(macData).map(([key, cat], i) => `
    <div onclick="selectCategory('${key}')" class="card cat-bg stagger-in" style="animation-delay: ${i * 0.05}s">
      <img src="${cat.image}" alt="${cat.name}">
      <h3 style="font-size:16px;">${cat.name}</h3>
    </div>
  `).join('');
};

window.renderSubcategories = function (macData, catKey) {
  const category = macData[catKey];
  if (!category) return;
  window.elements.subcategoriesTitle.textContent = category.name;

  if (category.subcategories) {
    window.elements.subcategoriesGrid.innerHTML = Object.entries(category.subcategories).map(([key, subcat], i) => `
      <div onclick="selectSubcategory('${catKey}', '${key}')" class="card stagger-in" style="animation-delay: ${i * 0.04}s">
        <img src="${subcat.image}" alt="${subcat.name}">
        <h3 style="font-size:14px;">${subcat.name}</h3>
      </div>
    `).join('');
  } else if (category.models) {
    const sorted=Object.entries(category.models).sort(([,a],[,b])=>b.year-a.year);
    window.elements.subcategoriesGrid.innerHTML = sorted.map(([key, model], i) => {
        const status = window.getMacStatus(model.year, model.chip);
        const isOld = status === 'Vintage' || status === 'Obsolète';
        return `
        <div onclick="selectModel('${catKey}', null, '${key}')" class="card stagger-in" style="animation-delay: ${i * 0.03}s">
            <div class="card-image-container">
              <img src="${model.image}" alt="${model.name}">
            </div>
            <h3 style="font-size:13px; margin:4px 0;">${model.name}</h3>
            <div style="display:flex; gap:4px; margin-bottom:4px;">
                <span class="tag">${model.year}</span>
                <span class="tag">${model.chip}</span>
            </div>
            <div style="font-size:11px; font-weight:bold; color: var(--${isOld ? 'apple-red' : 'apple-blue'})">
                ${status}
            </div>
        </div>
        `;
    }).join('');
  }
};

window.renderModels = function (macData, catKey, subcatKey) {
  const subcategory = macData[catKey].subcategories[subcatKey];
  if (!subcategory) return;
  window.elements.modelsTitle.textContent = subcategory.name;

  const uniqueSizes = [...new Set(Object.values(subcategory.models).map(m=>m.size).filter(Boolean))].sort((a,b)=>a-b);
  if (uniqueSizes.length > 1) {
    let btns = `<button onclick="setSizeFilter(null)" class="btn ${!window.state.sizeFilter ? 'btn-primary' : ''}">Tous</button>`;
    btns += uniqueSizes.map(s => `<button onclick="setSizeFilter(${s})" class="btn ${window.state.sizeFilter === s ? 'btn-primary' : ''}">${s}"</button>`).join('');
    window.elements.sizeFilterContainer.innerHTML = btns;
  } else {
    window.elements.sizeFilterContainer.innerHTML = '';
  }

  const models = Object.entries(subcategory.models).filter(([, m]) => !window.state.sizeFilter || m.size === window.state.sizeFilter).sort(([,a],[,b])=>b.year-a.year);
  window.elements.modelsGrid.innerHTML = models.map(([key, model], i) => {
      const status = window.getMacStatus(model.year, model.chip);
      const isOld = status === 'Vintage' || status === 'Obsolète';
      return `
      <div onclick="selectModel('${catKey}', '${subcatKey}', '${key}')" class="card stagger-in" style="animation-delay: ${i * 0.03}s">
        <div class="card-image-container">
          <img src="${model.image}" alt="${model.name}">
        </div>
        <h3 style="font-size:13px; margin:4px 0;">${model.name}</h3>
        <div style="margin-top: auto; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: 6px;">
            <div style="display:flex; justify-content: center; flex-wrap: wrap; gap:4px; margin-bottom:4px;">
                <span class="tag">${model.year}</span>
                <span class="tag">${model.chip}</span>
            </div>
            <div style="font-size:11px; font-weight:bold; color: var(--${isOld ? 'apple-red' : 'apple-blue'})">
                ${status}
            </div>
        </div>
      </div>
      `;
  }).join('');
};

window.renderParts = function (macData, catKey, subcatKey, modelKey) {
  const model = window.getModelData(macData, catKey, subcatKey, modelKey);
  if (!model) return;
  const partsTitle = document.getElementById('parts-model-title');
  if (partsTitle) partsTitle.textContent = `Réparation: ${model.name}`;

  const sortedParts = Object.entries(model.parts).sort(([,a],[,b])=> a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name));
  const partsGrid = document.getElementById('repair-parts-list');
  if (partsGrid) {
    partsGrid.innerHTML = sortedParts.map(([key, part]) => {
      const isSelected = window.state.currentRepair?.selectedParts[key];
      return `
        <div onclick="togglePartSelection('${key}')" class="list-item ${isSelected ? 'selected' : ''}">
          <div>
            <div style="font-weight:600; display:flex; align-items:center; gap:8px;">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background: ${isSelected ? 'var(--apple-blue)' : 'var(--text-muted)'};"></span>
              ${part.name}
            </div>
            <div class="text-muted font-mono" style="font-size:12px; margin-left:18px;">${part.duration} min</div>
          </div>
          <div style="font-size:12px; color: ${isSelected ? 'var(--apple-blue)' : 'var(--text-muted)'}; font-weight:bold;">
             Nv ${part.level}
          </div>
        </div>
      `;
    }).join('');
  }
};

window.renderBreadcrumb = function (macData) {
  const { path } = window.state;
  const container = window.elements.breadcrumbContainer;
  if (!container) return;

  if(path.length===0){ container.innerHTML='<span style="font-weight:bold;">Accueil</span>'; return; }
  let html = '<span onclick="resetCurrentSelection()" style="cursor:pointer;">Accueil</span>';
  if(path.length>=1) html+=` > <span onclick="selectCategory('${path[0]}')" style="cursor:pointer; ${path.length===1?'font-weight:bold;':''}">${macData[path[0]].name}</span>`;
  if(path.length>=2 && path[1]){ html+=` > <span onclick="selectSubcategory('${path[0]}', '${path[1]}')" style="cursor:pointer;">${macData[path[0]].subcategories[path[1]].name}</span>`;}
  if(path.length>=3){ html+=` > <span style="font-weight:bold;">${window.getModelData(macData, path[0], path[1], path[2]).name}</span>`;}
  container.innerHTML = html;
};

window.renderSearchResults = function (macData) {
  const query = window.state.searchQuery.toLowerCase();
  const matches = window.state.flatMacList.filter(item => item.name.toLowerCase().includes(query) || item.year.toString().includes(query) || item.modelKey.toLowerCase().includes(query));
  window.elements.modelsTitle.textContent = `Résultats pour "${window.state.searchQuery}"`;
  
  if (matches.length === 0) {
    window.elements.modelsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text-muted);">Aucun résultat</div>`;
    return;
  }
  window.elements.modelsGrid.innerHTML = matches.map((match, i) => `
    <div onclick="selectModelFromSearch('${match.categoryKey}', '${match.subcategoryKey}', '${match.modelKey}')" class="card stagger-in" style="animation-delay: ${i * 0.03}s">
      <h3 style="font-size:13px;">${match.name}</h3>
      <div style="font-size:10px;" class="text-muted">${match.year} - ${match.chip}</div>
    </div>
  `).join('');
};

window.renderRepairInfo = function () {
  if (!window.state.currentRepair || Object.keys(window.state.currentRepair.selectedParts).length === 0) {
    window.elements.repairInfoPanel.innerHTML = `<div class="text-center text-muted" style="margin: auto;"><i class="fa-solid fa-gears" style="font-size:32px; margin-bottom:8px;"></i><p>Sélectionnez un Mac</p></div>`;
    return;
  }
  const { modelData, selectedParts } = window.state.currentRepair;
  const tb = window.calculateRepairTime();
  
  window.elements.repairInfoPanel.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${modelData.image}" style="width:48px; border-radius:8px; mix-blend-mode:multiply; background: #fff; padding:4px;">
          <div>
            <h3 style="font-size:16px; margin:0;">${modelData.name}</h3>
            <p class="text-muted font-mono" style="font-size:11px;">${modelData.year} / ${modelData.chip}</p>
          </div>
        </div>
        <button onclick="closeCurrentRepair()" class="btn btn-icon" style="color:var(--apple-red); border:none; background:transparent;"><i class="fa-solid fa-xmark"></i></button>
      </div>
      
      <div style="background: rgba(120,120,128,0.04); padding:16px; border-radius:14px; margin-bottom:16px; flex-grow:1;">
        <h4 style="margin-bottom:12px;">Temps (min)</h4>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Ouverture:</span><span class="font-mono">${tb.opening}</span></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Intervention:</span><span class="font-mono">${tb.repair}</span></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Diagnostics finaux:</span><span class="font-mono">${tb.postDiag}</span></div>
        <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:8px; font-weight:bold;">
            <span>Total:</span><span class="font-mono text-blue">${tb.total}</span>
        </div>
      </div>
      
      <div style="display:flex; gap:8px; margin-bottom:20px;">
        <button onclick="showRepairDetails()" class="btn" style="flex:1;">Test</button>
        <button onclick="addRepairToSchedule()" class="btn btn-primary" style="flex:2;">Au Planning</button>
      </div>
    </div>
  `;
};

window.renderScheduledRepairs = function () {
  if (window.state.scheduledRepairs.length === 0) {
    window.elements.scheduledRepairsContainer.innerHTML = `<div class="text-center text-muted" style="margin: auto; padding-top:40px;"><i class="fa-solid fa-clipboard-list" style="font-size:32px; margin-bottom:8px;"></i><p>Aucune intervention</p></div>`;
    window.elements.repairCount.textContent = "0";
    return;
  }
  window.elements.repairCount.textContent = window.state.scheduledRepairs.length;
  window.elements.scheduledRepairsContainer.innerHTML = window.state.scheduledRepairs.map((repair, index) => `
    <div class="repair-card">
      <input type="text" class="input-standard" style="margin-bottom:8px;" maxlength="20" placeholder="Nom du produit ou cas" value="${_esc(repair.productName||'')}" oninput="updateProductName(${index}, this)">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h4 style="margin:0; font-size:14px;">${repair.modelName}</h4>
          <p class="text-muted" style="font-size:11px; margin-top:2px;">${repair.partsNames}</p>
        </div>
        <div style="text-align:right;">
          <div class="font-mono font-bold ${repair.status === 'rip' ? 'text-blue' : ''}" style="font-size:18px;">${repair.totalTime}m</div>
          ${repair.status === 'rip' ? '<span style="background:var(--apple-blue); color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">RIP</span>' : ''}
        </div>
      </div>
      <div style="display:flex; gap:6px; margin-top:12px; justify-content:flex-end;">
         ${repair.status !== 'rip' 
           ? `<button onclick="markAsRIP(${index})" class="btn btn-icon"><i class="fa-solid fa-wrench"></i></button>`
           : `<button onclick="unmarkRIP(${index})" class="btn btn-icon" style="color:var(--apple-blue);"><i class="fa-solid fa-check"></i></button>`}
         <button onclick="showScheduledRepairDetails(${index})" class="btn btn-icon"><i class="fa-solid fa-circle-info"></i></button>
         <button onclick="removeRepair(${index})" class="btn btn-icon" style="color:var(--apple-red);"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
};
