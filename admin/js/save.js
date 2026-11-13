/* Commit the current file (and any images uploaded for it) to GitHub, then delete the
   image / PDF files that this save left unused (for example the old photo after a replacement). */

import { state, docs, pending, refreshDirty, FILES, FILE_KEYS } from "./state.js";
import { putFile, deleteFile, existingSha } from "./github.js";
import { collectTemplates, isObject, toast, utf8ToB64 } from "./util.js";

/** Every repo file path referenced by an image / logo / src / cv field in some JSON value. */
function assetPaths(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => assetPaths(v, found));
  else if (isObject(value)) {
    for (const [key, v] of Object.entries(value)) {
      if (key in FILE_KEYS && typeof v === "string" && v.startsWith("assets/")) found.add(v);
      else assetPaths(v, found);
    }
  }
  return found;
}

/** Files that were referenced before this save, are not referenced by any data file now. */
function unusedAfter(path, before) {
  const used = new Set();
  for (const f of FILES) {
    const other = docs[f.path];
    assetPaths(f.path === path ? other.data : JSON.parse(other.original), used);
    if (f.path !== path) assetPaths(other.data, used); // keep files that unsaved edits elsewhere still point to
  }
  return [...before].filter((p) => !used.has(p));
}

async function removeFiles(paths) {
  let removed = 0;
  for (const assetPath of paths) {
    try {
      const sha = await existingSha(assetPath);
      if (sha) { await deleteFile(assetPath, `admin: remove unused ${assetPath}`, sha); removed += 1; }
    } catch { /* leaving a stray file behind is harmless */ }
  }
  return removed;
}

export async function save() {
  const path = state.current;
  const doc = docs[path];
  const button = document.getElementById("saveBtn");
  button.disabled = true;
  button.textContent = "Saving…";
  try {
    const before = assetPaths(JSON.parse(doc.original));
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

    const removed = await removeFiles(unusedAfter(path, before));
    toast(`Saved${removed ? ` and removed ${removed} unused file${removed > 1 ? "s" : ""}` : ""}. The live site updates in about a minute.`);
  } catch (error) {
    const stale = error.status === 409 || error.status === 422;
    if (error.status === 403 || error.status === 404) {
      toast("GitHub refused the write. Your token needs “Contents: Read and write” permission on this repository (check its Repository access and permissions).", true);
    } else toast(stale ? "This file changed on GitHub since you loaded it. Use “Reload from GitHub” (it discards your edits)." : `Save failed: ${error.message}`, true);
  }
  button.textContent = "Save to GitHub";
  refreshDirty();
}
