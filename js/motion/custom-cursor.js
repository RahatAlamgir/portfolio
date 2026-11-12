/* Custom cursor: the normal arrow (thick border) that becomes a pointing hand over
   clickable things. Fine pointers (mouse/trackpad) only;
   touch devices and reduced-motion visitors keep the normal cursor. */

const INTERACTIVE = "a, button, .card, summary, [role='button'], label, input, select, textarea";
const SVG_NS = "http://www.w3.org/2000/svg";

// Classic arrow outline; the tip is at (3, 2) in a 24x24 box
const ARROW = "M3 2 L3 19 L7.4 14.9 L10.5 21.7 L13.5 20.3 L10.4 13.6 L16.6 13.6 Z";

// Pointing hand; the fingertip is at (10.5, 1) in a 24x24 box
const HAND = "M9 2.5 C9 1.7 9.7 1 10.5 1 C11.3 1 12 1.7 12 2.5 L12 9 L12.6 9 C12.8 8.3 13.5 8 14 8 " +
  "C14.8 8 15.4 8.4 15.6 9 C15.9 8.6 16.4 8.4 17 8.4 C17.9 8.4 18.5 9 18.7 9.8 C19 9.5 19.5 9.4 20 9.4 " +
  "C20.9 9.4 21.5 10.1 21.5 11 L21.5 15.5 C21.5 19 19 22 15.5 22 L13 22 C11 22 9.7 21.2 8.6 19.8 " +
  "L3.8 13.6 C3.3 12.9 3.4 12 4.1 11.5 C4.8 11 5.7 11.1 6.3 11.7 L9 14.5 Z";

function createShape(className, d) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.append(path);
  return svg;
}

export function setupCustomCursor() {
  if (!matchMedia("(pointer: fine)").matches) return;

  // A popover lives in the browser's top layer, so the cursor can be shown above
  // the modal project dialog (which would otherwise cover it).
  const layer = document.createElement("div");
  layer.className = "cursor-layer";
  layer.setAttribute("aria-hidden", "true");
  const canPopover = typeof layer.showPopover === "function";
  if (canPopover) layer.setAttribute("popover", "manual");

  // The wrapper sits exactly on the pointer; each shape is offset inside it so its
  // tip / fingertip is the click point.
  const body = document.createElement("div");
  body.className = "cursor-body";
  body.append(createShape("cursor-arrow", ARROW), createShape("cursor-hand", HAND));
  layer.append(body);
  document.body.append(layer);

  const show = () => {
    if (!canPopover) return;
    // hide + show moves the layer back on top of anything opened since
    try { layer.hidePopover(); } catch { /* already hidden */ }
    try { layer.showPopover(); } catch { /* not allowed right now */ }
  };
  show();

  const root = document.documentElement;
  const dialog = document.getElementById("project-dialog");
  if (dialog) {
    new MutationObserver(show).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  }

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    if (!root.classList.contains("has-cursor")) root.classList.add("has-cursor");
    body.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    layer.classList.remove("is-away");
  });

  document.addEventListener("pointerover", (e) => {
    layer.classList.toggle("is-hover", Boolean(e.target.closest?.(INTERACTIVE)));
  });
  document.addEventListener("pointerdown", () => layer.classList.add("is-down"));
  document.addEventListener("pointerup", () => layer.classList.remove("is-down"));
  root.addEventListener("pointerleave", () => layer.classList.add("is-away"));
}
