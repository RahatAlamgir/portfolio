/* Contact card: headline, email buttons, details, socials. */

import { el, icon, externalLink, highlightedText } from "../core/dom.js";
import { activeSocials } from "../core/data.js";
import { showToast } from "../components/toast.js";

function copyEmail(email, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(email).then(() => showToast(message), () => showToast(email));
  } else {
    showToast(email);
  }
}

export function renderContact(mount, { site, profile }) {
  const copy = site.sections.contact;
  const mailto = `mailto:${profile.email}`;

  const main = el("div", { className: "contact-main" }, [
    el("p", { className: "eyebrow", text: copy.eyebrow }),
    el("h2", { className: "contact-title" }, highlightedText(copy.title)),
    el("p", { className: "muted contact-lead", text: copy.lead }),
    el("div", { className: "btn-row" }, [
      el("a", { className: "btn btn-accent", href: mailto }, [icon("mail"), copy.emailButton]),
      el("button", {
        className: "btn btn-outline",
        type: "button",
        onclick: () => copyEmail(profile.email, site.ui.emailCopied)
      }, [icon("copy"), copy.copyButton])
    ])
  ]);

  const detail = (label, value) =>
    el("div", {}, [el("dt", { text: label }), el("dd", {}, [value])]);

  const details = el("dl", { className: "contact-details" }, [
    detail(copy.labels.email, el("a", { href: mailto, text: profile.email })),
    detail(copy.labels.phone, el("a", { href: profile.phoneHref, text: profile.phone })),
    detail(copy.labels.location, profile.location),
    el("div", { className: "contact-social" },
      activeSocials(profile).map((s) => externalLink(s.url, null, [`${s.label} ↗`]))
    )
  ]);

  mount.replaceChildren(el("div", { className: "contact-card" }, [main, details]));
}
