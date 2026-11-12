/* Project details dialog (native <dialog>). */

import { el, icon, externalLink } from "../core/dom.js";
import { projectMedia, tagList } from "./media.js";

export function createProjectDialog(dialog, ui) {
  const closeButton = el("button", {
    className: "icon-btn dialog-close",
    type: "button",
    "aria-label": ui.dialogClose,
    onclick: () => dialog.close()
  }, [icon("close")]);

  // Previous / next project (only shown when there is more than one in the list)
  let list = [];
  let index = 0;
  const step = (delta) => {
    if (list.length < 2) return;
    index = (index + delta + list.length) % list.length;
    show(list[index]);
  };
  const prevButton = el("button", {
    className: "icon-btn dialog-nav dialog-prev",
    type: "button",
    "aria-label": ui.dialogPrev,
    onclick: () => step(-1)
  }, [icon("arrow-left")]);
  const nextButton = el("button", {
    className: "icon-btn dialog-nav dialog-next",
    type: "button",
    "aria-label": ui.dialogNext,
    onclick: () => step(1)
  }, [icon("arrow-right")]);
  const counter = el("span", { className: "dialog-counter label", "aria-live": "polite" });

  const media = el("div", { className: "dialog-media" });
  const body = el("div", { className: "dialog-body" });
  dialog.setAttribute("aria-labelledby", "dialog-title");
  dialog.replaceChildren(media, body);

  // Clicking the dimmed backdrop (outside the box) closes the dialog
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });

  // Arrow keys move between projects while the dialog is open
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  function show(project) {
    const multiple = list.length > 1;
    counter.textContent = `${index + 1} / ${list.length}`;
    media.replaceChildren(
      projectMedia(project, ui, { eager: true }),
      closeButton,
      ...(multiple ? [prevButton, nextButton, counter] : [])
    );
    dialog.scrollTop = 0; // new project: start from the top

    const highlights = project.highlights || [];
    body.replaceChildren(
      el("p", { className: "card-kind", text: project.kind }),
      el("h2", { id: "dialog-title", text: project.title }),
      el("p", { className: "dialog-desc", text: project.longDescription || project.description }),
      el("div", { className: "dialog-columns" }, [
        highlights.length
          ? el("div", {}, [
              el("p", { className: "label", text: ui.dialogHighlights }),
              el("ul", {}, highlights.map((h) => el("li", { text: h })))
            ])
          : null,
        el("div", {}, [el("p", { className: "label", text: ui.dialogStack }), tagList(project.tags)])
      ]),
      el("div", { className: "btn-row" }, [
        externalLink(project.repo, "btn btn-accent", [icon("code"), ui.viewSource]),
        project.youtube ? externalLink(project.youtube, "btn btn-outline", [icon("youtube"), ui.watchOnYoutube]) : null
      ])
    );
  }

  /** Open a project; pass the visible list so the arrows can step through it. */
  return function open(project, projects = [project]) {
    list = projects;
    index = Math.max(0, projects.indexOf(project));
    show(project);
    if (!dialog.open) {
      dialog.showModal();
      closeButton.focus();
    }
  };
}
