// Mobile menu and the scroll progress bar at the top of the page.
import { $, $$ } from './dom.js';

export function initMobileMenu(ui) {
  const toggle = $('#menuToggle');
  const nav = $('#mobileNav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? ui.menuClose : ui.menuOpen);
    toggle.textContent = open ? ui.menuIconClose : ui.menuIconOpen;
  }

  setOpen(false);
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  $$('a', nav).forEach((link) => link.addEventListener('click', () => setOpen(false)));
}

export function initScrollProgress() {
  const progress = $('#scrollProgress');
  if (!progress) return;

  window.addEventListener(
    'scroll',
    () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      progress.style.width = `${percent}%`;
    },
    { passive: true },
  );
}
