/* Stats strip. Every number is counted live from projects.json:
     countCategories   → projects in ANY of these categories (each project once)
     excludeCategories → projects in NONE of these categories
   A fixed `value` can still be given for a stat that isn't a project count. */

import { el } from "../core/dom.js";
import { countProjects, countProjectsExcluding } from "../core/data.js";

function statValue(stat, items) {
  if (stat.value !== undefined) return stat.value;
  if (stat.excludeCategories) return countProjectsExcluding(items, stat.excludeCategories);
  return countProjects(items, stat.countCategories);
}

export function renderStats(mount, { site, projects }) {
  mount.setAttribute("aria-label", site.ui.statsLabel);
  mount.replaceChildren(
    el("dl", { className: "stats" }, site.stats.map((stat) =>
      el("div", {}, [
        el("dt", { text: stat.label }),
        el("dd", { text: String(statValue(stat, projects.items)) })
      ])
    ))
  );
}
