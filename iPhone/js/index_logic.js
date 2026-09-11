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
