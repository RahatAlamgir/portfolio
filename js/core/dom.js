/* Small DOM helpers shared by every module. */

const ICON_SPRITE = "assets/icons.svg";
const SVG_NS = "http://www.w3.org/2000/svg";

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * Create an element.
 *   el("a", { href: "#", className: "btn", onclick: fn }, ["Label", childNode])
 * `text` sets textContent; `on*` keys add listeners; false/null/undefined are skipped.
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  append(node, children);
  return node;
}

export function append(parent, children) {
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return parent;
}

/** Inline SVG icon from assets/icons.svg. */
export function icon(name, extraClass = "") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", `icon ${extraClass}`.trim());
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `${ICON_SPRITE}#${name}`);
  svg.append(use);
  return svg;
}

/** Link that opens in a new tab. */
export function externalLink(href, className, children, attrs = {}) {
  return el("a", { href, className, target: "_blank", rel: "noopener", ...attrs }, children);
}

/** Fill "{name}" placeholders: fmt("Show all {count}", { count: 10 }). */
export function fmt(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

/** Text with one highlighted word: { before, highlight, after }. */
export function highlightedText(parts) {
  return [parts.before, el("span", { className: "accent-text", text: parts.highlight }), parts.after];
}

/** Eyebrow + title block used at the top of most sections. */
export function sectionHeading({ eyebrow, title }, titleClass = "section-title") {
  return [
    el("p", { className: "eyebrow", text: eyebrow }),
    el("h2", { className: titleClass, text: title })
  ];
}
