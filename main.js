const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const mobile = window.matchMedia('(max-width: 840px)');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  siteNav.hidden = mobile.matches && !open;
}

function updateNavigation() {
  const toggleHadFocus = document.activeElement === menuToggle;
  const navHadFocus = siteNav.contains(document.activeElement);

  menuToggle.hidden = !mobile.matches;
  setMenu(mobile.matches && navHadFocus);

  if (!mobile.matches && toggleHadFocus) {
    siteNav.querySelector('a').focus();
  }
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') === 'false');
});

siteNav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!mobile.matches || !link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const destination = document.getElementById(link.hash.slice(1));
  setMenu(false);
  destination.focus({ preventScroll: true });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
  setMenu(false);
  menuToggle.focus();
});

document.addEventListener('pointerdown', (event) => {
  if (!header.contains(event.target) && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
  }
});

siteNav.querySelectorAll('a').forEach((link) => {
  document.getElementById(link.hash.slice(1)).tabIndex = -1;
});

mobile.addEventListener('change', updateNavigation);
updateNavigation();
document.documentElement.classList.add('has-menu');
