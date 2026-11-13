/* Selected work: filters, project cards, pagination. */

import { el, icon, externalLink, fmt, sectionHeading } from "../core/dom.js";
import { countProjects } from "../core/data.js";
import { projectMedia, tagList } from "../components/media.js";
import { createPager } from "../components/pagination.js";

export function renderProjects(mount, { site, projects }, openDialog) {
  const { ui } = site;
  const state = { filter: projects.filters[0] || "All", page: 1, list: [] };

  const filtersEl = el("div", { className: "filters", role: "group", "aria-label": ui.filterProjects });
  const grid = el("div", { className: "project-grid", "aria-live": "polite" });
  const head = el("div", { className: "section-head" }, [el("div", {}, sectionHeading(site.sections.work)), filtersEl]);
  const pager = createPager(ui, (page) => { state.page = page; update({ animate: true, scroll: true }); });

  function card(project) {
    return el("article", {
      className: "card is-clickable",
      // The whole card opens the details; links and buttons inside keep their own action.
      onclick: (e) => { if (!e.target.closest("a, button")) openDialog(project, state.list); }
    }, [
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
            onclick: () => openDialog(project, state.list)
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
        onclick: () => { state.filter = name; state.page = 1; update({ animate: true }); }
      }, [name, el("span", { className: "count", text: String(countProjects(projects.items, name)) })])
    ));
  }

  function update({ animate = false, scroll = false } = {}) {
    renderFilters();
    const list = state.filter === "All"
      ? projects.items
      : projects.items.filter((p) => p.categories.includes(state.filter));
    state.list = list;

    const pages = Math.max(1, Math.ceil(list.length / projects.pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * projects.pageSize;
    const shown = list.slice(start, start + projects.pageSize);

    if (list.length) {
      const cards = shown.map(card);
      if (animate) cards.forEach((c, i) => { c.classList.add("enter"); c.style.setProperty("--i", String(i)); });
      grid.replaceChildren(...cards);
    } else {
      grid.replaceChildren(el("p", { className: "empty-state", text: ui.noProjects }));
    }

    pager.update(state.page, pages);

    // Moving to another page from far down: bring the top of the section back into view
    if (scroll && head.getBoundingClientRect().top < 0) head.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  mount.replaceChildren(head, grid, pager.element);
  update();
}
