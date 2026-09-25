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
    
