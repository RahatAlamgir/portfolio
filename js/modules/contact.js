// Contact section: contact items, social links, email links and the copy-email button.
import { $, $$, escapeHTML } from './dom.js';
import { renderSocialLinks } from './layout.js';
import { fill } from './content.js';

const COPY_STATUS_DURATION_MS = 2500;

function renderContactValue(item, value) {
  const escaped = escapeHTML(value);
  if (item.type === 'email') return `<a href="mailto:${escaped}">${escaped}</a>`;
  if (item.type === 'phone') {
    const digits = value.replace(/[^+0-9]/g, '');
    return `<a href="tel:${escapeHTML(digits)}">${escaped}</a>`;
  }
  return `<span>${escaped}</span>`;
}

export function renderContactItems(contact, content) {
  const container = $('[data-list="contact-items"]');
  if (!container) return;

  container.innerHTML = contact.items
    .map((item) => {
      const value = item.field.split('.').reduce((obj, key) => obj[key], content);
      return `
          <div class="contact-info-item"><span class="contact-info-icon">${escapeHTML(item.icon)}</span><div><span class="contact-label">${escapeHTML(item.label)}</span>${renderContactValue(item, value)}</div></div>`;
    })
    .join('');
}

export function renderContactSocials(content) {
  const container = $('[data-list="contact-socials"]');
  if (!container) return;

  const { profile, site } = content;
  container.innerHTML = renderSocialLinks(site.social.contactOrder, profile, site);
}

// Points the "Email me" button at the profile email.
export function applyEmailButtons(email) {
  $$('[data-email-button]').forEach((button) => {
    button.setAttribute('href', `mailto:${email}`);
  });
}

// Copies the email address when the copy button is clicked.
export function initCopyEmail(email, ui) {
  const button = $('#copyEmail');
  const status = $('#copyStatus');
  if (!button || !status) return;

  let resetTimer;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = ui.copied;
    } catch {
      status.textContent = fill(ui.copyFallback, { email });
    }
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      status.textContent = '';
    }, COPY_STATUS_DURATION_MS);
  });
}
