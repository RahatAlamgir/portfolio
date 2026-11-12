/* Glitch effect on the highlighted word in the hero and contact headings. */

import { $, $$ } from "../core/dom.js";

function play(word) {
  word.classList.remove("is-glitching");
  void word.offsetWidth; // restart the animation
  word.classList.add("is-glitching");
}

export function setupGlitch() {
  for (const word of $$(".hero-title .accent-text, .contact-title .accent-text")) {
    word.classList.add("glitch-word");
    word.dataset.text = word.textContent;
    word.addEventListener("animationend", () => word.classList.remove("is-glitching"));
    word.addEventListener("pointerenter", () => play(word));
  }

  // Hero: once after its entrance. Contact: each time it scrolls into view.
  const heroWord = $(".hero-title .glitch-word");
  if (heroWord) setTimeout(() => play(heroWord), 900);

  const contactWord = $(".contact-title .glitch-word");
  if (contactWord) {
    new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setTimeout(() => play(contactWord), 500);
    }, { threshold: 0.6 }).observe(contactWord);
  }
}
