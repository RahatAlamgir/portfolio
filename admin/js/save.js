/* Commit the current file (and any images uploaded for it) to GitHub. */

import { state, docs, pending, refreshDirty } from "./state.js";
import { putFile, existingSha } from "./github.js";
import { collectTemplates, toast, utf8ToB64 } from "./util.js";

export async function save() {
  const path = state.current;
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
