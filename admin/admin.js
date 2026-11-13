/* Portfolio admin: edit data/*.json and upload images, saved as commits through the GitHub API.
   The page itself is public, but nothing can be saved without a GitHub token that has write
   access to the repo. The token stays in this browser only (sessionStorage by default). */

const DEFAULT_REPO = "RahatAlamgir/portfolio";
const DEFAULT_BRANCH = "master";

const FILES = [
  { path: "data/profile.json", label: "Profile & hero" },
  { path: "data/projects.json", label: "Projects" },
  { path: "data/skills.json", label: "Skills" },
  { path: "data/learning.json", label: "Currently learning" },
  { path: "data/education.json", label: "Education" },
  { path: "data/services.json", label: "Services" },
  { path: "data/site.json", label: "Site text & SEO" }
];

// String fields holding a file path in the repo get an upload button.
const FILE_KEYS = { image: "assets/projects", logo: "assets/education", src: "assets", cv: "assets" };
const MAX_IMAGE_WIDTH = 1200;

/* ---------- helpers ---------- */

const app = document.getElementById("app");

function el(tag, props = {}, kids = []) {
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

const store = {
  get(key) { try { return sessionStorage.getItem(key) ?? localStorage.getItem(key); } catch { return null; } },
  set(key, value, persistent) {
    try { (persistent ? localStorage : sessionStorage).setItem(key, value); } catch { /* storage blocked */ }
  },
  clear(key) { try { sessionStorage.removeItem(key); localStorage.removeItem(key); } catch { /* ignore */ } }
};

let toastTimer;
function toast(message, bad = false) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.toggle("bad", bad);
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), bad ? 6000 : 2800);
}

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);
const humanize = (key) => String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");

function blank(value) {
  if (Array.isArray(value)) return [];
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]));
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  return "";
}

/** Remember the shape of the first item of every array, so "Add" can create a matching empty one. */
function collectTemplates(value, sig, map) {
  if (Array.isArray(value)) {
    if (value.length && !map.has(sig)) map.set(sig, blank(value[0]));
    value.forEach((item) => collectTemplates(item, `${sig}[]`, map));
  } else if (isObject(value)) {
    for (const [k, v] of Object.entries(value)) collectTemplates(v, `${sig}.${k}`, map);
  }
  return map;
}

const utf8ToB64 = (text) => {
  let binary = "";
  new TextEncoder().encode(text).forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};
const b64ToUtf8 = (b64) => {
  const binary = atob(b64.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

/* ---------- state ---------- */

let token = "";
let cfg = { repo: DEFAULT_REPO, branch: DEFAULT_BRANCH };
let current = FILES[0].path;
let mode = "form"; // form | raw
const docs = {};              // path -> { data, sha, original, templates, rawError }
const pending = new Map();    // asset path -> { b64, url, owner }
const openCards = new Set();  // card paths the user has expanded

const dirty = (path) => {
  const doc = docs[path];
  if (!doc) return false;
  return JSON.stringify(doc.data) !== doc.original || [...pending.values()].some((p) => p.owner === path);
};
const anyDirty = () => FILES.some((f) => dirty(f.path));

/* ---------- GitHub API ---------- */

async function api(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${cfg.repo}/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {})
    }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || response.statusText);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

const contentsUrl = (path) => `contents/${path.split("/").map(encodeURIComponent).join("/")}`;

async function loadDoc(path) {
  const file = await api(`${contentsUrl(path)}?ref=${encodeURIComponent(cfg.branch)}`);
  const data = JSON.parse(b64ToUtf8(file.content));
  docs[path] = { data, sha: file.sha, original: JSON.stringify(data), templates: collectTemplates(data, "", new Map()), rawError: "" };
}

async function putFile(path, contentB64, message, sha) {
  return api(contentsUrl(path), {
    method: "PUT",
    body: JSON.stringify({ message, content: contentB64, branch: cfg.branch, ...(sha ? { sha } : {}) })
  });
}

async function existingSha(path) {
  try { return (await api(`${contentsUrl(path)}?ref=${encodeURIComponent(cfg.branch)}`)).sha; }
  catch (error) { if (error.status === 404) return undefined; throw error; }
}

/* ---------- sign in ---------- */

function showLogin(message = "") {
  document.getElementById("logoutBtn").hidden = true;
  document.getElementById("repoLabel").textContent = "";
  const tokenInput = el("input", { type: "password", id: "tok", autocomplete: "off", spellcheck: "false", placeholder: "github_pat_…" });
  const repoInput = el("input", { type: "text", id: "repo", value: cfg.repo });
  const branchInput = el("input", { type: "text", id: "branch", value: cfg.branch });
  const remember = el("input", { type: "checkbox", id: "remember" });
  const error = el("p", { className: "error", text: message, hidden: !message });

  const form = el("form", { className: "login", onsubmit: async (e) => {
    e.preventDefault();
    token = tokenInput.value.trim();
    cfg = { repo: repoInput.value.trim(), branch: branchInput.value.trim() };
    if (!token) return;
    submit.disabled = true;
    submit.textContent = "Checking…";
    try {
      const info = await api("");
      if (info.permissions && !info.permissions.push) throw new Error("This token can read the repo but cannot write to it.");
      store.set("adminToken", token, remember.checked);
      store.set("adminCfg", JSON.stringify(cfg), remember.checked);
      await start();
    } catch (err) {
      token = "";
      submit.disabled = false;
      submit.textContent = "Sign in";
      error.textContent = err.status === 401 || err.status === 404 ? "GitHub rejected this token or repo name." : err.message;
      error.hidden = false;
    }
  } }, [
    el("h1", { text: "Sign in" }),
    el("p", { className: "muted" }, [
      "Paste a GitHub fine-grained token with ",
      el("strong", { text: "Contents: read and write" }),
      " on this repo only. Create one ",
      el("a", { href: "https://github.com/settings/personal-access-tokens/new", target: "_blank", rel: "noopener noreferrer", text: "here" }),
      "."
    ]),
    el("label", { className: "field" }, [el("span", { className: "field-label", text: "Access token" }), tokenInput]),
    el("div", { className: "row" }, [
      el("label", { className: "field" }, [el("span", { className: "field-label", text: "Repository" }), repoInput]),
      el("label", { className: "field" }, [el("span", { className: "field-label", text: "Branch" }), branchInput])
    ]),
    el("label", { className: "check" }, [remember, "Remember me on this device"]),
    error
  ]);
  const submit = el("button", { className: "btn primary", type: "submit", text: "Sign in" });
  form.append(submit);
  app.replaceChildren(form);
  tokenInput.focus();
}

function signOut() {
  if (anyDirty() && !confirm("You have unsaved changes. Sign out anyway?")) return;
  store.clear("adminToken");
  store.clear("adminCfg");
  token = "";
  for (const key of Object.keys(docs)) delete docs[key];
  pending.clear();
  showLogin();
}

/* ---------- editor ---------- */

async function start() {
  app.replaceChildren(el("p", { className: "muted", style: "text-align:center;margin-top:20vh", text: "Loading content…" }));
  try {
    await Promise.all(FILES.map((f) => loadDoc(f.path)));
  } catch (error) {
    token = "";
    showLogin(`Could not load the data files: ${error.message}`);
    return;
  }
  document.getElementById("logoutBtn").hidden = false;
  document.getElementById("repoLabel").textContent = `${cfg.repo} · ${cfg.branch}`;
  render();
}

function render() {
  const scroll = window.scrollY;
  const doc = docs[current];
  const meta = FILES.find((f) => f.path === current);

  const side = el("nav", { className: "side", "aria-label": "Content files" }, FILES.map((f) =>
    el("button", {
      type: "button",
      "aria-current": f.path === current ? "true" : "false",
      onclick: () => { current = f.path; mode = "form"; render(); window.scrollTo(0, 0); }
    }, [f.label, el("span", { className: "dot", "data-dot": f.path, hidden: !dirty(f.path) })])
  ));

  const head = el("div", { className: "panel-head" }, [
    el("h2", { text: meta.label }),
    el("span", { className: "path", text: current }),
    el("span", { className: "grow" }),
    el("button", { className: "btn small", type: "button", text: mode === "form" ? "Edit raw JSON" : "Back to form", onclick: toggleMode }),
    el("button", { className: "btn small", type: "button", text: "Reload from GitHub", onclick: reloadCurrent })
  ]);

  const body = el("div", {});
  if (mode === "raw") body.append(rawEditor(doc));
  else if (Array.isArray(doc.data)) body.append(arrayEditor(doc.data, meta.label, "", "r", doc, true));
  else body.append(objectEditor(doc.data, "", "r", doc));

  const saveBtn = el("button", { className: "btn primary", id: "saveBtn", type: "button", text: "Save to GitHub", onclick: save });
  const saveNote = el("span", { id: "saveNote" });
  const savebar = el("div", { className: "savebar" }, [saveNote, saveBtn]);

  app.replaceChildren(el("div", { className: "shell" }, [side, el("section", {}, [head, body])]), savebar);
  refreshDirty();
  window.scrollTo(0, scroll);
}

function refreshDirty() {
  for (const f of FILES) {
    const dot = document.querySelector(`[data-dot="${f.path}"]`);
    if (dot) dot.hidden = !dirty(f.path);
  }
  const doc = docs[current];
  const isDirty = dirty(current);
  const saveBtn = document.getElementById("saveBtn");
  if (!saveBtn) return;
  saveBtn.disabled = !isDirty || !!doc.rawError;
  document.getElementById("saveNote").textContent = doc.rawError ? "Fix the JSON error first" : isDirty ? "Unsaved changes" : "No changes";
}

function toggleMode() {
  const doc = docs[current];
  if (mode === "raw" && doc.rawError) { toast("Fix the JSON error before going back to the form.", true); return; }
  mode = mode === "form" ? "raw" : "form";
  render();
}

async function reloadCurrent() {
  if (dirty(current) && !confirm("Discard your unsaved changes to this file and reload it from GitHub?")) return;
  try {
    await loadDoc(current);
    for (const [key, value] of pending) if (value.owner === current) pending.delete(key);
    mode = "form";
    render();
    toast("Reloaded from GitHub.");
  } catch (error) { toast(`Reload failed: ${error.message}`, true); }
}

function rawEditor(doc) {
  const message = el("p", { className: "error", hidden: true });
  const area = el("textarea", { className: "raw", spellcheck: "false", "aria-label": "Raw JSON" });
  area.value = JSON.stringify(doc.data, null, 2);
  area.addEventListener("input", () => {
    try {
      doc.data = JSON.parse(area.value);
      doc.rawError = "";
      message.hidden = true;
    } catch (error) {
      doc.rawError = error.message;
      message.textContent = error.message;
      message.hidden = false;
    }
    refreshDirty();
  });
  return el("div", {}, [area, message]);
}

/* ---------- form builders ---------- */

function objectEditor(obj, sig, path, doc) {
  const box = el("div", {});
  for (const [key, value] of Object.entries(obj)) {
    const childSig = `${sig}.${key}`;
    const childPath = `${path}.${key}`;
    if (Array.isArray(value)) box.append(arrayEditor(value, humanize(key), childSig, childPath, doc));
    else if (isObject(value)) {
      box.append(el("fieldset", { className: "group" }, [el("legend", { text: humanize(key) }), objectEditor(value, childSig, childPath, doc)]));
    } else box.append(primitiveField(obj, key, humanize(key), path, doc));
  }
  return box;
}

function summarize(item, index) {
  if (isObject(item)) {
    const pick = item.title ?? item.name ?? item.label ?? item.id ?? item.prefix;
    if (typeof pick === "string" && pick.trim()) return pick;
  }
  return `Item ${index + 1}`;
}

function arrayEditor(arr, label, sig, path, doc, isRoot = false) {
  const itemSig = `${sig}[]`;
  const allPrimitive = arr.every((v) => !isObject(v) && !Array.isArray(v));
  const makeNew = () => {
    const template = doc.templates.get(sig);
    return template === undefined ? "" : structuredClone(template);
  };
  const change = () => { render(); };

  const add = el("button", { className: "btn small", type: "button", text: "+ Add", onclick: () => {
    arr.push(makeNew());
    if (!allPrimitive || isObject(arr[arr.length - 1])) openCards.add(`${path}.${arr.length - 1}`);
    change();
  } });

  const head = el("div", { className: "group-head" }, [
    el("span", { text: label }),
    el("span", { className: "count", text: `(${arr.length})` }),
    el("span", { className: "grow" }),
    add
  ]);

  const list = el("div", {});
  arr.forEach((item, index) => {
    const move = (to) => { if (to < 0 || to >= arr.length) return; [arr[index], arr[to]] = [arr[to], arr[index]]; change(); };
    const remove = () => { if (confirm(`Delete "${isObject(item) ? summarize(item, index) : item}"?`)) { arr.splice(index, 1); change(); } };
    const iconBtn = (text, title, onclick, extra = "") =>
      el("button", { className: `btn small icon ${extra}`, type: "button", title, "aria-label": title, text, onclick: (e) => { e.preventDefault(); e.stopPropagation(); onclick(); } });

    if (isObject(item) || Array.isArray(item)) {
      const cardPath = `${path}.${index}`;
      const title = el("span", { className: "card-title", text: summarize(item, index) });
      const body = el("div", { className: "card-body" }, [
        isObject(item) ? objectEditor(item, itemSig, cardPath, doc) : arrayEditor(item, "Items", itemSig, cardPath, doc)
      ]);
      const card = el("details", { className: "card" }, [
        el("summary", {}, [
          el("span", { className: "card-num", text: String(index + 1).padStart(2, "0") }),
          title,
          el("span", { className: "card-actions" }, [
            iconBtn("↑", "Move up", () => move(index - 1)),
            iconBtn("↓", "Move down", () => move(index + 1)),
            iconBtn("⧉", "Duplicate", () => { arr.splice(index + 1, 0, structuredClone(item)); change(); }),
            iconBtn("✕", "Delete", remove, "danger")
          ])
        ]),
        body
      ]);
      card.open = openCards.has(cardPath) || (isRoot && arr.length <= 3);
      card.addEventListener("toggle", () => { card.open ? openCards.add(cardPath) : openCards.delete(cardPath); });
      card.addEventListener("input", () => { title.textContent = summarize(item, index); });
      list.append(card);
    } else {
      list.append(el("div", { className: "prim-row" }, [
        primitiveField(arr, index, "", path, doc),
        iconBtn("↑", "Move up", () => move(index - 1)),
        iconBtn("↓", "Move down", () => move(index + 1)),
        iconBtn("✕", "Delete", remove, "danger")
      ]));
    }
  });

  return el("div", { className: isRoot ? "" : "group" }, [head, list]);
}

function primitiveField(parent, key, label, path, doc) {
  const value = parent[key];
  const touch = () => refreshDirty();

  if (typeof value === "boolean") {
    const box = el("input", { type: "checkbox" });
    box.checked = value;
    box.addEventListener("change", () => { parent[key] = box.checked; touch(); });
    return el("label", { className: "field inline" }, [box, el("span", { className: "field-label", text: label })]);
  }

  if (typeof value === "number") {
    const input = el("input", { type: "number", step: "any" });
    input.value = value;
    input.addEventListener("input", () => { parent[key] = input.value === "" ? 0 : Number(input.value); touch(); });
    return el("label", { className: "field" }, [label && el("span", { className: "field-label", text: label }), input]);
  }

  const text = value == null ? "" : String(value);
  if (typeof key === "string" && key in FILE_KEYS) return fileField(parent, key, label, doc);

  const long = text.length > 90 || text.includes("\n");
  const input = long
    ? el("textarea", { rows: Math.min(12, Math.max(3, Math.ceil(text.length / 80) + text.split("\n").length - 1)) })
    : el("input", { type: "text" });
  input.value = text;
  input.addEventListener("input", () => { parent[key] = input.value; touch(); });
  return el("label", { className: "field" }, [label && el("span", { className: "field-label", text: label }), input]);
}

/* ---------- images & files ---------- */

function previewSrc(value) {
  if (!value) return "";
  return pending.get(value)?.url || `../${value}`;
}

function fileField(parent, key, label, doc) {
  const isPdf = (v) => /\.pdf$/i.test(v || "");
  const input = el("input", { type: "text", placeholder: "assets/…" });
  input.value = parent[key] || "";
  const note = el("span", { className: "img-note" });
  const thumbHolder = el("span", {});
  const drawThumb = () => {
    const value = parent[key];
    thumbHolder.replaceChildren(isPdf(value)
      ? el("span", { className: "img-thumb file", text: "PDF" })
      : el("img", { className: "img-thumb", alt: "", src: previewSrc(value), onerror: (e) => { e.target.style.visibility = "hidden"; } }));
  };
  drawThumb();

  input.addEventListener("input", () => { parent[key] = input.value; drawThumb(); refreshDirty(); });

  const picker = el("input", { type: "file", hidden: true, accept: key === "cv" ? "application/pdf" : "image/*" });
  picker.addEventListener("change", async () => {
    const file = picker.files[0];
    if (!file) return;
    note.textContent = "Processing…";
    try {
      const asset = await prepareUpload(file, key, parent[key]);
      pending.set(asset.path, { b64: asset.b64, url: asset.url, owner: current });
      parent[key] = asset.path;
      input.value = asset.path;
      drawThumb();
      note.textContent = `Ready (${Math.round(asset.size / 1024)} KB), uploads on save`;
      refreshDirty();
    } catch (error) {
      note.textContent = "";
      toast(`Upload failed: ${error.message}`, true);
    }
    picker.value = "";
  });

  return el("div", { className: "field" }, [
    el("span", { className: "field-label", text: label }),
    el("div", { className: "img-field" }, [
      thumbHolder,
      el("div", { className: "img-main" }, [
        input,
        el("button", { className: "btn small", type: "button", text: key === "cv" ? "Upload PDF" : "Upload image", onclick: () => picker.click() }),
        note,
        picker
      ])
    ])
  ]);
}

const readAsDataURL = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

/** Photos are resized and converted to WebP in the browser, like the site's existing images. */
async function prepareUpload(file, key, currentValue) {
  const folder = currentValue && currentValue.includes("/") ? currentValue.slice(0, currentValue.lastIndexOf("/")) : FILE_KEYS[key];
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "file";
  let blob = file;
  let ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || "bin").toLowerCase();

  if (/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) throw new Error("This browser cannot convert to WebP.");
    ext = "webp";
  } else if (key !== "cv" && file.type !== "image/svg+xml") {
    throw new Error("Please choose a PNG, JPG, WebP or SVG image.");
  }
  if (blob.size > 5 * 1024 * 1024) throw new Error("File is larger than 5 MB.");

  const url = await readAsDataURL(blob);
  return { path: `${folder}/${base}.${ext}`, b64: url.slice(url.indexOf(",") + 1), url, size: blob.size };
}

/* ---------- saving ---------- */

async function save() {
  const path = current;
  const doc = docs[path];
  const button = document.getElementById("saveBtn");
  button.disabled = true;
  button.textContent = "Saving…";
  try {
    const mine = [...pending.entries()].filter(([, p]) => p.owner === path);
    for (const [assetPath, asset] of mine) {
      await putFile(assetPath, asset.b64, `admin: upload ${assetPath}`, await existingSha(assetPath));
    }
    const text = `${JSON.stringify(doc.data, null, 2)}\n`;
    const result = await putFile(path, utf8ToB64(text), `admin: update ${path.split("/").pop()}`, doc.sha);
    doc.sha = result.content.sha;
    doc.original = JSON.stringify(doc.data);
    doc.templates = collectTemplates(doc.data, "", new Map());
    for (const [assetPath] of mine) pending.delete(assetPath);
    toast("Saved. The live site updates in about a minute.");
  } catch (error) {
    const stale = error.status === 409 || error.status === 422;
    toast(stale ? "This file changed on GitHub since you loaded it. Use “Reload from GitHub” (it discards your edits)." : `Save failed: ${error.message}`, true);
  }
  button.textContent = "Save to GitHub";
  refreshDirty();
}

/* ---------- boot ---------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("adminTheme", theme); } catch { /* ignore */ }
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("adminTheme"); } catch { /* ignore */ }
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

document.getElementById("themeBtn").addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});
document.getElementById("logoutBtn").addEventListener("click", signOut);
window.addEventListener("beforeunload", (e) => { if (anyDirty()) e.preventDefault(); });

const savedToken = store.get("adminToken");
if (savedToken) {
  token = savedToken;
  try { cfg = { ...cfg, ...JSON.parse(store.get("adminCfg") || "{}") }; } catch { /* use defaults */ }
  start();
} else {
  showLogin();
}
