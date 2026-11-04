// Page-wide pieces: document title and meta tags, navigation links, social links, year.
import { $, $$, escapeHTML } from './dom.js';
import { SOCIAL_ICONS } from './icons.js';

export function applyMeta(site) {
  document.title = site.meta.title;
  setMeta('name', 'description', site.meta.description);
  setMeta('property', 'og:title', site.meta.title);
  setMeta('property', 'og:description', site.meta.description);
}

function setMeta(attribute, name, value) {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

export function setYear() {
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

// Fills the desktop and mobile navigation with the same links.
export function renderNavLinks(site) {
  const links = site.navLinks
    .map((link) => `<a href="${escapeHTML(link.href)}">${escapeHTML(link.label)}</a>`)
    .join('');
  $$('[data-list="nav-links"]').forEach((nav) => {
    nav.innerHTML = links;
  });
}

// Returns one social icon link per network, in the given order.
export function renderSocialLinks(networks, profile, site) {
  return networks
    .map((network) => {
      const label = site.social.labels[network];
      return `<a class="icon-button social-link" data-link="${network}" href="${escapeHTML(profile.social[network])}" target="_blank" rel="noreferrer" aria-label="${escapeHTML(label)}">${SOCIAL_ICONS[network]}</a>`;
    })
    .join('');
}
