/* Footer: copyright + back to top. */

import { el, fmt } from "../core/dom.js";

export function renderFooter(mount, { site, profile }) {
  mount.replaceChildren(
    el("span", { text: fmt(site.footer.copyright, { year: new Date().getFullYear(), name: profile.name }) }),
    el("a", { href: "#top", text: site.footer.backToTop })
  );
}
