/* Project image, or a code placeholder when a project has no screenshot. */

import { el, fmt } from "../core/dom.js";

export function codeThumb(lines = []) {
  return el("div", { className: "code-thumb", "aria-hidden": "true" },
    lines.map((line, i) => {
      const muted = i === 0 || line.startsWith("→");
      return el("div", { className: muted ? "c" : null, text: line });
    })
  );
}

export function projectMedia(project, ui, { eager = false, decorative = false } = {}) {
  if (!project.image) return codeThumb(project.codePreview);
  return el("img", {
    src: project.image,
    alt: decorative ? "" : fmt(ui.screenshotAlt, { title: project.title }),
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    width: 640,
    height: 400
  });
}

export function tagList(tags = []) {
  return el("div", { className: "tags" }, tags.map((t) => el("span", { className: "tag", text: t })));
}
