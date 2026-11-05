/* Sticky header: brand, nav links, theme toggle, CV button, mobile menu. */

import { el, icon } from "../core/dom.js";
import { initThemeToggle } from "./theme.js";
import { initMobileMenu } from "./menu.js";
import { initActiveNav } from "./active-nav.js";

export function renderHeader(mount, { site, profile }) {
  const { ui, brand, nav, header } = site;

  const navLinks = nav.map((item) => el("a", { href: item.href, text: item.label }));

  const themeButton = el("button", { className: "icon-btn", type: "button" }, [
    icon("sun", "icon-sun"),
    icon("moon", "icon-moon")
  ]);

  const menuButton = el("button", {
    className: "icon-btn menu-btn",
    type: "button",
    "aria-controls": "mobile-menu"
  }, [icon("menu", "icon-open"), icon("close", "icon-close")]);

  const mobileMenu = el("nav", { className: "mobile-menu", id: "mobile-menu", "aria-label": ui.mobileNav, hidden: true }, [
    ...nav.map((item, i) =>
      el("a", { href: item.href }, [item.label, el("span", { text: String(i + 1).padStart(2, "0") })])
    ),
    el("a", { className: "btn btn-accent", href: header.menuCta.href, text: header.menuCta.label })
  ]);

  mount.replaceChildren(
    el("div", { className: "container header-row" }, [
      el("a", { className: "brand", href: "#top", "aria-label": brand.homeLabel }, [
        el("span", { className: "brand-mark", "aria-hidden": "true", text: brand.mark }),
        el("span", { text: brand.name })
      ]),
      el("nav", { className: "nav-links", "aria-label": ui.mainNav }, navLinks),
      el("div", { className: "header-actions" }, [
        themeButton,
        el("a", {
          className: "btn btn-inverse btn-sm",
          href: profile.cv,
          target: "_blank",
          rel: "noopener",
          "aria-label": header.cvLabel
        }, [icon("download"), el("span", { className: "cv-label", text: header.cvLabel })]),
        menuButton
      ])
    ]),
    mobileMenu
  );

  initThemeToggle(themeButton, site);
  initMobileMenu(menuButton, mobileMenu, ui);
  initActiveNav(navLinks);
}
