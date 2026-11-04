// About section: project stats and the profile photo fallback.
import { $, $$, escapeHTML, onImageFailure } from './dom.js';

function countProjects(projects, filter) {
  if (filter === 'All') return projects.length;
  return projects.filter((project) => project.categories?.includes(filter)).length;
}

function formatNumber(num) {
  return String(num).padStart(2, '0');
}

export function renderAboutStats(projects, about) {
  const container = $('[data-list="about-stats"]');
  if (!container) return;

  container.innerHTML = about.stats
    .map(
      ({ label, filter }) =>
        `<div class="stat-card"><strong>${formatNumber(countProjects(projects, filter))}</strong><span>${escapeHTML(label)}</span></div>`,
    )
    .join('');
}

// If the photo is missing, hide it and show the initials placeholder instead.
export function initAboutPhoto() {
  $$('.about-photo').forEach((photo) => {
    onImageFailure(photo, () => {
      photo.style.display = 'none';
      photo.nextElementSibling.style.display = 'grid';
    });
  });
}
