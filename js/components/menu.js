/* Mobile menu (shown below 860px). */

import { $$ } from "../core/dom.js";

export function initMobileMenu(button, menu, ui) {
  function setOpen(open) {
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? ui.menuClose : ui.menuOpen);
  }

  button.addEventListener("click", () => setOpen(menu.hidden));
  $$("a", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setOpen(false);
      button.focus();
    }
  });

  // Close it if the window grows back to desktop width
  window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });

  setOpen(false);
}
