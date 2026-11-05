/* Skills & tools from skills.json. */

import { el, sectionHeading } from "../core/dom.js";

export function renderSkills(mount, { site, skills }) {
  const copy = site.sections.skills;

  const intro = el("div", { className: "skills-intro" }, [
    ...sectionHeading(copy),
    el("p", { className: "muted", text: copy.intro }),
    el("p", { className: "label skills-label", text: copy.languagesLabel }),
    el("ul", { className: "lang-list" }, skills.languages.map((lang) => el("li", { text: lang })))
  ]);

  const cards = el("div", { className: "skill-cards" }, skills.groups.map((group) =>
    el("div", { className: "skill-card" }, [
      el("h3", { text: group.title }),
      el("ul", {}, group.items.map((item) =>
        el("li", {}, [
          item.name,
          item.primary ? el("span", { className: "primary-tag", text: copy.primaryLabel }) : null
        ])
      ))
    ])
  ));

  mount.replaceChildren(el("div", { className: "skills-layout" }, [intro, cards]));
}
