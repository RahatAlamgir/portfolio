// Projects section: category filter, paged list ("Show more") and project cards.
import { $, $$, escapeHTML, onImageFailure } from './dom.js';
import { fill } from './content.js';

function categoryLabel(project) {
  return project.categories ? project.categories.join(' • ') : '';
}

function renderArt(project, ui) {
  const icon = project.icon || ui.fallbackIcon;
  if (project.image) {
    return `<img class="project-img" src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)}" data-fallback-icon="${escapeHTML(icon)}">`;
  }
  return `<span class="art-icon" aria-hidden="true">${escapeHTML(icon)}</span>`;
}

function renderLinks(project, ui) {
  const youtube = project.youtube
    ? `<a class="repo-link youtube-link" href="${escapeHTML(project.youtube)}" target="_blank" rel="noreferrer">${escapeHTML(ui.youtubeLink)}</a>`
    : '';
  const repo = project.repo
    ? `<a class="repo-link" href="${escapeHTML(project.repo)}" target="_blank" rel="noreferrer">${escapeHTML(ui.repoLink)}</a>`
    : `<span class="repo-link">${escapeHTML(ui.noRepo)}</span>`;
  return `${youtube}${repo}`;
}

function renderProjectCard(project, ui) {
  return `
      <article class="project-card">
        <div class="project-art">
          ${renderArt(project, ui)}
          <span class="art-label">${escapeHTML(project.subtitle)}</span>
        </div>
        <div class="project-content">
          <span class="project-category">${escapeHTML(categoryLabel(project))}</span>
          <div class="project-title-row"><h3>${escapeHTML(project.title)}</h3></div>
          <p class="project-description">${escapeHTML(project.description)}</p>
          <div class="tag-list">${project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
        </div>
        <div class="project-actions">
          <button class="text-button" data-project="${escapeHTML(project.id)}">${escapeHTML(ui.viewDetails)}</button>
          <div class="project-links-group" style="display:flex; gap:10px; align-items:center;">
            ${renderLinks(project, ui)}
          </div>
        </div>
      </article>`;
}

// Replaces a broken project image with its emoji icon.
function useIconOnImageFailure(grid) {
  $$('.project-img', grid).forEach((img) => {
    onImageFailure(img, () => {
      const icon = document.createElement('span');
      icon.className = 'art-icon';
      icon.textContent = img.dataset.fallbackIcon;
      img.replaceWith(icon);
    });
  });
}

function renderFilterButtons(filters) {
  const container = $('[data-list="project-filters"]');
  if (!container) return [];

  container.innerHTML = filters
    .map((filter, index) => {
      const active = index === 0 ? ' active' : '';
      return `<button class="filter-button${active}" data-filter="${escapeHTML(filter)}">${escapeHTML(filter)}</button>`;
    })
    .join('');
  return $$('.filter-button', container);
}

export function createProjectsView(projects, { onOpen, filters, pageSize, ui }) {
  const grid = $('#projectGrid');
  if (!grid) return;

  const moreButton = $('#showMoreProjects');
  const filterButtons = renderFilterButtons(filters);
  const allFilter = filters[0];
  let activeFilter = allFilter;
  let visibleCount = pageSize;

  function filteredProjects() {
    if (activeFilter === allFilter) return projects;
    return projects.filter((project) => project.categories?.includes(activeFilter));
  }

  function render() {
    const matching = filteredProjects();

    if (matching.length === 0) {
      grid.innerHTML = `<p class="body-copy" style="grid-column: 1/-1; padding: 20px 0;">${escapeHTML(ui.noProjects)}</p>`;
      if (moreButton) moreButton.hidden = true;
      return;
    }

    grid.innerHTML = matching.slice(0, visibleCount).map((project) => renderProjectCard(project, ui)).join('');
    useIconOnImageFailure(grid);

    $$('[data-project]', grid).forEach((button) => {
      button.addEventListener('click', () => onOpen(button.dataset.project));
    });

    if (moreButton) {
      const remaining = matching.length - visibleCount;
      moreButton.hidden = remaining <= 0;
      moreButton.textContent = fill(ui.showMore, { count: remaining });
    }
  }

  function setActiveFilterButton(activeButton) {
    filterButtons.forEach((item) => {
      const isActive = item === activeButton;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveFilterButton(button);
      activeFilter = button.dataset.filter;
      visibleCount = pageSize;
      render();
    });
  });

  if (moreButton) {
    moreButton.addEventListener('click', () => {
      visibleCount += pageSize;
      render();
    });
  }

  setActiveFilterButton(filterButtons[0]);
  render();
}
