/* Admin entry point: theme, sign-out, and starting from a saved token if there is one. */

import { state, anyDirty } from "./state.js";
import { store } from "./util.js";
import { showLogin, signOut } from "./auth.js";
import { start } from "./editor.js";

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
  state.token = savedToken;
  try { state.cfg = { ...state.cfg, ...JSON.parse(store.get("adminCfg") || "{}") }; } catch { /* use defaults */ }
  start();
} else {
  showLogin();
}
