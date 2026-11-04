// Small DOM and string helpers shared by all modules.
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

// Calls `onFailure` if an image fails to load.
// Also handles images that already failed before this code ran.
export function onImageFailure(img, onFailure) {
  const hasSource = Boolean(img.getAttribute('src'));
  if (hasSource && img.complete && img.naturalWidth === 0) {
    onFailure();
  } else {
    img.addEventListener('error', onFailure, { once: true });
  }
}
