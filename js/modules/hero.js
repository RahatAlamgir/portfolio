// Hero section: buttons, social links with the email copy button, tech pills and the code card.
import { $, escapeHTML } from './dom.js';
import { iconSvg } from './icons.js';
import { renderSocialLinks } from './layout.js';
import { getPath } from './content.js';

export function renderHeroButtons(hero, content) {
  const container = $('[data-list="hero-buttons"]');
  if (!container) return;

  container.innerHTML = hero.buttons
    .map((button) => {
      const href = button.hrefFrom ? getPath(content, button.hrefFrom) : button.href;
      const classes = button.style === 'outline' ? 'button button-outline' : 'button';
      const target = button.external ? ' target="_blank" rel="noreferrer"' : '';
      const icon = button.icon ? iconSvg(button.icon, 16) : '';
      return `<a class="${classes}" href="${escapeHTML(href)}"${target}>${icon}${escapeHTML(button.label)}</a>`;
    })
    .join('');
}

// Social links plus the email copy button, shown in one row under the hero text.
export function renderHeroSocials(content) {
  const container = $('[data-list="hero-socials"]');
  if (!container) return;

  const { profile, site } = content;
  const links = renderSocialLinks(site.social.heroOrder, profile, site);
  const copyButton = `<button class="email-copy" id="copyEmail" type="button" aria-label="${escapeHTML(site.hero.emailCopyLabel)}">${iconSvg('mail', 14)}<span>${escapeHTML(profile.email)}</span></button>`;
  container.innerHTML = links + copyButton;
}

export function renderTechPills(pills) {
  const container = $('[data-list="tech-pills"]');
  if (!container) return;

  container.innerHTML = pills.map((pill) => `<span>${escapeHTML(pill)}</span>`).join('');
}

function renderToken(token) {
  const text = escapeHTML(token.text);
  return token.cls ? `<span class="${token.cls}">${text}</span>` : text;
}

function renderCodeLine(line) {
  if (line.br) return '<br>';
  const className = line.indent ? ' class="indent"' : '';
  return `<p${className}>${line.tokens.map(renderToken).join('')}</p>`;
}

export function renderTerminalCode(terminal) {
  const container = $('[data-list="terminal-lines"]');
  if (!container) return;

  container.innerHTML = terminal.lines.map(renderCodeLine).join('');
}
