/* "Currently learning" strip: a few topics with a thin progress bar each (data/learning.json). */

import { el } from "../core/dom.js";

export function renderLearning(mount, { learning }) {
  if (!learning?.items?.length) {
    mount.hidden = true;
    return;
  }

  mount.setAttribute("aria-label", learning.label);
  mount.replaceChildren(
    el("div", { className: "learning" }, [
      el("p", { className: "learning-label" }, [
        el("span", { className: "status-dot", "aria-hidden": "true" }),
        learning.label
      ]),
      el("ul", { className: "learning-items" }, learning.items.map((item) => {
        const percent = Math.max(0, Math.min(100, Number(item.progress) || 0));
        return el("li", { className: "learning-item" }, [
          el("div", { className: "learning-text" }, [
            el("strong", { text: item.title }),
            el("span", { className: "muted", text: item.detail })
          ]),
          el("span", { className: "learning-percent mono muted", text: `${percent}%` }),
          el("div", {
            className: "learning-bar",
            role: "progressbar",
            "aria-label": item.title,
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            "aria-valuenow": String(percent)
          }, [
            el("span", { className: "learning-fill", style: `--p: ${percent / 100}` })
          ])
        ]);
      }))
    ])
  );
}
