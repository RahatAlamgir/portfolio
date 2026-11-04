// Services section: one card per service.
import { $, escapeHTML } from './dom.js';
import { iconSvg } from './icons.js';

function renderServiceCard(service) {
  return `
    <article class="service-card-custom">
      <div class="service-icon-wrap">${iconSvg(service.icon)}</div>
      <h3>${escapeHTML(service.title)}</h3>
      <p>${escapeHTML(service.description)}</p>
    </article>`;
}

export function renderServices(services) {
  const container = $('#servicesContainer');
  if (!container) return;

  container.innerHTML = services.map(renderServiceCard).join('');
}
