/* Floating "back to top" button that appears after scrolling down. */

import { el, icon } from "../core/dom.js";

const SHOW_AFTER = 700; // px scrolled

export function renderBackToTop(site) {
  const label = site.ui.backToTopLabel;
  const button = el("a", {
    className: "icon-btn back-to-top",
    href: "#top",
    "aria-label": label,
    title: label
  }, [icon("arrow-up")]);
  document.body.append(button);

  let queued = false;
  const update = () => {
    queued = false;
    button.classList.toggle("is-visible", scrollY > SHOW_AFTER);
  };
  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}
