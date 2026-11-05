/* Light / dark theme toggle. The choice is saved in localStorage. */

import { $ } from "../core/dom.js";

const root = document.documentElement;

export function initThemeToggle(button, site) {
  const themeMeta = $('meta[name="theme-color"]');

  function syncUI() {
    const isDark = root.getAttribute("data-theme") !== "light";
    const label = isDark ? site.ui.themeToLight : site.ui.themeToDark;
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    if (themeMeta) themeMeta.setAttribute("content", isDark ? site.meta.themeColor.dark : site.meta.themeColor.light);
  }

  button.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked: theme still switches */ }
    syncUI();
  });

  syncUI();
}
