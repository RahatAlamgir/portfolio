/* GitHub REST API calls (contents API) used to read and commit files. */

import { state, docs } from "./state.js";
import { b64ToUtf8, collectTemplates } from "./util.js";

export async function api(path, options = {}) {
  // No trailing slash when path is empty: GitHub's CORS preflight rejects ".../repo/"
  const response = await fetch(`https://api.github.com/repos/${state.cfg.repo}${path ? `/${path}` : ""}`, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${state.token}`,
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
const refQuery = () => `?ref=${encodeURIComponent(state.cfg.branch)}`;

export async function loadDoc(path) {
  const file = await api(`${contentsUrl(path)}${refQuery()}`);
  const data = JSON.parse(b64ToUtf8(file.content));
  docs[path] = { data, sha: file.sha, original: JSON.stringify(data), templates: collectTemplates(data, "", new Map()), rawError: "" };
}

export function putFile(path, contentB64, message, sha) {
  return api(contentsUrl(path), {
    method: "PUT",
    body: JSON.stringify({ message, content: contentB64, branch: state.cfg.branch, ...(sha ? { sha } : {}) })
  });
}

export function deleteFile(path, message, sha) {
  return api(contentsUrl(path), {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: state.cfg.branch })
  });
}

/** Sha of an existing file, or undefined when it does not exist yet. */
export async function existingSha(path) {
  try { return (await api(`${contentsUrl(path)}${refQuery()}`)).sha; }
  catch (error) { if (error.status === 404) return undefined; throw error; }
}
