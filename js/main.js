/* Entry point: load the JSON content, then render each part of the page. */

import { $ } from "./core/dom.js";
import { loadContent } from "./core/data.js";
import { renderLoadError } from "./core/load-error.js";

import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { createProjectDialog } from "./components/dialog.js";

import { renderHero } from "./sections/hero.js";
import { renderStats } from "./sections/stats.js";
import { renderProjects } from "./sections/projects.js";
import { renderGithub } from "./sections/github.js";
import { renderVideos } from "./sections/videos.js";
import { renderServices } from "./sections/services.js";
import { renderSkills } from "./sections/skills.js";
import { renderEducation } from "./sections/education.js";
import { renderContact } from "./sections/contact.js";

function applyMeta({ meta, ui }) {
  document.title = meta.title;
  $('meta[name="description"]').setAttribute("content", meta.description);
  $("#skip-link").textContent = ui.skipLink;
}

async function start() {
  let content;
  try {
    content = await loadContent();
  } catch (error) {
    renderLoadError(error);
    return;
  }

  applyMeta(content.site);
  renderHeader($("#site-header"), content);

  const openDialog = createProjectDialog($("#project-dialog"), content.site.ui);

  renderHero($("#top"), content);
  renderStats($("#stats"), content);
  renderProjects($("#work"), content, openDialog);
  renderVideos($("#videos"), content);
  renderServices($("#services"), content);
  renderSkills($("#skills"), content);
  renderEducation($("#education"), content);
  renderContact($("#contact"), content);
  renderFooter($("#site-footer"), content);

  document.body.classList.add("is-ready");

  // Live data from an outside service: loads in the background and
  // stays hidden if the service is unavailable.
  renderGithub($("#github"), content);

  // Content was rendered after load, so re-apply a #hash link (e.g. /#contact)
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}

start();
