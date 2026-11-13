/* Previous / numbered pages / Next. Hidden when there is only one page. */

import { el, icon, fmt } from "../core/dom.js";

export function createPager(ui, onChange) {
  const nav = el("nav", { className: "pager", "aria-label": ui.pagination, hidden: true });

  const pageButton = (label, page, { current = false, disabled = false, ariaLabel } = {}) =>
    el("button", {
      type: "button",
      className: "pager-btn",
      "aria-label": ariaLabel,
      "aria-current": current ? "page" : null,
      disabled,
      onclick: () => onChange(page)
    }, label);

  /** Rebuild for the current page (1-based) out of `pages` total. */
  function update(page, pages) {
    nav.hidden = pages <= 1;
    if (pages <= 1) return;

    const numbers = Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
      pageButton(String(n), n, { current: n === page, ariaLabel: fmt(ui.pageLabel, { n }) })
    );

    nav.replaceChildren(
      pageButton([icon("arrow-left"), el("span", { text: ui.pagePrev })], page - 1, { disabled: page === 1 }),
      el("div", { className: "pager-pages" }, numbers),
      pageButton([el("span", { text: ui.pageNext }), icon("arrow-right")], page + 1, { disabled: page === pages })
    );
    nav.querySelector(".pager-btn:first-child").classList.add("pager-step");
    nav.querySelector(".pager-btn:last-child").classList.add("pager-step");
  }

  return { element: nav, update };
}
