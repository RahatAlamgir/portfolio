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

  return function open(project) {
    media.replaceChildren(projectMedia(project, ui, { eager: true }), closeButton);

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

    dialog.showModal();
    closeButton.focus();
  };
}
