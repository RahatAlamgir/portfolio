/* Sign-in form and sign-out. The token lives in sessionStorage (or localStorage with "Remember me"). */

import { state, docs, pending, hooks, anyDirty } from "./state.js";
import { api } from "./github.js";
import { app, el, store } from "./util.js";

export function showLogin(message = "") {
  document.getElementById("logoutBtn").hidden = true;
  document.getElementById("repoLabel").textContent = "";

  const tokenInput = el("input", { type: "password", id: "tok", autocomplete: "off", spellcheck: "false", placeholder: "github_pat_…" });
  const repoInput = el("input", { type: "text", id: "repo", value: state.cfg.repo });
  const branchInput = el("input", { type: "text", id: "branch", value: state.cfg.branch });
  const remember = el("input", { type: "checkbox", id: "remember" });
  const error = el("p", { className: "error", text: message, hidden: !message });
  const submit = el("button", { className: "btn primary", type: "submit", text: "Sign in" });

  const form = el("form", { className: "login", onsubmit: async (e) => {
    e.preventDefault();
    state.token = tokenInput.value.trim();
    state.cfg = { repo: repoInput.value.trim(), branch: branchInput.value.trim() };
    if (!state.token) return;
    submit.disabled = true;
    submit.textContent = "Checking…";
    try {
      const info = await api("");
      if (info.permissions && !info.permissions.push) throw new Error("This token can read the repo but cannot write to it.");
      store.set("adminToken", state.token, remember.checked);
      store.set("adminCfg", JSON.stringify(state.cfg), remember.checked);
      await hooks.start();
    } catch (err) {
      state.token = "";
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
    error,
    submit
  ]);

  app.replaceChildren(form);
  tokenInput.focus();
}

export function signOut() {
  if (anyDirty() && !confirm("You have unsaved changes. Sign out anyway?")) return;
  store.clear("adminToken");
  store.clear("adminCfg");
  state.token = "";
  for (const key of Object.keys(docs)) delete docs[key];
  pending.clear();
  showLogin();
}
