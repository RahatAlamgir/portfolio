// Entry point: loads the content from /data, fills the page, then sets up interactions.
import { applyBindings, loadContent } from './modules/content.js';
import { applyMeta, renderNavLinks, setYear } from './modules/layout.js';
import { applyEmailButtons, initCopyEmail, renderContactItems, renderContactSocials } from './modules/contact.js';
import { initAboutPhoto, renderAboutStats } from './modules/about.js';
import { renderHeroButtons, renderHeroSocials, renderTechPills, renderTerminalCode } from './modules/hero.js';
import { renderSkills } from './modules/skills.js';
import { renderServices } from './modules/services.js';
import { renderEducation } from './modules/education.js';
import { createProjectsView } from './modules/projects.js';
import { initProjectDialog } from './modules/project-dialog.js';
import { initTheme } from './modules/theme.js';
import { initMobileMenu, initScrollProgress } from './modules/navigation.js';
import { showLoadError } from './modules/load-error.js';

async function start() {
  let content;
  try {
    content = await loadContent();
  } catch (error) {
    console.error('Portfolio content could not be loaded.', error);
    showLoadError();
    initScrollProgress();
    return;
  }

  const { profile, site, skills, services, education, projects } = content;

  applyMeta(site);
  applyBindings(document, content);
  setYear();
  renderNavLinks(site);
  renderHeroButtons(site.hero, content);
  renderHeroSocials(content);
  renderTechPills(site.hero.terminal.techPills);
  renderTerminalCode(site.hero.terminal);
  renderContactItems(site.sections.contact, content);
  renderContactSocials(content);
  applyEmailButtons(profile.email);
  initCopyEmail(profile.email, site.ui);
  renderAboutStats(projects, site.sections.about);
  renderSkills(skills);
  renderServices(services);
  renderEducation(education);

  initTheme(site.ui);
  initMobileMenu(site.ui);
  initScrollProgress();
  initAboutPhoto();

  const projectDialog = initProjectDialog(site.ui);
  createProjectsView(projects, {
    filters: site.sections.projects.filters,
    pageSize: site.sections.projects.pageSize,
    ui: site.ui,
    onOpen: (id) => {
      const project = projects.find((item) => item.id === id);
      if (project) projectDialog.open(project);
    },
  });
}

start();
