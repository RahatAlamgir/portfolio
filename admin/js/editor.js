/* The main editor screen: sidebar, panel header, form or raw view, save bar. */

import { FILES, state, docs, pending, hooks, dirty, refreshDirty } from "./state.js";
import { loadDoc } from "./github.js";
import { app, el, toast } from "./util.js";
import { objectEditor, arrayEditor, rawEditor } from "./fields.js";
import { showLogin } from "./auth.js";
import { save } from "./save.js";

export async function start() {
  app.replaceChildren(el("p", { className: "muted", style: "text-align:center;margin-top:20vh", text: "Loading content…" }));
  try {
    await Promise.all(FILES.map((f) => loadDoc(f.path)));
  } catch (error) {
    state.token = "";
    showLogin(`Could not load the data files: ${error.message}`);
    return;
  }
  document.getElementById("logoutBtn").hidden = false;
  document.getElementById("repoLabel").textContent = `${state.cfg.repo} · ${state.cfg.branch}`;
  render();
}

export function render() {
  const scroll = window.scrollY;
  const doc = docs[state.current];
  const meta = FILES.find((f) => f.path === state.current);

  const side = el("nav", { className: "side", "aria-label": "Content files" }, FILES.map((f) =>
    el("button", {
      type: "button",
      "aria-current": f.path === state.current ? "true" : "false",
      onclick: () => { state.current = f.path; state.mode = "form"; render(); window.scrollTo(0, 0); }
    }, [f.label, el("span", { className: "dot", "data-dot": f.path, hidden: !dirty(f.path) })])
  ));

  const head = el("div", { className: "panel-head" }, [
    el("h2", { text: meta.label }),
    el("span", { className: "path", text: state.current }),
    el("span", { className: "grow" }),
    el("button", { className: "btn small", type: "button", text: state.mode === "form" ? "Edit raw JSON" : "Back to form", onclick: toggleMode }),
    el("button", { className: "btn small", type: "button", text: "Reload from GitHub", onclick: reloadCurrent })
  ]);

  const body = el("div", {});
  if (state.mode === "raw") body.append(rawEditor(doc));
  else if (Array.isArray(doc.data)) body.append(arrayEditor(doc.data, meta.label, "", "r", doc, true));
  else body.append(objectEditor(doc.data, "", "r", doc));

  const savebar = el("div", { className: "savebar" }, [
    el("span", { id: "saveNote" }),
    el("button", { className: "btn primary", id: "saveBtn", type: "button", text: "Save to GitHub", onclick: save })
  ]);

  app.replaceChildren(el("div", { className: "shell" }, [side, el("section", {}, [head, body])]), savebar);
  refreshDirty();
  window.scrollTo(0, scroll);
}

function toggleMode() {
  if (state.mode === "raw" && docs[state.current].rawError) {
    toast("Fix the JSON error before going back to the form.", true);
    return;
  }
  state.mode = state.mode === "form" ? "raw" : "form";
  render();
}

async function reloadCurrent() {
  if (dirty(state.current) && !confirm("Discard your unsaved changes to this file and reload it from GitHub?")) return;
  try {
    await loadDoc(state.current);
    for (const [key, value] of pending) if (value.owner === state.current) pending.delete(key);
    state.mode = "form";
    render();
    toast("Reloaded from GitHub.");
  } catch (error) { toast(`Reload failed: ${error.message}`, true); }
}

hooks.render = render;
hooks.start = start;
