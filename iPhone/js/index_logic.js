// iPhone Index Page Logic
const hamburgerButton = document.getElementById('hamburgerButton');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenuButton = document.getElementById('closeMenu');
const body = document.body;

function openMenu() {
    hamburgerMenu.classList.add('open');
    menuOverlay.classList.add('open');
    body.classList.add('menu-open');
}

function closeMenu() {
    hamburgerMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    body.classList.remove('menu-open');
}

// Event listeners
hamburgerButton.addEventListener('click', openMenu);
closeMenuButton.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

// Dropdown functionality in hamburger menu
document.querySelectorAll('.dropdown').forEach(dropdown => {
    const header = dropdown.querySelector('.dropdown-header');
    if (header) {
        header.addEventListener('click', () => {
            dropdown.classList.toggle('open');
        });
    }
});

// Toggle Submenu Function (Global)
window.toggleSubmenu = function(event, element) {
    event.preventDefault();
    event.stopPropagation();
    const submenu = element.parentElement.nextElementSibling;
    if (submenu) {
        submenu.classList.toggle('open');
        element.classList.toggle('rotated');
    }
};

// Close menu on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburgerMenu.classList.contains('open')) {
        closeMenu();
    }
});

// Prevent body scroll when menu is open
hamburgerMenu.addEventListener('touchmove', (e) => {
    e.stopPropagation();
}, {passive: false});


// === Recherche dans le menu hamburger ===
(function () {
  const input = document.getElementById('menuSearchInput');
  if (!input) return;

  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  input.addEventListener('input', () => {
    const q = norm(input.value.trim());

    // 1. Modèles à sous-menu (wrapper + lien) — série 17 / Air
    document.querySelectorAll('.dropdown-item-wrapper').forEach(w => {
      const link = w.querySelector('.header-dropdown-item-link');
      const name = norm(link ? link.textContent : w.textContent.split('\n')[0]);
      const match = !q || name.includes(q);
      w.dataset.filtered = match ? '1' : '0';
      w.style.display = match ? '' : 'none';
    });

    // 2. Modèles simples (a.dropdown-item direct, hors sous-menus .submenu)
    document.querySelectorAll('a.dropdown-item').forEach(a => {
      if (a.closest('.submenu')) return;
      const name = norm(a.textContent.trim());
      const match = !q || name.includes(q);
      a.dataset.filtered = match ? '1' : '0';
      a.style.display = match ? '' : 'none';
    });

    // 3. Séries: déplier + masquer si aucun modèle correspondant
    document.querySelectorAll('.dropdown').forEach(dd => {
      const visWrappers = [...dd.querySelectorAll('.dropdown-item-wrapper')].filter(w => w.dataset.filtered === '1').length;
      const visItems = [...dd.querySelectorAll('.dropdown-content > a.dropdown-item')].filter(a => a.dataset.filtered === '1').length;
      const visible = visWrappers + visItems;
      if (q) {
        dd.classList.toggle('filtered-out', visible === 0);
        if (visible > 0) dd.classList.add('open');
      } else {
        dd.classList.remove('filtered-out');
      }
    });

    // 4. Sections (Latest/Recent/Previous) sans résultat → masquées
    document.querySelectorAll('.menu-section').forEach(s => {
      const visible = [...s.querySelectorAll('.dropdown')].filter(d => !d.classList.contains('filtered-out')).length;
      s.classList.toggle('filtered-out', q && visible === 0);
    });
  });

  // Reset complet quand on ferme le menu
  const resetSearch = () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
  };
  const closeBtn = document.getElementById('closeMenu');
  if (closeBtn) closeBtn.addEventListener('click', resetSearch);
  const overlay = document.getElementById('menuOverlay');
  if (overlay) overlay.addEventListener('click', resetSearch);
})();
