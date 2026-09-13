// iPhone Index Page Logic (chargé par index.html — source unique)
document.addEventListener('DOMContentLoaded', () => {
            const hamburgerBtn = document.getElementById('hamburgerButton');
            const closeMenuBtn = document.getElementById('closeMenu');
            const menu = document.getElementById('hamburgerMenu');
            const overlay = document.getElementById('menuOverlay');

            function toggleMenu() {
                menu.classList.toggle('open');
                overlay.classList.toggle('open');
            }

            if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
            if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
            if (overlay) overlay.addEventListener('click', toggleMenu);

            // Dropdown logic for hamburger menu
            document.querySelectorAll('.dropdown-header').forEach(header => {
                header.addEventListener('click', () => {
                    const dropdown = header.parentElement;
                    dropdown.classList.toggle('open');
                });
            });

            // Submenu toggle logic (global for onclick)
            window.toggleSubmenu = function(event, element) {
                event.preventDefault();
                event.stopPropagation();
                const wrapper = element.closest('.dropdown-item-wrapper');
                const submenu = wrapper.querySelector('.submenu');
                if (submenu) {
                    submenu.classList.toggle('open');
                }
            };
        });
    
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
