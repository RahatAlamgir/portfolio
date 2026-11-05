/* What I do: service cards from services.json. */

import { el, icon, sectionHeading } from "../core/dom.js";

export function renderServices(mount, { site, services }) {
  mount.replaceChildren(
    ...sectionHeading(site.sections.services, "section-title narrow"),
    el("div", { className: "services" }, services.map((s) =>
      el("article", { className: "service" }, [
        el("span", { className: "service-icon" }, [icon(s.icon, "icon-lg")]),
        el("h3", { text: s.title }),
        el("p", { text: s.description })
      ])
    ))
  );
}
