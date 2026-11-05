/* Hero: status, headline, intro, buttons, socials, photo. */

import { el, icon, externalLink, highlightedText } from "../core/dom.js";
import { activeSocials } from "../core/data.js";

export function renderHero(mount, { profile }) {
  const { hero, photo } = profile;

  const text = el("div", { className: "hero-text" }, [
    el("p", { className: "status-pill" }, [
      el("span", { className: "status-dot", "aria-hidden": "true" }),
      profile.status
    ]),
    el("h1", { className: "hero-title" }, highlightedText(hero.title)),
    el("p", { className: "hero-lead", text: hero.lead }),
    el("div", { className: "btn-row" }, [
      el("a", { className: "btn btn-accent", href: hero.primaryCta.href }, [hero.primaryCta.label, icon("arrow-right")]),
      el("a", { className: "btn btn-outline", href: hero.secondaryCta.href, text: hero.secondaryCta.label })
    ]),
    el("div", { className: "hero-social" }, [
      ...activeSocials(profile).map((s) =>
        externalLink(s.url, "icon-link", [icon(s.icon, "icon-lg")], { "aria-label": s.label })
      ),
      el("span", { className: "divider", "aria-hidden": "true" }),
      el("span", { className: "mono muted", text: profile.email })
    ])
  ]);

  const figure = el("div", { className: "hero-photo" }, [
    el("figure", { className: "photo-frame" }, [
      el("img", { src: photo.src, alt: photo.alt, width: 440, height: 550, fetchpriority: "high" }),
      el("figcaption", { className: "photo-caption" }, [
        el("div", {}, [
          el("span", { className: "label", text: photo.captionLabel }),
          el("strong", { text: photo.caption })
        ]),
        el("span", { className: "photo-location" }, [icon("pin"), photo.location])
      ])
    ])
  ]);

  mount.replaceChildren(text, figure);
}
