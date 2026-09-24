// Global DOM Elements (found after DOMContentLoaded)
let repairToggleBtn, repairRow, overlayButtonsGlobal, repairBackBtn;
let currentIndex = 0;
let currentRotation = 0;
let images = [];
let imageTitles = [];
let componentOverrideTitle = null;
let repairParts = [];
let repairPartIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Synchronize local data from injected window properties
    images = window.injectedImages || [];
    imageTitles = window.injectedTitles || [];
    repairParts = Array.from(document.querySelectorAll('.repair-btn'))
        .map(b => b.getAttribute('aria-label')).filter(Boolean);
    
    repairToggleBtn = document.getElementById('repair-toggle-btn');
    repairRow = document.getElementById('repairRow');
    overlayButtonsGlobal = document.querySelector('.overlay-buttons');
    repairBackBtn = document.getElementById('repairBackBtn');

    if (repairToggleBtn && repairRow) {
        repairToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = repairRow.classList.contains('active');
            closeAllToolRows();
            if (!isOpen) {
                repairRow.classList.add('active');
                if (overlayButtonsGlobal) overlayButtonsGlobal.classList.add('repair-mode');
            } else {
                if (overlayButtonsGlobal) overlayButtonsGlobal.classList.remove('repair-mode');
            }
        });
    }

    if (repairBackBtn) {
        repairBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (repairRow) repairRow.classList.remove('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.remove('repair-mode');
            const prereq = document.getElementById('prereq-container');
            if (prereq) prereq.style.display = 'none';
        });
    }

    // Tools Toggle
    const toolsBtn = document.getElementById('toolsBtn');
    const toolsRow = document.getElementById('toolsRow');
    const toolsBackBtn = document.getElementById('toolsBackBtn');
    if (toolsBtn && toolsRow) {
        toolsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = toolsRow.classList.contains('active');
            closeAllToolRows();
            if (!isOpen) {
                toolsRow.classList.add('active');
                if (overlayButtonsGlobal) overlayButtonsGlobal.classList.add('tools-mode');
            }
        });
    }
    if (toolsBackBtn) {
        toolsBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (toolsRow) toolsRow.classList.remove('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.remove('tools-mode');
        });
    }

    // Screw Types Toggle
    const screwsBtn = document.getElementById('screwsBtn');
    const screwTypesRow = document.getElementById('screwTypesRow');
    const screwTypesBackBtn = document.getElementById('screwTypesBackBtn');
    if (screwsBtn && screwTypesRow) {
        screwsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllToolRows();
            screwTypesRow.classList.add('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.add('screws-mode');
        });
    }
    if (screwTypesBackBtn) {
        screwTypesBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (screwTypesRow) screwTypesRow.classList.remove('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.remove('screws-mode');
            if (toolsRow) toolsRow.classList.add('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.add('tools-mode');
        });
    }

    // Screwdriver Torques Toggle
    const screwdriversBtn = document.getElementById('screwdriversBtn');
    const screwdriverTypesRow = document.getElementById('screwdriverTypesRow');
    const screwdriverTypesBackBtn = document.getElementById('screwdriverTypesBackBtn');
    if (screwdriversBtn && screwdriverTypesRow) {
        screwdriversBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllToolRows();
            screwdriverTypesRow.classList.add('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.add('screws-mode');
        });
    }
    if (screwdriverTypesBackBtn) {
        screwdriverTypesBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (screwdriverTypesRow) screwdriverTypesRow.classList.remove('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.remove('screws-mode');
            if (toolsRow) toolsRow.classList.add('active');
            if (overlayButtonsGlobal) overlayButtonsGlobal.classList.add('tools-mode');
        });
    }

    // Plateau button initialization
    const plateauBtn = document.querySelector('.icon-custom[data-plateau]');
    const plateauModal = document.getElementById('plateauModal');
    const plateauImage = document.getElementById('plateauImage');
    const closePlateauBtn = document.getElementById('closePlateau');

    if (plateauBtn) {
        const plateauSrc = plateauBtn.getAttribute('data-plateau');
        if (plateauSrc) {
            plateauBtn.classList.add('has-plateau');

            plateauBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (plateauModal && plateauImage) {
                    plateauImage.src = plateauSrc;
                    plateauModal.classList.add('active');
                }
            });
        }
    }

    if (closePlateauBtn && plateauModal) {
        closePlateauBtn.addEventListener('click', () => {
            plateauModal.classList.remove('active');
            if (plateauImage) plateauImage.src = '';
        });
    }

    if (plateauModal) {
        plateauModal.addEventListener('click', (e) => {
            if (e.target === plateauModal) {
                plateauModal.classList.remove('active');
                if (plateauImage) plateauImage.src = '';
            }
        });
    }

    // Initialize Notes Modal logic
    const notesModal = document.getElementById('notesModal');
    const closeNotesBtn = document.getElementById('closeNotesModal');
    if (closeNotesBtn && notesModal) {
        closeNotesBtn.addEventListener('click', () => {
            notesModal.classList.remove('active');
        });
    }

    // Hamburger Menu Handlers
    const hamburgerButton = document.getElementById('hamburgerButton');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuButton = document.getElementById('closeMenu');

    if (hamburgerButton && hamburgerMenu) {
        hamburgerButton.addEventListener('click', () => {
            hamburgerMenu.classList.add('open');
            if (menuOverlay) menuOverlay.classList.add('open');
            document.body.classList.add('menu-open');
        });
    }

    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', () => {
            if (hamburgerMenu) hamburgerMenu.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            if (hamburgerMenu) hamburgerMenu.classList.remove('open');
            menuOverlay.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    }

    // Language button initial state - sync UI with currentLanguage
    setLanguage(currentLanguage);

    // Notes button (open)
    const noteBtn = document.querySelector('.icon-note');
    if (noteBtn) noteBtn.addEventListener('click', openNotesModal);

    // Notes combinées (mode +) — la carte « + » est créée par
    // generateNotesCards et se câble via plusCard.onclick
    const combineCopyBtn = document.getElementById('combineCopy');
    if (combineCopyBtn) combineCopyBtn.addEventListener('click', copyCombinedNote);
    const combineClearBtn = document.getElementById('combineClear');
    if (combineClearBtn) combineClearBtn.addEventListener('click', () => {
        combineSelection = [];
        updateCombineUI();
        generateNotesCards();
    });

    // Title click to return to grid
    const mainTitle = document.querySelector('.title');
    if (mainTitle) {
        mainTitle.addEventListener('click', () => {
            const componentGrid = document.getElementById('componentGrid');
            const hasGrid = componentGrid && componentGrid.children.length > 0 &&
                          !componentGrid.innerHTML.includes('COMPONENT_GRID_PLACEHOLDER');
            if (hasGrid) {
                try{history.pushState(null, '', window.location.pathname + window.location.search)}catch(e){}
                switchView('grid');
            }
        });
    }

    // Initialize state on load
    handleHashChange();
});

let activePrereqPart = null;

function showPrereqPopover(prereqs, event) {
    if (event) event.stopPropagation();
    const popover = document.getElementById('prereq-container');
    if (!popover) return;

    // Use absolute positioning for the guide popover
    if (event && event.target && event.target.id === 'guidePrereqBadge') {
        const rect = event.target.getBoundingClientRect();
        popover.style.display = 'block';
        popover.style.position = 'fixed';
        popover.style.left = (rect.left - 100) + 'px';
        popover.style.top = (rect.bottom + 10) + 'px';
        popover.style.width = '240px';
    } else {
        popover.style.display = 'flex';
        popover.style.position = 'absolute';
    }

    let html = '<div class="prereq-title">Prérequis</div>';
    prereqs.forEach(req => {
        html += `<span class="prereq-message">${req}</span>`;
    });
    popover.innerHTML = html;
}

function selectRepairPart(partName) {
    const prereqContainer = document.getElementById('prereq-container');
    const diagramSection = document.getElementById('diagramSection');

    // 1. Navigation Logic (restore linking) - Use live window properties
    const imagesArray = window.injectedImages || [];
    const titlesArray = window.injectedTitles || [];

    if (imagesArray.length > 0 && titlesArray.length > 0) {
        // Find matching diagram index
        let targetIndex = titlesArray.findIndex(title =>
            title.toLowerCase() === partName.toLowerCase() ||
            title.toLowerCase().includes(partName.toLowerCase()) ||
            partName.toLowerCase().includes(title.toLowerCase())
        );

        // Fallback for security screws
        const securityKeywords = ['pentalobe', 'torx', 'vis', 'screw', 'security', 'minuit', 'stellaire', 'sidéral', 'pacifique', 'titane', 'argent', 'bleu', 'orange', 'mauve', 'jaune', 'vert'];
        if (targetIndex === -1 && securityKeywords.some(kw => partName.toLowerCase().includes(kw))) {
            targetIndex = titlesArray.findIndex(title => title.toLowerCase() === 'enclosure' || title.toLowerCase().includes('enclosure'));
        }

        if (targetIndex !== -1) {
            // Navigate directly (same pattern as component card clicks)
            currentIndex = targetIndex;
            try{history.pushState(null, '', '#img=' + targetIndex)}catch(e){}
            switchView('diagram');
        }
    }

    // 2. Prerequisites Toggle Logic
    if (!prereqContainer) return;

    // Toggle off if clicking the same part
    if (activePrereqPart === partName && prereqContainer.style.display === 'flex') {
        prereqContainer.style.display = 'none';
        activePrereqPart = null;
        return;
    }

    activePrereqPart = partName; // Set new active part
    prereqContainer.innerHTML = '';

    // Check both injected and local data
    const localPartData = window.repairDependencyData || {};
    const partInfo = localPartData[partName];
    
    if (!partInfo) {
        // If no info, just close the container
        prereqContainer.style.display = 'none';
        return;
    }

    const reqs = partInfo.prerequisites || [];

    if (reqs.length === 0) {
        let html = `<span class="prereq-message">Aucun prérequis.</span>`;
        if (partInfo.note) {
            html += `<div style="width: 100%; height: 8px;"></div><span class="prereq-message" style="font-weight: 400; font-size: 13px; color: #555;">${partInfo.note}</span>`;
        }
        prereqContainer.innerHTML = html;
    } else {
        let html = '<div class="prereq-title">Prérequis (Retirer d\'abord)</div> ';
        reqs.forEach(req => {
            html += `<span class="prereq-message">${req}</span>`;
        });
        if (partInfo.note) {
            html += `<div style="width: 100%; height: 8px;"></div><div class="prereq-title">Note</div><span class="prereq-message" style="font-weight: 400; font-size: 13px; color: #555;">${partInfo.note}</span>`;
        }
        prereqContainer.innerHTML = html;
    }

    prereqContainer.style.display = 'flex';
}

// Map component names to bilingual repair data
const repairData = {
    'Display': {
        en: `- Display replaced\nDisplay added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nCamera diags\n  : 20 mins left`,
        fr: `- Écran remplacé\nÉcran ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags caméra\n  : 20 min restantes`
    },
    'Back Glass': {
        en: `- Back Glass replaced\nBack Glass added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nCamera diags\n  : 20 mins left`,
        fr: `- Vitre arrière remplacée\nVitre arrière ajoutée aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags caméra\n  : 20 min restantes`
    },
    'Battery': {
        en: `- Battery replaced\nBattery added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\n  : 20 mins left`,
        fr: `- Batterie remplacée\nBatterie ajoutée aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\n  : 20 min restantes`
    },
    'Rear Camera': {
        en: `- Rear Camera replaced\nCamera added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nCamera diags\n  : 20 mins left`,
        fr: `- Caméra arrière remplacée\nCaméra ajoutée aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags caméra\n  : 20 min restantes`
    },
    'TrueDepth Camera': {
        en: `- TrueDepth Camera replaced\nCamera added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nCamera diags\n  : 20 mins left`,
        fr: `- Caméra TrueDepth remplacée\nCaméra ajoutée aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags caméra\n  : 20 min restantes`
    },
    'Top Speaker': {
        en: `- Top Speaker replaced\nSpeaker added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nAudio Diags\n  : 20 mins left`,
        fr: `- Haut-parleur supérieur remplacé\nHaut-parleur ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags audio\n  : 20 min restantes`
    },
    'Bottom Speaker': {
        en: `- Bottom Speaker replaced\nSpeaker added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nAudio Diags\n  : 20 mins left`,
        fr: `- Haut-parleur inférieur remplacé\nHaut-parleur ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags audio\n  : 20 min restantes`
    },
    'Taptic Engine': {
        en: `- Taptic Engine replaced\nTaptic Engine added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\n  : 20 mins left`,
        fr: `- Taptic Engine remplacé\nTaptic Engine ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\n  : 20 min restantes`
    },
    'Main Microphone': {
        en: `- Main Microphone replaced\nMicro added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nAudio Diags\nPost Repair diags\n  : 20 mins left`,
        fr: `- Micro principal remplacé\nMicro ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags audio\nDiags post-réparation\n  : 20 min restantes`
    },
    'Logic Board': {
        en: `- Logic Board replaced\nBoard added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\n  : 20 mins left`,
        fr: `- Carte logique remplacée\nCarte ajoutée aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\n  : 20 min restantes`
    },
    'Rear System': {
        en: `- Rear System replaced\nRear System added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\n  : 20 mins left`,
        fr: `- Système arrière remplacé\nSystème ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\n  : 20 min restantes`
    },
    'Enclosure': {
        en: `- Enclosure replaced\nEnclosure added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\nAudio Diags\nCamera diags\n  : 20 mins left`,
        fr: `- Boîtier remplacé\nBoîtier ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\nDiags audio\nDiags caméra\n  : 20 min restantes`
    },
    'Mid System': {
        en: `- Mid System replaced\nMid System added to parts used\nNew adhesive pressed\nDevice closed and pressed\nScrewed security screws\n\nTest Needed\nConfiguration system\nPost Repair diags\n  : 20 mins left`,
        fr: `- Système central remplacé\nSystème central ajouté aux pièces utilisées\nNouvel adhésif posé\nAppareil fermé et pressé\nVis de sécurité vissées\n\nTest Requis\nConfiguration système\nDiags post-réparation\n  : 20 min restantes`
    },
    'Post Diags OK': {
        en: `Post-Repair Diagnostics: PASSED\nAll functional tests successful\nSystem Configuration complete\nDevice ready for customer pickup.`,
        fr: `Diagnostics post-réparation : RÉUSSIS\nTous les tests fonctionnels ont réussi\nConfiguration système terminée\nAppareil prêt pour le client.`
    },
    'Post Diags Failed': {
        en: `Post-Repair Diagnostics: FAILED\nIssue detected during final testing\nFurther isolation required\nEscalating to lead technician.`,
        fr: `Diagnostics post-réparation : ÉCHEC\nProblème détecté lors des tests finaux\nIsolation supplémentaire requise\nEscalade vers le technicien référent.`
    }
};

const translations = {
    en: {
        modalTitle: 'Repair Notes',
        noNotes: 'No notes available.',
        copyToast: 'Copied to clipboard!',
        combineCardLabel: 'Combined note',
        combineBar: 'Combined mode: select <span class="combine-count" id="combineCount">0</span>/3 parts',
        combineCopy: 'Copy combined note',
        combineClear: 'Clear',
        combineLimit: 'Maximum 3 parts',
        combineTitle: 'The browser blocked the combined note'
    },
    fr: {
        modalTitle: 'Notes de Réparation',
        noNotes: 'Aucune note disponible.',
        copyToast: 'Copié dans le presse-papier!',
                combineCardLabel: 'Note combinée',
combineBar: 'Mode combiné : sélectionne <span class="combine-count" id="combineCount">0</span>/3 pièces',
        combineCopy: 'Copier la note combinée',
        combineClear: 'Effacer',
        combineLimit: 'Maximum 3 pièces',
        combineLimitMsg: 'Maximum 3 pièces',
        combineTitle: 'Note combinée'
    }
};

let currentLanguage = localStorage.getItem('notesLanguage') || 'fr';

function setLanguage(lang, event) {
    if (event) event.stopPropagation();
    currentLanguage = lang;
    localStorage.setItem('notesLanguage', lang);
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === (lang === 'en' ? 'langBtnEn' : 'langBtnFr'));
    });
    
    // Update modal title
    const titleEl = document.querySelector('.notes-modal-title');
    if (titleEl && translations[lang]) titleEl.textContent = translations[lang].modalTitle;
    
    // Update disclaimer if needed (optional, but good for consistency)
    const disclaimer = document.querySelector('.notes-disclaimer strong');
    if (disclaimer) disclaimer.textContent = lang === 'en' ? 'Note: ' : 'Note : ';
    
    if (document.getElementById('notesModal').classList.contains('active')) {
        generateNotesCards();
        updateCombineUI();
        const combineCopyBtn = document.getElementById('combineCopy');
        if (combineCopyBtn) {
            const tr = (typeof translations !== 'undefined' ? translations[currentLanguage] : null) || {};
            combineCopyBtn.textContent = tr.combineCopy || combineCopyBtn.textContent;
        }
        const combineClearBtn = document.getElementById('combineClear');
        if (combineClearBtn) {
            const tr = (typeof translations !== 'undefined' ? translations[currentLanguage] : null) || {};
            combineClearBtn.textContent = tr.combineClear || combineClearBtn.textContent;
        }
        generateNotesCards();
    }
}

const getSquareIconPath = (path) => {
    const isGuide = window.location.pathname.includes('/guides/');
    return (isGuide ? '../' : '') + 'icons_repair/square/' + path;
};

// Large icons for overlay/main buttons (icons_repair/ root, not square/)
const getIconPath = (path) => {
    const isGuide = window.location.pathname.includes('/guides/');
    return (isGuide ? '../' : '') + 'icons_repair/' + path;
};

// Springboard icons — square format (icons_repair/square/)
const componentIcons = {
    'Display': getSquareIconPath('Display.svg'),
    'Back Glass': getSquareIconPath('Back_Glass.svg'),
    'Battery': getSquareIconPath('Battery.svg'),
    'Camera': getSquareIconPath('Camera.svg'),
    'Rear Camera': getSquareIconPath('Camera.svg'),
    'TrueDepth Camera': getSquareIconPath('True_Depth.svg'),
    'True Depth': getSquareIconPath('True_Depth.svg'),
    'Top Speaker': getSquareIconPath('Top_Speaker.svg'),
    'Bottom Speaker': getSquareIconPath('Bottom_Speaker.svg'),
    'Speaker': getSquareIconPath('Top_Speaker.svg'),
    'Taptic Engine': getSquareIconPath('Taptic_Engine.svg'),
    'Main Microphone': getSquareIconPath('Main_microphone.svg'),
    'Main Mic': getSquareIconPath('Main_microphone.svg'),
    'Aux Mic': getSquareIconPath('Main_microphone.svg'),
    'Logic Board': getSquareIconPath('Logic_Board.svg'),
    'Enclosure': getSquareIconPath('enclosure.svg'),
    'Rear System': getSquareIconPath('Rear_system.svg'),
    'Rear System Module': getSquareIconPath('Rear_system.svg'),
    'Mid System': getSquareIconPath('Mid_system.svg'),
    'Post Diags OK': getIconPath('Post_Diags_OK.svg'),
    'Post Diags Failed': getIconPath('Post_Diags_Failed.svg'),
    'pSIM': getSquareIconPath('enclosure.svg')
};

// Large icons for overlay/main buttons (icons_repair/ root — full-size SVGs)
const componentIconsLarge = {
    'Display': getIconPath('Display.svg'),
    'Back Glass': getIconPath('Back_Glass.svg'),
    'Battery': getIconPath('Battery.svg'),
    'Camera': getIconPath('Camera.svg'),
    'Rear Camera': getIconPath('Camera.svg'),
    'TrueDepth Camera': getIconPath('True_Depth.svg'),
    'True Depth': getIconPath('True_Depth.svg'),
    'Top Speaker': getIconPath('Top_Speaker.svg'),
    'Bottom Speaker': getIconPath('Bottom_Speaker.svg'),
    'Speaker': getIconPath('Top_Speaker.svg'),
    'Taptic Engine': getIconPath('Taptic_Engine.svg'),
    'Main Microphone': getIconPath('Main_microphone.svg'),
    'Main Mic': getIconPath('Main_microphone.svg'),
    'Aux Mic': getIconPath('Main_microphone.svg'),
    'Logic Board': getIconPath('Logic_Board.svg'),
    'Enclosure': getIconPath('enclosure.svg'),
    'Rear System': getIconPath('Rear_system.svg'),
    'Rear System Module': getIconPath('Rear_system.svg'),
    'Mid System': getIconPath('Mid_system.svg'),
    'Post Diags OK': getIconPath('Post_Diags_OK.svg'),
    'Post Diags Failed': getIconPath('Post_Diags_Failed.svg'),
    'pSIM': getIconPath('enclosure.svg')
};

const notesModal = document.getElementById('notesModal');
const closeNotesModalBtn = document.getElementById('closeNotesModal');
const notesGrid = document.getElementById('notesGrid');
const copyToast = document.getElementById('copyToast');

function openNotesModal() {
    if (notesModal) {
        notesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        generateNotesCards();
    }
}

function closeNotesModal() {
    if (notesModal) {
        notesModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// === Notes combinées (mode +) ===
let combineMode = false;
let combineSelection = [];

function toggleCombineMode() {
    combineMode = !combineMode;
    const bar = document.getElementById('combineBar');
    const actions = document.getElementById('combineActions');
    if (bar) bar.classList.toggle('visible', combineMode);
    if (actions) actions.classList.toggle('visible', combineMode);
    combineSelection = [];
    updateCombineUI();
    generateNotesCards();
}


function updateCombineUI() {
    const bar = document.getElementById('combineBar');
    const count = document.getElementById('combineCount');
    if (count) count.textContent = String(combineSelection.length);
    if (bar && window.translations) {
        bar.innerHTML = (typeof translations !== 'undefined' ? (translations[currentLanguage] || {}).combineBar : null) || bar.innerHTML;
    }
}

function generateNotesCards() {
    if (!notesGrid) return;
    notesGrid.innerHTML = '';
    // Carte « + » (note combinée) en tête de grille:
    const plusCard = document.createElement('div');
    plusCard.className = 'notes-card combine-card';
    plusCard.id = 'combineCard';
    if (combineMode) plusCard.classList.add('active');
    plusCard.onclick = toggleCombineMode;
    const plusLabel = (typeof translations !== 'undefined' && translations[currentLanguage]) ? translations[currentLanguage].combineCardLabel : 'Combined note';
    plusCard.innerHTML = `<div class="combine-plus">+</div><div class="notes-card-title">${plusLabel}</div>`;
    notesGrid.appendChild(plusCard);
    const componentsToShow = Object.keys(repairData);
    componentsToShow.forEach(componentName => {
        const card = document.createElement('div');
        card.className = 'notes-card';
        if (combineMode && combineSelection.includes(componentName)) card.classList.add('combine-selected');
        card.onclick = () => {
            if (combineMode) { toggleCombineSelection(componentName); }
            else { copyRepairText(componentName); }
        };
        const iconPath = componentIcons[componentName] || getSquareIconPath('enclosure.svg');
        const displayLabel = componentName.replace(/_/g, ' ');
        card.innerHTML = `<img src="${iconPath}" alt="${displayLabel}" class="notes-card-icon"><div class="notes-card-title">${displayLabel}</div>`;
        notesGrid.appendChild(card);
    });
}

function toggleCombineSelection(componentName) {
    const idx = combineSelection.indexOf(componentName);
    if (idx > -1) {
        combineSelection.splice(idx, 1);
    } else {
        if (combineSelection.length >= 3) {
            const tr = (typeof translations !== 'undefined' ? translations[currentLanguage] : null) || {};
            showToastMsg(tr.combineLimitMsg || 'Maximum 3 pièces');
            return;
        }
        combineSelection.push(componentName);
    }
    updateCombineUI();
    generateNotesCards();
}

// Parse une note en segments réutilisables:
function parseNoteSegments(text) {
    const lines = text.split('\n');
    return {
        replaced: lines[0] || '',
        added: lines[1] || '',
        diags: lines.map(l => l.trim()).filter(l =>
            l.startsWith('Diags ') || l === 'Post Repair diags' ||
            l === 'Audio Diags' || l === 'Camera diags')
    };
}

// Ordre canonique des diags dans une note combinée:
const COMBINE_DIAG_ORDER_FR = ['Diags post-réparation', 'Diags audio', 'Diags caméra'];
const COMBINE_DIAG_ORDER_EN = ['Post Repair diags', 'Audio Diags', 'Camera diags'];
const COMBINE_SHARED = {
    fr: ['Nouvel adhésif posé', 'Appareil fermé et pressé', 'Vis de sécurité vissées', 'Test Requis', 'Configuration système'],
    en: ['New adhesive pressed', 'Device closed and pressed', 'Screwed security screws', 'Test Needed', 'Configuration system']
};

function buildCombinedNote(names, lang) {
    const shared = COMBINE_SHARED[lang];
    const diagOrder = lang === 'fr' ? COMBINE_DIAG_ORDER_FR : COMBINE_DIAG_ORDER_EN;
    const lines = [];
    names.forEach(n => {
        const entry = repairData[n];
        if (!entry) return;
        const seg = parseNoteSegments(entry[lang] || entry['en']);
        lines.push(seg.replaced, seg.added);
    });
    lines.push(...shared.slice(0, 3));
    lines.push('');
    lines.push(shared[3], shared[4]);
    const diags = [];
    names.forEach(n => {
        const entry = repairData[n];
        if (!entry) return;
        const seg = parseNoteSegments(entry[lang] || entry['en']);
        seg.diags.forEach(d => { if (!diags.includes(d)) diags.push(d); });
    });
    diags.sort((x, y) => {
        const ix = diagOrder.indexOf(x), iy = diagOrder.indexOf(y);
        return (ix === -1 ? 99 : ix) - (iy === -1 ? 99 : iy);
    });
    lines.push(...diags);
    lines.push(lang === 'fr' ? '  : 20 min restantes' : '  : 20 mins left');
    return lines.join('\n');
}

async function copyCombinedNote() {
    if (combineSelection.length < 2) return;
    const text = buildCombinedNote(combineSelection, currentLanguage);
    try {
        await navigator.clipboard.writeText(text);
        showCopyToast();
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyToast();
    }
}

function showToastMsg(msg) {
    if (!copyToast) return;
    const toastSpan = copyToast.querySelector('span');
    if (toastSpan) toastSpan.textContent = msg;
    copyToast.classList.add('show');
    setTimeout(() => copyToast.classList.remove('show'), 2000);
}

async function copyRepairText(componentName) {
    const entry = repairData[componentName];
    if (!entry) return;
    const repairText = entry[currentLanguage] || entry['en'];
    try {
        await navigator.clipboard.writeText(repairText);
        showCopyToast();
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = repairText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyToast();
    }
}

function showCopyToast() {
    if (!copyToast) return;
    const toastSpan = copyToast.querySelector('span');
    if (toastSpan) toastSpan.textContent = translations[currentLanguage].copyToast;
    copyToast.classList.add('show');
    setTimeout(() => copyToast.classList.remove('show'), 2000);
}

// Hash Handling
function handleHashChange() {
    const hash = window.location.hash;
    const isImageSelection = hash.startsWith('#img=');
    const componentGrid = document.getElementById('componentGrid');
    
    // Check if we have a functional grid (not just placeholder)
    const hasGrid = componentGrid && componentGrid.children.length > 0 && 
                  !componentGrid.innerHTML.includes('COMPONENT_GRID_PLACEHOLDER');

    if (isImageSelection) {
        const index = parseInt(hash.substring(5));
        const imagesArray = window.injectedImages || [];
        
        if (!isNaN(index) && index >= 0 && index < imagesArray.length) {
            currentIndex = index;
            // Always switch to diagram view when an image is selected
            switchView('diagram');
        }
    } else if (hash && hash.length > 1) {
        // Support direct component name hashes (e.g. #Logic-Board or #Logic%20Board)
        const name = decodeURIComponent(hash.substring(1)).replace(/[-_]/g, ' ');
        const titlesArray = window.injectedTitles || [];
        const index = titlesArray.findIndex(t => t.toLowerCase() === name.toLowerCase() || t.toLowerCase().includes(name.toLowerCase()));
        
        if (index !== -1) {
            currentIndex = index;
            switchView('diagram');
        } else if (hasGrid) {
            switchView('grid');
        }
    } else if (hasGrid) {
        // No hash and has grid -> Show Grid
        switchView('grid');
    } else {
        // No grid (single image model) -> Show Diagram by default
        switchView('diagram');
    }
}

window.addEventListener('hashchange', handleHashChange);

// Direct click handler on component cards (more reliable than hashchange in file:// context)
document.addEventListener('click', (e) => {
    const card = e.target.closest('.component-card');
    if (!card) return;

    const href = card.getAttribute('href') || '';
    const match = href.match(/#img=(\d+)/);
    if (!match) return;

    e.preventDefault(); // Prevent default anchor navigation

    const index = parseInt(match[1]);
    const imagesArray = window.injectedImages || [];

    if (!isNaN(index) && index >= 0 && index < imagesArray.length) {
        componentOverrideTitle = card.querySelector('.component-card-title')?.textContent?.trim() || null;
        const cards = Array.from(document.querySelectorAll('.component-card'));
        const cardIdx = cards.indexOf(card);
        if (cardIdx >= 0 && cardIdx < repairParts.length) repairPartIndex = cardIdx;
        currentIndex = index;
        // Update URL without triggering hashchange (to avoid double call)
        try{history.pushState(null, '', '#img=' + index)}catch(e){}
        switchView('diagram');
    }
});

// Hamburger Menu Toggle Handlers
function toggleSubmenu(event, element) {
    if (event) event.stopPropagation();
    const wrapper = element.closest('.dropdown-item-wrapper');
    if (!wrapper) return;
    
    const submenu = wrapper.querySelector('.submenu');
    const toggle = wrapper.querySelector('.submenu-toggle');
    
    if (submenu) {
        submenu.classList.toggle('open');
        if (toggle) toggle.classList.toggle('rotated');
    }
}

// Add global listener for hamburger menu dropdowns
document.addEventListener('click', (e) => {
    const header = e.target.closest('.hamburger-menu .dropdown-header');
    if (header) {
        const dropdown = header.closest('.dropdown');
        if (dropdown) {
            dropdown.classList.toggle('open');
        }
    }
});

// Close prereq popover on outside click
document.addEventListener('click', (e) => {
    const container = document.getElementById('prereq-container');
    if (!container || !container.style.display || container.style.display === 'none') return;
    if (e.target.closest('#prereq-container')) return;
    container.style.display = 'none';
    activePrereqPart = null;
});

// View Switching (Grid vs Diagram vs Guide)
let currentView = 'grid';

function switchView(view) {
    const componentGrid = document.getElementById('componentGrid');
    const diagramSection = document.getElementById('diagramSection');
    const guideContainer = document.getElementById('guideContainer');
    const viewToggle = document.getElementById('viewToggle');
    const overlayButtons = document.querySelector('.overlay-buttons');
    const diagramBtn = document.getElementById('diagramBtn');
    const guideBtn = document.getElementById('guideBtn');
    const imageTitle = document.querySelector('.image-title');
    const subtitleContainer = document.getElementById('subtitleContainer');
    const prevComponentBtn = document.getElementById('prevComponentBtn');
    const nextComponentBtn = document.getElementById('nextComponentBtn');

    currentView = view;

    // Always auto-scroll to top when switching view
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Component grid is controlled by body.view-active via CSS (display:grid by default, hidden in view-active state)
    // Diagram and guide containers are controlled by their .active class (display:none by default)
    if (diagramSection) diagramSection.classList.toggle('active', view === 'diagram');
    if (guideContainer) guideContainer.classList.toggle('active', view === 'guide');
    
    // Toggle overall view visibility state
    if (view === 'grid') {
        document.body.classList.remove('view-active');
        if (viewToggle) viewToggle.style.display = 'none';
        if (imageTitle) imageTitle.style.display = 'none';
        if (subtitleContainer) subtitleContainer.style.display = 'none';
        if (overlayButtons) overlayButtons.style.display = 'none';
        
        // Reset navigation visibility
        if (prevComponentBtn) prevComponentBtn.classList.remove('show-in-guide');
        if (nextComponentBtn) nextComponentBtn.classList.remove('show-in-guide');
        
        // Clear hash to allow re-selection
        if (window.location.hash && !window.location.hash.includes('grid')) {
            try{history.pushState("", document.title, window.location.pathname + window.location.search)}catch(e){}
        }
    } else {
        document.body.classList.add('view-active');
        document.body.classList.toggle('guide-view-active', view === 'guide');
        if (viewToggle) viewToggle.style.display = 'flex';
        if (imageTitle) imageTitle.style.display = 'block';
        if (subtitleContainer) subtitleContainer.style.display = 'flex';
        
        // Update toggle button states
        if (diagramBtn) diagramBtn.classList.toggle('active', view === 'diagram');
        if (guideBtn) guideBtn.classList.toggle('active', view === 'guide');

        if (view === 'diagram') {
            if (overlayButtons) overlayButtons.style.display = 'flex';
            if (prevComponentBtn) prevComponentBtn.classList.remove('show-in-guide');
            if (nextComponentBtn) nextComponentBtn.classList.remove('show-in-guide');
            if (typeof updateImage === 'function') updateImage();
        } else {
            if (overlayButtons) overlayButtons.style.display = 'none';
            const hasMultiple = (window.injectedImages || []).length > 1;
            if (prevComponentBtn) prevComponentBtn.classList.toggle('show-in-guide', hasMultiple);
            if (nextComponentBtn) nextComponentBtn.classList.toggle('show-in-guide', hasMultiple);
            if (typeof initGuide === 'function') initGuide();
        }
    }
}

// Diagram Controls
function updateImage() {
    const img = document.getElementById('diagramImage');
    const title = document.querySelector('.image-title');
    if (!img || images.length === 0) return;

    const newSrc = images[currentIndex];
    const currentSrc = img.getAttribute('src');

    // Helper for side effects that should happen regardless of image change
    const updateSideEffects = () => {
        const repairToggleContainer = document.getElementById('repair-toggle-container');
        const smartRepairContainer = document.getElementById('smart-repair-container');
        const isMultiImage = (images && images.length > 1);

        let currentTitle = '';
        if (title) {
            currentTitle = componentOverrideTitle || imageTitles[currentIndex] || '';
            componentOverrideTitle = null;
            title.textContent = currentTitle;
            // loadGuide needs English key — use imageTitles (multi-image) or repairParts (single)
            const guideKey = isMultiImage
                ? (imageTitles[currentIndex] || currentTitle)
                : (repairParts[repairPartIndex] || currentTitle);
            if (typeof loadGuide === 'function') loadGuide(guideKey);
        }

        // Always hide repair-toggle; show smart button with current component
        if (repairToggleContainer) repairToggleContainer.style.display = 'none';
        if (smartRepairContainer) {
            const rawTitle = isMultiImage ? (imageTitles[currentIndex] || currentTitle) : (repairParts[repairPartIndex] || '');
            const titleForBtn = (componentIconsLarge[rawTitle] || componentIcons[rawTitle]) ? rawTitle : (repairParts[repairPartIndex] || rawTitle);
            const iconPath = componentIconsLarge[titleForBtn] || componentIcons[titleForBtn];
            if (iconPath && titleForBtn) {
                smartRepairContainer.style.display = 'block';
                smartRepairContainer.innerHTML = '';
                const smartBtn = document.createElement('button');
                smartBtn.className = 'overlay-button toggle-mode-btn smart-repair-btn';
                smartBtn.innerHTML = `<img src="${iconPath}" alt="${titleForBtn}" class="repair-toggle-icon"><span class="tool-btn-label">${titleForBtn}</span>`;
                smartBtn.onclick = (e) => { e.stopPropagation(); selectRepairPart(titleForBtn); };
                smartRepairContainer.appendChild(smartBtn);
            } else {
                smartRepairContainer.style.display = 'none';
            }
        }

        updateNavIndicators();
    };

    // If the image is the same, just update rotation and labels (no flicker/fade)
    if (currentSrc === newSrc) {
        img.style.transform = `rotate(${currentRotation}deg)`;
        updateSideEffects();
        return;
    }

    // If new image, use the fade transition
    if (img._fadeTimer) clearTimeout(img._fadeTimer);
    img.style.opacity = '0';
    img._fadeTimer = setTimeout(() => {
        img.src = newSrc;
        img.style.transform = `rotate(${currentRotation}deg)`;
        updateSideEffects();
        img.style.opacity = '1';
    }, 150);
}

function cycleRepairPart(dir) {
    if (repairParts.length === 0) return;
    repairPartIndex = (repairPartIndex + dir + repairParts.length) % repairParts.length;
    const name = repairParts[repairPartIndex];
    const title = document.querySelector('.image-title');
    if (title) title.textContent = name;
    const repairToggleContainer = document.getElementById('repair-toggle-container');
    const smartRepairContainer = document.getElementById('smart-repair-container');
    if (repairToggleContainer) repairToggleContainer.style.display = 'none';
    if (smartRepairContainer) {
        const iconPath = componentIconsLarge[name] || componentIcons[name];
        if (iconPath) {
            smartRepairContainer.style.display = 'block';
            smartRepairContainer.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'overlay-button toggle-mode-btn smart-repair-btn';
            btn.innerHTML = `<img src="${iconPath}" alt="${name}" class="repair-toggle-icon"><span class="tool-btn-label">${name}</span>`;
            btn.onclick = (e) => { e.stopPropagation(); selectRepairPart(name); };
            smartRepairContainer.appendChild(btn);
        } else {
            smartRepairContainer.style.display = 'none';
        }
    }
}

document.querySelector('.icon-prev')?.addEventListener('click', () => {
    if (images.length > 1) { currentIndex = (currentIndex - 1 + images.length) % images.length; updateImage(); }
    else cycleRepairPart(-1);
});

document.querySelector('.icon-next')?.addEventListener('click', () => {
    if (images.length > 1) { currentIndex = (currentIndex + 1) % images.length; updateImage(); }
    else cycleRepairPart(1);
});

document.getElementById('prevComponentBtn')?.addEventListener('click', () => {
    if (typeof images === 'undefined' || images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
});

document.getElementById('nextComponentBtn')?.addEventListener('click', () => {
    if (typeof images === 'undefined' || images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
});

document.querySelector('.icon-rotate')?.addEventListener('click', () => {
    currentRotation = (currentRotation + 90) % 360;
    const img = document.getElementById('diagramImage');
    if (img) img.style.transform = `rotate(${currentRotation}deg)`;
});

// Indicators
let navDots = [];

function initNavIndicators() {
    const container = document.getElementById('navIndicators');
    if (!container || images.length <= 1) return;
    container.innerHTML = '';
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'nav-dot' + (index === currentIndex ? ' active' : '');
        dot.onclick = () => goToImage(index);
        container.appendChild(dot);
    });
    navDots = Array.from(container.querySelectorAll('.nav-dot'));
}

function updateNavIndicators() {
    navDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function goToImage(index) {
    currentIndex = index;
    updateImage();
}

// Fullscreen
const fullscreenModal = document.getElementById('fullscreenModal');
let fullscreenImage = document.getElementById('fullscreenImage');

function openFullscreen() {
    if (!fullscreenModal || !fullscreenImage) return;
    fullscreenImage.src = images[currentIndex];
    fullscreenImage.style.transform = `rotate(${currentRotation}deg)`;
    fullscreenModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    fullscreenModal?.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelector('.icon-fullscreen')?.addEventListener('click', openFullscreen);
document.getElementById('closeFullscreen')?.addEventListener('click', closeFullscreen);

// Guide Logic
let currentGuideData = null;
let guideCurrentSection = 0;
let guideCurrentStep = 0;

function loadGuide(componentName) {
    const data = window.guideData || guideData;
    if (!data) return;

    let key = componentName;
    
    // Specific Apple Mapping for Database Consistency
    if (key === 'TrueDepth Camera') key = 'Front_Camera';
    if (key === 'Rear System Module') key = 'Rear_System';
    if (key === 'Mid System Module' || key === 'Mid System Board') key = 'Mid_System';

    // Fallback normalization
    if (!data[key]) key = componentName.replace(/ /g, '_');
    if (!data[key]) key = componentName.replace(/_/g, ': ');
    
    if (data[key]) {
        currentGuideData = structuredClone(data[key]);

        // Handle legacy flat array format: wrap in a single Retrait section
        if (Array.isArray(currentGuideData)) {
            currentGuideData = { sections: [{ id: 'retrait', title: 'Retrait', steps: currentGuideData }] };
        }

        guideCurrentSection = 0;
        guideCurrentStep = 0;

        // Update Source Link Visibility and Href
        const sourceLink = document.getElementById('guideSourceLink');
        if (sourceLink) {
            if (currentGuideData.source_url) {
                sourceLink.href = currentGuideData.source_url;
                sourceLink.style.display = 'flex';
            } else {
                sourceLink.style.display = 'none';
            }
        }
        
        initGuide();
    } else {
        currentGuideData = null;
        const sourceLink = document.getElementById('guideSourceLink');
        if (sourceLink) sourceLink.style.display = 'none';
    }
}

function initGuide() {
    const guideContainer = document.getElementById('guideContainer');
    
    if (!currentGuideData) {
        if (guideContainer) guideContainer.style.display = 'none';
        return;
    }

    // Clear any inline 'display: none' that might be present in the HTML template or set previously
    if (guideContainer) guideContainer.style.display = '';

    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) viewToggle.style.display = 'flex';
    
    // Tabs (Retrait / Réassemblage)
    const tabsContainer = document.getElementById('guideSectionTabs');
    if (tabsContainer) {
        tabsContainer.innerHTML = '';
        if (currentGuideData.sections && Array.isArray(currentGuideData.sections)) {
            currentGuideData.sections.forEach((section, idx) => {
                const tab = document.createElement('button');
                tab.className = 'guide-section-tab' + (idx === guideCurrentSection ? ' active' : '');
                tab.innerHTML = `<span class="guide-tab-label">${section.title}</span>`;
                tab.onclick = () => {
                    guideCurrentSection = idx;
                    guideCurrentStep = 0;
                    updateGuideTabs();
                    renderGuideStep();
                };
                tabsContainer.appendChild(tab);
            });
            // Show tabs container if it has content
            tabsContainer.style.display = currentGuideData.sections.length > 1 ? 'flex' : 'none';
        }
    }
    renderGuideStep();
}

function updateGuideTabs() {
    document.querySelectorAll('.guide-section-tab').forEach((tab, idx) => {
        tab.classList.toggle('active', idx === guideCurrentSection);
    });
}

function renderGuideStep() {
    if (!currentGuideData || !currentGuideData.sections) return;
    
    try {
        const section = currentGuideData.sections[guideCurrentSection];
        if (!section) {
            console.warn('renderGuideStep: Section not found');
            return;
        }
        const step = section.steps[guideCurrentStep];
        if (!step) {
            console.warn('renderGuideStep: Step not found');
            return;
        }

        const img = document.getElementById('guideImage');
        const text = document.getElementById('guideText');
        const badge = document.getElementById('guideStepBadge');
        const counter = document.getElementById('guideStepCounter');
        const imgWrapper = document.getElementById('guideSlide');

        if (img) {
            const newSrc = step.image && step.image !== 'null' ? step.image : '';
            const currentSrc = img.getAttribute('src') || '';
            
            if (newSrc && newSrc !== '') {
                // Only update src if it has actually changed to prevent GIF reloads
                if (currentSrc !== newSrc) {
                    img.onload = null;
                    img.src = newSrc;
                }
                img.style.display = 'block';
            } else {
                img.onload = null;
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                img.style.display = 'none';
            }
        }
        
        if (text) {
            if (step.substeps && step.substeps.length > 0) {
                // Intro/special step: show text as intro label, substeps below
                text.textContent = step.text || '';
            } else {
                text.textContent = step.text || '';
            }
        }
        if (badge) {
            if (step.number === 0) {
                badge.innerHTML = `Important`;
                badge.style.background = '#FF9500'; // Orange for intro
            } else {
                badge.innerHTML = `Étape ${step.number || (guideCurrentStep + 1)}`;
                badge.style.background = ''; // Reset to default blue
            }
        }

        // Handle substeps (blue dot list)
        const substepsList = document.getElementById('guideSubsteps');
        if (substepsList) {
            substepsList.innerHTML = '';
            if (step.substeps && step.substeps.length > 0) {
                step.substeps.forEach(sub => {
                    const li = document.createElement('li');
                    if (sub.link_step !== undefined && sub.link_step !== null) {
                        li.innerHTML = `<span class="substep-text">${sub.text}</span> <a href="javascript:void(0)" class="substep-link" onclick="jumpToGuideStep(${sub.link_step})">${sub.link_label || 'Voir →'}</a>`;
                    } else {
                        li.innerHTML = `<span class="substep-text">${sub.text}</span>`;
                    }
                    substepsList.appendChild(li);
                });
                substepsList.style.display = 'block';
            } else {
                substepsList.style.display = 'none';
            }
        }

        // Handle Cross-Component Links
        const crossLinkContainer = document.getElementById('guideCrossLinkContainer');
        if (crossLinkContainer) {
            if (step.link && !step.link.ignore_closing_steps) {
                let href = step.link.url || 'javascript:void(0)';
                crossLinkContainer.innerHTML = `<a href="${href}" class="guide-cross-link">${step.link.text || 'Voir le guide →'}</a>`;
                crossLinkContainer.style.display = 'block';
            } else {
                crossLinkContainer.style.display = 'none';
            }
        }

        // Handle warning display
        const warningEl = document.getElementById('guideWarning');
        if (warningEl) {
            if (step.warning && step.warning !== 'Important' && step.warning !== 'Attention') {
                warningEl.textContent = step.warning;
                warningEl.style.display = 'block';
            } else {
                warningEl.style.display = 'none';
            }
        }

        // Handle Prerequisites Badge in Header
        const header = document.querySelector('.guide-step-header');
        let prereqBadge = document.getElementById('guidePrereqBadge');
        if (header) {
            const prereqs = section.prerequisites || [];
            if (prereqs.length > 0) {
                if (!prereqBadge) {
                    prereqBadge = document.createElement('button');
                    prereqBadge.id = 'guidePrereqBadge';
                    prereqBadge.className = 'guide-prereq-badge';
                    // Inject before the source link
                    const sourceLink = document.getElementById('guideSourceLink');
                    if (sourceLink) header.insertBefore(prereqBadge, sourceLink);
                }
                prereqBadge.textContent = `${prereqs.length} Prérequis`;
                prereqBadge.onclick = (e) => showPrereqPopover(prereqs, e);
                prereqBadge.style.display = 'flex';
            } else if (prereqBadge) {
                prereqBadge.style.display = 'none';
            }
        }

        // Substep Indicators (Blue Dots)
        const pagination = document.getElementById('guideStepPagination');
        if (pagination) {
            pagination.innerHTML = '';
            const total = step.split_total || 1;
            const current = step.split_current || 1;
            
            if (total > 1) {
                pagination.style.display = 'flex';
                for (let i = 1; i <= total; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'pagination-dot' + (i === current ? ' active' : '');
                    pagination.appendChild(dot);
                }
            } else {
                pagination.style.display = 'none';
            }
        }

        const prevBtn = document.getElementById('guidePrev');
        const nextBtn = document.getElementById('guideNext');
        if (prevBtn) prevBtn.style.opacity = guideCurrentStep === 0 ? '0.3' : '1';
        if (nextBtn) nextBtn.style.opacity = guideCurrentStep === section.steps.length - 1 ? '0.3' : '1';
        
    } catch (err) {
        // Silent catch for unexpected UI states
    }
}

function guideNavigate(direction) {
    if (!currentGuideData) return;
    const section = currentGuideData.sections[guideCurrentSection];
    const newStep = guideCurrentStep + direction;
    if (newStep >= 0 && newStep < section.steps.length) {
        guideCurrentStep = newStep;
        renderGuideStep();
    }
}

function jumpToGuideStep(stepNumber) {
    if (!currentGuideData || !currentGuideData.sections) return;
    const section = currentGuideData.sections[guideCurrentSection];
    if (!section || !section.steps) return;
    
    // Find the step index that matches the target step number
    const targetIndex = section.steps.findIndex(s => s.number === stepNumber);
    if (targetIndex !== -1) {
        guideCurrentStep = targetIndex;
        renderGuideStep();
    }
}

// Tool rows
function closeAllToolRows() {
    document.querySelectorAll('.tools-row').forEach(row => row.classList.remove('active'));
    document.querySelector('.overlay-buttons')?.classList.remove('security-mode', 'tools-mode', 'screws-mode', 'repair-mode');
}
