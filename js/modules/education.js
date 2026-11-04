// Education section: timeline cards with a logo or a text placeholder.
import { $, $$, escapeHTML, onImageFailure } from './dom.js';

function renderEducationCard(edu) {
  return `
    <article class="timeline-item">
      <span class="timeline-dot"></span>
      <div class="timeline-card">
        <div class="timeline-card-body">
          <div class="timeline-meta">${escapeHTML(edu.meta)}</div>
          <h3>${escapeHTML(edu.title)}</h3>
          <p>${edu.description}</p>
          <div class="tag-list">
            ${edu.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="timeline-logo-wrap">
          <img src="${escapeHTML(edu.logo)}" class="timeline-logo" alt="${escapeHTML(edu.title)}">
          <span class="timeline-logo-placeholder">${escapeHTML(edu.logoPlaceholder)}</span>
        </div>
      </div>
    </article>`;
}

export function renderEducation(education) {
  const container = $('#educationContainer');
  if (!container) return;

  container.innerHTML = education.map(renderEducationCard).join('');

  // If a logo is missing, hide it and show the text placeholder.
  $$('.timeline-logo', container).forEach((img) => {
    onImageFailure(img, () => {
      img.style.display = 'none';
      img.nextElementSibling.style.display = 'block';
    });
  });
}
