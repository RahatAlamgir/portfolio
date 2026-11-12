/* A single underline that slides to whichever nav link is active. */

import { $ } from "../core/dom.js";

export function setupNavIndicator() {
  const nav = $(".nav-links");
  if (!nav) return;

  const bar = document.createElement("span");
  bar.className = "nav-indicator";
  bar.setAttribute("aria-hidden", "true");
  nav.append(bar);

  const place = () => {
    const active = $("a.active", nav);
    nav.classList.toggle("has-active", Boolean(active));
    if (!active) return;
    nav.style.setProperty("--ix", `${active.offsetLeft + 14}px`);
    nav.style.setProperty("--iw", `${active.offsetWidth - 28}px`);
  };

  new MutationObserver(place).observe(nav, { attributes: true, attributeFilter: ["class"], subtree: true });
  addEventListener("resize", place);
  place();
}
