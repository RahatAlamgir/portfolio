// Skills section: one card per category with progress bars.
import { $, escapeHTML } from './dom.js';

function renderSkillItem(skill) {
  return `
        <div class="skill-bar-item">
          <div class="skill-info">
            <span>${escapeHTML(skill.name)}</span>
            <span>${escapeHTML(skill.level)}</span>
          </div>
          <div class="skill-progress-track">
            <div class="skill-progress-fill" style="width: ${escapeHTML(skill.level)};"></div>
          </div>
        </div>`;
}

function renderSkillCategory(category) {
  return `
    <div class="skill-category-card">
      <h3>${escapeHTML(category.category)}</h3>
      ${category.items.map(renderSkillItem).join('')}
    </div>`;
}

export function renderSkills(skills) {
  const container = $('#skillsContainer');
  if (!container) return;

  container.innerHTML = skills.map(renderSkillCategory).join('');
}
