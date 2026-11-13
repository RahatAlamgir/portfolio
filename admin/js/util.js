/* Small shared helpers: DOM builder, storage, toast, JSON/Base64 utilities. */

export const app = document.getElementById("app");

export function el(tag, props = {}, kids = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === false || value == null) continue;
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...[].concat(kids).filter((k) => k != null && k !== false));
  return node;
}

export const store = {
  get(key) { try { return sessionStorage.getItem(key) ?? localStorage.getItem(key); } catch { return null; } },
  set(key, value, persistent) {
    try { (persistent ? localStorage : sessionStorage).setItem(key, value); } catch { /* storage blocked */ }
  },
  clear(key) { try { sessionStorage.removeItem(key); localStorage.removeItem(key); } catch { /* ignore */ } }
};

let toastTimer;
export function toast(message, bad = false) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.toggle("bad", bad);
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), bad ? 6000 : 2800);
}

export const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);
export const humanize = (key) => String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");

/** An empty value with the same shape as `value`. */
export function blank(value) {
  if (Array.isArray(value)) return [];
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]));
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  return "";
}

/** Remember the shape of the first item of every array, so "Add" can create a matching empty one. */
export function collectTemplates(value, sig, map) {
  if (Array.isArray(value)) {
    if (value.length && !map.has(sig)) map.set(sig, blank(value[0]));
    value.forEach((item) => collectTemplates(item, `${sig}[]`, map));
  } else if (isObject(value)) {
    for (const [k, v] of Object.entries(value)) collectTemplates(v, `${sig}.${k}`, map);
  }
  return map;
}

export const utf8ToB64 = (text) => {
  let binary = "";
  new TextEncoder().encode(text).forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};

export const b64ToUtf8 = (b64) => {
  const binary = atob(b64.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};
