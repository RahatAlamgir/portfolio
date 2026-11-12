/* Cross-fade colours when the theme toggles (see .theme-fade in motion.css). */

export function setupThemeFade() {
  new MutationObserver(() => {
    const root = document.documentElement;
    root.classList.add("theme-fade");
    setTimeout(() => root.classList.remove("theme-fade"), 450);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
