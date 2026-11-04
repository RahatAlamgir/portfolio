// Light / dark theme toggle.
import { $ } from './dom.js';

const THEME_COLORS = { light: '#fafcfb', dark: '#090d16' };

export function initTheme(ui) {
  const toggle = $('#themeToggle');
  if (!toggle) return;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  toggle.setAttribute('title', ui.themeTitle);

  function render() {
    const isLight = document.body.classList.contains('light');
    toggle.textContent = isLight ? ui.themeIconLight : ui.themeIconDark;
    toggle.setAttribute('aria-label', isLight ? ui.themeToDark : ui.themeToLight);
    if (themeMeta) themeMeta.content = isLight ? THEME_COLORS.light : THEME_COLORS.dark;
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    render();
  });

  render();
}
