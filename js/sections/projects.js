/* Selected work: filters, project cards, "Show all". */

import { el, icon, externalLink, fmt, sectionHeading } from "../core/dom.js";
import { countProjects } from "../core/data.js";
import { projectMedia, tagList } from "../components/media.js";

export function renderProjects(mount, { site, projects }, openDialog) {
  const { ui } = site;
  const state = { filter: projects.filters[0] || "All", showAll: false };

  const filtersEl = el("div", { className: "filters", role: "group", "aria-label": ui.filterProjects });
  const grid = el("div", { className: "project-grid", "aria-live": "polite" });
  const moreButton = el("button", {
    className: "btn btn-outline",
    type: "button",
    id: "show-more",
    hidden: true,
    onclick: () => { state.showAll = true; update(); }
  });

  function card(project) {
    return el("article", { className: "card" }, [
      el("div", { className: "card-media" }, [projectMedia(project, ui)]),
      el("div", { className: "card-body" }, [
        el("p", { className: "card-kind", text: project.kind }),
        el("h3", { className: "card-title", text: project.title }),
        el("p", { className: "card-desc", text: project.description }),
        tagList(project.tags),
        el("div", { className: "card-links" }, [
          externalLink(project.repo, null, [icon("code"), ui.sourceCode]),
          project.youtube ? externalLink(project.youtube, null, [icon("youtube"), ui.watchDemo]) : null,
          el("button", {
            type: "button",
            className: "details-btn",
            "aria-label": fmt(ui.detailsLabel, { title: project.title }),
            onclick: () => openDialog(project)
          }, [ui.details, icon("arrow-up-right")])
        ])
      ])
    ]);
  }

  function renderFilters() {
    filtersEl.replaceChildren(...projects.filters.map((name) =>
      el("button", {
        type: "button",
        className: "filter-btn",
        "aria-pressed": String(state.filter === name),
        onclick: () => { state.filter = name; state.showAll = false; update(); }
      }, [name, el("span", { className: "count", text: String(countProjects(projects.items, name)) })])
    ));
  }

  function update() {
    renderFilters();
    const list = state.filter === "All"
      ? projects.items
      : projects.items.filter((p) => p.categories.includes(state.filter));
    const shown = state.showAll ? list : list.slice(0, projects.pageSize);

    if (list.length) grid.replaceChildren(...shown.map(card));
    else grid.replaceChildren(el("p", { className: "empty-state", text: ui.noProjects }));

    moreButton.hidden = state.showAll || list.length <= projects.pageSize;
    moreButton.textContent = fmt(ui.showAll, { count: list.length });
  }

  mount.replaceChildren(
    el("div", { className: "section-head" }, [el("div", {}, sectionHeading(site.sections.work)), filtersEl]),
    grid,
    el("div", { className: "center" }, [moreButton])
  );
  update();
}
