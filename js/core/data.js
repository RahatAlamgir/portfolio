/* Loads every content file from /data in parallel. */

const FILES = {
  site: "data/site.json",
  profile: "data/profile.json",
  projects: "data/projects.json",
  services: "data/services.json",
  skills: "data/skills.json",
  education: "data/education.json",
  learning: "data/learning.json"
};

async function loadJSON(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  return response.json();
}

export async function loadContent() {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([key, path]) => [key, await loadJSON(path)])
  );
  return Object.fromEntries(entries);
}

/**
 * Number of projects in a category ("All" counts everything).
 * Pass an array to count projects in ANY of those categories — each project once.
 */
export function countProjects(projects, categories) {
  const wanted = [].concat(categories);
  if (wanted.includes("All")) return projects.length;
  return projects.filter((p) => p.categories.some((c) => wanted.includes(c))).length;
}

/** Number of projects in NONE of the given categories. */
export function countProjectsExcluding(projects, categories) {
  const excluded = [].concat(categories);
  return projects.filter((p) => !p.categories.some((c) => excluded.includes(c))).length;
}

/** Social links that have a URL (empty ones, e.g. YouTube before it exists, are skipped). */
export function activeSocials(profile) {
  return profile.social.filter((s) => s.url);
}
