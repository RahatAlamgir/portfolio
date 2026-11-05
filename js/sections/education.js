/* Education list from education.json. */

import { el, sectionHeading } from "../core/dom.js";

export function renderEducation(mount, { site, education }) {
  mount.replaceChildren(
    ...sectionHeading(site.sections.education),
    el("ol", { className: "edu-list" }, education.map((item) =>
      el("li", { className: "edu-item" }, [
        el("img", { src: item.logo, alt: item.logoAlt, width: 56, height: 56, loading: "lazy" }),
        el("div", { className: "edu-body" }, [
          el("div", { className: "edu-title-row" }, [
            el("h3", { text: item.title }),
            item.badge ? el("span", { className: "badge", text: item.badge }) : null
          ]),
          el("p", { text: item.detail })
        ]),
        el("span", { className: "edu-year", text: item.year })
      ])
    ))
  );
}
