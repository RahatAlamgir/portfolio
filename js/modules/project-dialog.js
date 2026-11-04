// Project details dialog.
import { $, escapeHTML } from './dom.js';

function renderDialogArt(project, ui) {
  if (project.image) {
    return `<img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  }
  return escapeHTML(project.icon || ui.fallbackIcon);
}

function renderDialogLinks(project, ui) {
  const links = [];
  if (project.repo) {
    links.push(`<a class="button" href="${escapeHTML(project.repo)}" target="_blank" rel="noreferrer">${escapeHTML(ui.viewSource)}</a>`);
  }
  if (project.youtube) {
    links.push(`<a class="button button-outline" href="${escapeHTML(project.youtube)}" target="_blank" rel="noreferrer">${escapeHTML(ui.watchYoutube)}</a>`);
  }
  return links.join('\n');
}

export function initProjectDialog(ui) {
  const dialog = $('#projectDialog');
  if (!dialog) return { open() {} };

  const closeButton = $('#dialogClose');
  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const artEl = $('#dialogArt');
  const categoryEl = $('#dialogCategory');
  const titleEl = $('#dialogTitle');
  const descriptionEl = $('#dialogDescription');
  const tagsEl = $('#dialogTags');
  const linksEl = $('#dialogLinks');

  function open(project) {
    if (artEl) artEl.innerHTML = renderDialogArt(project, ui);
    if (categoryEl) categoryEl.textContent = project.categories ? project.categories.join(' • ') : '';
    if (titleEl) titleEl.textContent = project.title;
    if (descriptionEl) descriptionEl.textContent = project.details;
    if (tagsEl) tagsEl.innerHTML = project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('');
    if (linksEl) linksEl.innerHTML = renderDialogLinks(project, ui);
    dialog.showModal();
  }

  return { open };
}
