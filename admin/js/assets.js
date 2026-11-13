/* Assets manager: every image / PDF in the repo's assets/ folder, with where it is used,
   plus upload, replace, rename and delete. Each action is committed to GitHub straight away. */

import { state, docs, FILES, hooks, anyDirty } from "./state.js";
import { api, putFile, deleteFile } from "./github.js";
import { el, isObject, toast, utf8ToB64 } from "./util.js";
import { toWebpBlob, blobToB64, prepareUpload, isConvertible, MAX_UPLOAD_BYTES } from "./uploads.js";

const MIME = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", gif: "image/gif", pdf: "application/pdf" };
const ext = (path) => path.split(".").pop().toLowerCase();
const isImage = (path) => ["webp", "png", "jpg", "jpeg", "svg", "gif"].includes(ext(path));
const folderOf = (path) => path.slice(0, path.lastIndexOf("/"));
const fmtSize = (bytes) => (bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`);

let items = null;            // [{ path, size, sha }]
let loadError = "";
let filter = "all";          // all | images | pdf | unused
let query = "";
const fresh = new Set();     // paths changed this session: the deployed copy may be stale, so preview from GitHub

async function loadTree() {
  try {
    const tree = await api(`git/trees/${state.cfg.branch}?recursive=1`);
    items = tree.tree
      .filter((n) => n.type === "blob" && n.path.startsWith("assets/"))
      .map((n) => ({ path: n.path, size: n.size, sha: n.sha }))
      .sort((a, b) => a.path.localeCompare(b.path));
    loadError = "";
  } catch (error) { loadError = error.message; }
}

/** Map of asset path -> readable list of places in the (saved) data that use it. */
function usageMap() {
  const map = new Map();
  const add = (path, text) => map.set(path, [...(map.get(path) || []), text]);
  const walk = (value, label, context, key) => {
    if (typeof value === "string") {
      if (value.startsWith("assets/")) add(value, `${label}${context ? ` › ${context}` : ""}${key ? ` (${key})` : ""}`);
    } else if (Array.isArray(value)) value.forEach((v) => walk(v, label, context, key));
    else if (isObject(value)) {
      const name = value.title ?? value.name ?? value.label;
      for (const [k, v] of Object.entries(value)) walk(v, label, typeof name === "string" && name ? name : context, k);
    }
  };
  for (const f of FILES) walk(JSON.parse(docs[f.path].original), f.label, "", "");
  return map;
}

/** Replace every string equal to `from` with `to`; returns true if anything changed. */
function replaceReferences(value, from, to) {
  let changed = false;
  const visit = (node) => {
    const entries = Array.isArray(node) ? node.entries() : Object.entries(node);
    for (const [k, v] of entries) {
      if (v === from) { node[k] = to; changed = true; }
      else if (v && typeof v === "object") visit(v);
    }
  };
  visit(value);
  return changed;
}

async function blobB64(sha) {
  return (await api(`git/blobs/${sha}`)).content.replace(/\n/g, "");
}

/* ---------- actions ---------- */

async function doReplace(item, file) {
  const type = ext(item.path);
  let blob = file;
  if (type === "webp") {
    if (!isConvertible(file)) throw new Error("Choose a PNG, JPG or WebP image.");
    blob = await toWebpBlob(file);
  } else if (type === "pdf" && file.type !== "application/pdf") throw new Error("Choose a PDF file.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("File is larger than 5 MB.");
  await putFile(item.path, await blobToB64(blob), `admin: replace ${item.path}`, item.sha);
  fresh.add(item.path);
}

async function doRename(item, newPath) {
  if (anyDirty()) throw new Error("Save or discard your unsaved changes first, because rename edits the data files.");
  if (!/^assets\/[\w./-]+$/.test(newPath) || newPath.includes("..")) throw new Error("Use a path like assets/projects/name.webp (letters, numbers, - _ . /).");
  if (ext(newPath) !== ext(item.path)) throw new Error(`Keep the same file type (.${ext(item.path)}).`);
  if (items.some((i) => i.path === newPath)) throw new Error("A file with that name already exists.");

  await putFile(newPath, await blobB64(item.sha), `admin: rename ${item.path} to ${newPath}`);
  for (const f of FILES) {
    const doc = docs[f.path];
    if (!replaceReferences(doc.data, item.path, newPath)) continue;
    const text = `${JSON.stringify(doc.data, null, 2)}\n`;
    const result = await putFile(f.path, utf8ToB64(text), `admin: point ${f.path.split("/").pop()} to ${newPath}`, doc.sha);
    doc.sha = result.content.sha;
    doc.original = JSON.stringify(doc.data);
  }
  await deleteFile(item.path, `admin: rename ${item.path} to ${newPath}`, item.sha);
  fresh.add(newPath);
}

async function doDelete(item) {
  await deleteFile(item.path, `admin: delete ${item.path}`, item.sha);
}

async function doUpload(file, folder) {
  const asset = await prepareUpload(file, file.type === "application/pdf" ? "cv" : "image", `${folder}/`);
  const existing = items.find((i) => i.path === asset.path);
  if (existing && !confirm(`${asset.path} already exists. Replace it?`)) return;
  await putFile(asset.path, asset.b64, `admin: upload ${asset.path}`, existing?.sha);
  fresh.add(asset.path);
}

/* ---------- view ---------- */

export function assetsView() {
  const root = el("div", {});
  const draw = () => paint(root);
  if (!items && !loadError) {
    root.append(el("p", { className: "muted", text: "Loading assets…" }));
    loadTree().then(draw);
  } else draw();
  return root;
}

async function run(root, task, doneMessage) {
  try {
    await task();
    await loadTree();
    toast(doneMessage);
  } catch (error) { toast(error.message, true); }
  hooks.render();
}

function paint(root) {
  if (loadError) {
    root.replaceChildren(el("p", { className: "error", text: `Could not load assets: ${loadError}` }),
      el("button", { className: "btn small", type: "button", text: "Try again", onclick: async () => { await loadTree(); hooks.render(); } }));
    return;
  }

  const usage = usageMap();
  const totalSize = items.reduce((sum, i) => sum + i.size, 0);
  const folders = [...new Set(["assets", "assets/projects", "assets/education", ...items.map((i) => folderOf(i.path))])].sort();

  const folderSelect = el("select", { "aria-label": "Upload folder" }, folders.map((f) => el("option", { value: f, text: f })));
  folderSelect.value = "assets/projects";
  const uploadInput = el("input", { type: "file", hidden: true, accept: "image/*,application/pdf", onchange: (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) run(root, () => doUpload(file, folderSelect.value), "Uploaded.");
  } });

  const filters = [["all", "All"], ["images", "Images"], ["pdf", "PDF"], ["unused", "Unused"]];
  const search = el("input", { type: "text", placeholder: "Search by path…", "aria-label": "Search assets", value: query });
  const grid = el("div", { className: "asset-grid" });

  const visible = () => items.filter((i) => {
    if (query && !i.path.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "images") return isImage(i.path);
    if (filter === "pdf") return ext(i.path) === "pdf";
    if (filter === "unused") return !usage.has(i.path);
    return true;
  });
  const fillGrid = () => {
    const list = visible();
    grid.replaceChildren(...(list.length ? list.map((i) => card(root, i, usage)) : [el("p", { className: "muted", text: "Nothing matches." })]));
  };
  search.addEventListener("input", () => { query = search.value; fillGrid(); });

  const chips = filters.map(([value, label]) => el("button", {
    className: "btn small", type: "button", text: label, "aria-pressed": String(filter === value),
    onclick: () => { filter = value; chips.forEach((c, n) => c.setAttribute("aria-pressed", String(filters[n][0] === value))); fillGrid(); }
  }));

  root.replaceChildren(
    el("div", { className: "asset-tools" }, [
      el("span", { className: "muted", text: `${items.length} files · ${fmtSize(totalSize)}` }),
      el("span", { className: "grow" }),
      folderSelect,
      el("button", { className: "btn small", type: "button", text: "Upload file", onclick: () => uploadInput.click() }),
      el("button", { className: "btn small", type: "button", text: "Refresh", onclick: () => run(root, async () => {}, "Refreshed.") }),
      uploadInput
    ]),
    el("div", { className: "asset-tools" }, [...chips, search]),
    grid,
    el("p", { className: "muted asset-foot", text: "“Used in” only looks at the data files. A file referenced directly in index.html (for example the share image) shows as unused, so check before deleting." })
  );
  fillGrid();
}

function thumb(item) {
  if (!isImage(item.path)) return el("div", { className: "asset-thumb file", text: ext(item.path).toUpperCase() });
  const img = el("img", { className: "asset-thumb", alt: "", loading: "lazy" });
  const fromGitHub = async () => {
    try { img.src = `data:${MIME[ext(item.path)]};base64,${await blobB64(item.sha)}`; } catch { img.style.visibility = "hidden"; }
  };
  if (fresh.has(item.path)) fromGitHub();
  else { img.onerror = fromGitHub; img.src = `../${item.path}`; }
  return img;
}

function card(root, item, usage) {
  const used = usage.get(item.path) || [];
  const dims = el("span", {});
  const preview = thumb(item);
  if (preview.tagName === "IMG") preview.addEventListener("load", () => { dims.textContent = ` · ${preview.naturalWidth}×${preview.naturalHeight}`; });

  const replaceInput = el("input", { type: "file", hidden: true, accept: ext(item.path) === "pdf" ? "application/pdf" : "image/*", onchange: (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) run(root, () => doReplace(item, file), "Replaced.");
  } });

  const actions = el("div", { className: "asset-actions" }, [
    el("button", { className: "btn small", type: "button", text: "Copy path", onclick: async () => {
      try { await navigator.clipboard.writeText(item.path); toast("Path copied."); } catch { toast(item.path); }
    } }),
    el("button", { className: "btn small", type: "button", text: "Replace", onclick: () => replaceInput.click() }),
    el("button", { className: "btn small", type: "button", text: "Rename", onclick: () => {
      const next = prompt("New path (same file type). Data files that use it are updated too:", item.path);
      if (next && next.trim() !== item.path) run(root, () => doRename(item, next.trim()), "Renamed.");
    } }),
    el("button", { className: "btn small danger", type: "button", text: "Delete", onclick: () => {
      if (used.length) { toast(`In use by ${used[0]}${used.length > 1 ? ` and ${used.length - 1} more` : ""}. Change that first.`, true); return; }
      if (confirm(`Delete ${item.path}? This cannot be undone from here (GitHub history keeps a copy).`)) run(root, () => doDelete(item), "Deleted.");
    } }),
    replaceInput
  ]);

  return el("article", { className: "asset" }, [
    preview,
    el("div", { className: "asset-info" }, [
      el("code", { className: "asset-path", text: item.path }),
      el("div", { className: "muted asset-meta" }, [`${ext(item.path).toUpperCase()} · ${fmtSize(item.size)}`, dims, ` · ${item.sha.slice(0, 7)}`]),
      el("div", { className: used.length ? "asset-used" : "asset-used none" }, [used.length ? `Used in: ${used.join("; ")}` : "Not used in any data file"]),
      actions
    ])
  ]);
}
