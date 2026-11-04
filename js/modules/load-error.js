// Shows a visible message when the site content cannot be loaded.
import { $ } from './dom.js';

const MESSAGE = 'Some content could not be loaded. Please refresh the page.';

export function showLoadError() {
  const main = $('main');
  if (!main) return;

  const notice = document.createElement('p');
  notice.className = 'load-error';
  notice.setAttribute('role', 'alert');
  notice.textContent = MESSAGE;
  main.prepend(notice);
}
