/* Configuration and the shared, mutable state of the admin page. */

export const DEFAULT_REPO = "RahatAlamgir/portfolio";
export const DEFAULT_BRANCH = "master";

export const FILES = [
  { path: "data/profile.json", label: "Profile & hero" },
  { path: "data/projects.json", label: "Projects" },
  { path: "data/skills.json", label: "Skills" },
  { path: "data/learning.json", label: "Currently learning" },
  { path: "data/education.json", label: "Education" },
  { path: "data/services.json", label: "Services" },
  { path: "data/site.json", label: "Site text & SEO" }
];

// `state.current` value for the file manager screen (every other value is a data file path)
export const ASSETS = "assets";

// String fields holding a file path in the repo get an upload button (value = default folder).
export const FILE_KEYS = { image: "assets/projects", logo: "assets/education", src: "assets", cv: "assets" };
export const MAX_IMAGE_WIDTH = 1200;

export const state = {
  token: "",
  cfg: { repo: DEFAULT_REPO, branch: DEFAULT_BRANCH },
  current: FILES[0].path,
  mode: "form" // form | raw
};

export const docs = {};              // path -> { data, sha, original, templates, rawError }
export const pending = new Map();    // asset path -> { b64, url, owner }
export const openCards = new Set();  // card paths the user has expanded

// Set by editor.js, so other modules can re-render without importing it (avoids import cycles).
export const hooks = { render() {}, start() {} };

export const dirty = (path) => {
  const doc = docs[path];
  if (!doc) return false;
  return JSON.stringify(doc.data) !== doc.original || [...pending.values()].some((p) => p.owner === path);
};
export const anyDirty = () => FILES.some((f) => dirty(f.path));

/** Update the unsaved-changes dots, the save button and its note. */
export function refreshDirty() {
  for (const f of FILES) {
    const dot = document.querySelector(`[data-dot="${f.path}"]`);
    if (dot) dot.hidden = !dirty(f.path);
  }
  const doc = docs[state.current];
  const saveBtn = document.getElementById("saveBtn");
  if (!doc || !saveBtn) return;
  const isDirty = dirty(state.current);
  saveBtn.disabled = !isDirty || !!doc.rawError;
  document.getElementById("saveNote").textContent = doc.rawError ? "Fix the JSON error first" : isDirty ? "Unsaved changes" : "No changes";
}
